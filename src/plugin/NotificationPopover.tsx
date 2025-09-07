import { useEffect, useState, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { Fade } from "@mui/material";
import { RollBroadcast } from "./DiceRollSync";
import { RollNotification } from "./RollNotification";
import { getPluginId } from "./getPluginId";

export function NotificationPopover() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [latestRoll, setLatestRoll] = useState<RollBroadcast | null>(null);
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Monitor panel open/close state directly
  useEffect(() => {
    // Check initial state
    OBR.action.isOpen().then(setIsPanelOpen);

    // Listen for changes
    const unsubscribe = OBR.action.onOpenChange((isOpen) => {
      setIsPanelOpen(isOpen);
      if (isOpen) {
        // Hide notification when panel opens
        setShow(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Listen for roll broadcasts
  useEffect(() => {
    const unsubscribe = OBR.broadcast.onMessage(
      getPluginId("roll-result"), 
      (event) => {
        const broadcast = event.data as RollBroadcast;
        
        // Only show if panel is closed and roll is complete
        if (!isPanelOpen && broadcast.result?.isComplete) {
          setLatestRoll(broadcast);
          setShow(true);
          
          // Clear existing timer
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          
          // Auto-hide after 10 seconds
          timerRef.current = setTimeout(() => {
            setShow(false);
          }, 10000);
        }
      }
    );

    return unsubscribe;
  }, [isPanelOpen]);

  // Update popover size based on show state
  useEffect(() => {
    if (show) {
      OBR.popover.setWidth(getPluginId("notification-popover"), 600);
      OBR.popover.setHeight(getPluginId("notification-popover"), 160);
    } else {
      OBR.popover.setWidth(getPluginId("notification-popover"), 0);
      OBR.popover.setHeight(getPluginId("notification-popover"), 0);
    }
  }, [show]);

  return show && latestRoll ? (
    <Fade in timeout={300}>
      <div>
        <RollNotification roll={latestRoll} />
      </div>
    </Fade>
  ) : null;
}