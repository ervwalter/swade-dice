import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "./plugin/getPluginId";

OBR.onReady(() => {
  // Open persistent popover at top center
  OBR.popover.open({
    id: getPluginId("notification-popover"),
    url: "/popover.html",
    width: 0,
    height: 0,
    anchorOrigin: { horizontal: "CENTER", vertical: "TOP" },
    transformOrigin: { horizontal: "CENTER", vertical: "TOP" },
    disableClickAway: true,
    hidePaper: true,
    marginThreshold: 20,
  });
});