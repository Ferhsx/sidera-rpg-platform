import { supabase } from './supabase';

export type LogType = 'roll' | 'combat' | 'item' | 'alert';

export const logEvent = async (
    roomId: string,
    playerName: string,
    message: string,
    type: LogType
) => {
    if (!roomId) return;

    try {
        const { error } = await supabase
            .from('game_logs')
            .insert({
                room_id: roomId,
                player_name: playerName,
                message,
                type
            });

        if (error) {
            console.error('Error logging event:', error);
        }
    } catch (err) {
        console.error('Failed to log event:', err);
    }
};
