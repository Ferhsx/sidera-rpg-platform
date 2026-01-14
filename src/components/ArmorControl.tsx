import React, { useState } from 'react';
import { Shield, Settings, Check } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { motion, AnimatePresence } from 'framer-motion';

const ARMOR_TYPES = [
    { name: 'Roupas / Trapos', rating: 0 },
    { name: 'Couro Curtido / Sintético', rating: 1 },
    { name: 'Malha / Kevlar', rating: 2 },
    { name: 'Placas / Exoesqueleto', rating: 3 },
];

export const ArmorControl: React.FC = () => {
    const { character, updateCharacter } = useCharacter();
    const [isOpen, setIsOpen] = useState(false);
    const [damageInput, setDamageInput] = useState("");
    const [showDamageModal, setShowDamageModal] = useState(false);

    // Auto-save logic is handled by context, we just call updateCharacter
    const handleArmorSelect = (name: string, rating: number) => {
        updateCharacter({ armorName: name, armorRating: rating });
        setIsOpen(false);
    };

    const handleTakeDamage = () => {
        const rawDamage = parseInt(damageInput);
        if (isNaN(rawDamage) || rawDamage <= 0) return;

        const actualDamage = Math.max(0, rawDamage - character.armorRating);
        const newHealth = Math.max(0, character.currentHp - actualDamage);

        updateCharacter({ currentHp: newHealth });
        setDamageInput("");
        setShowDamageModal(false);
    };

    return (
        <>
            <div className="flex flex-col gap-2">
                {/* Armor Display Widget */}
                <div className="relative group">
                    <div
                        onClick={() => setShowDamageModal(true)}
                        className="bg-stone-900/40 border border-stone-800 p-3 flex items-center justify-between cursor-pointer hover:border-rust/50 transition-colors rounded-sm"
                        title="Clique para Receber Dano (Automático)"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Shield size={28} className="text-stone-500" />
                                <span className="absolute inset-0 flex items-center justify-center font-serif font-bold text-bone text-xs pt-0.5">
                                    {character.armorRating}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest text-stone-500">Armadura (RD)</span>
                                <span className="text-sm font-serif text-bone truncate max-w-[120px]">{character.armorName}</span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                            className="text-stone-600 hover:text-white transition-colors"
                        >
                            <Settings size={14} />
                        </button>
                    </div>

                    {/* Armor Selector Dropdown */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 w-full bg-ash border border-stone-700 z-50 shadow-xl mt-1"
                            >
                                {ARMOR_TYPES.map((armor) => (
                                    <button
                                        key={armor.name}
                                        onClick={() => handleArmorSelect(armor.name, armor.rating)}
                                        className={`w-full text-left px-3 py-2 text-xs uppercase tracking-wide flex justify-between items-center hover:bg-stone-800 transition-colors ${character.armorName === armor.name ? 'text-rust' : 'text-stone-400'}`}
                                    >
                                        <span>{armor.name}</span>
                                        <span className="font-mono bg-stone-900 px-1 text-bone">{armor.rating}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Quick Damage Hint */}
                <div className="text-[10px] text-stone-600 text-center cursor-pointer hover:text-rust transition-colors" onClick={() => setShowDamageModal(true)}>
                    Clique na Armadura para descontar Dano
                </div>
            </div>

            {/* Damage Calculator Modal */}
            <AnimatePresence>
                {showDamageModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-void/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-sm bg-ash border border-stone-700 p-6 shadow-2xl rounded-sm"
                        >
                            <h3 className="text-lg font-serif text-bone mb-4 flex items-center gap-2">
                                <Shield className="text-rust" size={20} />
                                Cálculo de Dano
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-stone-500 uppercase tracking-widest block mb-2">Dano Recebido (Bruto)</label>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={damageInput}
                                        onChange={(e) => setDamageInput(e.target.value)}
                                        className="w-full bg-stone-900 border border-stone-700 p-3 text-2xl font-bold text-white focus:border-rust outline-none"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="flex justify-between items-center p-3 bg-stone-900/50 border border-stone-800 rounded-sm">
                                    <span className="text-xs text-stone-500 uppercase">Redução (Armadura)</span>
                                    <span className="font-mono text-green-500 font-bold">-{character.armorRating}</span>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                                    <span className="text-sm font-serif text-white">Dano Final</span>
                                    <span className="text-xl font-bold text-blood-bright">
                                        {Math.max(0, (parseInt(damageInput) || 0) - character.armorRating)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <button
                                        onClick={() => setShowDamageModal(false)}
                                        className="py-2 border border-stone-700 text-stone-400 hover:text-white uppercase text-xs tracking-widest transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleTakeDamage}
                                        className="py-2 bg-rust hover:bg-red-700 text-white uppercase text-xs tracking-widest font-bold transition-colors"
                                    >
                                        Aplicar Dano
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
