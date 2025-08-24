import { useCallback } from "react";
import { DiceTransform } from "../types/DiceTransform";
import { DiceRoll } from "./DiceRoll";
import { useDiceRollStore } from "./store";
import { Dice } from "./Dice";

/** Dice roll based off of the values from the dice roll store */
export function InteractiveDiceRoll() {
  const roll = useDiceRollStore((state) => state.roll);
  const rollThrows = useDiceRollStore((state) => state.rollThrows);
  const explosionDice = useDiceRollStore((state) => state.explosionDice);
  const finishedDice = useDiceRollStore((state) => state.finishedDice);
  const checkAndProcessExplosion = useDiceRollStore((state) => state.checkAndProcessExplosion);
  
  // Handle die finished - check for explosions and update store
  const handleDieFinished = useCallback((id: string, value: number, transform: DiceTransform) => {
    // Check for explosions and update Savage Worlds state in store
    // This will also spawn explosion dice if needed
    checkAndProcessExplosion(id, value, transform);
  }, [checkAndProcessExplosion]);

  if (!roll) {
    return null;
  }

  return (
    <DiceRoll
      roll={roll}
      rollThrows={rollThrows}
      explosionDice={explosionDice}
      finishedDice={finishedDice}
      onRollFinished={handleDieFinished}
      Dice={Dice}
    />
  );
}