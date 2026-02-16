import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Star, Activity, ArrowRight, Check, ChevronLeft, Shield, Zap, Skull, Brain, Scroll, Sparkles, Swords, BookOpen, Users, Compass, GraduationCap, HelpCircle } from 'lucide-react';
import { ARCHETYPES } from '@/constants';
import { BACKGROUNDS, BACKGROUND_CLASSES, BackgroundClass } from '@/constants/backgrounds';
import { ASTRAL_POWERS } from '@/constants/astralPowers';
import { useCharacter } from '@/contexts/CharacterContext';
import { Attributes } from '@/types/index';

const CLASS_ICONS: Record<BackgroundClass, React.ReactNode> = {
    parias: <Skull size={14} />,
    militares: <Swords size={14} />,
    trabalhadores: <Compass size={14} />,
    eruditos: <GraduationCap size={14} />,
    estranhos: <HelpCircle size={14} />
};

const CharacterCreationWizard: React.FC = () => {
    const { character, updateCharacter } = useCharacter();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [activeBackgroundClass, setActiveBackgroundClass] = useState<BackgroundClass>('parias');

    // Attribute Allocator
    const [localAttrs, setLocalAttrs] = useState<Attributes>({ ferro: 0, mercurio: 0, enxofre: 0, sal: 0 });

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

    // ==========================================
    // STEP 1: Identity (Name only)
    // ==========================================
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
            </div>
        </div>
    );

    // ==========================================
    // STEP 2: Archetype (Unchanged)
    // ==========================================
    const renderArchetype = () => (
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <div className="text-center space-y-1 mb-2">
                <h2 className="text-3xl font-serif text-bone">Escolha seu Destino</h2>
                <p className="text-stone-500 text-sm">Qual astro rege sua maldição?</p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 pr-2 pb-4 flex-1">
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
                                    // Reset astral power when archetype changes
                                    handlePropChange('astralPowerId', '');
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

    // ==========================================
    // STEP 3: Background
    // ==========================================
    const filteredBackgrounds = useMemo(() =>
        BACKGROUNDS.filter(bg => bg.class === activeBackgroundClass),
        [activeBackgroundClass]
    );

    const renderBackground = () => (
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <div className="text-center space-y-1 mb-2">
                <h2 className="text-3xl font-serif text-bone">Quem você era na lama?</h2>
                <p className="text-stone-500 text-sm">Escolha seu antecedente — o que você era antes do Vínculo.</p>
            </div>

            {/* Class Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-700">
                {BACKGROUND_CLASSES.map(cls => (
                    <button
                        key={cls.id}
                        onClick={() => setActiveBackgroundClass(cls.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-widest whitespace-nowrap transition-all font-bold ${activeBackgroundClass === cls.id
                            ? 'bg-rust/20 text-rust border border-rust/40'
                            : 'bg-stone-900/40 text-stone-500 border border-stone-800 hover:border-stone-600 hover:text-stone-300'
                            }`}
                    >
                        {CLASS_ICONS[cls.id]}
                        {cls.name}
                    </button>
                ))}
            </div>

            {/* Class Subtitle */}
            <p className="text-center text-[10px] text-stone-600 uppercase tracking-[0.3em]">
                {BACKGROUND_CLASSES.find(c => c.id === activeBackgroundClass)?.subtitle}
            </p>

            {/* Background Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2 pb-4">
                {filteredBackgrounds.map(bg => {
                    const isSelected = character.backgroundId === bg.id;
                    return (
                        <motion.div
                            key={bg.id}
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            onClick={() => {
                                if (isSelected) {
                                    nextStep();
                                } else {
                                    handlePropChange('backgroundId', bg.id);
                                    handlePropChange('background', bg.name);
                                    handlePropChange('backgroundSkills', bg.skills);

                                    // Handle items and weapons
                                    const existingSlots = character.inventorySlots || [];
                                    const existingArsenal = character.arsenal || [];
                                    const prevBg = BACKGROUNDS.find(b => b.id === character.backgroundId);

                                    // Clean up previous background items
                                    const filteredSlots = existingSlots.filter(s => !prevBg || s.name !== prevBg.startingItem.name);
                                    const filteredArsenal = existingArsenal.filter(w => !prevBg || w.name !== prevBg.startingItem.name);

                                    if (bg.startingItem.isWeapon) {
                                        updateCharacter({
                                            inventorySlots: filteredSlots,
                                            arsenal: [
                                                ...filteredArsenal,
                                                {
                                                    id: Math.random().toString(36).substr(2, 9),
                                                    name: bg.startingItem.name,
                                                    description: bg.startingItem.description,
                                                    damage: bg.name === 'Lenhador' ? '3' : '2', // Default logic or specific
                                                    weight: bg.startingItem.weight.toString(),
                                                    category: bg.name === 'Lenhador' ? 'Heavy' : 'Melee',
                                                    properties: [],
                                                    status: 'ready'
                                                }
                                            ]
                                        });
                                    } else {
                                        updateCharacter({
                                            arsenal: filteredArsenal,
                                            inventorySlots: [
                                                ...filteredSlots,
                                                {
                                                    name: bg.startingItem.name,
                                                    description: bg.startingItem.description,
                                                    weight: bg.startingItem.weight,
                                                    isConsumed: false
                                                }
                                            ]
                                        });
                                    }
                                }
                            }}
                            className={`cursor-pointer p-5 border rounded-sm relative overflow-hidden group transition-all duration-500 ${isSelected
                                ? 'border-rust bg-rust/10 shadow-[0_0_30px_rgba(139,38,38,0.15)] ring-1 ring-rust/50'
                                : 'border-stone-800 bg-stone-900/40 hover:border-stone-600'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-3 right-3 text-rust flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                    <span className="text-[8px] uppercase font-bold tracking-tighter opacity-60">Confirmar?</span>
                                    <Check size={14} />
                                </div>
                            )}

                            {/* Name + Description */}
                            <h3 className={`font-serif text-lg font-bold mb-1 pr-16 ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                                {bg.name}
                            </h3>
                            <p className="text-[11px] text-stone-500 mb-4 italic leading-relaxed">
                                {bg.description}
                            </p>

                            {/* Skills */}
                            <div className="mb-3">
                                <span className="text-[9px] text-gold uppercase tracking-widest font-bold">Sabe:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {bg.skills.map((skill, i) => (
                                        <span key={i} className="text-[10px] bg-stone-800/60 text-stone-400 px-2 py-0.5 rounded-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Starting Item */}
                            <div className="border-t border-stone-800/50 pt-3 mt-auto">
                                <div className="flex items-start gap-2">
                                    <Shield size={12} className="text-rust mt-0.5 shrink-0" />
                                    <div>
                                        <span className="text-[9px] text-rust uppercase tracking-widest font-bold">Item Inicial:</span>
                                        <p className="text-[11px] text-stone-400">{bg.startingItem.name}</p>
                                        <p className="text-[10px] text-stone-600 italic">{bg.startingItem.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Special Rule / Penalty */}
                            {(bg.specialRule || bg.penalty) && (
                                <div className="mt-2 space-y-1">
                                    {bg.specialRule && (
                                        <p className="text-[10px] text-green-500/80">
                                            <Zap size={10} className="inline mr-1" />
                                            {bg.specialRule}
                                        </p>
                                    )}
                                    {bg.penalty && (
                                        <p className="text-[10px] text-red-500/70">
                                            ⚠ {bg.penalty}
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );

    // ==========================================
    // STEP 4: Astral Power
    // ==========================================
    const availablePowers = useMemo(() =>
        ASTRAL_POWERS.filter(p => p.archetypeId === character.archetypeId),
        [character.archetypeId]
    );

    const selectedArchetype = ARCHETYPES.find(a => a.id === character.archetypeId);

    const renderAstralPower = () => (
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <div className="text-center space-y-1 mb-2">
                <h2 className="text-3xl font-serif text-bone">Poder Astral</h2>
                <p className="text-stone-500 text-sm">
                    Escolha a manifestação do <span className="text-gold">{selectedArchetype?.planet || 'Astro'}</span> que rege seu corpo.
                </p>
            </div>

            {/* Archetype Header */}
            {selectedArchetype && (
                <div className="text-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-rust">
                        {selectedArchetype.name} — {selectedArchetype.planet}
                    </span>
                </div>
            )}

            {/* Power Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2 pb-4">
                {availablePowers.map(power => {
                    const isSelected = character.astralPowerId === power.id;
                    return (
                        <motion.div
                            key={power.id}
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            onClick={() => {
                                if (isSelected) {
                                    nextStep();
                                } else {
                                    handlePropChange('astralPowerId', power.id);
                                }
                            }}
                            className={`cursor-pointer p-5 border rounded-sm relative overflow-hidden group transition-all duration-500 flex flex-col ${isSelected
                                ? 'border-gold bg-gold/5 shadow-[0_0_30px_rgba(212,175,55,0.1)] ring-1 ring-gold/40'
                                : 'border-stone-800 bg-stone-900/40 hover:border-stone-600'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-3 right-3 text-gold flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                    <span className="text-[8px] uppercase font-bold tracking-tighter opacity-60">Confirmar?</span>
                                    <Check size={14} />
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles size={14} className={isSelected ? 'text-gold' : 'text-stone-500'} />
                                    <h3 className={`font-serif text-lg font-bold ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                                        {power.name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] text-gold uppercase tracking-widest">{power.category}</span>
                                    <span className="text-[9px] text-red-400 font-mono">{power.cost}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-[11px] text-stone-500 mb-4 italic leading-relaxed">
                                {power.description}
                            </p>

                            {/* Tiers */}
                            <div className="space-y-2 border-t border-stone-800/50 pt-3 mt-auto">
                                <div className="flex items-start gap-2">
                                    <span className="text-[9px] text-stone-600 font-mono whitespace-nowrap mt-0.5 w-16 shrink-0">Ó. 1-4</span>
                                    <p className="text-[10px] text-stone-400 leading-relaxed">{power.tiers.low.effect}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-[9px] text-amber-600/80 font-mono whitespace-nowrap mt-0.5 w-16 shrink-0">Ó. 5-8</span>
                                    <p className="text-[10px] text-stone-400 leading-relaxed">{power.tiers.mid.effect}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-[9px] text-red-500/80 font-mono whitespace-nowrap mt-0.5 w-16 shrink-0">Ó. 9-10</span>
                                    <p className="text-[10px] text-stone-400 leading-relaxed">{power.tiers.high.effect}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Flaw Warning */}
            {selectedArchetype && (
                <div className="bg-red-900/10 border border-red-900/30 rounded-sm p-3 text-center">
                    <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold mr-2">Maldição:</span>
                    <span className="text-[11px] text-red-400/80 italic">{selectedArchetype.flaw}</span>
                </div>
            )}
        </div>
    );

    // ==========================================
    // STEP 5: Attributes (Unchanged)
    // ==========================================
    const renderAttributes = () => {
        const attrKeys: (keyof Attributes)[] = ['ferro', 'mercurio', 'enxofre', 'sal'];
        const currentValues = Object.values(character.attributes) as number[];

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

    // Helpers
    const standardArray = ["+2", "+1", "0", "-1"];
    const tradeArray = ["+3", "+1", "0", "-2"];

    // ==========================================
    // Validation
    // ==========================================
    const canProceedStep1 = character.name.length > 0;
    const canProceedStep2 = !!character.archetypeId;
    const canProceedStep3 = !!character.backgroundId;
    const canProceedStep4 = !!character.astralPowerId;
    const canProceedStep5 = (() => {
        const vals = (Object.values(character.attributes) as number[]).sort((a, b) => b - a);
        const isStandard = JSON.stringify(vals) === JSON.stringify([2, 1, 0, -1]);
        const isTrade = JSON.stringify(vals) === JSON.stringify([3, 1, 0, -2]);
        return isStandard || isTrade;
    })();

    const totalSteps = 5;
    const isComplete = step === totalSteps && canProceedStep5;

    const canProceed = (s: number) => {
        switch (s) {
            case 1: return canProceedStep1;
            case 2: return canProceedStep2;
            case 3: return canProceedStep3;
            case 4: return canProceedStep4;
            case 5: return canProceedStep5;
            default: return false;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center overflow-hidden">
            {/* Header / Progress Bar */}
            <div className="w-full max-w-4xl mt-8 mb-8 flex items-center justify-between text-xs uppercase tracking-widest text-stone-600 px-4 shrink-0">
                <span className={step >= 1 ? 'text-rust' : ''}>01. Identidade</span>
                <span className="h-px bg-stone-800 flex-1 mx-2" />
                <span className={step >= 2 ? 'text-rust' : ''}>02. Arquétipo</span>
                <span className="h-px bg-stone-800 flex-1 mx-2" />
                <span className={step >= 3 ? 'text-rust' : ''}>03. Antecedente</span>
                <span className="h-px bg-stone-800 flex-1 mx-2" />
                <span className={step >= 4 ? 'text-rust' : ''}>04. Poder Astral</span>
                <span className="h-px bg-stone-800 flex-1 mx-2" />
                <span className={step >= 5 ? 'text-rust' : ''}>05. Atributos</span>
            </div>

            {/* Scrollable Content Area */}
            <div className="w-full flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-rust/20 scrollbar-track-transparent">
                <div className="max-w-6xl mx-auto pb-32">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && renderIdentity()}
                            {step === 2 && renderArchetype()}
                            {step === 3 && renderBackground()}
                            {step === 4 && renderAstralPower()}
                            {step === 5 && renderAttributes()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Navigation — fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950/90 backdrop-blur-md border-t border-stone-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="max-w-4xl mx-auto flex justify-between items-center px-4 py-6">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className={`flex items-center gap-2 uppercase tracking-widest text-xs transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-stone-500 hover:text-white'}`}
                    >
                        <ChevronLeft size={16} /> Voltar
                    </button>

                    {step < totalSteps ? (
                        <button
                            onClick={nextStep}
                            disabled={!canProceed(step)}
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
                            disabled={!canProceedStep5}
                            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-sm uppercase tracking-widest text-xs font-bold hover:bg-stone-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Finalizar Criação <Check size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CharacterCreationWizard;
