import { Player } from "@owlbear-rodeo/sdk";

import { usePlayerDice } from "./usePlayerDice";
import { DiceRoll } from "../dice/DiceRoll";
import { Dice } from "../dice/Dice";

export function PlayerDiceRoll({ player }: { player?: Player }) {
  const {
    diceRoll,
    rollThrows,
    finishedRollTransforms,
    finishedRolling: _finishedRolling,
    transformsRef,
    explosionDice,
  } = usePlayerDice(player);

  if (!diceRoll || !rollThrows) {
    return null;
  }

  // For remote players, always display the final state - no physics simulation
  // We combine the explosion dice that were sent from the main player
  // Always use finishedTransforms to prevent animation
  return (
    <DiceRoll
      roll={diceRoll}
      rollThrows={rollThrows}
      explosionDice={explosionDice || []}
      finishedDice={[]} // Not needed for static display
      finishedTransforms={finishedRollTransforms || {}} // Always provide transforms to prevent physics
      transformsRef={transformsRef}
      onRollFinished={undefined} // No callbacks needed - just static display
      Dice={Dice} // Use the static Dice component
    />
  );
}
