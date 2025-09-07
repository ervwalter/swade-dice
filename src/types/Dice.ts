import { isPlainObject } from "is-plain-object";

import { Die } from "./Die";

/**
 * The roll of a set of dice.
 * @example <caption>2d6 rolled together</caption>
 * {
 *  dice: [
 *    {id: "123", set: "NEBULA", type: "D6"},
 *    {id: "234", set: "NEBULA", type: "D6"},
 *  ]
 * }
 *
 * @example <caption>A D12 rolled twice taking the highest</caption>
 * {
 *  dice: [
 *    {id: "123", set: "NEBULA", type: "D12"},
 *    {id: "234", set: "NEBULA", type: "D12"}
 *  ],
 *  combination: "HIGHEST"
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
}

export function isDice(value: unknown): value is Dice {
  return (
    isPlainObject(value) && 
    Array.isArray((value as Record<string, unknown>).dice) &&
    (
      (value as Record<string, unknown>).combination === undefined ||
      typeof (value as Record<string, unknown>).combination === "string"
    )
  );
}
