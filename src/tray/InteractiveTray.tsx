import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";

import Box from "@mui/material/Box";

import { InteractiveDiceRoll } from "../dice/InteractiveDiceRoll";
import { DiceRollControls } from "../controls/DiceRollControls";
import environment from "../environment.hdr";
import { AudioListenerProvider } from "../audio/AudioListenerProvider";
import { Tray } from "./Tray";
import { useDebugStore } from "../debug/store";
import { PreviewDiceRoll } from "../dice/PreviewDiceRoll";
import { FairnessTester } from "../tests/FairnessTester";

function TrayEnvironment() {
  return <Environment files={environment} />;
}

/** Dice tray that controls the dice roll store */
export function InteractiveTray() {
  const allowOrbit = useDebugStore((state) => state.allowOrbit);

  return (
    <Box
      component="div"
      id="interactive-tray"
      sx={{
        borderRadius: 1,
        height: "100%",
        flex: 1,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "flex-start",  // Align canvas to top
        "& canvas": {
          touchAction: "manipulation",
          userSelect: "none",
        },
      }}
    >
      <Canvas
        frameloop="demand"
        camera={{
          fov: 29,
          position: [0, 4.3, 0],
          rotation: [-Math.PI / 2, 0, 0],
        }}
      >
        <AudioListenerProvider>
          <Suspense fallback={null}>
            <TrayEnvironment />
          </Suspense>
          <ContactShadows
            resolution={256}
            scale={[1, 2]}
            position={[0, 0, 0]}
            blur={0.5}
            opacity={0.5}
            far={1}
            color="#222222"
          />
          <Suspense fallback={null}>
            <Tray />
            <PreviewDiceRoll />
            <InteractiveDiceRoll />
          </Suspense>
          {allowOrbit && <OrbitControls />}
        </AudioListenerProvider>
      </Canvas>
      <DiceRollControls />
      <FairnessTester />
    </Box>
  );
}
