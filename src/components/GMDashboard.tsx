import React, { useState } from 'react';
import { Eye, RefreshCw, WifiOff, Ghost, Activity } from 'lucide-react';
import { useGMRealtime } from '@/hooks/useGMRealtime';
import { useCharacter } from '@/contexts/CharacterContext';
import { supabase } from '@/lib/supabase';
import { EncounterManager } from './EncounterManager';
import { GameLogs } from './GameLogs';
import { PlayerCard } from './gm/PlayerCard';
import { InterventionPanel } from './gm/InterventionPanel';
import { LootDistributor } from './gm/LootDistributor';
import { ProjectorControl } from './gm/ProjectorControl';

const GMDashboard: React.FC = () => {
    const { players, roomCode, roomId, loading, updatePlayer, giveLoot, grantAbility, refreshPlayers, sendBroadcast } = useGMRealtime();
    const { leaveRoom } = useCharacter();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [whisperText, setWhisperText] = useState("");

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-rust animate-pulse font-serif tracking-widest">
            SINTONIZANDO O VAZIO...
        </div>
    );

    const selectedPlayer = players.find(p => p.id === selectedPlayerId);

    const handleKickPlayer = async (playerId: string) => {
        const p = players.find(pl => pl.id === playerId);
        if (!p) return;

        if (!confirm(`Deseja realmente EXPULSAR ${p.character_data.name} da sala? O personagem será deletado do banco de dados.`)) return;

        try {
            const { error } = await supabase
                .from('characters')
                .delete()
                .eq('id', playerId);

            if (error) throw error;

            alert("Vinculado expulso da realidade.");
            if (selectedPlayerId === playerId) setSelectedPlayerId(null);
            refreshPlayers();
        } catch (e) {
            console.error("Erro ao expulsar:", e);
            alert("Falha ao expulsar jogador.");
        }
    };

    const handleGlobalWhisper = async () => {
        if (!whisperText || !roomId) return;
        await sendBroadcast('whisper', {
            message: whisperText,
            targetId: 'all'
        });
        setWhisperText("");
        alert("Voz enviada a todos.");
    };

    const handleProject = async (url: string) => {
        if (!roomId) return;
        await sendBroadcast('show_image', {
            url: url,
            caption: "Visão transmitida pelo Observador..."
        });
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

                    {players.map(p => (
                        <PlayerCard
                            key={p.id}
                            player={p}
                            isSelected={selectedPlayerId === p.id}
                            onSelect={() => setSelectedPlayerId(selectedPlayerId === p.id ? null : p.id)}
                        />
                    ))}
                </div>

                {/* === PAINEL DE CONTROLE (Direita) === */}
                <div className="lg:col-span-4 space-y-6">

                    <ProjectorControl onProject={handleProject} />

                    <div className="sticky top-8 bg-stone-900/30 border border-stone-800 p-6 rounded-sm backdrop-blur-md min-h-[500px] flex flex-col">

                        {selectedPlayer ? (
                            <>
                                <InterventionPanel
                                    player={selectedPlayer}
                                    roomId={roomId}
                                    onUpdatePlayer={updatePlayer}
                                    onKickPlayer={handleKickPlayer}
                                    onGrantAbility={grantAbility}
                                    onWhisper={(id, msg) => sendBroadcast('whisper', { message: msg, targetId: id })}
                                />
                                <LootDistributor
                                    playerId={selectedPlayerId}
                                    onGiveLoot={giveLoot}
                                />
                            </>
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
                                        onClick={handleGlobalWhisper}
                                        className="w-full bg-stone-800 hover:bg-rust text-white py-2 text-xs uppercase tracking-widest font-bold transition-all"
                                    >
                                        Voz para Todos
                                    </button>
                                </div>
                            </div>
                        )}

                        <EncounterManager />

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
