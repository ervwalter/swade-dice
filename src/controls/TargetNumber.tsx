import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

import { useDiceControlsStore } from "./store";
import { useDiceMode } from "../hooks/useDiceMode";

export function TargetNumber() {
  const targetNumber = useDiceControlsStore((state) => state.targetNumber);
  const setTargetNumber = useDiceControlsStore((state) => state.setTargetNumber);
  
  const { isTraitTest, hasActiveRoll, currentSelectionCount } = useDiceMode();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customValue, setCustomValue] = useState(targetNumber.toString());
  const open = Boolean(anchorEl);
  
  // Enabled when:
  // 1. No dice selected (0 dice) AND no active roll - setting for next roll
  // 2. In trait mode AND no active roll
  // 3. Looking at completed trait test results
  const isEnabled = (!hasActiveRoll && (currentSelectionCount === 0 || isTraitTest)) || 
                    (hasActiveRoll && isTraitTest);
  
  function openDialog(button: HTMLElement) {
    setAnchorEl(button);
    setCustomValue(targetNumber.toString());
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!isEnabled) return;

    // Open dialog immediately for touch and pen input
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      openDialog(event.currentTarget);
      event.preventDefault();
    }
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (!isEnabled) return;

    if (event.shiftKey) {
      openDialog(event.currentTarget);
      return;
    }

    // Regular left click - increment by 1
    setTargetNumber(targetNumber + 1);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault(); // Prevent browser context menu
    if (!isEnabled) return;

    // Right click - decrement by 1
    setTargetNumber(targetNumber - 1);
  }
  
  function handleClose() {
    setAnchorEl(null);
  }
  
  function handleQuickSelect(value: number) {
    setTargetNumber(value);
    handleClose();
    // Don't clear roll - TN change will automatically update the results display
  }
  
  function handleCustomChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCustomValue(event.target.value);
  }
  
  function handleCustomSubmit() {
    const value = parseInt(customValue, 10);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setTargetNumber(value);
      handleClose();
      // Don't clear roll - TN change will automatically update the results display
    }
  }
  
  const tooltipTitle = isEnabled 
    ? `Target Number (TN: ${targetNumber})`
    : "Target Number (disabled for damage rolls)";
  
  return (
    <>
      <Tooltip title={tooltipTitle} placement="right" disableInteractive>
        <span>
          <IconButton
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onContextMenu={handleContextMenu}
            disabled={!isEnabled}
            aria-controls={open ? "target-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            sx={{
              fontSize: "16px",
              fontWeight: "bold",
              color: isEnabled ? "text.primary" : "text.secondary",
              opacity: isEnabled ? 1 : 0.3,
              touchAction: "none", // Prevent touch conflicts with pointer events
              "&:disabled": {
                color: "text.secondary",
              },
            }}
          >
            <span style={{ width: "auto", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" }}>
              TN: {targetNumber}
            </span>
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        id="target-menu"
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
          <Stack direction="row" spacing={1} mb={2}>
            {[4, 6, 8].map((value) => (
              <Button
                key={value}
                variant={targetNumber === value ? "contained" : "outlined"}
                size="small"
                onClick={() => handleQuickSelect(value)}
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
                const newVal = Math.max(1, (parseInt(customValue) || 1) - 1);
                setCustomValue(newVal.toString());
                setTargetNumber(newVal);
              }}
              sx={{ minWidth: "32px", padding: "4px" }}
            >
              −
            </Button>
            <TextField
              size="small"
              type="number"
              inputMode="numeric"
              value={customValue}
              onChange={handleCustomChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomSubmit();
                }
              }}
              inputProps={{
                style: { textAlign: 'center' },
                min: 1,
                max: 99
              }}
              sx={{ width: 80 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                const newVal = Math.min(99, (parseInt(customValue) || 1) + 1);
                setCustomValue(newVal.toString());
                setTargetNumber(newVal);
              }}
              sx={{ minWidth: "32px", padding: "4px" }}
            >
              +
            </Button>
          </Stack>
        </Stack>
      </Menu>
    </>
  );
}
