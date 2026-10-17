import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api/axios";

export interface ConversionStage {
  key: string;
  label: string;
  count: number;
  value: number;
  color: string;
}

export interface TeamPerformance {
  id: number;
  name: string;
  active_deals: number;
  closed_deals: number;
  revenue: number;
  change: string;
  is_positive: boolean;
}

export interface SalesReport {
  label: string;
  year: number;
  actual: number;
  target: number;
}

export interface DashboardData {
  total_leads: number;
  active_deals: number;
  closed_deals: number;
  monthly_revenue: number;
  conversion_pipeline: ConversionStage[];
  team_performance: TeamPerformance[];
  sales_report: SalesReport[];
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk<
  DashboardData,
  string,
  { rejectValue: string }
>("dashboard/fetchDashboard", async (period, { rejectWithValue }) => {
  try {
    const response = await api.get(
      `/dashboard/?period=${period.toLowerCase()}`,
    );

    console.log("DASHBOARD API RESPONSE:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Dashboard API Error:", error);

    return rejectWithValue(
      error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to load dashboard",
    );
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,

  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load dashboard";
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;
