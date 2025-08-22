import { Dice, isDice } from "../types/Dice";
import { isDie } from "../types/Die";

/**
 * Recursively get the final result for a roll of dice
 * @param dice
 * @param values A mapping of Die ID to their rolled value
 * @returns
 */
export function getCombinedDiceValue(
  dice: Dice,
  values: Record<string, number>
): number | null {

  let currentValues: number[] = [];
  for (const dieOrDice of dice.dice) {
    if (isDie(dieOrDice)) {
      const value = values[dieOrDice.id];
      if (value !== undefined) {
        if (value === 0 && dieOrDice.type === "D10") {
          currentValues.push(10);
        } else {
          currentValues.push(value);
        }
      }
    } else if (isDice(dieOrDice)) {
      const value = getCombinedDiceValue(dieOrDice, values);
      if (value !== null) {
        currentValues.push(value);
      }
    }
  }

  const bonus = dice.bonus || 0;

  if (currentValues.length === 0 || dice.combination === "NONE") {
    if (dice.bonus === undefined) {
      return null;
    } else {
      return dice.bonus;
    }
  } else if (dice.combination === "HIGHEST") {
    return Math.max(...currentValues) + bonus;
  } else if (dice.combination === "LOWEST") {
    return Math.min(...currentValues) + bonus;
  } else {
    return currentValues.reduce((a, b) => a + b) + bonus;
  }
}
