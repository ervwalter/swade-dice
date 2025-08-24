import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/material/styles";
import { useSavageWorldsResults } from "../hooks/useSavageWorldsResults";

/**
 * Savage Worlds results display specifically for the popover
 * Always shows results when available (no hover/pin logic)
 */
export function SavageWorldsPopoverResults() {
  const {
    isTraitTest,
    finalResult,
    isComplete,
    success,
    raises,
    hasResults,
  } = useSavageWorldsResults();
  
  // Don't show anything if no dice have been rolled yet
  if (!hasResults) {
    return null;
  }
  
  return (
    <Box
      component="div"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: "8px",
        padding: "8px 16px",
        display: "inline-block",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h6" color="white">
          <span style={{ fontWeight: "normal", opacity: 0.8 }}>
            {isTraitTest ? "Result: " : "Total: "}
          </span>
          <span style={{ fontWeight: "bold" }}>
            {finalResult}
          </span>
        </Typography>
        {isTraitTest && isComplete && (
          <>
            {success ? (
              <span style={{ fontSize: "20px", color: "#4caf50" }}>✓</span>
            ) : (
              <span style={{ fontSize: "20px", color: "#f44336" }}>✗</span>
            )}
            {raises > 0 && (
              <span style={{ fontSize: "18px", color: "#ffc107", fontWeight: "bold" }}>
                {"↑".repeat(Math.min(raises, 3))}
              </span>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}