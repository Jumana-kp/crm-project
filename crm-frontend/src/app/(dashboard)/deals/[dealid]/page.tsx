"use client";

import { useEffect, useMemo, useState } from "react";

import { formatCreatedDate } from "@/utils/formatDate";

import { Alert, Box, CircularProgress } from "@mui/material";

import { useParams, usePathname } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchDealById, updateDeal } from "@/store/slices/dealSlice";

import type { Deal } from "@/store/slices/dealSlice";

import DetailsPageLayout from "../../../components/layout/DetailPageLayout";

import DetailLayout from "@/app/components/detail-page/DetailLayout";

import RightSidebar from "@/app/components/detail-page/RightSidebar";

import ActivityTimeLine from "@/app/components/detail-page/ActivityTimeLine";

/* =====================================================
   DEAL STAGE OPTIONS
===================================================== */

const DEAL_STAGE_OPTIONS = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

/* =====================================================
   DEAL DETAIL PAGE
===================================================== */

export default function DealDetailPage() {
  const params = useParams();

  const pathname = usePathname();

  const dispatch = useAppDispatch();

  /* =================================================
     CALL FORM STATE
  ================================================= */

  const [callOpen, setCallOpen] = useState(false);

  /* =================================================
     GET DEAL ID
  ================================================= */

  const dealId = useMemo<number | null>(() => {
    const paramId = params?.dealid;

    /* ---------------------------------------------------
       PARAMETER ARRAY
    --------------------------------------------------- */

    if (Array.isArray(paramId)) {
      const parsed = Number(paramId[0]);

      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    /* ---------------------------------------------------
       PARAMETER STRING
    --------------------------------------------------- */

    if (typeof paramId === "string") {
      const parsed = Number(paramId);

      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    /* ---------------------------------------------------
       FALLBACK: READ ID FROM PATHNAME
    --------------------------------------------------- */

    if (pathname) {
      const parts = pathname.split("/").filter(Boolean);

      const dealsIndex = parts.findIndex(
        (part) => part.toLowerCase() === "deals",
      );

      if (dealsIndex !== -1 && parts[dealsIndex + 1]) {
        const parsed = Number(parts[dealsIndex + 1]);

        if (Number.isInteger(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }

    return null;
  }, [params, pathname]);

  /* =====================================================
     REDUX
  ===================================================== */

  const { selectedDeal, detailLoading, detailError, saving, saveError } =
    useAppSelector((state) => state.deals);

  /* =====================================================
     FETCH DEAL
  ===================================================== */

  useEffect(() => {
    if (dealId === null || !Number.isInteger(dealId) || dealId <= 0) {
      return;
    }

    dispatch(fetchDealById(dealId));
  }, [dealId, dispatch]);

  /* =====================================================
     INSTANT LEAD UPDATE LISTENER
     
     When Lead phone/country is changed from the
     Lead Edit form, that form dispatches the
     "lead-updated" browser event.

     This Deal page listens for that event and
     refetches the Deal if the updated Lead is
     the Lead connected to this Deal.
  ===================================================== */

  useEffect(() => {
    const handleLeadUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ leadId: number }>;

      const updatedLeadId = customEvent.detail?.leadId;

      if (!updatedLeadId) {
        return;
      }

      /* ---------------------------------------------
         Make sure this Deal is connected to the
         Lead that was just updated.
      --------------------------------------------- */

      if (selectedDeal?.lead?.id !== updatedLeadId) {
        return;
      }

      /* ---------------------------------------------
         Fetch latest Deal.

         The backend serializer will return the
         latest Lead phone_number and country_code.
      --------------------------------------------- */

      if (dealId !== null) {
        dispatch(fetchDealById(dealId));
      }
    };

    window.addEventListener("lead-updated", handleLeadUpdated);

    return () => {
      window.removeEventListener("lead-updated", handleLeadUpdated);
    };
  }, [dispatch, dealId, selectedDeal?.lead?.id]);

  /* =====================================================
     INVALID ID
  ===================================================== */

  if (dealId === null) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F5F6FA",
          p: 4,
        }}
      >
        <Alert severity="error">Deal ID is missing from URL.</Alert>
      </Box>
    );
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (detailLoading && !selectedDeal) {
    return <LoadingScreen />;
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (detailError && !selectedDeal) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F5F6FA",
          p: 4,
        }}
      >
        <Alert severity="error">{getErrorMessage(detailError)}</Alert>
      </Box>
    );
  }

  /* =====================================================
     NO DEAL
  ===================================================== */

  if (!selectedDeal) {
    return <LoadingScreen />;
  }

  /* =====================================================
     SAVE ABOUT

     EDITABLE:
       - Priority

     DISPLAY ONLY:
       - Deal Owner
       - Lead
       - Created Date
  ===================================================== */

  const handleSaveAbout = async (
    fields: {
      key: string;
      value: string;
    }[],
  ) => {
    const updateData: Record<string, any> = {};

    fields.forEach((field) => {
      /* ---------------------------------------------
         ONLY PRIORITY CAN BE UPDATED FROM ABOUT
      --------------------------------------------- */

      if (field.key === "priority") {
        updateData.priority = field.value;

        return;
      }

      /* ---------------------------------------------
         DEAL OWNER

         NEVER PATCH THIS FIELD
      --------------------------------------------- */

      if (field.key === "owners") {
        return;
      }

      /* ---------------------------------------------
         LEAD

         DISPLAY ONLY
      --------------------------------------------- */

      if (field.key === "lead") {
        return;
      }

      /* ---------------------------------------------
         CREATED DATE

         DISPLAY ONLY
      --------------------------------------------- */

      if (field.key === "created_at") {
        return;
      }
    });

    /* ---------------------------------------------
       NOTHING TO UPDATE
    --------------------------------------------- */

    if (Object.keys(updateData).length === 0) {
      return;
    }

    /* ---------------------------------------------
       UPDATE DEAL
    --------------------------------------------- */

    await dispatch(
      updateDeal({
        id: selectedDeal.id,
        data: updateData,
      }),
    ).unwrap();

    /* ---------------------------------------------
       FETCH LATEST DEAL
    --------------------------------------------- */

    await dispatch(fetchDealById(selectedDeal.id)).unwrap();
  };

  /* =====================================================
     SAVE DEAL STAGE

     Stage is changed separately from About.
  ===================================================== */

  const handleStageChange = async (stage: string) => {
    const validStage = DEAL_STAGE_OPTIONS.some(
      (option) => option.value === stage,
    );

    if (!validStage) {
      return;
    }

    try {
      await dispatch(
        updateDeal({
          id: selectedDeal.id,
          data: {
            stage,
          },
        }),
      ).unwrap();

      await dispatch(fetchDealById(selectedDeal.id)).unwrap();
    } catch (error) {
      console.error("Failed to update deal stage:", error);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

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
        /* =================================================
           LEFT SIDEBAR
        ================================================= */

        leftSidebar={
          <DetailLayout
            entity={buildDealEntity(selectedDeal)}
            allowedAttendeeIds={
              selectedDeal.owners?.map((owner: any) => Number(owner.id)) ?? []
            }
            onSaveAbout={handleSaveAbout}
            onStageChange={handleStageChange}
            saving={saving}
            saveError={saveError}
            callOpen={callOpen}
            onCallOpenChange={setCallOpen}
          />
        }
        /* =================================================
           ACTIVITY TIMELINE
        ================================================= */

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
              module="deal"
              moduleId={dealId}
              allowedAttendeeIds={
                selectedDeal.owners?.map((owner: any) => Number(owner.id)) ?? []
              }
              onMakeCall={() => setCallOpen(true)}
            />
          </Box>
        }
        /* =================================================
           RIGHT SIDEBAR
        ================================================= */

        rightSidebar={
          <Box
            sx={{
              p: 2,
            }}
          >
            <RightSidebar
              title="AI Deal Summary"
              summary={`Deal ${selectedDeal.deal_name} is currently in ${
                selectedDeal.stage || "unknown"
              } stage.`}
              entityType="lead"
              entityId={dealId}
            />
          </Box>
        }
      />
    </Box>
  );
}

