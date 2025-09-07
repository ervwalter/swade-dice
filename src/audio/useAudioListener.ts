import * as THREE from "three";
import React, { useContext } from "react";

export const AudioListenerContext = React.createContext<
  THREE.AudioListener | undefined | null
>(undefined);

export function useAudioListener() {
  const context = useContext(AudioListenerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioListener must be used within a AudioListenerProvider"
    );
  }
  return context;
}