import { isPlainObject } from "is-plain-object";

import { DiceStyle } from "./DiceStyle";
import { DiceType } from "./DiceType";

export interface Die {
  id: string;
  style: DiceStyle;
  type: DiceType;
}

export function isDie(value: unknown): value is Die {
  return (
    isPlainObject(value) &&
    typeof (value as Record<string, unknown>).id === "string" &&
    typeof (value as Record<string, unknown>).style === "string" &&
    typeof (value as Record<string, unknown>).type === "string"
  );
}
