import { useState } from "react";

import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Menu from "@mui/material/Menu";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

import HistoryIcon from "@mui/icons-material/SavedSearchRounded";
import NoHistoryIcon from "@mui/icons-material/ManageSearchRounded";

import { useDiceRollStore } from "../dice/store";
import { RecentRoll, useDiceHistoryStore } from "./history";
import { DicePreview } from "../previews/DicePreview";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { getDiceToRoll, useDiceControlsStore } from "./store";

export function DiceHistory() {
  const startRoll = useDiceRollStore((state) => state.startRoll);

  const hidden = useDiceControlsStore((state) => state.diceHidden);
  const resetDiceCounts = useDiceControlsStore(
    (state) => state.resetDiceCounts
  );
  const diceSet = useDiceControlsStore((state) => state.diceSet);
  const setTraitModifier = useDiceControlsStore((state) => state.setTraitModifier);
  const setDamageModifier = useDiceControlsStore((state) => state.setDamageModifier);
  const setTargetNumber = useDiceControlsStore((state) => state.setTargetNumber);
  const toggleWildDie = useDiceControlsStore((state) => state.toggleWildDie);
  const currentWildDieEnabled = useDiceControlsStore((state) => state.wildDieEnabled);
  const setModeChoice = useDiceControlsStore((state) => state.setModeChoice);

  function handleRoll(roll: RecentRoll) {
    // Restore Savage Worlds settings from history
    if (roll.rollMode) {
      // Set the explicit mode
      setModeChoice(roll.rollMode);
      
      // Set modifiers based on roll type
      if (roll.rollMode === 'TRAIT' && roll.traitModifier !== undefined) {
        setTraitModifier(roll.traitModifier);
      }
      if (roll.rollMode === 'DAMAGE' && roll.damageModifier !== undefined) {
        setDamageModifier(roll.damageModifier);
      }
      
      // Restore target number for trait tests
      if (roll.rollMode === 'TRAIT' && roll.targetNumber !== undefined) {
        setTargetNumber(roll.targetNumber);
      }
      
      // Update wild die if different
      if (roll.wildDieEnabled !== undefined && roll.wildDieEnabled !== currentWildDieEnabled) {
        toggleWildDie();
      }
    }
    
    const dice = getDiceToRoll(
      roll.counts, 
      roll.diceById, 
      roll.wildDieEnabled ?? currentWildDieEnabled, 
      diceSet.dice[0]?.style,
      roll.rollMode === 'TRAIT'
    );
    startRoll({ dice, bonus: 0, hidden });
    resetDiceCounts();
    handleClose();
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  const recentRolls = useDiceHistoryStore((state) => state.recentRolls);
  const removeRecentRoll = useDiceHistoryStore(
    (state) => state.removeRecentRoll
  );

  return (
    <>
      <Tooltip title="History" placement="top" disableInteractive>
        <IconButton
          id="history-button"
          aria-controls={open ? "history-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <HistoryIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="history-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "history-button",
        }}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
      >
        <Stack width="250px" px={1} gap={0.5}>
          {recentRolls.map((recentRoll, index) => (
            <RecentRollChip
              key={index}
              recentRoll={recentRoll}
              onRoll={() => handleRoll(recentRoll)}
              onDelete={() => removeRecentRoll(index)}
            />
          ))}
          {recentRolls.length === 0 && <EmptyMessage />}
        </Stack>
      </Menu>
    </>
  );
}

function RecentRollChip({
  recentRoll,
  onRoll,
  onDelete,
}: {
  recentRoll: RecentRoll;
  onRoll: () => void;
  onDelete: () => void;
}) {
  return (
    <Chip
      sx={{
        flexGrow: 1,
        flexBasis: 0,
        ".MuiChip-deleteIcon": {
          position: "absolute",
          right: 0,
        },
      }}
      label={
        <Stack direction="row" alignItems="center" gap={0.5} px={2}>
          {recentRoll.rollMode === 'TRAIT' ? (
            <span style={{ fontSize: "16px" }}>🎯</span>
          ) : (
            <span style={{ fontSize: "16px" }}>⚔️</span>
          )}
          {Object.entries(recentRoll.counts).map(([id, count]) => {
            const die = recentRoll.diceById[id];
            if (!die || count === 0) {
              return null;
            }
            if (count > 6) {
              return (
                <Stack key={id} direction="row" alignItems="center" gap={0.25}>
                  <span>{count}×</span>
                  <DicePreview
                    diceStyle={die.style}
                    diceType={die.type}
                    size="small"
                  />
                </Stack>
              );
            }
            return (
              <Stack key={id} direction="row" alignItems="center" gap={0.25}>
                {Array.from({ length: count }).map((_, i) => (
                  <DicePreview
                    key={`${id}-${i}`}
                    diceStyle={die.style}
                    diceType={die.type}
                    size="small"
                  />
                ))}
              </Stack>
            );
          })}
          {recentRoll.wildDieEnabled && recentRoll.rollMode === 'TRAIT' && (
            <DicePreview
              diceStyle="NEBULA"
              diceType="D6"
              size="small"
            />
          )}
        </Stack>
      }
      variant="filled"
      onClick={() => onRoll()}
      onDelete={() => onDelete()}
    />
  );
}

function EmptyMessage() {
  const theme = useTheme();

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0.5,
        pb: 1,
      }}
    >
      <Box
        component="div"
        sx={{
          fontSize: "2rem",
          color:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.46)"
              : "rgba(0, 0, 0, 0.46)",
          display: "flex",
          p: 1,
        }}
      >
        <NoHistoryIcon />
      </Box>
      <Typography variant="h6">No History</Typography>
      <Typography variant="caption" textAlign="center">
        Roll dice to add to the roll history.
      </Typography>
    </Stack>
  );
}
