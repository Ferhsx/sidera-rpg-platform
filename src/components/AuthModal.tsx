import React, { useState } from 'react';
import { X, Mail, ArrowRight, Loader2, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn(email);
            setSent(true);
            toast.success("Link mágico enviado!", { icon: '✨' });
        } catch (error: any) {
            toast.error("Erro ao enviar link. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-stone-900 border border-stone-800 p-8 rounded-sm max-w-md w-full relative shadow-2xl animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="font-serif text-3xl text-bone tracking-widest mb-2">IDENTIFICAÇÃO</h2>
                    <p className="text-xs text-stone-500 uppercase tracking-widest">Acesse suas memórias na nuvem</p>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-rust/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rust/30">
                            <Mail className="text-rust animate-pulse" size={32} />
                        </div>
                        <h3 className="text-white font-bold text-lg">Verifique seu Email</h3>
                        <p className="text-stone-400 text-sm">
                            Enviamos um link mágico para <strong>{email}</strong>.<br />
                            Clique nele para entrar.
                        </p>
                        <button
                            onClick={onClose}
                            className="text-rust hover:text-white text-xs uppercase tracking-widest mt-4 underline"
                        >
                            Fechar Janela
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-xs text-stone-500 uppercase font-bold ml-1">Email</label>
                            <div className="flex items-center gap-2 bg-black/50 border border-stone-800 p-3 rounded focus-within:border-rust transition-colors">
                                <Mail size={18} className="text-stone-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="bg-transparent border-none outline-none text-white w-full placeholder:text-stone-700"
                                />
                            </div>
                        </div>

                        <div className="bg-stone-900/50 p-4 rounded border border-stone-800/50 flex gap-3 text-left">
                            <Info className="text-rust shrink-0" size={16} />
                            <p className="text-[10px] text-stone-500 leading-relaxed">
                                Usamos <strong>Links Mágicos</strong> para maior segurança. Você não precisa decorar senhas. Basta clicar no link que enviaremos para seu email.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-rust hover:bg-orange-900 text-white font-bold py-3 uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Enviar Link de Acesso <ArrowRight size={16} /></>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
