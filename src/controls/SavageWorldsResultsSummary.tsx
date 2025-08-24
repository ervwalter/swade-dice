import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";

import HiddenIcon from "@mui/icons-material/VisibilityOffRounded";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { SavageWorldsResultsData } from "../types/SavageWorldsResultsData";

interface SavageWorldsResultsSummaryProps {
  results: SavageWorldsResultsData;
  hidden?: boolean;
  hidePrefix?: boolean;
  variant?: "h6" | "subtitle1" | "body1" | "body2";
}

export function SavageWorldsResultsSummary({ 
  results,
  hidden,
  hidePrefix = false,
  variant = "h6"
}: SavageWorldsResultsSummaryProps) {
  const {
    isTraitTest,
    finalResult,
    isComplete,
    success,
    raises,
  } = results;

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {hidden && (
        <Tooltip title="Hidden Roll">
          <HiddenIcon htmlColor="white" />
        </Tooltip>
      )}
      <Typography variant={variant} color="white">
        {!hidePrefix && (
          <span style={{ fontWeight: "normal", opacity: 0.8 }}>
            {isTraitTest ? "Result: " : "Total: "}
          </span>
        )}
        <span style={{ fontWeight: "bold" }}>
          {finalResult}
        </span>
      </Typography>
      {isTraitTest && isComplete && (
        <>
          {success ? (
            <CheckIcon sx={{ fontSize: "20px", color: "#4caf50" }} />
          ) : (
            <CloseIcon sx={{ fontSize: "20px", color: "#f44336" }} />
          )}
          {raises > 0 && (
            <span style={{ fontSize: "18px", color: "#ffc107", fontWeight: "bold" }}>
              {"↑".repeat(Math.min(raises, 3))}
            </span>
          )}
        </>
      )}
    </Stack>
  );
}