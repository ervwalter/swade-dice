import { DiceType } from "./DiceType";

/**
 * Represents the result of a single die that can explode
 */
export interface ExplosionResult {
  dieId: string;
  dieType: DiceType;
  rolls: number[];  // Array of individual rolls in explosion chain
  total: number;
  exploded: boolean;
  isWildDie?: boolean;
}

/**
 * Savage Worlds roll modes
 */
export type SavageRollMode = "TRAIT" | "DAMAGE";

/**
 * Configuration for a trait test roll
 */
export interface TraitTestConfig {
  traitDie: DiceType;
  includeWildDie: boolean;
  targetNumber?: number;
  modifier?: number;  // +2 for skill bonus, -2 for wounds, etc.
}

/**
 * Configuration for a damage roll
 */
export interface DamageRollConfig {
  dice: Array<{
    type: DiceType;
    count: number;
  }>;
  modifier?: number;  // +1 for STR bonus, +2 for magic weapon, etc.
}

/**
 * Result of a Savage Worlds roll
 */
export interface SavageRollResult {
  mode: SavageRollMode;
  explosions: ExplosionResult[];
  traitDieResult?: ExplosionResult;
  wildDieResult?: ExplosionResult;
  bestResult?: ExplosionResult;  // For trait tests - the better of trait or wild
  modifier?: number;
  total: number;  // Including modifier
  targetNumber?: number;
  success?: boolean;
  raises?: number;
  timestamp: number;
}