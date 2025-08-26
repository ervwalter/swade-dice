import { useMemo } from "react";
import { SavageRollResult, PlayerRollResult } from "../types/SavageWorldsTypes";

/**
 * Hook to reconstruct a SavageRollResult from remote player metadata
 */
export function useRemotePlayerResults(
  currentRollResult: PlayerRollResult | null,
  finishedRolling: boolean
): SavageRollResult | null {
  
  return useMemo(() => {
    // Don't show any result if rolling isn't finished - prevents flashing old results
    if (!currentRollResult || !finishedRolling) return null;
    
    // Add isComplete flag based on finished rolling state
    return {
      ...currentRollResult,
      isComplete: finishedRolling,
    };
    
  }, [currentRollResult, finishedRolling]);
}