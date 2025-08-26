import { Player } from "@owlbear-rodeo/sdk";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";

import { SavageWorldsResultsSummary } from "../controls/SavageWorldsResultsSummary";
import { SavageWorldsResults } from "../controls/SavageWorldsResults";
import { PlayerRollResult } from "../types/SavageWorldsTypes";

export interface PlayerRollPillProps {
  player: Player;
  result?: PlayerRollResult;
  onClick?: () => void;
  showTimestamp?: boolean;
  timestamp?: number;
  showDicePrefix?: boolean;
}

export function PlayerRollPill({
  player,
  result,
  onClick,
  showTimestamp = false,
  timestamp,
  showDicePrefix = false
}: PlayerRollPillProps) {
  const theme = useTheme();
  const hasResult = result && result.outcomes && result.outcomes.length > 0;

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      component="div"
      onClick={onClick}
      sx={{
        display: "inline-flex",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        opacity: 0.9,
        "&:hover": {
          opacity: onClick ? 1 : 0.9,
        },
        alignItems: "center",
      }}
    >
      {/* Name section */}
      <Box
        component="div"
        sx={{
          backgroundColor: player.color,
          color: "white",
          px: 2,
          py: 0.5,
          fontSize: "0.75rem",
          fontWeight: 500,
          maxWidth: "8em", // Roughly 8 characters
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {player.name}
      </Box>
      
      {/* Result section (only if there's a result) */}
      {hasResult && (
        <Tooltip
          title={<SavageWorldsResults result={result} />}
          placement="top"
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                maxWidth: "300px",
                borderRadius: "4px",
                padding: "12px",
              }
            }
          }}
        >
          <Box
            component="div"
            sx={{
              backgroundColor: theme.palette.mode === "dark" 
                ? "rgba(0, 0, 0, 0.3)" 
                : "rgba(0, 0, 0, 0.15)",
              color: theme.palette.mode === "dark" ? "white" : "black",
              px: 1.5,
              py: 0.5,
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              borderTopRightRadius: "16px",
              borderBottomRightRadius: "16px",
            }}
          >
            <SavageWorldsResultsSummary 
              result={result} 
              hidePrefix={true} 
              variant="body2"
              singleLine={true}
              fontSize="0.75rem"
              showDicePrefix={showDicePrefix}
              showModeIcon={true}
              textColor={theme.palette.mode === "dark" ? "white" : "black"}
              isDarkBackground={theme.palette.mode === "dark"}
            />
          </Box>
        </Tooltip>
      )}
      
      {/* Timestamp section (optional) */}
      {showTimestamp && timestamp && (
        <Box
          component="div"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            color: "rgba(255, 255, 255, 0.7)",
            px: 1,
            py: 0.5,
            fontSize: "0.625rem",
          }}
        >
          {formatTimestamp(timestamp)}
        </Box>
      )}
    </Box>
  );
}