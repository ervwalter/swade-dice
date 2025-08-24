/**
 * Determines if a roll is a trait test based on the dice info
 * Shared logic used by both useDiceMode hook and DiceRollSync
 */
export function isTraitTestFromDiceInfo(dieInfo: Record<string, any>): boolean {
  const originalDice = Object.values(dieInfo).filter(info => !info.parentDieId);
  const originalNonWildDiceCount = originalDice.filter(info => !info.isWildDie).length;
  return originalNonWildDiceCount <= 1;
}