/* =====================================================
   BUILD DEAL ENTITY
===================================================== */

function buildDealEntity(deal: Deal) {
  /* =================================================
     LEAD NAME
  ================================================= */

  const leadName = deal.lead
    ? `${deal.lead.first_name || ""} ${deal.lead.last_name || ""}`.trim() ||
      deal.lead.email ||
      "-"
    : "-";

  /* =================================================
     DEAL OWNER

     DISPLAY ONLY
  ================================================= */

  const ownerNames = getDealOwnerNames(deal);

  /* =================================================
     DEAL PHONE

     The Deal uses the phone number of its linked Lead.

     Example:

       country_code = +971
       phone_number = 547422454

     Result:

       +971547422454
  ================================================= */

  const dealPhone =
    deal.lead?.country_code && deal.lead?.phone_number
      ? `${deal.lead.country_code}${deal.lead.phone_number}`
      : deal.lead?.phone_number || "";

  /* =================================================
     ENTITY
  ================================================= */

  return {
    id: deal.id,

    /* =================================================
       HEADER
    ================================================= */

    header: {
      name: deal.deal_name || "Unknown",

      amount:
        deal.amount !== null && deal.amount !== undefined
          ? String(deal.amount)
          : "",

      subtitle: deal.stage || "",

      email: deal.lead?.email || "",

      secondLine: leadName,
    },

    /* =================================================
       BASIC INFO
    ================================================= */

    name: deal.deal_name || "Unknown",

    subtitle: deal.stage || "",

    email: deal.lead?.email || "",

    /* =================================================
       PHONE USED BY CALL FORM
    ================================================= */

    phone: dealPhone,

    /* =================================================
       ABOUT FIELDS
    ================================================= */

    fields: [
      /* ---------------------------------------------
         DEAL OWNER
      --------------------------------------------- */

      {
        key: "owners",

        label: "Deal Owner",

        value: ownerNames,
      },

      /* ---------------------------------------------
         PRIORITY
      --------------------------------------------- */

      {
        key: "priority",

        label: "Priority",

        value: deal.priority || "",
      },

      /* ---------------------------------------------
         CREATED DATE
      --------------------------------------------- */

      {
        key: "created_at",

        label: "Created Date",

        value: deal.created_at ? formatCreatedDate(deal.created_at) : "-",
      },

      /* ---------------------------------------------
         LEAD NAME
      --------------------------------------------- */

      {
        key: "lead",

        label: "Lead Name",

        value: leadName,
      },
    ],
  };
}

/* =====================================================
   DEAL OWNER NAMES
===================================================== */

function getDealOwnerNames(deal: Deal): string {
  if (!Array.isArray(deal.owners) || deal.owners.length === 0) {
    return "-";
  }

  return deal.owners
    .map(
      (owner) =>
        `${owner.first_name || ""} ${owner.last_name || ""}`.trim() ||
        owner.email ||
        "",
    )
    .filter(Boolean)
    .join(", ");
}

/* =====================================================
   LOADING SCREEN
===================================================== */

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

/* =====================================================
   ERROR MESSAGE
===================================================== */

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

  return "Failed to load deal.";
}
