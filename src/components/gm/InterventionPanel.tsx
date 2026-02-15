import React, { useState } from 'react';
import { Activity, UserMinus, Skull, Heart, Zap, Eye } from 'lucide-react';
import { CharacterData } from '@/types/index';
import { logEvent } from '@/lib/logger';

interface InterventionPanelProps {
    player: {
        id: string;
        character_data: CharacterData;
    };
    roomId: string | null;
    onUpdatePlayer: (id: string, updates: Partial<CharacterData>) => void;
    onKickPlayer: (id: string) => void;
    onGrantAbility: (id: string, ability: any) => void;
    onWhisper: (id: string, message: string) => void;
}

export const InterventionPanel: React.FC<InterventionPanelProps> = ({
    player,
    roomId,
    onUpdatePlayer,
    onKickPlayer,
    onGrantAbility,
    onWhisper
}) => {
    const [whisperText, setWhisperText] = useState("");
    const [gmAbility, setGmAbility] = useState({ name: '', description: '', type: 'MALDICÃO' as any });
    const char = player.character_data;

    const adjustHp = (amount: number) => {
        const current = char.currentHp;
        onUpdatePlayer(player.id, { currentHp: Math.max(0, current - amount) });
        if (roomId) {
            logEvent(roomId, "Mestre", `Ajustou Vitalidade de ${char.name}: ${amount > 0 ? `-${amount}` : `+${Math.abs(amount)}`}`, 'combat');
        }
    };

    const punishOrbit = (amount: number) => {
        const current = char.orbit;
        const newOrbit = Math.max(0, Math.min(10, current + amount));
        onUpdatePlayer(player.id, { orbit: newOrbit });

        if (roomId) {
            logEvent(roomId, "Mestre", `Alterou Órbita de ${char.name}: ${amount > 0 ? `+${amount}` : amount}`, 'alert');
        }
    };

    const handleWhisper = () => {
        if (!whisperText.trim()) return;
        onWhisper(player.id, whisperText);
        setWhisperText("");
        alert("Sussurro enviado para as sombras.");
    };

    const handleGrantAbility = () => {
        if (gmAbility.name && gmAbility.description) {
            onGrantAbility(player.id, gmAbility);
            alert("Habilidade inserida no DNA do jogador.");
            setGmAbility({ name: '', description: '', type: 'MALDICÃO' as any });
        } else {
            alert("Preencha Nome e Descrição.");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4">
            <div className="mb-6 border-b border-stone-800 pb-4">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-gold font-serif text-xl flex items-center gap-2">
                        <Activity size={18} />
                        {char.name}
                    </h2>
                    <button
                        onClick={() => onKickPlayer(player.id)}
                        className="text-[9px] text-red-500 hover:text-white border border-red-900/30 hover:bg-red-900 px-2 py-1 rounded transition-all uppercase font-bold flex items-center gap-1"
                    >
                        <UserMinus size={10} /> Expulsar
                    </button>
                </div>
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
                            onClick={() => onUpdatePlayer(player.id, { currentHp: char.maxHp })}
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
                        {char.notes || "Nenhuma anotação..."}
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
                        placeholder="Sussurre algo para este jogador..."
                        className="w-full bg-black border border-stone-800 p-3 text-sm text-stone-300 italic focus:border-rust outline-none h-24 resize-none mb-2"
                    />
                    <button
                        onClick={handleWhisper}
                        className="w-full bg-stone-800 hover:bg-rust text-white py-2 text-xs uppercase tracking-widest font-bold transition-all"
                    >
                        Infiltrar Pensamento
                    </button>
                    <p className="text-[9px] text-stone-600 mt-2 italic text-center">
                        Falando diretamente com {char.name}
                    </p>
                </div>

                {/* Inserir Habilidade Remota */}
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
                        onClick={handleGrantAbility}
                        className="w-full bg-purple-900/20 hover:bg-purple-800 text-purple-300 border border-purple-800/50 py-2 rounded text-xs font-bold uppercase transition-all"
                    >
                        Forçar Mutação
                    </button>
                </div>
            </div>
        </div>
    );
};
