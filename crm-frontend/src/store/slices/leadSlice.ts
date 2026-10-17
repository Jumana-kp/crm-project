import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/api/axios";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
}

export interface Company {
  id: number;
  company_name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: string | number;
}

export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  country_code?: string;
  job_title?: string;
  city?: string;
  lead_status: string;
  contact_owners: User[];
  company: Company | null;
  products: Product[];
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface LeadImportError {
  row: number;
  lead_name?: string;
  company_name?: string;
  email?: string;
  errors: string[];
}

export interface LeadImportResult {
  success: boolean;
  message: string;
  created: number;
  failed: number;
  total_rows: number;
  errors: LeadImportError[];
}

interface LeadState {
  leads: Lead[];
  selectedLead: Lead | null;
  count: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  importing: boolean;
  error: any;
  detailError: any;
  saveError: any;
  importError: any;
  importResult: LeadImportResult | null;
}

const initialState: LeadState = {
  leads: [],
  selectedLead: null,
  count: 0,
  next: null,
  previous: null,
  loading: false,
  detailLoading: false,
  saving: false,
  importing: false,
  error: null,
  detailError: null,
  saveError: null,
  importError: null,
  importResult: null,
};

export type FetchLeadsParams = {
  lead_status?: string;
  created_date?: string;
  search?: string;
  ordering?: string;
  page?: number;
};

export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (params: FetchLeadsParams = {}, { rejectWithValue }) => {
    try {
      const cleanParams: Record<string, string | number> = {};

      if (params.lead_status) {
        cleanParams.lead_status = params.lead_status;
      }

      if (params.created_date) {
        cleanParams.created_date = params.created_date;
      }

      if (params.search) {
        const search = params.search.trim();

        if (search) {
          cleanParams.search = search;
        }
      }

      if (params.ordering) {
        cleanParams.ordering = params.ordering;
      }

      if (params.page) {
        cleanParams.page = params.page;
      }

      const response = await api.get("/leads/", {
        params: cleanParams,
      });

      return response.data;
    } catch (error: any) {
      console.error("Fetch leads error:", error?.response?.data || error);

      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to fetch leads",
        },
      );
    }
  },
);

export const fetchLeadById = createAsyncThunk(
  "leads/fetchLeadById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/leads/${id}/`);

      return response.data;
    } catch (error: any) {
      console.error("Fetch lead error:", error?.response?.data || error);

      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to fetch lead",
        },
      );
    }
  },
);

export const createLead = createAsyncThunk(
  "leads/createLead",
  async (leadData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/leads/", leadData);

      return response.data;
    } catch (error: any) {
      console.error("Create lead error:", error?.response?.data || error);

      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to create lead",
        },
      );
    }
  },
);

export const updateLead = createAsyncThunk(
  "leads/updateLead",
  async (
    {
      id,
      data,
    }: {
      id: number;
      data: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`/leads/${id}/`, data);

      return response.data;
    } catch (error: any) {
      console.error("Update lead error:", error?.response?.data || error);

      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to update lead",
        },
      );
    }
  },
);

export const deleteLead = createAsyncThunk(
  "leads/deleteLead",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/leads/${id}/`);

      return id;
    } catch (error: any) {
      console.error("Delete lead error:", error?.response?.data || error);

      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to delete lead",
        },
      );
    }
  },
);

export const importLeads = createAsyncThunk<
  LeadImportResult,
  File,
  { rejectValue: any }
>("leads/importLeads", async (file, { rejectWithValue }) => {
  try {
    if (!file) {
      return rejectWithValue({
        message: "Please select a CSV file.",
      });
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return rejectWithValue({
        message: "Only CSV files are supported.",
      });
    }

    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post("/leads/import/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Lead import error:", error?.response?.data || error);

    return rejectWithValue(
      error?.response?.data || {
        message: "Failed to import leads",
      },
    );
  }
});

const leadSlice = createSlice({
  name: "leads",
  initialState,

  reducers: {
    clearLeadError: (state) => {
      state.error = null;
    },

    clearSelectedLead: (state) => {
      state.selectedLead = null;
      state.detailError = null;
      state.saveError = null;
    },

    clearLeadDetailErrors: (state) => {
      state.detailError = null;
      state.saveError = null;
    },

    clearLeadImportResult: (state) => {
      state.importResult = null;
      state.importError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload;

        if (data && Array.isArray(data.results)) {
          state.leads = data.results;

          state.count =
            typeof data.count === "number" ? data.count : data.results.length;

          state.next = data.next || null;
          state.previous = data.previous || null;
        } else if (Array.isArray(data)) {
          state.leads = data;
          state.count = data.length;
          state.next = null;
          state.previous = null;
        } else {
          state.leads = [];
          state.count = 0;
          state.next = null;
          state.previous = null;
        }

        state.error = null;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || action.error.message || "Failed to fetch leads";

        state.leads = [];
        state.count = 0;
      })

      .addCase(fetchLeadById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detailError = null;

        const lead = action.payload as Lead;

        state.selectedLead = lead;

        const index = state.leads.findIndex((item) => item.id === lead.id);

        if (index !== -1) {
          state.leads[index] = lead;
        }
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.detailLoading = false;

        state.detailError =
          action.payload || action.error.message || "Failed to fetch lead";
      })

      .addCase(createLead.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.saving = false;
        state.error = null;

        if (action.payload) {
          state.leads.unshift(action.payload);
          state.count += 1;
        }
      })
      .addCase(createLead.rejected, (state, action) => {
        state.saving = false;

        state.error =
          action.payload || action.error.message || "Failed to create lead";
      })

      .addCase(updateLead.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.saving = false;
        state.saveError = null;

        const updatedLead = action.payload as Lead;

        const index = state.leads.findIndex(
          (lead) => lead.id === updatedLead.id,
        );

        if (index !== -1) {
          state.leads[index] = updatedLead;
        }

        if (state.selectedLead?.id === updatedLead.id) {
          state.selectedLead = updatedLead;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.saving = false;

        state.saveError =
          action.payload || action.error.message || "Failed to update lead";
      })

      .addCase(deleteLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.loading = false;

        const deletedId = action.payload;

        state.leads = state.leads.filter((lead) => lead.id !== deletedId);

        state.count = Math.max(0, state.count - 1);

        if (state.selectedLead?.id === deletedId) {
          state.selectedLead = null;
        }

        state.error = null;
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || action.error.message || "Failed to delete lead";
      })

      .addCase(importLeads.pending, (state) => {
        state.importing = true;
        state.importError = null;
        state.importResult = null;
      })
      .addCase(importLeads.fulfilled, (state, action) => {
        state.importing = false;
        state.importError = null;
        state.importResult = action.payload;
      })
      .addCase(importLeads.rejected, (state, action) => {
        state.importing = false;

        state.importError =
          action.payload || action.error.message || "Failed to import leads";
      });
  },
});

export const {
  clearLeadError,
  clearSelectedLead,
  clearLeadDetailErrors,
  clearLeadImportResult,
} = leadSlice.actions;

export default leadSlice.reducer;
