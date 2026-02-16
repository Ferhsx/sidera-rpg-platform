import React, { useEffect, useState } from 'react';
import { Plus, Play, Pause, Archive, Users, Calendar, Edit2, Trash2 } from 'lucide-react';
import { CampaignService, Campaign, CampaignWithPlayers } from '@/services/campaign.service';
import { useAuth } from '@/contexts/AuthContext';
import { useCharacter } from '@/contexts/CharacterContext';

export const CampaignDashboard: React.FC = () => {
    const { user } = useAuth();
    const { setDbInfo, setView } = useCharacter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithPlayers | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignDesc, setNewCampaignDesc] = useState('');

    useEffect(() => {
        if (user) {
            loadCampaigns();
        }
    }, [user]);

    const loadCampaigns = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await CampaignService.listByGM(user.id);
            setCampaigns(data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async () => {
        if (!user || !newCampaignName.trim()) return;
        try {
            await CampaignService.create(user.id, newCampaignName, newCampaignDesc || undefined);
            setIsCreating(false);
            setNewCampaignName('');
            setNewCampaignDesc('');
            await loadCampaigns();
        } catch (error) {
        }
    };

    const handleStartSession = async (campaignId: string) => {
        try {
            const { code, roomId } = await CampaignService.activateSession(campaignId);
            setDbInfo(roomId, null); // GM has no character
            localStorage.setItem('sidera_room_code', code);
            setView('gm');
        } catch (error) {
        }
    };

    const handlePauseCampaign = async (campaignId: string) => {
        try {
            await CampaignService.pause(campaignId);
            await loadCampaigns();
            setSelectedCampaign(null);
        } catch (error) {
        }
    };

    const handleArchiveCampaign = async (campaignId: string) => {
        if (!confirm('Tem certeza que deseja arquivar esta campanha? Ela não será deletada, mas ficará oculta.')) return;
        try {
            await CampaignService.archive(campaignId);
            await loadCampaigns();
            setSelectedCampaign(null);
        } catch (error) {
        }
    };

    const handleViewDetails = async (campaign: Campaign) => {
        try {
            const details = await CampaignService.getDetails(campaign.id);
            setSelectedCampaign(details);
        } catch (error) {
        }
    };

    const getStatusBadge = (status: Campaign['status']) => {
        const styles = {
            active: 'bg-green-900/30 text-green-400 border-green-700',
            paused: 'bg-stone-800/30 text-stone-500 border-stone-700',
            archived: 'bg-red-900/30 text-red-400 border-red-700'
        };
        const labels = {
            active: 'Ativa',
            paused: 'Pausada',
            archived: 'Arquivada'
        };
        return (
            <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border rounded-sm ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-stone-300 flex items-center justify-center">
                <p className="text-stone-600 animate-pulse">Carregando campanhas...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-stone-300 p-8">
            <header className="max-w-6xl mx-auto mb-8">
                <h1 className="font-serif text-4xl text-bone tracking-widest mb-2">MINHAS CAMPANHAS</h1>
                <p className="text-xs text-stone-600 uppercase tracking-[0.3em]">Gerenciador do Observador</p>
            </header>

            <div className="max-w-6xl mx-auto">
                {/* Create New Campaign Button */}
                <button
                    onClick={() => setIsCreating(true)}
                    className="mb-8 flex items-center gap-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold px-6 py-3 rounded-sm uppercase tracking-widest text-xs font-bold transition-all"
                >
                    <Plus size={16} />
                    Nova Campanha
                </button>

                {/* Campaigns Grid */}
                {campaigns.length === 0 ? (
                    <div className="text-center py-16 text-stone-700 italic font-serif">
                        "Nenhum universo criado ainda. Inicie sua primeira campanha."
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                onClick={() => handleViewDetails(campaign)}
                                className="bg-stone-900/40 border border-stone-800 hover:border-gold/30 rounded-sm p-6 cursor-pointer transition-all group relative"
                            >
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(campaign.status)}
                                </div>

                                {/* Campaign Name */}
                                <h3 className="font-serif text-2xl text-stone-200 mb-2 pr-20 group-hover:text-white transition-colors">
                                    {campaign.campaign_name}
                                </h3>

                                {/* Description */}
                                {campaign.description && (
                                    <p className="text-xs text-stone-500 mb-4 line-clamp-2">{campaign.description}</p>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-[10px] text-stone-600 uppercase tracking-widest mt-4">
                                    <div className="flex items-center gap-1">
                                        <Users size={12} />
                                        {campaign.player_count || 0}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        Sessão #{campaign.session_number}
                                    </div>
                                </div>

                                {/* Last Session Info */}
                                {campaign.last_session_at && (
                                    <p className="text-[10px] text-stone-700 mt-2">
                                        Última: {new Date(campaign.last_session_at).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Campaign Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-stone-900 border border-stone-800 rounded-sm p-8 max-w-md w-full">
                        <h2 className="font-serif text-2xl text-bone mb-6">Criar Nova Campanha</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-stone-500 uppercase block mb-2">Nome da Campanha</label>
                                <input
                                    type="text"
                                    value={newCampaignName}
                                    onChange={(e) => setNewCampaignName(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 text-white px-4 py-2 rounded-sm outline-none focus:border-gold transition-colors"
                                    placeholder="Ex: A Queda de Sidera"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs text-stone-500 uppercase block mb-2">Descrição (Opcional)</label>
                                <textarea
                                    value={newCampaignDesc}
                                    onChange={(e) => setNewCampaignDesc(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 text-white px-4 py-2 rounded-sm outline-none focus:border-gold transition-colors resize-none"
                                    rows={3}
                                    placeholder="Breve sinopse da campanha..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-sm uppercase tracking-widest text-xs transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateCampaign}
                                disabled={!newCampaignName.trim()}
                                className="flex-1 bg-gold hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-sm uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Campaign Details Modal */}
            {selectedCampaign && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-stone-900 border border-stone-800 rounded-sm p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="font-serif text-3xl text-bone mb-2">{selectedCampaign.campaign_name}</h2>
                                {selectedCampaign.description && (
                                    <p className="text-sm text-stone-400">{selectedCampaign.description}</p>
                                )}
                            </div>
                            {getStatusBadge(selectedCampaign.status)}
                        </div>

                        {/* Players List */}
                        <div className="mb-6">
                            <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-3">Jogadores ({selectedCampaign.players.length})</h3>
                            {selectedCampaign.players.length === 0 ? (
                                <p className="text-stone-700 italic text-sm">Nenhum jogador conectado ainda.</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedCampaign.players.map((player) => (
                                        <div key={player.id} className="bg-stone-950/50 border border-stone-800 rounded-sm p-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-sm">{player.character_name}</p>
                                                <p className="text-[10px] text-stone-600 uppercase tracking-widest">{player.player_name}</p>
                                            </div>
                                            <p className="text-[10px] text-stone-700">
                                                {new Date(player.last_seen).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {selectedCampaign.status === 'paused' && (
                                <button
                                    onClick={() => handleStartSession(selectedCampaign.id)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-900/30 hover:bg-green-900/50 border border-green-700 text-green-400 px-4 py-3 rounded-sm uppercase tracking-widest text-xs font-bold transition-all"
                                >
                                    <Play size={14} />
                                    Iniciar Sessão
                                </button>
                            )}
                            {selectedCampaign.status === 'active' && (
                                <>
                                    <button
                                        onClick={() => handleStartSession(selectedCampaign.id)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gold/20 hover:bg-gold/30 border border-gold text-gold px-4 py-3 rounded-sm uppercase tracking-widest text-xs font-bold transition-all"
                                    >
                                        <Play size={14} />
                                        Entrar na Sessão
                                    </button>
                                    <button
                                        onClick={() => handlePauseCampaign(selectedCampaign.id)}
                                        className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-400 px-4 py-3 rounded-sm uppercase tracking-widest text-xs transition-all"
                                    >
                                        <Pause size={14} />
                                        Pausar
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex gap-3 mt-3">
                            <button
                                onClick={() => handleArchiveCampaign(selectedCampaign.id)}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/30 border border-red-900/50 text-red-400 px-4 py-2 rounded-sm uppercase tracking-widest text-[10px] transition-all"
                            >
                                <Archive size={12} />
                                Arquivar
                            </button>
                            <button
                                onClick={() => setSelectedCampaign(null)}
                                className="flex-1 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-sm uppercase tracking-widest text-[10px] transition-all"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
