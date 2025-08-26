import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { diceSets } from "../sets/diceSets";
import { Dice } from "../types/Dice";
import { DiceSet } from "../types/DiceSet";
import { Die } from "../types/Die";
import { generateDiceId } from "../helpers/generateDiceId";

export type DiceCounts = Record<string, number>;
export type RollModeSelection = 'AUTO' | 'TRAIT' | 'DAMAGE' | 'STANDARD';

interface DiceControlsState {
  diceSet: DiceSet;
  diceById: Record<string, Die>;
  defaultDiceCounts: DiceCounts;
  diceCounts: DiceCounts;
  diceHidden: boolean;
  diceRollPressTime: number | null;
  fairnessTesterOpen: boolean;
  // Savage Worlds specific state
  wildDieEnabled: boolean;
  targetNumber: number;
  traitModifier: number;   // Modifier for trait tests
  damageModifier: number;  // Modifier for damage rolls
  modeChoice: RollModeSelection;  // User's mode selection (AUTO, TRAIT, or DAMAGE)
  rollMode: 'TRAIT' | 'DAMAGE' | 'STANDARD';  // The actual current mode
  // Results display state
  resultsDetailsPinned: boolean;
  resultsDetailsHovered: boolean;
  // Actions
  changeDiceSet: (diceSet: DiceSet) => void;
  resetDiceCounts: (preserveMode?: boolean) => void;
  changeDieCount: (id: string, count: number) => void;
  incrementDieCount: (id: string) => void;
  decrementDieCount: (id: string) => void;
  setTraitModifier: (modifier: number) => void;
  setDamageModifier: (modifier: number) => void;
  toggleDiceHidden: () => void;
  setDiceRollPressTime: (time: number | null) => void;
  toggleFairnessTester: () => void;
  // Savage Worlds specific actions
  toggleWildDie: () => void;
  setTargetNumber: (tn: number) => void;
  setModeChoice: (mode: RollModeSelection) => void;
  // Results display actions
  setResultsDetailsPinned: (pinned: boolean) => void;
  setResultsDetailsHovered: (hovered: boolean) => void;
}

// Load dice set from localStorage or use default
const loadDiceSet = () => {
  try {
    const savedSetId = localStorage.getItem('swade-diceSetId');
    if (savedSetId) {
      const savedSet = diceSets.find(set => set.id === savedSetId);
      // Return saved set if valid and not Nebula (reserved for wild die)
      if (savedSet && savedSet.id !== "NEBULA_STANDARD" && savedSet.id !== "all") {
        return savedSet;
      }
    }
  } catch (e) {
  }
  
  // Default: first valid set (not Nebula or "all")
  return diceSets.find(set => 
    set.id !== "NEBULA_STANDARD" && set.id !== "all"
  ) || diceSets[0];
};

const initialSet = loadDiceSet();
const initialDiceCounts = getDiceCountsFromSet(initialSet);
const initialDiceById = getDiceByIdFromSet(initialSet);

// Helper to compute actual roll mode
function computeRollMode(modeChoice: RollModeSelection, counts: DiceCounts): 'TRAIT' | 'DAMAGE' | 'STANDARD' {
  // If explicitly chosen, always use that mode regardless of dice count
  if (modeChoice === 'TRAIT') return 'TRAIT';
  if (modeChoice === 'DAMAGE') return 'DAMAGE';
  if (modeChoice === 'STANDARD') return 'STANDARD';
  
  // Auto mode: determine based on dice count
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return totalCount === 1 ? 'TRAIT' : 'DAMAGE';
}

// Load Savage Worlds settings from localStorage
const loadSavageWorldsSettings = () => {
  try {
    const wildDieEnabled = localStorage.getItem('swade-wildDieEnabled');
    const targetNumber = localStorage.getItem('swade-targetNumber');
    return {
      wildDieEnabled: wildDieEnabled !== null ? wildDieEnabled === 'true' : true,
      targetNumber: targetNumber !== null ? parseInt(targetNumber, 10) : 4,
    };
  } catch {
    return { wildDieEnabled: true, targetNumber: 4 };
  }
};

const { wildDieEnabled: initialWildDie, targetNumber: initialTN } = loadSavageWorldsSettings();

// Load results display preference from localStorage
const loadResultsDetailsPinned = () => {
  try {
    const saved = localStorage.getItem("savage-worlds-results-pinned");
    return saved === "true";
  } catch (e) {
    return false;
  }
};

