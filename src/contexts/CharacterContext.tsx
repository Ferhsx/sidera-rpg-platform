import React, { createContext, useContext, useState, useEffect } from 'react';
import { CharacterData, Condition } from '@/types/index';
import { ARCHETYPES } from '@/constants';
import { playSound } from '@/hooks/useAudio';
import { supabase } from '@/lib/supabase';
import { CharacterService } from '@/services/character.service';

// Default initial state
const INITIAL_CHARACTER: CharacterData = {
    name: '',
    background: '',
    archetypeId: '',
    attributes: { ferro: 0, mercurio: 0, enxofre: 0, sal: 0 },
    currentHp: 10,
    maxHp: 10,
    orbit: 0,
    deathFailures: 0,
    isStabilized: false,
    pendingScar: false,
    scars: [],
    armorRating: 0,
    armorName: 'Roupas',
    silver: 0,
    inventorySlots: [],
    notes: '',
    arsenal: [],
    conditions: [],
    beltPouch: [
        { id: 'lead', name: 'Chumbo Líquido', quantity: 1 },
        { id: 'serum', name: 'Soro Estelar', quantity: 0 },
        { id: 'ration', name: 'Ração de Viagem', quantity: 3 },
        { id: 'poppy', name: 'Papoila Branca', quantity: 0 },
        { id: 'salts', name: 'Sais de Cheiro', quantity: 0 }
    ],
    wizardCompleted: false,
    customAbilities: []
};

