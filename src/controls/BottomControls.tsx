import Box from "@mui/material/Box";

import { PluginGate } from "../plugin/PluginGate";
import { DiceRollSync } from "../plugin/DiceRollSync";
import { PartyTrays } from "../plugin/PartyTrays";

export function BottomControls() {
  return (
    <PluginGate>
      <Box
        component="div"
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          minHeight: "fit-content",
        }}
        pt={1}
      >
        <DiceRollSync />
        <Box 
          component="div" 
          display="flex" 
          flexWrap="wrap" 
          gap={2} 
          justifyContent="center"
          alignItems="center"
        >
          <PartyTrays />
        </Box>
      </Box>
    </PluginGate>
  );
}