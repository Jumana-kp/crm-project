"use client";

import React from "react";
import { Box, Paper } from "@mui/material";

type ListPageLayoutProps = {
  header: React.ReactNode;
  toolbar: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
};

export default function ListPageLayout({
  header,
  toolbar,
  filters,
  children,
}: ListPageLayoutProps) {
  return (
    <Box
      sx={{
        width: "100%",
        px: {
          xs: 2,
          md: 3,
        },
        py: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: "16px",
          bgcolor: "#fff",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* ---------------- Header ---------------- */}
        <Box
          sx={{
            px: {
              xs: 2,
              md: "33px",
            },
            py: 2,
          }}
        >
          {header}
        </Box>
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        />

        {/* ---------------- Search + Pagination ---------------- */}
<Box
  sx={{
    px: {
      xs: 2,
      md: 3,
    },

    py: 2,

    width: "100%",
  }}
>
  {toolbar}
</Box>
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        />

        {/* ---------------- Filters ---------------- */}
        {filters && (
          <Box
            sx={{
              mt: 2,
              mb: 2,
              ml: {
                xs: 1,
                md: 2,
              },
            }}
          >
            {filters}
          </Box>
        )}
        {/* ---------------- Table ---------------- */}
        <Box
          sx={{
            px: 2,
            pb: 2,
            width: "100%",
            overflowX: "auto",
          }}
        >
          {children}
        </Box>
      </Paper>
    </Box>
  );
}
