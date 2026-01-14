import React from 'react';
import { useCharacter } from '@/contexts/CharacterContext';

export const SaveIndicator: React.FC = () => {
    const { saveStatus } = useCharacter();

    if (saveStatus === 'saved') return <span className="text-green-900 text-[10px] font-mono">● Sincronizado</span>;
    if (saveStatus === 'saving') return <span className="text-yellow-600 text-[10px] font-mono animate-pulse">● Salvando...</span>;
    return <span className="text-red-500 text-[10px] font-bold font-mono">● ERRO DE SINCRONIA</span>;
};
