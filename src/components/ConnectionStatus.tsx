import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const ConnectionStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [dbConnected, setDbConnected] = useState(true);

    useEffect(() => {
        // 1. Monitorar a Internet do Navegador
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // 2. Monitorar a Conexão com o Supabase (Heartbeat)
        const channel = supabase.channel('ping')
            .on('system', { event: 'pong' }, () => setDbConnected(true))
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setDbConnected(true);
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    setDbConnected(false);
                }
            });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            supabase.removeChannel(channel);
        };
    }, []);

    if (isOnline && dbConnected) return null; // Tudo certo, fica invisível

    return (
        <div className="fixed top-0 left-0 w-full z-[100] bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-lg animate-in slide-in-from-top">
            <WifiOff size={18} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">
                {!isOnline ? "Conexão de Internet Perdida" : "Desconectado do Servidor"}
            </span>
            <span className="text-[10px] opacity-80 border-l border-white/30 pl-3">
                Não recarregue a página. Tentando reconectar...
            </span>
            <RefreshCw size={14} className="animate-spin opacity-50" />
        </div>
    );
};
