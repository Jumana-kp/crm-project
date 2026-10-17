import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axiosInstance from "@/api/axios";

/* =========================================================
   Types
========================================================= */

export type DealOwner = {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type DealLead = {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  country_code?: string;
  phone_number?: string;
  company_name?: string;
};

export type Deal = {
  id: number;

  deal_name: string;

  lead: DealLead | null;

  owners: DealOwner[];

  amount: string;

  stage: string;

  priority: string;

  close_date: string | null;

  description?: string;

  created_at?: string;

  updated_at?: string;
};
/* =========================================================
   Payload
========================================================= */

export type DealPayload = {
  deal_name: string;

  lead_id: number;

  owner_ids: number[];

  amount: string;

  stage: string;

  priority: string;

  close_date: string;

  description?: string;
};

/* =========================================================
   Filters
========================================================= */

export type DealFilters = {
  search?: string;
  owners?: number;
  stage?: string;
  close_date?: string;
  created_date?: string;
  page?: number;
};
/* =========================================================
   API Response
========================================================= */

type DealListResponse = {
  count: number;

  next: string | null;

  previous: string | null;

  results: Deal[];
};

/* =========================================================
   State
========================================================= */

interface DealState {
  deals: Deal[];

  selectedDeal: Deal | null;

  totalDeals: number;

  currentPage: number;

  totalPages: number;

  nextPage: string | null;

  previousPage: string | null;

  loading: boolean;

  detailLoading: boolean;

  saving: boolean;

  deleting: boolean;

  error: any;

  detailError: any;

  saveError: any;

  deleteError: any;
}

/* =========================================================
   Initial State
========================================================= */

const initialState: DealState = {
  deals: [],

  selectedDeal: null,

  totalDeals: 0,

  currentPage: 1,

  totalPages: 1,

  nextPage: null,

  previousPage: null,

  loading: false,

  detailLoading: false,

  saving: false,

  deleting: false,

  error: null,

  detailError: null,

  saveError: null,

  deleteError: null,
};

/* =========================================================
   Fetch Deals
========================================================= */

export const fetchDeals = createAsyncThunk(
  "deals/fetchDeals",

  async (filters: DealFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Search
      if (filters.search?.trim()) {
        params.append("search", filters.search.trim());
      }

      // Deal Owner
      if (filters.owners !== undefined && filters.owners !== null) {
        params.append("owners", String(filters.owners));
      }

      // Deal Stage
      if (filters.stage?.trim()) {
        params.append("stage", filters.stage.trim());
      }

      // Close Date
      if (filters.close_date?.trim()) {
        params.append("close_date", filters.close_date.trim());
      }

      // Created Date
      if (filters.created_date?.trim()) {
        params.append("created_date", filters.created_date.trim());
      }

      const page = filters.page && filters.page > 0 ? filters.page : 1;

      params.append("page", String(page));

      const url = `/deals/?${params.toString()}`;

      const response = await axiosInstance.get(url);

      return {
        ...response.data,
        requestedPage: page,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to fetch deals",
      );
    }
  },
);
/* =========================================================
   Fetch Deal By ID
========================================================= */

export const fetchDealById = createAsyncThunk(
  "deals/fetchDealById",

  async (dealId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/deals/${dealId}/`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to fetch deal",
      );
    }
  },
);

/* =========================================================
   Create Deal
========================================================= */

export const createDeal = createAsyncThunk(
  "deals/createDeal",

  async (dealData: DealPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/deals/", dealData);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || {
          message: error?.message || "Failed to create deal",
        },
      );
    }
  },
);
/* =========================================================
   Update Deal
========================================================= */

export const updateDeal = createAsyncThunk(
  "deals/updateDeal",

  async (
    {
      id,
      data,
    }: {
      id: number;
      data: Partial<DealPayload>;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.patch(`/deals/${id}/`, data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to update deal",
      );
    }
  },
);

/* =========================================================
   Delete Deal
========================================================= */

export const deleteDeal = createAsyncThunk(
  "deals/deleteDeal",

  async (dealId: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/deals/${dealId}/`);

      return dealId;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to delete deal",
      );
    }
  },
);

/* =========================================================
   Slice
========================================================= */

