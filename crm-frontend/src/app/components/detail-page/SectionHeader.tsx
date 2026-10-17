"use client";

import { Box, Typography, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function SectionHeader({
  title,
  open,
  setOpen,
  isEditing,
  onEditToggle,
  EditIcon,
  SaveIcon,
}: any) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        // mt: 10,
         mb: 1,
      }}
    >
      {/* LEFT */}
      <Box
        sx={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "6px", }}
        onClick={() => setOpen(!open)}
      >
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 20,
            color: "#667085",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />

        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

      {/* RIGHT */}
      <IconButton onClick={onEditToggle} sx={{ color: "#5B4DDE" }}>
        {isEditing ? SaveIcon : EditIcon}
      </IconButton>
    </Box>
  );
}