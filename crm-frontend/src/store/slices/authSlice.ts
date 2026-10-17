import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/api/axios";

/* =========================================================
   TYPES
========================================================= */

export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  country: string;
  industry_type: string;
  company_name: string;
  role: string;
}

export interface RegisteredUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
  confirm_password: string;
}

interface AuthState {
  user: RegisteredUser | null;
  loading: boolean;
  error: any;
  successMessage: string | null;
}

/* =========================================================
   RESTORE USER FROM LOCAL STORAGE
========================================================= */

function getStoredUser(): RegisteredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = localStorage.getItem("auth_user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser) as RegisteredUser;
  } catch {
    return null;
  }
}

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState: AuthState = {
  user: getStoredUser(),
  loading: false,
  error: null,
  successMessage: null,
};

/* =========================================================
   REGISTER
========================================================= */

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/register/", userData);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          message: "Registration failed",
        },
      );
    }
  },
);

/* =========================================================
   LOGIN
========================================================= */

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/login/", credentials);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          message: "Login failed",
        },
      );
    }
  },
);

/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/request-reset-password/", data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to send password reset link.",
        },
      );
    }
  },
);

/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/reset-password/", data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to reset password.",
        },
      );
    }
  },
);

/* =========================================================
   SLICE
========================================================= */

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /* -----------------------------------------------------
         CLEAR AUTH ERROR
      ----------------------------------------------------- */

    clearAuthError: (state) => {
      state.error = null;
    },

    /* -----------------------------------------------------
         CLEAR SUCCESS MESSAGE
      ----------------------------------------------------- */

    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },

    /* -----------------------------------------------------
         LOGOUT
         
         IMPORTANT:
         Only this action removes the
         stored login information.
      ----------------------------------------------------- */

    logoutUser: (state) => {
      state.user = null;
      state.error = null;
      state.successMessage = null;
      state.loading = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");

        localStorage.removeItem("refresh_token");

        localStorage.removeItem("auth_user");
      }
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
         REGISTER
      ===================================================== */

    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });

    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;

      state.user = action.payload.user;

      state.successMessage = action.payload.message;

      state.error = null;

      /*
       * Store user also after registration.
       */

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      }
    });

    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;

      state.error =
        action.payload || action.error.message || "Registration failed";

      state.successMessage = null;
    });

    /* =====================================================
         LOGIN
      ===================================================== */

    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.successMessage = action.payload.message || null;

      const { access, refresh, user } = action.payload;

      /*
       * Redux user
       */

      state.user = user;

      /*
       * Persist login information.
       */

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", access);

        localStorage.setItem("refresh_token", refresh);

        /*
         * IMPORTANT:
         * Store the logged-in user.
         *
         * This is what keeps the Navbar
         * user information after refresh.
         */

        localStorage.setItem("auth_user", JSON.stringify(user));
      }
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;

      state.error = action.payload || action.error.message || "Login failed";

      state.successMessage = null;
    });

    /* =====================================================
         FORGOT PASSWORD
      ===================================================== */

    builder.addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });

    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.successMessage =
        action.payload.message || "Password reset link sent successfully.";
    });

    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;

      state.error =
        action.payload || action.error.message || "Failed to send reset link.";

      state.successMessage = null;
    });

    /* =====================================================
         RESET PASSWORD
      ===================================================== */

    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });

    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.successMessage =
        action.payload.message || "Password reset successfully.";
    });

    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;

      state.error =
        action.payload || action.error.message || "Password reset failed.";

      state.successMessage = null;
    });
  },
});

export const { clearAuthError, clearSuccessMessage, logoutUser } =
  authSlice.actions;

export default authSlice.reducer;
