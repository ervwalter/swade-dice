import { DiceType } from "./DiceType";

/**
 * A single die chain (initial roll + any explosions)
 */
export interface DieChain {
  dieId: string;
  dieType: DiceType;
  rolls: number[];  // [initial, explosion1, explosion2, ...]
  total: number;    // Sum of all rolls
  isWildDie?: boolean;
}

/**
 * A single result (could be a trait test or damage component)
 */
export interface RollOutcome {
  chains: DieChain[];     // The die chain(s) that contributed to this result
  modifier: number;       // Modifier applied to this result
  total: number;          // Final total including modifier
  success?: boolean;      // vs target number
  raises?: number;        // Number of raises
  replacedByWild?: boolean;  // For trait tests - was worst die replaced by wild
}

/**
 * Savage Worlds roll modes
 */
export type SavageRollMode = "TRAIT" | "DAMAGE" | "STANDARD";

/**
 * Complete Savage Worlds roll result
 */
export interface SavageRollResult {
  mode: SavageRollMode;
  
  // All the die chains (regular dice + wild die if present)
  dieChains: DieChain[];
  
  // The actual results/outcomes
  // For TRAIT mode with multiple dice: array of independent test results
  // For TRAIT mode with single die: single result (best of trait vs wild)
  // For DAMAGE mode: single result (sum of all dice)
  outcomes: RollOutcome[];
  
  // Roll configuration
  targetNumber?: number;
  modifier?: number;
  wildDieEnabled?: boolean;
  
  // Completion status
  isComplete: boolean;
  
  // Timestamp
  timestamp: number;
}

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

// Plugin-specific types for OBR integration
export interface PlayerRollResult extends SavageRollResult {
  // Additional fields that might be added by the plugin layer
}

export interface RollHistoryEntry {
  id: string;
  playerId: string;
  player: any; // Import from OBR SDK would create circular dependency, keeping as any
  result: PlayerRollResult;
  timestamp: number;
  addedAt: number;
  isFading?: boolean;
  isHidden?: boolean;
}