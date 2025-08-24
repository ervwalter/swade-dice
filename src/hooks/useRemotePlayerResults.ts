import { useMemo } from "react";
import { DiceType } from "../types/DiceType";

interface DiceChain {
  dieId: string;
  dieType: DiceType;
  rolls: number[];
  total: number;
  isWildDie?: boolean;
}

/**
 * Hook to calculate Savage Worlds results from remote player data
 * Mimics the logic of useSavageWorldsResults but uses metadata instead of store
 */
export function useRemotePlayerResults(
  explosionResults: any,
  rollValues: any,
  dieInfo: any,
  controlSettings: any,
  finishedRolling: boolean
) {
  // Convert results to display chains - handle both explosion and non-explosion cases
  const chains: DiceChain[] = useMemo(() => {
    if (!explosionResults || !rollValues) return [];
    
    // If we have explosion results, use those
    if (Object.keys(explosionResults).length > 0) {
      return Object.values(explosionResults).map((result: any) => ({
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
      if (value !== null && dieInfo && dieInfo[dieId]) {
        regularChains.push({
          dieId,
          dieType: dieInfo[dieId].die.type,
          rolls: [value as number],
          total: value as number,
          isWildDie: dieInfo[dieId].isWildDie,
        });
      }
    }
    return regularChains;
  }, [explosionResults, rollValues, dieInfo]);
  
  // Separate main dice and wild die chains
  const { mainChains, wildChains } = useMemo(() => {
    if (!chains || chains.length === 0) {
      return { mainChains: [], wildChains: [] };
    }
    const main: DiceChain[] = chains.filter((c: DiceChain) => !c.isWildDie);
    const wild: DiceChain[] = controlSettings?.wildDieEnabled ? chains.filter((c: DiceChain) => c.isWildDie) : [];
    return { mainChains: main, wildChains: wild };
  }, [chains, controlSettings?.wildDieEnabled]);
  
  // Use the appropriate modifier based on the roll type
  const isTraitTest = controlSettings?.isTraitTest || false;
  const modifier = isTraitTest ? 
    (controlSettings?.traitModifier || 0) : 
    (controlSettings?.damageModifier || 0);
  const targetNumber = controlSettings?.targetNumber || 4;
  
  // Calculate totals
  const mainTotal = mainChains.reduce((sum: number, chain: DiceChain) => sum + chain.total, 0);
  const wildTotal = wildChains.reduce((sum: number, chain: DiceChain) => sum + chain.total, 0);
  
  // For trait tests, use the best die; for damage, use all dice
  const bestTotal = isTraitTest ? Math.max(mainTotal, wildTotal || 0) : mainTotal;
  const finalResult = bestTotal + modifier;
  
  // Calculate success and raises (only for trait tests)
  const success = isTraitTest && finishedRolling ? finalResult >= targetNumber : false;
  const raises = isTraitTest && finishedRolling && success ? Math.floor((finalResult - targetNumber) / 4) : 0;
  
  // Check if we have any results to display
  const hasResults = chains.length > 0 && rollValues && !Object.values(rollValues).every((v: any) => v === null);
  
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
    isComplete: finishedRolling,
    success,
    raises,
    targetNumber,
    hasResults,
  };
}