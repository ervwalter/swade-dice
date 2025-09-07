import OBR, { Player } from "@owlbear-rodeo/sdk";
import { useEffect, useRef, useState } from "react";
import { useDiceRollStore } from "../dice/store";
import { useSavageWorldsResults } from "../hooks/useSavageWorldsResults";
import { getDieFromDice } from "../helpers/getDieFromDice";
import { getPluginId } from "./getPluginId";
import { PlayerRollResult } from "../types/SavageWorldsTypes";

export interface RollBroadcast {
  playerId: string;           // Player's connection ID
  player: Player;             // Full player object (name, color, etc.)
  result: PlayerRollResult;   // Contains timestamp field
}

/** Sync the current dice roll via broadcasts */
export function DiceRollSync() {
  const prevIds = useRef<string[]>([]);
  const prevResultTimestamp = useRef<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  
  // Get the current result (with dynamic recalculation)
  const currentResult = useSavageWorldsResults();

  // Get current player info
  useEffect(() => {
    const getCurrentPlayer = async () => {
      try {
        const [name, color, id] = await Promise.all([
          OBR.player.getName(),
          OBR.player.getColor(),
          OBR.player.getId()
        ]);
        
        setCurrentPlayer({
          connectionId: id,
          id: id,
          name: name,
          color: color,
          metadata: {}
        } as Player);
      } catch {
      }
    };
    
    getCurrentPlayer();
  }, []);
  
  useEffect(
    () =>
      useDiceRollStore.subscribe((state) => {
        let shouldBroadcast = false;
        
        if (!state.roll) {
          // Clear when no roll - we could broadcast a "clear" message but it's not needed
          // since roll history will naturally age out
          prevIds.current = [];
          prevResultTimestamp.current = 0;
        } else {
          // Include both original dice and explosion dice in the ID list
          const originalIds = getDieFromDice(state.roll).map((die) => die.id);
          const explosionIds = state.explosionDice.map((die) => die.id);
          const ids = [...originalIds, ...explosionIds];
          
          // Only broadcast when the roll is COMPLETE
          const isComplete = 
            Object.values(state.rollValues).every((value) => value !== null) &&
            state.pendingDice.length === 0;
          
          if (isComplete) {
            // Check if this is a new completed roll or if results have changed
            const idsChanged = 
              prevIds.current.length !== ids.length ||
              !ids.every((id, index) => id === prevIds.current[index]);
            
            const resultsChanged = 
              state.currentRollResult && 
              state.currentRollResult.timestamp !== prevResultTimestamp.current;
            
            if (idsChanged || resultsChanged) {
              shouldBroadcast = true;
              prevIds.current = ids;
              if (state.currentRollResult) {
                prevResultTimestamp.current = state.currentRollResult.timestamp;
              }
            }
          }
        }

        if (shouldBroadcast && currentPlayer && currentResult && !state.roll?.hidden) {
          // Broadcast the roll result to all players
          const broadcast: RollBroadcast = {
            playerId: currentPlayer.connectionId,
            player: currentPlayer,
            result: currentResult,
          };
          
          console.log("🎲 Broadcasting roll (store subscription):", broadcast);
          OBR.broadcast.sendMessage(getPluginId("roll-result"), broadcast, {
            destination: "ALL" // Include self in broadcast
          });
        }
      }),
    [currentResult, currentPlayer]
  );

  // Broadcast when currentResult changes AND roll is complete
  useEffect(() => {
    const rollState = useDiceRollStore.getState();
    const isHidden = rollState.roll?.hidden;
    
    if (currentResult && currentResult.isComplete && currentPlayer && !isHidden) {
      const broadcast: RollBroadcast = {
        playerId: currentPlayer.connectionId,
        player: currentPlayer,
        result: currentResult,
      };
      
      console.log("🎲 Broadcasting roll (result change):", broadcast);
      OBR.broadcast.sendMessage(getPluginId("roll-result"), broadcast, {
        destination: "ALL"
      });
    }
  }, [currentResult, currentPlayer]);

  return null;
}