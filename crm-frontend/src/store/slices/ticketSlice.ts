import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axios";

export type TicketOwner = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
};

export type TicketLead = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  country_code?: string;
  phone_number?: string;
  city?: string;
};

export type TicketDeal = {
  id: number;
  deal_name: string;
  lead?: TicketLead | null;
};

export type Ticket = {
  id: number;
  ticket_name: string;
  description: string;
  ticket_status: string;
  source: string;
  priority: string;
  ticket_owners: TicketOwner[];
  associated_deal: TicketDeal;
  created_at: string;
  updated_at: string;
};

export type TicketPayload = {
  ticket_name: string;
  description: string;
  ticket_status: string;
  source: string;
  priority: string;
  ticket_owner_ids: number[];
  associated_deal_id: number;
};

export type TicketFilters = {
  search?: string;
  ticket_owner?: number;
  ticket_status?: string;
  source?: string;
  priority?: string;
  created_date?: string;
  page?: number;
};

interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  count: number;
  totalPages: number;
  currentPage: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: any;
  saveError: any;
  deleteError: any;
}

const initialState: TicketState = {
  tickets: [],
  selectedTicket: null,
  count: 0,
  totalPages: 1,
  currentPage: 1,
  next: null,
  previous: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null,
  saveError: null,
  deleteError: null,
};

export const fetchTickets = createAsyncThunk<
  {
    results: Ticket[];
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    totalPages: number;
  },
  TicketFilters,
  { rejectValue: string }
>("tickets/fetchTickets", async (filters = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();

    if (filters.search?.trim()) {
      params.append("search", filters.search.trim());
    }

    if (filters.ticket_owner) {
      params.append("ticket_owners", String(filters.ticket_owner));
    }

    if (filters.ticket_status) {
      params.append("ticket_status", filters.ticket_status);
    }

    if (filters.source) {
      params.append("source", filters.source);
    }

    if (filters.priority) {
      params.append("priority", filters.priority);
    }

    if (filters.created_date) {
      params.append("created_date", filters.created_date);
    }

    const page = filters.page || 1;

    params.append("page", String(page));

    const response = await axiosInstance.get(`/tickets/?${params.toString()}`);

    console.log("Ticket GET URL:", `/tickets/?${params.toString()}`);

    console.log("Ticket response:", response.data);

    if (Array.isArray(response.data)) {
      const results = response.data;

      return {
        results,
        count: results.length,
        next: null,
        previous: null,
        currentPage: 1,
        totalPages: 1,
      };
    }

    const count = response.data.count || 0;
    const pageSize = 10;

    const totalPages = Math.ceil(count / pageSize);

    return {
      results: response.data.results || [],
      count,
      next: response.data.next || null,
      previous: response.data.previous || null,
      currentPage: page,
      totalPages: totalPages || 1,
    };
  } catch (error: any) {
    console.error("Fetch tickets error:", error);

    return rejectWithValue(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to fetch tickets",
    );
  }
});

export const createTicket = createAsyncThunk<
  Ticket,
  TicketPayload,
  { rejectValue: string }
>("tickets/createTicket", async (ticketData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/tickets/", ticketData);

    return response.data;
  } catch (error: any) {
    console.error("Create ticket error:", error);

    return rejectWithValue(
      error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "Failed to create ticket",
    );
  }
});

export const fetchTicketById = createAsyncThunk<
  Ticket,
  number,
  { rejectValue: any }
>("tickets/fetchTicketById", async (ticketId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/tickets/${ticketId}/`);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || error.message || "Failed to fetch ticket",
    );
  }
});

export const updateTicket = createAsyncThunk<
  Ticket,
  {
    id: number;
    data: Partial<TicketPayload>;
  },
  { rejectValue: any }
>("tickets/updateTicket", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.patch(`/tickets/${id}/`, data);

    return response.data;
  } catch (error: any) {
    console.error("Update ticket error:", error);

    return rejectWithValue(
      error.response?.data || error.message || "Failed to update ticket",
    );
  }
});

export const deleteTicket = createAsyncThunk<
  number,
  number,
  { rejectValue: any }
>("tickets/deleteTicket", async (ticketId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/tickets/${ticketId}/`);

    return ticketId;
  } catch (error: any) {
    console.error("Delete ticket error:", error);

    return rejectWithValue(
      error.response?.data || error.message || "Failed to delete ticket",
    );
  }
});

const ticketSlice = createSlice({
  name: "tickets",
  initialState,

  reducers: {
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch tickets";
      })

      .addCase(createTicket.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.saving = false;
        state.saveError = null;
        state.tickets.unshift(action.payload);
        state.count += 1;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to create ticket";
      })

      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const ticket = action.payload;

        state.selectedTicket = ticket;

        const index = state.tickets.findIndex((item) => item.id === ticket.id);

        if (index !== -1) {
          state.tickets[index] = ticket;
        }
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch ticket";
      })

      .addCase(updateTicket.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.saving = false;
        state.saveError = null;

        const updatedTicket = action.payload;

        const index = state.tickets.findIndex(
          (ticket) => ticket.id === updatedTicket.id,
        );

        if (index !== -1) {
          state.tickets[index] = updatedTicket;
        }

        state.selectedTicket = updatedTicket;
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to update ticket";
      })

      .addCase(deleteTicket.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.deleting = false;
        state.deleteError = null;

        const deletedId = action.payload;

        state.tickets = state.tickets.filter(
          (ticket) => ticket.id !== deletedId,
        );

        state.count = Math.max(0, state.count - 1);

        state.totalPages = Math.max(1, Math.ceil(state.count / 10));

        if (state.selectedTicket?.id === deletedId) {
          state.selectedTicket = null;
        }
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || "Failed to delete ticket";
      });
  },
});

export const { clearSelectedTicket } = ticketSlice.actions;

export default ticketSlice.reducer;
