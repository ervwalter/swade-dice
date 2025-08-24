import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useRef } from "react";
import { useDiceRollStore } from "../dice/store";
import { useDiceControlsStore } from "../controls/store";
import { getDieFromDice } from "../helpers/getDieFromDice";
import { getPluginId } from "./getPluginId";
import { isTraitTestFromDiceInfo } from "../helpers/determineRollType";

/** Sync the current dice roll to the plugin */
export function DiceRollSync() {
  const prevIds = useRef<string[]>([]);
  const prevResultTimestamp = useRef<number>(0);
  
  // Subscribe to control changes to trigger resync
  useEffect(() => {
    return useDiceControlsStore.subscribe(() => {
      // When controls change, trigger a resync of the current state
      const diceState = useDiceRollStore.getState();
      if (diceState.roll && diceState.currentRollResult) {
        // Force a sync by updating the metadata
        const controlsState = useDiceControlsStore.getState();
        
        const isTraitTest = isTraitTestFromDiceInfo(diceState.dieInfo);
        
        const throws = diceState.roll.hidden ? undefined : diceState.rollThrows;
        const values = diceState.roll.hidden ? undefined : diceState.rollValues;
        const transforms = diceState.roll.hidden ? undefined : diceState.rollTransforms;
        const explosionDice = diceState.roll.hidden ? undefined : diceState.explosionDice;
        const explosionResults = diceState.roll.hidden ? undefined : diceState.explosionResults;
        const dieInfo = diceState.roll.hidden ? undefined : diceState.dieInfo;
        
        const controlSettings = diceState.roll.hidden ? undefined : {
          traitModifier: controlsState.traitModifier,
          damageModifier: controlsState.damageModifier,
          targetNumber: controlsState.targetNumber,
          wildDieEnabled: controlsState.wildDieEnabled,
          isTraitTest,
        };
        
        OBR.player.setMetadata({
          [getPluginId("roll")]: diceState.roll,
          [getPluginId("rollThrows")]: throws,
          [getPluginId("rollValues")]: values,
          [getPluginId("rollTransforms")]: transforms,
          [getPluginId("explosionDice")]: explosionDice,
          [getPluginId("explosionResults")]: explosionResults,
          [getPluginId("dieInfo")]: dieInfo,
          [getPluginId("controlSettings")]: controlSettings,
        });
      }
    });
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
          // Get control settings
          const controlsState = useDiceControlsStore.getState();
          
          // Hide values if needed
          const throws = state.roll?.hidden ? undefined : state.rollThrows;
          const values = state.roll?.hidden ? undefined : state.rollValues;
          const transforms = state.roll?.hidden
            ? undefined
            : state.rollTransforms;
          const explosionDice = state.roll?.hidden ? undefined : state.explosionDice;
          const explosionResults = state.roll?.hidden ? undefined : state.explosionResults;
          const dieInfo = state.roll?.hidden ? undefined : state.dieInfo;
          
          const isTraitTest = isTraitTestFromDiceInfo(state.dieInfo);
          
          // Include control settings for remote calculation
          const controlSettings = state.roll?.hidden ? undefined : {
            traitModifier: controlsState.traitModifier,
            damageModifier: controlsState.damageModifier,
            targetNumber: controlsState.targetNumber,
            wildDieEnabled: controlsState.wildDieEnabled,
            isTraitTest,
          };
          
          OBR.player.setMetadata({
            [getPluginId("roll")]: state.roll,
            [getPluginId("rollThrows")]: throws,
            [getPluginId("rollValues")]: values,
            [getPluginId("rollTransforms")]: transforms,
            [getPluginId("explosionDice")]: explosionDice,
            [getPluginId("explosionResults")]: explosionResults,
            [getPluginId("dieInfo")]: dieInfo,
            [getPluginId("controlSettings")]: controlSettings,
          });
        }
      }),
    []
  );

  return null;
}
