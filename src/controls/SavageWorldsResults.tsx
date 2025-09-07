import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { getMaxValue } from "../helpers/explosionDisplay";
import { SavageRollResult, DieChain } from "../types/SavageWorldsTypes";
import { DiceType } from "../types/DiceType";

interface SavageWorldsResultsProps {
  result: SavageRollResult;
}

export function SavageWorldsResults({ result }: SavageWorldsResultsProps) {
  const { dieChains, outcomes, mode, modifier, targetNumber, isComplete, wildDieEnabled } = result;
  
  const isTraitTest = mode === "TRAIT";
  const isMultiDieTrait = isTraitTest && outcomes.length > 1;
  
  // Don't show anything if no results yet
  if (!dieChains || dieChains.length === 0) {
    return null;
  }
  
  // Helper to render explosion chain for a single die
  const renderExplosionChain = (rolls: number[], dieType: DiceType) => (
    <>
      {rolls.map((value: number, index: number) => {
        const isMax = value === getMaxValue(dieType);
        const isLastRoll = index === rolls.length - 1;
        const showExplosion = isMax && !isLastRoll;
        return (
          <span key={index}>
            {value}{showExplosion && "💥"}
            {!isLastRoll && " + "}
          </span>
        );
      }).reduce((prev: React.ReactNode, curr: React.ReactNode) => <>{prev}{curr}</>, <></>)}
    </>
  );
  
  // Prepare dice display based on mode
  let diceDisplay: React.ReactNode;
  
  if (isTraitTest) {
    // Trait test - show individual chains with "Trait" and "Wild" labels
    const regularChains = dieChains.filter(c => !c.isWildDie);
    const wildChains = dieChains.filter(c => c.isWildDie);
    
    diceDisplay = (
      <>
        {regularChains.map(chain => (
          <Typography key={chain.dieId} variant="body2" color="white">
            Trait ({chain.dieType.toLowerCase()}): {renderExplosionChain(chain.rolls, chain.dieType)}
            {chain.rolls.length > 1 && ` = ${chain.total}`}
          </Typography>
        ))}
        {wildDieEnabled && wildChains.map(chain => (
          <Typography key={chain.dieId} variant="body2" color="white">
            Wild ({chain.dieType.toLowerCase()}): {renderExplosionChain(chain.rolls, chain.dieType)}
            {chain.rolls.length > 1 && ` = ${chain.total}`}
          </Typography>
        ))}
      </>
    );
  } else {
    // Damage roll - group by die type
    const groupedByType: Record<DiceType, DieChain[]> = {} as Record<DiceType, DieChain[]>;
    dieChains.forEach(chain => {
      if (!groupedByType[chain.dieType]) {
        groupedByType[chain.dieType] = [];
      }
      groupedByType[chain.dieType].push(chain);
    });
    
    diceDisplay = (
      <>
        {Object.entries(groupedByType).map(([dieType, chains]) => {
          const groupTotal = chains.reduce((sum, c) => sum + c.total, 0);
          const needsTotal = chains.length > 1 || chains.some(c => c.rolls.length > 1);
          return (
            <Typography key={dieType} variant="body2" color="white">
              {chains.length}{dieType.toLowerCase()}: {
                chains.map((chain, chainIndex) => (
                  <span key={chain.dieId}>
                    {chainIndex > 0 && " + "}
                    {renderExplosionChain(chain.rolls, chain.dieType as DiceType)}
                  </span>
                ))
              }
              {needsTotal && ` = ${groupTotal}`}
            </Typography>
          );
        })}
      </>
    );
  }
  
  return (
    <Stack spacing={0.5} alignItems="flex-start">
      {/* Display dice */}
      {diceDisplay}
      
      {/* Show modifier if non-zero */}
      {modifier !== undefined && modifier !== 0 && (
        <Typography variant="body2" color="white">
          Modifier: {modifier > 0 ? '+' : ''}{modifier}
        </Typography>
      )}
      
      {/* Show results */}
      {isTraitTest && isMultiDieTrait ? (
        // Multi-die trait test results
        <>
          <Typography variant="body2" color="white" sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', pt: 0.5, mt: 0.5 }}>
            Results:
          </Typography>
          {outcomes.map((outcome, index) => (
            <Stack key={index} direction="row" alignItems="center" spacing={0.5} sx={{ ml: 2 }}>
              <Typography variant="body2" color="white">
                {outcome.total}
                {outcome.replacedByWild && " (wild)"}
              </Typography>
              {outcome.success !== undefined && (
                outcome.success ? (
                  <>
                    <CheckIcon sx={{ fontSize: "14px", color: "#4caf50" }} />
                    <Typography variant="body2" color="#4caf50">
                      Success vs TN {targetNumber}{outcome.raises && outcome.raises > 0 ? ` (${outcome.raises} raise${outcome.raises > 1 ? 's' : ''})` : ''}
                    </Typography>
                  </>
                ) : (
                  <>
                    <CloseIcon sx={{ fontSize: "14px", color: "#f44336" }} />
                    <Typography variant="body2" color="#f44336">
                      Failed vs TN {targetNumber}
                    </Typography>
                  </>
                )
              )}
            </Stack>
          ))}
        </>
      ) : outcomes.length > 0 ? (
        // Single result (single trait test or damage)
        <>
          <Typography variant="body2" color="white" sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', pt: 0.5, mt: 0.5 }}>
            {isTraitTest ? "Result" : "Total"}: {outcomes[0].total}
          </Typography>
          {isTraitTest && isComplete && outcomes[0].success !== undefined && (
            outcomes[0].success ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CheckIcon sx={{ fontSize: "16px", color: "#4caf50" }} />
                <Typography variant="body2" color="#4caf50">
                  Success vs TN {targetNumber}
                  {outcomes[0].raises && outcomes[0].raises > 0 ? ` with ${outcomes[0].raises} raise${outcomes[0].raises > 1 ? 's' : ''}!` : ''}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CloseIcon sx={{ fontSize: "16px", color: "#f44336" }} />
                <Typography variant="body2" color="#f44336">
                  Failed vs TN {targetNumber}
                </Typography>
              </Stack>
            )
          )}
        </>
      ) : null}
    </Stack>
  );
}