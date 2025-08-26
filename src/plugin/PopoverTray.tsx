import { useEffect, useRef } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

import { PlayerRollPill } from "./PlayerRollPill";
import { RollHistoryEntry } from "../types/SavageWorldsTypes";

export function PopoverTray({
  rollHistory,
  onPlayerClick
}: {
  rollHistory: RollHistoryEntry[];
  onPlayerClick: (playerId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const prevHistoryIds = useRef<Set<string>>(new Set());
  
  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    const currentIds = new Set(rollHistory.map(entry => entry.id));
    const hasNewEntry = rollHistory.some(entry => !prevHistoryIds.current.has(entry.id));
    
    if (hasNewEntry && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    
    prevHistoryIds.current = currentIds;
  }, [rollHistory]);

  return (
    <Box component="div" position="absolute" right={16} bottom={16}>
      <Paper
        elevation={8}
        sx={{
          width: "320px",
          maxHeight: "400px",
          borderRadius: 1,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(34, 38, 57, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
        }}
      >
        <Box 
          component="div"
          ref={containerRef} 
          sx={{ 
            maxHeight: 400,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: 2,
          }}
        >
          <Stack spacing={1}>
            {rollHistory.map(entry => (
              <PlayerRollPill
                key={entry.id}
                player={entry.player}
                result={entry.result}
                onClick={() => onPlayerClick(entry.playerId)}
                showTimestamp={false}
                showDicePrefix={true}
              />
            ))}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
