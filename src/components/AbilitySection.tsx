import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Eye, Shield, Plus, X, Skull, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacter } from '@/contexts/CharacterContext';
import { CustomAbility, AbilityType } from '@/types/index';
import { ARCHETYPES } from '@/constants';
import { ASTRAL_POWERS } from '@/constants/astralPowers';
import { logEvent } from '@/lib/logger';

export const AbilitySection: React.FC = () => {
    const { character, updateCharacter, dbInfo } = useCharacter();
    const [isAdding, setIsAdding] = useState(false);
    const [manifestFeedback, setManifestFeedback] = useState<string | null>(null);

    // State do Formulário
    const [newAbility, setNewAbility] = useState<Partial<CustomAbility>>({
        type: 'ATIVA',
        name: '',
        description: '',
        cost: ''
    });

    const archetype = ARCHETYPES.find(a => a.id === character.archetypeId);
    const selectedAstralPower = ASTRAL_POWERS.find(p => p.id === character.astralPowerId);

    // Get current tier based on orbit
    const getCurrentTier = useCallback(() => {
        if (!selectedAstralPower) return null;
        if (character.orbit >= 9) return { ...selectedAstralPower.tiers.high, level: 'HIGH' };
        if (character.orbit >= 5) return { ...selectedAstralPower.tiers.mid, level: 'MID' };
        return { ...selectedAstralPower.tiers.low, level: 'LOW' };
    }, [selectedAstralPower, character.orbit]);

    const currentTier = getCurrentTier();

    const handleManifest = useCallback(() => {
        if (!selectedAstralPower) return;

        // Calculate cost (e.g. "+1 Órbita" -> 1)
        const costMatch = selectedAstralPower.cost.match(/\d+/);
        const costValue = costMatch ? parseInt(costMatch[0]) : 1;

        const newOrbit = Math.min(10, character.orbit + costValue);
        updateCharacter({ orbit: newOrbit });

        setManifestFeedback(selectedAstralPower.name);
        setTimeout(() => setManifestFeedback(null), 3000);

        if (dbInfo?.roomId) {
            logEvent(dbInfo.roomId, character.name, `Manifestou: ${selectedAstralPower.name} (${getCurrentTier()?.range})`, 'combat');
        }
    }, [selectedAstralPower, character.orbit, character.name, updateCharacter, dbInfo?.roomId, getCurrentTier]);

    useEffect(() => {
        const handleTrigger = () => handleManifest();
        window.addEventListener('trigger-manifest', handleTrigger);
        return () => window.removeEventListener('trigger-manifest', handleTrigger);
    }, [handleManifest]);

    const handleAdd = () => {
        if (!newAbility.name || !newAbility.description) return;

        const ability: CustomAbility = {
            id: Date.now().toString(),
            name: newAbility.name,
            description: newAbility.description,
            cost: newAbility.cost || '',
            type: newAbility.type as AbilityType || 'ATIVA'
        };

        updateCharacter({
            customAbilities: [...(character.customAbilities || []), ability]
        });

        setIsAdding(false);
        setNewAbility({ type: 'ATIVA', name: '', description: '', cost: '' });
    };

    const removeAbility = (id: string) => {
        if (confirm("Esquecer esta habilidade?")) {
            updateCharacter({
                customAbilities: (character.customAbilities || []).filter(a => a.id !== id)
            });
        }
    };

    const getTypeStyle = (type: AbilityType) => {
        switch (type) {
            case 'PASSIVA': return 'text-stone-400 border-stone-600';
            case 'ATIVA': return 'text-gold border-gold/50';
            case 'REAÇÃO': return 'text-cyan-400 border-cyan-800';
            case 'MALDICÃO': return 'text-purple-400 border-purple-800';
            default: return 'text-stone-400 border-stone-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-stone-800 pb-2">
                <h3 className="font-serif text-rust uppercase tracking-widest text-sm flex items-center gap-2">
                    <BookOpen size={16} /> Memórias & Mutações
                </h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="text-[10px] flex items-center gap-1 text-stone-500 hover:text-white transition-colors uppercase font-bold"
                >
                    <Plus size={12} /> Nova Habilidade
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Habilidades do Arquétipo (Fixas) */}
                {archetype && (
                    <>
                        <div className="bg-stone-900/40 border border-stone-700 p-4 rounded-sm relative group">
                            <div className="absolute top-2 right-2 text-[9px] border border-stone-600 px-1 rounded text-stone-500 uppercase">Inato</div>
                            <h4 className="font-serif font-bold text-stone-300 mb-1">{archetype.passive.split(':')[0]}</h4>
                            <p className="text-xs text-stone-400 leading-relaxed">{archetype.passive.split(':')[1] || archetype.passive}</p>
                        </div>

                        <div className={`
                            p-4 rounded-sm relative group transition-all duration-500 border
                            ${currentTier?.level === 'HIGH' ? 'bg-red-950/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' :
                                currentTier?.level === 'MID' ? 'bg-gold/5 border-gold shadow-[0_0_15px_rgba(212,163,115,0.1)]' :
                                    'bg-stone-900/40 border-gold/30'}
                        `}>
                            <div className="flex justify-between items-start mb-2">
                                <div className={`text-[9px] border px-1 rounded uppercase font-bold tracking-tighter
                                    ${currentTier?.level === 'HIGH' ? 'border-red-500 text-red-500' :
                                        currentTier?.level === 'MID' ? 'border-gold text-gold' :
                                            'border-gold/30 text-gold/60'}
                                `}>
                                    Manifestação ({currentTier?.range})
                                </div>
                                <button
                                    onClick={handleManifest}
                                    className="bg-gold hover:bg-white text-black text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-tighter transition-colors"
                                >
                                    Manifestar ({selectedAstralPower?.cost})
                                </button>
                            </div>

                            <h4 className="font-serif font-bold text-bone mb-1 flex items-center gap-2">
                                <Zap size={12} className="text-gold" /> {selectedAstralPower ? selectedAstralPower.name : 'Poder do Astro'}
                            </h4>
                            <p className="text-xs text-stone-300 leading-relaxed min-h-[3em]">
                                {currentTier ? currentTier.effect : (selectedAstralPower ? selectedAstralPower.description : archetype.manifestation)}
                            </p>

                            <AnimatePresence>
                                {manifestFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.2 }}
                                        className="absolute inset-0 bg-gold/10 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 border border-gold rounded-sm z-10"
                                    >
                                        <Zap size={24} className="text-gold mb-2 animate-pulse" />
                                        <div className="text-gold font-serif font-bold text-sm uppercase tracking-[0.2em]">{manifestFeedback}</div>
                                        <div className="text-white text-[9px] mt-1 font-mono uppercase">Vínculo Estelar Expandido</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="bg-stone-900/40 border border-red-900/30 p-4 rounded-sm relative group col-span-1 md:col-span-2">
                            <div className="absolute top-2 right-2 text-[9px] border border-red-900/30 px-1 rounded text-red-700 uppercase">Falha</div>
                            <h4 className="font-serif font-bold text-red-800 mb-1 flex items-center gap-2"><Skull size={12} /> Maldição (Órbita 7+)</h4>
                            <p className="text-xs text-stone-500 leading-relaxed italic">{archetype.flaw}</p>
                        </div>
                    </>
                )}

                {/* 2. Habilidades Customizadas */}
                {(character.customAbilities || []).map(abil => (
                    <div key={abil.id} className={`bg-stone-950 p-4 rounded-sm border relative group ${getTypeStyle(abil.type)}`}>
                        <button onClick={() => removeAbility(abil.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-stone-600 hover:text-red-500 transition-opacity">
                            <X size={14} />
                        </button>

                        <div className="flex justify-between items-start mb-2 pr-6">
                            <h4 className="font-serif font-bold">{abil.name}</h4>
                            <span className="text-[9px] uppercase border px-1 rounded opacity-70 tracking-wider font-mono">{abil.type}</span>
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap">{abil.description}</p>

                        {abil.cost && (
                            <div className="mt-3 pt-2 border-t border-dashed border-stone-800 text-[10px] font-mono text-stone-500 uppercase tracking-tighter">
                                Custo: {abil.cost}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal de Criação */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-stone-900 border border-stone-700 p-6 rounded-sm w-full max-w-md shadow-2xl"
                    >
                        <h3 className="font-serif text-xl text-bone mb-4 border-b border-stone-800 pb-2">Registrar Nova Habilidade</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-stone-500 uppercase block mb-1">Nome</label>
                                <input
                                    className="w-full bg-black border border-stone-700 p-2 text-white outline-none focus:border-rust transition-colors"
                                    value={newAbility.name}
                                    onChange={e => setNewAbility({ ...newAbility, name: e.target.value })}
                                    placeholder="Ex: Braço de Tentáculo, Treino Militar..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-stone-500 uppercase block mb-1">Tipo</label>
                                    <select
                                        className="w-full bg-black border border-stone-700 p-2 text-stone-300 outline-none cursor-pointer"
                                        value={newAbility.type}
                                        onChange={e => setNewAbility({ ...newAbility, type: e.target.value as AbilityType })}
                                    >
                                        <option value="ATIVA">Ativa (Uso)</option>
                                        <option value="PASSIVA">Passiva (Constante)</option>
                                        <option value="REAÇÃO">Reação (Defesa)</option>
                                        <option value="MALDICÃO">Maldição (Negativo)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-stone-500 uppercase block mb-1">Custo (Opcional)</label>
                                    <input
                                        className="w-full bg-black border border-stone-700 p-2 text-white outline-none focus:border-rust transition-colors"
                                        value={newAbility.cost}
                                        onChange={e => setNewAbility({ ...newAbility, cost: e.target.value })}
                                        placeholder="Ex: 1 Órbita"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-stone-500 uppercase block mb-1">Descrição / Efeito</label>
                                <textarea
                                    className="w-full bg-black border border-stone-700 p-2 text-white outline-none focus:border-rust h-24 resize-none transition-colors"
                                    value={newAbility.description}
                                    onChange={e => setNewAbility({ ...newAbility, description: e.target.value })}
                                    placeholder="Descreva o efeito mecânico e narrativo..."
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsAdding(false)} className="flex-1 bg-stone-800 text-stone-400 py-2 text-xs font-bold uppercase hover:bg-stone-700 transition-colors">Cancelar</button>
                                <button onClick={handleAdd} className="flex-1 bg-rust text-white py-2 text-xs font-bold uppercase hover:bg-orange-800 transition-colors">Registrar</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
