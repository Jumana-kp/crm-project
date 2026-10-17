import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import axiosInstance from "../../api/axios";

// =====================================================
// TYPES
// =====================================================

export type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

type NotificationsState = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  unreadLoading: boolean;
  readLoading: boolean;
  error: string | null;
};

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  unreadLoading: false,
  readLoading: false,
  error: null,
};

// =====================================================
// FETCH NOTIFICATIONS
// =====================================================

export const fetchNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>("notifications/fetchNotifications", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/notifications/");

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data?.results || [];
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to fetch notifications.",
    );
  }
});

// =====================================================
// FETCH UNREAD COUNT
// =====================================================

export const fetchUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("notifications/fetchUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/notifications/unread-count/");

    return Number(response.data?.unread_count ?? 0);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to fetch unread notification count.",
    );
  }
});

// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

export const markNotificationAsRead = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "notifications/markNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read/`);

      return notificationId;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to mark notification as read.",
      );
    }
  },
);

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

export const markAllNotificationsAsRead = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>(
  "notifications/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch("/notifications/read-all/");

      return Number(response.data?.updated_count ?? 0);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to mark all notifications as read.",
      );
    }
  },
);

// =====================================================
// SLICE
// =====================================================

const notificationsSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },

  extraReducers: (builder) => {
    // =================================================
    // FETCH NOTIFICATIONS
    // =================================================

    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch notifications.";
      });

    // =================================================
    // FETCH UNREAD COUNT
    // =================================================

    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.unreadLoading = true;
      })

      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadLoading = false;
        state.unreadCount = action.payload;
      })

      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.unreadLoading = false;
        state.error = action.payload || "Failed to fetch unread count.";
      });

    // =================================================
    // MARK ONE AS READ
    // =================================================

    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.readLoading = true;
        state.error = null;
      })

      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.readLoading = false;

        const notification = state.notifications.find(
          (item) => item.id === action.payload,
        );

        if (notification && !notification.is_read) {
          notification.is_read = true;

          if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })

      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.readLoading = false;
        state.error = action.payload || "Failed to mark notification as read.";
      });

    // =================================================
    // MARK ALL AS READ
    // =================================================

    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.readLoading = true;
        state.error = null;
      })

      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.readLoading = false;

        state.notifications = state.notifications.map((notification) => ({
          ...notification,
          is_read: true,
        }));

        state.unreadCount = 0;
      })

      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.readLoading = false;
        state.error =
          action.payload || "Failed to mark all notifications as read.";
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const { clearNotificationError, setUnreadCount } =
  notificationsSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default notificationsSlice.reducer;
