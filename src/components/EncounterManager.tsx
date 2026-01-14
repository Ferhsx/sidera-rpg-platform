import React, { useState } from 'react';
import { Skull, Plus, Shield, Sword, Trash2, Dices } from 'lucide-react';
import { BESTIARY, EnemyTemplate } from '@/constants/bestiary';

// Inimigo Ativo na Cena
interface ActiveEnemy extends EnemyTemplate {
    instanceId: string;
    currentHp: number;
}

export const EncounterManager: React.FC = () => {
    const [activeEnemies, setActiveEnemies] = useState<ActiveEnemy[]>([]);
    const [lastRoll, setLastRoll] = useState<{ total: number, label: string } | null>(null);

    // Custom Enemy State
    const [isCustom, setIsCustom] = useState(false);
    const [customEnemy, setCustomEnemy] = useState<EnemyTemplate>({
        id: 'custom',
        name: '',
        description: '',
        hp: 10,
        orbit: 0,
        attacks: [{ name: 'Ataque Básico', damage: 2 }],
        passive: ''
    });

    const spawnEnemy = (template: EnemyTemplate) => {
        setActiveEnemies([...activeEnemies, {
            ...template,
            instanceId: Math.random().toString(36),
            currentHp: template.hp
        }]);
    };

    const damageEnemy = (id: string, amount: number) => {
        setActiveEnemies(prev => prev.map(e =>
            e.instanceId === id ? { ...e, currentHp: Math.max(0, e.currentHp - amount) } : e
        ));
    };

    const gmRoll = (dice: number, bonus: number, label: string) => {
        // Simples 2d6 + bonus
        const r1 = Math.floor(Math.random() * 6) + 1;
        const r2 = Math.floor(Math.random() * 6) + 1;
        const total = r1 + r2 + bonus;
        setLastRoll({ total, label: `${label} (${r1}+${r2}+${bonus})` });
    };

    return (
        <div className="bg-stone-900/30 border border-stone-800 p-4 rounded-sm mt-8">
            <div className="flex justify-between items-center mb-4 border-b border-stone-800 pb-2">
                <h2 className="text-rust font-serif text-lg flex items-center gap-2">
                    <Skull size={18} /> Ameaças Ativas
                </h2>

                {/* Menu de Spawn Rápido */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCustom(!isCustom)}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors uppercase font-bold ${isCustom ? 'bg-rust text-white border-red-500' : 'bg-stone-800 text-stone-400 border-stone-700'}`}
                    >
                        {isCustom ? 'Cancelar' : '+ Criar'}
                    </button>

                    {!isCustom && BESTIARY.map(monster => (
                        <button
                            key={monster.id}
                            onClick={() => spawnEnemy(monster)}
                            className="text-[10px] bg-stone-800 hover:bg-white hover:text-black px-2 py-1 rounded border border-stone-700 transition-colors uppercase"
                        >
                            + {monster.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Enemy Form */}
            {isCustom && (
                <div className="mb-6 bg-black/40 p-4 border border-rust/30 rounded animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-rust text-xs uppercase font-bold mb-2">Novo Horror</h3>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Nome"
                            value={customEnemy.name}
                            onChange={(e) => setCustomEnemy({ ...customEnemy, name: e.target.value })}
                            className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Descrição / Aparência"
                            value={customEnemy.description}
                            onChange={(e) => setCustomEnemy({ ...customEnemy, description: e.target.value })}
                            className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                        />
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] text-stone-500 uppercase">PV:</label>
                            <input
                                type="number"
                                value={customEnemy.hp}
                                onChange={(e) => setCustomEnemy({ ...customEnemy, hp: parseInt(e.target.value) })}
                                className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] text-stone-500 uppercase">Órbita (Bonus):</label>
                            <input
                                type="number"
                                value={customEnemy.orbit}
                                onChange={(e) => setCustomEnemy({ ...customEnemy, orbit: parseInt(e.target.value) })}
                                className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded w-full"
                            />
                        </div>
                    </div>

                    <div className="border-t border-stone-800 pt-2 mb-2">
                        <label className="text-[10px] text-stone-500 uppercase block mb-1">Ataque Principal</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Nome do Ataque"
                                value={customEnemy.attacks[0].name}
                                onChange={(e) => {
                                    const newAttacks = [...customEnemy.attacks];
                                    newAttacks[0].name = e.target.value;
                                    setCustomEnemy({ ...customEnemy, attacks: newAttacks });
                                }}
                                className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                            />
                            <input
                                type="number"
                                placeholder="Dano"
                                value={customEnemy.attacks[0].damage}
                                onChange={(e) => {
                                    const newAttacks = [...customEnemy.attacks];
                                    newAttacks[0].damage = parseInt(e.target.value);
                                    setCustomEnemy({ ...customEnemy, attacks: newAttacks });
                                }}
                                className="bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (!customEnemy.name) return;
                            spawnEnemy(customEnemy);
                            setIsCustom(false);
                            // Reset optional, maybe keep for easy duplication
                        }}
                        className="w-full bg-rust hover:bg-red-600 text-white py-1 rounded text-xs font-bold uppercase transition-all"
                    >
                        Invocar
                    </button>
                </div>
            )}


            {/* Painel de Rolagem do Mestre */}
            {
                lastRoll && (
                    <div className="mb-4 bg-black p-2 border-l-4 border-gold text-center animate-in fade-in slide-in-from-top-2">
                        <div className="text-[10px] text-stone-500 uppercase">{lastRoll.label}</div>
                        <div className="text-2xl font-serif text-white font-bold">{lastRoll.total}</div>
                    </div>
                )
            }

            {/* Lista de Inimigos */}
            <div className="space-y-3">
                {activeEnemies.length === 0 && (
                    <div className="text-stone-600 text-xs italic text-center py-4">
                        O cenário está seguro... por enquanto.
                    </div>
                )}

                {activeEnemies.map(enemy => (
                    <div key={enemy.instanceId} className="bg-stone-950 border border-stone-800 p-3 rounded relative group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-stone-300">{enemy.name}</span>
                            <button onClick={() => setActiveEnemies(prev => prev.filter(e => e.instanceId !== enemy.instanceId))} className="text-stone-600 hover:text-red-500">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {/* HP Control */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                                <div
                                    className="h-full bg-red-700 transition-all"
                                    style={{ width: `${(enemy.currentHp / enemy.hp) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-mono text-stone-400 w-12 text-right">{enemy.currentHp}/{enemy.hp}</span>
                        </div>
                        <div className="flex justify-end gap-1 mb-3">
                            <button onClick={() => damageEnemy(enemy.instanceId, 1)} className="px-2 bg-stone-900 border border-stone-700 text-red-500 text-xs font-bold hover:bg-red-900">-1</button>
                            <button onClick={() => damageEnemy(enemy.instanceId, 2)} className="px-2 bg-stone-900 border border-stone-700 text-red-500 text-xs font-bold hover:bg-red-900">-2</button>
                            <button onClick={() => damageEnemy(enemy.instanceId, 5)} className="px-2 bg-stone-900 border border-stone-700 text-red-500 text-xs font-bold hover:bg-red-900">-5</button>
                        </div>

                        {/* Ataques */}
                        <div className="grid grid-cols-1 gap-1">
                            {enemy.attacks.map((atk, i) => (
                                <button
                                    key={i}
                                    onClick={() => gmRoll(2, enemy.orbit, `${enemy.name}: ${atk.name}`)}
                                    className="text-left text-xs bg-stone-900/50 hover:bg-rust hover:text-white p-2 border border-stone-800 flex justify-between items-center transition-colors"
                                >
                                    <span className="flex items-center gap-2"><Sword size={12} /> {atk.name}</span>
                                    <span className="font-bold">{atk.damage} Dano</span>
                                </button>
                            ))}
                        </div>

                        {enemy.passive && (
                            <div className="mt-2 text-[10px] text-stone-500 italic border-t border-stone-800 pt-1">
                                <Shield size={10} className="inline mr-1" /> {enemy.passive}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div >
    );
};
