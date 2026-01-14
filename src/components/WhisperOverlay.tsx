import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useCharacter } from '@/contexts/CharacterContext';
import { Eye } from 'lucide-react';

export const WhisperOverlay: React.FC = () => {
    const { dbInfo } = useCharacter();
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!dbInfo.roomId) return;

        // Conectar ao canal da sala para ouvir eventos de 'whisper'
        const channel = supabase.channel(`room-whispers:${dbInfo.roomId}`);

        channel.on(
            'broadcast',
            { event: 'whisper' },
            (payload) => {
                // Verifica se a mensagem é para mim (targetId) ou para todos ('all')
                if (payload.payload.targetId === dbInfo.charId || payload.payload.targetId === 'all') {
                    triggerWhisper(payload.payload.message);
                }
            }
        ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [dbInfo.roomId, dbInfo.charId]);

    const triggerWhisper = (text: string) => {
        setMessage(text);
        // Tocar som aqui futuramente

        // Sumir depois de 6 segundos
        setTimeout(() => setMessage(null), 6000);
    };

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                >
                    {/* Vignette escura nas bordas */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_0%,_rgba(0,0,0,0.9)_90%)]" />

                    {/* O Texto Fantasma */}
                    <motion.div
                        initial={{ scale: 0.9, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        className="relative z-10 max-w-2xl text-center px-8"
                    >
                        <Eye className="mx-auto text-stone-700 mb-4 animate-pulse opacity-50" size={32} />
                        <p className="font-serif text-2xl md:text-4xl text-stone-300 tracking-widest leading-relaxed drop-shadow-lg italic">
                            "{message}"
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
