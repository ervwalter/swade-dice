import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
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

function TrayLighting() {
  return (
    <>
      <ambientLight intensity={0.95} />
      <hemisphereLight args={["#f6ead8", "#4a3a33", 1.05]} />
      <directionalLight position={[2.5, 5, 2.5]} intensity={0.75} />
      <directionalLight position={[-3, 3, -4]} intensity={0.35} />
      <Environment frames={1} resolution={128} environmentIntensity={0.65}>
        <Lightformer
          form="rect"
          color="#f9ead1"
          intensity={2}
          position={[0, 5, 2]}
          scale={[7, 5, 1]}
        />
        <Lightformer
          form="rect"
          color="#dce8f2"
          intensity={0.9}
          position={[-4, 3, -2]}
          scale={[5, 5, 1]}
        />
        <Lightformer
          form="rect"
          color="#d88a54"
          intensity={0.5}
          position={[4, 2, -3]}
          scale={[4, 5, 1]}
        />
      </Environment>
      <ContactShadows
        resolution={256}
        scale={[1, 2]}
        position={[0, 0, 0]}
        blur={1}
        opacity={0.22}
        far={1}
        color="#1b120d"
      />
    </>
  );
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
        camera={{
          fov: 29,
          position: [0, 4.3, 0],
          rotation: [-Math.PI / 2, 0, 0],
        }}
      >
        <AudioListenerProvider>
          <TrayLighting />
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
