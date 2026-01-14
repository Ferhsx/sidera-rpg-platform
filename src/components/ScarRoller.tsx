import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, AlertTriangle } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { playSound, stopSound } from '@/hooks/useAudio';

// Scar table based on PDF page 18 - "As Cicatrizes"
const SCARS = [
    {
        id: 1,
        name: "Dano Cerebral",
        effect: "-1 Permanente em Enxofre",
        applyEffect: (char: any) => ({
            attributes: { ...char.attributes, enxofre: char.attributes.enxofre - 1 }
        })
    },
    {
        id: 2,
        name: "Manco",
        effect: "Movimento reduzido à metade",
        applyEffect: null
    },
    {
        id: 3,
        name: "Olho Perdido",
        effect: "Desvantagem em Percepção e Tiro",
        applyEffect: null
    },
    {
        id: 4,
        name: "Mão Esmagada",
        effect: "Não pode usar armas de duas mãos",
        applyEffect: null
    },
    {
        id: 5,
        name: "Desfigurado",
        effect: "-1 Permanente em Sal",
        applyEffect: (char: any) => ({
            attributes: { ...char.attributes, sal: char.attributes.sal - 1 }
        })
    },
    {
        id: 6,
        name: "Milagre de Aço",
        effect: "+2 PV Máximo, Órbita Mínima 2",
        applyEffect: (char: any) => ({
            maxHp: char.maxHp + 2,
            orbit: Math.max(2, char.orbit)
        })
    }
];

export const ScarRoller: React.FC = () => {
    const { character, updateCharacter } = useCharacter();
    const [isRolling, setIsRolling] = useState(false);
    const [currentDie, setCurrentDie] = useState(1);
    const [result, setResult] = useState<typeof SCARS[0] | null>(null);

    if (!character.pendingScar) return null;

    const rollDie = () => Math.floor(Math.random() * 6) + 1;

    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Cleanup timer on unmount
    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const rollScar = () => {
        if (isRolling) return;
        setIsRolling(true);
        setResult(null);

        // Play rolling sound
        playSound('diceRoll', 0.6);

        // Dramatic dice animation
        const duration = 2500;
        const interval = 100;
        const steps = duration / interval;
        let step = 0;

        timerRef.current = setInterval(() => {
            setCurrentDie(rollDie());
            step++;

            if (step >= steps) {
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = null;
                finalizeScar();
            }
        }, interval);
    };

    const finalizeScar = () => {
        const finalRoll = rollDie();
        setCurrentDie(finalRoll);
        const scar = SCARS[finalRoll - 1];
        setResult(scar);
        setIsRolling(false);
        stopSound('diceRoll');
        playSound('diceResult', 0.6);
    };

    const acceptScar = () => {
        playSound('click', 0.5);
        if (!result) return;

        // Build update object
        const updates: any = {
            pendingScar: false,
            scars: [...character.scars, `${result.name}: ${result.effect}`],
            notes: character.notes + `\n\n[CICATRIZ]: ${result.name} - ${result.effect}`
        };

        // Apply mechanical effects if any
        if (result.applyEffect) {
            const effects = result.applyEffect(character);
            Object.assign(updates, effects);
        }

        updateCharacter(updates);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-void/95 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-ash border-2 border-blood-bright p-8 rounded-sm shadow-[0_0_60px_rgba(127,29,29,0.5)] max-w-lg w-full text-center"
            >
                {/* Header */}
                <div className="mb-6">
                    <Skull className="w-12 h-12 text-blood-bright mx-auto mb-4" />
                    <h2 className="text-2xl font-serif text-blood-bright font-bold tracking-widest uppercase">
                        A Cicatriz do Abismo
                    </h2>
                    <p className="text-stone-400 text-sm mt-2 font-serif italic">
                        "Você viu o outro lado e voltou... mas algo ficou para trás."
                    </p>
                </div>

                {/* Pre-roll state */}
                {!isRolling && !result && (
                    <div className="space-y-6">
                        <p className="text-stone-300 text-sm">
                            Sobreviver à morte cobra um preço. Role 1d6 para descobrir qual parte de você foi deixada no limiar.
                        </p>
                        <button
                            onClick={rollScar}
                            className="w-full bg-blood hover:bg-blood-bright text-white font-serif uppercase tracking-widest py-4 px-6 text-lg border border-blood-bright shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all flex items-center justify-center gap-3"
                        >
                            <AlertTriangle size={20} />
                            Aceitar o Trauma
                        </button>
                    </div>
                )}

                {/* Rolling Animation */}
                {isRolling && (
                    <div className="py-8">
                        <motion.div
                            animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                            className="w-24 h-24 bg-stone-800 border-4 border-blood-bright rounded-lg mx-auto flex items-center justify-center text-5xl font-serif font-bold text-white shadow-[0_0_30px_rgba(127,29,29,0.5)]"
                        >
                            {currentDie}
                        </motion.div>
                        <p className="text-stone-500 text-xs mt-6 uppercase tracking-widest animate-pulse">
                            O destino decide sua marca...
                        </p>
                    </div>
                )}

                {/* Result */}
                {result && !isRolling && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Rolled Number */}
                        <div className="w-20 h-20 bg-blood border-4 border-white rounded-lg mx-auto flex items-center justify-center text-4xl font-serif font-bold text-white shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            {result.id}
                        </div>

                        {/* Scar Details */}
                        <div className="border border-stone-700 bg-stone-900/50 p-6">
                            <h3 className="text-xl font-serif text-white font-bold uppercase tracking-widest mb-2">
                                {result.name}
                            </h3>
                            <p className="text-rust font-mono text-sm">
                                {result.effect}
                            </p>
                        </div>

                        {/* Milagre de Aço special message */}
                        {result.id === 6 && (
                            <div className="text-green-400 text-xs border border-green-900 bg-green-900/20 p-3 font-mono">
                                ✦ Sorte! Você saiu mais forte... mas o vínculo se aprofundou.
                            </div>
                        )}

                        {/* Confirm Button */}
                        <button
                            onClick={acceptScar}
                            className="w-full bg-stone-800 hover:bg-stone-700 text-white font-serif uppercase tracking-widest py-3 border border-stone-600 transition-all"
                        >
                            Aceitar e Continuar
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ScarRoller;
