import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Player } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import ButtonBase from "@mui/material/ButtonBase";

import environment from "../environment.hdr";
import { usePlayerDice } from "./usePlayerDice";
import { PlayerDiceRoll } from "./PlayerDiceRoll";
import { AudioListenerProvider } from "../audio/AudioListenerProvider";
import { Tray } from "../tray/Tray";
import { TraySuspense } from "../tray/TraySuspense";
import { AnimatedPlayerCamera } from "./AnimatedPlayerCamera";
import { useRemotePlayerResults } from "../hooks/useRemotePlayerResults";
import { SavageWorldsResultsSummary } from "../controls/SavageWorldsResultsSummary";

export function PopoverTray({
  player,
  onToggle,
  onOpen,
}: {
  player: Player;
  onToggle: (connectionId: string, show: boolean) => void;
  onOpen: (connectionId: string) => void;
}) {
  const { 
    diceRoll, 
    finishedRolling, 
    finishedRollTransforms, 
    explosionResults,
    rollValues,
    dieInfo,
    controlSettings 
  } = usePlayerDice(player);

  const theme = useTheme();

  const hidden = !diceRoll || diceRoll.hidden;

  const [timedOut, setTimedOut] = useState(finishedRolling);

  useEffect(() => {
    if (finishedRolling) {
      const timeout = setTimeout(() => {
        setTimedOut(true);
      }, 10000);
      return () => {
        clearTimeout(timeout);
      };
    } else {
      setTimedOut(false);
    }
  }, [finishedRolling]);

  const shown = !hidden && !timedOut;
  useEffect(() => {
    if (shown) {
      onToggle(player.connectionId, true);
    }
  }, [shown]);

  function handleClick() {
    if (shown) {
      setTimedOut(true);
      onOpen(player.connectionId);
    }
  }

  return (
    <Box component="div" position="absolute" right={16} bottom={16}>
      <Slide
        in={shown}
        onExited={() => onToggle(player.connectionId, false)}
        direction="up"
      >
        <ButtonBase onClick={handleClick}>
          <Paper
            elevation={8}
            sx={{
              width: "200px",
              height: "232px",
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(34, 38, 57, 0.8)"
                  : "rgba(255, 255, 255, 0.4)",
            }}
          >
            <Box component="div" height="200px" width="200px">
              <TraySuspense>
                <Canvas frameloop="demand">
                  <AudioListenerProvider volume={0.25}>
                    <Environment files={environment} />
                    <Tray />
                    <PlayerDiceRoll player={player} />
                    <AnimatedPlayerCamera
                      rollTransforms={
                        finishedRolling ? finishedRollTransforms : undefined
                      }
                    />
                  </AudioListenerProvider>
                </Canvas>
              </TraySuspense>
            </Box>
            <PopoverResults 
              player={player}
              explosionResults={explosionResults}
              rollValues={rollValues}
              dieInfo={dieInfo}
              controlSettings={controlSettings}
              finishedRolling={finishedRolling}
            />
          </Paper>
        </ButtonBase>
      </Slide>
    </Box>
  );
}

function PopoverResults({ 
  player, 
  explosionResults, 
  rollValues, 
  dieInfo, 
  controlSettings, 
  finishedRolling 
}: any) {
  const results = useRemotePlayerResults(
    explosionResults,
    rollValues,
    dieInfo,
    controlSettings,
    finishedRolling
  );
  
  if (!results.hasResults || !finishedRolling) {
    return (
      <Typography
        variant="subtitle1"
        color="text.secondary"
        textAlign="center"
        lineHeight="32px"
        sx={{
          bgcolor: "background.default",
          minHeight: "32px",
        }}
        noWrap
      >
        {player?.name}
      </Typography>
    );
  }
  
  return (
    <div
      style={{
        backgroundColor: "#424242",
        minHeight: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 8px",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography variant="subtitle1" color="text.secondary">
          {player?.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          |
        </Typography>
        <Box component="span" fontSize="0.875rem">
          <SavageWorldsResultsSummary
            results={results}
            hidePrefix={true}
            variant="subtitle1"
          />
        </Box>
      </Stack>
    </div>
  );
}