const dealSlice = createSlice({
  name: "deals",

  initialState,

  reducers: {
    clearSelectedDeal: (state) => {
      state.selectedDeal = null;
      state.detailError = null;
    },

    clearDealErrors: (state) => {
      state.error = null;

      state.detailError = null;

      state.saveError = null;

      state.deleteError = null;
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       Fetch Deals
    ===================================================== */

    builder
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const data = action.payload;

        if (!Array.isArray(data) && Array.isArray(data.results)) {
          state.deals = data.results;

          state.totalDeals = Number(data.count) || 0;

          state.nextPage = data.next;

          state.previousPage = data.previous;

          state.currentPage = data.requestedPage || 1;

          const PAGE_SIZE = 10;

          state.totalPages = Math.max(
            1,
            Math.ceil(state.totalDeals / PAGE_SIZE),
          );

          return;
        }

        if (Array.isArray(data)) {
          state.deals = data;

          state.totalDeals = data.length;

          state.totalPages = 1;

          state.currentPage = 1;

          state.nextPage = null;

          state.previousPage = null;

          return;
        }

        state.deals = [];
        state.totalDeals = 0;
        state.totalPages = 1;
        state.currentPage = 1;
        state.nextPage = null;
        state.previousPage = null;
      })

      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch deals";

        state.deals = [];

        state.totalDeals = 0;
      });

    /* =====================================================
       Fetch Deal
    ===================================================== */

    builder
      .addCase(fetchDealById.pending, (state) => {
        state.detailLoading = true;

        state.detailError = null;
      })

      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.detailLoading = false;

        state.detailError = null;

        const deal = action.payload as Deal;

        state.selectedDeal = deal;

        const index = state.deals.findIndex((item) => item.id === deal.id);

        if (index !== -1) {
          state.deals[index] = deal;
        }
      })

      .addCase(fetchDealById.rejected, (state, action) => {
        state.detailLoading = false;

        state.detailError = action.payload || "Failed to fetch deal";
      });

    /* =====================================================
       Create Deal
    ===================================================== */

    builder
      .addCase(createDeal.pending, (state) => {
        state.saving = true;

        state.saveError = null;
      })

      .addCase(createDeal.fulfilled, (state, action) => {
        state.saving = false;

        state.saveError = null;

        const deal = action.payload as Deal;

        if (deal) {
          state.deals.unshift(deal);

          state.totalDeals += 1;
        }
      })

      .addCase(createDeal.rejected, (state, action) => {
        state.saving = false;

        state.saveError = action.payload || "Failed to create deal";
      });

    /* =====================================================
       Update Deal
    ===================================================== */

    builder
      .addCase(updateDeal.pending, (state) => {
        state.saving = true;

        state.saveError = null;
      })

      .addCase(updateDeal.fulfilled, (state, action) => {
        state.saving = false;

        state.saveError = null;

        const updatedDeal = action.payload as Deal;

        if (!updatedDeal) {
          return;
        }

        const index = state.deals.findIndex(
          (deal) => deal.id === updatedDeal.id,
        );

        if (index !== -1) {
          state.deals[index] = updatedDeal;
        }

        if (state.selectedDeal?.id === updatedDeal.id) {
          state.selectedDeal = updatedDeal;
        }
      })

      .addCase(updateDeal.rejected, (state, action) => {
        state.saving = false;

        state.saveError = action.payload || "Failed to update deal";
      });

    /* =====================================================
       Delete Deal
    ===================================================== */

    builder
      .addCase(deleteDeal.pending, (state) => {
        state.deleting = true;

        state.deleteError = null;
      })

      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.deleting = false;

        state.deleteError = null;

        const deletedId = action.payload;

        state.deals = state.deals.filter((deal) => deal.id !== deletedId);

        state.totalDeals = Math.max(0, state.totalDeals - 1);

        if (state.selectedDeal?.id === deletedId) {
          state.selectedDeal = null;
        }
      })

      .addCase(deleteDeal.rejected, (state, action) => {
        state.deleting = false;

        state.deleteError = action.payload || "Failed to delete deal";
      });
  },
});

/* =========================================================
   Actions
========================================================= */

export const { clearSelectedDeal, clearDealErrors } = dealSlice.actions;

/* =========================================================
   Reducer
========================================================= */

export default dealSlice.reducer;
