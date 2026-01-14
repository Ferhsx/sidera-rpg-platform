import React, { useState } from 'react';
import { Eye, Skull, Zap, Activity, Ghost, ChevronRight, Heart, Gift, FlaskConical, Syringe, Flower2, Wind, Tent, RefreshCw, Upload, Loader2, User, WifiOff } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useGMRealtime } from '@/hooks/useGMRealtime';
import { ARCHETYPES } from '@/constants';
import { useCharacter } from '@/contexts/CharacterContext';
import { supabase } from '@/lib/supabase';
import { EncounterManager } from './EncounterManager';
import { GameLogs } from './GameLogs';
import { logEvent } from '@/lib/logger';
import { GM_LOOT } from '@/constants/loot';

const GMDashboard: React.FC = () => {
    const { players, roomCode, roomId, loading, updatePlayer, giveLoot, grantAbility, refreshPlayers, sendBroadcast } = useGMRealtime();
    const { leaveRoom } = useCharacter();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [whisperText, setWhisperText] = useState("");
    const [gmAbility, setGmAbility] = useState({ name: '', description: '', type: 'MALDICÃO' as any });

    // Projector State
    const [projectorUrl, setProjectorUrl] = useState("");
    const { uploadImage, isUploading } = useImageUpload();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Custom Loot State
    const [isCustomLoot, setIsCustomLoot] = useState(false);
    const [customLoot, setCustomLoot] = useState<{
        name: string;
        type: 'weapon' | 'consumable' | 'general';
        description: string;
        damage?: number;
        range?: string;
        targetId?: string; // for consumables
        amount?: number;
        weight?: number;
    }>({
        name: "",
        type: 'general',
        description: "",
        damage: 1,
        range: "Imediato",
        targetId: "ration",
        amount: 1,
        weight: 1
    });

    // Helper para pegar info do arquétipo
    const getArchetypeInfo = (id: string) => ARCHETYPES.find(a => a.id === id);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-rust animate-pulse font-serif tracking-widest">
            SINTONIZANDO O VAZIO...
        </div>
    );

    const selectedPlayer = players.find(p => p.id === selectedPlayerId);

    // Ações do Mestre
    const adjustHp = (amount: number) => {
        if (!selectedPlayer) return;
        const current = selectedPlayer.character_data.currentHp;
        updatePlayer(selectedPlayerId!, { currentHp: Math.max(0, current - amount) });
        if (roomId) {
            logEvent(roomId, "Mestre", `Ajustou Vitalidade de ${selectedPlayer.character_data.name}: ${amount > 0 ? `-${amount}` : `+${Math.abs(amount)}`}`, 'combat');
        }
    };

    const punishOrbit = (amount: number) => {
        if (!selectedPlayer) return;
        const current = selectedPlayer.character_data.orbit;
        updatePlayer(selectedPlayerId!, { orbit: Math.min(10, current + amount) });
        if (roomId) {
            logEvent(roomId, "Mestre", `Alterou Órbita de ${selectedPlayer.character_data.name}: ${amount > 0 ? `+${amount}` : amount}`, 'alert');
        }
    };

    const handleWhisper = async () => {
        if (!whisperText || !roomId) return;

        await sendBroadcast('whisper', {
            message: whisperText,
            targetId: selectedPlayerId || 'all'
        });

        setWhisperText("");
        alert("Sussurro enviado para as sombras.");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = await uploadImage(e.target.files[0]);
            if (url && roomId) {
                await sendBroadcast('show_image', {
                    url: url,
                    caption: "Visão transmitida pelo Observador..."
                });
                alert("Imagem enviada e projetada!");
            }
        }
    };

    const handleProjectImage = async () => {
        if (!projectorUrl || !roomId) return;

        await sendBroadcast('show_image', {
            url: projectorUrl,
            caption: "Visão transmitida pelo Observador..."
        });

        alert("Imagem projetada nas mentes dos vinculados.");
        setProjectorUrl("");
    };

    return (
        <div className="min-h-screen bg-black text-stone-300 p-4 md:p-8 font-sans selection:bg-gold selection:text-black">

            {/* Top Bar */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-stone-800 pb-4 gap-4">
                <div className="p-2 bg-stone-900 border border-stone-700 rounded-full">
                    <Eye className="text-gold" size={24} />
                </div>
                <div>
                    <h1 className="font-serif text-2xl text-bone tracking-widest">O OBSERVATÓRIO</h1>
                    <p className="text-[10px] text-stone-600 uppercase tracking-[0.3em]">Interface de Controle da Realidade</p>
                </div>


                <div className="flex items-center gap-4">
                    <button
                        onClick={refreshPlayers}
                        className="p-2 text-stone-600 hover:text-gold hover:bg-stone-900 rounded border border-transparent hover:border-stone-800 transition-all"
                        title="Forçar Sincronização"
                    >
                        <RefreshCw size={16} />
                    </button>

                    <button
                        onClick={() => {
                            if (confirm("Encerrar Sessão de Observador? Você voltará ao Lobby.")) {
                                leaveRoom();
                            }
                        }}
                        className="bg-stone-900 hover:bg-red-900/20 text-stone-600 hover:text-red-500 border border-stone-800 hover:border-red-900/50 px-3 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-2"
                    >
                        <WifiOff size={14} /> Sair
                    </button>

                    <div className="bg-stone-900/50 px-6 py-2 border border-stone-800 rounded-sm flex flex-col items-center">
                        <span className="text-[9px] text-stone-500 uppercase tracking-widest">Frequência de Vínculo</span>
                        <span className="text-2xl font-mono text-rust font-bold tracking-widest">{roomCode}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* === GRID DE JOGADORES (Esquerda) === */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">

                    {players.length === 0 && (
                        <div className="col-span-2 text-center py-20 border border-dashed border-stone-800 rounded text-stone-600">
                            <Ghost size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Nenhum Vinculado encontrado nesta frequência.</p>
                            <p className="text-xs mt-2">Aguardando conexões...</p>
                        </div>
                    )}

                    {players.map(p => {
                        const char = p.character_data;
                        const arch = getArchetypeInfo(char.archetypeId);
                        const isSelected = selectedPlayerId === p.id;
                        const isCritical = char.orbit >= 8;
                        const isDying = char.currentHp === 0;

                        return (
                            <div
                                key={p.id}
                                onClick={() => setSelectedPlayerId(p.id)}
                                className={`relative p-5 border rounded-sm cursor-pointer transition-all duration-300 group overflow-hidden ${isSelected
                                    ? 'bg-stone-900 border-gold shadow-[0_0_15px_rgba(161,98,7,0.1)]'
                                    : 'bg-stone-950 border-stone-800 hover:border-stone-600'
                                    }`}
                            >
                                {/* Alerta Visual de Perigo */}
                                {isCritical && <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-900/40 via-transparent to-transparent pointer-events-none" />}

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar Pequeno */}
                                        <div className="w-10 h-10 rounded-sm overflow-hidden bg-stone-800 border border-stone-700 shrink-0">
                                            {char.imageUrl ? (
                                                <img src={char.imageUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="text-stone-600" size={20} />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className={`font-serif text-lg leading-none ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                                                {char.name || p.player_name}
                                            </h3>
                                            <div className="text-[10px] uppercase tracking-widest opacity-70 flex items-center gap-2">
                                                {arch && <span>{arch.name}</span>}
                                                {char.orbit >= 5 && <span className="text-purple-400 font-bold">• SINTOMÁTICO</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Indicador de Seleção */}
                                    {isSelected && <ChevronRight className="text-gold animate-pulse" />}
                                </div>

                                {/* Barras de Status */}
                                <div className="space-y-3 relative z-10">
                                    {/* Vida */}
                                    <div className="group/hp">
                                        <div className="flex justify-between text-[10px] uppercase text-stone-500 mb-1 font-bold">
                                            <span className="flex items-center gap-1"><Heart size={10} /> Vitalidade</span>
                                            <span className={isDying ? 'text-red-500 animate-pulse' : ''}>{char.currentHp} / {char.maxHp}</span>
                                        </div>
                                        <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                                            <div
                                                className={`h-full transition-all duration-500 ${isDying ? 'bg-red-600' : 'bg-stone-400'}`}
                                                style={{ width: `${(char.currentHp / char.maxHp) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Órbita */}
                                    <div>
                                        <div className="flex justify-between text-[10px] uppercase text-stone-500 mb-1 font-bold">
                                            <span className="flex items-center gap-1"><Zap size={10} /> Órbita</span>
                                            <span className={isCritical ? 'text-gold' : ''}>{char.orbit} / 10</span>
                                        </div>
                                        <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                                            <div
                                                className={`h-full transition-all duration-500 ${isCritical ? 'bg-gold animate-pulse' : 'bg-rust'}`}
                                                style={{ width: `${(char.orbit / 10) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Inventário Resumido (Só o topo) */}
                                <div className="mt-4 pt-3 border-t border-stone-800/50 flex gap-2 text-[9px] text-stone-600 font-mono">
                                    <span className="truncate max-w-[200px]">
                                        {char.beltPouch?.find(i => i.id === 'lead')?.quantity || 0} Chumbos • {char.beltPouch?.find(i => i.id === 'serum')?.quantity || 0} Soros • {char.beltPouch?.find(i => i.id === 'ration')?.quantity || 0} Rações • {char.beltPouch?.find(i => i.id === 'poppy')?.quantity || 0} Papoilas • {char.beltPouch?.find(i => i.id === 'salts')?.quantity || 0} Sais
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* === PAINEL DE CONTROLE (Direita) === */}
                <div className="lg:col-span-4 space-y-6">

                    {/* PROJETOR MENTAL (Novo) */}
                    <div className="bg-black/40 p-4 rounded border border-stone-800">
                        <label className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-3 block flex items-center gap-2">
                            <Eye size={12} className="text-purple-500" /> Projetor Mental (Cenário/Monstro)
                        </label>

                        <div className="flex flex-col gap-2">
                            {/* Input de Arquivo (Escondido) */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/*"
                            />

                            {/* Botão de Upload */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full bg-purple-900/10 hover:bg-purple-900/30 border border-purple-900/30 text-purple-400 py-2 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase transition-all"
                            >
                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                Upload & Projetar
                            </button>

                            {/* Input de URL (Fallback) */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={projectorUrl}
                                    onChange={(e) => setProjectorUrl(e.target.value)}
                                    placeholder="Ou cole URL..."
                                    className="flex-1 bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded outline-none focus:border-purple-500"
                                />
                                <button
                                    onClick={handleProjectImage}
                                    className="bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 px-3 rounded"
                                >
                                    <Zap size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Painel de Recompensa */}
                    <div className="sticky top-8 bg-stone-900/30 border border-stone-800 p-6 rounded-sm backdrop-blur-md min-h-[500px] flex flex-col">

                        {selectedPlayer ? (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                <div className="mb-6 border-b border-stone-800 pb-4">
                                    <h2 className="text-gold font-serif text-xl mb-1 flex items-center gap-2">
                                        <Activity size={18} />
                                        {selectedPlayer.character_data.name}
                                    </h2>
                                    <p className="text-stone-500 text-xs">Ações de Intervenção Divina</p>
                                </div>

                                {/* Controles de Punição */}
                                <div className="space-y-6">

                                    {/* Dano */}
                                    <div className="bg-black/40 p-3 rounded border border-stone-800">
                                        <label className="text-[10px] text-red-700 uppercase font-bold tracking-widest mb-2 block flex items-center gap-1">
                                            <Skull size={12} /> Infligir Dano
                                        </label>
                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            {[1, 2, 5, 10].map(amt => (
                                                <button
                                                    key={amt}
                                                    onClick={() => adjustHp(amt)}
                                                    className="bg-red-950/20 hover:bg-red-900 text-red-800 hover:text-white border border-red-900/30 py-2 rounded text-xs font-bold transition-colors"
                                                >
                                                    -{amt}
                                                </button>
                                            ))}
                                        </div>

                                        <label className="text-[10px] text-green-700 uppercase font-bold tracking-widest mb-2 block flex items-center gap-1">
                                            <Heart size={12} /> Restaurar Vitalidade
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => adjustHp(-2)}
                                                className="bg-green-950/20 hover:bg-green-900 text-green-800 hover:text-white border border-green-900/30 py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                +2 PV
                                            </button>
                                            <button
                                                onClick={() => updatePlayer(selectedPlayerId!, { currentHp: selectedPlayer!.character_data.maxHp })}
                                                className="bg-green-950/20 hover:bg-green-900 text-green-800 hover:text-white border border-green-900/30 py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                Recuperar Tudo
                                            </button>
                                        </div>
                                    </div>

                                    {/* Órbita */}
                                    <div className="bg-black/40 p-3 rounded border border-stone-800">
                                        <label className="text-[10px] text-gold uppercase font-bold tracking-widest mb-2 block flex items-center gap-1">
                                            <Zap size={12} /> Aumentar Órbita
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button onClick={() => punishOrbit(1)} className="bg-yellow-950/20 hover:bg-gold hover:text-black border border-yellow-900/30 text-gold py-2 rounded text-xs font-bold transition-colors">+1</button>
                                            <button onClick={() => punishOrbit(2)} className="bg-yellow-950/20 hover:bg-gold hover:text-black border border-yellow-900/30 text-gold py-2 rounded text-xs font-bold transition-colors">+2 (Poder)</button>
                                            <button onClick={() => punishOrbit(-1)} className="bg-stone-800 hover:bg-stone-700 text-stone-400 py-2 rounded text-xs font-bold transition-colors">-1 (Alívio)</button>
                                        </div>
                                    </div>

                                    {/* Notas do Jogador (Leitura) */}
                                    <div className="mt-4">
                                        <label className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-2 block">
                                            Diário / Cicatrizes
                                        </label>
                                        <div className="bg-black p-3 text-xs text-stone-400 font-mono italic border border-stone-800 h-32 overflow-y-auto rounded opacity-70">
                                            {selectedPlayer.character_data.notes || "Nenhuma anotação..."}
                                        </div>
                                    </div>

                                    {/* Sussurro do Mestre */}
                                    <div className="mt-6 border-t border-stone-800 pt-6">
                                        <label className="text-[10px] text-rust uppercase font-bold tracking-widest mb-2 block flex items-center gap-2">
                                            <Eye size={12} /> Voz do Céu (Sussurro)
                                        </label>
                                        <textarea
                                            value={whisperText}
                                            onChange={(e) => setWhisperText(e.target.value)}
                                            placeholder="Sussurre algo para este jogador (ou todos)..."
                                            className="w-full bg-black border border-stone-800 p-3 text-sm text-stone-300 italic focus:border-rust outline-none h-24 resize-none mb-2"
                                        />
                                        <button
                                            onClick={handleWhisper}
                                            className="w-full bg-stone-800 hover:bg-rust text-white py-2 text-xs uppercase tracking-widest font-bold transition-all"
                                        >
                                            Infiltrar Pensamento
                                        </button>
                                        <p className="text-[9px] text-stone-600 mt-2 italic text-center">
                                            {selectedPlayerId ? `Falando diretamente com ${selectedPlayer.character_data.name}` : "Gritando para o Vácuo (Todos)"}
                                        </p>
                                        <p className="text-[9px] text-stone-600 mt-2 italic text-center">
                                            {selectedPlayerId ? `Falando diretamente com ${selectedPlayer.character_data.name}` : "Gritando para o Vácuo (Todos)"}
                                        </p>
                                    </div>

                                    {/* Inserir Habilidade Remota (Nova) */}
                                    <div className="bg-black/40 p-3 rounded border border-purple-900/30 mt-6">
                                        <label className="text-[10px] text-purple-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                                            <Zap size={12} /> Inserir Mutação/Poder
                                        </label>

                                        <input
                                            className="w-full bg-stone-900 border border-stone-700 text-xs p-2 mb-2 outline-none text-white focus:border-purple-500 transition-colors"
                                            placeholder="Nome (Ex: Olhos de Gato, Pele de Escama)"
                                            value={gmAbility.name}
                                            onChange={e => setGmAbility({ ...gmAbility, name: e.target.value })}
                                        />
                                        <textarea
                                            className="w-full bg-stone-900 border border-stone-700 text-xs p-2 mb-4 outline-none text-white h-16 resize-none focus:border-purple-500 transition-colors"
                                            placeholder="Descreva o efeito aqui..."
                                            value={gmAbility.description}
                                            onChange={e => setGmAbility({ ...gmAbility, description: e.target.value })}
                                        />

                                        <button
                                            onClick={() => {
                                                if (selectedPlayerId && gmAbility.name && gmAbility.description) {
                                                    grantAbility(selectedPlayerId, gmAbility);
                                                    alert("Habilidade inserida no DNA do jogador.");
                                                    setGmAbility({ name: '', description: '', type: 'MALDICÃO' });
                                                } else {
                                                    alert("Preencha Nome e Descrição.");
                                                }
                                            }}
                                            className="w-full bg-purple-900/20 hover:bg-purple-800 text-purple-300 border border-purple-800/50 py-2 rounded text-xs font-bold uppercase transition-all"
                                        >
                                            Forçar Mutação
                                        </button>
                                    </div>

                                    {/* Seção de Loot */}
                                    <div className="bg-black/40 p-3 rounded border border-stone-800 mt-6">
                                        <label className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-2 block flex items-center gap-1">
                                            <Gift size={12} className="text-cyan-500" /> Conceder Recurso
                                        </label>

                                        <div className="flex justify-between mb-2">
                                            <button
                                                onClick={() => setIsCustomLoot(false)}
                                                className={`px-2 py-1 text-[9px] rounded uppercase font-bold ${!isCustomLoot ? 'bg-cyan-900 text-white' : 'bg-stone-800 text-stone-500'}`}
                                            >
                                                Catálogo
                                            </button>
                                            <button
                                                onClick={() => setIsCustomLoot(true)}
                                                className={`px-2 py-1 text-[9px] rounded uppercase font-bold ${isCustomLoot ? 'bg-cyan-900 text-white' : 'bg-stone-800 text-stone-500'}`}
                                            >
                                                Customizado
                                            </button>
                                        </div>

                                        {!isCustomLoot ? (
                                            <div className="flex flex-col gap-2">
                                                <select
                                                    id="loot-select"
                                                    className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded outline-none focus:border-cyan-500"
                                                >
                                                    <option value="">-- Selecione um Item --</option>
                                                    {GM_LOOT.map(item => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.type === 'weapon' ? '⚔️' : item.type === 'consumable' ? '🧪' : '📦'} {item.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    onClick={() => {
                                                        const select = document.getElementById('loot-select') as HTMLSelectElement;
                                                        const itemId = select.value;
                                                        const item = GM_LOOT.find(i => i.id === itemId);
                                                        if (item && selectedPlayerId) {
                                                            giveLoot(selectedPlayerId, item);
                                                            alert(`Enviado: ${item.name}`);
                                                        }
                                                    }}
                                                    className="w-full bg-stone-800 hover:bg-cyan-900/50 text-cyan-500 border border-stone-700 hover:border-cyan-500 py-2 rounded text-xs font-bold uppercase transition-all"
                                                >
                                                    Enviar para Inventário
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 animate-in fade-in">
                                                <select
                                                    value={customLoot.type}
                                                    onChange={(e) => setCustomLoot({ ...customLoot, type: e.target.value as any })}
                                                    className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                                                >
                                                    <option value="weapon">Arma</option>
                                                    <option value="consumable">Consumível/Recurso</option>
                                                    <option value="general">Item/Nota</option>
                                                </select>

                                                <input
                                                    type="text"
                                                    placeholder="Nome do Item"
                                                    value={customLoot.name}
                                                    onChange={(e) => setCustomLoot({ ...customLoot, name: e.target.value })}
                                                    className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                                                />

                                                <input
                                                    type="text"
                                                    placeholder="Descrição Curta"
                                                    value={customLoot.description}
                                                    onChange={(e) => setCustomLoot({ ...customLoot, description: e.target.value })}
                                                    className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                                                />

                                                {/* Peso para Itens Gerais */}
                                                {customLoot.type === 'general' && (
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-[10px] text-stone-500 uppercase whitespace-nowrap">Peso (0-9):</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="9"
                                                            value={customLoot.weight}
                                                            onChange={(e) => setCustomLoot({ ...customLoot, weight: parseInt(e.target.value) })}
                                                            className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded w-20"
                                                        />
                                                    </div>
                                                )}

                                                {/* Campos Específicos */}
                                                {customLoot.type === 'weapon' && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="number"
                                                            placeholder="Dano"
                                                            value={customLoot.damage}
                                                            onChange={(e) => setCustomLoot({ ...customLoot, damage: parseInt(e.target.value) })}
                                                            className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                                                        />
                                                        <select
                                                            value={customLoot.range}
                                                            onChange={(e) => setCustomLoot({ ...customLoot, range: e.target.value })}
                                                            className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                                                        >
                                                            <option value="Imediato">Curto (Imediato)</option>
                                                            <option value="Médio">Médio</option>
                                                            <option value="Longo">Longo</option>
                                                        </select>

                                                        {/* Weapon Weight Input */}
                                                        <div className="flex items-center gap-2 col-span-2">
                                                            <label className="text-[10px] text-stone-500 uppercase whitespace-nowrap">Peso:</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="9"
                                                                value={customLoot.weight}
                                                                onChange={(e) => setCustomLoot({ ...customLoot, weight: parseInt(e.target.value) })}
                                                                className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {customLoot.type === 'consumable' && (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="grid grid-cols-5 gap-1 mb-1">
                                                            {/* Chumbo */}
                                                            <button
                                                                onClick={() => setCustomLoot({ ...customLoot, targetId: 'lead', name: 'Chumbo Líquido' })}
                                                                className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'lead' ? 'bg-stone-800 border-stone-500 text-stone-300' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                                            >
                                                                <FlaskConical size={14} className="mb-1" />
                                                                <span className="text-[8px] font-bold uppercase">Chumbo</span>
                                                            </button>

                                                            {/* Soro */}
                                                            <button
                                                                onClick={() => setCustomLoot({ ...customLoot, targetId: 'serum', name: 'Soro Estelar' })}
                                                                className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'serum' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                                            >
                                                                <Syringe size={14} className="mb-1" />
                                                                <span className="text-[8px] font-bold uppercase">Soro</span>
                                                            </button>

                                                            {/* Ração */}
                                                            <button
                                                                onClick={() => setCustomLoot({ ...customLoot, targetId: 'ration', name: 'Ração de Viagem' })}
                                                                className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'ration' ? 'bg-amber-900/30 border-amber-500 text-amber-500' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                                            >
                                                                <Tent size={14} className="mb-1" />
                                                                <span className="text-[8px] font-bold uppercase">Ração</span>
                                                            </button>

                                                            {/* Papoula */}
                                                            <button
                                                                onClick={() => setCustomLoot({ ...customLoot, targetId: 'poppy', name: 'Papoila Branca' })}
                                                                className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'poppy' ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                                            >
                                                                <Flower2 size={14} className="mb-1" />
                                                                <span className="text-[8px] font-bold uppercase">Papoula</span>
                                                            </button>

                                                            {/* Sais */}
                                                            <button
                                                                onClick={() => setCustomLoot({ ...customLoot, targetId: 'salts', name: 'Sais de Cheiro' })}
                                                                className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'salts' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-400' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                                            >
                                                                <Wind size={14} className="mb-1" />
                                                                <span className="text-[8px] font-bold uppercase">Sais</span>
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            placeholder="Qtd"
                                                            value={customLoot.amount}
                                                            onChange={(e) => setCustomLoot({ ...customLoot, amount: parseInt(e.target.value) })}
                                                            className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded col-span-2"
                                                        />
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        if (!customLoot.name) return alert("Dê um nome ao item.");

                                                        const newItem: any = {
                                                            id: Date.now().toString(),
                                                            name: customLoot.name,
                                                            type: customLoot.type,
                                                            description: customLoot.description,
                                                        };

                                                        if (customLoot.type === 'weapon') {
                                                            newItem.data = {
                                                                name: customLoot.name,
                                                                damage: customLoot.damage,
                                                                category: 'Improvised', // Generic
                                                                range: customLoot.range,
                                                                properties: ['Customizado'],
                                                                description: customLoot.description,
                                                                weight: customLoot.weight || 1,
                                                                cost: 0
                                                            };
                                                        } else if (customLoot.type === 'consumable') {
                                                            newItem.data = {
                                                                targetId: customLoot.targetId,
                                                                amount: customLoot.amount || 1
                                                            };
                                                        } else if (customLoot.type === 'general') {
                                                            // Ensure weight is passed
                                                            newItem.weight = customLoot.weight !== undefined ? customLoot.weight : 1;
                                                        }

                                                        if (selectedPlayerId) {
                                                            giveLoot(selectedPlayerId, newItem);
                                                            alert(`Criado e Enviado: ${customLoot.name}`);
                                                            // Reset basic fields
                                                            setCustomLoot(prev => ({ ...prev, name: "", description: "" }));
                                                        }
                                                    }}
                                                    className="w-full bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 py-2 rounded text-xs font-bold uppercase transition-all mt-2"
                                                >
                                                    Forjar e Enviar
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-stone-600">
                                <Activity size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-serif italic text-center px-8 mb-8">
                                    Selecione um Vinculado na constelação para manipular seu destino.
                                </p>

                                {/* Caso nenhum selecionado, permite sussurro global */}
                                <div className="w-full max-w-xs px-4">
                                    <label className="text-[10px] text-rust uppercase font-bold tracking-widest mb-2 block flex items-center gap-2">
                                        <Eye size={12} /> Sussurro Global
                                    </label>
                                    <textarea
                                        value={whisperText}
                                        onChange={(e) => setWhisperText(e.target.value)}
                                        placeholder="Uma mensagem para todos os vinculados..."
                                        className="w-full bg-black border border-stone-800 p-3 text-sm text-stone-300 italic focus:border-rust outline-none h-24 resize-none mb-2"
                                    />
                                    <button
                                        onClick={handleWhisper}
                                        className="w-full bg-stone-800 hover:bg-rust text-white py-2 text-xs uppercase tracking-widest font-bold transition-all"
                                    >
                                        Voz para Todos
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Gerenciador de Encontros (Bestiário) */}
                        <EncounterManager />

                        {/* Logs do Jogo */}
                        <div className="mt-6">
                            <GameLogs roomId={roomId} />
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
};

export default GMDashboard;
