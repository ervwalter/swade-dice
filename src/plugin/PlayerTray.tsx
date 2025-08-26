import { Player } from "@owlbear-rodeo/sdk";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import HiddenIcon from "@mui/icons-material/VisibilityOffRounded";

import { AudioListenerProvider } from "../audio/AudioListenerProvider";
import { SavageWorldsResults } from "../controls/SavageWorldsResults";
import { SavageWorldsResultsSummary } from "../controls/SavageWorldsResultsSummary";
import { useDebugStore } from "../debug/store";
import environment from "../environment.hdr";
import { useRemotePlayerResults } from "../hooks/useRemotePlayerResults";
import { Tray } from "../tray/Tray";
import { TraySuspense } from "../tray/TraySuspense";
import { PlayerDiceRoll } from "./PlayerDiceRoll";
import { usePlayerDice } from "./usePlayerDice";

export function PlayerTray({
  player,
}: {
  player?: Player; // Make player optional to allow for preloading of the tray
}) {
  const allowOrbit = useDebugStore((state) => state.allowOrbit);

  return (
    <Box component="div" position="relative" display="flex">
      <Box
        component="div"
        borderRadius={0.5}
        height="100vh"
        width="calc(100vh / 2)"
        overflow="hidden"
        position="relative"
      >
        <TraySuspense>
          <Canvas frameloop="demand">
            <AudioListenerProvider>
              <Environment files={environment} />
              <ContactShadows
                resolution={256}
                scale={[1, 2]}
                position={[0, 0, 0]}
                blur={0.5}
                opacity={0.5}
                far={1}
                color="#222222"
              />
              <Tray />
              <PlayerDiceRoll player={player} />
              <PerspectiveCamera
                makeDefault
                fov={28}
                position={[0, 4.3, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              />
              {allowOrbit && <OrbitControls />}
            </AudioListenerProvider>
          </Canvas>
        </TraySuspense>
      </Box>
      <PlayerTrayResults player={player} />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          pointerEvents: "none",
          padding: 3,
        }}
        component="div"
      >
        <Typography
          variant="h6"
          color="rgba(255, 255, 255, 0.7)"
          textAlign="center"
        >
          {player?.name}
        </Typography>
      </Box>
    </Box>
  );
}

function PlayerTrayResults({ player }: { player?: Player }) {
  const { 
    diceRoll, 
    currentRollResult,
    finishedRolling 
  } = usePlayerDice(player);

  
  const result = useRemotePlayerResults(
    currentRollResult,
    finishedRolling
  );
  
  const hasResults = result && result.dieChains && result.dieChains.length > 0;

  return (
    <>
      {diceRoll?.hidden && (
        <Backdrop open sx={{ position: "absolute" }}>
          <Tooltip title="Hidden Roll">
            <HiddenIcon htmlColor="white" />
          </Tooltip>
        </Backdrop>
      )}
      {hasResults && finishedRolling && (
        <>
          {/* <Fade in>
            <GradientOverlay top height={resultsExpanded ? 500 : undefined} />
          </Fade>
          <GradientOverlay /> */}
          {/* Main summary at the top with background */}
          <Fade in>
            <div>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  borderRadius: "0 0 8px 8px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "center",
                }}
                component="div"
              >
                <SavageWorldsResultsSummary
                  result={result}
                  hidden={diceRoll?.hidden}
                />
              </Box>
              
              {/* Detailed results below the summary */}
              <Box 
                component="div"
                position="absolute"
                top={56}
                left={0}
                right={0}
                bgcolor="rgba(0, 0, 0, 0.7)"
                borderRadius="0 0 8px 8px"
                padding="8px 16px"
                display="flex"
                justifyContent="center"
              >
                <SavageWorldsResults result={result} />
              </Box>
            </div>
          </Fade>
        </>
      )}
    </>
  );
}
