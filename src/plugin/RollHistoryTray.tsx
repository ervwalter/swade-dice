import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";

import { RollHistoryPanel } from "./RollHistoryPanel";
import { getPluginId } from "./getPluginId";
import { RollHistoryEntry } from "../types/SavageWorldsTypes";
import { RollBroadcast } from "./DiceRollSync";

export function RollHistoryTray() {
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([]);

  // Listen for roll broadcasts from all players
  useEffect(() => {
    const unsubscribe = OBR.broadcast.onMessage(getPluginId("roll-result"), (event) => {
      const broadcast = event.data as RollBroadcast;
      
      // Only process completed rolls
      if (!broadcast.result || !broadcast.result.timestamp || !broadcast.result.isComplete) {
        return;
      }

      setRollHistory(prevHistory => {
        const updatedHistory = [...prevHistory];
        const entryId = `${broadcast.playerId}-${broadcast.result.timestamp}`;
        
        const existingIndex = updatedHistory.findIndex(entry => entry.id === entryId);
        
        if (existingIndex >= 0) {
          // Update existing entry
          const newEntry: RollHistoryEntry = {
            ...updatedHistory[existingIndex],
            result: broadcast.result,
            player: broadcast.player,
          };
          updatedHistory[existingIndex] = newEntry;
        } else {
          // Add new entry
          const newEntry: RollHistoryEntry = {
            id: entryId,
            playerId: broadcast.playerId,
            player: broadcast.player,
            result: broadcast.result,
            timestamp: broadcast.result.timestamp,
            addedAt: Date.now(),
          };
          updatedHistory.push(newEntry);
        }
        
        // Sort by timestamp and keep last 20
        updatedHistory.sort((a, b) => a.timestamp - b.timestamp);
        const finalHistory = updatedHistory.slice(-20);
        
        return finalHistory;
      });
    });

    return unsubscribe;
  }, []);

  return (
    <Box component="div" width="auto">
      <RollHistoryPanel
        rollHistory={rollHistory}
      />
    </Box>
  );
}