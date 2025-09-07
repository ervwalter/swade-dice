import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import CloseIcon from "@mui/icons-material/CloseRounded";
import { RerollDiceIcon } from "../icons/RerollDiceIcon";

import { useSavageWorldsResults } from "../hooks/useSavageWorldsResults";
import { useDiceControlsStore } from "./store";
import { useDiceRollStore } from "../dice/store";
import { SavageWorldsResultsSummary } from "./SavageWorldsResultsSummary";

/**
 * Container component that connects SavageWorldsResultsSummary to the stores
 * Used by the main player's DiceRollControls
 */
export function SavageWorldsResultsSummaryContainer() {
  const results = useSavageWorldsResults();
  
  const roll = useDiceRollStore((state) => state.roll);
  const clearRoll = useDiceRollStore((state) => state.clearRoll);
  const reroll = useDiceRollStore((state) => state.reroll);
  
  const resultsHovered = useDiceControlsStore((state) => state.resultsDetailsHovered);
  
  // Show details if hovered
  const showDetails = resultsHovered;
  
  return (
    <>
      <Box
        sx={{
          // position: "absolute",
          // top: 0,
          // left: 0,
          // right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          borderRadius: showDetails ? "0" : "0 0 16px 16px",
          pointerEvents: "all",
          padding: "12px 16px",
        }}
        component="div"
      >
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        alignItems="center"
      >
        <Tooltip title="Reroll">
          <IconButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              reroll();
            }}
            sx={{ color: "white" }}
            size="small"
          >
            <RerollDiceIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        {/* Result summary in the middle */}
        <SavageWorldsResultsSummary
          fontSize="0.9em"
          result={results}
          hidden={roll?.hidden}
          singleLine={true}
          hidePrefix={true}
          variant="body1"
        />
        
        <Tooltip title="Clear">
          <IconButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              clearRoll();
            }}
            sx={{ color: "white" }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      </Box>
    </>
  );
}