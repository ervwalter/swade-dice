import { RollBroadcast } from "./DiceRollSync";
import { SavageWorldsResultsSummary } from "../controls/SavageWorldsResultsSummary";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

export function RollNotification({ roll }: { roll: RollBroadcast }) {
  const { player, result } = roll;
  const theme = useTheme();
  
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Paper 
        elevation={8}
        sx={{ 
          py: 1.5,
          px: 4,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          maxWidth: 600,
        }}
      >
        <Typography variant="body2" component="span">
          {player.name}:
        </Typography>
        <SavageWorldsResultsSummary 
          result={result}
          hidePrefix={true}
          variant="body2"
          singleLine={true}
          showDicePrefix={true}
          showModeIcon={true}
          textColor={theme.palette.mode === "dark" ? "white" : "black"}
          isDarkBackground={theme.palette.mode === "dark"}
        />
      </Paper>
    </div>
  );
}