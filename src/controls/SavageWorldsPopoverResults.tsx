import React from "react";
import { SavageWorldsResultsSummary } from "./SavageWorldsResultsSummary";
import { useSavageWorldsResults } from "../hooks/useSavageWorldsResults";

/**
 * Savage Worlds results display specifically for the popover
 * Always shows results when available (no hover/pin logic)
 */
export function SavageWorldsPopoverResults() {
  const result = useSavageWorldsResults();
  
  // Don't show anything if no results yet
  if (!result || !result.dieChains || result.dieChains.length === 0) {
    return null;
  }
  
  return (
    <div
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: "8px",
        padding: "8px 16px",
        display: "block",
        minWidth: "fit-content",
      }}
    >
      <SavageWorldsResultsSummary result={result} />
    </div>
  );
}