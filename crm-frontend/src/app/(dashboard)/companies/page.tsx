"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import PageHeader from "../../components/list-page/PageHeader";
import SearchBar from "../../components/list-page/SearchBar";
import PaginationBar from "../../components/list-page/PaginationBar";
import DataTable from "../../components/list-page/DataTable";
import FilterSection from "../../components/list-page/FilterSection";

import ListPageLayout from "../../components/layout/ListPageLayout";

import CreateCompanyDrawer from "../../create_forms/company/CreateCompanyForm";

import ImportCompanyDrawer from "../../components/import_forms/company/ImportCompanyDrawer";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchCompanies, deleteCompany } from "@/store/slices/companySlice";

import type { Company } from "@/store/slices/companySlice";

// Options

const industryOptions = [
  {
    label: "Information Technology",
    value: "IT",
  },
  {
    label: "Healthcare",
    value: "Healthcare",
  },
  {
    label: "Retail",
    value: "Retail",
  },
  {
    label: "Finance",
    value: "Finance",
  },
  {
    label: "Education",
    value: "Education",
  },
  {
    label: "Manufacturing",
    value: "Manufacturing",
  },
  {
    label: "Agriculture",
    value: "Agriculture",
  },
  {
    label: "Other",
    value: "Other",
  },
];

const leadStatusOptions = [
  {
    label: "New",
    value: "new",
  },
  {
    label: "Contacted",
    value: "contacted",
  },
  {
    label: "Qualified",
    value: "qualified",
  },
  {
    label: "Proposal Sent",
    value: "proposal_sent",
  },
  {
    label: "Negotiation",
    value: "negotiation",
  },
  {
    label: "Converted",
    value: "converted",
  },
  {
    label: "Lost",
    value: "lost",
  },
];

// Page