interface CharacterContextType {
    character: CharacterData;
    updateCharacter: (updates: Partial<CharacterData>) => void;
    resetCharacter: () => void;
    advanceRound: () => void;
    addCondition: (condition: Condition) => void;
    consumeItem: (itemId: string) => boolean;
    playSound: (soundName: string, volume?: number) => void;
    isLoading: boolean;
    setDbInfo: (roomId: string, charId: string | null) => void;
    dbInfo: { roomId: string | null, charId: string | null };
    saveStatus: 'saved' | 'saving' | 'error';
    leaveRoom: () => void;
    view: 'lobby' | 'sheet' | 'gm';
    setView: (view: 'lobby' | 'sheet' | 'gm') => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [character, setCharacter] = useState<CharacterData>(INITIAL_CHARACTER);
    const [isLoading, setIsLoading] = useState(true);
    const [dbInfo, setDbInfoState] = useState<{ roomId: string | null, charId: string | null }>(() => {
        const saved = sessionStorage.getItem('sidera_session');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return { roomId: null, charId: null };
            }
        }
        return { roomId: null, charId: null };
    });

    const [view, setViewState] = useState<'lobby' | 'sheet' | 'gm'>(() => {
        const saved = sessionStorage.getItem('sidera_session');
        if (saved) {
            try {
                const { charId } = JSON.parse(saved);
                return charId ? 'sheet' : 'gm';
            } catch (e) {
                return 'lobby';
            }
        }
        return 'lobby';
    });

    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

    const setView = (v: 'lobby' | 'sheet' | 'gm') => {
        setViewState(v);
    };

    const setDbInfo = (roomId: string, charId: string | null) => {
        const info = { roomId, charId };
        setDbInfoState(info);
        sessionStorage.setItem('sidera_session', JSON.stringify(info));
    };

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('sidera_character');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure array fields exist even in old saves
                setCharacter({
                    ...INITIAL_CHARACTER,
                    ...parsed,
                    conditions: parsed.conditions || [],
                    beltPouch: INITIAL_CHARACTER.beltPouch.map(initialItem => {
                        const savedItem = (parsed.beltPouch || []).find((p: any) => p.id === initialItem.id);
                        return savedItem ? savedItem : initialItem;
                    }),
                    arsenal: parsed.arsenal || []
                });
            } catch (e) {
                console.error("Failed to load character", e);
            }
        }
        setIsLoading(false);
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('sidera_character', JSON.stringify(character));
        }
    }, [character, isLoading]);

    // Async Sync with Database
    useEffect(() => {
        if (!isLoading && dbInfo.charId) {
            setSaveStatus('saving');
            const timer = setTimeout(async () => {
                try {
                    await CharacterService.save(dbInfo.charId!, character);
                    setSaveStatus('saved');
                } catch (error) {
                    setSaveStatus('error');
                }
            }, 1000); // Debounce de 1s

            return () => clearTimeout(timer);
        }
    }, [character, dbInfo.charId, isLoading]);

    // Realtime Listener for remote changes (GM Interventions)
    useEffect(() => {
        if (dbInfo.charId) {
            const channel = supabase
                .channel(`char-remote-sync:${dbInfo.charId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'characters',
                        filter: `id=eq.${dbInfo.charId}`
                    },
                    (payload) => {
                        const remoteData = payload.new.character_data as CharacterData;

                        // LÓGICA DE CONFLITO:
                        // Se recebermos um update, atualizamos o estado local para bater com o servidor.
                        setCharacter(current => {
                            // Compara JSONs para evitar re-render desnecessário e loops
                            if (JSON.stringify(current) === JSON.stringify(remoteData)) {
                                return current;
                            }
                            // console.log("Sincronizado com intervenção externa.");
                            return remoteData;
                        });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [dbInfo.charId]);

    // Derived Stat Calculation (MaxHP) - centralized here
    useEffect(() => {
        const archetype = ARCHETYPES.find(a => a.id === character.archetypeId);
        const bonus = archetype ? archetype.bonusHp : 0;
        const calculatedMaxHp = 10 + character.attributes.ferro + bonus;

        if (calculatedMaxHp !== character.maxHp) {
            setCharacter(prev => ({
                ...prev,
                maxHp: calculatedMaxHp,
                currentHp: Math.min(prev.currentHp, calculatedMaxHp)
            }));
        }

        // Reset Death State if HP > 0
        if (character.currentHp > 0 && (character.deathFailures > 0 || character.isStabilized)) {
            setCharacter(prev => ({
                ...prev,
                deathFailures: 0,
                isStabilized: false
            }));
        }
    }, [character.attributes.ferro, character.archetypeId, character.currentHp, character.deathFailures, character.isStabilized]);

    const updateCharacter = (updates: Partial<CharacterData>) => {
        setCharacter(prev => ({ ...prev, ...updates }));
    };

    const resetCharacter = async () => {
        // Deletar do banco se estiver em uma sala
        if (dbInfo.charId) {
            await CharacterService.delete(dbInfo.charId);
        }

        setCharacter(INITIAL_CHARACTER);
        localStorage.removeItem('sidera_character');
        setDbInfoState({ roomId: null, charId: null });
        sessionStorage.removeItem('sidera_session');
        setViewState('lobby');
    };

    const advanceRound = () => {
        setCharacter(prev => {
            const updatedConditions = (prev.conditions || [])
                .map(c => c.durationInRounds !== undefined
                    ? { ...c, durationInRounds: c.durationInRounds - 1 }
                    : c
                )
                .filter(c => c.durationInRounds === undefined || c.durationInRounds > 0);

            return { ...prev, conditions: updatedConditions };
        });
    };

    const addCondition = (condition: Condition) => {
        setCharacter(prev => ({
            ...prev,
            conditions: [...(prev.conditions || []), condition]
        }));
    };



    const consumeItem = (itemId: string): boolean => {
        let success = false;
        const newPouch = (character.beltPouch || []).map(item => {
            if (item.id === itemId && item.quantity > 0) {
                success = true;
                return { ...item, quantity: item.quantity - 1 };
            }
            return item;
        });

        if (success) {
            setCharacter(prev => ({ ...prev, beltPouch: newPouch }));
        }
        return success;
    };

    const leaveRoom = async () => {
        // 1. Se for jogador, desvincular no banco
        if (dbInfo.charId) {
            await CharacterService.leaveRoom(dbInfo.charId);
        }

        // 2. Limpar estado local
        setDbInfoState({ roomId: null, charId: null });
        setViewState('lobby');
        sessionStorage.removeItem('sidera_session');
        localStorage.removeItem('sidera_room_code'); // Limpa código de sala do GM

        console.log("🚶 Desconectado da sala.");
    };

    return (
        <CharacterContext.Provider value={{
            character,
            updateCharacter,
            resetCharacter,
            advanceRound,
            addCondition,
            consumeItem,
            playSound,
            isLoading,
            setDbInfo,
            dbInfo,
            saveStatus,
            leaveRoom,
            view,
            setView
        }}>
            {children}
        </CharacterContext.Provider>
    );
};

export const useCharacter = () => {
    const context = useContext(CharacterContext);
    if (context === undefined) {
        throw new Error('useCharacter must be used within a CharacterProvider');
    }
    return context;
};
