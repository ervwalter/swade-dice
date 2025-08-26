import { useSavageWorldsResults } from "../hooks/useSavageWorldsResults";
import { SavageWorldsResults } from "./SavageWorldsResults";

/**
 * Container component that connects SavageWorldsResults to the store
 * Visibility is controlled by parent wrapper
 */
export function SavageWorldsResultsContainer() {
  const result = useSavageWorldsResults();
  
  if (!result) {
    return null;
  }
  
  return (
    <div 
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderRadius: "0 0 8px 8px",
        padding: "12px 32px",
        pointerEvents: "auto",
        zIndex: 1000,
      }}
    >
      <SavageWorldsResults result={result} />
    </div>
  );
}