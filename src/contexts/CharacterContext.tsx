import React, { createContext, useContext, useState, useEffect } from 'react';
import { CharacterData, Condition } from '@/types/index';
import { ARCHETYPES } from '@/constants';
import { playSound } from '@/hooks/useAudio';
import { supabase } from '@/lib/supabase';
import { CharacterService } from '@/services/character.service';
import { ProfileService } from '@/services/profile.service';

// Default initial state
export const INITIAL_CHARACTER: CharacterData = {
    name: '',
    background: '',
    backgroundId: '',
    backgroundSkills: [],
    archetypeId: '',
    astralPowerId: '',
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
    createNewCharacter: () => void;
    deleteCharacterProfile: (profileId: string) => void;
    switchCharacter: (profileId: string) => void;
    advanceRound: () => void;
    addCondition: (condition: Condition) => void;
    consumeItem: (itemId: string) => boolean;
    playSound: (soundName: string, volume?: number) => void;
    isLoading: boolean;
    setDbInfo: (roomId: string, charId: string | null) => void;
    dbInfo: { roomId: string | null, charId: string | null };
    saveStatus: 'saved' | 'saving' | 'error';
    leaveRoom: () => void;
    view: 'lobby' | 'sheet' | 'gm' | 'selection';
    setView: (view: 'lobby' | 'sheet' | 'gm' | 'selection') => void;
    pendingRoomCode: string | null;
    setPendingRoomCode: (code: string | null) => void;
    joinRoom: (roomCode: string, characterTemplate: CharacterData, existingCharacterId?: string) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

import { useAuth } from './AuthContext';

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth(); // Hook is safe here because AuthProvider wraps CharacterProvider
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

    const [view, setViewState] = useState<'lobby' | 'sheet' | 'gm' | 'selection'>(() => {
        const savedSession = sessionStorage.getItem('sidera_session');
        // If we have a session with a charId, check if we have that char loaded
        if (savedSession) {
            const { charId, roomId } = JSON.parse(savedSession);
            if (roomId && !charId) return 'gm'; // GM in room
            if (charId) return 'sheet'; // Player in room
        }

        // Default to selection if we have profiles, otherwise wizard (implemented in App logic via View)
        // Actually, let's default to 'lobby' which then routes to Selection if "Entrar" is clicked?
        // Or we can verify if 'sidera_character' exists.
        const savedChar = localStorage.getItem('sidera_character');
        if (savedChar) return 'sheet';

        return 'lobby';
    });

    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

    const [pendingRoomCode, setPendingRoomCode] = useState<string | null>(null);

    const setView = (v: 'lobby' | 'sheet' | 'gm' | 'selection') => {
        setViewState(v);
    };

    const setDbInfo = (roomId: string, charId: string | null) => {
        const info = { roomId, charId };
        setDbInfoState(info);
        sessionStorage.setItem('sidera_session', JSON.stringify(info));
    };

    const joinRoom = async (roomCode: string, characterTemplate: CharacterData, existingCharacterId?: string) => {
        setIsLoading(true);
        try {
            // 1. Find Room
            const { data: room, error: roomError } = await supabase
                .from('rooms')
                .select('id')
                .eq('code', roomCode.toUpperCase())
                .single();

            if (roomError || !room) throw new Error("Sala não encontrada.");

            let charId = existingCharacterId;

            // 2. Create or Update Character Instance
            if (charId && !charId.startsWith('local_')) {
                // UPDATE existing Cloud Character to be in this room
                const { error: updateError } = await supabase
                    .from('characters')
                    .update({
                        room_id: room.id,
                        character_data: characterTemplate, // Sync latest data just in case
                        updated_at: new Date()
                    })
                    .eq('id', charId);

                if (updateError) throw new Error("Erro ao entrar na sala: " + updateError.message);
            } else {
                // INSERT new Character (was local or is new)
                const { data: char, error: charError } = await supabase
                    .from('characters')
                    .insert([
                        {
                            room_id: room.id,
                            player_name: characterTemplate.name || 'Desconhecido',
                            character_data: characterTemplate,
                            user_id: user?.id // Link to user if logged in! Important!
                        }
                    ])
                    .select()
                    .single();

                if (charError) throw new Error("Erro ao criar vínculo: " + charError.message);
                charId = char.id;
            }

            // 3. Connect
            setDbInfo(room.id, charId);

            // 4. Update Local State (Inject ID)
            setCharacter({ ...characterTemplate, id: charId });

            // 5. Clear Pending & Move to Sheet
            setPendingRoomCode(null);
            setViewState('sheet');

        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('sidera_character');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
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
            }
        }
        setIsLoading(false);
    }, []);

    // Save to LocalStorage & ProfileService on change
    useEffect(() => {
        if (!isLoading) {
            // Save current state as "active character"
            localStorage.setItem('sidera_character', JSON.stringify(character));

            // Also update the Profile Index if wizard is completed
            if (character.wizardCompleted && character.name) {
                // We use dbInfo.charId if connected, otherwise we rely on ProfileService generation
                // But ProfileService needs an ID. 
                // If the character is NOT connected to DB, it might not have an ID in 'dbInfo'.
                // We should add an 'id' to CharacterData context? 
                // For now, ProfileService.save handles ID generation if needed, but we need to store it back?
                // Minimal Change: Just call save. The Service handles the index.
                // We pass dbInfo.charId if available to keep consistency.
                const idToUse = character.id || dbInfo.charId || undefined;

                // Get User ID from AuthContext? We don't have it here directly unless we inject it or use specific hook.
                // But we are inside CharacterProvider. Can we consume AuthContext?
                // Yes, but standard Hooks rules.

                // Hack: We can read Supabase Session directly or assume ProfileService handles it if we pass "current user".
                // Better: ProfileService can check `supabase.auth.getSession()` internals if we don't pass it?
                // Or we update CharacterProvider to consume UseAuth.

                // Let's assume ProfileService.save handles it if we don't pass, OR we modify CharacterProvider to use AuthContext.
                // Since I cannot change CharacterProvider signature easily without props...
                // Actually, I can use `useAuth` inside `CharacterProvider` as long as `AuthProvider` wraps it (which it does).

                // Let's proceed with just calling save() and fixing the `useAuth` injection next step if needed.
                // Or let ProfileService check auth state? No, Service is static.

                // Let's rely on a global way or just ignoring user_id here for a second and then fixing it.
                // Actually, let's fix CharacterContext to useAuth.

                // Reverting this thought: I should add useAuth() to CharacterProvider.

                // For now, keep as is, but I will modify CharacterProvider in next step.
                ProfileService.save({ ...character, id: idToUse }, user?.id);
            }
        }
    }, [character, isLoading, dbInfo.charId]);

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

    // Realtime Listener
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
                        setCharacter(current => {
                            if (JSON.stringify(current) === JSON.stringify(remoteData)) {
                                return current;
                            }
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

    // Derived Stats
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

        if (character.currentHp > 0 && (character.deathFailures > 0 || character.isStabilized)) {
            setCharacter(prev => ({ ...prev, deathFailures: 0, isStabilized: false }));
        }
    }, [character.attributes.ferro, character.archetypeId, character.currentHp, character.deathFailures, character.isStabilized]);

    const updateCharacter = (updates: Partial<CharacterData>) => {
        setCharacter(prev => ({ ...prev, ...updates }));
    };

    const createNewCharacter = async () => {
        // Warning: This clears current context. 
        if (dbInfo.charId) await leaveRoom();

        setCharacter(INITIAL_CHARACTER);
        localStorage.removeItem('sidera_character');
        sessionStorage.removeItem('sidera_session');
        setViewState('sheet'); // Will trigger Wizard
    };

    const resetCharacter = createNewCharacter;

    const switchCharacter = async (profileId: string) => {
        if (dbInfo.charId) await leaveRoom();

        const loaded = await ProfileService.load(profileId);
        if (loaded) {
            setCharacter(loaded);
            // Simulate as if we just loaded it
            localStorage.setItem('sidera_character', JSON.stringify(loaded));
            setViewState('sheet');
        } else {
        }
    };

    const deleteCharacterProfile = (profileId: string) => {
        ProfileService.delete(profileId);
        // If deleting current char?
        // Logic handled by caller usually
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
        if (dbInfo.charId) {
            await CharacterService.leaveRoom(dbInfo.charId);
        }
        setDbInfoState({ roomId: null, charId: null });
        sessionStorage.removeItem('sidera_session');
        localStorage.removeItem('sidera_room_code');

        // Go to selection instead of lobby when leaving room?
        // Or lobby. Let's keep lobby for now.
        setViewState('lobby');
    };

    return (
        <CharacterContext.Provider value={{
            character,
            updateCharacter,
            resetCharacter,
            createNewCharacter,
            switchCharacter,
            deleteCharacterProfile,
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
            setView,
            pendingRoomCode,
            setPendingRoomCode,
            joinRoom
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
