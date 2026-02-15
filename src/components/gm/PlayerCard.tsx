import React from 'react';
import { User, Heart, Zap, ChevronRight, Ghost } from 'lucide-react';
import { CharacterData } from '@/types/index';
import { ARCHETYPES } from '@/constants';

interface PlayerCardProps {
    player: {
        id: string;
        player_name?: string;
        character_data: CharacterData;
    };
    isSelected: boolean;
    onSelect: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isSelected, onSelect }) => {
    const char = player.character_data;
    const arch = ARCHETYPES.find(a => a.id === char.archetypeId);
    const isCritical = char.orbit >= 8;
    const isDying = char.currentHp === 0;

    return (
        <div
            onClick={onSelect}
            className={`relative p-5 border rounded-sm cursor-pointer transition-all duration-300 group overflow-hidden ${isSelected
                ? 'bg-stone-900 border-gold shadow-[0_0_15px_rgba(161,98,7,0.1)]'
                : 'bg-stone-950 border-stone-800 hover:border-stone-600'
                }`}
        >
            {/* Alerta Visual de Perigo */}
            {isCritical && <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-900/40 via-transparent to-transparent pointer-events-none" />}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    {/* Avatar Pequeno */}
                    <div className="w-10 h-10 rounded-sm overflow-hidden bg-stone-800 border border-stone-700 shrink-0">
                        {char.imageUrl ? (
                            <img src={char.imageUrl} className="w-full h-full object-cover" alt={char.name} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="text-stone-600" size={20} />
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className={`font-serif text-lg leading-none ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                            {char.name || player.player_name || 'Desconhecido'}
                        </h3>
                        <div className="text-[10px] uppercase tracking-widest opacity-70 flex items-center gap-2">
                            {arch && <span>{arch.name}</span>}
                            {char.orbit >= 5 && <span className="text-purple-400 font-bold">• SINTOMÁTICO</span>}
                        </div>
                    </div>
                </div>
                {/* Indicador de Seleção */}
                {isSelected && <ChevronRight className="text-gold animate-pulse" />}
            </div>

            {/* Barras de Status */}
            <div className="space-y-3 relative z-10">
                {/* Vida */}
                <div className="group/hp">
                    <div className="flex justify-between text-[10px] uppercase text-stone-500 mb-1 font-bold">
                        <span className="flex items-center gap-1"><Heart size={10} /> Vitalidade</span>
                        <span className={isDying ? 'text-red-500 animate-pulse' : ''}>{char.currentHp} / {char.maxHp}</span>
                    </div>
                    <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                        <div
                            className={`h-full transition-all duration-500 ${isDying ? 'bg-red-600' : 'bg-stone-400'}`}
                            style={{ width: `${(char.currentHp / char.maxHp) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Órbita */}
                <div>
                    <div className="flex justify-between text-[10px] uppercase text-stone-500 mb-1 font-bold">
                        <span className="flex items-center gap-1"><Zap size={10} /> Órbita</span>
                        <span className={isCritical ? 'text-gold' : ''}>{char.orbit} / 10</span>
                    </div>
                    <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                        <div
                            className={`h-full transition-all duration-500 ${isCritical ? 'bg-gold animate-pulse' : 'bg-rust'}`}
                            style={{ width: `${(char.orbit / 10) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Inventário Resumido (Só o topo) */}
            <div className="mt-4 pt-3 border-t border-stone-800/50 flex gap-2 text-[9px] text-stone-600 font-mono">
                <span className="truncate max-w-[200px]">
                    {char.beltPouch?.find(i => i.id === 'lead')?.quantity || 0} Chumbos • {char.beltPouch?.find(i => i.id === 'serum')?.quantity || 0} Soros • {char.beltPouch?.find(i => i.id === 'ration')?.quantity || 0} Rações • {char.beltPouch?.find(i => i.id === 'poppy')?.quantity || 0} Papoilas • {char.beltPouch?.find(i => i.id === 'salts')?.quantity || 0} Sais
                </span>
            </div>
        </div>
    );
};
