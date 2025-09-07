import { useMemo } from "react";
import { useDiceRollStore } from "../dice/store";
import { useDiceControlsStore } from "../controls/store";
import { SavageRollResult, RollOutcome } from "../types/SavageWorldsTypes";

/**
 * Hook to get the current Savage Worlds roll result with dynamic TN/modifier recalculation
 */
export function useSavageWorldsResults(): SavageRollResult | null {
  const currentRollResult = useDiceRollStore((state) => state.currentRollResult);
  
  // Get current TN, modifiers, and wild die setting from controls
  const currentTargetNumber = useDiceControlsStore((state) => state.targetNumber);
  const currentTraitModifier = useDiceControlsStore((state) => state.traitModifier);
  const currentDamageModifier = useDiceControlsStore((state) => state.damageModifier);
  const currentWildDieEnabled = useDiceControlsStore((state) => state.wildDieEnabled);
  
  return useMemo(() => {
    if (!currentRollResult) return null;
    
    const isTraitTest = currentRollResult.mode === "TRAIT";
    const currentModifier = isTraitTest ? currentTraitModifier : currentDamageModifier;
    
    // Always recalculate when settings change - keep it simple!
    
    // Need to recalculate outcomes with new values
    let updatedOutcomes: RollOutcome[];
    
    // For trait tests, check if there's a wild die - if so, always use the multi-die logic
    const hasWildDie = currentRollResult.dieChains.some(c => c.isWildDie);
    
    if (isTraitTest && hasWildDie) {
      // Multi-die trait test - need to recalculate which die wins, considering wild die setting
      const regularChains = currentRollResult.dieChains.filter(c => !c.isWildDie);
      const wildChain = currentRollResult.dieChains.find(c => c.isWildDie);
      
      const results: RollOutcome[] = regularChains.map(chain => {
        const total = chain.total + currentModifier;
        const outcome: RollOutcome = {
          chains: [chain],
          modifier: currentModifier,
          total,
          replacedByWild: false,
        };
        
        if (currentTargetNumber !== undefined) {
          outcome.success = total >= currentTargetNumber;
          if (outcome.success) {
            outcome.raises = Math.floor((total - currentTargetNumber) / 4);
          } else {
            outcome.raises = 0;
          }
        }
        
        return outcome;
      });
      
      // If wild die is enabled and exists, check if it can replace the worst result
      if (currentWildDieEnabled && wildChain && results.length > 0) {
        // Find the worst result (lowest total)
        let worstIndex = 0;
        let worstTotal = results[0].total;
        
        for (let i = 1; i < results.length; i++) {
          if (results[i].total < worstTotal) {
            worstIndex = i;
            worstTotal = results[i].total;
          }
        }
        
        // Check if wild die would be better
        const wildTotal = wildChain.total + currentModifier;
        if (wildTotal > worstTotal) {
          // Replace worst result with wild die result
          const wildOutcome: RollOutcome = {
            chains: [wildChain],
            modifier: currentModifier,
            total: wildTotal,
            replacedByWild: true,
          };
          
          if (currentTargetNumber !== undefined) {
            wildOutcome.success = wildTotal >= currentTargetNumber;
            if (wildOutcome.success) {
              wildOutcome.raises = Math.floor((wildTotal - currentTargetNumber) / 4);
            } else {
              wildOutcome.raises = 0;
            }
          }
          
          results[worstIndex] = wildOutcome;
        }
      }
      
      updatedOutcomes = results;
      
    } else {
      // Single trait test or damage roll - simple recalculation
      updatedOutcomes = currentRollResult.outcomes.map(outcome => {
        // Recalculate total with new modifier
        const baseTotal = outcome.total - (currentRollResult.modifier || 0);
        const newTotal = baseTotal + currentModifier;
        
        const updatedOutcome: RollOutcome = {
          ...outcome,
          modifier: currentModifier,
          total: newTotal,
        };
        
        // Recalculate success/raises with new TN if it's a trait test
        if (isTraitTest && currentTargetNumber !== undefined) {
          updatedOutcome.success = newTotal >= currentTargetNumber;
          if (updatedOutcome.success) {
            updatedOutcome.raises = Math.floor((newTotal - currentTargetNumber) / 4);
          } else {
            updatedOutcome.raises = 0;
          }
        }
        
        return updatedOutcome;
      });
    }
    
    return {
      ...currentRollResult,
      targetNumber: currentTargetNumber,
      modifier: currentModifier,
      outcomes: updatedOutcomes,
      wildDieEnabled: currentWildDieEnabled,
    };
  }, [currentRollResult, currentTargetNumber, currentTraitModifier, currentDamageModifier, currentWildDieEnabled]);
}