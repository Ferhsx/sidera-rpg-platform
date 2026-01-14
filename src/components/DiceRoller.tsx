
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, X, Zap, AlertTriangle, Sparkles, Skull } from 'lucide-react';
import { OrbitStage } from '@/types';
import { useCharacter } from '@/contexts/CharacterContext';
import { ARCHETYPES } from '@/constants';
import { playSound, stopSound } from '@/hooks/useAudio';
import { logEvent } from '@/lib/logger';

interface DiceRollerProps {
  attributeName: string;
  attributeValue: number;
  onClose: () => void;
  onIncreaseOrbit: () => void;
  isFreeRoll?: boolean;
  weaponDamage?: number;
  weaponCrit?: string;
}

type RollOutcome = 'falha' | 'parcial' | 'sucesso' | 'critico';

interface RollHistory {
  total: number;
  dice: number[];
  mod: number;
  outcome: RollOutcome;
}

const DiceRoller: React.FC<DiceRollerProps> = ({
  attributeName,
  attributeValue,
  onClose,
  onIncreaseOrbit,
  isFreeRoll = false,
  weaponDamage,
  weaponCrit
}) => {
  const { character, updateCharacter, dbInfo } = useCharacter();
  const [isRolling, setIsRolling] = useState(false);
  const [invokeStar, setInvokeStar] = useState(false);
  const [diceResults, setDiceResults] = useState<number[]>([1, 1]);
  const [finalResult, setFinalResult] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<RollOutcome | null>(null);
  const [history, setHistory] = useState<RollHistory[]>([]);

  // State for Custom Free Dice
  const [customDiceCount, setCustomDiceCount] = useState(1);
  const [customDiceFaces, setCustomDiceFaces] = useState(20);

  // Combat Mode for contextual feedback
  const [combatMode, setCombatMode] = useState(false);

  // Calculate Effective Modifier (Base + Bonus) for Display and Logic
  const normalizeValues = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const currentArchetype = ARCHETYPES.find(a => a.id === character.archetypeId);
  const isPrimaryAttr = normalizeValues(currentArchetype?.primaryAttribute || '') === normalizeValues(attributeName);
  const stage2Bonus = (character.orbit >= 5 && isPrimaryAttr) ? 1 : 0;

  // --- Pharmacopeia & Conditions Automation ---
  const nauseaCondition = character.conditions.find(c => c.mechanic === 'nausea');
  const isPhysical = ['ferro', 'mercurio'].includes(normalizeValues(attributeName));

  let conditionMod = 0;
  let conditionReason = "";

  if (nauseaCondition && isPhysical) {
    conditionMod -= 1;
    conditionReason = "Enjoado (-1)";
  }

  const effectiveMod = attributeValue + stage2Bonus + conditionMod;

  // Helper for rolling dice
  const rollDie = (faces: number) => Math.floor(Math.random() * faces) + 1;

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setFinalResult(null);
    setOutcome(null);

    // Play dice roll sound
    playSound('diceRoll', 0.6);

    // Animation duration
    const duration = 1000;
    const interval = 50;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      // Randomize dice visuals during roll
      const numDice = invokeStar ? 3 : 2;
      const tempDice = Array.from({ length: numDice }, () => rollDie(6));
      setDiceResults(tempDice);
      step++;

      if (step >= steps) {
        clearInterval(timer);
        finalizeRoll(tempDice);
      }
    }, interval);
  };

  const finalizeRoll = (finalDice: number[]) => {
    setIsRolling(false);

    // Stop rolling sound and play result
    stopSound('diceRoll');
    playSound('diceResult', 0.6);

    // Apply Orbit Cost if Star was Invoked
    if (invokeStar) {
      onIncreaseOrbit();
    }

    // Sort descending to handle "Keep Highest 2" logic if using 3 dice
    const sortedDice = [...finalDice].sort((a, b) => b - a);
    const keptDice = sortedDice.slice(0, 2); // Always keep top 2
    const diceSum = keptDice.reduce((a, b) => a + b, 0);

    // --- GAME RULES LOGIC ---
    // 1. Stage 2: Social Disadvantage (-1d6 to Sal)
    let socialPenalty = 0;
    if (!isFreeRoll && character.orbit >= 5 && normalizeValues(attributeName) === 'sal') {
      socialPenalty = rollDie(6);
    }

    const total = diceSum + effectiveMod - socialPenalty;

    // 2. Stage 3: Critical (Self Damage on Failure)
    // Failure is <= 6.
    let selfDamage = 0;
    if (!isFreeRoll && character.orbit >= 8 && total <= 6) {
      selfDamage = rollDie(4);
      updateCharacter({ currentHp: Math.max(0, character.currentHp - selfDamage) });
    }

    setDiceResults(finalDice);
    setFinalResult(total);

    let resultOutcome: RollOutcome = 'falha';
    if (total <= 6) resultOutcome = 'falha';
    else if (total <= 9) resultOutcome = 'parcial';
    else if (total <= 11) resultOutcome = 'sucesso';
    else resultOutcome = 'critico';

    setOutcome(resultOutcome);

    // LOG EVENT
    if (dbInfo?.roomId) {
      logEvent(
        dbInfo.roomId,
        character.name,
        `Rolou ${attributeName}: ${total} (${resultOutcome.toUpperCase()}) ${weaponDamage ? `[Dano ${weaponDamage} - ${weaponCrit || ''}]` : ''}`,
        'roll'
      );
    }

    setHistory(prev => [{
      total,
      dice: finalDice,
      mod: effectiveMod - socialPenalty,
      outcome: resultOutcome
    }, ...prev.slice(0, 2)]);

    // Log for debug/user
    if (socialPenalty > 0) console.log(`Penalidade Social: -${socialPenalty}`);
    if (selfDamage > 0) console.log(`Dano Crítico: -${selfDamage}`);
  };

  const rollFreeDie = (count: number, faces: number) => {
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      results.push(rollDie(faces));
    }

    const sum = results.reduce((a, b) => a + b, 0);

    setFinalResult(sum);
    setDiceResults(results);
    setOutcome(null);

    // LOG EVENT (Free Roll)
    if (dbInfo?.roomId) {
      logEvent(
        dbInfo.roomId,
        character.name,
        `Rolou Dados Livres (${count}d${faces}): ${sum}`,
        'roll'
      );
    }

    setHistory(prev => [{
      total: sum,
      dice: results,
      mod: 0,
      outcome: 'sucesso'
    }, ...prev.slice(0, 2)]);
  };

  const getOutcomeColor = (o: RollOutcome | null) => {
    switch (o) {
      case 'falha': return 'text-blood-bright border-blood-bright shadow-[0_0_20px_rgba(127,29,29,0.4)]';
      case 'parcial': return 'text-gold border-gold shadow-[0_0_20px_rgba(161,98,7,0.3)]';
      case 'sucesso': return 'text-cyan-200 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]';
      case 'critico': return 'text-white border-white shadow-[0_0_30px_rgba(255,255,255,0.6)] animate-pulse';
      default: return 'text-stone-500 border-stone-700';
    }
  };

  const getOutcomeText = (o: RollOutcome | null) => {
    // Combat Mode provides contextual feedback for Ferro (combat) rolls
    const isFerroRoll = normalizeValues(attributeName) === 'ferro';
    if (combatMode && isFerroRoll && o) {
      switch (o) {
        case 'falha': return 'ERRO: Você apanha.';
        case 'parcial': return 'O CHOQUE: Você acerta, mas o inimigo revida. Ambos sofrem dano.';
        case 'sucesso': return 'GOLPE LIMPO: Você causa dano sem receber nada.';
        case 'critico': return 'GOLPE DEVASTADOR: Dano máximo, inimigo atordoado.';
      }
    }
    // Default outcome text
    switch (o) {
      case 'falha': return 'DESASTRE / FALHA';
      case 'parcial': return 'SUCESSO COM CUSTO';
      case 'sucesso': return 'SUCESSO TOTAL';
      case 'critico': return 'SUCESSO ÉPICO';
      default: return 'DADO LIVRE';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-ash border border-stone-700 shadow-2xl rounded-sm overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white z-10">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="bg-stone-900/50 p-6 border-b border-stone-800 text-center">
          <h2 className="text-stone-400 text-xs uppercase tracking-[0.3em] mb-2">{isFreeRoll ? "Ferramenta de Sorte" : "Rolando Ação"}</h2>
          <div className="text-3xl font-serif text-bone font-bold flex items-center justify-center gap-3">
            <span>{attributeName}</span>
            {!isFreeRoll && (
              <>
                <span className={`px-2 py-0.5 rounded text-lg ${effectiveMod >= 0 ? 'bg-stone-800 text-green-400' : 'bg-blood/20 text-blood-bright'}`}>
                  {effectiveMod >= 0 ? `+${effectiveMod}` : effectiveMod}
                </span>
                <div className="flex flex-col items-start min-w-[30px]">
                  {stage2Bonus > 0 && (
                    <span className="text-[10px] text-stone-500 font-mono leading-none">
                      (+1 {currentArchetype?.planet})
                    </span>
                  )}
                  {conditionReason && (
                    <span className="text-[10px] text-red-500 font-mono leading-none mt-1 animate-pulse">
                      ({conditionReason})
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          {weaponDamage !== undefined && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-[10px] text-rust uppercase tracking-[0.2em]">Arma Equipada:</span>
              <span className="text-xs text-bone font-mono bg-rust/20 px-2 py-0.5 rounded border border-rust/30">
                {weaponDamage} Dano
              </span>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col items-center gap-6">

          {/* Combat Mode Toggle */}
          {!isFreeRoll && normalizeValues(attributeName) === 'ferro' && (
            <button
              onClick={() => setCombatMode(!combatMode)}
              className={`
                w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm border transition-all duration-300 text-xs uppercase tracking-widest font-bold
                ${combatMode
                  ? 'border-blood bg-blood/20 text-blood-bright'
                  : 'border-stone-700 bg-stone-900/30 text-stone-500 hover:text-white hover:border-stone-500'}
              `}
            >
              <Skull size={14} />
              {combatMode ? 'Modo Combate: ATIVO' : 'Ativar Modo Combate'}
            </button>
          )}

          {/* Invoke Star - Dangerous Button */}
          {!isFreeRoll && (
            <button
              onClick={() => !isRolling && setInvokeStar(!invokeStar)}
              className={`
                    w-full relative overflow-hidden transition-all duration-500 border p-4 group rounded-sm
                    ${invokeStar
                  ? 'border-red-500 bg-red-950/30 shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                  : 'border-stone-700 hover:border-gold hover:text-gold bg-stone-900/20'}
                `}
            >
              {invokeStar && (
                <div className="absolute inset-0 bg-stone-500 opacity-10 animate-pulse"></div>
              )}
              <div className="flex flex-col items-center z-10 relative">
                <span className="font-serif font-bold text-lg uppercase tracking-widest flex items-center gap-2">
                  {invokeStar ? <><Zap size={18} fill="currentColor" /> VÍNCULO ABERTO</> : "ABRIR VÍNCULO"}
                </span>
                <span className="text-[10px] font-mono mt-1 opacity-80">
                  {invokeStar ? "A ÓRBITA SUBIRÁ. O CÉU OBSERVA." : "Ganhe +1d6. Pague o Preço."}
                </span>
              </div>
            </button>
          )}

          {/* Dice Visualization - No Limit on Map */}
          <div className="min-h-24 flex items-center justify-center gap-4 perspective-1000 flex-wrap content-center">
            <AnimatePresence>
              {diceResults.map((val, idx) => (
                <motion.div
                  key={idx}
                  initial={{ rotateX: 0, rotateY: 0, y: -20, opacity: 0 }}
                  animate={{
                    rotateX: isRolling ? Math.random() * 720 : 0,
                    rotateY: isRolling ? Math.random() * 720 : 0,
                    y: 0,
                    opacity: 1
                  }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className={`w-16 h-16 bg-stone-200 rounded-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center border-b-4 border-r-4 border-stone-400 text-stone-900 font-serif font-bold text-3xl ${!isRolling && invokeStar && idx === diceResults.indexOf(Math.min(...diceResults)) && diceResults.length === 3
                    ? 'opacity-40 grayscale scale-90'
                    : ''
                    }`}
                >
                  {val}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Result Display */}
          <div className="w-full flex flex-col items-center justify-center min-h-[60px]">
            {finalResult !== null && !isRolling ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-center p-4 border rounded w-full ${getOutcomeColor(outcome)}`}
              >
                <div className="text-xs uppercase tracking-[0.4em] font-bold mb-1">{getOutcomeText(outcome)}</div>
                <div className="text-5xl font-serif font-bold">{finalResult}</div>

                {/* Mechanic Feedback - Hide if Free Roll */}
                {!isFreeRoll && (
                  <>
                    {(stage2Bonus > 0 && outcome !== null) && (
                      <div className="text-xs text-green-400 mt-1 font-mono">
                        Bônus Sintomático Ativado (+1)
                      </div>
                    )}
                    {(character.orbit >= 5 && normalizeValues(attributeName) === 'sal' && outcome !== null) && (
                      <div className="text-xs text-rust mt-1 font-mono">
                        Desvantagem Social (-1d6)
                      </div>
                    )}
                    {weaponCrit && outcome === 'critico' && (
                      <div className="mt-3 p-2 bg-gold/10 border border-gold/30 rounded text-xs text-gold font-serif italic animate-in fade-in slide-in-from-bottom-1">
                        ✦ {weaponCrit}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <div className="text-stone-600 text-sm italic py-4">
                {isRolling ? "O destino gira..." : "Pronto para rolar"}
              </div>
            )}
          </div>

          {/* Action Roll Button - Hide if Free Roll */}
          {!isFreeRoll && (
            <button
              onClick={rollDice}
              disabled={isRolling}
              className={`w-full py-4 text-lg font-serif font-bold uppercase tracking-widest transition-all ${isRolling
                ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                : 'bg-rust hover:bg-gold text-white shadow-lg hover:shadow-gold/20'
                }`}
            >
              {isRolling ? 'Rolando...' : 'Rolar Dados'}
            </button>
          )}

          {/* Free Dice Section - Show Only if Free Roll */}
          {isFreeRoll && (
            <div className="w-full pt-4 border-t border-stone-800">
              <label className="text-[10px] uppercase text-stone-500 mb-2 block tracking-widest text-center">- Configurar Dados -</label>
              <div className="flex flex-col gap-3">
                <div className="flex justify-center gap-4 text-sm font-mono text-stone-400">

                  {/* Dice Count Control */}
                  <div className="flex items-center gap-2 bg-stone-900/50 px-2 py-1 rounded border border-stone-800">
                    <button
                      onClick={() => setCustomDiceCount(Math.max(1, customDiceCount - 1))}
                      className="hover:text-white px-1"
                    >-</button>
                    <span className="w-4 text-center text-bone">{customDiceCount}</span>
                    <button
                      onClick={() => setCustomDiceCount(customDiceCount + 1)}
                      className="hover:text-white px-1"
                    >+</button>
                    <span className="text-xs text-stone-600">d</span>
                  </div>

                  {/* Dice Faces Control */}
                  <div className="flex items-center gap-2 bg-stone-900/50 px-2 py-1 rounded border border-stone-800">
                    <button
                      onClick={() => setCustomDiceFaces(Math.max(2, customDiceFaces - 1))}
                      className="hover:text-white px-1"
                    >-</button>
                    <span className="w-8 text-center text-bone">{customDiceFaces}</span>
                    <button
                      onClick={() => setCustomDiceFaces(customDiceFaces + 1)}
                      className="hover:text-white px-1"
                    >+</button>
                    <span className="text-xs text-stone-600">lados</span>
                  </div>

                </div>

                <button
                  onClick={() => rollFreeDie(customDiceCount, customDiceFaces)}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs uppercase tracking-widest border border-stone-700 transition-colors"
                >
                  Rolar {customDiceCount}d{customDiceFaces}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* History Footer */}
        {
          history.length > 0 && (
            <div className="bg-void/30 p-4 border-t border-stone-800">
              <div className="text-[10px] uppercase text-stone-600 mb-2">Histórico Recente</div>
              <div className="flex gap-2 justify-center">
                {history.map((h, i) => (
                  <div key={i} className={`text-xs px-2 py-1 border rounded ${h.outcome === 'falha' ? 'border-blood/50 text-blood-bright' :
                    h.outcome === 'parcial' ? 'border-gold/30 text-gold' :
                      'border-cyan-900 text-cyan-500'
                    }`}>
                    <span className="font-bold">{h.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      </motion.div >
    </div >
  );
};

export default DiceRoller;