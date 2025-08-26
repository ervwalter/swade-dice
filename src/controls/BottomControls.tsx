import Box from "@mui/material/Box";

import { DiceRollSync } from "../plugin/DiceRollSync";
import { PartyTrays } from "../plugin/PartyTrays";
import { PluginGate } from "../plugin/PluginGate";

export function BottomControls() {
  return (
    <PluginGate>
      <Box
        component="div"
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          minHeight: "fit-content",
        }}
        py={1}
      >

        <Box 
          component="div" 
          display="flex" 
          flexWrap="wrap" 
          gap={1} 
          justifyContent="center"
          alignItems="center"
        >
          <PartyTrays />
        </Box>
      </Box>
    </PluginGate>
  );
}