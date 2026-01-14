import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Dices, Swords, AlertTriangle, Scroll, FlaskConical } from 'lucide-react';

interface GameLog {
    id: string;
    player_name: string;
    message: string;
    type: 'roll' | 'combat' | 'item' | 'alert';
    created_at: string;
}

interface GameLogsProps {
    roomId: string | null;
    height?: string;
}

export const GameLogs: React.FC<GameLogsProps> = ({ roomId, height = 'h-48' }) => {
    const [logs, setLogs] = useState<GameLog[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!roomId) return;

        // 1. Fetch recent logs
        const fetchLogs = async () => {
            const { data } = await supabase
                .from('game_logs')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) {
                setLogs(data.reverse() as GameLog[]);
            }
        };

        fetchLogs();

        // 2. Subscribe to new logs
        const channel = supabase
            .channel(`game-logs:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'game_logs',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    setLogs(prev => [...prev, payload.new as GameLog]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'roll': return <Dices size={12} className="text-gold" />;
            case 'combat': return <Swords size={12} className="text-red-500" />;
            case 'item': return <FlaskConical size={12} className="text-cyan-500" />;
            case 'alert': return <AlertTriangle size={12} className="text-rust" />;
            default: return <Scroll size={12} className="text-stone-500" />;
        }
    };

    return (
        <div className={`bg-stone-950 border border-stone-800 rounded flex flex-col ${height}`}>
            <div className="bg-stone-900/50 p-2 border-b border-stone-800 flex items-center gap-2">
                <Scroll size={14} className="text-stone-400" />
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Registros da Realidade</span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent"
            >
                {logs.length === 0 && (
                    <div className="text-center text-[10px] text-stone-700 italic py-4">
                        O silêncio reina... por enquanto.
                    </div>
                )}

                {logs.map(log => (
                    <div key={log.id} className="text-xs border-l-2 border-stone-800 pl-2 py-1 animate-in fade-in slide-in-from-left-2">
                        <div className="flex items-center gap-2 mb-0.5">
                            {getIcon(log.type)}
                            <span className="font-bold text-stone-400">{log.player_name}</span>
                            <span className="text-[9px] text-stone-600 ml-auto">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-stone-300 leading-tight pl-5 opacity-90 font-mono">
                            {log.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
