import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Star, Dices, Swords, Volume2, VolumeX, Tent } from 'lucide-react';
import { ARCHETYPES } from '@/constants';
import { ASTRAL_POWERS } from '@/constants/astralPowers';
import { Attributes, Weapon } from '@/types/index';
import DiceRoller from './DiceRoller';
import OrbitWidget from './OrbitWidget';
import { VitalityBar } from './VitalityBar';
import { DeathSaveSection } from './DeathSaveSection';
import { ArmorControl } from './ArmorControl';
import { ScarRoller } from './ScarRoller';
import { InventorySlots } from './InventorySlots';
import { InitiativeRoller } from './InitiativeRoller';
import { useCharacter } from '@/contexts/CharacterContext';
import { useEclipseAmbient, useCharacterSounds, playSound, useAudioSettings } from '@/hooks/useAudio';
import { CombatArsenal } from './CombatArsenal';
import { StarWhisper } from './StarWhisper';
import StatusEffectsBar from './StatusEffectsBar';
import AlchemyBelt from './AlchemyBelt';
import { WhisperOverlay } from './WhisperOverlay';
import { GameLogs } from './GameLogs';
import { LootNotification } from './LootNotification';
import { CampModal } from './CampModal';
import { SaveIndicator } from './SaveIndicator';
import { AvatarSelector } from './AvatarSelector';
import { AbilitySection } from './AbilitySection';
import { LoreTab } from './LoreTab';

// AttributeBox component remains the same ...
const AttributeBox: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  onRoll: () => void;
  description: string;
  bonus?: number;
}> = ({ label, value, onChange, onRoll, description, bonus = 0 }) => {
  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value < 3) {
      playSound('click', 0.5);
      onChange(value + 1);
    }
  };
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value > -2) {
      playSound('click', 0.5);
      onChange(value - 1);
    }
  };

  const displayValue = value + bonus;

  return (
    <div className="flex flex-col items-center bg-stone-900/40 border-artifact p-4 rounded-sm relative group hover:border-rust/40 transition-colors">
      <h4 className="font-serif text-bone uppercase tracking-widest text-sm mb-1">{label}</h4>
      <span className="text-[10px] text-stone-500 mb-3 font-mono">{description}</span>

      <div className="flex items-center gap-4">
        <button
          onClick={handleDecrement}
          className="w-8 h-8 flex items-center justify-center border border-stone-700 text-stone-500 hover:text-rust hover:border-rust transition-colors z-10"
        >
          -
        </button>

        {/* Clickable Value to Roll */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRoll}
          className="text-3xl font-serif font-bold text-white w-12 h-12 flex items-center justify-center rounded hover:bg-white/5 cursor-pointer relative group/roll"
          title="Clique para Rolar"
        >
          {displayValue > 0 ? `+${displayValue}` : displayValue}
          {bonus > 0 && <span className="absolute -top-2 -right-2 text-[10px] text-green-500 font-bold animate-pulse">+{bonus}</span>}

          <div className="absolute -bottom-4 opacity-0 group-hover/roll:opacity-100 text-[9px] uppercase tracking-widest text-rust transition-opacity whitespace-nowrap">
            Rolar
          </div>
        </motion.button>

        <button
          onClick={handleIncrement}
          className="w-8 h-8 flex items-center justify-center border border-stone-700 text-stone-500 hover:text-rust hover:border-rust transition-colors z-10"
        >
          +
        </button>
      </div>
    </div>
  );
};

