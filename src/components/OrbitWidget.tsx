import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Skull, Activity, Eye, User, Zap, Droplet, Shield, Moon } from 'lucide-react';
import { OrbitStage } from '@/types';
import { useCharacter } from '@/contexts/CharacterContext';
import { playSound } from '@/hooks/useAudio';

interface OrbitWidgetProps {
    orbit: number;
    onChange: (val: number) => void;
    mini?: boolean; // If true, renders a more compact version for the sheet
}

const OrbitWidget: React.FC<OrbitWidgetProps> = ({ orbit, onChange, mini = false }) => {
    const { character, updateCharacter } = useCharacter();
    const [stage, setStage] = useState<OrbitStage>(OrbitStage.HUMAN);
    const [showManage, setShowManage] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (orbit <= 4) setStage(OrbitStage.HUMAN);
        else if (orbit <= 7) setStage(OrbitStage.SYMPTOMATIC);
        else if (orbit <= 9) setStage(OrbitStage.CRITICAL);
        else setStage(OrbitStage.ECLIPSE);
    }, [orbit]);

    // Management Actions
    const handleBloodletting = () => {
        if (character.currentHp <= 2) {
            setMessage("Você está fraco demais para sangrar.");
            setTimeout(() => setMessage(null), 3000);
            return;
        }
        updateCharacter({
            currentHp: character.currentHp - 2,
            orbit: Math.max(0, orbit - 1)
        });
        setMessage("Dor purificadora. A pressão diminui.");
        setTimeout(() => { setMessage(null); setShowManage(false); }, 2000);
    };

    const handleMedicine = () => {
        const reduction = Math.floor(Math.random() * 4) + 1;
        updateCharacter({ orbit: Math.max(0, orbit - reduction) });
        setMessage(`Química calmante. Órbita reduzida em ${reduction}.`);
        setTimeout(() => { setMessage(null); setShowManage(false); }, 2000);
    };

    const handleRest = () => {
        updateCharacter({ orbit: Math.max(0, orbit - 1) });
        setMessage("Descanso inquieto. Um pouco de paz.");
        setTimeout(() => { setMessage(null); setShowManage(false); }, 2000);
    };

    const getStageColor = () => {
        switch (stage) {
            case OrbitStage.HUMAN: return 'text-stone-400 border-stone-600';
            case OrbitStage.SYMPTOMATIC: return 'text-gold border-gold';
            case OrbitStage.CRITICAL: return 'text-blood-bright border-blood-bright';
            case OrbitStage.ECLIPSE: return 'text-white border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]';
            default: return 'text-stone-400';
        }
    };

    const getStageDescription = () => {
        switch (stage) {
            case OrbitStage.HUMAN:
                return "Você está no controle. Nenhuma penalidade passiva. As marcas estão escondidas.";
            case OrbitStage.SYMPTOMATIC:
                return "A entidade vaza. Veias brilham. +1 em testes do Signo, mas desvantagem social. Sua presença incomoda.";
            case OrbitStage.CRITICAL:
                return "O corpo falha. Dano físico causa +1d6 extra. Em falhas (5-), perde 1d4 PV imediatamente.";
            case OrbitStage.ECLIPSE:
                return "COLAPSO. O Mestre assume o controle. Poder total liberado de forma destrutiva. Prepare-se para a Queda.";
        }
    };

    return (
        <div className={`relative bg-void border border-stone-800 rounded-sm overflow-hidden transition-all duration-500 ${mini ? 'p-4' : 'p-8 shadow-2xl'} ${orbit >= 8 ? 'border-rust/40' : ''}`}>
            {/* Background Atmosphere */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-20"
                animate={{
                    background: orbit >= 8
                        ? 'radial-gradient(circle, rgba(127,29,29,0.4) 0%, rgba(0,0,0,0) 70%)'
                        : 'radial-gradient(circle, rgba(161,98,7,0.1) 0%, rgba(0,0,0,0) 70%)'
                }}
            />

            <div className="relative z-10 flex flex-col gap-4">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                    <h3 className={`font-serif ${mini ? 'text-xl' : 'text-3xl'} text-bone flex items-center gap-2`}>
                        <Zap className={orbit >= 8 ? 'text-gold' : 'text-stone-600'} size={mini ? 18 : 24} fill={orbit >= 8 ? "currentColor" : "none"} />
                        {mini ? 'Órbita' : 'RASTREADOR DE ÓRBITA'}
                    </h3>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                playSound('click', 0.5);
                                setShowManage(true);
                            }}
                            className="bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-white text-[10px] uppercase tracking-widest px-2 py-1 transition-colors rounded-sm"
                        >
                            Gerenciar
                        </button>
                        <div className={`${mini ? 'text-2xl' : 'text-4xl'} font-serif font-bold ${orbit >= 8 ? 'animate-pulse text-blood-bright' : 'text-stone-500'}`}>
                            {orbit}/10
                        </div>
                    </div>
                </div>

                {/* Control */}
                <div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={orbit}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val !== orbit) playSound('click', 0.3);
                            onChange(val);
                        }}
                        className="w-full h-2 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-rust"
                    />
                    {!mini && (
                        <div className="flex justify-between text-xs text-stone-600 mt-2 font-mono uppercase">
                            <span>Latente</span>
                            <span>Sintomático</span>
                            <span>Crítico</span>
                            <span>Eclipse</span>
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className={`border-l-4 pl-4 py-2 ${getStageColor()} transition-colors duration-300`}>
                    <div className="flex items-center gap-3 mb-2">
                        {stage === OrbitStage.HUMAN && <User size={mini ? 16 : 20} />}
                        {stage === OrbitStage.SYMPTOMATIC && <Eye size={mini ? 16 : 20} />}
                        {stage === OrbitStage.CRITICAL && <Activity size={mini ? 16 : 20} />}
                        {stage === OrbitStage.ECLIPSE && <Skull size={mini ? 16 : 20} />}

                        <h3 className={`${mini ? 'text-sm' : 'text-xl'} font-serif uppercase tracking-widest font-bold`}>
                            Estágio {stage === OrbitStage.HUMAN ? 'I' : stage === OrbitStage.SYMPTOMATIC ? 'II' : stage === OrbitStage.CRITICAL ? 'III' : 'IV'}: {stage}
                        </h3>
                    </div>

                    <p className={`font-sans text-stone-300 ${mini ? 'text-xs' : 'text-sm'} leading-tight`}>
                        {getStageDescription()}
                    </p>
                </div>

                {/* Flavor Text that appears at high orbit */}
                {orbit >= 8 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-center text-xs text-blood-bright/60 font-serif italic tracking-widest"
                    >
                        "O céu observa. O céu reivindica."
                    </motion.div>
                )}
            </div>

            {/* Management Modal - Portaled to avoid z-index/transform clipping */}
            {showManage && createPortal(
                <div className="fixed inset-0 z-[9999] bg-void/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowManage(false)}>
                    <div className="bg-ash border border-stone-800 p-8 rounded-sm shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h4 className="text-rust font-serif text-lg mb-6 flex items-center justify-center gap-2">
                            <Zap size={20} /> Baixar A Órbita
                        </h4>

                        {message ? (
                            <div className="text-center text-white font-serif animate-pulse mb-4 text-xl">{message}</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => {
                                        playSound('click', 0.5);
                                        handleBloodletting();
                                    }}
                                    className="flex items-center justify-between p-4 border border-blood/50 hover:border-blood hover:bg-blood/10 transition-colors group"
                                >
                                    <span className="text-blood-bright font-bold uppercase tracking-widest group-hover:scale-105 transition-transform">Sangria</span>
                                    <span className="text-xs text-stone-500 font-mono">-2 Vida / -1 Órbita</span>
                                </button>

                                <button
                                    onClick={() => {
                                        playSound('click', 0.5);
                                        handleMedicine();
                                    }}
                                    className="flex items-center justify-between p-4 border border-stone-700 hover:border-cyan-500 hover:bg-cyan-900/10 transition-colors group"
                                >
                                    <span className="text-cyan-500 font-bold uppercase tracking-widest group-hover:scale-105 transition-transform">Remédio</span>
                                    <span className="text-xs text-stone-500 font-mono">Gasta Item / -1d4 Órbita</span>
                                </button>

                                <button
                                    onClick={() => {
                                        playSound('click', 0.5);
                                        handleRest();
                                    }}
                                    className="flex items-center justify-between p-4 border border-stone-700 hover:border-white hover:bg-white/5 transition-colors group"
                                >
                                    <span className="text-stone-300 font-bold uppercase tracking-widest group-hover:scale-105 transition-transform">Descanso</span>
                                    <span className="text-xs text-stone-500 font-mono">-1 Órbita</span>
                                </button>
                            </div>
                        )}

                        {!message && (
                            <button
                                onClick={() => {
                                    playSound('click', 0.3);
                                    setShowManage(false);
                                }}
                                className="mt-6 w-full text-center text-xs text-stone-500 hover:text-white underline decoration-stone-700 uppercase tracking-widest"
                            >
                                Cancelar Operação
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default OrbitWidget;
