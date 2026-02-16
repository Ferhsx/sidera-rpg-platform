import React, { useState, useEffect } from 'react';
import CharacterSheet from '@/components/CharacterSheet';
import { Lobby } from '@/components/Lobby';
import GMDashboard from '@/components/GMDashboard';
import CharacterCreationWizard from '@/components/CharacterCreationWizard';
import { CharacterProvider, useCharacter } from '@/contexts/CharacterContext';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { VisualOverlay } from '@/components/VisualOverlay';
import { CharacterSelection } from '@/components/CharacterSelection';

const AppContent = () => {
  const { character, dbInfo, view, setView } = useCharacter();
  const [showWizard, setShowWizard] = useState(false);

  // Renderiza Monitor de Conexão no topo
  const StatusOverlay = () => <ConnectionStatus />;

  // Check if character is new/incomplete when in sheet view
  useEffect(() => {
    if (view === 'sheet' && !character.wizardCompleted) {
      setShowWizard(true);
    } else {
      setShowWizard(false);
    }
  }, [view, character.wizardCompleted]);

  // Listen for wizard completion
  useEffect(() => {
    const handleComplete = () => setShowWizard(false);
    window.addEventListener('wizard-complete', handleComplete);
    return () => window.removeEventListener('wizard-complete', handleComplete);
  }, []);

  // Voltar para o lobby se a sala for deixada
  useEffect(() => {
    if (!dbInfo.roomId && view !== 'lobby' && view !== 'selection') {
      setView('lobby');
    }
  }, [dbInfo.roomId, view]);

  if (view === 'lobby') {
    return <Lobby onJoin={() => setView('sheet')} onGM={() => setView('gm')} />;
  }

  if (view === 'selection') {
    return <CharacterSelection />;
  }

  if (view === 'gm') {
    return <GMDashboard />;
  }

  if (showWizard) {
    return <CharacterCreationWizard />;
  }

  // Se for 'sheet'
  return (
    <div className="min-h-screen bg-black text-stone-200 selection:bg-rust selection:text-white pb-20">
      <div className="max-w-screen-xl mx-auto">
        <CharacterSheet />
      </div>
    </div>
  );
};

import { AuthProvider } from '@/contexts/AuthContext';

// ... other imports

const App = () => {
  return (
    <AuthProvider>
      <CharacterProvider>
        <ConnectionStatus />
        <VisualOverlay />
        {/* Background Ambience */}
        <AppContent />
      </CharacterProvider>
    </AuthProvider>
  );
};

export default App;