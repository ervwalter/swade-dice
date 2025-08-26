import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import HiddenIcon from "@mui/icons-material/VisibilityOffRounded";

import { SavageRollResult, RollOutcome } from "../types/SavageWorldsTypes";

interface SavageWorldsResultsSummaryProps {
  result: SavageRollResult | null;
  hidden?: boolean;
  hidePrefix?: boolean;
  variant?: "h6" | "subtitle1" | "body1" | "body2";
  singleLine?: boolean;
  fontSize?: string;
  showDicePrefix?: boolean;
  showModeIcon?: boolean;
  textColor?: string;
  isDarkBackground?: boolean;
}

export function SavageWorldsResultsSummary({ 
  result,
  hidden,
  hidePrefix = false,
  variant = "h6",
  singleLine = false,
  fontSize,
  showDicePrefix = false,
  showModeIcon = false,
  textColor = "white",
  isDarkBackground = true
}: SavageWorldsResultsSummaryProps) {
  
  if (!result) {
    return null;
  }
  
  const { mode, outcomes, isComplete } = result;
  const isTraitTest = mode === "TRAIT";
  const isMultiDieTrait = isTraitTest && outcomes.length > 1;
  
  // Colors that work well on both dark and light backgrounds
  const successColor = isDarkBackground ? "#4caf50" : "#2e7d32";  // Darker green for light backgrounds
  const errorColor = isDarkBackground ? "#f44336" : "#c62828";    // Darker red for light backgrounds  
  const warningColor = isDarkBackground ? "#ffc107" : "#f57c00";  // Darker amber for light backgrounds
  
  // Generate dice prefix for each outcome
  const getDicePrefix = (outcome: RollOutcome, index: number) => {
    if (!showDicePrefix) return "";
    
    if (isTraitTest) {
      // For trait tests, show the specific die type for this outcome
      // If this outcome was replaced by wild die, find the original die type
      let dieType: string;
      
      if (outcome.replacedByWild) {
        // Find the original non-wild die that corresponds to this outcome index
        const nonWildChains = result.dieChains.filter(chain => !chain.isWildDie);
        if (nonWildChains[index]) {
          dieType = nonWildChains[index].dieType;
        } else {
          // Fallback to the chain in the outcome
          dieType = outcome.chains[0].dieType;
        }
      } else {
        dieType = outcome.chains[0].dieType;
      }
      
      const modifier = outcome.modifier || 0;
      const modifierText = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : '';
      
      return (
        <span style={{ opacity: 0.7 }}>[{dieType.toLowerCase()}{modifierText}] </span>
      );
    } else {
      // For damage rolls, show summary of all dice (only once for the single outcome)
      if (index > 0) return ""; // Only show prefix for first damage outcome
      
      // Group dice by type and count them
      const diceGroups: { [key: string]: number } = {};
      result.dieChains.forEach(chain => {
        if (!chain.isWildDie) { // Don't include wild die in damage summary
          const dieType = chain.dieType.toLowerCase();
          diceGroups[dieType] = (diceGroups[dieType] || 0) + 1;
        }
      });
      
      // Format as "[2d6+d8]" or "[d6]" and add modifier if not zero
      const parts = Object.entries(diceGroups).map(([dieType, count]) => 
        count > 1 ? `${count}${dieType}` : dieType
      );
      
      const modifier = outcome.modifier || 0;
      const modifierText = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : '';
      
      return (
        <span style={{ opacity: 0.7 }}>[{parts.join("+")}{modifierText}] </span>
      );
    }
  };
  
  // Generate mode icon
  const getModeIcon = () => {
    if (!showModeIcon) return null;
    
    const iconStyle = { 
      fontSize: "0.8em", 
      marginRight: "0.25em",
      verticalAlign: "baseline" 
    };
    
    return (
      <span style={iconStyle}>
        {isTraitTest ? "🎯" : "⚔️"}
      </span>
    );
  };
  
  if (singleLine) {
    // Single line mode for popover - all results on one line with commas
    return (
      <>
      {/* // <Stack direction="row" alignItems="center" spacing={1}> */}
        {hidden && (
          <Tooltip title="Hidden Roll">
            <HiddenIcon htmlColor="white" />
          </Tooltip>
        )}
        <Typography variant={variant} sx={{ fontSize, color: textColor }}>
          {getModeIcon()}
          {!hidePrefix && (
            <span style={{ fontWeight: "normal", opacity: 0.8 }}>
              {isTraitTest ? (isMultiDieTrait ? "Results: " : "Result: ") : "Total: "}
            </span>
          )}
          {outcomes.map((outcome, index) => (
            <span key={index}>
              {index > 0 && ", "}
              <span style={{ whiteSpace: "nowrap", display: "inline-block", paddingLeft: "0.2em" }}>
                {getDicePrefix(outcome, index)}<span style={{ fontWeight: "bold" }}>{outcome.total}</span>
                {isTraitTest && isComplete && outcome.success !== undefined && (
                  <>
                    {" "}
                    {outcome.success ? (
                      <span style={{ color: successColor, fontWeight: "bold" }}>✓</span>
                    ) : (
                      <span style={{ color: errorColor,fontWeight: "bold"  }}>✗</span>
                    )}
                    {outcome.raises && outcome.raises > 0 ? (
                      <span style={{ color: warningColor, fontWeight: "lighter"}}>{''}
                        {"⬆︎".repeat(Math.min(outcome.raises, 3))}
                      </span>
                    ) : null}
                  </>
                )}
              </span>
            </span>
          ))}
        </Typography>
      {/* // </Stack> */}
      </>
    );
  }

  // Multi-line mode for main display
  return (
    <Stack direction="row" alignItems="flex-start" spacing={2}>
      {hidden && (
        <Tooltip title="Hidden Roll">
          <HiddenIcon htmlColor="white" />
        </Tooltip>
      )}
      {!hidePrefix && (
        <Typography variant={variant} sx={{ fontSize, fontWeight: "normal", opacity: 0.8, color: textColor }}>
          {getModeIcon()}
          {isTraitTest ? (isMultiDieTrait ? "Results:" : "Result:") : "Total:"}
        </Typography>
      )}
      <Stack direction="column" alignItems="flex-start" spacing={0.25}>
        {outcomes.map((outcome, index) => (
          <Typography key={index} variant={variant} sx={{ fontSize, color: textColor }}>
            <span>
              {getDicePrefix(outcome, index)}<span style={{ fontWeight: "bold" }}>{outcome.total}</span>
              {isTraitTest && isComplete && outcome.success !== undefined && (
                <>
                  {" "}
                  {outcome.success ? (
                    <span style={{ color: successColor }}>✓</span>
                  ) : (
                    <span style={{ color: errorColor }}>✗</span>
                  )}
                  {outcome.raises && outcome.raises > 0 ? (
                    <span style={{ color: warningColor, fontWeight: 200}}>{''}
                      {"⬆︎".repeat(Math.min(outcome.raises, 3))}
                    </span>
                  ) : null}
                </>
              )}
            </span>
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}