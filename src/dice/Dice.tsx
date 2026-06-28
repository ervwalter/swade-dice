import React from "react";
import { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { Die } from "../types/Die";

import { DiceMesh } from "../meshes/DiceMesh";
import { DiceMaterial } from "../materials/DiceMaterial";

export type DiceProps = Omit<ThreeElements["group"], "ref"> & { die: Die };

export const Dice = React.forwardRef<THREE.Group, DiceProps>(function Dice(
  { die, children, ...props },
  ref
) {
  return (
    <DiceMesh
      diceType={die.type}
      ref={ref}
      {...props}
      sharp={die.style === "WALNUT"}
    >
      <DiceMaterial diceStyle={die.style} />
      {children}
    </DiceMesh>
  );
});
