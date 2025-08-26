import create from "zustand";
import { immer } from "zustand/middleware/immer";

import { DiceRoll } from "../types/DiceRoll";
import { Die } from "../types/Die";
import { getDieFromDice } from "../helpers/getDieFromDice";
import { DiceTransform } from "../types/DiceTransform";
import { getRandomDiceThrow } from "../helpers/DiceThrower";
import { generateDiceId } from "../helpers/generateDiceId";
import { DiceThrow } from "../types/DiceThrow";
import { ExplosionResult, SavageRollMode, SavageRollResult, DieChain, RollOutcome } from "../types/SavageWorldsTypes";
import { shouldDieExplode, MAX_EXPLOSIONS } from "../helpers/explosionHelpers";
import { useDiceControlsStore } from "../controls/store";
import { 
  updateExplosionResults,
  createExplosionDie,
  getParentDieId,
  getRootDieId,
  processSingleDieTraitTest,
  processMultiDieTraitTest,
  processDamageRoll
} from "./storeHelpers";

interface DiceRollState {
  roll: DiceRoll | null;
  /**
   * Master seed for the current roll (for deterministic randomness)
   */
  /**
   * Mapping from die ID to its index in the original dice array
   * Used for deterministic seed derivation
   */
  dieIndices: Record<string, number>;
  /**
   * A mapping from the die ID to its roll result.
   * A value of `null` means the die hasn't finished rolling yet.
   */
  rollValues: Record<string, number | null>;
  /**
   * A mapping from the die ID to its final roll transform.
   * A value of `null` means the die hasn't finished rolling yet.
   */
  rollTransforms: Record<string, DiceTransform | null>;
  /**
   * A mapping from the die ID to its initial roll throw state.
   */
  rollThrows: Record<string, DiceThrow>;
  /**
   * A mapping from die ID to die information for explosion tracking
   */
  dieInfo: Record<string, { die: Die; isWildDie?: boolean; parentDieId?: string }>;
  /**
   * List of explosion dice that need to be spawned
   */
  explosionDice: Die[];
  /**
   * Dice that have finished rolling and should be immovable
   */
  finishedDice: string[];
  /**
   * Track dice currently rolling to prevent premature finalization
   */
  pendingDice: string[];
  
  // Savage Worlds specific state
  rollMode: SavageRollMode;
  explosionResults: Record<string, ExplosionResult>;
  currentRollResult: SavageRollResult | null;
  
  // Actions
  startRoll: (roll: DiceRoll, speedMultiplier?: number) => void;
  clearRoll: (ids?: string) => void;
  /** Reroll select ids of dice or reroll all dice by passing `undefined` */
  reroll: () => void;
  clearExplosionDice: () => void;
  
  // Savage Worlds specific actions
  setRollMode: (mode: SavageRollMode) => void;
  checkAndProcessExplosion: (id: string, value: number, transform: DiceTransform) => void;
  finalizeRoll: (modifier?: number, targetNumber?: number) => void;
  
  // Helper methods for explosion processing
  storeRollResult: (id: string, value: number, transform: DiceTransform) => void;
  updateExplosionResult: (parentDieId: string, value: number, info: any) => void;
  canCreateExplosion: (parentDieId: string) => boolean;
  createExplosion: (parentDieId: string, info: any) => void;
  completeRoll: () => void;
  createDieChains: () => any[];
  calculateOutcomes: (dieChains: any[], modifier: number, targetNumber: number | undefined, rollMode: SavageRollMode) => any[];
}

