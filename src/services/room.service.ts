import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export class RoomService {
    /**
     * Creates a new room and returns its code
     */
    static async create() {
        try {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { data, error } = await supabase
                .from('rooms')
                .insert([{ code, created_at: new Date(), is_active: true }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('RoomService.create error:', error);
            toast.error('Erro ao criar sala');
            throw error;
        }
    }

    /**
     * Joins an existing room by code
     */
    static async join(code: string) {
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('code', code.toUpperCase())
                .single();

            if (error) throw error;
            if (!data) throw new Error('Sala não encontrada');

            return data;
        } catch (error: any) {
            console.error('RoomService.join error:', error);
            toast.error('Sala não encontrada ou erro de conexão');
            throw error;
        }
    }
}
