import React from "react";
import { DiceType } from "../../types/DiceType";

import { D10 } from "./D10";
import { D12 } from "./D12";
import { D4 } from "./D4";
import { D6 } from "./D6";
import { D8 } from "./D8";

type Props = JSX.IntrinsicElements["group"] & { diceType: DiceType };

export const RoundedDiceMesh = React.forwardRef<THREE.Group, Props>(
  ({ diceType, ...props }, ref) => {
    switch (diceType) {
      case "D4":
        return <D4 ref={ref} {...props} />;
      case "D6":
        return <D6 ref={ref} {...props} />;
      case "D8":
        return <D8 ref={ref} {...props} />;
      case "D10":
        return <D10 ref={ref} {...props} />;
      case "D12":
        return <D12 ref={ref} {...props} />;
      default:
        throw Error(`Dice type ${diceType} error: not implemented`);
    }
  }
);
