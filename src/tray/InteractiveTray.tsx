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

function TrayLighting() {
  return (
    <>
      <ambientLight intensity={0.53} />
      <hemisphereLight args={["#f2e5d4", "#2f2925", 0.53]} />
      <directionalLight position={[2.5, 5, 2.5]} intensity={0.25} />
      <directionalLight position={[-3, 2.5, -4]} intensity={0.18} />
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

function TrayEnvironment() {
  return <Environment files={environment} environmentIntensity={1.05} />;
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
            <TrayEnvironment />
          </Suspense>
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
