import { NotificationPopover } from "./NotificationPopover";
import { PluginGate } from "./PluginGate";
import { PluginThemeProvider } from "./PluginThemeProvider";

export function PopoverApp() {
  return (
    <PluginGate>
      <PluginThemeProvider>
        <NotificationPopover />
      </PluginThemeProvider>
    </PluginGate>
  );
}