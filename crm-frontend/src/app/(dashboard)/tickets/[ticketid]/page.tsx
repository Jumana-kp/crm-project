"use client";

import { useEffect, useMemo, useState } from "react";

import { formatCreatedDate } from "@/utils/formatDate";

import { Alert, Box, CircularProgress } from "@mui/material";

import { useParams, usePathname } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchTicketById, updateTicket } from "@/store/slices/ticketSlice";

import type { Ticket } from "@/store/slices/ticketSlice";

import DetailsPageLayout from "../../../components/layout/DetailPageLayout";

import DetailLayout from "@/app/components/detail-page/DetailLayout";

import RightSidebar from "@/app/components/detail-page/RightSidebar";

import ActivityTimeLine from "@/app/components/detail-page/ActivityTimeLine";

// =====================================================
// PAGE
// =====================================================

export default function TicketDetailPage() {
  const params = useParams();
  const pathname = usePathname();

  const dispatch = useAppDispatch();

  // ===================================================
  // CALL STATE
  // ===================================================

  const [callOpen, setCallOpen] = useState(false);

  // ===================================================
  // GET TICKET ID
  // ===================================================

  const ticketId = useMemo<number | null>(() => {
    const paramId = params?.id;

    // -------------------------------------------------
    // /tickets/[id]
    // -------------------------------------------------

    if (Array.isArray(paramId)) {
      const parsed = Number(paramId[0]);

      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    if (typeof paramId === "string") {
      const parsed = Number(paramId);

      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    // -------------------------------------------------
    // FALLBACK: READ ID FROM PATHNAME
    // -------------------------------------------------

    if (pathname) {
      const parts = pathname.split("/").filter(Boolean);

      const ticketsIndex = parts.findIndex(
        (part) => part.toLowerCase() === "tickets",
      );

      if (ticketsIndex !== -1 && parts[ticketsIndex + 1]) {
        const parsed = Number(parts[ticketsIndex + 1]);

        if (Number.isInteger(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }

    return null;
  }, [params, pathname]);

  // ===================================================
  // REDUX
  // ===================================================

  const { selectedTicket, loading, error, saving, saveError } = useAppSelector(
    (state) => state.tickets,
  );

  // ===================================================
  // FETCH TICKET
  // ===================================================

  useEffect(() => {
    if (ticketId === null || !Number.isInteger(ticketId) || ticketId <= 0) {
      return;
    }

    dispatch(fetchTicketById(ticketId));
  }, [ticketId, dispatch]);

  // ===================================================
  // INVALID ID
  // ===================================================

  if (ticketId === null) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F5F6FA",
          p: 4,
        }}
      >
        <Alert severity="error">Ticket ID is missing from URL.</Alert>
      </Box>
    );
  }

  // ===================================================
  // LOADING
  // ===================================================

  if (loading && !selectedTicket) {
    return <LoadingScreen />;
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error && !selectedTicket) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F5F6FA",
          p: 4,
        }}
      >
        <Alert severity="error">{getErrorMessage(error)}</Alert>
      </Box>
    );
  }

  // ===================================================
  // NO TICKET
  // ===================================================

  if (!selectedTicket) {
    return <LoadingScreen />;
  }

  // ===================================================
  // SAVE ABOUT
  // ===================================================

  const handleSaveAbout = async (
    fields: {
      key: string;
      value: string;
    }[],
  ) => {
    if (!selectedTicket) {
      return;
    }

    const updateData: Record<string, string | number | null> = {};

    fields.forEach((field) => {
      // =============================================
      // DESCRIPTION
      // =============================================

      if (field.key === "description") {
        updateData.description = field.value;

        return;
      }

      // =============================================
      // PRIORITY
      // =============================================

      if (field.key === "priority") {
        updateData.priority = field.value;

        return;
      }

      // =============================================
      // DISPLAY ONLY
      // TICKET OWNER
      // =============================================

      if (field.key === "ticket_owners") {
        return;
      }

      // =============================================
      // DISPLAY ONLY
      // CREATED DATE
      // =============================================

      if (field.key === "created_at") {
        return;
      }
    });

    // =============================================
    // NOTHING TO UPDATE
    // =============================================

    if (Object.keys(updateData).length === 0) {
      return;
    }

    // =============================================
    // UPDATE TICKET
    // =============================================

    await dispatch(
      updateTicket({
        id: selectedTicket.id,
        data: updateData,
      }),
    ).unwrap();

    // =============================================
    // FETCH LATEST TICKET
    // =============================================

    await dispatch(fetchTicketById(selectedTicket.id)).unwrap();
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",

        bgcolor: "#F5F6FA",

        p: {
          xs: 1.5,
          sm: 2,
          md: 2.5,
        },
      }}
    >
      <DetailsPageLayout
        // =============================================
        // LEFT SIDEBAR
        // =============================================

        leftSidebar={
          <DetailLayout
            entity={buildTicketEntity(selectedTicket)}
            allowedAttendeeIds={
              selectedTicket.ticket_owners?.map((owner: any) =>
                Number(owner.id),
              ) ?? []
            }
            onSaveAbout={handleSaveAbout}
            onStatusChange={async (status) => {
              if (!selectedTicket) {
                return;
              }

              await dispatch(
                updateTicket({
                  id: selectedTicket.id,
                  data: {
                    ticket_status: status,
                  },
                }),
              ).unwrap();

              // Get the latest ticket from backend
              await dispatch(fetchTicketById(selectedTicket.id)).unwrap();
            }}
            saving={saving}
            saveError={saveError}
            callOpen={callOpen}
            onCallOpenChange={setCallOpen}
          />
        }
        // =============================================
        // ACTIVITY TIMELINE
        // =============================================

        children={
          <Box
            sx={{
              width: "100%",
              minWidth: 0,
              minHeight: 700,
              bgcolor: "background.paper",
            }}
          >
            <ActivityTimeLine
              module="ticket"
              moduleId={ticketId ?? 0}
              allowedAttendeeIds={
                selectedTicket.ticket_owners?.map((owner: any) =>
                  Number(owner.id),
                ) ?? []
              }
              onMakeCall={() => setCallOpen(true)}
            />
          </Box>
        }
        // =============================================
        // RIGHT SIDEBAR
        // =============================================

        rightSidebar={
          <Box sx={{ p: 2 }}>
            <RightSidebar
              title="AI Ticket Summary"
              summary="..."
              entityType="ticket"
              entityId={ticketId}
            />
          </Box>
        }
      />
    </Box>
  );
}

