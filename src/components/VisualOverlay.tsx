import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useCharacter } from '@/contexts/CharacterContext';
import { X } from 'lucide-react';

export const VisualOverlay: React.FC = () => {
    const { dbInfo } = useCharacter();
    const [imageData, setImageData] = useState<{ url: string, caption: string } | null>(null);



    useEffect(() => {
        // Escutar eventos de projeção
        if (!dbInfo.roomId) return;

        const channelName = `room-visuals:${dbInfo.roomId}`;

        const channel = supabase.channel(channelName);

        channel.on(
            'broadcast',
            { event: 'show_image' },
            (envelope) => {
                const data = envelope.payload || envelope;
                if (data && data.url) {
                    setImageData(data);
                }
            }
        ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [dbInfo.roomId]);

    return (
        <AnimatePresence>
            {imageData && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setImageData(null)} // Clica fora pra fechar
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 20 }}
                        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()} // Clica na imagem não fecha
                    >
                        {/* Imagem com Borda "Artifact" */}
                        <div className="relative border-4 border-stone-800 bg-stone-950 p-1 shadow-2xl">
                            <img
                                src={imageData.url}
                                alt="Projeção"
                                className="max-h-[80vh] object-contain filter contrast-110"
                            />

                            {/* Botão Fechar */}
                            <button
                                onClick={() => setImageData(null)}
                                className="absolute -top-4 -right-4 bg-rust text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg border border-stone-900"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Legenda */}
                        {imageData.caption && (
                            <div className="mt-4 bg-stone-900/80 px-6 py-2 rounded-full border border-stone-700 text-stone-300 font-serif italic tracking-wide">
                                {imageData.caption}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
