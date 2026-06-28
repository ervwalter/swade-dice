import React from "react";
import { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { Die } from "../types/Die";

import { DiceMesh } from "../meshes/DiceMesh";
import { DiceMaterial } from "../materials/DiceMaterial";

export const Dice: React.FC<ThreeElements["group"] & { die: Die }> = ({ die, children, ref, ...props }) => {
  return (
    <DiceMesh
      diceType={die.type}
      // fiber v9 types the element `ref` slightly wider than React's
      // forwardRef `Ref<T>` (its cleanup return is `VoidOrUndefinedOnly`),
      // so narrow it at this single boundary.
      ref={ref as React.Ref<THREE.Group>}
      {...props}
      sharp={die.style === "WALNUT"}
    >
      <DiceMaterial diceStyle={die.style} />
      {children}
    </DiceMesh>
  );
};
