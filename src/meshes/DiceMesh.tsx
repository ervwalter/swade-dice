import React from "react";
import { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { DiceType } from "../types/DiceType";
import { RoundedDiceMesh } from "./rounded/RoundedDiceMesh";
import { SharpDiceMesh } from "./sharp/SharpDiceMesh";

type DiceMeshProps = ThreeElements["group"] & {
  diceType: DiceType;
  sharp?: boolean;
};

export const DiceMesh = React.forwardRef<THREE.Group, DiceMeshProps>(function DiceMesh(
  { sharp, ...props }, ref) {
    if (sharp) {
      return <SharpDiceMesh ref={ref} {...props} />;
    } else {
      return <RoundedDiceMesh ref={ref} {...props} />;
    }
  }
);
