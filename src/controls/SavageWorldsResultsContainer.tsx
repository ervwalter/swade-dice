import { useSavageWorldsResults } from "../hooks/useSavageWorldsResults";
import { SavageWorldsResults } from "./SavageWorldsResults";

/**
 * Container component that connects SavageWorldsResults to the store
 * Visibility is controlled by parent wrapper
 */
export function SavageWorldsResultsContainer() {
  const {
    mainChains,
    wildChains,
    isTraitTest,
    modifier,
    mainTotal,
    finalResult,
    isComplete,
    success,
    raises,
    targetNumber,
    hasResults,
  } = useSavageWorldsResults();
  
  return (
    <div 
      style={{
        // position: "absolute",
        // top: 50,  // Position below the control bar
        // left: 0,
        // right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderRadius: "0 0 8px 8px",
        padding: "12px 32px",
        pointerEvents: "auto",
        zIndex: 1000,
      }}
    >
      <SavageWorldsResults
        results={{
          mainChains,
          wildChains,
          isTraitTest,
          modifier,
          mainTotal,
          finalResult,
          isComplete,
          success,
          raises,
          targetNumber,
          hasResults,
        }}
      />
    </div>
  );
}