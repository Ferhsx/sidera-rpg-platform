import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useCharacter } from '@/contexts/CharacterContext';
import { Gift, Check } from 'lucide-react';

interface LootPayload {
    itemName: string;
    description: string;
    targetId: string;
}

export const LootNotification: React.FC = () => {
    const { dbInfo } = useCharacter();
    const [loot, setLoot] = useState<LootPayload | null>(null);

    useEffect(() => {
        if (!dbInfo.roomId || !dbInfo.charId) return;

        const channel = supabase.channel(`room-loot:${dbInfo.roomId}`);

        channel.on(
            'broadcast',
            { event: 'loot_alert' },
            (envelope) => {
                const data = envelope.payload || envelope;
                // Verifica se é pra mim
                if (data && data.targetId === dbInfo.charId) {
                    setLoot(data);
                    // Som de item recebido (opcional)
                    setTimeout(() => setLoot(null), 5000); // Some em 5s
                }
            }
        ).subscribe((status) => {
        });

        return () => { supabase.removeChannel(channel); };
    }, [dbInfo]);

    return (
        <AnimatePresence>
            {loot && (
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none"
                >
                    <div className="bg-stone-900/95 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] p-6 rounded-sm min-w-[300px] text-center backdrop-blur-md">
                        <div className="w-12 h-12 bg-cyan-950 rounded-full flex items-center justify-center mx-auto mb-3 border border-cyan-500">
                            <Gift className="text-cyan-400" size={24} />
                        </div>

                        <h3 className="text-cyan-400 text-xs uppercase tracking-widest font-bold mb-1">Item Adquirido</h3>
                        <p className="text-white font-serif text-xl font-bold mb-2">{loot.itemName}</p>
                        <p className="text-stone-400 text-xs italic">{loot.description}</p>

                        <div className="mt-4 text-[10px] text-stone-500 uppercase tracking-widest flex items-center justify-center gap-1">
                            <Check size={12} /> Adicionado ao Inventário
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
