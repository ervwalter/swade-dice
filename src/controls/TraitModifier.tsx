import { useState, useMemo } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

import { useDiceControlsStore } from "./store";
import { useDiceMode } from "../hooks/useDiceMode";

export function TraitModifier() {
  const modifier = useDiceControlsStore((state) => state.traitModifier);
  const setModifier = useDiceControlsStore((state) => state.setTraitModifier);
  const { isTraitTest, hasActiveRoll, currentSelectionCount } = useDiceMode();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customValue, setCustomValue] = useState(modifier.toString());
  const open = Boolean(anchorEl);
  
  // Enabled when: no dice selected OR in trait mode OR viewing trait results
  const isEnabled = (!hasActiveRoll && (currentSelectionCount === 0 || isTraitTest)) || 
                    (hasActiveRoll && isTraitTest);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    // Check if this is a touch event or shift+click - open dialog
    const isTouch = event.nativeEvent && 'touches' in event.nativeEvent;
    if (isTouch || event.shiftKey) {
      setAnchorEl(event.currentTarget);
      setCustomValue(modifier.toString());
      return;
    }
    
    // Regular left click - increment by 1
    if (isEnabled) {
      setModifier(modifier + 1);
    }
  }

  function handleContextMenu(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault(); // Prevent browser context menu
    // Right click - decrement by 1
    if (isEnabled) {
      setModifier(modifier - 1);
    }
  }
  
  function handleClose() {
    setAnchorEl(null);
  }
  
  function handleQuickSelect(value: number) {
    setModifier(value);
    handleClose();
  }
  
  function handleCustomChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCustomValue(event.target.value);
  }
  
  function handleCustomSubmit() {
    const value = parseInt(customValue, 10);
    if (!isNaN(value)) {
      setModifier(value);
      handleClose();
    }
  }
  
  // Format the display text
  const displayText = useMemo(() => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  }, [modifier]);
  
  const tooltipTitle = isEnabled ? `Trait Modifier (${displayText})` : "Trait Modifier (inactive for damage rolls)";
  
  return (
    <>
      <Tooltip title={tooltipTitle} placement="right" disableInteractive>
        <span>
          <IconButton
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            aria-controls={open ? "trait-modifier-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            disabled={!isEnabled}
            sx={{
              fontSize: "16px",
              color: isEnabled ? (modifier !== 0 ? "primary.main" : "text.primary") : "text.secondary",
              opacity: isEnabled ? 1 : 0.3,
              flexDirection: "row",
              gap: 0.5,
              lineHeight: 1,
              "&:disabled": {
                color: "text.secondary",
              },
            }}
          >
            <span style={{ fontSize: "18px" }}>🎯</span>
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>{displayText}</span>
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        id="trait-modifier-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
      >
        <Stack sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" gutterBottom>
            Quick Select:
          </Typography>
          
          <Stack direction="row" spacing={1} mb={1}>
            {[+1, +2, +3, +4].map((value) => (
              <Button
                key={value}
                variant={modifier === value ? "contained" : "outlined"}
                size="small"
                onClick={() => handleQuickSelect(value)}
                sx={{ minWidth: "36px", fontSize: "12px" }}
              >
                +{value}
              </Button>
            ))}
          </Stack>
          
          <Stack direction="row" spacing={1} mb={2}>
            {[-1, -2, -3, -4].map((value) => (
              <Button
                key={value}
                variant={modifier === value ? "contained" : "outlined"}
                size="small"
                onClick={() => handleQuickSelect(value)}
                sx={{ minWidth: "36px", fontSize: "12px" }}
              >
                {value}
              </Button>
            ))}
          </Stack>
          
          <Typography variant="subtitle2" gutterBottom>
            Custom:
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => {
                const newVal = (parseInt(customValue) || 0) - 1;
                setCustomValue(newVal.toString());
                setModifier(newVal);
              }}
              sx={{ minWidth: "32px", padding: "4px" }}
            >
              −
            </Button>
            <TextField
              size="small"
              type="number"
              value={customValue}
              onChange={handleCustomChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomSubmit();
                }
              }}
              inputProps={{ 
                style: { textAlign: 'center' },
                min: -99, 
                max: 99 
              }}
              sx={{ width: 80 }}
            />
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => {
                const newVal = (parseInt(customValue) || 0) + 1;
                setCustomValue(newVal.toString());
                setModifier(newVal);
              }}
              sx={{ minWidth: "32px", padding: "4px" }}
            >
              +
            </Button>
          </Stack>
          
          <Button 
            variant="text" 
            size="small"
            onClick={() => handleQuickSelect(0)}
            sx={{ mt: 1, alignSelf: "flex-start" }}
          >
            Clear Modifier
          </Button>
        </Stack>
      </Menu>
    </>
  );
}