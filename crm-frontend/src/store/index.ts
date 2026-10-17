import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";

import companyReducer from "./slices/companySlice";

import usersReducer from "./slices/userSlice";
import leadReducer from "./slices/leadSlice";
import dealReducer from "./slices/dealSlice";
import ticketReducer from "./slices/ticketSlice";

import activityReducer from "./slices/activitySlice";
import dashboardReducer from "./slices/dashboardSlice";
import attachmentReducer from "./slices/attachmentSlice";
import notificationsReducer from "./slices/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companyReducer,
    users: usersReducer,
    leads: leadReducer,
    deals: dealReducer,
    tickets: ticketReducer,
    activities: activityReducer,
    dashboard: dashboardReducer,
    attachments: attachmentReducer,
    notifications: notificationsReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
// function attachmentReducer(state: unknown, action: UnknownAction): unknown {
//   throw new Error("Function not implemented.");
// }
