import React, { useEffect, useState } from 'react';
import { Plus, Trash2, User, Play, Skull, Cloud, CloudOff, LogIn } from 'lucide-react';
import { ProfileService, CharacterProfile } from '@/services/profile.service';
import { useCharacter } from '@/contexts/CharacterContext';
import { ARCHETYPES, INITIAL_CHARACTER } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export const CharacterSelection: React.FC = () => {
    const { switchCharacter, createNewCharacter, deleteCharacterProfile, pendingRoomCode, joinRoom, setPendingRoomCode, setView } = useCharacter();
    const { user, signOut } = useAuth();
    const [profiles, setProfiles] = useState<CharacterProfile[]>([]);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    useEffect(() => {
        // Now async
        ProfileService.list(user?.id).then(setProfiles);
    }, [user]); // Reload when user changes

    const handleSignOut = async () => {
        await signOut();
        const list = await ProfileService.list(undefined);
        setProfiles(list);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Tem certeza que deseja apagar este registro? A memória será perdida para sempre.")) {
            await ProfileService.delete(id);
            const list = await ProfileService.list(user?.id);
            setProfiles(list);
        }
    };

    const handleSelect = async (profileId: string) => {
        // If we serve a pending room join
        if (pendingRoomCode) {
            const charData = await ProfileService.load(profileId);
            if (charData) {
                // Ensure name is correct (sometimes profile name differs from data name?)
                // They should be synced.
                await joinRoom(pendingRoomCode, charData, profileId);
            }
        } else {
            // Normal switch
            switchCharacter(profileId);
        }
    };

    const handleCreateNew = async () => {
        if (pendingRoomCode) {
            // Join as a new character (blank state)
            const initial = { ...INITIAL_CHARACTER };

            // Let's stick to "Join as Soul" (Blank)
            await joinRoom(pendingRoomCode, {
                ...initial,
                name: 'Alma Recém-Chegada',
                // Attributes and other stats are already 0/default in INITIAL_CHARACTER
            } as any);
        } else {
            createNewCharacter();
        }
    };

    const getArchetypeName = (id: string) => {
        return ARCHETYPES.find(a => a.id === id)?.name || 'Desconhecido';
    };

    return (
        <div className="min-h-screen bg-black text-stone-300 p-8 flex flex-col items-center animate-in fade-in duration-700">
            {pendingRoomCode && (
                <div className="absolute top-0 left-0 w-full bg-rust/20 border-b border-rust/50 p-2 text-center">
                    <p className="text-rust text-xs uppercase tracking-widest animate-pulse">
                        Sincronizando com Frequência: {pendingRoomCode}
                    </p>
                    <button
                        onClick={() => { setPendingRoomCode(null); setView('lobby'); }}
                        className="text-[10px] text-stone-400 hover:text-white underline mt-1"
                    >
                        Cancelar Conexão
                    </button>
                </div>
            )}

            <header className="mb-12 text-center mt-8 w-full relative">
                {/* Auth Controls */}
                <div className="absolute top-0 right-0">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest hidden md:inline">
                                {user.email}
                            </span>
                            <button
                                onClick={handleSignOut}
                                className="text-stone-600 hover:text-rust transition-colors text-xs uppercase tracking-widest border border-stone-800 hover:border-rust px-3 py-1 rounded-sm"
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            className="flex items-center gap-2 text-stone-500 hover:text-rust transition-colors text-xs uppercase tracking-widest border border-stone-800 hover:border-rust px-4 py-2 rounded-sm"
                        >
                            <LogIn size={14} />
                            <span className="hidden md:inline">Sincronizar Nuvem</span>
                        </button>
                    )}
                </div>

                <h1 className="font-serif text-4xl text-bone tracking-widest mb-2">GALERIA DE ALMAS</h1>
                <p className="text-xs text-stone-600 uppercase tracking-[0.3em]">
                    {pendingRoomCode ? "Quem irá enfrentar o destino?" : "Selecione seu hospedeiro"}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {/* New Character Card */}
                <button
                    onClick={handleCreateNew}
                    className="group relative h-48 border border-dashed border-stone-800 hover:border-rust/50 rounded-sm flex flex-col items-center justify-center gap-4 transition-all hover:bg-stone-900/40"
                >
                    <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="text-stone-600 group-hover:text-rust" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-stone-500 group-hover:text-rust font-bold">
                        {pendingRoomCode ? "Novo Vinculado" : "Criar Nova Ficha"}
                    </span>
                </button>

                {/* Profiles */}
                {profiles.map(profile => (
                    <div
                        key={profile.id}
                        onClick={() => handleSelect(profile.id)}
                        className="group relative h-48 bg-stone-900/20 border border-stone-800 hover:border-gold/30 rounded-sm p-6 cursor-pointer hover:bg-stone-900/40 transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button
                                onClick={(e) => handleDelete(e, profile.id)}
                                className="text-stone-700 hover:text-red-500 transition-colors p-2"
                                title="Apagar Registro"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <h3 className="font-serif text-2xl text-stone-200 group-hover:text-white transition-colors truncate">
                                    {profile.name}
                                </h3>
                                <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">
                                    {getArchetypeName(profile.archetypeId)} • Órbita {profile.level}
                                </p>
                            </div>

                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-stone-700 font-mono">
                                    Último acesso: {new Date(profile.lastPlayed).toLocaleDateString()}
                                </span>
                                <div className="text-stone-600 group-hover:text-gold transition-colors">
                                    <Play size={20} className="fill-current" />
                                </div>
                            </div>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute -bottom-4 -right-4 text-stone-950 group-hover:text-stone-900/50 transition-colors transform rotate-12 z-0">
                            {profile.level >= 8 ? <Skull size={120} /> : <User size={120} />}
                        </div>

                        {/* Cloud Indicator */}
                        <div className="absolute top-4 left-4 text-stone-600 z-20" title={profile.isCloud ? "Salvo na Nuvem" : "Apenas Local"}>
                            {profile.isCloud ? <Cloud size={14} className="text-rust" /> : <CloudOff size={14} />}
                        </div>
                    </div>
                ))}
            </div>

            {profiles.length === 0 && (
                <div className="mt-8 text-stone-700 italic font-serif opacity-50">
                    "O vazio aguarda a primeira fagulha..."
                </div>
            )}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
    );
};
