import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Droplets, EyeOff, Zap } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';

const StatusEffectsBar: React.FC = () => {
    const { character, updateCharacter, advanceRound, playSound } = useCharacter();

    const handleNextRound = () => {
        if (typeof playSound === 'function') playSound('click', 0.4);
        advanceRound();
    };

    const removeCondition = (id: string) => {
        if (typeof playSound === 'function') playSound('click', 0.3);
        updateCharacter({
            conditions: character.conditions.filter((c: any) => c.id !== id)
        });
    };

    // Helper de ícones
    const getIcon = (mechanic?: string) => {
        switch (mechanic) {
            case 'nausea': return <Droplets size={14} />;
            case 'invisible': return <EyeOff size={14} />;
            case 'stimulated': return <Zap size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="flex flex-col gap-2 mb-6">
            {/* Barra de Controle */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                <h3 className="text-xs uppercase tracking-widest text-stone-500 flex items-center gap-2">
                    <Clock size={14} /> Linha do Tempo
                </h3>
                <button
                    onClick={handleNextRound}
                    className="bg-stone-800 hover:bg-rust text-stone-300 hover:text-white px-3 py-1 text-[10px] uppercase font-bold rounded-sm transition-colors flex items-center gap-1 border border-stone-700 hover:border-rust"
                >
                    Passar Rodada (10s)
                </button>
            </div>

            {/* Lista de Condições */}
            <div className="flex flex-wrap gap-2 min-h-[30px]">
                <AnimatePresence>
                    {character.conditions.length === 0 && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-stone-700 text-xs italic py-1"
                        >
                            Nenhum efeito ativo.
                        </motion.span>
                    )}

                    {character.conditions.map((cond: any) => (
                        <motion.div
                            key={cond.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border shadow-lg ${cond.type === 'debuff'
                                ? 'bg-red-950/20 border-red-900 text-red-400'
                                : cond.type === 'buff'
                                    ? 'bg-cyan-950/20 border-cyan-900 text-cyan-400'
                                    : 'bg-stone-800 border-stone-600 text-stone-300'
                                }`}
                        >
                            {getIcon(cond.mechanic)}

                            <div className="flex flex-col leading-none">
                                <span className="font-bold text-xs uppercase">{cond.name}</span>
                                <span className="text-[9px] opacity-80">{cond.description}</span>
                            </div>

                            {cond.durationInRounds !== undefined && (
                                <div className="ml-2 bg-black/40 px-1.5 rounded text-xs font-mono font-bold">
                                    {cond.durationInRounds}R
                                </div>
                            )}

                            <button
                                onClick={() => removeCondition(cond.id)}
                                className="ml-1 hover:text-white opacity-50 hover:opacity-100"
                            >
                                <X size={12} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StatusEffectsBar;