export const useDiceControlsStore = create<DiceControlsState>()(
  immer((set, get) => ({
    diceSet: initialSet,
    diceById: initialDiceById,
    defaultDiceCounts: initialDiceCounts,
    diceCounts: initialDiceCounts,
    diceHidden: false,
    diceRollPressTime: null,
    fairnessTesterOpen: false,
    wildDieEnabled: initialWildDie,
    targetNumber: initialTN,
    traitModifier: 0,   // Always start at 0 - modifiers are ephemeral
    damageModifier: 0,  // Always start at 0 - modifiers are ephemeral
    modeChoice: 'AUTO',   // Default to AUTO mode
    rollMode: computeRollMode('AUTO', initialDiceCounts),  // Computed from modeChoice and counts
    resultsDetailsPinned: loadResultsDetailsPinned(),
    resultsDetailsHovered: false,
    changeDiceSet(diceSet) {
      set((state) => {
        const counts: DiceCounts = {};
        const prevCounts = state.diceCounts;
        const prevDice = state.diceSet.dice;
        for (let i = 0; i < diceSet.dice.length; i++) {
          const die = diceSet.dice[i];
          const prevDie = prevDice[i];
          // Carry over count if the index and die type match
          if (prevDie && prevDie.type === die.type) {
            counts[die.id] = prevCounts[prevDie.id] || 0;
          } else {
            counts[die.id] = 0;
          }
        }
        state.diceCounts = counts;
        state.diceSet = diceSet;
        state.defaultDiceCounts = getDiceCountsFromSet(diceSet);
        state.diceById = getDiceByIdFromSet(diceSet);
        // Update rollMode based on new counts
        state.rollMode = computeRollMode(state.modeChoice, counts);
      });
      
      // Save dice set selection to localStorage
      try {
        localStorage.setItem('swade-diceSetId', diceSet.id);
      } catch (e) {
      }
    },
    resetDiceCounts(preserveMode?: boolean) {
      set((state) => {
        state.diceCounts = state.defaultDiceCounts;
        if (!preserveMode) {
          // Reset to AUTO when not preserving
          state.modeChoice = 'AUTO';
          state.rollMode = computeRollMode('AUTO', state.defaultDiceCounts);
        }
        // When preserving mode, don't touch modeChoice or rollMode at all
        // They stay exactly as they were
      });
    },
    changeDieCount(id, count) {
      set((state) => {
        if (id in state.diceCounts) {
          state.diceCounts[id] = count;
          // Update rollMode based on new counts
          state.rollMode = computeRollMode(state.modeChoice, state.diceCounts);
        }
      });
    },
    incrementDieCount(id) {
      set((state) => {
        if (id in state.diceCounts) {
          state.diceCounts[id] += 1;
          // Update rollMode based on new counts
          state.rollMode = computeRollMode(state.modeChoice, state.diceCounts);
        }
      });
    },
    decrementDieCount(id) {
      set((state) => {
        if (id in state.diceCounts && state.diceCounts[id] > 0) {
          state.diceCounts[id] -= 1;
          // Update rollMode based on new counts
          state.rollMode = computeRollMode(state.modeChoice, state.diceCounts);
        }
      });
    },
    setTraitModifier(modifier) {
      set((state) => {
        state.traitModifier = modifier;
      });
      // Don't save to localStorage - modifiers are ephemeral in SWADE
    },
    setDamageModifier(modifier) {
      set((state) => {
        state.damageModifier = modifier;
      });
      // Don't save to localStorage - modifiers are ephemeral in SWADE
    },
    toggleDiceHidden() {
      set((state) => {
        state.diceHidden = !state.diceHidden;
      });
    },
    setDiceRollPressTime(time) {
      set((state) => {
        state.diceRollPressTime = time;
      });
    },
    toggleFairnessTester() {
      set((state) => {
        state.fairnessTesterOpen = !state.fairnessTesterOpen;
      });
    },
    toggleWildDie() {
      set((state) => {
        state.wildDieEnabled = !state.wildDieEnabled;
        // Persist to localStorage
        try {
          localStorage.setItem('swade-wildDieEnabled', state.wildDieEnabled.toString());
        } catch {}
      });
    },
    setTargetNumber(tn) {
      set((state) => {
        state.targetNumber = tn;
        // Persist to localStorage
        try {
          localStorage.setItem('swade-targetNumber', tn.toString());
        } catch {}
      });
    },
    setResultsDetailsPinned(pinned) {
      set((state) => {
        state.resultsDetailsPinned = pinned;
        // Persist to localStorage
        try {
          localStorage.setItem("savage-worlds-results-pinned", pinned.toString());
        } catch {}
      });
    },
    setResultsDetailsHovered(hovered) {
      set((state) => {
        state.resultsDetailsHovered = hovered;
      });
    },
    setModeChoice(mode) {
      set((state) => {
        state.modeChoice = mode;
        // Update rollMode based on choice
        state.rollMode = computeRollMode(mode, state.diceCounts);
        // Don't persist - mode selection is ephemeral within a session
      });
    },
  }))
);

function getDiceCountsFromSet(diceSet: DiceSet) {
  const counts: Record<string, number> = {};
  for (const die of diceSet.dice) {
    counts[die.id] = 0;
  }
  return counts;
}

function getDiceByIdFromSet(diceSet: DiceSet) {
  const byId: Record<string, Die> = {};
  for (const die of diceSet.dice) {
    byId[die.id] = die;
  }
  return byId;
}

/** Generate new dice based off of a set of counts and die */
export function getDiceToRoll(
  counts: DiceCounts,
  diceById: Record<string, Die>,
  wildDieEnabled?: boolean,
  diceStyle?: string,
  isTraitMode?: boolean
) {
  const dice: (Die | Dice)[] = [];
  const countEntries = Object.entries(counts);
  
  // Add regular dice
  for (const [id, count] of countEntries) {
    const die = diceById[id];
    if (!die) {
      continue;
    }
    const { style, type } = die;
    for (let i = 0; i < count; i++) {
      dice.push({ id: generateDiceId(), style, type });
    }
  }
  
  // Add wild die if in trait mode, wild die is enabled, AND there are regular dice
  if (isTraitMode && wildDieEnabled && dice.length > 0) {
    // Wild die always uses Nebula style to distinguish it
    dice.push({ 
      id: generateDiceId(), 
      style: "NEBULA", 
      type: "D6"
    });
  }
  
  return dice;
}
