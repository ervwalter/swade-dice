import create from "zustand";
import { immer } from "zustand/middleware/immer";

import { DiceRoll } from "../types/DiceRoll";
import { Die } from "../types/Die";
import { getDieFromDice } from "../helpers/getDieFromDice";
import { DiceTransform } from "../types/DiceTransform";
import { getRandomDiceThrow } from "../helpers/DiceThrower";
import { SeededRandom, deriveDieSeed, deriveExplosionSeed } from "../helpers/SeededRandom";
import { generateDiceId } from "../helpers/generateDiceId";
import { DiceThrow } from "../types/DiceThrow";
import { DiceType } from "../types/DiceType";
import { ExplosionResult, SavageRollMode, SavageRollResult } from "../types/SavageWorldsTypes";
import { shouldDieExplode, MAX_EXPLOSIONS } from "../helpers/explosionHelpers";
import { DEFAULT_DICE_STYLE, EXPLOSION_SPEED_MULTIPLIER } from "../constants/savageWorlds";
import { useDiceControlsStore } from "../controls/store";

interface DiceRollState {
  roll: DiceRoll | null;
  /**
   * Master seed for the current roll (for deterministic randomness)
   */
  masterSeed: number | null;
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
}

export const useDiceRollStore = create<DiceRollState>()(
  immer((set, get) => ({
    roll: null,
    masterSeed: null,
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
        // Generate a new master seed for this roll
        const seed = Date.now() + Math.floor(Math.random() * 1000000);
        state.masterSeed = seed;
        
        // Add master seed to the roll object
        state.roll = {
          ...roll,
          masterSeed: seed
        };
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
          // Store the die's index for deterministic seed derivation
          state.dieIndices[die.id] = index;
          
          // Create a SeededRandom instance for this specific die
          const dieSeed = deriveDieSeed(seed, index);
          const dieRng = new SeededRandom(dieSeed);
          
          state.rollValues[die.id] = null;
          state.rollTransforms[die.id] = null;
          state.rollThrows[die.id] = getRandomDiceThrow(speedMultiplier, dieRng);
          state.pendingDice.push(die.id);
          
          // Mark wild die (D6 with Nebula style)
          const isWildDie = die.type === "D6" && die.style === "NEBULA";
          state.dieInfo[die.id] = { die, isWildDie };
        });
      }),
    clearRoll: () =>
      set((state) => {
        state.roll = null;
        state.masterSeed = null;
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
          // Generate a new master seed for the reroll
          const seed = Date.now() + Math.floor(Math.random() * 1000000);
          state.masterSeed = seed;
          
          // Generate new IDs for all dice in the roll
          const newDice = getDieFromDice(rollToReplay).map(die => ({
            ...die,
            id: generateDiceId()
          }));
          
          // Create a new roll with the new dice IDs and seed
          const newRoll: DiceRoll = {
            ...rollToReplay,
            dice: newDice,
            masterSeed: seed
          };
          
          // Set up the new roll exactly like startRoll does
          state.roll = newRoll;
          newDice.forEach((die, index) => {
            // Store the die's index for deterministic seed derivation
            state.dieIndices[die.id] = index;
            
            // Create a SeededRandom instance for this specific die
            const dieSeed = deriveDieSeed(seed, index);
            const dieRng = new SeededRandom(dieSeed);
            
            state.rollValues[die.id] = null;
            state.rollTransforms[die.id] = null;
            state.rollThrows[die.id] = getRandomDiceThrow(undefined, dieRng);
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
      
      // Store the result first
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
      
      // Determine the parent die ID for explosion tracking
      let parentDieId = id;
      if (id.includes('_explosion_')) {
        parentDieId = id.split('_explosion_')[0];
      }
      
      // Initialize or update explosion result
      set((draft) => {
        if (!draft.explosionResults[parentDieId]) {
          draft.explosionResults[parentDieId] = {
            dieId: parentDieId,
            dieType: info.die.type,
            rolls: [value],
            total: value,
            exploded: false,
            isWildDie: info.isWildDie,
          };
        } else {
          draft.explosionResults[parentDieId].rolls.push(value);
          draft.explosionResults[parentDieId].total += value;
        }
      });
      
      // Check if this die should explode
      if (shouldDieExplode(value, info.die.type)) {
        // Calculate explosion index - it's the number of rolls minus 1 (since we just added this roll)
        const explosionCount = (get().explosionResults[parentDieId]?.rolls.length || 1) - 1;
        
        if (explosionCount < MAX_EXPLOSIONS) {
          // Mark as exploded and spawn new die
          set((draft) => {
            draft.explosionResults[parentDieId].exploded = true;
            
            const explosionId = `${parentDieId}_explosion_${explosionCount + 1}`;
            const newDie: Die = {
              id: explosionId,
              type: info.die.type,
              style: info.die.style || DEFAULT_DICE_STYLE
            };
            
            // Add explosion die
            draft.explosionDice.push(newDie);
            draft.rollValues[explosionId] = null;
            draft.rollTransforms[explosionId] = null;
            
            // Use derived seed for explosion determinism
            const masterSeed = get().masterSeed || Date.now();
            const dieIndices = get().dieIndices;
            
            // Get the original die's index (find the root die, not the explosion)
            let rootDieId = parentDieId;
            while (rootDieId.includes('_explosion_')) {
              rootDieId = rootDieId.substring(0, rootDieId.lastIndexOf('_explosion_'));
            }
            const dieIndex = dieIndices[rootDieId] ?? 0;
            
            // Create explosion seed based on die index and explosion count
            const explosionSeed = deriveExplosionSeed(masterSeed, dieIndex, explosionCount + 1);
            const explosionRng = new SeededRandom(explosionSeed);
            draft.rollThrows[explosionId] = getRandomDiceThrow(EXPLOSION_SPEED_MULTIPLIER, explosionRng);
            
            draft.pendingDice.push(explosionId);
            draft.dieInfo[explosionId] = { 
              die: newDie, 
              isWildDie: info.isWildDie, 
              parentDieId 
            };
          });
          // Don't check for completion when we just spawned an explosion die
          return;
        }
        // Hit max explosions, can check for completion
      }
      
      // Only check if all dice are complete when we're not spawning explosions
      // All dice are complete when pendingDice is empty
      if (get().pendingDice.length === 0) {
        // Get the actual modifiers and target number from controls store
        const controlsState = useDiceControlsStore.getState();
        const isTraitTest = get().rollMode === "TRAIT";
        const modifier = isTraitTest ? controlsState.traitModifier : controlsState.damageModifier;
        const targetNumber = controlsState.targetNumber;
        get().finalizeRoll(modifier, targetNumber);
      }
    },
    
    finalizeRoll: (modifier = 0, targetNumber) => {
      set((state) => {
        const explosions = Object.values(state.explosionResults);
        
        let total = 0;
        let traitDieResult: ExplosionResult | undefined;
        let wildDieResult: ExplosionResult | undefined;
        let bestResult: ExplosionResult | undefined;
        
        if (state.rollMode === "TRAIT") {
          traitDieResult = explosions.find((e) => !e.isWildDie);
          wildDieResult = explosions.find((e) => e.isWildDie);
          
          if (traitDieResult && wildDieResult) {
            bestResult = traitDieResult.total >= wildDieResult.total ? traitDieResult : wildDieResult;
          } else {
            bestResult = traitDieResult || wildDieResult;
          }
          
          total = (bestResult?.total || 0) + modifier;
        } else {
          total = explosions.reduce((sum, e) => sum + e.total, 0) + modifier;
        }
        
        let success: boolean | undefined;
        let raises: number | undefined;
        
        if (targetNumber !== undefined) {
          success = total >= targetNumber;
          if (success) {
            raises = Math.floor((total - targetNumber) / 4);
          }
        }
        
        state.currentRollResult = {
          mode: state.rollMode,
          explosions,
          traitDieResult,
          wildDieResult,
          bestResult,
          modifier,
          total,
          targetNumber,
          success,
          raises,
          timestamp: Date.now(),
        };
      });
    },
  }))
);