export default function CompaniesPage() {
  const dispatch = useAppDispatch();

  const { companies, loading, error, deleting, totalPages } = useAppSelector(
    (state) => state.companies,
  );

  // List state

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [industryFilter, setIndustryFilter] = useState("");

  const [countryFilter, setCountryFilter] = useState("");

  const [cityFilter, setCityFilter] = useState("");

  const [leadStatusFilter, setLeadStatusFilter] = useState("");

  const [createdDateFilter, setCreatedDateFilter] = useState("");

  // Create / Edit

  const [openCompanyDrawer, setOpenCompanyDrawer] = useState(false);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Delete

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Import

  const [openImportDrawer, setOpenImportDrawer] = useState(false);

  // Country options

  const countryOptions = useMemo(() => {
    const countries = companies
      .map((company) => company.country)
      .filter(Boolean);

    return Array.from(new Set(countries));
  }, [companies]);

  // City options

  const cityOptions = useMemo(() => {
    const cities = companies.map((company) => company.city).filter(Boolean);

    return Array.from(new Set(cities));
  }, [companies]);

  // Fetch

  useEffect(() => {
    dispatch(
      fetchCompanies({
        search: search.trim(),
        industry: industryFilter,
        country: countryFilter,
        city: cityFilter,
        lead_status: leadStatusFilter,
        created_date: createdDateFilter,
        page,
      }),
    );
  }, [
    dispatch,
    search,
    industryFilter,
    countryFilter,
    cityFilter,
    leadStatusFilter,
    createdDateFilter,
    page,
  ]);

  // Create

  const handleCreate = () => {
    setEditingCompany(null);

    setOpenCompanyDrawer(true);
  };

  // Edit

  const handleEdit = (company: Company) => {
    setEditingCompany(company);

    setOpenCompanyDrawer(true);
  };

  // Close drawer

  const handleDrawerClose = () => {
    setOpenCompanyDrawer(false);

    setEditingCompany(null);
  };

  // Open import

  const handleImport = () => {
    setOpenImportDrawer(true);
  };

  // Close import

  const handleImportClose = () => {
    setOpenImportDrawer(false);
  };

  // Import success

  const handleImportSuccess = () => {
    setOpenImportDrawer(false);

    setPage(1);

    dispatch(
      fetchCompanies({
        search: search.trim(),
        industry: industryFilter,
        country: countryFilter,
        city: cityFilter,
        lead_status: leadStatusFilter,
        created_date: createdDateFilter,
        page: 1,
      }),
    );
  };

  // Delete click

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);

    setDeleteDialogOpen(true);
  };

  // Delete cancel

  const handleDeleteCancel = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);

    setCompanyToDelete(null);
  };

  // Delete confirm

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) {
      return;
    }

    try {
      await dispatch(deleteCompany(companyToDelete.id)).unwrap();

      setDeleteDialogOpen(false);

      setCompanyToDelete(null);
    } catch (error) {
      // Redux handles the error.
    }
  };

  // Filter change

  const handleFilterChange = (field: string, value: string) => {
    setPage(1);

    if (field === "industry") {
      setIndustryFilter(value);
    }

    if (field === "country") {
      setCountryFilter(value);
    }

    if (field === "city") {
      setCityFilter(value);
    }

    if (field === "leadStatus") {
      setLeadStatusFilter(value);
    }

    if (field === "createdDate") {
      setCreatedDateFilter(value);
    }
  };

  // Rows

  const rows = companies.map((company) => {
    const owners = Array.isArray(company.company_owners)
      ? company.company_owners
      : [];

    const ownerName = owners
      .map((owner) =>
        `${owner.first_name || ""} ${owner.last_name || ""}`.trim(),
      )
      .filter(Boolean)
      .join(", ");

    return {
      id: company.id,

      companyName: company.company_name || "-",

      companyOwner: ownerName || "-",

      phoneNumber: company.phone_number || "-",

      industry: company.industry || "-",

      city: company.city || "-",

      country: company.country || "-",

      createdDate: company.created_at
        ? new Date(company.created_at).toLocaleDateString("en-GB")
        : "-",

      company,
    };
  });

  // Columns

  const companyColumns = [
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 1.6,
      minWidth: 220,
    },

    {
      field: "companyOwner",
      headerName: "Company Owner",
      flex: 1.4,
      minWidth: 200,
    },

    {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1.2,
      minWidth: 170,
    },

    {
      field: "industry",
      headerName: "Industry",
      flex: 1.2,
      minWidth: 160,
    },

    {
      field: "city",
      headerName: "City",
      flex: 1,
      minWidth: 130,
    },

    {
      field: "country",
      headerName: "Country/Region",
      flex: 1.3,
      minWidth: 180,
    },

    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 1.3,
      minWidth: 180,
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,

      renderCell: (params: any) => {
        const company = params.row.company as Company;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <EditOutlinedIcon
              onClick={(event) => {
                event.stopPropagation();

                handleEdit(company);
              }}
              sx={{
                color: "primary.main",
                cursor: "pointer",
                width: 20,
                height: 20,

                "&:hover": {
                  opacity: 0.7,
                },
              }}
            />

            <DeleteOutlineOutlinedIcon
              onClick={(event) => {
                event.stopPropagation();

                handleDeleteClick(company);
              }}
              sx={{
                color: "error.main",
                cursor: "pointer",
                width: 20,
                height: 20,

                "&:hover": {
                  opacity: 0.7,
                },
              }}
            />
          </Box>
        );
      },
    },
  ];

  // Loading

  if (loading && companies.length === 0) {
    return (
      <ListPageLayout
        header={
          <PageHeader
            title="Companies"
            secondaryButton="Import"
            primaryButton="Create"
            onSecondaryClick={handleImport}
            onPrimaryClick={handleCreate}
          />
        }
        toolbar={null}
      >
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>

        <CreateCompanyDrawer
          open={openCompanyDrawer}
          onClose={handleDrawerClose}
          company={editingCompany}
        />

        <ImportCompanyDrawer
          open={openImportDrawer}
          onClose={handleImportClose}
          onImported={handleImportSuccess}
        />
      </ListPageLayout>
    );
  }

  // Error

  if (error) {
    return (
      <ListPageLayout
        header={
          <PageHeader
            title="Companies"
            secondaryButton="Import"
            primaryButton="Create"
            onSecondaryClick={handleImport}
            onPrimaryClick={handleCreate}
          />
        }
        toolbar={null}
      >
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            {typeof error === "string"
              ? error
              : error?.message || "Failed to load companies."}
          </Alert>
        </Box>

        <ImportCompanyDrawer
          open={openImportDrawer}
          onClose={handleImportClose}
          onImported={handleImportSuccess}
        />
      </ListPageLayout>
    );
  }

  // Main UI

  return (
    <>
      <ListPageLayout
        header={
          <PageHeader
            title="Companies"
            secondaryButton="Import"
            primaryButton="Create"
            onSecondaryClick={handleImport}
            onPrimaryClick={handleCreate}
          />
        }
        toolbar={
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <SearchBar
              value={search}
              placeholder="Search companies..."
              onChange={(value) => {
                setSearch(value);

                setPage(1);
              }}
            />

            <PaginationBar
              page={page}
              totalPages={totalPages}
              onChange={(newPage) => {
                setPage(newPage);
              }}
            />
          </Box>
        }
        filters={
          <FilterSection
            filters={[
              {
                field: "industry",
                label: "Industry",
                type: "select",
                options: industryOptions,
              },

              {
                field: "country",
                label: "Country/Region",
                type: "select",
                options: countryOptions.map((country) => ({
                  label: country,
                  value: country,
                })),
              },

              {
                field: "city",
                label: "City",
                type: "select",
                options: cityOptions.map((city) => ({
                  label: city,
                  value: city,
                })),
              },

              {
                field: "leadStatus",
                label: "Lead Status",
                type: "select",
                options: leadStatusOptions,
              },

              {
                field: "createdDate",
                label: "Created Date",
                type: "date",
              },
            ]}
            values={{
              industry: industryFilter,
              country: countryFilter,
              city: cityFilter,
              leadStatus: leadStatusFilter,
              createdDate: createdDateFilter,
            }}
            onChange={handleFilterChange}
          />
        }
      >
        <DataTable rows={rows} columns={companyColumns} rowLink="/companies" />

        <CreateCompanyDrawer
          open={openCompanyDrawer}
          onClose={handleDrawerClose}
          company={editingCompany}
        />
      </ListPageLayout>

      {/* Import drawer */}

      <ImportCompanyDrawer
        open={openImportDrawer}
        onClose={handleImportClose}
        onImported={handleImportSuccess}
      />

      {/* Delete dialog */}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Company</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{companyToDelete?.company_name}</strong>?
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
