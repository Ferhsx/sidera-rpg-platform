import { supabase } from '@/lib/supabase';
import { CharacterData, LootItem } from '@/types/index'; // Assuming LootItem is in types, if not I might need to import from constants/loot or move it
import { PartialCharacterDataSchema, ConditionSchema } from '@/schemas/character.schema';
import { toast } from 'react-hot-toast';

export class CharacterService {
    /**
     * Updates character data with validation
     */
    /**
     * Updates character data safely (fetches current, merges, saves)
     */
    static async update(characterId: string, updates: Partial<CharacterData>) {
        try {
            // 1. Fetch current data
            const { data: current, error: fetchError } = await supabase
                .from('characters')
                .select('character_data')
                .eq('id', characterId)
                .single();

            if (fetchError || !current) throw new Error('Personagem não encontrado para atualização.');

            const currentData = current.character_data as CharacterData;

            // 2. Merge updates
            const mergedData = { ...currentData, ...updates };

            // 3. Validate (Optional, can be partial check or full check)
            // CharacterDataSchema.parse(mergedData); 

            // 4. Save
            return await this.save(characterId, mergedData);

        } catch (error: any) {
            toast.error('Erro ao atualizar personagem');
            throw error;
        }
    }

    /**
     * Fetches all characters in a room
     */
    static async getByRoomId(roomId: string) {
        try {
            const { data, error } = await supabase
                .from('characters')
                .select('*')
                .eq('room_id', roomId);

            if (error) throw error;
            return data || [];
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Syncs the full character state to the database
     */
    static async save(characterId: string, character: CharacterData) {
        try {
            // We can validate the full object here
            // CharacterDataSchema.parse(character); // Optional: strictly validate before save

            const { error } = await supabase
                .from('characters')
                .update({
                    character_data: character,
                    updated_at: new Date()
                })
                .eq('id', characterId);

            if (error) throw error;
            return true;
        } catch (error: any) {
            // toast.error('Erro de sincronização'); // Might be too noisy for auto-save
            throw error;
        }
    }

    /**
     * Removes a character from a room (sets room_id to null)
     */
    static async leaveRoom(characterId: string) {
        try {
            const { error } = await supabase
                .from('characters')
                .update({ room_id: null })
                .eq('id', characterId);

            if (error) throw error;
            return true;
        } catch (error: any) {
            toast.error('Erro ao sair da sala');
            throw error;
        }
    }

    /**
     * Deletes a character permanently
     */
    static async delete(characterId: string) {
        try {
            const { error } = await supabase
                .from('characters')
                .delete()
                .eq('id', characterId);

            if (error) throw error;
            return true;
        } catch (error: any) {
            toast.error('Erro ao excluir personagem');
            throw error;
        }
    }

    // ... Specific logic methods if we want to move logic out of Context ...
    // For now, the Context handles the Logic (modifying state) and calls Save. 
    // Moving logic (like "take damage") to Service implies the Service calculates the new state.
    // Stateless service approach:

    static async adjustHp(characterId: string, currentCharacter: CharacterData, amount: number) {
        const newHp = Math.min(currentCharacter.maxHp, Math.max(0, currentCharacter.currentHp + amount));

        // Auto-update status based on HP logic (this reproduces logic from Context/Components)
        let updates: Partial<CharacterData> = { currentHp: newHp };

        if (newHp > 0 && (currentCharacter.deathFailures > 0 || currentCharacter.isStabilized)) {
            updates.deathFailures = 0;
            updates.isStabilized = false;
        }

        const merged = { ...currentCharacter, ...updates };
        await this.save(characterId, merged);
        return merged;
    }
}
