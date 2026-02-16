import React, { useState } from 'react';
import { Eye, User, ArrowRight, Loader2, Zap, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCharacter } from '@/contexts/CharacterContext';
import { useAuth } from '@/contexts/AuthContext';
import { CampaignDashboard } from '@/components/CampaignDashboard';
import { AuthModal } from '@/components/AuthModal';


interface LobbyProps {
    onJoin: () => void; // Função para mudar a tela para a Ficha
    onGM: () => void;   // Função para mudar a tela para o Mestre
}

export const Lobby: React.FC<LobbyProps> = ({ onJoin, onGM }) => {
    const { updateCharacter, setDbInfo, setPendingRoomCode, setView } = useCharacter();
    const { user } = useAuth();
    const [mode, setMode] = useState<'player' | 'gm'>('player');
    const [loading, setLoading] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // Form States
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');

    // If GM is authenticated, show Campaign Dashboard instead of lobby
    if (user && mode === 'gm') {
        return <CampaignDashboard />;
    }

    // --- LÓGICA DE JOGADOR: ENTRAR NA SALA ---
    const handleJoinRoom = async () => {
        if (!playerName || !roomCode) return alert("Preencha seu nome e o código da sala.");
        setLoading(true);

        try {
            // 1. Buscar a Sala pelo Código
            const { data: room, error: roomError } = await supabase
                .from('rooms')
                .select('id')
                .eq('code', roomCode.toUpperCase())
                .single();

            if (roomError || !room) throw new Error("Sala não encontrada. Verifique o código.");

            // 2. Criar o Personagem no Banco (Vazio inicialmente)
            // Nota: Estamos criando um 'boneco' inicial. O Contexto vai preencher os dados depois.
            const initialData = {
                name: playerName,
                orbit: 0,
                currentHp: 10,
                maxHp: 10,
                attributes: { ferro: 0, mercurio: 0, enxofre: 0, sal: 0 }
            };

            const { data: char, error: charError } = await supabase
                .from('characters')
                .insert([
                    {
                        room_id: room.id,
                        player_name: playerName,
                        character_data: initialData
                    }
                ])
                .select()
                .single();

            if (charError) throw new Error("Erro ao criar vínculo: " + charError.message);

            // 3. Salvar IDs no Contexto e Entrar
            setDbInfo(room.id, char.id);
            updateCharacter({ name: playerName }); // Já preenche o nome na ficha visual
            onJoin(); // Troca a tela para a Ficha

        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE MESTRE: CRIAR SALA (Guest Mode for unauthenticated GMs) ---
    const handleCreateRoom = async () => {
        setLoading(true);
        try {
            // Gerar código aleatório (Ex: SIDERA-A1B2)
            const code = `SIDERA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            const { data: room, error } = await supabase
                .from('rooms')
                .insert([{
                    code: code,
                    campaign_name: 'Sessão Rápida',
                    status: 'active',
                    gm_user_id: null // Explicitly set as guest session
                }])
                .select()
                .single();

            if (error) throw error;

            // Salvar ID da sala no contexto (mesmo que o Mestre não tenha 'charId')
            setDbInfo(room.id, null);

            // Opcional: Salvar o código em algum lugar global ou passar via props
            // Vamos assumir que o GMDashboard vai ler do Contexto ou LocalStorage
            localStorage.setItem('sidera_room_code', code);

            onGM(); // Troca a tela para o Dashboard

        } catch (err: any) {
            alert("Erro ao criar universo: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Background Atmosférico */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900/40 via-black to-black pointer-events-none" />

            <div className="w-full max-w-md bg-stone-900/50 border border-stone-800 p-8 rounded-sm backdrop-blur-sm relative z-10 shadow-2xl">
                {/* Login Button (Top Right) */}
                <div className="absolute top-4 right-4">
                    {user ? (
                        <span className="text-[10px] text-stone-500 uppercase tracking-widest">
                            {user.email?.split('@')[0]}
                        </span>
                    ) : (
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            className="flex items-center gap-2 text-stone-500 hover:text-gold transition-colors text-xs uppercase tracking-widest border border-stone-800 hover:border-gold px-3 py-1 rounded-sm"
                        >
                            <LogIn size={14} />
                            Login
                        </button>
                    )}
                </div>

                <h1 className="font-serif text-4xl text-center text-bone mb-2 tracking-widest">SIDERA</h1>
                <p className="text-center text-rust text-xs uppercase tracking-[0.3em] mb-8">Protocolo de Vínculo</p>

                {/* Abas de Seleção */}
                <div className="flex gap-4 mb-8 border-b border-stone-800">
                    <button
                        onClick={() => setMode('player')}
                        className={`flex-1 pb-2 text-xs uppercase font-bold tracking-widest transition-colors ${mode === 'player' ? 'text-white border-b-2 border-rust' : 'text-stone-600 hover:text-stone-400'}`}
                    >
                        Sou Vinculado
                    </button>
                    <button
                        onClick={() => setMode('gm')}
                        className={`flex-1 pb-2 text-xs uppercase font-bold tracking-widest transition-colors ${mode === 'gm' ? 'text-gold border-b-2 border-gold' : 'text-stone-600 hover:text-stone-400'}`}
                    >
                        Sou Observador
                    </button>
                </div>

                {mode === 'player' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="space-y-1">
                            <label className="text-xs text-stone-500 uppercase">Frequência (Código da Sala)</label>
                            <div className="flex items-center gap-2 border-b border-stone-700 pb-1">
                                <Zap size={16} className="text-stone-500" />
                                <input
                                    value={roomCode}
                                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                                    className="bg-transparent w-full outline-none text-white font-serif placeholder:text-stone-700 uppercase"
                                    placeholder="Ex: SIDERA-XXXX"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (!roomCode) return alert("Digite o código da sala.");
                                setPendingRoomCode(roomCode);
                                updateCharacter({ name: '' }); // Reset name just in case
                                setView('selection');
                            }}
                            disabled={loading}
                            className="w-full bg-rust hover:bg-orange-900 text-white font-bold py-3 uppercase tracking-widest text-xs flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Selecionar Vinculado <ArrowRight size={16} /></>}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center">
                        <div className="bg-stone-950/50 p-6 rounded border border-stone-800">
                            <Eye className="mx-auto text-gold mb-4" size={32} />
                            <p className="text-stone-400 text-sm mb-4 leading-relaxed">
                                {user
                                    ? "Como Observador autenticado, você pode gerenciar campanhas persistentes."
                                    : "Como Observador convidado, você criará uma sessão rápida descartável."}
                            </p>
                            {!user && (
                                <>
                                    <button
                                        onClick={handleCreateRoom}
                                        disabled={loading}
                                        className="w-full bg-stone-800 hover:bg-gold hover:text-black border border-gold/30 text-gold font-bold py-3 uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 mb-3"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : "Sessão Rápida (Convidado)"}
                                    </button>
                                    <p className="text-[10px] text-stone-600 uppercase tracking-widest">
                                        Faça login para campanhas persistentes
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Auth Modal */}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
    );
};
