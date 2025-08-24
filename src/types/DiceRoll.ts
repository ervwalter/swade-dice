import { Dice } from "./Dice";

/**
 * The roll of a set of dice.
 * See `Dice` type for examples of usage
 */
export interface DiceRoll extends Dice {
  hidden?: boolean;
  /**
   * Master seed for deterministic random generation
   * Used to ensure all clients generate identical physics throws
   */
  masterSeed?: number;
  /**
   * Savage Worlds configuration for this roll
   * Sent separately from dice to allow live updates
   */
  savageWorldsConfig?: {
    rollType: "trait" | "damage";
    modifier: number;
    targetNumber: number;
    wildDieId?: string;  // ID of the wild die in the dice array
  };
}
