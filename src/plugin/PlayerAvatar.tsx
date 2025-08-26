import { Player } from "@owlbear-rodeo/sdk";

import { usePlayerDice } from "./usePlayerDice";
import { useRemotePlayerResults } from "../hooks/useRemotePlayerResults";
import { PlayerRollPill } from "./PlayerRollPill";

export function PlayerAvatar({
  player,
  onSelect,
}: {
  player: Player;
  onSelect: () => void;
}) {
  const { 
    finishedRolling,
    currentRollResult
  } = usePlayerDice(player);
  
  const result = useRemotePlayerResults(
    currentRollResult,
    finishedRolling
  );

  return (
    <PlayerRollPill
      player={player}
      result={result}
      onClick={onSelect}
      showTimestamp={false}
    />
  );
}
