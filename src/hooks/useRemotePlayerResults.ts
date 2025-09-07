import { useMemo } from "react";
import { SavageRollResult, PlayerRollResult } from "../types/SavageWorldsTypes";

/**
 * Hook to reconstruct a SavageRollResult from remote player metadata
 */
export function useRemotePlayerResults(
  currentRollResult?: PlayerRollResult,
  finishedRolling: boolean = false
): SavageRollResult | undefined {
  
  return useMemo(() => {
    // Don't show any result if rolling isn't finished - prevents flashing old results
    return (!currentRollResult || !finishedRolling) ? undefined : {
      ...currentRollResult,
      isComplete: finishedRolling,
    };
    
  }, [currentRollResult, finishedRolling]);
}