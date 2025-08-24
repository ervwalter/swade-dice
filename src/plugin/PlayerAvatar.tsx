import { Player } from "@owlbear-rodeo/sdk";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { usePlayerDice } from "./usePlayerDice";
import { useRemotePlayerResults } from "../hooks/useRemotePlayerResults";

export function PlayerAvatar({
  player,
  onSelect,
}: {
  player: Player;
  onSelect: () => void;
}) {
  const { 
    finishedRolling,
    explosionResults,
    rollValues,
    dieInfo,
    controlSettings
  } = usePlayerDice(player);
  
  const { finalResult, isTraitTest, success } = useRemotePlayerResults(
    explosionResults,
    rollValues,
    dieInfo,
    controlSettings,
    finishedRolling
  );

  const theme = useTheme();

  // Create badge content with icon for trait tests
  const badgeContent = finishedRolling ? (
    isTraitTest ? (
      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        {finalResult}
        {success ? (
          <CheckIcon sx={{ fontSize: "12px", color: "#4caf50" }} />
        ) : (
          <CloseIcon sx={{ fontSize: "12px", color: "#f44336" }} />
        )}
      </Box>
    ) : (
      finalResult
    )
  ) : null;

  return (
    <Stack alignItems="center">
      <Badge
        badgeContent={badgeContent}
        showZero
        overlap="circular"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        sx={{
          ".MuiBadge-badge": {
            bgcolor: "background.paper",
            minWidth: isTraitTest && finishedRolling ? "auto" : undefined,
            paddingX: isTraitTest && finishedRolling ? "4px" : undefined,
          },
          pointerEvents: "none",
        }}
        max={999}
      >
        <IconButton
          sx={{ borderRadius: "20px", p: 0, pointerEvents: "all" }}
          onClick={() => onSelect()}
        >
          <Avatar
            sx={{
              bgcolor: player.color,
              opacity: "0.5",
              boxShadow: theme.shadows[5],
              width: 32,
              height: 32,
            }}
          >
            {player.name[0]}
          </Avatar>
        </IconButton>
      </Badge>
      <Typography
        variant="caption"
        color="rgba(255, 255, 255, 0.7)"
        textAlign="center"
        width="40px"
        noWrap
      >
        {player.name}
      </Typography>
    </Stack>
  );
}
