"use client";

import { formatCreatedDate } from "@/utils/formatDate";

import { useEffect, useMemo, useState } from "react";

import { Alert, Box, CircularProgress } from "@mui/material";

import { useParams, usePathname } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchCompanyById, updateCompany } from "@/store/slices/companySlice";

import type { Company } from "@/store/slices/companySlice";

import DetailsPageLayout from "../../../components/layout/DetailPageLayout";

import DetailLayout from "@/app/components/detail-page/DetailLayout";

import RightSidebar from "@/app/components/detail-page/RightSidebar";

import ActivityTimeLine from "@/app/components/detail-page/ActivityTimeLine";

// =====================================================
// PAGE
// =====================================================

export default function CompanyDetailPage() {
  const params = useParams();

  const pathname = usePathname();

  const dispatch = useAppDispatch();

  // ===================================================
  // CALL FORM STATE
  // ===================================================

  const [callOpen, setCallOpen] = useState(false);

  // ===================================================
  // GET COMPANY ID
  // ===================================================

  const companyId = useMemo<number | null>(() => {
    const paramId = params?.id;

    // -------------------------------------------------
    // /companies/[id]
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
    // Fallback: read ID from pathname
    // -------------------------------------------------

    if (pathname) {
      const parts = pathname.split("/").filter(Boolean);

      const companiesIndex = parts.findIndex(
        (part) => part.toLowerCase() === "companies",
      );

      if (companiesIndex !== -1 && parts[companiesIndex + 1]) {
        const parsed = Number(parts[companiesIndex + 1]);

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

  const { selectedCompany, detailLoading, detailError, saving, saveError } =
    useAppSelector((state) => state.companies);

  // ===================================================
  // FETCH COMPANY
  // ===================================================

  useEffect(() => {
    if (companyId === null || !Number.isInteger(companyId) || companyId <= 0) {
      return;
    }

    dispatch(fetchCompanyById(companyId));
  }, [companyId, dispatch]);

  // ===================================================
  // INVALID ID
  // ===================================================

  if (companyId === null) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F5F6FA",
          p: 4,
        }}
      >
        <Alert severity="error">Company ID is missing from URL.</Alert>
      </Box>
    );
  }

  // ===================================================
  // LOADING
  // ===================================================

  if (detailLoading && !selectedCompany) {
    return <LoadingScreen />;
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (detailError && !selectedCompany) {
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

  // ===================================================
  // NO COMPANY
  // ===================================================

  if (!selectedCompany) {
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
    if (!selectedCompany) {
      return;
    }

    const updateData: Record<string, string | number | null> = {};

    fields.forEach((field) => {
      // ---------------------------------------------
      // NUMBER OF EMPLOYEES
      // ---------------------------------------------

      if (field.key === "no_of_employees") {
        if (field.value.trim() === "") {
          updateData[field.key] = null;
        } else {
          const numberValue = Number(field.value);

          if (Number.isNaN(numberValue)) {
            return;
          }

          updateData[field.key] = numberValue;
        }

        return;
      }

      // ---------------------------------------------
      // ANNUAL REVENUE
      // ---------------------------------------------

      if (field.key === "annual_revenue") {
        updateData[field.key] =
          field.value.trim() === "" ? null : field.value.trim();

        return;
      }

      // ---------------------------------------------
      // NORMAL FIELD
      // ---------------------------------------------

      updateData[field.key] = field.value;
    });

    // ---------------------------------------------
    // OWNERS ARE NOT EDITED HERE
    // ---------------------------------------------

    delete updateData["company_owners"];

    // ---------------------------------------------
    // UPDATE COMPANY
    // ---------------------------------------------

    await dispatch(
      updateCompany({
        id: selectedCompany.id,
        data: updateData,
      }),
    ).unwrap();

    // ---------------------------------------------
    // FETCH LATEST COMPANY
    // ---------------------------------------------

    await dispatch(fetchCompanyById(selectedCompany.id)).unwrap();
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
            entity={buildCompanyEntity(selectedCompany)}
            allowedAttendeeIds={
              selectedCompany.company_owners?.map((owner) =>
                Number(owner.id),
              ) ?? []
            }
            onSaveAbout={handleSaveAbout}
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
              module="company"
              moduleId={companyId ?? 0}
              allowedAttendeeIds={[
                ...(selectedCompany.company_owners?.map((owner) =>
                  Number(owner.id),
                ) ?? []),
              ]}
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
              title="AI Company Summary"
              summary="..."
              entityType="company"
              entityId={companyId}
            />
          </Box>
        }
      />
    </Box>
  );
}

// =====================================================
// BUILD COMPANY ENTITY
// =====================================================

function buildCompanyEntity(company: Company) {
  // ===================================================
  // BUILD INTERNATIONAL PHONE NUMBER
  // ===================================================
  //
  // The Company form stores:
  //
  // country:
  //   "UAE"
  //
  // phone_number:
  //   "547422454"
  //
  // But Twilio needs:
  //
  // +971547422454
  //
  // So we add the country code here only for calling.
  // The database value is NOT changed.
  // ===================================================

  const country = company.country?.trim().toLowerCase();

  let countryCode = "";

  if (country === "uae" || country === "united arab emirates") {
    countryCode = "+971";
  } else if (country === "india") {
    countryCode = "+91";
  } else if (
    country === "usa" ||
    country === "united states" ||
    country === "united states of america"
  ) {
    countryCode = "+1";
  } else if (country === "uk" || country === "united kingdom") {
    countryCode = "+44";
  }

  const companyPhone =
    countryCode && company.phone_number
      ? `${countryCode}${company.phone_number}`
      : company.phone_number?.trim() || "";

  return {
    id: company.id,

    header: {
      name: company.company_name || "Unknown",

      subtitle: company.industry || "",

      email: company.domain_name || "",

      secondLine: "",
    },

    name: company.company_name || "Unknown",

    subtitle: company.domain_name || "",

    email: company.email || "",

    // ===============================================
    // PHONE USED BY CALL FORM
    // ===============================================
    //
    // IMPORTANT:
    // This is now the complete international number.
    //
    // Example:
    // UAE + 547422454
    // => +971547422454
    //
    // This value is passed to LogCallForm and then
    // to the Twilio API.
    // ===============================================

    phone: companyPhone,

    avatar: getAvatarText(company.company_name),

    // ===============================================
    // ABOUT FIELDS
    // ===============================================

    fields: [
      {
        key: "company_name",

        label: "Company Name",

        value: company.company_name || "",
      },

      {
        key: "domain_name",

        label: "Domain Name",

        value: company.domain_name || "",
      },

      {
        key: "company_owners",

        label: "Company Owner",

        value: getOwnerNames(company),
      },

      {
        key: "industry",

        label: "Industry",

        value: company.industry || "",
      },

      {
        key: "company_type",

        label: "Company Type",

        value: company.company_type || "",
      },

      {
        key: "city",

        label: "City",

        value: company.city || "",
      },

      {
        key: "country",

        label: "Country/Region",

        value: company.country || "",
      },

      {
        key: "phone_number",

        label: "Phone Number",

        value: company.phone_number || "",
      },

      {
        key: "email",

        label: "Email",

        value: company.email || "",
      },

      {
        key: "no_of_employees",

        label: "No of Employees",

        value:
          company.no_of_employees !== null &&
          company.no_of_employees !== undefined
            ? String(company.no_of_employees)
            : "",
      },

      {
        key: "annual_revenue",

        label: "Annual Revenue",

        value:
          company.annual_revenue !== null &&
          company.annual_revenue !== undefined
            ? String(company.annual_revenue)
            : "",
      },

      // =============================================
      // CREATED DATE
      // =============================================

      {
        key: "created_at",

        label: "Created Date",

        value: company.created_at ? formatCreatedDate(company.created_at) : "-",
      },
    ],
  };
}

// =====================================================
// AVATAR
// =====================================================

function getAvatarText(companyName: string): string {
  if (!companyName) {
    return "C";
  }

  const words = companyName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}

// =====================================================
// OWNER NAMES
// =====================================================

function getOwnerNames(company: Company): string {
  if (
    !Array.isArray(company.company_owners) ||
    company.company_owners.length === 0
  ) {
    return "-";
  }

  return company.company_owners
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

  return "Failed to load company.";
}
