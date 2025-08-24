import { DiceType } from "../types/DiceType";

/**
 * Get the maximum value for a given dice type
 */
export function getMaxValueForDie(dieType: DiceType): number {
  switch (dieType) {
    case "D4":
      return 4;
    case "D6":
      return 6;
    case "D8":
      return 8;
    case "D10":
      return 10;
    case "D12":
      return 12;
    default:
      throw new Error(`Unknown die type: ${dieType}`);
  }
}

/**
 * Check if a die value should explode (equals its max value)
 */
export function shouldDieExplode(value: number, dieType: DiceType): boolean {
  return value === getMaxValueForDie(dieType);
}

/**
 * Maximum number of explosions allowed per die to prevent infinite loops
 */
export const MAX_EXPLOSIONS = 50;