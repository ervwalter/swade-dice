import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import { useDiceControlsStore } from "./store";
import { useDiceRollStore } from "../dice/store";
import { useDiceMode } from "../hooks/useDiceMode";

export function WildDieToggle() {
  const wildDieEnabled = useDiceControlsStore((state) => state.wildDieEnabled);
  const toggleWildDie = useDiceControlsStore((state) => state.toggleWildDie);
  
  const explosionResults = useDiceRollStore((state) => state.explosionResults);
  
  const { isTraitTest, hasActiveRoll, currentSelectionCount } = useDiceMode();
  
  // Check if the current result has a wild die
  const resultHasWildDie = Object.values(explosionResults).some(r => r.isWildDie);
  
  // Enabled when:
  // 1. No dice selected (0 dice) AND no active roll - setting for next roll
  // 2. Exactly 1 die selected AND no active roll - trait test mode
  // 3. Looking at completed trait test results
  const isEnabled = (!hasActiveRoll && (currentSelectionCount === 0 || currentSelectionCount === 1)) || 
                    (hasActiveRoll && isTraitTest);
  
  function handleToggle() {
    if (isEnabled) {
      // If we're looking at results and the result didn't have a wild die,
      // we can't add one now (would require rolling new dice)
      if (isTraitTest && hasActiveRoll && !resultHasWildDie && !wildDieEnabled) {
        // Can't enable wild die for existing roll that didn't have one
        return;
      }
      
      toggleWildDie();
      // Never clear the roll - let the user decide when to roll again
    }
  }
  
  // Determine if button should be disabled
  const isDisabled = !isEnabled || (isTraitTest && hasActiveRoll && !resultHasWildDie && !wildDieEnabled);
  
  const tooltipTitle = () => {
    if (isTraitTest && hasActiveRoll && !resultHasWildDie && !wildDieEnabled) {
      return "Cannot add wild die to completed roll";
    }
    if (isEnabled) {
      return `Wild Die (D6) - ${wildDieEnabled ? 'Enabled' : 'Disabled'}`;
    }
    return "Wild Die (disabled for damage rolls)";
  };
  
  return (
    <Tooltip title={tooltipTitle()} placement="right" disableInteractive>
      <span>
        <IconButton
          onClick={handleToggle}
          disabled={isDisabled}
          sx={{
            color: !isDisabled && wildDieEnabled ? "warning.main" : "text.secondary",
            opacity: !isDisabled ? 1 : 0.3,
            "&:disabled": {
              color: "text.secondary",
            },
          }}
        >
          {wildDieEnabled && !isDisabled ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}