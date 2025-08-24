import { Die } from "./Die";
import { DiceTransform } from "./DiceTransform";
import { DiceThrow } from "./DiceThrow";

export type DiceStatus = 'pending' | 'rolling' | 'finished' | 'exploding';

export interface SingleDieState {
  die: Die;
  status: DiceStatus;
  value?: number;
  transform?: DiceTransform;
  throw: DiceThrow;
  isWildDie?: boolean;
  parentDieId?: string;  // For tracking explosion chains
  explosionIndex?: number; // Which explosion this is (0 for original, 1 for first explosion, etc)
}

export interface ExplosionChain {
  dieId: string;
  dieType: string;
  rolls: number[];  // All rolls in the chain
  total: number;
  isWildDie?: boolean;
}