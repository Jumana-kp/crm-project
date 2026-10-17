"use client";

import { useState } from "react";

import { Box, IconButton, InputBase } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400"],
});

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}

export default function SearchBar({
  value,
  placeholder = "Search phone, name, email",
  onChange,
  fullWidth = false,
}: SearchBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchInput = (
    <InputBase
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{
        flex: 1,

        "& .MuiInputBase-input": {
          fontFamily: lexend.style.fontFamily,

          fontSize: "13px",

          color: "text.primary",

          pr: 2,

          "&::placeholder": {
            color: "text.secondary",
            opacity: 1,
          },
        },
      }}
    />
  );

  return (
    <>
      {/* Desktop + Tablet */}

      <Box
        sx={{
          display: {
            xs: "none",
            sm: "flex",
          },

          width: fullWidth
            ? "100%"
            : {
                sm: 320,
                md: 380,
                lg: 416,
              },

          maxWidth: 416,

          height: 49,

          alignItems: "center",

          bgcolor: "grey.100",

          border: 1,

          borderColor: "divider",

          borderRadius: 0.5,

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: 50,

            display: "flex",

            justifyContent: "center",

            alignItems: "center",
          }}
        >
          <SearchIcon
            sx={{
              fontSize: 20,
              color: "grey.500",
            }}
          />
        </Box>

        {searchInput}
      </Box>

      {/* Mobile */}

      <Box
        sx={{
          display: {
            xs: "flex",
            sm: "none",
          },
        }}
      >
        {mobileOpen ? (
          <Box
            sx={{
              height: 40,

              display: "flex",

              alignItems: "center",

              width: "160px",

              bgcolor: "grey.100",

              border: 1,

              borderColor: "divider",

              borderRadius: 1,
            }}
          >
            {searchInput}

            <IconButton
              size="small"
              onClick={() => {
                setMobileOpen(false);
                onChange("");
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              width: 40,
              height: 40,

              border: "1px solid",

              borderColor: "divider",

              borderRadius: 1,
            }}
          >
            <SearchIcon
              sx={{
                fontSize: 20,
                color: "grey.500",
              }}
            />
          </IconButton>
        )}
      </Box>
    </>
  );
}
