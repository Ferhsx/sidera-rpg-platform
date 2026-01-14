import React from 'react';
import { motion } from 'framer-motion';

interface VitalityBarProps {
    current: number;
    max: number;
    onChange: (val: number) => void;
}

export const VitalityBar: React.FC<VitalityBarProps> = ({ current, max, onChange }) => {
    const percent = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className="w-full space-y-2 font-sans">
            <div className="flex justify-between items-end">
                <label className="text-rust uppercase tracking-widest text-xs font-serif">Integridade Física</label>
                <span className="font-serif text-xl text-bone">{current} / {max}</span>
            </div>

            {/* Container da Barra */}
            <div className="relative h-8 bg-black border border-stone-800 outline outline-1 outline-stone-900 outline-offset-[-2px] overflow-hidden group select-none">

                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px)', backgroundSize: '10% 100%' }}>
                </div>

                {/* Sangue (Fundo Vermelho) */}
                <motion.div
                    className="absolute inset-0 bg-blood-bright"
                    initial={false}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                >
                    <div className="w-full h-full opacity-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>
                </motion.div>

                {/* Textura de "Dano" (Overlay) - using CSS instead of image file */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>

                {/* Controles de Clique (Esquerda diminui, Direita aumenta) */}
                <div className="absolute inset-0 flex z-10">
                    <button
                        onClick={() => onChange(Math.max(0, current - 1))}
                        className="flex-1 hover:bg-black/20 active:bg-red-900/40 transition-colors flex items-center justify-start pl-2 group/btn-left"
                        title="Receber Dano"
                    >
                        <span className="text-white/0 group-hover/btn-left:text-white/50 text-xs font-bold">-</span>
                    </button>
                    <button
                        onClick={() => onChange(Math.min(max, current + 1))}
                        className="flex-1 hover:bg-white/5 active:bg-green-900/40 transition-colors flex items-center justify-end pr-2 group/btn-right"
                        title="Receber Cura (Raro)"
                    >
                        <span className="text-white/0 group-hover/btn-right:text-white/50 text-xs font-bold">+</span>
                    </button>
                </div>
            </div>

            {current === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-red-500 font-serif font-bold text-sm animate-pulse flex items-center justify-center gap-2 mt-2"
                >
                    ⚠️ TESTE DE MORTE NECESSÁRIO
                </motion.div>
            )}
        </div>
    );
};
