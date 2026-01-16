import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tent, Flame, Moon, X, Utensils } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { logEvent } from '@/lib/logger';

interface CampModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CampModal: React.FC<CampModalProps> = ({ isOpen, onClose }) => {
    const { character, updateCharacter, dbInfo } = useCharacter();
    const [isSleeping, setIsSleeping] = useState(false);

    // Helpers
    const getRationCount = () => {
        // Tenta achar ração no cinto, ou assume que o player gerencia no texto se não tiver
        const ration = character.beltPouch?.find(i => i.name.toLowerCase().includes('ração'));
        return ration ? ration.quantity : 0;
    };

    const consumeRation = () => {
        // Lógica para reduzir ração do cinto
        const newPouch = character.beltPouch?.map(i =>
            i.name.toLowerCase().includes('ração')
                ? { ...i, quantity: Math.max(0, i.quantity - 1) }
                : i
        );
        updateCharacter({ beltPouch: newPouch });
    };

    // --- AÇÃO: DESCANSO CURTO ---
    // Regra: Recupera 3 PV. "Enfaixar feridas".
    const handleShortRest = async () => {
        const healAmount = 3;
        const newHp = Math.min(character.maxHp, character.currentHp + healAmount);

        updateCharacter({ currentHp: newHp });

        if (dbInfo?.roomId) {
            logEvent(dbInfo.roomId, character.name, `Parou para respirar e enfaixar feridas. (+${newHp - character.currentHp} PV)`, 'alert');
        }

        onClose();
    };

    // --- AÇÃO: DESCANSO LONGO ---
    // Regra: Recupera 5 PV (ou tudo, dependendo da interpretação, vamos usar 5 p/ ser hardcore).
    // Reduz 1 de Órbita (Ancoragem/Descanso).
    // Custo: Idealmente 1 Ração.
    const handleLongRest = async () => {
        if (getRationCount() <= 0) {
            if (!confirm("Você não tem Rações registradas no Cinto. Dormir com fome recupera menos vida. Continuar?")) return;
        } else {
            consumeRation();
        }

        setIsSleeping(true); // Ativa animação de "Fade to Black"

        // Espera a animação
        setTimeout(async () => {
            const healAmount = 5;
            const newHp = Math.min(character.maxHp, character.currentHp + healAmount);
            const newOrbit = Math.max(0, character.orbit - 1); // Ancoragem natural do sono

            updateCharacter({
                currentHp: newHp,
                orbit: newOrbit,
                conditions: [] // Limpa todos os efeitos no descanso longo
            });

            if (dbInfo?.roomId) {
                logEvent(dbInfo.roomId, character.name, `Dormiu um sono pesado. Recuperou forças e a mente acalmou.`, 'alert');
            }

            setIsSleeping(false);
            onClose();
        }, 3000); // 3 segundos de tela preta
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay Escuro com Blur */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Conteúdo do Modal */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-stone-900 border border-stone-700 p-8 rounded-sm max-w-lg w-full shadow-2xl z-10"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white"><X /></button>

                        <div className="text-center mb-8">
                            <Tent className="mx-auto text-rust mb-4" size={48} />
                            <h2 className="font-serif text-3xl text-bone tracking-widest">ACAMPAMENTO</h2>
                            <p className="text-stone-500 text-sm mt-2">Um momento de paz no meio do inferno.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Botão Curto */}
                            <button
                                onClick={handleShortRest}
                                className="group p-4 border border-stone-700 hover:border-rust hover:bg-stone-800 transition-all text-left rounded-sm"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-stone-950 rounded-full border border-stone-800 group-hover:border-rust">
                                        <Flame size={20} className="text-orange-500" />
                                    </div>
                                    <span className="font-serif font-bold text-stone-300 group-hover:text-white">Respiro Rápido</span>
                                </div>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    Enfaixar feridas e recuperar o fôlego. <br />
                                    <span className="text-green-500 font-bold">+3 Vitalidade</span>
                                </p>
                            </button>

                            {/* Botão Longo */}
                            <button
                                onClick={handleLongRest}
                                className="group p-4 border border-stone-700 hover:border-cyan-500 hover:bg-stone-800 transition-all text-left rounded-sm"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-stone-950 rounded-full border border-stone-800 group-hover:border-cyan-500">
                                        <Moon size={20} className="text-cyan-200" />
                                    </div>
                                    <span className="font-serif font-bold text-stone-300 group-hover:text-white">Descanso Longo</span>
                                </div>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    Dormir algumas horas. Requer segurança.<br />
                                    <span className="text-green-500 font-bold">+5 Vitalidade</span><br />
                                    <span className="text-cyan-400 font-bold">-1 Órbita</span>
                                </p>
                                {getRationCount() > 0 ? (
                                    <div className="mt-2 text-[10px] text-stone-400 flex items-center gap-1">
                                        <Utensils size={10} /> Consumirá 1 Ração
                                    </div>
                                ) : (
                                    <div className="mt-2 text-[10px] text-red-500 flex items-center gap-1">
                                        <Utensils size={10} /> Sem Rações no Cinto
                                    </div>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Tela de "Dormindo" (Fade to Black) */}
                    {isSleeping && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="text-center"
                            >
                                <p className="font-serif text-stone-500 italic text-xl tracking-widest mb-4">
                                    O mundo gira enquanto você dorme...
                                </p>
                                <div className="w-16 h-1 bg-stone-800 mx-auto rounded overflow-hidden">
                                    <motion.div
                                        className="h-full bg-stone-500"
                                        initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5 }}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            )}
        </AnimatePresence>
    );
};
