import React from 'react';
import { Scroll, Info, MessageSquare, Clock, Brain, GraduationCap } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { BACKGROUNDS } from '@/constants/backgrounds';

export const LoreTab: React.FC = () => {
    const { character, updateCharacter } = useCharacter();

    const selectedBackground = BACKGROUNDS.find(b => b.id === character.backgroundId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Left Column: Core Identity */}
            <div className="space-y-6">

                {/* Age & Knowledge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-stone-900/30 border border-stone-800 p-4 rounded-sm">
                        <label className="text-xs text-rust uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Clock size={12} /> Idade / Tempo
                        </label>
                        <input
                            type="text"
                            value={character.age || ''}
                            onChange={(e) => updateCharacter({ age: e.target.value })}
                            placeholder="Ex: 3 Ciclos"
                            className="bg-transparent border-b border-stone-700 w-full text-stone-300 focus:border-rust outline-none pb-1 font-serif text-sm"
                        />
                    </div>

                    <div className="bg-stone-900/30 border border-stone-800 p-4 rounded-sm h-full">
                        <label className="text-xs text-gold uppercase tracking-widest flex items-center gap-2 mb-2">
                            <GraduationCap size={12} /> Ofício: {character.background || 'Nenhum'}
                        </label>
                        <div className="text-[10px] text-stone-400 italic font-serif">
                            {selectedBackground?.description || "Sem registro de ofício."}
                        </div>
                    </div>
                </div>

                {/* Background Skills / Knowledge */}
                <div className="bg-stone-950/40 border border-stone-800 p-4 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Brain size={60} />
                    </div>

                    <label className="text-xs text-rust uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Brain size={14} /> Conhecimentos & Ofícios
                    </label>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {(character.backgroundSkills || []).length > 0 ? (
                            character.backgroundSkills.map((skill, idx) => (
                                <span key={idx} className="text-[10px] bg-stone-900 border border-stone-800 px-2 py-1 rounded-sm text-stone-300 font-mono shadow-sm">
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] text-stone-600 italic">Nenhum conhecimento registrado.</span>
                        )}
                    </div>

                    {/* Special Rules & Penalties */}
                    {(selectedBackground?.specialRule || selectedBackground?.penalty) && (
                        <div className="space-y-2 mt-4 pt-4 border-t border-stone-800/50">
                            {selectedBackground.specialRule && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-gold uppercase font-bold tracking-tighter">Vantagem / Regra:</span>
                                    <span className="text-[10px] text-stone-300 italic leading-tight">{selectedBackground.specialRule}</span>
                                </div>
                            )}
                            {selectedBackground.penalty && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-red-500 uppercase font-bold tracking-tighter">Penalidade / Fardo:</span>
                                    <span className="text-[10px] text-stone-400 italic leading-tight">{selectedBackground.penalty}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Appearance */}
                <div className="bg-stone-900/30 border border-stone-800 p-4 rounded-sm h-48 flex flex-col">
                    <label className="text-xs text-rust uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Info size={12} /> Aparência Física
                    </label>
                    <textarea
                        value={character.appearance || ''}
                        onChange={(e) => updateCharacter({ appearance: e.target.value })}
                        placeholder="Descreva cicatrizes, vestimentas, postura..."
                        className="bg-transparent w-full flex-1 text-sm text-stone-400 focus:outline-none resize-none italic leading-relaxed"
                    />
                </div>

                {/* Motivations */}
                <div className="bg-stone-900/30 border border-stone-800 p-4 rounded-sm h-48 flex flex-col">
                    <label className="text-xs text-rust uppercase tracking-widest flex items-center gap-2 mb-2">
                        <MessageSquare size={12} /> Motivações & Crenças
                    </label>
                    <textarea
                        value={character.motivations || ''}
                        onChange={(e) => updateCharacter({ motivations: e.target.value })}
                        placeholder="O que move seu personagem? O que ele teme?"
                        className="bg-transparent w-full flex-1 text-sm text-stone-400 focus:outline-none resize-none italic leading-relaxed"
                    />
                </div>
            </div>

            {/* Right Column: Full History */}
            <div className="h-full">
                <div className="bg-stone-900/30 border border-stone-800 p-6 rounded-sm h-full min-h-[500px] flex flex-col active-ring relative">
                    <label className="text-xs text-rust uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Scroll size={12} /> Arquivos de Memória (História)
                    </label>
                    <textarea
                        value={character.history || ''}
                        onChange={(e) => updateCharacter({ history: e.target.value })}
                        placeholder="Escreva a história do seu personagem aqui..."
                        className="bg-transparent w-full flex-1 text-base text-stone-300 focus:outline-none resize-none leading-relaxed font-serif scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent pr-4"
                    />

                    {/* Decorative Corner */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-stone-700 opacity-50" />
                </div>
            </div>
        </div>
    );
};
