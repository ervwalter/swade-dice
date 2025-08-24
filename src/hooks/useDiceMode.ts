import { useMemo } from "react";
import { useDiceControlsStore } from "../controls/store";
import { useDiceRollStore } from "../dice/store";
import { isTraitTestFromDiceInfo } from "../helpers/determineRollType";

export type DiceMode = "trait" | "damage" | "none";

export interface DiceState {
  mode: DiceMode;
  isTraitTest: boolean;
  isDamageRoll: boolean;
  hasActiveRoll: boolean;
  originalNonWildDiceCount: number;
  currentSelectionCount: number;
}

/**
 * Unified hook to determine the current dice mode and state
 * Used by various UI components to enable/disable features
 */
export function useDiceMode(): DiceState {
  const diceCounts = useDiceControlsStore((state) => state.diceCounts);
  const dieInfo = useDiceRollStore((state) => state.dieInfo);
  const rollValues = useDiceRollStore((state) => state.rollValues);
  
  return useMemo(() => {
    // Check if we have an active roll
    const hasActiveRoll = Object.keys(dieInfo).length > 0 && 
                          Object.keys(rollValues).length > 0;
    
    let originalNonWildDiceCount = 0;
    let isTraitFromRoll = false;
    
    // If we have an active roll, check the original dice (not explosions)
    if (hasActiveRoll) {
      const originalDice = Object.values(dieInfo).filter(info => !info.parentDieId);
      originalNonWildDiceCount = originalDice.filter(info => !info.isWildDie).length;
      isTraitFromRoll = isTraitTestFromDiceInfo(dieInfo);
    }
    
    // Check current selection
    const currentSelectionCount = Object.values(diceCounts).reduce((sum, count) => sum + count, 0);
    
    // Determine which count to use for mode detection
    const effectiveCount = hasActiveRoll ? originalNonWildDiceCount : currentSelectionCount;
    
    // Determine the mode
    let mode: DiceMode = "none";
    let isTraitTest = false;
    
    if (hasActiveRoll) {
      // Use the roll data to determine mode
      isTraitTest = isTraitFromRoll;
      mode = isTraitTest ? "trait" : "damage";
    } else {
      // Use the current selection
      if (currentSelectionCount === 1) {
        mode = "trait";
        isTraitTest = true;
      } else if (currentSelectionCount > 1) {
        mode = "damage";
        isTraitTest = false;
      } else if (currentSelectionCount === 0) {
        // No dice selected could still be trait mode (for wild die toggle)
        mode = "trait";
        isTraitTest = true;
      }
    }
    
    return {
      mode,
      isTraitTest,
      isDamageRoll: mode === "damage",
      hasActiveRoll,
      originalNonWildDiceCount,
      currentSelectionCount,
    };
  }, [diceCounts, dieInfo, rollValues]);
}