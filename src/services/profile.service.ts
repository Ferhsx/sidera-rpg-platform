import { CharacterData } from '@/types/index';
import { supabase } from '@/lib/supabase';

export interface CharacterProfile {
    id: string; // UUID (cloud) or local_timestamp (local)
    name: string;
    archetypeId: string;
    level: number;
    lastPlayed: number;
    isCloud?: boolean;
}

const PROFILE_KEY = 'sidera_profiles';

export class ProfileService {

    /**
     * Lists profiles. 
     * If user is authenticated, merges cloud profiles with local ones (or prefers cloud).
     * Since this needs to be async now to fetch from DB, we update the signature.
     */
    static async list(userId?: string): Promise<CharacterProfile[]> {
        let profiles: CharacterProfile[] = [];

        // 1. Load Local Profiles
        try {
            const stored = localStorage.getItem(PROFILE_KEY);
            if (stored) {
                profiles = JSON.parse(stored).map((p: any) => ({ ...p, isCloud: false }));
            }
        } catch (e) {
        }

        // 2. Load Cloud Profiles if Logged In
        if (userId) {
            try {
                const { data, error } = await supabase
                    .from('characters')
                    .select('id, player_name, character_data, updated_at')
                    .eq('user_id', userId);

                if (!error && data) {
                    const cloudProfiles: CharacterProfile[] = data.map(row => {
                        const charData = row.character_data as CharacterData;
                        return {
                            id: row.id,
                            name: row.player_name || charData.name || 'Sem Nome',
                            archetypeId: charData.archetypeId,
                            level: charData.orbit,
                            lastPlayed: new Date(row.updated_at).getTime(),
                            isCloud: true
                        };
                    });

                    // Merge strategies: Show both? Or Cloud replaces Local?
                    // Let's show all for now, maybe grouping them in UI.
                    profiles = [...profiles, ...cloudProfiles];
                }
            } catch (e) {
            }
        }

        return profiles;
    }

    /**
     * Saves a character.
     * If userId is provided, saves to Cloud (Supabase).
     * If not, saves to LocalStorage.
     */
    static async save(character: CharacterData & { id?: string }, userId?: string) {
        // ID Generation / Handling
        let charId = character.id;

        // If we are logged in, we prefer saving to Cloud
        if (userId) {
            // New Cloud Character?
            if (!charId || charId.startsWith('local_')) {
                // If it was local, we are now "Migrating" or Creating new in Cloud.
                // For now, let's treat as Create New in Cloud.
                // We let Supabase generate UUID or we generate one.
                // Let's Insert.

                // If it was a 'local_' id, we technically are creating a COPY in the cloud.
                // The local one remains describing a "Local Backup".

                const { data, error } = await supabase
                    .from('characters')
                    .insert([{
                        user_id: userId,
                        player_name: character.name,
                        character_data: character,
                        room_id: null // Not in a room yet, just in library
                    }])
                    .select('id')
                    .single();

                if (error || !data) throw error;
                charId = data.id; // New UUID
            } else {
                // Update Existing Cloud Character
                await supabase
                    .from('characters')
                    .update({
                        player_name: character.name,
                        character_data: character,
                        updated_at: new Date()
                    })
                    .eq('id', charId)
                    .eq('user_id', userId);
            }

            // Should we also update local cache? Optional but good for offline support later.
            return charId;

        } else {
            // --- LOCAL STORAGE LOGIC (Legacy/Offline) ---
            if (!charId) charId = `local_${Date.now()}`;

            const profiles = this.listSync(); // Internal sync usage
            const profile: CharacterProfile = {
                id: charId,
                name: character.name || 'Desconhecido',
                archetypeId: character.archetypeId,
                level: character.orbit,
                lastPlayed: Date.now(),
                isCloud: false
            };

            const existingIndex = profiles.findIndex(p => p.id === charId);
            if (existingIndex >= 0) profiles[existingIndex] = profile;
            else profiles.push(profile);

            localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
            localStorage.setItem(`sidera_char_${charId}`, JSON.stringify(character));
            return charId;
        }
    }

    // Helper for sync calls (legacy/internal)
    private static listSync(): CharacterProfile[] {
        try {
            const stored = localStorage.getItem(PROFILE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) { return []; }
    }

    /**
     * Loads a full character data.
     */
    static async load(profileId: string): Promise<CharacterData | null> {
        // 1. Try Local First (Fast)
        const local = localStorage.getItem(`sidera_char_${profileId}`);
        if (local) return JSON.parse(local);

        // 2. Try Cloud (If it looks like a UUID)
        if (!profileId.startsWith('local_')) {
            const { data } = await supabase
                .from('characters')
                .select('character_data')
                .eq('id', profileId)
                .single();

            if (data) return data.character_data as CharacterData;
        }

        return null;
    }

    static async delete(profileId: string) {
        if (profileId.startsWith('local_')) {
            const profiles = this.listSync().filter(p => p.id !== profileId);
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
            localStorage.removeItem(`sidera_char_${profileId}`);
        } else {
            await supabase.from('characters').delete().eq('id', profileId);
        }
    }
}
