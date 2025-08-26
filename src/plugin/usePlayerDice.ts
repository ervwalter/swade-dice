import { Player } from "@owlbear-rodeo/sdk";
import { useEffect, useMemo, useRef } from "react";
import { DiceRoll } from "../types/DiceRoll";
import { DiceThrow } from "../types/DiceThrow";
import { DiceTransform } from "../types/DiceTransform";
import { Die } from "../types/Die";
import { getPluginId } from "./getPluginId";

export function usePlayerDice(player?: Player) {
  const diceRoll = useMemo(() => {
    return player?.metadata[getPluginId("roll")] as DiceRoll | undefined;
  }, [player]);

  const rollThrows = useMemo(() => {
    return player?.metadata[getPluginId("rollThrows")] as
      | Record<string, DiceThrow>
      | undefined;
  }, [player]);

  const rollValues = useMemo(() => {
    return player?.metadata[getPluginId("rollValues")] as
      | Record<string, number | null>
      | undefined;
  }, [player]);

  const rollTransforms = useMemo(() => {
    return player?.metadata[getPluginId("rollTransforms")] as
      | Record<string, DiceTransform | null>
      | undefined;
  }, [player]);
  
  const explosionDice = useMemo(() => {
    return player?.metadata[getPluginId("explosionDice")] as
      | Die[]
      | undefined;
  }, [player]);
  
  const currentRollResult = useMemo(() => {
    return player?.metadata[getPluginId("currentRollResult")] as any;
  }, [player]);

  const finishedRollTransforms = useMemo(() => {
    if (!rollTransforms) {
      return undefined;
    }
    const values: Record<string, DiceTransform> = {};
    for (const [id, value] of Object.entries(rollTransforms)) {
      if (value !== null) {
        values[id] = value;
      }
    }
    return values;
  }, [rollTransforms]);

  const transformsRef = useRef<Record<string, DiceTransform | null> | null>(
    null
  );
  useEffect(() => {
    transformsRef.current = rollTransforms || null;
  }, [rollTransforms]);



  const finishedRolling = useMemo(() => {
    if (!rollValues) {
      return false;
    }
    const values = Object.values(rollValues);
    if (values.length === 0) {
      return false;
    } else {
      return values.every((value) => value !== null);
    }
  }, [rollValues]);

  return {
    diceRoll,
    rollThrows,
    rollTransforms,
    transformsRef,
    finishedRollTransforms,
    finishedRolling,
    explosionDice,
    currentRollResult,
  };
}
