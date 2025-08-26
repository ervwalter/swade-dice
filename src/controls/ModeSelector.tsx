import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { alpha, useTheme } from "@mui/material/styles";

interface ModeSelectorProps {
  autoMode: "TRAIT" | "DAMAGE" | "STANDARD";
  visible: boolean;
  disabled?: boolean;
  currentMode?: "AUTO" | "TRAIT" | "DAMAGE" | "STANDARD";
  onModeChange?: (mode: "TRAIT" | "DAMAGE" | "STANDARD") => void;
}

export function ModeSelector({ 
  autoMode, 
  visible, 
  disabled = false,
  currentMode = "AUTO",
  onModeChange 
}: ModeSelectorProps) {
  const theme = useTheme();
  
  // Determine effective mode based on store state
  const effectiveMode = currentMode === "AUTO" ? autoMode : currentMode;
  
  const handleModeClick = (mode: "TRAIT" | "DAMAGE" | "STANDARD") => {
    if (disabled) return;
    onModeChange?.(mode);
  };
  
  if (!visible) return null;
  
  return (
    <ButtonGroup 
      variant="contained" 
      size="small"
      disabled={disabled}
    >
      <Button
        onClick={() => handleModeClick("TRAIT")}
        color={effectiveMode === "TRAIT" ? "primary" : "inherit"}
        style={{
          minWidth: "75px",
          fontSize: "0.75rem",
          backgroundColor: effectiveMode === "TRAIT" 
            ? theme.palette.primary.main 
            : alpha(theme.palette.action.disabled, 0.12),
        }}
      >
        Trait
      </Button>
      
      <Button
        onClick={() => handleModeClick("DAMAGE")}
        color={effectiveMode === "DAMAGE" ? "primary" : "inherit"}
        style={{
          minWidth: "75px",
          fontSize: "0.75rem",
          backgroundColor: effectiveMode === "DAMAGE" 
            ? theme.palette.primary.main 
            : alpha(theme.palette.action.disabled, 0.12),
        }}
      >
        Damage
      </Button>
    </ButtonGroup>
  );
}