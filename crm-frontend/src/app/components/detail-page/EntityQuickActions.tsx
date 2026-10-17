"use client";

import { Box, Typography } from "@mui/material";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
}

interface EntityQuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: string) => void;
}

export default function EntityQuickActions({
  actions,
  onActionClick,
}: EntityQuickActionsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        mb: 2,
        width: "100%",
      }}
    >
      {actions.map((item) => (
        <Box
          key={item.label}
          onClick={() => onActionClick(item.label)}
          sx={{
            flex: 1,
            height: 62,

            border: "1px solid",
            borderColor: "#EAECF0",

            borderRadius: "10px",

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            gap: 0.5,

            cursor: "pointer",

            transition: "all 0.2s ease",

            "&:hover": {
              backgroundColor: "#F9FAFB",
              borderColor: "#5B4DDE",
            },
          }}
        >
          <Box
            sx={{
              color: "#5B4DDE",
              display: "flex",
              alignItems: "center",
            }}
          >
            {item.icon}
          </Box>

          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              color: "#475467",
              lineHeight: "16px",
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
