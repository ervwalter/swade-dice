import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

import { WildDieToggle } from "./WildDieToggle";
import { TargetNumber } from "./TargetNumber";
import { TraitModifier } from "./TraitModifier";
import { DamageModifier } from "./DamageModifier";

export function TopControls() {
  return (
    <Box
      component="div"
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        minHeight: "fit-content",
      }}
    >
      <Stack direction="row" gap={1} alignItems="center" justifyContent="center" flexWrap="nowrap" px={2}>
        <WildDieToggle />
        <Divider orientation="vertical" flexItem />
        <TargetNumber />
        <Divider orientation="vertical" flexItem />
        <TraitModifier />
        <Divider orientation="vertical" flexItem />
        <DamageModifier />
      </Stack>
    </Box>
  );
}