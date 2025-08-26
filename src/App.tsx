import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

import { InteractiveTray } from "./tray/InteractiveTray";
import { Sidebar } from "./controls/Sidebar";
import { TopControls } from "./controls/TopControls";
import { BottomControls } from "./controls/BottomControls";
import { PluginGate } from "./plugin/PluginGate";
import { DiceRollSync } from "./plugin/DiceRollSync";

export function App() {
  return (
    <Container disableGutters maxWidth="md">
      <Stack direction="column" height="100vh" gap={0.5}>
        {/* Top row with settings */}
        <TopControls />
        
        {/* Main content area */}
        <Box component="div" display="flex" flex={1} gap={0.5} overflow="hidden">
          <Sidebar />
          <InteractiveTray />
        </Box>
        
        {/* Bottom row with player avatars */}
        {/* <BottomControls /> */}
        <PluginGate>
                  <DiceRollSync />
        </PluginGate>
      </Stack>
    </Container>
  );
}
