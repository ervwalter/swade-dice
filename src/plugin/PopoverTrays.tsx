import OBR, { Player } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";

import { PopoverTray } from "./PopoverTray";
import { getPluginId } from "./getPluginId";

interface RollHistoryEntry {
  id: string;
  playerId: string;
  player: Player;
  result: any;
  timestamp: number;
  addedAt: number;
  isFading?: boolean;
  isHidden?: boolean;
}

export function PopoverTrays() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentPlayerMetadata, setCurrentPlayerMetadata] = useState<any>({});
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([]);

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
      } catch (error) {
        console.error('Failed to get current player info:', error);
      }
    };
    
    getCurrentPlayer();
  }, []);

  useEffect(() => {
    OBR.party.getPlayers().then(players => {
      console.log('PopoverTrays: initial party players', {
        count: players.length,
        players: players.map(p => ({ 
          name: p.name, 
          id: p.connectionId, 
          hasCurrentRollResult: !!p.metadata[getPluginId("currentRollResult")]
        }))
      });
      setPlayers(players);
    });
  }, []);
  useEffect(() => OBR.party.onChange((players) => {
    console.log('PopoverTrays: party players changed', {
      count: players.length,
      players: players.map(p => ({ 
        name: p.name, 
        id: p.connectionId, 
        hasCurrentRollResult: !!p.metadata[getPluginId("currentRollResult")]
      }))
    });
    setPlayers(players);
  }), []);

  // Get current player's metadata separately (since party.getPlayers might not include own updates)
  useEffect(() => {
    OBR.player.getMetadata().then(metadata => {
      console.log('PopoverTrays: initial current player metadata', {
        hasMetadata: !!metadata,
        currentRollResult: metadata ? metadata[getPluginId("currentRollResult")] : 'no metadata',
        allKeys: metadata ? Object.keys(metadata) : 'no metadata',
        pluginIdKey: getPluginId("currentRollResult"),
        allMetadata: metadata
      });
      setCurrentPlayerMetadata(metadata);
    });
  }, []);
  useEffect(() => OBR.player.onChange((metadata) => {
    console.log('PopoverTrays: current player metadata changed', {
      hasResult: !!metadata?.metadata?.[getPluginId("currentRollResult")],
      timestamp: metadata?.metadata?.[getPluginId("currentRollResult")]?.timestamp
    });
    setCurrentPlayerMetadata(metadata);
  }), []);

  // Accumulate roll history from all players' metadata (including current player)
  useEffect(() => {
    setRollHistory(prevHistory => {
      const updatedHistory = [...prevHistory];
      
      // Process rolls from all players (remote)
      players.forEach(player => {
        const result = player.metadata[getPluginId("currentRollResult")] as any;
        if (result && result.timestamp && result.isComplete) {
          const entryId = `${player.connectionId}-${result.timestamp}`;
          
          const existingIndex = updatedHistory.findIndex(entry => entry.id === entryId);
          
          if (existingIndex >= 0) {
            // Update existing entry
            const newEntry: RollHistoryEntry = {
              ...updatedHistory[existingIndex],
              result,
              player,
            };
            updatedHistory[existingIndex] = newEntry;
          } else {
            // Add new entry
            const newEntry: RollHistoryEntry = {
              id: entryId,
              playerId: player.connectionId,
              player,
              result,
              timestamp: result.timestamp,
              addedAt: Date.now(),
            };
            updatedHistory.push(newEntry);
          }
        }
      });
      
      // Process current player's roll from their metadata
      if (currentPlayer && currentPlayerMetadata) {
        // OBR.player.getMetadata() returns a Player object, so we need .metadata property
        const currentResult = currentPlayerMetadata.metadata?.[getPluginId("currentRollResult")] as any;
        if (currentResult && currentResult.timestamp && currentResult.isComplete) {
          const entryId = `${currentPlayer.connectionId}-${currentResult.timestamp}`;
          
          const existingIndex = updatedHistory.findIndex(entry => entry.id === entryId);
          
          if (existingIndex >= 0) {
            // Update existing entry
            const newEntry: RollHistoryEntry = {
              ...updatedHistory[existingIndex],
              result: currentResult,
              player: currentPlayer,
            };
            updatedHistory[existingIndex] = newEntry;
          } else {
            // Add new entry
            const newEntry: RollHistoryEntry = {
              id: entryId,
              playerId: currentPlayer.connectionId,
              player: currentPlayer,
              result: currentResult,
              timestamp: currentResult.timestamp,
              addedAt: Date.now(),
            };
            updatedHistory.push(newEntry);
          }
        }
      }
      
      // Sort by timestamp and keep last 20
      updatedHistory.sort((a, b) => a.timestamp - b.timestamp);
      const finalHistory = updatedHistory.slice(-20);
      
      console.log('PopoverTrays: updated roll history', {
        playersCount: players.length,
        hasCurrentPlayer: !!currentPlayer,
        hasCurrentPlayerMetadata: !!currentPlayerMetadata,
        currentPlayerResult: currentPlayer && currentPlayerMetadata ? 
          currentPlayerMetadata.metadata?.[getPluginId("currentRollResult")] : 'none',
        totalEntries: finalHistory.length,
        entries: finalHistory.map(r => ({ 
          id: r.id, 
          playerName: r.player.name, 
          timestamp: r.timestamp,
          isCurrentPlayer: currentPlayer ? r.playerId === currentPlayer.connectionId : 'unknown'
        }))
      });
      
      return finalHistory;
    });
  }, [players, currentPlayer, currentPlayerMetadata]);

  function handlePlayerClick(playerId: string) {
    // Only open action window for other players, not current player
    if (currentPlayer && playerId !== currentPlayer.connectionId && window.BroadcastChannel) {
      OBR.action.open();
      const channel = new BroadcastChannel(getPluginId("focused-tray"));
      channel.postMessage(playerId);
      channel.close();
    }
  }

  // Show popover when there are rolls in history
  const isVisible = rollHistory.length > 0;
  useEffect(() => {
    if (!isVisible) {
      OBR.popover.setHeight(getPluginId("popover"), 0);
      OBR.popover.setWidth(getPluginId("popover"), 0);
    } else {
      // Dynamic height based on content (max 450px)
      const maxHeight = Math.min(450, rollHistory.length * 50 + 100);
      OBR.popover.setHeight(getPluginId("popover"), maxHeight);
      // Width for roll history
      OBR.popover.setWidth(getPluginId("popover"), 350);
    }
  }, [isVisible, rollHistory.length]);

  return (
    <Box
      component="div"
      position="absolute"
      bottom="0"
      left="0"
      right="0"
      top="0"
      overflow="hidden"
    >
      {isVisible && (
        <PopoverTray
          rollHistory={rollHistory}
          onPlayerClick={handlePlayerClick}
        />
      )}
    </Box>
  );
}
