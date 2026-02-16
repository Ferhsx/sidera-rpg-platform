import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export interface Campaign {
    id: string;
    gm_user_id: string;
    campaign_name: string;
    description?: string;
    status: 'active' | 'paused' | 'archived';
    code: string;
    session_number: number;
    created_at: string;
    last_session_at?: string;
    player_count?: number; // Computed from join
}

export interface CampaignWithPlayers extends Campaign {
    players: Array<{
        id: string;
        player_name: string;
        character_name: string;
        last_seen: string;
    }>;
}

export class CampaignService {
    /**
     * List all campaigns for a specific GM
     */
    static async listByGM(gmUserId: string): Promise<Campaign[]> {
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select(`
                    id,
                    gm_user_id,
                    campaign_name,
                    description,
                    status,
                    code,
                    session_number,
                    created_at,
                    last_session_at
                `)
                .eq('gm_user_id', gmUserId)
                .neq('status', 'archived')
                .order('last_session_at', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Count players for each campaign
            const campaignsWithCount = await Promise.all(
                (data || []).map(async (campaign) => {
                    const { count } = await supabase
                        .from('characters')
                        .select('*', { count: 'exact', head: true })
                        .eq('room_id', campaign.id);

                    return {
                        ...campaign,
                        player_count: count || 0
                    } as Campaign;
                })
            );

            return campaignsWithCount;
        } catch (error: any) {
            toast.error('Erro ao carregar campanhas');
            throw error;
        }
    }

    /**
     * Create a new campaign
     */
    static async create(gmUserId: string, name: string, description?: string): Promise<Campaign> {
        try {
            // Generate unique campaign code
            const code = `SIDERA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            const { data, error } = await supabase
                .from('rooms')
                .insert([{
                    gm_user_id: gmUserId,
                    campaign_name: name,
                    description: description || null,
                    code: code,
                    status: 'paused', // Start paused, GM must activate first session
                    session_number: 0,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success(`Campanha "${name}" criada!`, { icon: '🎲' });
            return { ...data, player_count: 0 } as Campaign;
        } catch (error: any) {
            toast.error('Erro ao criar campanha');
            throw error;
        }
    }

    /**
     * Update campaign metadata (name, description)
     */
    static async update(campaignId: string, updates: Partial<Pick<Campaign, 'campaign_name' | 'description'>>): Promise<void> {
        try {
            const { error } = await supabase
                .from('rooms')
                .update(updates)
                .eq('id', campaignId);

            if (error) throw error;

            toast.success('Campanha atualizada');
        } catch (error: any) {
            toast.error('Erro ao atualizar campanha');
            throw error;
        }
    }

    /**
     * Activate a session (generate code if needed, set status to active)
     */
    static async activateSession(campaignId: string): Promise<{ code: string; roomId: string }> {
        try {
            // Get current campaign state
            const { data: campaign, error: fetchError } = await supabase
                .from('rooms')
                .select('code, session_number, status')
                .eq('id', campaignId)
                .single();

            if (fetchError) throw fetchError;

            // Generate new code for new session
            const newCode = `SIDERA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const newSessionNumber = (campaign.session_number || 0) + 1;

            const { error: updateError } = await supabase
                .from('rooms')
                .update({
                    code: newCode,
                    status: 'active',
                    session_number: newSessionNumber,
                    last_session_at: new Date().toISOString()
                })
                .eq('id', campaignId);

            if (updateError) throw updateError;

            toast.success(`Sessão #${newSessionNumber} ativada!`, { icon: '🎮' });
            return { code: newCode, roomId: campaignId };
        } catch (error: any) {
            toast.error('Erro ao ativar sessão');
            throw error;
        }
    }

    /**
     * Pause campaign (invalidate code, prevent new joins)
     */
    static async pause(campaignId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('rooms')
                .update({ status: 'paused' })
                .eq('id', campaignId);

            if (error) throw error;

            toast.success('Campanha pausada', { icon: '⏸️' });
        } catch (error: any) {
            toast.error('Erro ao pausar campanha');
            throw error;
        }
    }

    /**
     * Archive campaign (soft delete)
     */
    static async archive(campaignId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('rooms')
                .update({ status: 'archived' })
                .eq('id', campaignId);

            if (error) throw error;

            toast.success('Campanha arquivada', { icon: '📦' });
        } catch (error: any) {
            toast.error('Erro ao arquivar campanha');
            throw error;
        }
    }

    /**
     * Get full campaign details including player list
     */
    static async getDetails(campaignId: string): Promise<CampaignWithPlayers> {
        try {
            // Fetch campaign data
            const { data: campaign, error: campaignError } = await supabase
                .from('rooms')
                .select('*')
                .eq('id', campaignId)
                .single();

            if (campaignError) throw campaignError;

            // Fetch players in this campaign
            const { data: characters, error: charactersError } = await supabase
                .from('characters')
                .select('id, player_name, character_data, updated_at')
                .eq('room_id', campaignId);

            if (charactersError) throw charactersError;

            const players = (characters || []).map(char => ({
                id: char.id,
                player_name: char.player_name,
                character_name: char.character_data?.name || 'Sem Nome',
                last_seen: char.updated_at
            }));

            return {
                ...campaign,
                players,
                player_count: players.length
            } as CampaignWithPlayers;
        } catch (error: any) {
            toast.error('Erro ao carregar detalhes da campanha');
            throw error;
        }
    }
}