const CharacterSheet: React.FC = () => {
  const { character: char, updateCharacter, resetCharacter, isLoading, dbInfo, leaveRoom, setView } = useCharacter();
  const [rollingAttr, setRollingAttr] = useState<{
    name: string,
    value: number,
    weaponDamage?: number,
    weaponCrit?: string,
    weaponId?: string
  } | null>(null);
  const [showInitiative, setShowInitiative] = useState(false);
  const [isCampOpen, setIsCampOpen] = useState(false);

  // Audio hooks for atmospheric sounds
  useEclipseAmbient(); // Heartbeat at Orbit 10
  useCharacterSounds(); // Damage/heal/orbit change sounds
  const { isMuted, toggleMute } = useAudioSettings();

  const updateAttribute = (attr: keyof Attributes, val: number) => {
    updateCharacter({
      attributes: { ...char.attributes, [attr]: val }
    });
  };

  const handleOrbitIncrease = () => {
    updateCharacter({
      orbit: Math.min(char.orbit + 1, 10)
    });
  };

  const selectedArchetype = ARCHETYPES.find(a => a.id === char.archetypeId);
  const selectedAstralPower = ASTRAL_POWERS.find(p => p.id === char.astralPowerId);

  // Determine Health Status
  const isDying = char.currentHp <= 0;
  const isWounded = char.currentHp <= char.maxHp / 2;

  const handleReset = () => {
    if (confirm("Deseja queimar esta ficha e começar uma nova? Os dados serão perdidos.")) {
      resetCharacter();
    }
  };

  const handleAttack = (weapon: Weapon) => {
    // Lógica Automática de Atributo
    let attrName = 'Ferro';
    let attrVal = char.attributes.ferro;

    if (['Ranged', 'Firearm'].includes(weapon.category)) {
      attrName = 'Mercúrio';
      attrVal = char.attributes.mercurio;
    }

    // Aplicar bônus de Órbita Alta (Estágio 2: Órbita >= 5)
    // Se o atributo usado for o atributo primário do arquétipo, ganha +1
    const archetype = ARCHETYPES.find(a => a.id === char.archetypeId);
    let orbitBonus = 0;

    if (archetype && char.orbit >= 5) {
      const primaryAttr = archetype.primaryAttribute;
      const attrKey = attrName.toLowerCase();

      // Verifica se o atributo usado no ataque é o primário do arquétipo
      if (primaryAttr === attrKey) {
        orbitBonus = 1;
      }
    }

    setRollingAttr({
      name: `Ataque (${weapon.name})`,
      value: attrVal + orbitBonus,
      weaponDamage: weapon.damage,
      weaponCrit: weapon.description,
      weaponId: weapon.id
    });
  };

  const [activeTab, setActiveTab] = useState<'stats' | 'lore'>('stats');

  if (isLoading) return <div className="text-center p-20 text-rust animate-pulse">Invocando Ficha...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 relative">
      <WhisperOverlay />
      <LootNotification />
      <StatusEffectsBar />

      <CampModal isOpen={isCampOpen} onClose={() => setIsCampOpen(false)} />


      {/* DiceRoller Modal Integration */}
      {rollingAttr && (
        <DiceRoller
          attributeName={rollingAttr.name}
          attributeValue={rollingAttr.value}
          onClose={() => setRollingAttr(null)}
          onIncreaseOrbit={handleOrbitIncrease}
          isFreeRoll={rollingAttr.name === "Dados Livres"}
          weaponDamage={rollingAttr.weaponDamage}
          weaponCrit={rollingAttr.weaponCrit}
        />
      )}

      {/* Scar Roller Modal - Appears after surviving death */}
      {char.pendingScar && <ScarRoller />}

      {/* Header / Identity */}
      <header className="grid grid-cols-1 md:grid-cols-12 gap-6 border-b border-stone-800 pb-8">
        <div className="md:col-span-8 flex flex-col md:flex-row gap-6">
          <AvatarSelector />
          <div className="flex-1 space-y-4">
            <div className="flex flex-col">
              <label className="text-xs text-rust uppercase tracking-widest mb-1">Nome do Vinculado</label>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-1">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => updateCharacter({ name: e.target.value })}
                    placeholder="NOME DO VIAJANTE"
                    className="bg-transparent border-none text-3xl font-serif text-white placeholder:text-stone-800 focus:ring-0 p-0 w-full tracking-tighter"
                  />

                  {/* Audio Toggle */}
                  <button
                    onClick={toggleMute}
                    className="text-stone-600 hover:text-stone-400 transition-colors p-2"
                    title={isMuted ? "Ativar som" : "Desativar som"}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>

                  <button
                    onClick={() => setIsCampOpen(true)}
                    className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-700 px-3 py-1 rounded-sm transition-all shadow-lg ml-4"
                  >
                    <Tent size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Descansar</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-stone-500 uppercase tracking-widest mb-1">Antecedente / Profissão</label>
              {char.backgroundId ? (
                <div className="text-stone-300 font-serif text-lg">{char.background}</div>
              ) : (
                <input
                  type="text"
                  value={char.background}
                  onChange={(e) => updateCharacter({ background: e.target.value })}
                  placeholder="Ex: Mercenário, Cultista Arrependido..."
                  className="bg-transparent border-b border-stone-800 text-stone-400 focus:outline-none focus:border-stone-600 transition-colors w-full"
                />
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-ash border-artifact p-4 flex flex-col gap-2">
          <label className="text-xs text-rust uppercase tracking-widest flex items-center gap-2">
            <Star size={12} /> Signo / Arquétipo
          </label>
          {char.backgroundId ? (
            <div className="text-bone font-serif text-lg">{selectedArchetype?.name} ({selectedArchetype?.planet})</div>
          ) : (
            <select
              value={char.archetypeId}
              onChange={(e) => updateCharacter({ archetypeId: e.target.value })}
              className="bg-void border border-stone-700 text-bone p-2 text-sm focus:border-rust outline-none font-serif"
            >
              <option value="">-- Escolha um Destino --</option>
              {ARCHETYPES.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.planet})</option>
              ))}
            </select>
          )}
          {selectedArchetype && (
            <div className="text-xs text-stone-500 mt-2 font-mono leading-tight">
              <span className="text-gold block mb-1">
                {selectedAstralPower ? `Manifestação: ${selectedAstralPower.name}` : `Bônus: ${selectedArchetype.type} (+${selectedArchetype.bonusHp} PV)`}
              </span>
              {selectedAstralPower ? selectedAstralPower.description : selectedArchetype.passive}
            </div>
          )}
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <div className="flex gap-8 border-b border-stone-800">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'text-rust border-b-2 border-rust' : 'text-stone-600 hover:text-stone-400'}`}
        >
          Ficha Técnica
        </button>
        <button
          onClick={() => setActiveTab('lore')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'lore' ? 'text-rust border-b-2 border-rust' : 'text-stone-600 hover:text-stone-400'}`}
        >
          Propósito & Lore
        </button>
      </div>

      {activeTab === 'lore' ? (
        <LoreTab />
      ) : (
        <>
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Attributes & Vitals */}
            <div className="lg:col-span-2 space-y-8">

              {/* Attributes */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AttributeBox
                  label="Ferro"
                  value={char.attributes.ferro}
                  onChange={(v) => updateAttribute('ferro', v)}
                  onRoll={() => setRollingAttr({ name: 'Ferro', value: char.attributes.ferro })}
                  description="Força, Violência, Resiliência"
                  bonus={(char.orbit >= 5 && selectedArchetype?.primaryAttribute === 'ferro') ? 1 : 0}
                />
                <AttributeBox
                  label="Mercúrio"
                  value={char.attributes.mercurio}
                  onChange={(v) => updateAttribute('mercurio', v)}
                  onRoll={() => setRollingAttr({ name: 'Mercúrio', value: char.attributes.mercurio })}
                  description="Agilidade, Furtividade, Velocidade"
                  bonus={(char.orbit >= 5 && selectedArchetype?.primaryAttribute === 'mercurio') ? 1 : 0}
                />
                <AttributeBox
                  label="Enxofre"
                  value={char.attributes.enxofre}
                  onChange={(v) => updateAttribute('enxofre', v)}
                  onRoll={() => setRollingAttr({ name: 'Enxofre', value: char.attributes.enxofre })}
                  description="Tecnologia, Explosivos, Mecânica"
                  bonus={(char.orbit >= 5 && selectedArchetype?.primaryAttribute === 'enxofre') ? 1 : 0}
                />
                <AttributeBox
                  label="Sal"
                  value={char.attributes.sal}
                  onChange={(v) => updateAttribute('sal', v)}
                  onRoll={() => setRollingAttr({ name: 'Sal', value: char.attributes.sal })}
                  description="Vontade, Ocultismo, Empatia"
                  bonus={(char.orbit >= 5 && selectedArchetype?.primaryAttribute === 'sal') ? 1 : 0}
                />

                {/* Validation */}
                <div className="col-span-2 md:col-span-4 mt-2 flex justify-center">
                  {(() => {
                    const vals = (Object.values(char.attributes) as number[]).sort((a, b) => b - a);
                    const standardArray = JSON.stringify([2, 1, 0, -1]);
                    const tradeArray = JSON.stringify([3, 1, 0, -2]);
                    const currentStr = JSON.stringify(vals);

                    let statusText = "";
                    let statusColor = "";

                    if (currentStr === standardArray) {
                      statusText = "VÁLIDO (Array Padrão)";
                      statusColor = "border-green-800 text-green-500 bg-green-900/10";
                    } else if (currentStr === tradeArray) {
                      statusText = "VÁLIDO (Regra de Troca: +3 / -2)";
                      statusColor = "border-green-800 text-green-500 bg-green-900/10";
                    } else {
                      const points = vals.reduce((a, b) => a + b, 0);
                      statusText = `CUSTOMIZADO / INVÁLIDO (Soma: ${points})`;
                      statusColor = "border-red-900 text-red-500 bg-red-900/10";
                    }

                    return (
                      <div className={`text-xs font-mono border px-3 py-1 rounded ${statusColor}`}>
                        STATUS: {statusText}
                      </div>
                    );
                  })()}
                </div>
              </section>

              {/* Memórias & Mutações */}
              <section className="bg-stone-900/10 border-artifact p-6">
                <AbilitySection />
              </section>

              {/* Arsenal & Combat */}
              <CombatArsenal onAttack={handleAttack} />

              {/* Vitals & Orbit */}
              <section className="bg-stone-900/10 border-artifact p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="w-full">
                  <VitalityBar
                    current={char.currentHp}
                    max={char.maxHp}
                    onChange={(val) => updateCharacter({ currentHp: val })}
                  />
                  <div className="mt-4 border-t border-stone-800/50 pt-4">
                    <ArmorControl />
                  </div>
                  <div className="mt-4 border-t border-stone-800/50 pt-4">
                    <AlchemyBelt />
                  </div>
                </div>
                <div>
                  <StarWhisper />
                  <OrbitWidget
                    orbit={char.orbit}
                    onChange={(val) => updateCharacter({ orbit: Math.min(Math.max(0, val), 10) })}
                    mini={true}
                  />
                  {char.currentHp <= 0 && <DeathSaveSection />}
                </div>
              </section>

            </div>

            {/* Right Column: Inventory & Notes */}
            <div className="flex flex-col gap-6">

              {/* Money / Economy */}
              <div className="bg-stone-900/40 border-artifact p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-rust text-xs uppercase tracking-widest font-bold">Limalhas de Prata</span>
                  <span className="text-[10px] text-stone-500">Recursos & Troca</span>
                </div>

                <div className="flex items-center gap-3 bg-black/40 border border-stone-800 rounded p-1">
                  <button
                    onClick={() => updateCharacter({ silver: Math.max(0, (char.silver || 0) - 1) })}
                    className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-white hover:bg-white/5 rounded transition-colors"
                  >
                    -
                  </button>
                  <div className="flex flex-col items-center w-12">
                    <span className="text-xl font-serif font-bold text-bone">{char.silver || 0}</span>
                    <span className="text-[9px] text-stone-600">LP</span>
                  </div>
                  <button
                    onClick={() => updateCharacter({ silver: (char.silver || 0) + 1 })}
                    className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-white hover:bg-white/5 rounded transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-ash/20 border-artifact p-4 flex-1 flex flex-col">
                <InventorySlots />
              </div>

              <div className="bg-ash/20 border border-stone-800 p-4 h-48">
                <label className="text-xs text-stone-500 uppercase tracking-widest mb-2 block">Cicatrizes & Notas</label>
                <textarea
                  value={char.notes}
                  onChange={(e) => updateCharacter({ notes: e.target.value })}
                  className="w-full h-full bg-void/50 border-none p-2 text-sm text-stone-400 focus:outline-none resize-none italic"
                  placeholder="O que você perdeu? Quem você matou?"
                />
              </div>

              <GameLogs roomId={dbInfo.roomId || null} height="h-32" />
            </div>
          </div>
        </>
      )}



      {/* Actions */}
      <div className="flex justify-between items-center pt-8 border-t border-stone-800">
        <div className="flex gap-4 items-center">
          <SaveIndicator />
          <div className="h-4 w-px bg-stone-800 mx-2"></div>

          {/* BOTÃO PARA VOLTAR A SELEÇÃO */}
          {!dbInfo.roomId && (
            <button
              onClick={() => setView('selection')}
              className="flex items-center gap-2 text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest"
            >
              <div className="rotate-180">➜</div> Trocar Personagem
            </button>
          )}

          {dbInfo.roomId && (
            <button
              onClick={() => {
                if (confirm("Deseja sair da sala? Seu personagem será mantido, mas você não estará mais visível para o Mestre.")) {
                  leaveRoom();
                  setView('selection'); // Voltar para seleção ao sair da sala
                }
              }}
              className="flex items-center gap-2 text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest"
            >
              <Volume2 size={14} className="rotate-180" /> Sair da Sala
            </button>
          )}

          <button
            onClick={() => setRollingAttr({ name: "Dados Livres", value: 0 })}
            className="flex items-center gap-2 text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest"
          >
            <Dices size={14} /> Dados Livres
          </button>

          <button
            onClick={() => setShowInitiative(true)}
            className="flex items-center gap-2 text-rust hover:text-white transition-colors text-xs uppercase tracking-widest"
          >
            <Swords size={14} /> Iniciativa
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-stone-600 hover:text-blood-bright transition-colors text-xs uppercase tracking-widest"
        >
          <Trash2 size={14} /> Queimar Ficha
        </button>
      </div>

      {/* Initiative Modal */}
      {showInitiative && <InitiativeRoller onClose={() => setShowInitiative(false)} />}
    </div >
  );
};

// Renamed local component to avoid conflict with Lucide's Star
const DecorStar: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

export default CharacterSheet;