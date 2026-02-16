import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FlaskConical, Syringe, Skull, Sparkles,
    Flower2, Wind, Activity, Tent, Zap
} from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Condition } from '@/types/index';

const AlchemyBelt: React.FC = () => {
    const { character, updateCharacter, playSound } = useCharacter();
    const [feedback, setFeedback] = useState<string | null>(null);

    const updateQty = (id: string, delta: number) => {
        if (typeof playSound === 'function') playSound('click', 0.3);
        const newPouch = character.beltPouch.map(item =>
            item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        );
        updateCharacter({ beltPouch: newPouch });
    };

    const getItem = (id: string) => character.beltPouch.find(i => i.id === id) || { quantity: 0 };

    const triggerFeedback = (msg: string) => {
        setFeedback(msg);
        setTimeout(() => setFeedback(null), 3500);
    };

    // --- Actions ---
    const useLead = () => {
        const item = getItem('lead');
        if (item.quantity <= 0) return;
        if (typeof playSound === 'function') playSound('click', 0.5);
        updateQty('lead', -1);
        const reduction = Math.floor(Math.random() * 4) + 1;
        const nausea: Condition = {
            id: 'nausea-' + Date.now(),
            name: "Enjoado",
            description: "-1 em Testes Físicos",
            type: 'debuff',
            mechanic: 'nausea',
            durationInRounds: 60
        };
        updateCharacter({
            orbit: Math.max(0, character.orbit - reduction),
            conditions: [...character.conditions, nausea]
        });
        triggerFeedback(`Bebeu Chumbo: Órbita -${reduction}. Enjoado.`);
    };

    const useSerum = () => {
        const item = getItem('serum');
        if (item.quantity <= 0) return;
        if (typeof playSound === 'function') playSound('click', 0.5);
        updateQty('serum', -1);
        const healing = Math.floor(Math.random() * 6) + 1;
        const stim: Condition = {
            id: 'stim-' + Date.now(),
            name: "Estimulado",
            description: "Adrenalina Estelar",
            type: 'buff',
            mechanic: 'stimulated',
            durationInRounds: 6
        };
        updateCharacter({
            orbit: Math.min(10, character.orbit + 2),
            currentHp: Math.min(character.maxHp, character.currentHp + healing),
            conditions: [...character.conditions, stim]
        });
        triggerFeedback(`Soro: +${healing} PV. Adrenalina no sangue.`);
    };

    const usePoppy = () => {
        const item = getItem('poppy');
        if (item.quantity <= 0) return;
        if (typeof playSound === 'function') playSound('click', 0.5);
        updateQty('poppy', -1);
        const healing = Math.floor(Math.random() * 4) + 1;
        updateCharacter({
            currentHp: Math.min(character.maxHp, character.currentHp + healing),
            conditions: [...character.conditions, {
                id: 'numb-' + Date.now(),
                name: "Entorpecido",
                description: "Dor amortecida",
                type: 'buff',
                mechanic: 'numb',
                durationInRounds: 12
            }]
        });
        triggerFeedback(`Papoula: +${healing} PV. Torpor.`);
    };

    const useSalts = () => {
        const item = getItem('salts');
        if (item.quantity <= 0) return;
        if (typeof playSound === 'function') playSound('click', 0.5);
        updateQty('salts', -1);
        const cleanConditions = character.conditions.filter(c =>
            c.mechanic !== 'nausea' && c.mechanic !== 'stimulated' && c.mechanic !== 'numb'
        );
        updateCharacter({ conditions: cleanConditions });
        triggerFeedback(`Sais: Sentidos aguçados.`);
    };

    const useRation = () => {
        const item = getItem('ration');
        if (item.quantity <= 0) return;
        if (typeof playSound === 'function') playSound('click', 0.5);
        updateQty('ration', -1);
        updateCharacter({
            currentHp: Math.min(character.maxHp, character.currentHp + 1)
        });
        triggerFeedback(`Ração: +1 PV. (Melhor usar no Acampamento)`);
    };

    const PouchItem = ({ id, name, icon: Icon, color, action, rule }: any) => {
        const item = getItem(id);
        const hasAmmo = item.quantity > 0;

        return (
            <div
                title={rule}
                className={`group flex items-center justify-between p-2 rounded-sm border transition-all ${hasAmmo ? 'bg-stone-900/30 border-stone-800 hover:border-stone-700' : 'bg-transparent border-stone-900/50 opacity-40'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded bg-black/40 border border-stone-800 ${hasAmmo ? color : 'text-stone-700'}`}>
                        <Icon size={14} />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300">{name}</span>
                        <span className="text-[8px] font-mono text-stone-600 italic">{rule}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Qty Control */}
                    <div className="flex items-center bg-black/60 border border-stone-800 rounded px-1 py-0.5">
                        <button onClick={() => updateQty(id, -1)} className="hover:text-rust text-stone-700 w-3 font-mono text-[10px]">-</button>
                        <span className="min-w-[12px] text-center text-bone font-mono text-[9px] mx-1">{item.quantity}</span>
                        <button onClick={() => updateQty(id, 1)} className="hover:text-gold text-stone-700 w-3 font-mono text-[10px]">+</button>
                    </div>

                    {/* Use Button */}
                    <button
                        onClick={action}
                        disabled={!hasAmmo}
                        className={`px-3 py-1.5 rounded-sm border text-[9px] font-bold uppercase tracking-widest transition-all ${hasAmmo
                            ? 'bg-rust/10 border-rust/30 text-rust hover:bg-rust hover:text-white hover:border-rust'
                            : 'bg-stone-900 border-stone-800 text-stone-700 cursor-not-allowed'
                            }`}
                    >
                        Usar
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-stone-950/20 rounded-sm relative overflow-hidden flex flex-col gap-1 border-t border-stone-800/30 pt-1">
            {/* Minimal Header */}
            <div className="flex justify-between items-center px-1 mb-1">
                <span className="text-[8px] uppercase tracking-[0.2em] text-stone-600 font-bold flex items-center gap-1">
                    <Activity size={10} className="text-rust" />
                    Farmacopeia
                </span>
            </div>

            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-0 top-0 bottom-0 bg-black/95 z-30 flex items-center justify-center text-center p-2 border border-rust/20"
                    >
                        <p className="text-gold font-serif text-[10px] italic">{feedback}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
                <PouchItem
                    id="lead" name="Chumbo" icon={FlaskConical} color="text-stone-400"
                    action={useLead} rule="-1d4 órbita"
                />
                <PouchItem
                    id="serum" name="Soro" icon={Syringe} color="text-cyan-400"
                    action={useSerum} rule="+1d6 pv / +2 órb"
                />
                <PouchItem
                    id="poppy" name="Papoula" icon={Flower2} color="text-red-400"
                    action={usePoppy} rule="+1d4 pv"
                />
                <PouchItem
                    id="ration" name="Ração" icon={Tent} color="text-amber-600"
                    action={useRation} rule="Comida / Descanso"
                />
                <PouchItem
                    id="salts" name="Sais" icon={Wind} color="text-yellow-400"
                    action={useSalts} rule="Limpeza"
                />

                {/* Astral Power Shortcut */}
                <div className="mt-2 pt-2 border-t border-stone-800">
                    <button
                        onClick={() => {
                            const event = new CustomEvent('trigger-manifest');
                            window.dispatchEvent(event);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-sm border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-black/40 border border-gold/50 text-gold group-hover:scale-110 transition-transform">
                                <Zap size={14} />
                            </div>
                            <div className="flex flex-col leading-tight text-left">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Manifestar Poder</span>
                                <span className="text-[8px] font-mono text-stone-500 italic">Gasta Órbita</span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlchemyBelt;
