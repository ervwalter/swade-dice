import OBR, { Player } from "@owlbear-rodeo/sdk";
import { useEffect, useRef, useState } from "react";
import { useDiceRollStore } from "../dice/store";
import { useSavageWorldsResults } from "../hooks/useSavageWorldsResults";
import { getDieFromDice } from "../helpers/getDieFromDice";
import { getPluginId } from "./getPluginId";
import { useRollHistoryStore } from "./rollHistoryStore";

/** Sync the current dice roll to the plugin */
export function DiceRollSync() {
  const prevIds = useRef<string[]>([]);
  const prevResultTimestamp = useRef<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  
  // Get the current result (with dynamic recalculation)
  const currentResult = useSavageWorldsResults();
  
  // Get roll history store
  const addOrUpdateRoll = useRollHistoryStore((state) => state.addOrUpdateRoll);

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
        let shouldSync = false;
        
        if (!state.roll) {
          // Clear metadata when no roll
          shouldSync = true;
          prevIds.current = [];
          prevResultTimestamp.current = 0;
        } else {
          // Include both original dice and explosion dice in the ID list
          const originalIds = getDieFromDice(state.roll).map((die) => die.id);
          const explosionIds = state.explosionDice.map((die) => die.id);
          const ids = [...originalIds, ...explosionIds];
          
          // Only sync when the roll is COMPLETE
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
              shouldSync = true;
              prevIds.current = ids;
              if (state.currentRollResult) {
                prevResultTimestamp.current = state.currentRollResult.timestamp;
              }
            }
          }
        }

        if (shouldSync) {
          // Hide values if needed
          const throws = state.roll?.hidden ? undefined : state.rollThrows;
          const values = state.roll?.hidden ? undefined : state.rollValues;
          const transforms = state.roll?.hidden ? undefined : state.rollTransforms;
          // Use the dynamically recalculated result instead of the static one
          const resultToSend = state.roll?.hidden ? undefined : currentResult;
          
          OBR.player.setMetadata({
            [getPluginId("roll")]: state.roll,
            [getPluginId("rollThrows")]: throws,
            [getPluginId("rollValues")]: values,
            [getPluginId("rollTransforms")]: transforms,
            [getPluginId("currentRollResult")]: resultToSend,
          });

          // Note: Roll history is handled in the second useEffect below
          // since currentResult (from hook) isn't available in this subscription callback
        }
      }),
    [currentResult, currentPlayer, addOrUpdateRoll]
  );

  // Sync results and manage roll history
  useEffect(() => {
    const rollState = useDiceRollStore.getState();
    const hasCompletedRoll = rollState.roll && rollState.currentRollResult;
    
    
    if (hasCompletedRoll && currentResult) {
      // Send updated result to remote players
      const resultToSend = rollState.roll?.hidden ? undefined : currentResult;
      
      
      OBR.player.setMetadata({
        [getPluginId("currentRollResult")]: resultToSend,
      });

      // Note: Roll history is managed by PopoverTrays reading from player metadata
      // since the popover runs in a separate iframe and can't access this store
    } else if (!rollState.roll) {
      // Clear result when there's no active roll
      OBR.player.setMetadata({
        [getPluginId("currentRollResult")]: undefined,
      });
    }
  }, [currentResult, currentPlayer, addOrUpdateRoll]);

  return null;
}