import { useMemo } from "react";
import { useDiceRollStore } from "../dice/store";
import { useDiceControlsStore } from "../controls/store";
import { useDiceMode } from "./useDiceMode";
import { DiceType } from "../types/DiceType";

interface DiceChain {
  dieId: string;
  dieType: DiceType;
  rolls: number[];
  total: number;
  isWildDie?: boolean;
}

export interface SavageWorldsResults {
  chains: DiceChain[];
  mainChains: DiceChain[];
  wildChains: DiceChain[];
  isTraitTest: boolean;
  modifier: number;
  mainTotal: number;
  wildTotal: number;
  bestTotal: number;
  finalResult: number;
  isComplete: boolean;
  success: boolean;
  raises: number;
  targetNumber: number;
  hasResults: boolean;
}

/**
 * Unified hook to calculate Savage Worlds roll results
 * Used by both the control bar summary and detailed results display
 */
export function useSavageWorldsResults(): SavageWorldsResults {
  const explosionResults = useDiceRollStore((state) => state.explosionResults);
  const rollValues = useDiceRollStore((state) => state.rollValues);
  const dieInfo = useDiceRollStore((state) => state.dieInfo);
  const pendingDice = useDiceRollStore((state) => state.pendingDice);
  
  const wildDieEnabled = useDiceControlsStore((state) => state.wildDieEnabled);
  const traitModifier = useDiceControlsStore((state) => state.traitModifier);
  const damageModifier = useDiceControlsStore((state) => state.damageModifier);
  const targetNumber = useDiceControlsStore((state) => state.targetNumber);
  
  const { isTraitTest } = useDiceMode();
  
  // Convert results to display chains - handle both explosion and non-explosion cases
  const chains = useMemo(() => {
    // If we have explosion results, use those
    if (Object.keys(explosionResults).length > 0) {
      return Object.values(explosionResults).map(result => ({
        dieId: result.dieId,
        dieType: result.dieType,
        rolls: result.rolls,
        total: result.total,
        isWildDie: result.isWildDie,
      }));
    }
    
    // Otherwise, create chains from regular roll values
    const regularChains: DiceChain[] = [];
    for (const [dieId, value] of Object.entries(rollValues)) {
      if (value !== null && dieInfo[dieId]) {
        regularChains.push({
          dieId,
          dieType: dieInfo[dieId].die.type,
          rolls: [value],
          total: value,
          isWildDie: dieInfo[dieId].isWildDie,
        });
      }
    }
    return regularChains;
  }, [explosionResults, rollValues, dieInfo]);
  
  // Separate main dice and wild die chains
  const { mainChains, wildChains } = useMemo(() => {
    const main = chains.filter(c => !c.isWildDie);
    const wild = wildDieEnabled ? chains.filter(c => c.isWildDie) : [];
    return { mainChains: main, wildChains: wild };
  }, [chains, wildDieEnabled]);
  
  // Use the appropriate modifier based on the roll type
  const modifier = isTraitTest ? traitModifier : damageModifier;
  
  // Calculate totals
  const mainTotal = mainChains.reduce((sum, chain) => sum + chain.total, 0);
  const wildTotal = wildChains.reduce((sum, chain) => sum + chain.total, 0);
  
  // For trait tests, use the best die; for damage, use all dice
  const bestTotal = isTraitTest ? Math.max(mainTotal, wildTotal || 0) : mainTotal;
  const finalResult = bestTotal + (modifier || 0);
  
  // Check if all dice are complete
  const isComplete = pendingDice.length === 0;
  
  // Calculate success and raises (only for trait tests)
  const success = isTraitTest && isComplete ? finalResult >= targetNumber : false;
  const raises = isTraitTest && isComplete ? Math.floor((finalResult - targetNumber) / 4) : 0;
  
  // Check if we have any results to display
  const hasResults = chains.length > 0 && !Object.values(rollValues).every(v => v === null);
  
  return {
    chains,
    mainChains,
    wildChains,
    isTraitTest,
    modifier,
    mainTotal,
    wildTotal,
    bestTotal,
    finalResult,
    isComplete,
    success,
    raises,
    targetNumber,
    hasResults,
  };
}