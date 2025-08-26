import create from 'zustand';
import { Player } from '@owlbear-rodeo/sdk';
import { PlayerRollResult } from '../types/SavageWorldsTypes';

export interface RollHistoryEntry {
  id: string;           // Unique ID for React keys (player.connectionId + timestamp)
  playerId: string;     // Player connection ID
  player: Player;       // Player object (for name, color)
  result: PlayerRollResult;  // The currentRollResult from metadata
  timestamp: number;    // From result.timestamp
  addedAt: number;      // When added to our local history
}

interface RollHistoryState {
  rollHistory: RollHistoryEntry[];
  addOrUpdateRoll: (entry: RollHistoryEntry) => void;
  clearHistory: () => void;
}

export const useRollHistoryStore = create<RollHistoryState>((set) => ({
  rollHistory: [],
  
  addOrUpdateRoll: (entry: RollHistoryEntry) =>
    set((state: RollHistoryState) => {
      
      const existingIndex = state.rollHistory.findIndex((e: RollHistoryEntry) => e.id === entry.id);
      
      if (existingIndex >= 0) {
        // Update existing roll (modifiers/TN/wild die changed)
        const updated = [...state.rollHistory];
        updated[existingIndex] = {
          ...updated[existingIndex],
          result: entry.result,
          player: entry.player,
        };
        return { rollHistory: updated };
      } else {
        // New roll - add to history
        // Add to end (newest at bottom, chat-style) and keep last 50
        const newHistory = [...state.rollHistory.slice(-49), entry];
        return { 
          rollHistory: newHistory
        };
      }
    }),
    
  clearHistory: () => set({ rollHistory: [] }),
}));