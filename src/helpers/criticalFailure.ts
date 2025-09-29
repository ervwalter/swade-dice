import { SavageRollResult } from "../types/SavageWorldsTypes";

export type CriticalFailureStatus = {
  isCritical: boolean;
  isPossible: boolean;
  reason?: string;
};

/**
 * Determines if a roll outcome represents a critical failure in SWADE
 * 
 * Critical failures occur when:
 * - Single trait + wild: Both trait die and wild die rolled 1 (no ace)
 * - Multi-die trait: More than half of all dice (including wild) rolled 1
 * - Single trait without wild: Trait die rolled 1 (marked as "possible" critical)
 */
export function getCriticalFailureStatus(
  result: SavageRollResult,
  outcomeIndex: number = 0
): CriticalFailureStatus {
  const { mode, dieChains, outcomes, wildDieEnabled } = result;
  
  // Only check critical failures for trait tests
  if (mode !== "TRAIT") {
    return { isCritical: false, isPossible: false };
  }
  
  // Get the specific outcome we're checking
  const outcome = outcomes[outcomeIndex];
  if (!outcome) {
    return { isCritical: false, isPossible: false };
  }
  
  const regularChains = dieChains.filter(c => !c.isWildDie);
  const wildChain = dieChains.find(c => c.isWildDie);
  
  // Single die trait test
  if (regularChains.length === 1) {
    const traitChain = regularChains[0];
    const traitRolled1 = traitChain.rolls[0] === 1 && traitChain.rolls.length === 1;
    
    if (wildDieEnabled && wildChain) {
      // With wild die: critical if both rolled 1
      const wildRolled1 = wildChain.rolls[0] === 1 && wildChain.rolls.length === 1;
      
      if (traitRolled1 && wildRolled1) {
        return { 
          isCritical: true, 
          isPossible: false,
          reason: "Both trait and wild die rolled 1"
        };
      }
    } else if (traitRolled1) {
      // Without wild die: possible critical
      return { 
        isCritical: false, 
        isPossible: true,
        reason: "Trait die rolled 1 (no wild die)"
      };
    }
  }
  
  // Multi-die trait test
  if (regularChains.length > 1) {
    // Count how many dice rolled 1 (first roll only, no explosions)
    let onesCount = 0;
    let totalDice = regularChains.length;
    
    // Check all regular dice
    regularChains.forEach(chain => {
      if (chain.rolls[0] === 1 && chain.rolls.length === 1) {
        onesCount++;
      }
    });
    
    // Check wild die if present
    if (wildDieEnabled && wildChain) {
      totalDice++;
      const wildIsOne = wildChain.rolls[0] === 1 && wildChain.rolls.length === 1;
      if (wildIsOne) {
        onesCount++;
      }
      
      // Critical if more than half of all dice (including wild) are 1s
      if (onesCount > totalDice / 2) {
        return { 
          isCritical: true, 
          isPossible: false,
          reason: `${onesCount} of ${totalDice} dice rolled 1`
        };
      }
    } else {
      // No wild die - check if it would be a critical with a hypothetical wild die
      // This means checking if ones > (total + 1) / 2
      const hypotheticalTotal = totalDice + 1;
      if (onesCount > hypotheticalTotal / 2) {
        return {
          isCritical: false,
          isPossible: true,
          reason: `${onesCount} of ${totalDice} dice rolled 1 (no wild die)`
        };
      }
    }
  }
  
  return { isCritical: false, isPossible: false };
}

/**
 * Helper to format critical failure indicator for display
 */
export function formatCriticalIndicator(
  status: CriticalFailureStatus,
  verbose: boolean = false
): { text: string; color: string } | null {
  if (status.isCritical) {
    return {
      text: verbose ? "CRIT FAIL" : "CRIT",
      color: "#f44336" // Error red
    };
  }
  
  if (status.isPossible) {
    return {
      text: verbose ? "POSSIBLE CRIT" : "CRIT?",
      color: "#ff9800" // Warning amber
    };
  }
  
  return null;
}