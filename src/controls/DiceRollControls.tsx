import { useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import { useTheme, keyframes } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";

import CloseIcon from "@mui/icons-material/CloseRounded";
import HiddenIcon from "@mui/icons-material/VisibilityOffRounded";
import RollIcon from "@mui/icons-material/ArrowForwardRounded";

import { GradientOverlay } from "./GradientOverlay";
import { useDiceRollStore } from "../dice/store";
import { getDiceToRoll, useDiceControlsStore } from "./store";
import { DiceType } from "../types/DiceType";
import { useDiceHistoryStore } from "./history";
import { Die } from "../types/Die";
import { FinishedRollResultsWrapper } from "./FinishedRollResultsWrapper";

const jiggle = keyframes`
0% { transform: translate(0, 0) rotate(0deg); }
25% { transform: translate(2px, 2px) rotate(2deg); }
50% { transform: translate(0, 0) rotate(0deg); }
75% { transform: translate(-2px, 2px) rotate(-2deg); }
100% { transform: translate(0, 0) rotate(0deg); }
`;

export function DiceRollControls() {
  const defaultDiceCounts = useDiceControlsStore(
    (state) => state.defaultDiceCounts
  );

  const counts = useDiceControlsStore((state) => state.diceCounts);
  // Is currently the default dice state (all counts 0)
  // Note: modifier is not part of this check - it persists across rolls
  const isDefault = useMemo(
    () =>
      Object.entries(defaultDiceCounts).every(
        ([type, count]) => counts[type as DiceType] === count
      ),
    [counts, defaultDiceCounts]
  );

  const rollValues = useDiceRollStore((state) => state.rollValues);
  const finishedRolling = useMemo(() => {
    const values = Object.values(rollValues);
    if (values.length === 0) {
      return false;
    } else {
      return values.every((value) => value !== null);
    }
  }, [rollValues]);

  if (!isDefault) {
    return (
      <Fade in>
        <span>
          <DicePickedControls />
        </span>
      </Fade>
    );
  } else if (finishedRolling) {
    return (
      <Fade in>
        <span>
          <FinishedRollControls />
        </span>
      </Fade>
    );
  } else {
    return null;
  }
}

function DicePickedControls() {
  const startRoll = useDiceRollStore((state) => state.startRoll);

  const defaultDiceCounts = useDiceControlsStore(
    (state) => state.defaultDiceCounts
  );
  const diceById = useDiceControlsStore((state) => state.diceById);
  const counts = useDiceControlsStore((state) => state.diceCounts);
  const hidden = useDiceControlsStore((state) => state.diceHidden);
  const wildDieEnabled = useDiceControlsStore((state) => state.wildDieEnabled);
  const diceSet = useDiceControlsStore((state) => state.diceSet);
  const traitModifier = useDiceControlsStore((state) => state.traitModifier);
  const damageModifier = useDiceControlsStore((state) => state.damageModifier);
  const targetNumber = useDiceControlsStore((state) => state.targetNumber);

  const resetDiceCounts = useDiceControlsStore(
    (state) => state.resetDiceCounts
  );

  const pushRecentRoll = useDiceHistoryStore((state) => state.pushRecentRoll);

  function handleRoll() {
    if (hasDice && rollPressTime) {
      // Clear any previous explosion state
        
      const dice = getDiceToRoll(counts, diceById, wildDieEnabled, diceSet.dice[0]?.style);
      const activeTimeSeconds = (performance.now() - rollPressTime) / 1000;
      const speedMultiplier = Math.max(1, Math.min(10, activeTimeSeconds * 2));
      
      // Determine if this is a trait test based on dice count
      const totalDiceCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
      const isTraitTest = totalDiceCount === 1;
      
      // Find wild die ID if present
      let wildDieId: string | undefined;
      if (isTraitTest && wildDieEnabled && dice.length > 1) {
        // Wild die is the Nebula D6 we added
        const wildDie = dice.find(d => 'type' in d && d.type === 'D6' && d.style === 'NEBULA');
        if (wildDie && 'id' in wildDie) {
          wildDieId = wildDie.id;
        }
      }
      
      // Build roll with Savage Worlds config
      startRoll({ 
        dice, 
        bonus: 0, 
        hidden,
        savageWorldsConfig: {
          rollType: isTraitTest ? "trait" : "damage",
          modifier: isTraitTest ? traitModifier : damageModifier,
          targetNumber,
          wildDieId
        }
      }, speedMultiplier);

      const rolledDiceById: Record<string, Die> = {};
      for (const id of Object.keys(counts)) {
        if (!(id in rolledDiceById)) {
          rolledDiceById[id] = diceById[id];
        }
      }
      
      // Note: We can't calculate the final result here since the dice haven't rolled yet
      // The finalResult will be undefined until we implement a way to update it after rolling
      pushRecentRoll({ 
        counts, 
        bonus: 0,  // Legacy field
        diceById: rolledDiceById,
        // Savage Worlds data
        isTraitTest,
        traitModifier,
        damageModifier,
        targetNumber,
        wildDieEnabled,
        // finalResult will be added later when we can track roll completion
      });

      handleReset();
    }
    setRollPressTime(null);
  }

  function handleReset() {
    resetDiceCounts();
    // Don't reset modifier - it's ephemeral but persists across rolls in a session
  }

  const rollPressTime = useDiceControlsStore(
    (state) => state.diceRollPressTime
  );
  const setRollPressTime = useDiceControlsStore(
    (state) => state.setDiceRollPressTime
  );

  function handlePointerDown() {
    setRollPressTime(performance.now());
  }

  useEffect(() => {
    if (rollPressTime) {
      const handlePointerUp = () => {
        setRollPressTime(null);
      };
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [rollPressTime]);

  const hasDice = useMemo(
    () =>
      !Object.entries(defaultDiceCounts).every(
        ([type, count]) => counts[type as DiceType] === count
      ),
    [counts, defaultDiceCounts]
  );

  const theme = useTheme();

  return (
    <>
      <ButtonBase
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          cursor: hasDice ? "pointer" : "",
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          ":focus": {
            outline: 0,
          },
          ":hover #dice-roll-button": hasDice
            ? {
                color: theme.palette.primary.contrastText,
                width: "100px",
                "& span": {
                  transform: "translateX(0)",
                },
                backgroundColor: theme.palette.primary.main,
              }
            : {},
          ":active #dice-roll-button": hasDice
            ? {
                backgroundColor: theme.palette.primary.dark,
              }
            : {},
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handleRoll}
        aria-label="roll"
        disabled={!hasDice}
      >
        <Box
          component="div"
          sx={{
            ":active": {
              animation: `${jiggle} 0.3s infinite`,
            },
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          fontSize="54px"
        >
          <Button
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: hasDice ? "transparent" : "transparent !important",
              "& span": {
                transform: "translate(-23px)",
                color: theme.palette.primary.contrastText,
                transition: theme.transitions.create("transform"),
              },
              transition: theme.transitions.create([
                "width",
                "color",
                "background-color",
              ]),
              minWidth: 0,
              width: "36px",
              overflow: "hidden",
              borderRadius: "20px",
            }}
            endIcon={<RollIcon />}
            variant="contained"
            disabled={!hasDice}
            id="dice-roll-button"
            // @ts-ignore
            component="div"
          >
            Roll
          </Button>
        </Box>
      </ButtonBase>
      <GradientOverlay top />
      <Stack
        sx={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Tooltip title="Clear" disableInteractive>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {/* Modifier display removed - now shown in SavageWorldsResults */}
    </>
  );
}

function FinishedRollControls() {
  return <FinishedRollResultsWrapper />;
}
