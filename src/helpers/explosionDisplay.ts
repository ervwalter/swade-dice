import { DiceType } from "../types/DiceType";
import { ExplosionResult } from "../types/SavageWorldsTypes";

/**
 * Get the maximum value for a given die type
 */
export function getMaxValue(dieType: DiceType | string): number {
  switch (dieType) {
    case "D4": return 4;
    case "D6": return 6;
    case "D8": return 8;
    case "D10": return 10;
    case "D12": return 12;
    default: return 0;
  }
}

/**
 * Format an explosion chain for display
 * @param result The explosion result to format
 * @returns A formatted string showing the explosion chain
 */
export function formatExplosionChain(result: ExplosionResult): string {
  const parts = result.rolls.map((roll, index) => {
    const isMax = roll === getMaxValue(result.dieType);
    const isLastRoll = index === result.rolls.length - 1;
    const shouldShowExplosion = isMax && !isLastRoll;
    
    return `${roll}${shouldShowExplosion ? '💥' : ''}`;
  });
  
  return `${parts.join(' + ')} = ${result.total}`;
}

/**
 * Format a simple explosion chain without the total
 * @param rolls Array of roll values
 * @param dieType The type of die being rolled
 * @returns A formatted string showing just the rolls with explosion indicators
 */
export function formatExplosionRolls(rolls: number[], dieType: DiceType | string): string {
  const maxValue = getMaxValue(dieType);
  
  return rolls.map((roll, index) => {
    const isMax = roll === maxValue;
    const isLastRoll = index === rolls.length - 1;
    const shouldShowExplosion = isMax && !isLastRoll;
    
    return `${roll}${shouldShowExplosion ? '💥' : ''}`;
  }).join(' + ');
}