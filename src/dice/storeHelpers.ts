import { DieChain, RollOutcome, ExplosionResult } from "../types/SavageWorldsTypes";
import { Die } from "../types/Die";
import { DiceThrow } from "../types/DiceThrow";
import { DiceType } from "../types/DiceType";
import { getRandomDiceThrow } from "../helpers/DiceThrower";
import { } from "../helpers/explosionHelpers";
import { DEFAULT_DICE_STYLE, EXPLOSION_SPEED_MULTIPLIER } from "../constants/savageWorlds";

// Helper function to update explosion results
export function updateExplosionResults(
  explosionResults: Record<string, ExplosionResult>,
  parentDieId: string,
  value: number,
  dieType: DiceType,
  isWildDie?: boolean
) {
  if (!explosionResults[parentDieId]) {
    explosionResults[parentDieId] = {
      dieId: parentDieId,
      dieType: dieType,
      rolls: [value],
      total: value,
      exploded: false,
      isWildDie: isWildDie,
    };
  } else {
    explosionResults[parentDieId].rolls.push(value);
    explosionResults[parentDieId].total += value;
  }
}

// Helper function to create explosion die
export function createExplosionDie(
  parentDieId: string,
  explosionCount: number,
  originalDie: Die,
  _dieIndex: number
): { die: Die; throw: DiceThrow } {
  const explosionId = `${parentDieId}_explosion_${explosionCount + 1}`;
  const newDie: Die = {
    id: explosionId,
    type: originalDie.type,
    style: originalDie.style || DEFAULT_DICE_STYLE
  };
  
  const diceThrow = getRandomDiceThrow(EXPLOSION_SPEED_MULTIPLIER);
  
  return { die: newDie, throw: diceThrow };
}

// Helper function to get parent die ID
export function getParentDieId(id: string): string {
  if (id.includes('_explosion_')) {
    return id.split('_explosion_')[0];
  }
  return id;
}

// Helper function to get root die ID (for explosion seed calculation)
export function getRootDieId(parentDieId: string): string {
  let rootDieId = parentDieId;
  while (rootDieId.includes('_explosion_')) {
    rootDieId = rootDieId.substring(0, rootDieId.lastIndexOf('_explosion_'));
  }
  return rootDieId;
}

// Helper function to create a single roll outcome with optional target number
export function createRollOutcome(
  chains: DieChain[],
  modifier: number,
  replacedByWild: boolean,
  targetNumber?: number
): RollOutcome {
  const total = chains.reduce((sum, chain) => sum + chain.total, 0) + modifier;
  const outcome: RollOutcome = {
    chains,
    modifier,
    total,
    replacedByWild,
  };
  
  if (targetNumber !== undefined) {
    outcome.success = total >= targetNumber;
    if (outcome.success) {
      outcome.raises = Math.floor((total - targetNumber) / 4);
    }
  }
  
  return outcome;
}

// Helper function to handle single die trait test (trait vs wild)
export function processSingleDieTraitTest(
  regularChains: DieChain[],
  wildChain: DieChain | undefined,
  modifier: number,
  targetNumber?: number
): RollOutcome[] {
  const traitChain = regularChains[0];
  let bestChain = traitChain;
  let replacedByWild = false;
  
  if (wildChain && wildChain.total > traitChain.total) {
    bestChain = wildChain;
    replacedByWild = true;
  }
  
  const outcome = createRollOutcome([bestChain], modifier, replacedByWild, targetNumber);
  return [outcome];
}

// Helper function to find worst result index
export function findWorstResultIndex(results: RollOutcome[]): number {
  let worstIndex = 0;
  let worstTotal = results[0].total;
  
  for (let i = 1; i < results.length; i++) {
    if (results[i].total < worstTotal) {
      worstIndex = i;
      worstTotal = results[i].total;
    }
  }
  
  return worstIndex;
}

// Helper function to handle multi-die trait test
export function processMultiDieTraitTest(
  regularChains: DieChain[],
  wildChain: DieChain | undefined,
  modifier: number,
  targetNumber?: number
): RollOutcome[] {
  // Create initial results for each regular die
  const results: RollOutcome[] = regularChains.map(chain => 
    createRollOutcome([chain], modifier, false, targetNumber)
  );
  
  // If there's a wild die, it can replace the worst result
  if (wildChain && results.length > 0) {
    const worstIndex = findWorstResultIndex(results);
    const worstTotal = results[worstIndex].total;
    const wildTotal = wildChain.total + modifier;
    
    if (wildTotal > worstTotal) {
      // Replace worst result with wild die result
      const wildOutcome = createRollOutcome([wildChain], modifier, true, targetNumber);
      results[worstIndex] = wildOutcome;
    }
  }
  
  return results;
}

// Helper function to handle damage roll
export function processDamageRoll(
  dieChains: DieChain[],
  modifier: number,
  targetNumber?: number
): RollOutcome[] {
  const outcome = createRollOutcome(dieChains, modifier, false, targetNumber);
  return [outcome];
}