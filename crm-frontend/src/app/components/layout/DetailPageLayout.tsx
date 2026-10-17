"use client";

import React from "react";

import { Box } from "@mui/material";

type DetailsPageLayoutProps = {
  leftSidebar: React.ReactNode;
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
};

export default function DetailsPageLayout({
  leftSidebar,
  children,
  rightSidebar,
}: DetailsPageLayoutProps) {
  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        minHeight: "calc(100vh - 86px)",

        display: "grid",

        gridTemplateColumns: "328px minmax(625px, 1fr) 328px",

        bgcolor: "#F8FAFC",

        overflow: "hidden",

        p: 0,
        m: 0,
      }}
    >
      {/* =================================================
          LEFT SIDEBAR
      ================================================= */}

      <Box
        sx={{
          width: "328px",
          minWidth: "328px",

          height: "100%",

          borderRight: "1px solid",
          borderColor: "divider",

          bgcolor: "background.paper",

          overflowY: "auto",

          p: 0,
          m: 0,
        }}
      >
        {leftSidebar}
      </Box>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <Box
        sx={{
          minWidth: 0,
          width: "100%",
          height: "100%",

          bgcolor: "background.paper",

          overflowY: "auto",

          p: 0,
          m: 0,
        }}
      >
        {children}
      </Box>

      {/* =================================================
          RIGHT SIDEBAR
      ================================================= */}

      <Box
        sx={{
          width: "328px",
          minWidth: "328px",

          height: "100%",

          borderLeft: "1px solid",
          borderColor: "divider",

          bgcolor: "background.paper",

          overflowY: "auto",

          p: 0,
          m: 0,
        }}
      >
        {rightSidebar}
      </Box>
    </Box>
  );
}
