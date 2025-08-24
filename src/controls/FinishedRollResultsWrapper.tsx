import { GradientOverlay } from "./GradientOverlay";
import { SavageWorldsResultsContainer } from "./SavageWorldsResultsContainer";
import { SavageWorldsResultsSummaryContainer } from "./SavageWorldsResultsSummaryContainer";
import { useDiceControlsStore } from "./store";
import { useDiceRollStore } from "../dice/store";
import { useState, useEffect } from "react";

/**
 * Wrapper component that contains both the summary bar and detailed results
 * Handles hover detection and visibility for both areas together
 */
export function FinishedRollResultsWrapper() {
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const resultsPinned = useDiceControlsStore((state) => state.resultsDetailsPinned);
  const resultsHovered = useDiceControlsStore((state) => state.resultsDetailsHovered);
  const setResultsHovered = useDiceControlsStore((state) => state.setResultsDetailsHovered);
  const roll = useDiceRollStore((state) => state.roll);
  
  // Reset hover state when roll changes
  useEffect(() => {
    setResultsHovered(false);
  }, [roll, setResultsHovered]);
  
  // Show details if either pinned or hovered
  const showDetails = resultsPinned || resultsHovered;
  
  return (
    <>
      {/* <GradientOverlay top height={showDetails ? 400 : undefined} /> */}
      <div
        onMouseEnter={() => setResultsHovered(true)}
        onMouseLeave={() => setResultsHovered(false)}
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      >
        <SavageWorldsResultsSummaryContainer />
        {showDetails && <SavageWorldsResultsContainer />}
      </div>
    </>
  );
}