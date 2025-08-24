import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import CloseIcon from "@mui/icons-material/CloseRounded";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
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
  
  const resultsPinned = useDiceControlsStore((state) => state.resultsDetailsPinned);
  const setResultsPinned = useDiceControlsStore((state) => state.setResultsDetailsPinned);
  const resultsHovered = useDiceControlsStore((state) => state.resultsDetailsHovered);
  const setResultsHovered = useDiceControlsStore((state) => state.setResultsDetailsHovered);
  
  // Show details if either pinned or hovered
  const showDetails = resultsPinned || resultsHovered;
  
  return (
    <>
      <Box
        sx={{
          // position: "absolute",
          // top: 0,
          // left: 0,
          // right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          borderRadius: showDetails ? "0" : "0 0 8px 8px",
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
          results={results}
          hidden={roll?.hidden}
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
      
      {/* Pin button positioned in upper right when details are visible */}
      {showDetails && (
        <Tooltip title={resultsPinned ? "Unpin details" : "Pin details"}>
          <IconButton
            onClick={() => setResultsPinned(!resultsPinned)}
            sx={{ 
              position: "absolute",
              top: 48,  // Position below the control bar
              right: 8,
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },
              zIndex: 1001,  // Above the details panel
            }}
            size="small"
          >
            {resultsPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}