import { DiceType } from "./DiceType";

export interface DiceChain {
  dieId: string;
  dieType: DiceType;
  rolls: number[];
  total: number;
  isWildDie?: boolean;
}

export interface SavageWorldsResultsData {
  mainChains: DiceChain[];
  wildChains: DiceChain[];
  isTraitTest: boolean;
  modifier: number;
  mainTotal: number;
  finalResult: number;
  isComplete: boolean;
  success: boolean;
  raises: number;
  targetNumber: number;
  hasResults: boolean;
}