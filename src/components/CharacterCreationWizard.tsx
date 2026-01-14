import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Star, Activity, ArrowRight, Check, ChevronLeft, Shield, Zap, Skull, Brain } from 'lucide-react';
import { ARCHETYPES } from '@/constants';
import { useCharacter } from '@/contexts/CharacterContext';
import { Attributes } from '@/types';

const CharacterCreationWizard: React.FC = () => {
    const { character, updateCharacter } = useCharacter();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);

    // Local state for draft before committing? 
    // actually, we can commit directly to context as we go, 
    // but for "Attributes" it might be safer to have local state to enforce the array rule 
    // before saving. For simplicity and "live" feel, we'll write to context but 
    // enforce "Next" button disablement if invalid.

    const [localAttrs, setLocalAttrs] = useState<Attributes>({ ferro: 0, mercurio: 0, enxofre: 0, sal: 0 });
    // We initialize localAttrs with what's in context or zeros if we want a fresh start feel
    // But for the "Allocator", we might want a pool system.

    // Custom Attribute Allocator Logic
    const STANDARD_ARRAY = [2, 1, 0, -1];
    const [assignedValues, setAssignedValues] = useState<(number | null)[]>([null, null, null, null]);
    // Mapping: 0->Ferro, 1->Mercurio, 2->Enxofre, 3->Sal (Arbitrary order for UI, or key based)

    const handlePropChange = (key: string, value: any) => {
        updateCharacter({ [key]: value });
    };

    const nextStep = () => {
        setDirection(1);
        setStep(s => s + 1);
    };

    const prevStep = () => {
        setDirection(-1);
        setStep(s => s - 1);
    };

    const variants = {
        enter: (dir: number) => ({ x: dir * 50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir * -50, opacity: 0 })
    };

    // -- STEPS --

    // Step 1: Identity
    const renderIdentity = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-serif text-bone">Quem é você na escuridão?</h2>
                <p className="text-stone-500">Defina sua identidade antes do colapso.</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-rust mb-1">Nome</label>
                    <input
                        value={character.name}
                        onChange={e => handlePropChange('name', e.target.value)}
                        className="w-full bg-void border-b border-stone-700 p-2 text-xl text-white focus:border-rust outline-none transition-colors placeholder:text-stone-800"
                        placeholder="Digite seu nome..."
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-widest text-stone-500 mb-1">Antecedente</label>
                    <input
                        value={character.background}
                        onChange={e => handlePropChange('background', e.target.value)}
                        className="w-full bg-void border-b border-stone-800 p-2 text-stone-300 focus:border-stone-600 outline-none transition-colors placeholder:text-stone-800"
                        placeholder="O que você era antes disso?"
                    />
                </div>
            </div>
        </div>
    );

    // Step 2: Archetype
    const renderArchetype = () => (
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <div className="text-center space-y-1 mb-2">
                <h2 className="text-3xl font-serif text-bone">Escolha seu Destino</h2>
                <p className="text-stone-500 text-sm">Qual astro rege sua maldição?</p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 overflow-y-auto pr-2 pb-4 flex-1 scrollbar-thin scrollbar-thumb-rust/20 scrollbar-track-transparent">
                {ARCHETYPES.map(arch => {
                    const isSelected = character.archetypeId === arch.id;
                    return (
                        <motion.div
                            key={arch.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                                if (isSelected) {
                                    nextStep();
                                } else {
                                    handlePropChange('archetypeId', arch.id);
                                }
                            }}
                            className={`cursor-pointer p-5 border rounded-sm relative overflow-hidden group transition-all duration-500 flex flex-col h-full ${isSelected ? 'border-rust bg-rust/10 shadow-[0_0_30px_rgba(139,38,38,0.15)] ring-1 ring-rust/50' : 'border-stone-800 bg-stone-900/40 hover:border-stone-600'}`}
                        >
                            {isSelected && (
                                <div className="absolute top-3 right-3 text-rust flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                    <span className="text-[8px] uppercase font-bold tracking-tighter opacity-60">Confirmar?</span>
                                    <Check size={14} />
                                </div>
                            )}

                            <div className="flex-grow">
                                <h3 className={`font-serif text-xl font-bold mb-1 leading-tight ${isSelected ? 'text-white' : 'text-stone-300'}`}>{arch.name}</h3>
                                <p className="text-[10px] text-gold uppercase tracking-[0.2em] mb-4">{arch.planet}</p>

                                <div className="text-xs text-stone-400 font-mono mb-6 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                    {arch.description}
                                </div>
                            </div>

                            <div className="border-t border-stone-800/50 pt-4 mt-auto space-y-3">
                                <div className="flex justify-between text-[10px] uppercase tracking-wider text-stone-500">
                                    <span>Vigor Inicial</span>
                                    <span className="text-stone-300">{arch.type} (+{arch.bonusHp} PV)</span>
                                </div>
                                <div className="text-[10px] text-stone-500 leading-normal">
                                    <span className="text-rust-light font-bold uppercase tracking-tighter mr-1">Passiva:</span>
                                    <span className="italic">{arch.passive}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );

    // Step 3: Attributes (Drag/Drop or Select alternative)
    // Simplified for speed: Click slot to cycle? Or click Value then Attribute?
    // Let's go with: List Attributes, and for each, select a value from the pool.
    const renderAttributes = () => {
        // We need to ensure the user assigns specific values: 2, 1, 0, -1
        // Let's use a "Pool" approach.
        const attrKeys: (keyof Attributes)[] = ['ferro', 'mercurio', 'enxofre', 'sal'];
        const currentValues = Object.values(character.attributes) as number[];

        // Check if current distribution matches Standard Array
        const sortedVals = [...currentValues].sort((a, b) => b - a);
        const isStandard = JSON.stringify(sortedVals) === JSON.stringify([2, 1, 0, -1]);
        const isTrade = JSON.stringify(sortedVals) === JSON.stringify([3, 1, 0, -2]);
        const isValid = isStandard || isTrade;

        const setAttr = (attr: keyof Attributes, val: number) => {
            updateCharacter({
                attributes: { ...character.attributes, [attr]: val }
            });
        };

        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-serif text-bone">Distribua seus Pontos</h2>
                    <p className="text-stone-500">
                        Padrão: <span className="text-white font-mono bg-stone-800 px-1 rounded">+2, +1, 0, -1</span>
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {attrKeys.map(attr => (
                        <div key={attr} className="bg-stone-900/50 p-4 border border-stone-800 rounded flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-lg font-serif text-stone-300 capitalize">{attr}</span>
                                <span className="text-xs text-stone-600 uppercase tracking-widest">
                                    {attr === 'ferro' && 'Força & Violência'}
                                    {attr === 'mercurio' && 'Agilidade & Furtividade'}
                                    {attr === 'enxofre' && 'Técnica & Ocultismo'}
                                    {attr === 'sal' && 'Vontade & Empatia'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setAttr(attr, character.attributes[attr] - 1)} className="w-8 h-8 rounded hover:bg-white/10 text-stone-500">-</button>
                                <span className={`text-2xl font-bold w-8 text-center ${character.attributes[attr] > 0 ? 'text-rust' : character.attributes[attr] < 0 ? 'text-stone-600' : 'text-white'}`}>
                                    {character.attributes[attr] > 0 ? `+${character.attributes[attr]}` : character.attributes[attr]}
                                </span>
                                <button onClick={() => setAttr(attr, character.attributes[attr] + 1)} className="w-8 h-8 rounded hover:bg-white/10 text-stone-500">+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`mt-8 p-4 rounded border text-center transition-colors duration-500 ${isValid ? 'border-green-900 bg-green-900/10 text-green-500' : 'border-red-900 bg-red-900/10 text-red-500'}`}>
                    {isValid ? (
                        <div className="flex items-center justify-center gap-2">
                            <Check size={20} />
                            <span>Distribuição Válida: {isStandard ? 'Array Padrão' : 'Regra de Troca'}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 font-bold"><Activity size={18} /> Distribuição Inválida</div>
                            <p className="text-xs opacity-70">Você precisa ter exatamente os valores {standardArray.join(', ')} (ou {tradeArray.join(', ')}) distribuídos.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Helpers strings for rules
    const standardArray = ["+2", "+1", "0", "-1"];
    const tradeArray = ["+3", "+1", "0", "-2"];

    // Validation Checkers
    const canProceedStep1 = character.name.length > 0;
    const canProceedStep2 = !!character.archetypeId;
    const canProceedStep3 = (() => {
        const vals = (Object.values(character.attributes) as number[]).sort((a, b) => b - a);
        const isStandard = JSON.stringify(vals) === JSON.stringify([2, 1, 0, -1]);
        const isTrade = JSON.stringify(vals) === JSON.stringify([3, 1, 0, -2]);
        return isStandard || isTrade;
    })();

    const isComplete = step === 3 && canProceedStep3;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
            {/* Progress Bar */}
            <div className="w-full max-w-3xl mb-8 flex items-center justify-between text-xs uppercase tracking-widest text-stone-600">
                <span className={step >= 1 ? 'text-rust' : ''}>01. Identidade</span>
                <span className="h-px bg-stone-800 flex-1 mx-4" />
                <span className={step >= 2 ? 'text-rust' : ''}>02. Arquétipo</span>
                <span className="h-px bg-stone-800 flex-1 mx-4" />
                <span className={step >= 3 ? 'text-rust' : ''}>03. Atributos</span>
            </div>

            {/* Content Area */}
            <div className="w-full max-w-6xl min-h-[400px] flex flex-col relative">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="flex-1"
                    >
                        {step === 1 && renderIdentity()}
                        {step === 2 && renderArchetype()}
                        {step === 3 && renderAttributes()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="w-full max-w-3xl mt-12 flex justify-between items-center border-t border-stone-800 pt-6">
                <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className={`flex items-center gap-2 uppercase tracking-widest text-xs transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-stone-500 hover:text-white'}`}
                >
                    <ChevronLeft size={16} /> Voltar
                </button>

                {step < 3 ? (
                    <button
                        onClick={nextStep}
                        disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                        className="flex items-center gap-2 bg-rust text-white px-6 py-3 rounded-sm uppercase tracking-widest text-xs font-bold hover:bg-rust-dark transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        Próximo <ArrowRight size={16} />
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            handlePropChange('wizardCompleted', true);
                            window.dispatchEvent(new Event('wizard-complete'));
                        }}
                        disabled={!canProceedStep3}
                        className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-sm uppercase tracking-widest text-xs font-bold hover:bg-stone-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Finalizar Criação <Check size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CharacterCreationWizard;
