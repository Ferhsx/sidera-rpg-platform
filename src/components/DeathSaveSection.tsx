import React, { useState } from 'react';
import { Skull } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, stopSound } from '@/hooks/useAudio';

export const DeathSaveSection: React.FC = () => {
    const { character, updateCharacter } = useCharacter();
    const [lastRoll, setLastRoll] = useState<{ d1: number, d2: number, total: number, message: string, outcome: 'stable' | 'agony' | 'death' } | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [currentDice, setCurrentDice] = useState<[number, number]>([1, 1]);

    if (character.currentHp > 0) return null;

    // Helper for rolling dice
    const rollDie = () => Math.floor(Math.random() * 6) + 1;

    // Função para rolar o Teste da Morte (2d6 puro, sem atributos)
    const rollDeathSave = () => {
        if (isRolling) return;
        setIsRolling(true);
        setLastRoll(null);

        // Play rolling sound
        playSound('diceRoll', 0.6);

        // Animation config
        const duration = 2000; // Slow, dramatic (2s)
        const interval = 100;
        const steps = duration / interval;
        let step = 0;

        const timer = setInterval(() => {
            setCurrentDice([rollDie(), rollDie()]);
            step++;

            if (step >= steps) {
                clearInterval(timer);
                finalizeRoll();
            }
        }, interval);
    };

    const finalizeRoll = () => {
        const d1 = rollDie();
        const d2 = rollDie();
        const roll = d1 + d2;
        let message = "";
        let outcome: 'stable' | 'agony' | 'death' = 'agony';

        if (roll >= 10) {
            message = "ESTÁVEL! A luz retorna.";
            outcome = 'stable';

            // Allow a brief moment to see the 10+ result before unmounting (due to HP update)
            updateCharacter({ isStabilized: true, pendingScar: true });
            setTimeout(() => {
                updateCharacter({ currentHp: 1 });
            }, 2000); // 2s delay to show result before revive

        } else if (roll >= 7) {
            message = "AGONIA. O abismo se aproxima.";
            outcome = 'agony';
            updateCharacter({ deathFailures: Math.min(3, character.deathFailures + 1) });
        } else {
            message = "MORTE IMEDIATA. O vínculo se desfaz.";
            outcome = 'death';
            updateCharacter({ deathFailures: 3 });
        }

        setCurrentDice([d1, d2]);
        setLastRoll({ d1, d2, total: roll, message, outcome });
        setIsRolling(false);
        stopSound('diceRoll');
    };

    return (
        <div className="bg-red-950/20 border border-blood-bright p-4 animate-col-pulse rounded-sm mt-4 relative overflow-hidden">
            <h3 className="text-blood-bright font-serif font-bold text-xl flex items-center gap-2 mb-2 relative z-10">
                <Skull size={24} /> PROTOCOLO DE MORTE
            </h3>
            <p className="text-stone-400 text-xs mb-4 relative z-10">Você está morrendo. Role a cada turno.</p>

            {/* Failures Indicators */}
            <div className="flex gap-2 justify-center mb-6 relative z-10">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-6 h-6 rounded-full border border-blood-bright transition-all duration-500 ${character.deathFailures >= i ? 'bg-blood-bright shadow-[0_0_10px_red]' : 'bg-transparent'}`} />
                ))}
            </div>

            {/* Visual Dice Display (During Roll or Result) */}
            {(isRolling || lastRoll) && (
                <div className="mb-6 p-4 bg-black/40 border border-stone-800 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="flex gap-4 mb-2">
                        <motion.div
                            animate={isRolling ? { rotateX: [0, 360], scale: [1, 1.1, 1] } : {}}
                            transition={isRolling ? { repeat: Infinity, duration: 0.5 } : {}}
                            className={`w-12 h-12 bg-stone-800 rounded flex items-center justify-center text-xl font-serif font-bold ${lastRoll?.outcome === 'death' ? 'text-red-500 border-red-500' : 'text-white border-stone-600'
                                } border`}
                        >
                            {isRolling ? currentDice[0] : lastRoll?.d1}
                        </motion.div>
                        <motion.div
                            animate={isRolling ? { rotateX: [0, 360], scale: [1, 1.1, 1] } : {}}
                            transition={isRolling ? { repeat: Infinity, duration: 0.5, delay: 0.1 } : {}}
                            className={`w-12 h-12 bg-stone-800 rounded flex items-center justify-center text-xl font-serif font-bold ${lastRoll?.outcome === 'death' ? 'text-red-500 border-red-500' : 'text-white border-stone-600'
                                } border`}
                        >
                            {isRolling ? currentDice[1] : lastRoll?.d2}
                        </motion.div>
                    </div>

                    {!isRolling && lastRoll && (
                        <>
                            <div className="text-2xl font-serif font-bold text-white mb-1 transition-all">{lastRoll.total}</div>
                            <div className={`text-sm font-mono uppercase tracking-widest text-center ${lastRoll.outcome === 'stable' ? 'text-green-500' :
                                lastRoll.outcome === 'agony' ? 'text-orange-500' : 'text-red-600 font-bold'
                                }`}>
                                {lastRoll.message}
                            </div>
                            {lastRoll.outcome === 'stable' && (
                                <div className="text-xs text-stone-500 mt-2 animate-pulse">Recuperando consciência... (+1 PV)</div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Roll Button */}
            {!character.isStabilized && character.deathFailures < 3 && !isRolling && (
                <button
                    onClick={rollDeathSave}
                    disabled={isRolling}
                    className="relative z-10 w-full bg-blood hover:bg-blood-bright text-white font-serif uppercase tracking-widest py-3 rounded-sm border border-blood-bright shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center gap-2"
                >
                    <Skull size={16} /> Rolar Teste da Morte
                </button>
            )}

            {isRolling && (
                <div className="text-center text-stone-500 text-xs animate-pulse tracking-widest uppercase">
                    O destino está girando...
                </div>
            )}

            {/* Stable Status (Before Revive) */}
            {character.isStabilized && character.deathFailures < 3 && !lastRoll && (
                <div className="text-center text-green-500 font-mono text-sm border border-green-900 bg-green-900/10 p-2 relative z-10">
                    VOCÊ ESTÁ ESTÁVEL. A MORTE ESPERA.
                </div>
            )}

            {/* Death State */}
            {character.deathFailures >= 3 && !isRolling && (
                <div className="text-center text-white bg-black p-4 font-bold border border-white animate-pulse relative z-10 mt-4">
                    PERSONAGEM MORTO.
                </div>
            )}
        </div>
    );
};
