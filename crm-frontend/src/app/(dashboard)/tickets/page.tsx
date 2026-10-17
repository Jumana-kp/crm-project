"use client";

import { useEffect, useState } from "react";

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

import ListPageLayout from "../../components/layout/ListPageLayout";
import DataTable from "../../components/list-page/DataTable";

import FilterSection, {
  type Filter,
} from "../../components/list-page/FilterSection";

import PageHeader from "../../components/list-page/PageHeader";
import PaginationBar from "../../components/list-page/PaginationBar";
import SearchBar from "../../components/list-page/SearchBar";

import TicketForm from "@/app/create_forms/ticket/CreateTicketForm";
import ImportTicketDrawer from "../../components/import_forms/ticket/ImportTicketDrawer";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  fetchTickets,
  fetchTicketById,
  deleteTicket,
  type Ticket,
} from "@/store/slices/ticketSlice";

import { fetchUsers } from "@/store/slices/userSlice";

// Tickets page

export default function TicketsPage() {
  const dispatch = useAppDispatch();

  // Redux

  const { tickets, loading, error, deleting, totalPages } = useAppSelector(
    (state) => state.tickets,
  );

  const users = useAppSelector((state) => state.users.users);

  // Search

  const [search, setSearch] = useState("");

  // Pagination

  const [page, setPage] = useState(1);

  // Filters

  const [ticketOwnerFilter, setTicketOwnerFilter] = useState("");

  const [ticketStatusFilter, setTicketStatusFilter] = useState("");

  const [sourceFilter, setSourceFilter] = useState("");

  const [priorityFilter, setPriorityFilter] = useState("");

  const [createdDateFilter, setCreatedDateFilter] = useState("");

  // Create / Edit

  const [openTicketForm, setOpenTicketForm] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Import

  const [openImportDrawer, setOpenImportDrawer] = useState(false);

  // Delete dialog

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  // Fetch users

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Fetch tickets

  useEffect(() => {
    dispatch(
      fetchTickets({
        search: search.trim() || undefined,

        ticket_owner: ticketOwnerFilter ? Number(ticketOwnerFilter) : undefined,

        ticket_status: ticketStatusFilter || undefined,

        source: sourceFilter || undefined,

        priority: priorityFilter || undefined,

        created_date: createdDateFilter || undefined,

        page,
      }),
    );
  }, [
    dispatch,
    search,
    ticketOwnerFilter,
    ticketStatusFilter,
    sourceFilter,
    priorityFilter,
    createdDateFilter,
    page,
  ]);

  // Filter change

  const handleFilterChange = (field: string, value: string) => {
    setPage(1);

    switch (field) {
      case "ticketOwner":
        setTicketOwnerFilter(value);
        break;

      case "ticketStatus":
        setTicketStatusFilter(value);
        break;

      case "source":
        setSourceFilter(value);
        break;

      case "priority":
        setPriorityFilter(value);
        break;

      case "createdDate":
        setCreatedDateFilter(value);
        break;

      default:
        break;
    }
  };

  // Filter options

  const ticketFilters: Filter[] = [
    {
      field: "ticketOwner",
      label: "Ticket Owner",
      type: "select",

      options: users.map((user) => ({
        label:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.email ||
          `User ${user.id}`,

        value: String(user.id),
      })),
    },

    {
      field: "ticketStatus",
      label: "Ticket Status",
      type: "select",

      options: [
        {
          label: "Open",
          value: "Open",
        },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "On Hold",
          value: "On Hold",
        },
        {
          label: "Resolved",
          value: "Resolved",
        },
        {
          label: "Closed",
          value: "Closed",
        },
      ],
    },

    {
      field: "source",
      label: "Source",
      type: "select",

      options: [
        {
          label: "Email",
          value: "Email",
        },
        {
          label: "Phone",
          value: "Phone",
        },
        {
          label: "Website",
          value: "Website",
        },
        {
          label: "Chat",
          value: "Chat",
        },
        {
          label: "Other",
          value: "Other",
        },
      ],
    },

    {
      field: "priority",
      label: "Priority",
      type: "select",

      options: [
        {
          label: "Low",
          value: "Low",
        },
        {
          label: "Medium",
          value: "Medium",
        },
        {
          label: "High",
          value: "High",
        },
        {
          label: "Urgent",
          value: "Urgent",
        },
      ],
    },

    {
      field: "createdDate",
      label: "Created Date",
      type: "date",
    },
  ];

  // Create

  const handleCreate = () => {
    setSelectedTicket(null);
    setOpenTicketForm(true);
  };

  // Import

  const handleImport = () => {
    setOpenImportDrawer(true);
  };

  const handleImportClose = () => {
    setOpenImportDrawer(false);
  };

  const handleImported = () => {
    setOpenImportDrawer(false);

    dispatch(
      fetchTickets({
        search: search.trim() || undefined,

        ticket_owner: ticketOwnerFilter ? Number(ticketOwnerFilter) : undefined,

        ticket_status: ticketStatusFilter || undefined,

        source: sourceFilter || undefined,

        priority: priorityFilter || undefined,

        created_date: createdDateFilter || undefined,

        page,
      }),
    );
  };

  // Edit

  const handleEdit = async (ticketId: number) => {
    try {
      const ticket = await dispatch(fetchTicketById(ticketId)).unwrap();

      setSelectedTicket(ticket);
      setOpenTicketForm(true);
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
    }
  };

  // Close drawer

  const handleDrawerClose = () => {
    setOpenTicketForm(false);
    setSelectedTicket(null);

    dispatch(
      fetchTickets({
        search: search.trim() || undefined,

        ticket_owner: ticketOwnerFilter ? Number(ticketOwnerFilter) : undefined,

        ticket_status: ticketStatusFilter || undefined,

        source: sourceFilter || undefined,

        priority: priorityFilter || undefined,

        created_date: createdDateFilter || undefined,

        page,
      }),
    );
  };

  // Delete

  const handleDeleteClick = (ticket: Ticket) => {
    setTicketToDelete(ticket);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setTicketToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) {
      return;
    }

    try {
      await dispatch(deleteTicket(ticketToDelete.id)).unwrap();

      setDeleteDialogOpen(false);
      setTicketToDelete(null);

      dispatch(
        fetchTickets({
          search: search.trim() || undefined,

          ticket_owner: ticketOwnerFilter
            ? Number(ticketOwnerFilter)
            : undefined,

          ticket_status: ticketStatusFilter || undefined,

          source: sourceFilter || undefined,

          priority: priorityFilter || undefined,

          created_date: createdDateFilter || undefined,

          page,
        }),
      );
    } catch (err) {
      console.error("Failed to delete ticket:", err);
    }
  };

  // Table rows

  const rows = tickets.map((ticket) => {
    const owners = Array.isArray(ticket.ticket_owners)
      ? ticket.ticket_owners
      : [];

    const ownerName = owners
      .map((owner) =>
        `${owner.first_name || ""} ${owner.last_name || ""}`.trim(),
      )
      .filter(Boolean)
      .join(", ");

    return {
      id: ticket.id,

      ticketName: ticket.ticket_name || "-",

      dealName: ticket.associated_deal?.deal_name || "-",

      ticketStatus: ticket.ticket_status || "-",

      priority: ticket.priority || "-",

      source: ticket.source || "-",

      ticketOwner: ownerName || "-",

      createdDate: ticket.created_at
        ? new Date(ticket.created_at).toLocaleDateString("en-GB")
        : "-",

      ticket,
    };
  });

  // Table columns

  const ticketColumns = [
    {
      field: "ticketName",
      headerName: "Ticket Name",
      flex: 1.6,
      minWidth: 220,
    },

    {
      field: "dealName",
      headerName: "Deal Name",
      flex: 1.4,
      minWidth: 200,
    },

    {
      field: "ticketStatus",
      headerName: "Ticket Status",
      flex: 1,
      minWidth: 150,
    },

    {
      field: "priority",
      headerName: "Priority",
      flex: 0.9,
      minWidth: 130,
    },

    {
      field: "source",
      headerName: "Source",
      flex: 1,
      minWidth: 140,
    },

    {
      field: "ticketOwner",
      headerName: "Ticket Owner",
      flex: 1.4,
      minWidth: 200,
    },

    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 1.3,
      minWidth: 190,
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,

      renderCell: (params: any) => {
        const ticket = params.row.ticket as Ticket;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* Edit */}

            <EditOutlinedIcon
              onClick={(event) => {
                event.stopPropagation();

                handleEdit(ticket.id);
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

            {/* Delete */}

            <DeleteOutlineOutlinedIcon
              onClick={(event) => {
                event.stopPropagation();

                handleDeleteClick(ticket);
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

  // Common header

  const pageHeader = (
    <PageHeader
      title="Tickets"
      secondaryButton="Import"
      primaryButton="Create"
      onSecondaryClick={handleImport}
      onPrimaryClick={handleCreate}
    />
  );

  // Initial loading

  if (loading && tickets.length === 0) {
    return (
      <ListPageLayout header={pageHeader} toolbar={null}>
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

        <TicketForm
          open={openTicketForm}
          ticket={selectedTicket}
          onClose={handleDrawerClose}
        />

        <ImportTicketDrawer
          open={openImportDrawer}
          onClose={handleImportClose}
          onImported={handleImported}
        />
      </ListPageLayout>
    );
  }

  // Error

  if (error) {
    return (
      <ListPageLayout header={pageHeader} toolbar={null}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            {typeof error === "string"
              ? error
              : error?.message || "Failed to load tickets."}
          </Alert>
        </Box>

        <TicketForm
          open={openTicketForm}
          ticket={selectedTicket}
          onClose={handleDrawerClose}
        />

        <ImportTicketDrawer
          open={openImportDrawer}
          onClose={handleImportClose}
          onImported={handleImported}
        />
      </ListPageLayout>
    );
  }

  // Main

  return (
    <>
      <ListPageLayout
        header={pageHeader}
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
              placeholder="Search tickets..."
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
            filters={ticketFilters}
            values={{
              ticketOwner: ticketOwnerFilter,

              ticketStatus: ticketStatusFilter,

              source: sourceFilter,

              priority: priorityFilter,

              createdDate: createdDateFilter,
            }}
            onChange={handleFilterChange}
          />
        }
      >
        <DataTable rows={rows} columns={ticketColumns} rowLink="/tickets" />

        {/* Create / Edit */}

        <TicketForm
          open={openTicketForm}
          ticket={selectedTicket}
          onClose={handleDrawerClose}
        />

        {/* Import */}

        <ImportTicketDrawer
          open={openImportDrawer}
          onClose={handleImportClose}
          onImported={handleImported}
        />
      </ListPageLayout>

      {/* Delete dialog */}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Ticket</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{ticketToDelete?.ticket_name}</strong>?
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