export const useDiceRollStore = create<DiceRollState>()(
  immer((set, get) => ({
    roll: null,
    dieIndices: {},
    rollValues: {},
    rollTransforms: {},
    rollThrows: {},
    dieInfo: {},
    explosionDice: [],
    finishedDice: [],
    pendingDice: [],
    
    // Savage Worlds state
    rollMode: "TRAIT",
    explosionResults: {},
    currentRollResult: null,
    
    startRoll: (roll, speedMultiplier?: number) =>
      set((state) => {
        // Get the current roll mode from controls store
        const controlsState = useDiceControlsStore.getState();
        state.rollMode = controlsState.rollMode;
        
        state.roll = roll;
        state.rollValues = {};
        state.rollTransforms = {};
        state.rollThrows = {};
        state.dieInfo = {};
        state.dieIndices = {};
        state.explosionDice = [];
        state.finishedDice = [];
        state.pendingDice = [];
        state.explosionResults = {};
        state.currentRollResult = null;
        
        // Set all values to null and mark as pending
        const dice = getDieFromDice(roll);
        dice.forEach((die, index) => {
          // Store the die's index
          state.dieIndices[die.id] = index;
          
          state.rollValues[die.id] = null;
          state.rollTransforms[die.id] = null;
          state.rollThrows[die.id] = getRandomDiceThrow(speedMultiplier);
          state.pendingDice.push(die.id);
          
          // Mark wild die (D6 with Nebula style)
          const isWildDie = die.type === "D6" && die.style === "NEBULA";
          state.dieInfo[die.id] = { die, isWildDie };
        });
      }),
    clearRoll: () =>
      set((state) => {
        state.roll = null;
        state.dieIndices = {};
        state.rollValues = {};
        state.rollTransforms = {};
        state.rollThrows = {};
        state.dieInfo = {};
        state.explosionDice = [];
        state.finishedDice = [];
        state.pendingDice = [];
        state.explosionResults = {};
        state.currentRollResult = null;
      }),
    reroll: () => {
      const currentRoll = get().roll;
      if (!currentRoll) return;
      
      // Store the roll before clearing
      const rollToReplay = { ...currentRoll };
      
      // First clear the roll completely - this will sync to remote players and clear popover
      get().clearRoll();
      
      // Then set up the reroll with a small delay to ensure the clear has propagated
      setTimeout(() => {
        set((state) => {
          // Generate new IDs for all dice in the roll
          const newDice = getDieFromDice(rollToReplay).map(die => ({
            ...die,
            id: generateDiceId()
          }));
          
          // Create a new roll with the new dice IDs
          const newRoll: DiceRoll = {
            ...rollToReplay,
            dice: newDice
          };
          
          // Set up the new roll exactly like startRoll does
          state.roll = newRoll;
          newDice.forEach((die, index) => {
            // Store the die's index
            state.dieIndices[die.id] = index;
            
            state.rollValues[die.id] = null;
            state.rollTransforms[die.id] = null;
            state.rollThrows[die.id] = getRandomDiceThrow();
            state.pendingDice.push(die.id);
            
            // Mark wild die (D6 with Nebula style)
            const isWildDie = die.type === "D6" && die.style === "NEBULA";
            state.dieInfo[die.id] = { die, isWildDie };
          });
        });
      }, 50); // Small delay to ensure clear has propagated
    },
    clearExplosionDice: () => {
      set((state) => {
        state.explosionDice = [];
      });
    },
    
    // Savage Worlds specific actions
    setRollMode: (mode) => {
      set((state) => {
        state.rollMode = mode;
      });
    },
    
    checkAndProcessExplosion: (id, value, transform) => {
      const state = get();
      const info = state.dieInfo[id];
      
      if (!info) return;
      
      // Store the result and update pending/finished dice
      const parentDieId = getParentDieId(id);
      get().storeRollResult(id, value, transform);
      get().updateExplosionResult(parentDieId, value, info);
      
      // Handle explosion if needed
      const shouldExplode = shouldDieExplode(value, info.die.type);
      if (shouldExplode && get().canCreateExplosion(parentDieId) && get().rollMode !== "STANDARD") {
        get().createExplosion(parentDieId, info);
        return; // Don't check for completion when spawning explosion
      }
      
      // Check for roll completion
      if (get().pendingDice.length === 0) {
        get().completeRoll();
      }
    },
    
    storeRollResult: (id, value, transform) => {
      set((draft) => {
        draft.rollValues[id] = value;
        draft.rollTransforms[id] = transform;
        
        // Remove from pending and add to finished
        const pendingIndex = draft.pendingDice.indexOf(id);
        if (pendingIndex > -1) {
          draft.pendingDice.splice(pendingIndex, 1);
        }
        
        if (!draft.finishedDice.includes(id)) {
          draft.finishedDice.push(id);
        }
      });
    },
    
    updateExplosionResult: (parentDieId, value, info) => {
      set((draft) => {
        updateExplosionResults(draft.explosionResults, parentDieId, value, info.die.type, info.isWildDie);
      });
    },
    
    canCreateExplosion: (parentDieId) => {
      const explosionCount = (get().explosionResults[parentDieId]?.rolls.length || 1) - 1;
      return explosionCount < MAX_EXPLOSIONS;
    },
    
    createExplosion: (parentDieId, info) => {
      const explosionCount = (get().explosionResults[parentDieId]?.rolls.length || 1) - 1;
      const dieIndices = get().dieIndices;
      const rootDieId = getRootDieId(parentDieId);
      const dieIndex = dieIndices[rootDieId] ?? 0;
      
      const explosionData = createExplosionDie(parentDieId, explosionCount, info.die, dieIndex);
      
      set((draft) => {
        draft.explosionResults[parentDieId].exploded = true;
        
        // Add explosion die and related data
        draft.explosionDice.push(explosionData.die);
        draft.rollValues[explosionData.die.id] = null;
        draft.rollTransforms[explosionData.die.id] = null;
        draft.rollThrows[explosionData.die.id] = explosionData.throw;
        
        draft.pendingDice.push(explosionData.die.id);
        draft.dieInfo[explosionData.die.id] = { 
          die: explosionData.die, 
          isWildDie: info.isWildDie, 
          parentDieId 
        };
      });
    },
    
    completeRoll: () => {
      const controlsState = useDiceControlsStore.getState();
      const isTraitTest = get().rollMode === "TRAIT";
      const modifier = isTraitTest ? controlsState.traitModifier : controlsState.damageModifier;
      const targetNumber = controlsState.targetNumber;
      get().finalizeRoll(modifier, targetNumber);
    },
    
    finalizeRoll: (modifier = 0, targetNumber) => {
      set((state) => {
        const dieChains = get().createDieChains();
        const outcomes = get().calculateOutcomes(dieChains, modifier, targetNumber, state.rollMode);
        
        state.currentRollResult = {
          mode: state.rollMode,
          dieChains,
          outcomes,
          targetNumber,
          modifier,
          isComplete: true,
          timestamp: Date.now(),
        };
      });
    },
    
    createDieChains: (): DieChain[] => {
      const explosions = Object.values(get().explosionResults);
      return explosions.map(exp => ({
        dieId: exp.dieId,
        dieType: exp.dieType,
        rolls: exp.rolls,
        total: exp.total,
        isWildDie: exp.isWildDie,
      }));
    },
    
    calculateOutcomes: (dieChains, modifier, targetNumber, rollMode): RollOutcome[] => {
      const regularChains = dieChains.filter(c => !c.isWildDie);
      const wildChain = dieChains.find(c => c.isWildDie);
      
      if (rollMode === "TRAIT") {
        if (regularChains.length === 1) {
          return processSingleDieTraitTest(regularChains, wildChain, modifier, targetNumber);
        } else if (regularChains.length > 1) {
          return processMultiDieTraitTest(regularChains, wildChain, modifier, targetNumber);
        }
        return [];
      } else if (rollMode === "STANDARD") {
        // For standard mode, just return raw die values without any SWADE logic
        return dieChains.map(chain => ({
          chains: [chain],
          modifier: 0,
          total: chain.total,
          replacedByWild: false
        }));
      } else {
        return processDamageRoll(dieChains, modifier, targetNumber);
      }
    },
  }))
);