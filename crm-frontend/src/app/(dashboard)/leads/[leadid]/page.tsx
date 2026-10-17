"use client";

import { formatCreatedDate } from "@/utils/formatDate";

import { useEffect, useMemo, useState } from "react";

import { Alert, Box, Button, CircularProgress } from "@mui/material";

import { useParams, useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchLeadById, updateLead } from "@/store/slices/leadSlice";

import DetailsPageLayout from "../../../components/layout/DetailPageLayout";

import DetailLayout from "@/app/components/detail-page/DetailLayout";

import RightSidebar from "@/app/components/detail-page/RightSidebar";

import ActivityTimeLine from "@/app/components/detail-page/ActivityTimeLine";

/* =========================================================
   COMPONENT
========================================================= */

export default function LeadDetailPage() {
  const params = useParams();

  const router = useRouter();

  const dispatch = useAppDispatch();

  /* =====================================================
     CALL STATE
  ===================================================== */

  const [callOpen, setCallOpen] = useState(false);

  /* =====================================================
     GET LEAD ID
  ===================================================== */

  const leadId = useMemo<number | null>(() => {
    const paramId = params?.leadid;

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
       PARAMETER ARRAY
    --------------------------------------------------- */

    if (Array.isArray(paramId)) {
      const parsed = Number(paramId[0]);

      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }, [params]);

  /* =====================================================
     REDUX
  ===================================================== */

  const { selectedLead, detailLoading, detailError, saving, saveError } =
    useAppSelector((state) => state.leads);

  /* =====================================================
     FETCH LEAD
  ===================================================== */

  useEffect(() => {
    if (leadId === null || leadId <= 0) {
      return;
    }

    dispatch(fetchLeadById(leadId));
  }, [leadId, dispatch]);

  /* =====================================================
     INVALID ID
  ===================================================== */

  if (leadId === null) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F5F6FA",
          p: 4,
        }}
      >
        <Alert severity="error">Lead ID is missing from URL.</Alert>
      </Box>
    );
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (detailLoading && !selectedLead) {
    return <LoadingScreen />;
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (detailError && !selectedLead) {
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
     NO LEAD
  ===================================================== */

  if (!selectedLead) {
    return <LoadingScreen />;
  }

  /* =====================================================
     SAVE ABOUT
  ===================================================== */

  const handleSaveAbout = async (
    fields: {
      key: string;
      value: string;
    }[],
  ) => {
    const updateData: Record<string, any> = {};

    fields.forEach((field) => {
      updateData[field.key] = field.value;
    });

    /* ---------------------------------------------------
       RELATION FIELDS
    --------------------------------------------------- */

    delete updateData["contact_owners"];

    delete updateData["company"];

    delete updateData["products"];

    /* ---------------------------------------------------
       CREATED DATE IS DISPLAY ONLY
    --------------------------------------------------- */

    delete updateData["created_at"];

    /* ---------------------------------------------------
       UPDATE LEAD
    --------------------------------------------------- */

    await dispatch(
      updateLead({
        id: selectedLead.id,
        data: updateData,
      }),
    ).unwrap();

    /* ---------------------------------------------------
       FETCH UPDATED LEAD
    --------------------------------------------------- */

    await dispatch(fetchLeadById(selectedLead.id)).unwrap();
  };

  /* =====================================================
     LEAD STATUS
  ===================================================== */

  const leadStatus = String(selectedLead.lead_status || "")
    .trim()
    .toLowerCase();

  /* =====================================================
     CONVERT ELIGIBILITY

     New       -> Disabled
     Contacted -> Disabled
     Qualified -> Enabled
     Converted -> Disabled
  ===================================================== */

  const canConvert = leadStatus === "qualified";

  /* =====================================================
     CONVERT
  ===================================================== */

  const handleConvert = () => {
    if (!canConvert || !selectedLead?.id) {
      return;
    }

    const id = selectedLead.id;

    router.push(`/deals?leadId=${id}&openCreate=true`);
  };

  /* =====================================================
     CONVERT BUTTON
  ===================================================== */

  const convertButton = (
    <Button
      variant="contained"
      disableElevation
      disabled={!canConvert}
      onClick={handleConvert}
      sx={{
        width: 147,
        minWidth: 147,
        height: 36,
        px: 2,
        borderRadius: "8px",
        textTransform: "none",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        bgcolor: "#5B4DDE",
        color: "#FFFFFF",
        boxShadow: "none",
        flexShrink: 0,

        "&:hover": {
          bgcolor: "#4B3FD0",
          boxShadow: "none",
        },

        "&:disabled": {
          bgcolor: "#E5E7EB",
          color: "#9CA3AF",
          opacity: 1,
        },
      }}
    >
      Convert
    </Button>
  );

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
          <Box
            sx={{
              width: "100%",
            }}
          >
            <DetailLayout
              entity={buildLeadEntity(selectedLead)}
              allowedAttendeeIds={
                selectedLead.contact_owners?.map((owner: any) =>
                  Number(owner.id),
                ) ?? []
              }
              onSaveAbout={handleSaveAbout}
              saving={saving}
              saveError={saveError}
              callOpen={callOpen}
              onCallOpenChange={setCallOpen}
            />
          </Box>
        }
        /* =================================================
           MAIN CONTENT
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
              module="lead"
              moduleId={selectedLead.id}
              activitiesAvailable={true}
              convertButton={convertButton}
              allowedAttendeeIds={
                selectedLead.contact_owners?.map((owner: any) =>
                  Number(owner.id),
                ) ?? []
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
              title="AI Lead Summary"
              summary={`Lead ${selectedLead.first_name || ""} ${
                selectedLead.last_name || ""
              } is currently ${selectedLead.lead_status || "unknown"}.`}
              entityType="lead"
              entityId={leadId}
            />
          </Box>
        }
      />
    </Box>
  );
}

/* =========================================================
   BUILD LEAD ENTITY
========================================================= */

function buildLeadEntity(lead: any) {
  const fullName = `${lead.first_name || ""} ${lead.last_name || ""}`.trim();

  return {
    id: lead.id,

    header: {
      name: fullName || "Unknown",

      subtitle: lead.job_title || "",

      email: lead.email || "",

      secondLine: lead.company?.company_name || "",
    },

    name: fullName || "Unknown",

    subtitle: lead.job_title || "",

    email: lead.email || "",

    /*
     * IMPORTANT:
     * Lead stores country_code and phone_number separately.
     *
     * Example:
     * country_code = +971
     * phone_number = 547422454
     *
     * DetailLayout / LogCallForm receives:
     * +971547422454
     */
    phone:
      lead.country_code && lead.phone_number
        ? `${lead.country_code}${lead.phone_number}`
        : lead.phone_number || "",

    avatar: getLeadAvatarText(lead.first_name, lead.last_name),

    fields: [
      /* -------------------------------------------------
         FIRST NAME
      ------------------------------------------------- */

      {
        key: "first_name",

        label: "First Name",

        value: lead.first_name || "",
      },

      /* -------------------------------------------------
         LAST NAME
      ------------------------------------------------- */

      {
        key: "last_name",

        label: "Last Name",

        value: lead.last_name || "",
      },

      /* -------------------------------------------------
         EMAIL
      ------------------------------------------------- */

      {
        key: "email",

        label: "Email",

        value: lead.email || "",
      },

      /* -------------------------------------------------
         PHONE NUMBER
      ------------------------------------------------- */

      {
        key: "phone_number",

        label: "Phone Number",

        value: lead.phone_number || "",
      },

      /* -------------------------------------------------
         COUNTRY CODE
      ------------------------------------------------- */

      {
        key: "country_code",

        label: "Country Code",

        value: lead.country_code || "",
      },

      /* -------------------------------------------------
         JOB TITLE
      ------------------------------------------------- */

      {
        key: "job_title",

        label: "Job Title",

        value: lead.job_title || "",
      },

      /* -------------------------------------------------
         LEAD STATUS
      ------------------------------------------------- */

      {
        key: "lead_status",

        label: "Lead Status",

        value: lead.lead_status || "",
      },

      /* -------------------------------------------------
         CITY
      ------------------------------------------------- */

      {
        key: "city",

        label: "City",

        value: lead.city || "",
      },

      /* -------------------------------------------------
         COMPANY
      ------------------------------------------------- */

      {
        key: "company",

        label: "Company",

        value: lead.company?.company_name || "-",
      },

      /* -------------------------------------------------
         CONTACT OWNER
      ------------------------------------------------- */

      {
        key: "contact_owners",

        label: "Contact Owner",

        value: getOwnerNames(lead),
      },

      /* -------------------------------------------------
         CREATED DATE
      ------------------------------------------------- */

      {
        key: "created_at",

        label: "Created Date",

        value: formatCreatedDate(lead.created_at),
      },
    ],
  };
}

/* =========================================================
   AVATAR
========================================================= */

function getLeadAvatarText(firstName: string, lastName: string) {
  const first = firstName?.trim()?.[0] || "";

  const last = lastName?.trim()?.[0] || "";

  return (first + last).toUpperCase() || "L";
}

/* =========================================================
   OWNER NAMES
========================================================= */

function getOwnerNames(lead: any) {
  if (!Array.isArray(lead.contact_owners) || lead.contact_owners.length === 0) {
    return "-";
  }

  return lead.contact_owners
    .map((owner: any) =>
      `${owner.first_name || ""} ${owner.last_name || ""}`.trim(),
    )
    .filter(Boolean)
    .join(", ");
}

/* =========================================================
   LOADING SCREEN
========================================================= */

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

/* =========================================================
   ERROR MESSAGE
========================================================= */

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

  return "Failed to load lead.";
}
