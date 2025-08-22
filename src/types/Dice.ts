import { isPlainObject } from "is-plain-object";

import { Die } from "./Die";

/**
 * The roll of a set of dice.
 * @example <caption>2d6 with a +6 bonus to the entire roll</caption>
 * {
 *  dice: [
 *    {id: "123", set: "NEBULA", type: "D6"},
 *    {id: "234", set: "NEBULA", type: "D6"},
 *  ],
 *  bonus: 6
 * }
 *
 * @example <caption>1d6+3 + 1d8</caption>
 * {
 *  dice: [
 *    {
 *      dice: [{id: "123", set: "NEBULA", type: "D6"}],
 *      bonus: 3
 *    },
 *    {id: "234", set: "NEBULA", type: "D8"}]
 *  ],
 * }
 *
 * @example <caption>A D12 rolled twice taking the highest with a bonus +6 to the roll</caption>
 * {
 *  dice: [
 *    {id: "123", set: "NEBULA", type: "D12"},
 *    {id: "234", set: "NEBULA", type: "D12"}
 *  ],
 *  combination: "HIGHEST",
 *  bonus: 6
 * }
 *
 * @example <caption>A single D12 rolled with an added D10</caption>
 * {
 *  dice: [
 *    {id: "123", set: "NEBULA", type: "D12"},
 *    {id: "234", set: "NEBULA", type: "D10"}
 *  ],
 * }
 *
 */
export interface Dice {
  dice: (Die | Dice)[];
  /**
   * How to combine the dice for this roll (defaults to `SUM` if undefined)
   */
  combination?: "HIGHEST" | "LOWEST" | "SUM" | "NONE";
  bonus?: number;
}

export function isDice(value: any): value is Dice {
  return isPlainObject(value) && Array.isArray(value.dice);
}