// =====================================================
// BUILD TICKET ENTITY
// =====================================================

function buildTicketEntity(ticket: Ticket) {
  const ownerNames = getTicketOwnerNames(ticket);

  // ===================================================
  // GET PHONE FROM:
  // Ticket → Associated Deal → Lead
  // ===================================================

  const ticketPhone =
    ticket.associated_deal?.lead?.country_code &&
    ticket.associated_deal?.lead?.phone_number
      ? `${ticket.associated_deal.lead.country_code}${ticket.associated_deal.lead.phone_number}`
      : ticket.associated_deal?.lead?.phone_number || "";

  return {
    id: ticket.id,

    // ===============================================
    // HEADER
    // ===============================================

    header: {
      name: ticket.ticket_name || "Unknown Ticket",

      subtitle: ticket.ticket_status || "",
    },

    // ===============================================
    // MAIN INFO
    // ===============================================

    name: ticket.ticket_name || "Unknown Ticket",

    subtitle: ticket.ticket_status || "",

    // ===============================================
    // PHONE
    // Used by DetailLayout / LogCallForm
    // ===============================================

    phone: ticketPhone,

    // ===============================================
    // ABOUT FIELDS
    // ===============================================

    fields: [
      // ---------------------------------------------
      // DESCRIPTION
      // EDITABLE
      // ---------------------------------------------

      {
        key: "description",

        label: "Description",

        value: ticket.description || "",
      },

      // ---------------------------------------------
      // TICKET OWNER
      // DISPLAY ONLY
      // ---------------------------------------------

      {
        key: "ticket_owners",

        label: "Ticket Owner",

        value: ownerNames,
      },

      // ---------------------------------------------
      // PRIORITY
      // EDITABLE
      // ---------------------------------------------

      {
        key: "priority",

        label: "Priority",

        value: ticket.priority || "",
      },

      // ---------------------------------------------
      // CREATED DATE
      // DISPLAY ONLY
      //
      // DATE + TIME + GMT
      // ---------------------------------------------

      {
        key: "created_at",

        label: "Created Date",

        value: ticket.created_at ? formatCreatedDate(ticket.created_at) : "-",
      },
    ],
  };
}

// =====================================================
// TICKET OWNER NAMES
// =====================================================

function getTicketOwnerNames(ticket: Ticket): string {
  if (
    !Array.isArray(ticket.ticket_owners) ||
    ticket.ticket_owners.length === 0
  ) {
    return "-";
  }

  return ticket.ticket_owners
    .map((owner) => `${owner.first_name || ""} ${owner.last_name || ""}`.trim())
    .filter(Boolean)
    .join(", ");
}

// =====================================================
// LOADING
// =====================================================

function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        bgcolor: "#F5F6FA",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

// =====================================================
// ERROR MESSAGE
// =====================================================

function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  if (error?.detail && typeof error.detail === "string") {
    return error.detail;
  }

  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

  return "Failed to load ticket.";
}
