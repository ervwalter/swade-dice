import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
} from "@react-three/drei";

import Box from "@mui/material/Box";

import { InteractiveDiceRoll } from "../dice/InteractiveDiceRoll";
import { DiceRollControls } from "../controls/DiceRollControls";
import { AudioListenerProvider } from "../audio/AudioListenerProvider";
import { Tray } from "./Tray";
import { useDebugStore } from "../debug/store";
import { PreviewDiceRoll } from "../dice/PreviewDiceRoll";
import { FairnessTester } from "../tests/FairnessTester";

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
        camera={{
          fov: 29,
          position: [0, 4.3, 0],
          rotation: [-Math.PI / 2, 0, 0],
        }}
      >
        <AudioListenerProvider>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 4, 2]} intensity={1.5} />
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
