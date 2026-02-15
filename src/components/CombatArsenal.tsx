import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Crosshair, RefreshCw, AlertTriangle, Hammer, Trash2, Plus, X } from 'lucide-react';
import { Weapon, WeaponCategory, WeaponStatus } from '@/types/index';
import { WEAPON_CATALOG } from '@/constants';
import { useCharacter } from '@/contexts/CharacterContext';
import { playSound } from '@/hooks/useAudio';
import { logEvent } from '@/lib/logger';

// Helper de Ícones
const getIcon = (cat: WeaponCategory) => {
    if (cat === 'Shield') return <Shield size={18} />;
    if (cat === 'Firearm' || cat === 'Ranged') return <Crosshair size={18} />;
    if (cat === 'Heavy') return <Hammer size={18} />;
    return <Sword size={18} />;
};

interface ArsenalProps {
    onAttack: (weapon: Weapon) => void;
}

export const CombatArsenal: React.FC<ArsenalProps> = ({ onAttack }) => {
    const { character, updateCharacter, dbInfo } = useCharacter();
    const [showCatalog, setShowCatalog] = useState(false);

    // Helpers de Ação
    const handleAddWeapon = (template: typeof WEAPON_CATALOG[0]) => {
        playSound('click', 0.5);

        const createWeapon = (t: typeof WEAPON_CATALOG[0]): Weapon => ({
            ...t,
            id: Math.random().toString(36).substr(2, 9),
            status: 'ready',
            currentAmmo: t.maxAmmo
        } as Weapon);

        let newArsenal = [...(character.arsenal || [])];

        // Lógica Especial: Pistola
        if (template.catalogId === 'pistola') {
            const hasPistol = character.arsenal?.some(w => w.catalogId === 'pistola');

            if (!hasPistol) {
                // Primeira Pistola vincula munição
                const ammoTemplate = WEAPON_CATALOG.find(w => w.catalogId === 'municao_pistola');
                newArsenal.push(createWeapon(template));
                if (ammoTemplate) newArsenal.push(createWeapon(ammoTemplate));
                alert("Você adquiriu uma Pistola e um Pente de Munição (6)!");
            } else {
                // Se já tem, a escolha é feita no catálogo (ver render)
                newArsenal.push(createWeapon(template));
            }
        } else {
            newArsenal.push(createWeapon(template));
        }

        updateCharacter({ arsenal: newArsenal });
        setShowCatalog(false);

        if (dbInfo?.roomId) {
            logEvent(dbInfo.roomId, character.name, `Adquiriu: ${template.name}`, 'item');
        }
    };

    const handleRemove = (id: string) => {
        playSound('click', 0.4);
        if (confirm("Remover esta arma do inventário?")) {
            updateCharacter({ arsenal: character.arsenal?.filter(w => w.id !== id) });
        }
    };

    const handleStatusChange = (id: string, newStatus: WeaponStatus) => {
        playSound('click', 0.5);
        const updated = character.arsenal?.map(w => w.id === id ? { ...w, status: newStatus } : w);
        updateCharacter({ arsenal: updated });
    };

    const handleReload = (id: string) => {
        playSound('click', 0.6);
        const updated = character.arsenal?.map(w =>
            w.id === id && w.maxAmmo ? { ...w, currentAmmo: w.maxAmmo } : w
        );
        updateCharacter({ arsenal: updated });
    };

    const handleFire = (w: Weapon) => {
        if (w.currentAmmo && w.currentAmmo > 0) {
            const updated = character.arsenal?.map(item =>
                item.id === w.id ? { ...item, currentAmmo: (item.currentAmmo || 0) - 1 } : item
            );
            updateCharacter({ arsenal: updated });
            onAttack(w);

            if (dbInfo?.roomId) {
                logEvent(dbInfo.roomId, character.name, `Disparou ${w.name} (${(w.currentAmmo || 0) - 1} restantes)`, 'combat');
            }
        } else {
            playSound('failure', 0.5);
            alert("Clique em Recarregar!");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                <h3 className="font-serif text-rust uppercase tracking-widest text-sm flex items-center gap-2">
                    <Sword size={16} /> Arsenal & Combate
                </h3>
                <button
                    onClick={() => { playSound('click', 0.4); setShowCatalog(true); }}
                    className="text-xs flex items-center gap-1 text-stone-500 hover:text-white transition-colors"
                >
                    <Plus size={14} /> Adicionar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(character.arsenal || []).map(w => {
                    const isBroken = w.status === 'broken';
                    const isDropped = w.status === 'dropped';

                    return (
                        <motion.div
                            key={w.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative p-4 border rounded-sm transition-all group flex flex-col gap-3 ${isBroken ? 'border-red-900/40 bg-red-950/10 grayscale' :
                                isDropped ? 'border-yellow-700/50 bg-yellow-900/10' :
                                    'border-stone-700 bg-stone-900/40 hover:border-stone-500'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-stone-200 font-serif font-bold text-sm">
                                    {getIcon(w.category)}
                                    <span className={isBroken ? 'line-through decoration-red-500 opacity-50' : ''}>{w.name}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xl font-bold text-white block leading-none">{w.damage}</span>
                                        <span className="text-[9px] text-stone-500 uppercase tracking-widest">Dano</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 opacity-60">
                                        <span className="text-xs font-mono text-stone-400">{w.weight}</span>
                                        <div className="w-1.5 h-1.5 bg-stone-500 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Detalhes */}
                            <div className="text-xs text-stone-400 font-mono min-h-[2.5em] leading-relaxed">
                                {w.description}
                                {w.properties.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {w.properties.map(p => (
                                            <span key={p} className="bg-black/40 px-1 rounded text-[9px] text-stone-500 uppercase border border-stone-800 tracking-tighter">{p}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status Overlay se não estiver pronto */}
                            {(isDropped || isBroken) && (
                                <div className={`p-1 text-center text-[10px] font-bold uppercase tracking-widest border border-dashed rounded-sm ${isBroken ? 'border-red-900 text-red-500 bg-red-900/10' : 'border-yellow-700 text-yellow-500 bg-yellow-900/10'
                                    }`}>
                                    {isBroken ? "Destruído" : "Derrubado / Atordoado"}
                                </div>
                            )}

                            {/* Action Footer */}
                            <div className="mt-auto flex gap-2 pt-2 border-t border-stone-800/50">
                                {/* Botão de Ataque */}
                                {!isBroken && !isDropped && (
                                    w.maxAmmo ? (
                                        <div className="flex-1 flex items-center gap-1">
                                            <button
                                                onClick={() => handleFire(w)}
                                                disabled={w.currentAmmo === 0}
                                                className="flex-1 bg-rust hover:bg-gold text-white text-[10px] font-bold py-2 px-2 uppercase tracking-wide rounded-sm transition-colors disabled:opacity-50 disabled:bg-stone-800"
                                            >
                                                Atacar ({w.currentAmmo}/{w.maxAmmo})
                                            </button>
                                            <button onClick={() => handleReload(w.id)} className="p-2 bg-stone-800 hover:text-cyan-400 rounded-sm transition-colors">
                                                <RefreshCw size={14} className={w.currentAmmo === 0 ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onAttack(w)}
                                            className="flex-1 bg-rust hover:bg-gold text-white text-[10px] font-bold py-2 uppercase tracking-wide rounded-sm transition-colors"
                                        >
                                            Atacar
                                        </button>
                                    )
                                )}

                                {/* Menu de Durabilidade */}
                                <div className="flex items-center gap-1">
                                    {w.status === 'ready' ? (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(w.id, 'dropped')}
                                                className="px-2 py-2 border border-stone-700 text-stone-500 hover:text-yellow-500 hover:border-yellow-500 rounded-sm transition-colors"
                                                title="Soltar/Defender Impacto"
                                            >
                                                <AlertTriangle size={14} />
                                            </button>
                                            <button
                                                onClick={() => { if (confirm("Destruir permanentemente para anular dano massivo?")) handleStatusChange(w.id, 'broken') }}
                                                className="px-2 py-2 border border-stone-700 text-stone-500 hover:text-red-600 hover:border-red-600 rounded-sm transition-colors"
                                                title="Sacrificar (Destrói o item)"
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusChange(w.id, 'ready')}
                                            className="px-3 py-2 border border-stone-800 text-stone-500 hover:text-green-500 hover:border-green-800 text-[10px] uppercase font-bold rounded-sm transition-colors w-full"
                                        >
                                            <RefreshCw size={12} className="inline mr-1" />  Recuperar
                                        </button>
                                    )}
                                </div>

                                <button onClick={() => handleRemove(w.id)} className="text-stone-700 hover:text-red-900 px-1 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
                {(character.arsenal?.length || 0) === 0 && (
                    <div className="md:col-span-2 py-8 text-center border-2 border-dashed border-stone-800 rounded-sm text-stone-700 font-serif italic">
                        Nenhuma arma equipada. Clique em Adicionar para acessar o Mercado.
                    </div>
                )}
            </div>

            {/* Modal de Catálogo */}
            <AnimatePresence>
                {showCatalog && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-ash border border-stone-700 w-full max-w-xl max-h-[85vh] overflow-hidden rounded-sm flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/50">
                                <h2 className="font-serif text-xl text-bone uppercase tracking-widest flex items-center gap-3">
                                    <Sword className="text-rust" /> Mercado Negro
                                </h2>
                                <button onClick={() => { playSound('click', 0.4); setShowCatalog(false); }} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
                                    <X className="text-stone-500 hover:text-white" size={24} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-4 space-y-2 bg-void/20">
                                {WEAPON_CATALOG.map(item => {
                                    const hasPistol = character.arsenal?.some(w => w.catalogId === 'pistola');
                                    const isPistol = item.catalogId === 'pistola';
                                    const isAmmo = item.catalogId === 'municao_pistola';

                                    // Se já tem pistola, a entrada de pistola vira uma "dupla escolha" visual
                                    if (isPistol && hasPistol) {
                                        return (
                                            <div key={item.catalogId} className="p-4 border border-rust/40 bg-stone-900/40 rounded-sm space-y-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-stone-950 border border-stone-800 text-rust">
                                                        <Crosshair size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-serif font-bold text-bone flex items-center gap-2">
                                                            Pistola <span className="text-[10px] text-rust uppercase tracking-widest font-mono">[VOCÊ JÁ POSSUI]</span>
                                                        </div>
                                                        <div className="text-[10px] text-stone-500">Escolha o que deseja adquirir:</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => handleAddWeapon(item)}
                                                        className="py-2 px-3 border border-stone-700 hover:border-rust text-[10px] uppercase font-bold text-stone-400 hover:text-white transition-all bg-void/50 text-center"
                                                    >
                                                        Comprar Outra ({item.cost} LP)
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const ammo = WEAPON_CATALOG.find(w => w.catalogId === 'municao_pistola');
                                                            if (ammo) handleAddWeapon(ammo);
                                                        }}
                                                        className="py-2 px-3 border border-stone-700 hover:border-gold text-[10px] uppercase font-bold text-stone-400 hover:text-white transition-all bg-void/50 text-center"
                                                    >
                                                        Comprar Munição (15 LP)
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Esconder entrada de munição solta se ele não tiver pistola (opcional, mas limpa o UI)
                                    if (isAmmo && !hasPistol) return null;

                                    return (
                                        <div key={item.catalogId} className="group relative">
                                            <button
                                                onClick={() => handleAddWeapon(item)}
                                                className="w-full flex items-center justify-between p-4 border border-stone-800/50 hover:border-rust hover:bg-stone-800/50 transition-all text-left bg-stone-900/30 rounded-sm"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-stone-950 border border-stone-800 text-stone-600 group-hover:text-gold transition-colors">
                                                        {getIcon(item.category)}
                                                    </div>
                                                    <div>
                                                        <div className="font-serif font-bold text-bone group-hover:text-white transition-colors">
                                                            {item.name}
                                                            {isPistol && hasPistol && <span className="ml-2 text-[10px] text-rust animate-pulse font-mono">[JÁ POSSUI]</span>}
                                                        </div>
                                                        <div className="text-[10px] text-stone-500 uppercase tracking-widest">
                                                            {item.category} | Dano {item.damage} | P{item.weight}
                                                        </div>
                                                        <div className="text-[10px] text-rust font-mono mt-1 opacity-70 italic">{item.description}</div>
                                                    </div>
                                                </div>
                                                <div className="text-gold font-mono text-sm bg-gold/10 px-2 py-1 rounded border border-gold/20">{item.cost} LP</div>
                                            </button>

                                            {isPistol && hasPistol && (
                                                <div className="absolute top-0 right-20 bottom-0 flex items-center pointer-events-none">
                                                    <span className="bg-rust/20 text-rust text-[8px] px-2 py-1 border border-rust/30 uppercase tracking-tighter rounded-full">
                                                        Pistola Extra ou Munição?
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
