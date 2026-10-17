"use client";

import api from "@/api/axios";

import { useEffect, useState } from "react";

import { Box, IconButton } from "@mui/material";

import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";

import ListPageLayout from "../../components/layout/ListPageLayout";
import DataTable from "../../components/list-page/DataTable";

import FilterSection, {
  type Filter,
} from "../../components/list-page/FilterSection";

import PageHeader from "../../components/list-page/PageHeader";
import PaginationBar from "../../components/list-page/PaginationBar";
import SearchBar from "../../components/list-page/SearchBar";
import StatusChip from "../../components/list-page/StatusChip";

import CreateLeadForm from "../../create_forms/lead/CreateLeadForm";

import ImportLeadDrawer from "../../components/import_forms/lead/ImportLeadDrawer";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchLeads, deleteLead } from "@/store/slices/leadSlice";

// Filters

const leadFilters: Filter[] = [
  {
    label: "Lead Status",
    type: "select",
    field: "lead_status",

    options: [
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
    ],
  },

  {
    label: "Created Date",
    type: "date",
    field: "created_date",
  },
];

// Page

export default function LeadsPage() {
  const dispatch = useAppDispatch();

  // Redux state

  const { leads, count, loading, error } = useAppSelector(
    (state) => state.leads,
  );

  // Search

  const [search, setSearch] = useState("");

  // Pagination

  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  // Filters

  const [statusFilter, setStatusFilter] = useState("");

  const [createdDateFilter, setCreatedDateFilter] = useState("");

  // Create / Edit

  const [openForm, setOpenForm] = useState(false);

  const [editingLead, setEditingLead] = useState<any | null>(null);

  // Import

  const [openImportDrawer, setOpenImportDrawer] = useState(false);

  // Fetch leads

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchLeads({
          lead_status: statusFilter || undefined,

          created_date: createdDateFilter || undefined,

          search: search.trim() || undefined,

          page,
        }),
      );
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [dispatch, statusFilter, createdDateFilter, search, page]);

  // Refresh

  const refreshLeads = () => {
    dispatch(
      fetchLeads({
        lead_status: statusFilter || undefined,

        created_date: createdDateFilter || undefined,

        search: search.trim() || undefined,

        page,
      }),
    );
  };

  // Delete

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?",
    );

    if (!confirmed) {
      return;
    }

    const result = await dispatch(deleteLead(id));

    if (deleteLead.fulfilled.match(result)) {
      refreshLeads();
    }
  };

  // Edit

  const handleEdit = async (lead: any) => {
    try {
      const response = await api.get(`/leads/${lead.id}/`);

      setEditingLead(response.data);

      setOpenForm(true);
    } catch (error) {
      console.error("Failed to load lead:", error);
    }
  };

  // Columns

  const leadColumns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1.5,
      minWidth: 220,
    },

    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 220,
    },

    {
      field: "phone",
      headerName: "Phone",
      flex: 1.2,
      minWidth: 180,
    },

    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 1.3,
      minWidth: 180,
    },

    {
      field: "status",
      headerName: "Lead Status",
      flex: 1,
      minWidth: 150,

      renderCell: (params: { value: string }) => (
        <StatusChip status={params.value} />
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,

      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {/* Edit */}

          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();

              handleEdit(params.row);
            }}
            sx={{
              color: "#2563EB",

              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.08)",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          {/* Delete */}

          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();

              handleDelete(params.row.id);
            }}
            sx={{
              color: "#DC2626",

              "&:hover": {
                backgroundColor: "rgba(220, 38, 38, 0.08)",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Rows

  const rows = Array.isArray(leads)
    ? leads.map((lead: any) => ({
        id: lead.id,

        name: `${lead.first_name || ""} ${lead.last_name || ""}`.trim(),

        email: lead.email || "",

        phone: lead.phone_number || "",

        createdDate: lead.created_at
          ? new Date(lead.created_at).toLocaleDateString("en-GB")
          : "",

        status: lead.lead_status || "",
      }))
    : [];

  // Total pages

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  // Loading

  if (loading && leads.length === 0) {
    return <div>Loading leads...</div>;
  }

  // Error

  if (error && leads.length === 0) {
    return <div>Failed to load leads.</div>;
  }

  // Render

  const PageHeaderComponent = PageHeader as any;

  return (
    <>
      {/* Leads list */}

      <ListPageLayout
        header={
          <PageHeaderComponent
            title="Leads"
            secondaryButton="Import"
            primaryButton="Create"
            onSecondaryClick={() => {
              setOpenImportDrawer(true);
            }}
            onPrimaryClick={() => {
              setEditingLead(null);

              setOpenForm(true);
            }}
          />
        }
        // Search + pagination

        toolbar={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <SearchBar
              value={search}
              onChange={(value) => {
                setSearch(value);

                setPage(1);
              }}
            />

            <PaginationBar
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </Box>
        }
        // Filters

        filters={
          <FilterSection
            filters={leadFilters}
            values={{
              lead_status: statusFilter,

              created_date: createdDateFilter,
            }}
            onChange={(field, value) => {
              // Lead status

              if (field === "lead_status") {
                setStatusFilter(value);

                setPage(1);
              }

              // Created date

              if (field === "created_date") {
                setCreatedDateFilter(value);

                setPage(1);
              }
            }}
          />
        }
      >
        {/* Data table */}

        <DataTable rows={rows} columns={leadColumns} rowLink="/leads" />
      </ListPageLayout>

      {/* Create / Edit drawer */}

      <CreateLeadForm
        open={openForm}
        lead={editingLead}
        onClose={() => {
          setOpenForm(false);

          setEditingLead(null);
        }}
        onCreated={() => {
          setOpenForm(false);

          setEditingLead(null);

          refreshLeads();
        }}
      />

      {/* Import drawer */}

      <ImportLeadDrawer
        open={openImportDrawer}
        onClose={() => {
          setOpenImportDrawer(false);
        }}
        onImported={() => {
          // Close drawer

          setOpenImportDrawer(false);

          // Refresh current page

          refreshLeads();
        }}
      />
    </>
  );
}
