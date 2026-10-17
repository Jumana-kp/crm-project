"use client";

import { Button } from "@mui/material";

// =====================================================
// TYPES
// =====================================================

type StatusChipProps = {
  status: string;
};

// =====================================================
// STATUS COLORS
// Same colors used in DashboardService
// =====================================================

const STATUS_STYLES: Record<
  string,
  {
    bgcolor: string;
    color: string;
  }
> = {
  // ===================================================
  // LEAD STATUSES
  // ===================================================

  new: {
    bgcolor: "#EAF7EC",
    color: "#2196F3",
  },

  contacted: {
    bgcolor: "#E3F2FD",
    color: "#2196F3",
  },

  qualified: {
    bgcolor: "#E0F7FA",
    color: "#26C6DA",
  },

  proposal_sent: {
    bgcolor: "#FFF8E1",
    color: "#FBC02D",
  },

  negotiation: {
    bgcolor: "#E8EAF6",
    color: "#1976D2",
  },

  converted: {
    bgcolor: "#E8F5E9",
    color: "#16C784",
  },

  lost: {
    bgcolor: "#FFEBEE",
    color: "#EF5350",
  },

  // ===================================================
  // DEAL STATUSES
  // ===================================================

  open: {
    bgcolor: "#EAF7EC",
    color: "#2196F3",
  },

  in_progress: {
    bgcolor: "#FFF4E5",
    color: "#FBC02D",
  },

  closed: {
    bgcolor: "#F3F4F6",
    color: "#6B7280",
  },

  closed_won: {
    bgcolor: "#E8F5E9",
    color: "#16C784",
  },

  closed_lost: {
    bgcolor: "#FFEBEE",
    color: "#EF5350",
  },
};

// =====================================================
// STATUS LABELS
// =====================================================

const STATUS_LABELS: Record<string, string> = {
  // Leads
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  converted: "Converted",
  lost: "Lost",

  // Deals
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

// =====================================================
// COMPONENT
// =====================================================

export default function StatusChip({ status }: StatusChipProps) {
  // ---------------------------------------------------
  // Normalize backend status
  // ---------------------------------------------------

  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  // ---------------------------------------------------
  // Get color
  // ---------------------------------------------------

  const style = STATUS_STYLES[normalizedStatus] || {
    bgcolor: "#F3F4F6",
    color: "#6B7280",
  };

  // ---------------------------------------------------
  // Get display label
  // ---------------------------------------------------

  const label = STATUS_LABELS[normalizedStatus] || status || "Unknown";

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------

  return (
    <Button
      disableRipple
      sx={{
        minWidth: 80,
        height: 32,

        px: 1.5,
        py: 1,

        borderRadius: 1,

        bgcolor: style.bgcolor,
        color: style.color,

        typography: "button",

        textTransform: "none",

        fontSize: 13,
        fontWeight: 500,

        boxShadow: "none",

        "&:hover": {
          bgcolor: style.bgcolor,
          boxShadow: "none",
        },

        "&:focus": {
          bgcolor: style.bgcolor,
        },
      }}
    >
      {label}
    </Button>
  );
}
