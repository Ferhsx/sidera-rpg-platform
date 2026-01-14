import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { CharacterData, CustomAbility } from '@/types';
import { LootItem } from '@/constants/loot';

// O formato que vem do Banco de Dados
interface DBCharacter {
    id: string;
    player_name: string;
    character_data: CharacterData;
    room_id: string;
}

export const useGMRealtime = () => {
    const [players, setPlayers] = useState<DBCharacter[]>([]);
    const [roomCode, setRoomCode] = useState<string>('');
    const [roomId, setRoomId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const channelVisuals = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const channelWhispers = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const channelLoot = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const trackingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const sendBroadcast = async (event: string, payload: any) => {
        let channel = null;
        if (event === 'show_image') channel = channelVisuals.current;
        else if (event === 'whisper') channel = channelWhispers.current;
        else if (event === 'loot_alert') channel = channelLoot.current;

        if (!channel || !roomId) {
            console.error(`Broadcast falhou: Canal para ${event} não inicializado.`);
            return;
        }
        // console.log(`Enviando Realtime [${event}] via ${channel.topic}:`, payload);
        await channel.send({
            type: 'broadcast',
            event,
            payload
        });
    };

    const refreshPlayers = async () => {
        if (!roomId) return;
        setLoading(true);
        const { data: chars } = await supabase
            .from('characters')
            .select('*')
            .eq('room_id', roomId);

        if (chars) {
            setPlayers(chars as DBCharacter[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        const init = async () => {
            // 1. Recuperar o ID da sala salvo no LocalStorage
            const storedCode = localStorage.getItem('sidera_room_code');
            if (!storedCode) {
                setLoading(false);
                return;
            }
            setRoomCode(storedCode);

            // A. Pegar o ID da sala
            const { data: room } = await supabase
                .from('rooms')
                .select('id')
                .eq('code', storedCode)
                .single();

            if (!room) {
                setLoading(false);
                return;
            }

            const rId = room.id;
            setRoomId(rId);

            // B. Buscar estado inicial
            const { data: initialChars } = await supabase
                .from('characters')
                .select('*')
                .eq('room_id', rId);

            if (initialChars) {
                setPlayers(initialChars as DBCharacter[]);
            }
            setLoading(false);

            // C. Abrir canais Realtime isolados
            channelVisuals.current = supabase.channel(`room-visuals:${rId}`).subscribe();
            channelWhispers.current = supabase.channel(`room-whispers:${rId}`).subscribe();
            channelLoot.current = supabase.channel(`room-loot:${rId}`).subscribe();

            // Canal de tracking (ainda necessário para presença e updates)
            trackingChannelRef.current = supabase
                .channel(`room-tracking:${rId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'characters',
                        filter: `room_id=eq.${rId}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setPlayers(prev => [...prev, payload.new as DBCharacter]);
                        }
                        else if (payload.eventType === 'UPDATE') {
                            setPlayers(prev =>
                                prev.map(p => p.id === payload.new.id ? payload.new as DBCharacter : p)
                            );
                        }
                        else if (payload.eventType === 'DELETE') {
                            setPlayers(prev => prev.filter(p => p.id !== (payload.old as any).id));
                        }
                    }
                ).subscribe();
        };

        init();

        return () => {
            if (channelVisuals.current) supabase.removeChannel(channelVisuals.current);
            if (channelWhispers.current) supabase.removeChannel(channelWhispers.current);
            if (channelLoot.current) supabase.removeChannel(channelLoot.current);
            if (trackingChannelRef.current) supabase.removeChannel(trackingChannelRef.current);
        };
    }, []);

    // Função para o Mestre alterar dados do jogador (Punição Divina)
    const updatePlayer = async (playerId: string, newData: Partial<CharacterData>) => {
        // 1. Achar o jogador localmente para pegar os dados atuais
        const target = players.find(p => p.id === playerId);
        if (!target) return;

        // 2. Mesclar dados
        const updatedCharData = { ...target.character_data, ...newData };

        // 3. Enviar para o banco (isso vai disparar o evento realtime de volta para a UI)
        await supabase
            .from('characters')
            .update({ character_data: updatedCharData })
            .eq('id', playerId);
    };

    // Função para dar item (Loot Remoto)
    const giveLoot = async (playerId: string, item: LootItem) => {
        const target = players.find(p => p.id === playerId);
        if (!target || !roomId) return;

        const charData = { ...target.character_data };

        // Lógica de Distribuição
        if (item.type === 'weapon' && item.data) {
            // Adiciona ao Arsenal
            const newWeapon = {
                ...item.data,
                id: Date.now().toString(),
                status: 'ready',
                currentAmmo: item.data.maxAmmo
            };
            charData.arsenal = [...(charData.arsenal || []), newWeapon];
        }
        else if (item.type === 'consumable' && item.data) {
            // Soma na Belt Pouch
            charData.beltPouch = charData.beltPouch?.map(p =>
                p.id === item.data.targetId
                    ? { ...p, quantity: p.quantity + item.data.amount }
                    : p
            ) || [];
        }
        else {
            // Adiciona ao Inventário de Slots (Mochila)
            const newItemSlot = {
                name: item.name,
                description: item.description,
                weight: item.weight !== undefined ? item.weight : 1,
                isConsumed: false
            };
            charData.inventorySlots = [...(charData.inventorySlots || []), newItemSlot];
        }

        // 1. Atualizar Banco de Dados (Persistência)
        await supabase
            .from('characters')
            .update({ character_data: charData })
            .eq('id', playerId);

        // 2. Enviar Notificação Visual (Broadcast)
        await sendBroadcast('loot_alert', {
            targetId: playerId,
            itemName: item.name,
            description: item.description
        });

        // 3. Logar no Eco
        await supabase.from('game_logs').insert([{
            room_id: target.room_id,
            player_name: 'O MESTRE',
            message: `Concedeu ${item.name} para ${charData.name}`,
            type: 'item'
        }]);
    };

    const grantAbility = async (playerId: string, ability: Omit<CustomAbility, 'id'>) => {
        const target = players.find(p => p.id === playerId);
        if (!target) return;

        const charData = { ...target.character_data };

        const newAbil: CustomAbility = {
            ...ability,
            id: Date.now().toString()
        };

        const updatedAbilities = [...(charData.customAbilities || []), newAbil];

        // 1. Update DB (Realtime Sync will handle the rest)
        await supabase
            .from('characters')
            .update({ character_data: { ...charData, customAbilities: updatedAbilities } })
            .eq('id', playerId);

        // 2. Log no Eco
        await supabase.from('game_logs').insert([{
            room_id: target.room_id,
            player_name: 'O MESTRE',
            message: `Despertou nova Memória/Mutação em ${charData.name}: ${ability.name}`,
            type: 'alert'
        }]);
    };

    return { players, roomCode, roomId, loading, updatePlayer, giveLoot, grantAbility, refreshPlayers, sendBroadcast };
};
