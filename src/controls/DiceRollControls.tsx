import { useEffect, useMemo } from "react";

import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { keyframes } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

import RollIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";

import { useDiceRollStore } from "../dice/store";
import { DiceType } from "../types/DiceType";
import { Die } from "../types/Die";
import { FinishedRollResultsWrapper } from "./FinishedRollResultsWrapper";
import { useDiceHistoryStore } from "./history";
import { getDiceToRoll, useDiceControlsStore } from "./store";
import { ModeSelector } from "./ModeSelector";

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
  
  // Roll mode state from store
  const rollMode = useDiceControlsStore((state) => state.rollMode);
  const modeChoice = useDiceControlsStore((state) => state.modeChoice);
  const setModeChoice = useDiceControlsStore((state) => state.setModeChoice);

  function handleRoll() {
    if (hasDice && rollPressTime) {
      // Clear any previous explosion state
        
      // Use rollMode from store (already computed)
      const isTraitTest = rollMode === "TRAIT";
      
      const dice = getDiceToRoll(counts, diceById, wildDieEnabled, diceSet.dice[0]?.style, isTraitTest);
      const activeTimeSeconds = (performance.now() - rollPressTime) / 1000;
      const speedMultiplier = Math.max(1, Math.min(10, activeTimeSeconds * 2));
      
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
      
      pushRecentRoll({ 
        counts, 
        diceById: rolledDiceById,
        rollMode,
        traitModifier,
        damageModifier,
        targetNumber,
        wildDieEnabled,
      });

      handleReset(true);  // Preserve mode choice when resetting after roll
    }
    setRollPressTime(null);
  }

  function handleReset(preserveMode?: boolean) {
    resetDiceCounts(preserveMode);
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
  }, [rollPressTime, setRollPressTime]);

  const hasDice = useMemo(
    () =>
      !Object.entries(defaultDiceCounts).every(
        ([type, count]) => counts[type as DiceType] === count
      ),
    [counts, defaultDiceCounts]
  );
  
  // Determine if dice are currently rolling
  const pendingDice = useDiceRollStore((state) => state.pendingDice);
  const isRolling = pendingDice.length > 0;

  return (
    <>
      {/* Control panel with ModeSelector and Roll button */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        <Stack
          direction="column"
          spacing={3}
          alignItems="center"
          sx={{ pointerEvents: "auto" }}
        >
          <ModeSelector
            autoMode={rollMode}
            currentMode={modeChoice}
            visible={hasDice && !isRolling}
            disabled={isRolling}
            onModeChange={(mode) => {
              setModeChoice(mode);
            }}
          />
          
          {hasDice && !isRolling && (
            <Button
              variant="contained"
              endIcon={<RollIcon />}
              onPointerDown={handlePointerDown}
              onPointerUp={handleRoll}
              sx={{
                borderRadius: "20px",
                px: 3,
                color: "white",
                backgroundColor: "#9966ff",
                "&:hover": {
                  backgroundColor: "#8855ee",
                },
                ":active": {
                  animation: `${jiggle} 0.3s infinite`,
                  backgroundColor: "#7744dd",
                },
              }}
              id="dice-roll-button"
            >
              Roll
            </Button>
          )}
        </Stack>
      </div>

      {/* Optional invisible overlay for tap-anywhere rolling */}
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
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handleRoll}
        aria-label="roll dice"
        disabled={!hasDice}
      />

      {/* Clear button */}
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
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleReset();
            }}
            sx={{
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </>
  );
}

function FinishedRollControls() {
  return <FinishedRollResultsWrapper />;
}
