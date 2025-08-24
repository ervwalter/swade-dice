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

export function DamageModifier() {
  const modifier = useDiceControlsStore((state) => state.damageModifier);
  const setModifier = useDiceControlsStore((state) => state.setDamageModifier);
  const { isDamageRoll } = useDiceMode();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customValue, setCustomValue] = useState(modifier.toString());
  const open = Boolean(anchorEl);
  
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
    setCustomValue(modifier.toString());
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
  
  const tooltipTitle = isDamageRoll ? `Damage Modifier (${displayText})` : "Damage Modifier (inactive for single die rolls)";
  
  return (
    <>
      <Tooltip title={tooltipTitle} placement="right" disableInteractive>
        <span>
          <IconButton
            onClick={handleClick}
            aria-controls={open ? "damage-modifier-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            disabled={!isDamageRoll}
            sx={{
              fontSize: "16px",
              color: isDamageRoll ? (modifier !== 0 ? "primary.main" : "text.primary") : "text.secondary",
              opacity: isDamageRoll ? 1 : 0.3,
              flexDirection: "row",
              gap: 0.5,
              lineHeight: 1,
              "&:disabled": {
                color: "text.secondary",
              },
            }}
          >
            <span style={{ fontSize: "18px" }}>⚔️</span>
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>{displayText}</span>
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        id="damage-modifier-menu"
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
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold" }}>
            Damage Modifier
          </Typography>
          
          <Typography variant="caption" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
            Applies to multi-die damage rolls
          </Typography>
          
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
              onKeyPress={(e) => {
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