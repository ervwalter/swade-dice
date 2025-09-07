import React from "react";
import { Die } from "../types/Die";

import { DiceMesh } from "../meshes/DiceMesh";
import { DiceMaterial } from "../materials/DiceMaterial";

export const Dice: React.FC<JSX.IntrinsicElements["group"] & { die: Die }> = ({ die, children, ...props }) => {
  return (
    <DiceMesh
      diceType={die.type}
      {...props}
      sharp={die.style === "WALNUT"}
    >
      <DiceMaterial diceStyle={die.style} />
      {children}
    </DiceMesh>
  );
};
