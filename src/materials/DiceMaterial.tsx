import { DiceStyle } from "../types/DiceStyle";
import { BaseMaterial } from "./BaseMaterial";
import { GlassMaterial } from "./glass/GlassMaterial";

export function DiceMaterial({ diceStyle }: { diceStyle: DiceStyle }) {
  // Glass material is unique and kept separate
  if (diceStyle === "GLASS") {
    return <GlassMaterial />;
  }

  // All other materials use the consolidated BaseMaterial
  return <BaseMaterial materialKey={diceStyle} />;
}
