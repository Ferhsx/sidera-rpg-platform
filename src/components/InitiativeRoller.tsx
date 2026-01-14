import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Zap, Clock, Shield } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { playSound, stopSound } from '@/hooks/useAudio';

type InitiativeResult = 'before' | 'simultaneous' | 'after' | null;

export const InitiativeRoller: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { character } = useCharacter();
    const [isRolling, setIsRolling] = useState(false);
    const [diceResults, setDiceResults] = useState<[number, number]>([1, 1]);
    const [finalResult, setFinalResult] = useState<number | null>(null);
    const [initiative, setInitiative] = useState<InitiativeResult>(null);

    const mercurio = character.attributes.mercurio;

    const rollDie = () => Math.floor(Math.random() * 6) + 1;

    const rollInitiative = () => {
        if (isRolling) return;
        setIsRolling(true);
        setFinalResult(null);
        setInitiative(null);

        // Play dice roll sound
        playSound('diceRoll', 0.6);

        const duration = 1500;
        const interval = 80;
        const steps = duration / interval;
        let step = 0;

        const timer = setInterval(() => {
            setDiceResults([rollDie(), rollDie()]);
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
        const total = d1 + d2 + mercurio;

        setDiceResults([d1, d2]);
        setFinalResult(total);

        if (total >= 10) {
            setInitiative('before');
        } else if (total >= 7) {
            setInitiative('simultaneous');
        } else {
            setInitiative('after');
        }

        setIsRolling(false);
        stopSound('diceRoll');

        // Play result sound based on outcome
        if (total >= 10) {
            playSound('success', 0.6);
        } else if (total < 7) {
            playSound('failure', 0.6);
        } else {
            playSound('diceResult', 0.5);
        }
    };

    const getInitiativeConfig = () => {
        switch (initiative) {
            case 'before':
                return {
                    title: 'AGIR ANTES',
                    subtitle: 'Vantagem Tática',
                    description: 'Você age primeiro. Posicione-se, ataque ou prepare uma ação antes do inimigo reagir.',
                    color: 'text-green-400 border-green-500 bg-green-900/20',
                    icon: Zap
                };
            case 'simultaneous':
                return {
                    title: 'SIMULTÂNEO',
                    subtitle: 'Troca de Golpes',
                    description: 'Você e o inimigo agem ao mesmo tempo. Ambos atacam, ambos sofrem consequências.',
                    color: 'text-gold border-gold bg-gold/10',
                    icon: Swords
                };
            case 'after':
                return {
                    title: 'SURPREENDIDO',
                    subtitle: 'Age por Último',
                    description: 'O inimigo age primeiro. Você reage às consequências das ações dele.',
                    color: 'text-blood-bright border-blood-bright bg-blood/20',
                    icon: Shield
                };
            default:
                return null;
        }
    };

    const config = getInitiativeConfig();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-ash border border-stone-700 shadow-2xl rounded-sm overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white z-10">
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="bg-stone-900/50 p-6 border-b border-stone-800 text-center">
                    <h2 className="text-stone-400 text-xs uppercase tracking-[0.3em] mb-2">Iniciativa Narrativa</h2>
                    <div className="text-2xl font-serif text-bone font-bold flex items-center justify-center gap-3">
                        <Swords className="text-rust" size={24} />
                        <span>2d6 + Mercúrio</span>
                        <span className={`px-2 py-0.5 rounded text-lg ${mercurio >= 0 ? 'bg-stone-800 text-cyan-400' : 'bg-blood/20 text-blood-bright'}`}>
                            {mercurio >= 0 ? `+${mercurio}` : mercurio}
                        </span>
                    </div>
                </div>

                <div className="p-6 flex flex-col items-center gap-6">
                    {/* Dice Display */}
                    <div className="flex items-center justify-center gap-4">
                        <motion.div
                            animate={isRolling
                                ? { rotateX: [0, 360], rotateY: [0, 360] }
                                : { rotateX: 0, rotateY: 0 }
                            }
                            transition={isRolling ? { repeat: Infinity, duration: 0.3 } : { duration: 0.3 }}
                            className="w-16 h-16 bg-stone-200 rounded-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center border-b-4 border-r-4 border-stone-400 text-stone-900 font-serif font-bold text-3xl"
                        >
                            {diceResults[0]}
                        </motion.div>
                        <motion.div
                            animate={isRolling
                                ? { rotateX: [0, 360], rotateY: [0, 360] }
                                : { rotateX: 0, rotateY: 0 }
                            }
                            transition={isRolling ? { repeat: Infinity, duration: 0.3, delay: 0.1 } : { duration: 0.3 }}
                            className="w-16 h-16 bg-stone-200 rounded-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center border-b-4 border-r-4 border-stone-400 text-stone-900 font-serif font-bold text-3xl"
                        >
                            {diceResults[1]}
                        </motion.div>
                    </div>

                    {/* Roll Button */}
                    {!finalResult && !isRolling && (
                        <button
                            onClick={rollInitiative}
                            className="w-full bg-rust hover:bg-rust/80 text-white font-serif uppercase tracking-widest py-4 text-lg border border-rust shadow-[0_0_20px_rgba(161,65,35,0.3)] hover:shadow-[0_0_30px_rgba(161,65,35,0.5)] transition-all flex items-center justify-center gap-3"
                        >
                            <Clock size={20} />
                            Rolar Iniciativa
                        </button>
                    )}

                    {isRolling && (
                        <div className="text-stone-500 text-xs uppercase tracking-widest animate-pulse">
                            Determinando ordem de ação...
                        </div>
                    )}

                    {/* Result Display */}
                    <AnimatePresence>
                        {finalResult !== null && config && !isRolling && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full space-y-4"
                            >
                                {/* Total */}
                                <div className="text-center">
                                    <span className="text-stone-500 text-xs uppercase tracking-widest">Total</span>
                                    <div className="text-4xl font-serif font-bold text-white">{finalResult}</div>
                                </div>

                                {/* Initiative Card */}
                                <div className={`border-2 p-6 ${config.color} transition-all`}>
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <config.icon size={24} />
                                        <h3 className="text-xl font-serif font-bold uppercase tracking-widest">
                                            {config.title}
                                        </h3>
                                    </div>
                                    <p className="text-xs uppercase tracking-widest opacity-80 text-center mb-3">
                                        {config.subtitle}
                                    </p>
                                    <p className="text-sm text-center opacity-90">
                                        {config.description}
                                    </p>
                                </div>

                                {/* Roll Again */}
                                <button
                                    onClick={rollInitiative}
                                    className="w-full border border-stone-700 hover:border-stone-500 text-stone-500 hover:text-white py-2 text-xs uppercase tracking-widest transition-colors"
                                >
                                    Rolar Novamente
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default InitiativeRoller;
