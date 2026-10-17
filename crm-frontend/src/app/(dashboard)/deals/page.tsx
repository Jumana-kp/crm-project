"use client";

import { useEffect, useState } from "react";

import { Box } from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useSearchParams } from "next/navigation";

import type { Deal } from "@/store/slices/dealSlice";

import CreateDealDrawer from "../../create_forms/deal/CreateDealForm";

import ImportDealDrawer from "../../components/import_forms/deals/ImportDealDrawer";

import PageHeader from "../../components/list-page/PageHeader";

import SearchBar from "../../components/list-page/SearchBar";

import PaginationBar from "../../components/list-page/PaginationBar";

import DataTable from "../../components/list-page/DataTable";

import FilterSection from "../../components/list-page/FilterSection";

import type { Filter } from "../../components/list-page/FilterSection";

import ListPageLayout from "../../components/layout/ListPageLayout";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchDeals, deleteDeal } from "@/store/slices/dealSlice";

import { fetchUsers } from "@/store/slices/userSlice";

// Page

export default function DealsPage() {
  // Search params

  const searchParams = useSearchParams();

  const leadIdFromUrl = searchParams.get("leadId");

  const openCreateFromUrl = searchParams.get("openCreate") === "true";

  // State

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [ownerFilter, setOwnerFilter] = useState("");

  const [stageFilter, setStageFilter] = useState("");

  const [closeDateFilter, setCloseDateFilter] = useState("");

  const [createdDateFilter, setCreatedDateFilter] = useState("");

  const [openDealDrawer, setOpenDealDrawer] = useState(false);

  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Import drawer

  const [openDealImportDrawer, setOpenDealImportDrawer] = useState(false);

  // Lead ID

  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // Dispatch

  const dispatch = useAppDispatch();

  // Deal state

  const { deals, totalPages } = useAppSelector((state) => state.deals);

  // Users

  const users = useAppSelector((state) => state.users.users);

  // Fetch users

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length]);

  // Fetch deals

  useEffect(() => {
    dispatch(
      fetchDeals({
        search: search.trim() || undefined,

        owners: ownerFilter ? Number(ownerFilter) : undefined,

        stage: stageFilter || undefined,

        close_date: closeDateFilter || undefined,

        created_date: createdDateFilter || undefined,

        page,
      }),
    );
  }, [
    dispatch,
    search,
    ownerFilter,
    stageFilter,
    closeDateFilter,
    createdDateFilter,
    page,
  ]);

  // Open create from lead

  useEffect(() => {
    if (!openCreateFromUrl) {
      return;
    }

    if (!leadIdFromUrl) {
      return;
    }

    const parsedLeadId = Number(leadIdFromUrl);

    if (!Number.isInteger(parsedLeadId) || parsedLeadId <= 0) {
      return;
    }

    // Open drawer with selected lead

    setEditingDeal(null);

    setSelectedLeadId(parsedLeadId);

    setOpenDealDrawer(true);
  }, [openCreateFromUrl, leadIdFromUrl]);

  // Filter change

  const handleFilterChange = (field: string, value: string) => {
    setPage(1);

    switch (field) {
      case "owner":
        setOwnerFilter(value);
        break;

      case "stage":
        setStageFilter(value);
        break;

      case "closeDate":
        setCloseDateFilter(value);
        break;

      case "createdDate":
        setCreatedDateFilter(value);
        break;

      default:
        break;
    }
  };

  // Filters

  const dealFilters: Filter[] = [
    {
      field: "owner",

      label: "Deal Owner",

      type: "select",

      options: users.map((user) => ({
        label:
          `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
          user.email ||
          `User ${user.id}`,

        value: String(user.id),
      })),
    },

    {
      field: "stage",

      label: "Deal Stage",

      type: "select",

      options: [
        {
          label: "New",
          value: "new",
        },

        {
          label: "Qualified",
          value: "qualified",
        },

        {
          label: "Proposal",
          value: "proposal",
        },

        {
          label: "Negotiation",
          value: "negotiation",
        },

        {
          label: "Closed Won",
          value: "closed_won",
        },

        {
          label: "Closed Lost",
          value: "closed_lost",
        },
      ],
    },

    {
      field: "closeDate",

      label: "Close Date",

      type: "date",
    },

    {
      field: "createdDate",

      label: "Created Date",

      type: "date",
    },
  ];

  // Rows

  const rows = deals.map((deal) => {
    const ownerNames =
      deal.owners
        ?.map(
          (owner) =>
            `${owner.first_name ?? ""} ${owner.last_name ?? ""}`.trim() ||
            owner.email ||
            "-",
        )
        .filter(Boolean)
        .join(", ") || "-";

    const leadName = deal.lead
      ? `${deal.lead.first_name ?? ""} ${deal.lead.last_name ?? ""}`.trim() ||
        deal.lead.email ||
        "-"
      : "-";

    return {
      id: deal.id,

      dealName: deal.deal_name,

      leadName,

      dealStage: deal.stage,

      closeDate: deal.close_date
        ? new Date(`${deal.close_date}T00:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "-",

      dealOwner: ownerNames,

      amount: `$${Number(deal.amount).toLocaleString("en-US")}`,

      deal,
    };
  });

  // Create

  const handleCreateDeal = () => {
    setEditingDeal(null);

    setSelectedLeadId(null);

    setOpenDealDrawer(true);
  };

  // Edit

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);

    setSelectedLeadId(null);

    setOpenDealDrawer(true);
  };

  // Close drawer

  const handleDealDrawerClose = () => {
    setOpenDealDrawer(false);

    setEditingDeal(null);

    setSelectedLeadId(null);
  };

  // Delete

  const handleDeleteDeal = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deal?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteDeal(id)).unwrap();
    } catch {
      // Redux handles error.
    }
  };

  // Refresh deals

  const refreshDeals = () => {
    dispatch(
      fetchDeals({
        search: search.trim() || undefined,

        owners: ownerFilter ? Number(ownerFilter) : undefined,

        stage: stageFilter || undefined,

        close_date: closeDateFilter || undefined,

        created_date: createdDateFilter || undefined,

        page,
      }),
    );
  };

  // Columns

  const dealscolumns = [
    {
      field: "dealName",

      headerName: "Deal Name",

      flex: 1.6,

      minWidth: 220,
    },

    {
      field: "leadName",

      headerName: "Lead Name",

      flex: 1.4,

      minWidth: 200,
    },

    {
      field: "dealStage",

      headerName: "Deal Stage",

      flex: 1.2,

      minWidth: 170,
    },

    {
      field: "closeDate",

      headerName: "Close Date",

      flex: 1.2,

      minWidth: 180,
    },

    {
      field: "dealOwner",

      headerName: "Deal Owner",

      flex: 1.4,

      minWidth: 200,
    },

    {
      field: "amount",

      headerName: "Amount",

      flex: 1,

      minWidth: 140,
    },

    {
      field: "actions",

      headerName: "Actions",

      flex: 0.6,

      minWidth: 100,

      sortable: false,

      filterable: false,

      renderCell: (params: any) => (
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

              handleEditDeal(params.row.deal);
            }}
            sx={{
              color: "primary.main",

              cursor: "pointer",
            }}
          />

          <DeleteOutlineOutlinedIcon
            onClick={(event) => {
              event.stopPropagation();

              handleDeleteDeal(params.row.id);
            }}
            sx={{
              color: "error.main",

              cursor: "pointer",
            }}
          />
        </Box>
      ),
    },
  ];

  // Render

  return (
    <>
      <ListPageLayout
        header={
          <PageHeader
            title="Deals"
            secondaryButton="Import"
            primaryButton="Create"
            onSecondaryClick={() => {
              setOpenDealImportDrawer(true);
            }}
            onPrimaryClick={handleCreateDeal}
          />
        }
        // Search + pagination

        toolbar={
          <Box
            sx={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",

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
            filters={dealFilters}
            values={{
              owner: ownerFilter,

              stage: stageFilter,

              closeDate: closeDateFilter,

              createdDate: createdDateFilter,
            }}
            onChange={handleFilterChange}
          />
        }
      >
        {/* Data table */}

        <DataTable rows={rows} columns={dealscolumns} rowLink="/deals" />
      </ListPageLayout>

      {/* Create / Edit drawer */}

      <CreateDealDrawer
        open={openDealDrawer}
        onClose={handleDealDrawerClose}
        deal={editingDeal}
        initialLeadId={selectedLeadId}
      />

      {/* Import drawer */}

      <ImportDealDrawer
        open={openDealImportDrawer}
        onClose={() => {
          setOpenDealImportDrawer(false);
        }}
        onImported={() => {
          // Close import drawer

          setOpenDealImportDrawer(false);

          // Refresh current page

          refreshDeals();
        }}
      />
    </>
  );
}
