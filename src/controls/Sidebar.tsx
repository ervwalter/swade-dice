import SimpleBar from "simplebar-react";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import { DiceSetPicker } from "./DiceSetPicker";
import { DicePicker } from "./DicePicker";
import { DiceHidden } from "./DiceHidden";
import { DiceHistory } from "./DiceHistory";

import { FairnessTesterButton } from "../tests/FairnessTesterButton";

import { PluginGate } from "../plugin/PluginGate";
import { ResizeObserver as PluginResizeObserver } from "../plugin/ResizeObserver";

export function Sidebar() {
  return (
    <SimpleBar
      style={{
        height: "100%",
        width: "60px",
        minWidth: "60px",
        overflowY: "auto",
      }}
    >
      <Stack py={1} px={0.5} gap={1} alignItems="center">
        <DiceSetPicker />
        <Divider flexItem sx={{ mx: 1 }} />
        <DicePicker />
        <Divider flexItem sx={{ mx: 1 }} />
        <DiceHidden />
        <DiceHistory />
        <FairnessTesterButton />
        
        <PluginGate>
          <PluginResizeObserver />
        </PluginGate>
      </Stack>
    </SimpleBar>
  );
}
