import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { playSound } from '@/hooks/useAudio';
import { InventorySlot } from '@/types/index';

export const InventorySlots: React.FC = () => {
    const { character, updateCharacter } = useCharacter();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState<Partial<InventorySlot>>({ name: '', description: '', weight: 1, isConsumed: false });

    // Calculate max slots: 7 + Ferro attribute
    const maxSlots = 7 + character.attributes.ferro;
    const slots = character.inventorySlots || [];

    // Calculate current weight
    const inventoryWeight = slots.reduce((sum, item) => sum + (item.isConsumed ? 0 : item.weight), 0);
    const arsenalWeight = (character.arsenal || []).reduce((sum, w) => sum + (w.status === 'ready' ? w.weight : 0), 0);
    const currentWeight = inventoryWeight + arsenalWeight;
    const isOverloaded = currentWeight > maxSlots;

    const addItem = () => {
        if (!newItem.name) return;

        const item: InventorySlot = {
            name: newItem.name || '',
            description: newItem.description || '',
            weight: newItem.weight || 1,
            isConsumed: false
        };

        updateCharacter({
            inventorySlots: [...slots, item]
        });

        setNewItem({ name: '', description: '', weight: 1, isConsumed: false });
        setShowAddModal(false);
    };

    const removeItem = (index: number) => {
        playSound('click', 0.4);
        const updated = slots.filter((_, i) => i !== index);
        updateCharacter({ inventorySlots: updated });
    };

    const toggleConsumed = (index: number) => {
        playSound('click', 0.6);
        const updated = slots.map((item, i) =>
            i === index ? { ...item, isConsumed: !item.isConsumed } : item
        );
        updateCharacter({ inventorySlots: updated });
    };

    const updateItem = (index: number, field: keyof InventorySlot, value: any) => {
        const updated = slots.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        updateCharacter({ inventorySlots: updated });
    };

    return (
        <div className="space-y-4">
            {/* Header with Capacity */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                    <Package className="text-rust" size={18} />
                    <span className="text-rust font-serif uppercase tracking-widest text-sm">Mochila</span>
                </div>
                <div className={`text-xs font-mono ${isOverloaded ? 'text-blood-bright animate-pulse' : 'text-stone-500'}`}>
                    {currentWeight}/{maxSlots} Carga
                    {isOverloaded && <span className="ml-2 text-blood-bright">⚠ SOBRECARREGADO</span>}
                </div>
            </div>

            {/* Overload Warning */}
            <AnimatePresence>
                {isOverloaded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blood/20 border border-blood-bright p-3 text-xs text-blood-bright flex items-center gap-2"
                    >
                        <AlertTriangle size={14} />
                        <span>Sobrecarregado! Desvantagem em testes de Mercúrio.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inventory Slots */}
            <div className="space-y-2">
                {/* Visual slot indicators */}
                {Array.from({ length: maxSlots }).map((_, slotIndex) => {
                    const item = slots[slotIndex];

                    return (
                        <div title={item?.description || "Espaço de Inventário"}
                            key={slotIndex}
                            className={`
                                flex items-center gap-2 p-2 border transition-all duration-200
                                ${item
                                    ? item.isConsumed
                                        ? 'border-stone-800 bg-stone-900/20 opacity-50'
                                        : 'border-stone-700 bg-stone-900/40'
                                    : 'border-dashed border-stone-800 bg-transparent'
                                }
                            `}
                        >
                            {/* Slot Number */}
                            <span className="text-stone-600 text-xs font-mono w-6 text-center">
                                {String(slotIndex + 1).padStart(2, '0')}
                            </span>

                            {item ? (
                                <>
                                    {/* Item Name */}
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(slotIndex, 'name', e.target.value)}
                                        className={`
                                            flex-1 bg-transparent text-sm focus:outline-none focus:border-b focus:border-rust
                                            ${item.isConsumed ? 'line-through text-stone-600' : 'text-stone-300'}
                                        `}
                                        placeholder="Nome do item..."
                                    />

                                    {/* Weight Indicator */}
                                    <div className="flex items-center gap-1 text-xs text-stone-600">
                                        {Array.from({ length: item.weight }).map((_, i) => (
                                            <div key={i} className="w-2 h-2 bg-stone-600 rounded-full" />
                                        ))}
                                    </div>

                                    {/* Consume Toggle */}
                                    <button
                                        onClick={() => toggleConsumed(slotIndex)}
                                        className={`p-1 rounded transition-colors ${item.isConsumed
                                            ? 'text-green-500 hover:text-green-400'
                                            : 'text-stone-600 hover:text-gold'
                                            }`}
                                        title={item.isConsumed ? "Marcar como Disponível" : "Marcar como Gasto"}
                                    >
                                        {item.isConsumed ? <Check size={14} /> : <X size={14} />}
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => removeItem(slotIndex)}
                                        className="p-1 text-stone-600 hover:text-blood-bright transition-colors"
                                        title="Remover Item"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            ) : (
                                <span className="flex-1 text-stone-700 text-xs italic">Vazio...</span>
                            )}
                        </div>
                    );
                })}

                {/* Extra items beyond capacity (if overloaded) */}
                {slots.slice(maxSlots).map((item, idx) => (
                    <div
                        key={`extra-${idx}`}
                        className="flex items-center gap-2 p-2 border border-blood/50 bg-blood/10"
                    >
                        <span className="text-blood-bright text-xs font-mono w-6 text-center">
                            {String(maxSlots + idx + 1).padStart(2, '0')}
                        </span>
                        <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(maxSlots + idx, 'name', e.target.value)}
                            className="flex-1 bg-transparent text-blood-bright text-sm focus:outline-none"
                        />
                        <button
                            onClick={() => removeItem(maxSlots + idx)}
                            className="p-1 text-blood-bright hover:text-white transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Item Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="w-full border border-dashed border-stone-700 hover:border-rust text-stone-600 hover:text-rust py-2 text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={14} />
                Adicionar Item
            </button>

            {/* Add Item Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] bg-void/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-ash border border-stone-700 p-6 max-w-sm w-full space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-rust font-serif uppercase tracking-widest text-center">Novo Item</h3>

                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="Nome do Item"
                                    className="w-full bg-stone-900 border border-stone-700 p-2 text-stone-300 text-sm focus:outline-none focus:border-rust"
                                    autoFocus
                                />

                                <input
                                    type="text"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Descrição (opcional)"
                                    className="w-full bg-stone-900 border border-stone-700 p-2 text-stone-300 text-sm focus:outline-none focus:border-rust"
                                />

                                <div className="flex items-center justify-between">
                                    <span className="text-stone-500 text-xs uppercase tracking-widest">Peso</span>
                                    <div className="flex gap-2">
                                        {[0, 1, 2, 3].map(w => (
                                            <button
                                                key={w}
                                                onClick={() => setNewItem({ ...newItem, weight: w })}
                                                className={`
                                                    w-8 h-8 border text-xs font-mono transition-colors
                                                    ${newItem.weight === w
                                                        ? 'border-rust bg-rust/20 text-rust'
                                                        : 'border-stone-700 text-stone-500 hover:border-stone-500'}
                                                `}
                                            >
                                                {w}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 border border-stone-700 text-stone-500 hover:text-white py-2 text-xs uppercase tracking-widest transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={addItem}
                                    disabled={!newItem.name}
                                    className="flex-1 bg-rust hover:bg-rust/80 text-white py-2 text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventorySlots;
