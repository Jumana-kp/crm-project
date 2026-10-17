import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/api/axios";

// User

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
}

// State

interface UsersState {
  users: User[];
  loading: boolean;
  error: any;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// Fetch users

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/");

      if (Array.isArray(response.data)) {
        return response.data;
      }

      if (Array.isArray(response.data?.results)) {
        return response.data.results;
      }

      return [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch users",
        },
      );
    }
  },
);

// Slice

const usersSlice = createSlice({
  name: "users",

  initialState,

  reducers: {
    // Clear error

    clearUsersError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // Fetch users

    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;

        state.users = Array.isArray(action.payload) ? action.payload : [];

        state.error = null;
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || action.error.message || "Failed to fetch users";

        state.users = [];
      });
  },
});

// Actions

export const { clearUsersError } = usersSlice.actions;

// Reducer

export default usersSlice.reducer;
