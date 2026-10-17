"use client";

import { useMemo } from "react";

import { Box, Button, IconButton, Typography } from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function PaginationBar({
  page,
  totalPages,
  onChange,
}: PaginationBarProps) {
  // Page numbers

  const pages = useMemo(() => {
    const items: (number | "...")[] = [];

    if (totalPages <= 0) {
      return [1];
    }

    // Show all pages when there are 5 or fewer

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }

      return items;
    }

    // First pages

    if (page <= 3) {
      items.push(1, 2, 3, "...", totalPages - 1, totalPages);

      return items;
    }

    // Last pages

    if (page >= totalPages - 2) {
      items.push(1, "...", totalPages - 2, totalPages - 1, totalPages);

      return items;
    }

    // Middle pages

    items.push(1, "...", page - 1, page, page + 1, "...", totalPages);

    return items;
  }, [page, totalPages]);

  const safeTotalPages = Math.max(1, totalPages);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: {
          xs: 0.5,
          sm: 1,
        },
        width: "100%",
      }}
    >
      {/* Previous */}

      <Button
        startIcon={<ChevronLeftIcon />}
        disabled={page <= 1}
        onClick={() => {
          if (page > 1) {
            onChange(page - 1);
          }
        }}
        sx={{
          height: 40,
          minWidth: {
            xs: 80,
            sm: 112,
          },
          px: 1,
          textTransform: "none",
          fontSize: 16,
          fontWeight: 400,
          color: page <= 1 ? "grey.400" : "primary.main",

          "& .MuiButton-startIcon": {
            marginRight: 0.5,
          },

          "&:hover": {
            backgroundColor: "transparent",
          },

          "&.Mui-disabled": {
            color: "grey.400",
          },
        }}
      >
        Previous
      </Button>

      {/* Page numbers */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: {
            xs: 0.25,
            sm: 0.75,
          },
        }}
      >
        {pages.map((item, index) => {
          if (item === "...") {
            return (
              <Box
                key={`ellipsis-${index}`}
                sx={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "primary.main",
                    lineHeight: 1,
                  }}
                >
                  ...
                </Typography>
              </Box>
            );
          }

          const active = item === page;

          return (
            <IconButton
              key={`page-${item}-${index}`}
              onClick={() => onChange(item)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "8px",
                padding: 0,
                fontSize: 16,
                fontWeight: 500,

                color: active ? "primary.contrastText" : "text.primary",

                backgroundColor: active ? "primary.main" : "transparent",

                "&:hover": {
                  backgroundColor: active ? "primary.main" : "grey.100",
                },
              }}
            >
              {item}
            </IconButton>
          );
        })}
      </Box>

      {/* Next */}

      <Button
        endIcon={<ChevronRightIcon />}
        disabled={page >= safeTotalPages}
        onClick={() => {
          if (page < safeTotalPages) {
            onChange(page + 1);
          }
        }}
        sx={{
          height: 40,
          minWidth: {
            xs: 65,
            sm: 82,
          },
          px: 1,
          textTransform: "none",
          fontSize: 16,
          fontWeight: 400,

          color: page >= safeTotalPages ? "grey.400" : "primary.main",

          "& .MuiButton-endIcon": {
            marginLeft: 0.5,
          },

          "&:hover": {
            backgroundColor: "transparent",
          },

          "&.Mui-disabled": {
            color: "grey.400",
          },
        }}
      >
        Next
      </Button>
    </Box>
  );
}
