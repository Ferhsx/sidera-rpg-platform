import React, { useState } from 'react';
import { Gift, Swords, FlaskConical, Box, Flower2, Syringe, Tent, Wind } from 'lucide-react';
import { GM_LOOT } from '@/constants/loot';

interface LootDistributorProps {
    playerId: string | null;
    onGiveLoot: (playerId: string, item: any) => void;
}

export const LootDistributor: React.FC<LootDistributorProps> = ({ playerId, onGiveLoot }) => {
    const [isCustomLoot, setIsCustomLoot] = useState(false);
    const [customLoot, setCustomLoot] = useState<{
        name: string;
        type: 'weapon' | 'consumable' | 'general';
        description: string;
        damage?: number;
        range?: string;
        targetId?: string; // for consumables
        amount?: number;
        weight?: number;
    }>({
        name: "",
        type: 'general',
        description: "",
        damage: 1,
        range: "Imediato",
        targetId: "ration",
        amount: 1,
        weight: 1
    });

    const handleCreateCustom = () => {
        if (!playerId) return alert("Selecione um jogador.");
        if (!customLoot.name) return alert("Dê um nome ao item.");

        const newItem: any = {
            id: Date.now().toString(),
            name: customLoot.name,
            type: customLoot.type,
            description: customLoot.description,
        };

        if (customLoot.type === 'weapon') {
            newItem.data = {
                name: customLoot.name,
                damage: customLoot.damage,
                category: 'Improvised', // Generic
                range: customLoot.range,
                properties: ['Customizado'],
                description: customLoot.description,
                weight: customLoot.weight || 1,
                cost: 0
            };
        } else if (customLoot.type === 'consumable') {
            newItem.data = {
                targetId: customLoot.targetId,
                amount: customLoot.amount || 1
            };
        } else if (customLoot.type === 'general') {
            newItem.weight = customLoot.weight !== undefined ? customLoot.weight : 1;
        }

        onGiveLoot(playerId, newItem);
        alert(`Criado e Enviado: ${customLoot.name}`);
        setCustomLoot(prev => ({ ...prev, name: "", description: "" }));
    };

    return (
        <div className="bg-black/40 p-3 rounded border border-stone-800 mt-6">
            <label className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-2 block flex items-center gap-1">
                <Gift size={12} className="text-cyan-500" /> Conceder Recurso
            </label>

            <div className="flex justify-between mb-2">
                <button
                    onClick={() => setIsCustomLoot(false)}
                    className={`px-2 py-1 text-[9px] rounded uppercase font-bold ${!isCustomLoot ? 'bg-cyan-900 text-white' : 'bg-stone-800 text-stone-500'}`}
                >
                    Catálogo
                </button>
                <button
                    onClick={() => setIsCustomLoot(true)}
                    className={`px-2 py-1 text-[9px] rounded uppercase font-bold ${isCustomLoot ? 'bg-cyan-900 text-white' : 'bg-stone-800 text-stone-500'}`}
                >
                    Customizado
                </button>
            </div>

            {!isCustomLoot ? (
                <div className="max-h-48 overflow-y-auto border border-stone-800 rounded bg-black/20 p-1 space-y-1 scrollbar-thin scrollbar-thumb-stone-800">
                    {GM_LOOT.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (playerId) {
                                    onGiveLoot(playerId, item);
                                    alert(`Enviado: ${item.name}`);
                                } else {
                                    alert("Selecione um jogador primeiro.");
                                }
                            }}
                            title={item.description}
                            className="w-full flex items-center gap-3 p-2 hover:bg-stone-800 border border-transparent hover:border-stone-700 rounded transition-all group"
                        >
                            <div className="p-1.5 bg-stone-900 border border-stone-800 text-stone-500 group-hover:text-cyan-400">
                                {item.type === 'weapon' ? <Swords size={12} /> : item.type === 'consumable' ? <FlaskConical size={12} /> : <Box size={12} />}
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <span className="text-[11px] font-bold text-stone-300 group-hover:text-white uppercase tracking-wider">{item.name}</span>
                                <span className="text-[9px] text-stone-600 truncate max-w-[180px]">{item.description}</span>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2 animate-in fade-in">
                    <select
                        value={customLoot.type}
                        onChange={(e) => setCustomLoot({ ...customLoot, type: e.target.value as any })}
                        className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                    >
                        <option value="weapon">Arma</option>
                        <option value="consumable">Consumível/Recurso</option>
                        <option value="general">Item/Nota</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Nome do Item"
                        value={customLoot.name}
                        onChange={(e) => setCustomLoot({ ...customLoot, name: e.target.value })}
                        className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                    />

                    <input
                        type="text"
                        placeholder="Descrição Curta"
                        value={customLoot.description}
                        onChange={(e) => setCustomLoot({ ...customLoot, description: e.target.value })}
                        className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                    />

                    {/* Peso para Itens Gerais */}
                    {customLoot.type === 'general' && (
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] text-stone-500 uppercase whitespace-nowrap">Peso (0-9):</label>
                            <input
                                type="number"
                                min="0"
                                max="9"
                                value={customLoot.weight}
                                onChange={(e) => setCustomLoot({ ...customLoot, weight: parseInt(e.target.value) })}
                                className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded w-20"
                            />
                        </div>
                    )}

                    {/* Campos Específicos */}
                    {customLoot.type === 'weapon' && (
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                placeholder="Dano"
                                value={customLoot.damage}
                                onChange={(e) => setCustomLoot({ ...customLoot, damage: parseInt(e.target.value) })}
                                className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                            />
                            <select
                                value={customLoot.range}
                                onChange={(e) => setCustomLoot({ ...customLoot, range: e.target.value })}
                                className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                            >
                                <option value="Imediato">Curto (Imediato)</option>
                                <option value="Médio">Médio</option>
                                <option value="Longo">Longo</option>
                            </select>

                            {/* Weapon Weight Input */}
                            <div className="flex items-center gap-2 col-span-2">
                                <label className="text-[10px] text-stone-500 uppercase whitespace-nowrap">Peso:</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="9"
                                    value={customLoot.weight}
                                    onChange={(e) => setCustomLoot({ ...customLoot, weight: parseInt(e.target.value) })}
                                    className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded w-full"
                                />
                            </div>
                        </div>
                    )}

                    {customLoot.type === 'consumable' && (
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-5 gap-1 mb-1">
                                {/* Chumbo */}
                                <button
                                    onClick={() => setCustomLoot({ ...customLoot, targetId: 'lead', name: 'Chumbo Líquido' })}
                                    className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'lead' ? 'bg-stone-800 border-stone-500 text-stone-300' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                >
                                    <FlaskConical size={14} className="mb-1" />
                                    <span className="text-[8px] font-bold uppercase">Chumbo</span>
                                </button>

                                {/* Soro */}
                                <button
                                    onClick={() => setCustomLoot({ ...customLoot, targetId: 'serum', name: 'Soro Estelar' })}
                                    className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'serum' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                >
                                    <Syringe size={14} className="mb-1" />
                                    <span className="text-[8px] font-bold uppercase">Soro</span>
                                </button>

                                {/* Ração */}
                                <button
                                    onClick={() => setCustomLoot({ ...customLoot, targetId: 'ration', name: 'Ração de Viagem' })}
                                    className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'ration' ? 'bg-amber-900/30 border-amber-500 text-amber-500' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                >
                                    <Tent size={14} className="mb-1" />
                                    <span className="text-[8px] font-bold uppercase">Ração</span>
                                </button>

                                {/* Papoula */}
                                <button
                                    onClick={() => setCustomLoot({ ...customLoot, targetId: 'poppy', name: 'Papoila Branca' })}
                                    className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'poppy' ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                >
                                    <Flower2 size={14} className="mb-1" />
                                    <span className="text-[8px] font-bold uppercase">Papoula</span>
                                </button>

                                {/* Sais */}
                                <button
                                    onClick={() => setCustomLoot({ ...customLoot, targetId: 'salts', name: 'Sais de Cheiro' })}
                                    className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${customLoot.targetId === 'salts' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-400' : 'bg-stone-900 border-stone-800 text-stone-600 hover:bg-stone-800'}`}
                                >
                                    <Wind size={14} className="mb-1" />
                                    <span className="text-[8px] font-bold uppercase">Sais</span>
                                </button>
                            </div>
                            <input
                                type="number"
                                placeholder="Qtd"
                                value={customLoot.amount}
                                onChange={(e) => setCustomLoot({ ...customLoot, amount: parseInt(e.target.value) })}
                                className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded col-span-2"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleCreateCustom}
                        disabled={!playerId}
                        className="w-full bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 py-2 rounded text-xs font-bold uppercase transition-all mt-2 disabled:opacity-50"
                    >
                        Forjar e Enviar
                    </button>
                </div>
            )}
        </div>
    );
};
