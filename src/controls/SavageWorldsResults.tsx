import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { DiceType } from "../types/DiceType";
import { getMaxValue } from "../helpers/explosionDisplay";
import { SavageWorldsResultsData, DiceChain } from "../types/SavageWorldsResultsData";

interface SavageWorldsResultsProps {
  results: SavageWorldsResultsData;
}

export function SavageWorldsResults({ results }: SavageWorldsResultsProps) {
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
  } = results;
  // Don't show anything if no dice have been rolled yet
  if (!hasResults) {
    return null;
  }
  
  return (
    <Stack spacing={0.5} alignItems="flex-start">
        {/* Show trait test format for single die rolls */}
        {isTraitTest ? (
          <>
            {/* Trait die result */}
            {mainChains.map(chain => (
              <Typography key={chain.dieId} variant="body2" color="white">
                Trait ({chain.dieType.toLowerCase()}): {
                  chain.rolls.map((value: number, index: number) => {
                    const isMax = value === getMaxValue(chain.dieType);
                    const isLastRoll = index === chain.rolls.length - 1;
                    const showExplosion = isMax && !isLastRoll;
                    return (
                      <span key={index}>
                        {value}{showExplosion && "💥"}
                        {!isLastRoll && " + "}
                      </span>
                    );
                  }).reduce((prev: React.ReactNode, curr: React.ReactNode) => <>{prev}{curr}</>, <></>)
                }
                {chain.rolls.length > 1 && ` = ${chain.total}`}
              </Typography>
            ))}
            {/* Wild die result - only show if we have wild chains */}
            {wildChains.length > 0 && wildChains.map(chain => (
              <Typography key={chain.dieId} variant="body2" color="white">
                Wild ({chain.dieType.toLowerCase()}): {
                  chain.rolls.map((value: number, index: number) => {
                    const isMax = value === getMaxValue(chain.dieType);
                    const isLastRoll = index === chain.rolls.length - 1;
                    const showExplosion = isMax && !isLastRoll;
                    return (
                      <span key={index}>
                        {value}{showExplosion && "💥"}
                        {!isLastRoll && " + "}
                      </span>
                    );
                  }).reduce((prev: React.ReactNode, curr: React.ReactNode) => <>{prev}{curr}</>, <></>)
                }
                {chain.rolls.length > 1 && ` = ${chain.total}`}
              </Typography>
            ))}
            {/* Show modifier if non-zero */}
            {modifier !== undefined && modifier !== 0 && (
              <Typography variant="body2" color="white">
                Modifier: {modifier > 0 ? '+' : ''}{modifier}
              </Typography>
            )}
            {/* Show result with success/raises if we have a target number - only when all dice are done */}
            {!isComplete ? (
              // Show result without success/failure while dice are still rolling
              <Typography variant="body2" color="white" sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', pt: 0.5, mt: 0.5 }}>
                Result: {finalResult}
              </Typography>
            ) : (
              <>
                <Typography variant="body2" color="white" sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', pt: 0.5, mt: 0.5 }}>
                  Result: {finalResult}
                </Typography>
                {success && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CheckIcon sx={{ fontSize: "16px", color: "#4caf50" }} />
                    <Typography variant="body2" color="#4caf50">
                      Success vs TN {targetNumber}
                      {raises > 0 && ` with ${raises} raise${raises > 1 ? 's' : ''}!`}
                    </Typography>
                  </Stack>
                )}
                {!success && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CloseIcon sx={{ fontSize: "16px", color: "#f44336" }} />
                    <Typography variant="body2" color="#f44336">
                      Failed vs TN {targetNumber}
                    </Typography>
                  </Stack>
                )}
              </>
            )}
          </>
        ) : (
          // Damage roll - group dice by type
          <>
            {(() => {
              // Group chains by die type
              const groupedByType: Record<DiceType, DiceChain[]> = {} as any;
              mainChains.forEach(chain => {
                if (!groupedByType[chain.dieType]) {
                  groupedByType[chain.dieType] = [];
                }
                groupedByType[chain.dieType].push(chain);
              });
              
              return Object.entries(groupedByType).map(([dieType, chains]) => (
                <Typography key={dieType} variant="body2" color="white">
                  {chains.length}{dieType.toLowerCase()}: {
                    chains.map((chain, chainIndex) => (
                      <span key={chain.dieId}>
                        {chain.rolls.map((value, index) => {
                          const isMax = value === getMaxValue(chain.dieType as DiceType);
                          const isLastRoll = index === chain.rolls.length - 1;
                          const showExplosion = isMax && !isLastRoll;
                          return (
                            <span key={index}>
                              {value}{showExplosion && "💥"}
                              {!isLastRoll && " + "}
                            </span>
                          );
                        }).reduce((prev: React.ReactNode, curr: React.ReactNode) => <>{prev}{curr}</>, <></>)}
                        {chainIndex < chains.length - 1 && " + "}
                      </span>
                    ))
                  }
                </Typography>
              ));
            })()}
            {/* Show modifier if non-zero */}
            {modifier !== undefined && modifier !== 0 && (
              <Typography variant="body2" color="white">
                Modifier: {modifier > 0 ? '+' : ''}{modifier}
              </Typography>
            )}
            {/* Show total for damage rolls */}
            {mainChains.length > 0 && (
              <Typography variant="body2" color="white" sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', pt: 0.5, mt: 0.5 }}>
                Total: {mainTotal + (modifier || 0)}
              </Typography>
            )}
          </>
        )}
    </Stack>
  );
}