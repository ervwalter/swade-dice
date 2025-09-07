import { useEffect, useRef } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

import { PlayerRollPill } from "./PlayerRollPill";
import { RollHistoryEntry } from "../types/SavageWorldsTypes";

export function RollHistoryPanel({
  rollHistory
}: {
  rollHistory: RollHistoryEntry[];
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
    <Box component="div">
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          borderRadius: 0,
          paddingTop: 0,
        backgroundColor: "rgba(0, 0, 0, 0.1)",        }}
      >
        <Box 
          component="div"
          ref={containerRef} 
          sx={{ 
          height: "104px",
          overflow: "scroll",
            overflowY: 'auto',
            overflowX: 'hidden',
            p: 1,
          }}
        >
          {rollHistory.length === 0 ? (
            <Box
              component="div"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                opacity: 0.6,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Party dice rolls appear here
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0.5}>
              {rollHistory.map(entry => (
                <PlayerRollPill
                  key={entry.id}
                  player={entry.player}
                  result={entry.result}
                  showTimestamp={false}
                  showDicePrefix={true}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
