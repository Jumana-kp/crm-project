import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import api from "@/api/axios";

/* =====================================================
   TYPES
===================================================== */

export interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

export type ActivityModule = "lead" | "deal" | "company" | "ticket";

/* =====================================================
   ACTIVITY
===================================================== */

export interface Activity {
  id: number;

  activity_type?: string | null;

  title?: string | null;
  content?: string | null;
  note?: string | null;

  subject?: string | null;
  body?: string | null;

  description?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  sent_at?: string | null;

  created_by?: User | number | null;
  sent_by?: User | number | null;

  // assigned_to?: User | number | null;
  assigned_to?: User | User[] | number | number[] | null;

  module?: string | null;
  module_id?: number | null;

  lead?: number | null;
  deal?: number | null;
  company?: number | null;
  ticket?: number | null;

  /* =====================
     TASK
  ===================== */

  task_name?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  status?: string | null;
  task_type?: string | null;
  priority?: string | null;

  /* =====================
     MEETING
  ===================== */

  start_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;

  attendees?: User[];

  location?: string | null;
  reminder?: string | null;

  /* =====================
     CALL
  ===================== */

  call_outcome?: string | null;
  call_date?: string | null;
  call_time?: string | null;
  duration?: number | null;
}

/* =====================================================
   TASK
===================================================== */

export interface Task {
  id: number;

  task_name: string;

  due_date?: string | null;
  due_time?: string | null;

  task_type?: string | null;
  priority?: string | null;
  status?: string | null;

  note?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  created_by?: User | number | null;

  // assigned_to?: User | number | null;

  // assigned_to_id?: number;
    assigned_to?: User[] | number[] | null;

  assigned_to_id?: number[];


  lead?: number | null;
  deal?: number | null;
  company?: number | null;
  ticket?: number | null;
}

/* =====================================================
   MEETING
===================================================== */

export interface Meeting {
  id: number;

  title: string;

  start_date: string;
  start_time: string;
  end_time: string;

  created_by?: User | number | null;

  attendees?: User[];

  location?: string | null;

  reminder?: string | null;
  note?: string | null;

  lead?: number | null;
  deal?: number | null;
  company?: number | null;
  ticket?: number | null;

  created_at?: string | null;
  updated_at?: string | null;
}

/* =====================================================
   CALL
===================================================== */

export interface Call {
  id: number;

  title?: string | null;

  call_outcome?: string | null;

  call_date?: string | null;

  call_time?: string | null;

  note?: string | null;

  duration?: number | null;

  call_sid?: string | null;

  call_status?: string | null;

  started_at?: string | null;

  ended_at?: string | null;

  created_at?: string | null;

  updated_at?: string | null;

  created_by?: User | number | null;

  lead?: number | null;
  deal?: number | null;
  company?: number | null;
  ticket?: number | null;
}

/* =====================================================
   CREATE NOTE DATA
===================================================== */

export interface CreateNoteData {
  title?: string;
  content: string;

  lead?: number;
  deal?: number;
  company?: number;
  ticket?: number;
}

/* =====================================================
   CREATE TASK DATA
===================================================== */

export interface CreateTaskData {
  task_name: string;

  due_date: string;
  due_time?: string;

  task_type: string;
  priority: string;

  assigned_to_id: number[];

  note?: string;

  lead?: number;
  deal?: number;
  company?: number;
  ticket?: number;
}

/* =====================================================
   UPDATE TASK DATA
===================================================== */

export interface UpdateTaskData {
  status?: string;

  task_name?: string;

  due_date?: string;
  due_time?: string;

  task_type?: string;
  priority?: string;

  assigned_to_id?: number;

  note?: string;
}

/* =====================================================
   CREATE MEETING DATA
===================================================== */

export interface CreateMeetingData {
  title: string;

  start_date: string;
  start_time: string;
  end_time: string;

  attendee_ids: number[];

  location?: string;
  reminder?: string;
  note?: string;

  lead?: number;
  deal?: number;
  company?: number;
  ticket?: number;
}

/* =====================================================
   EMAIL
===================================================== */

export interface EmailAttachment {
  id: number;

  email: number;

  file: string;

  created_at?: string | null;
}

export interface Email {
  id: number;

  sent_by?: User | number | null;

  lead?: number | null;
  deal?: number | null;
  company?: number | null;
  ticket?: number | null;

  recipients: string[];

  cc: string[];

  bcc: string[];

  subject: string;

  body: string;

  status: "draft" | "sent" | "failed";

  sent_at?: string | null;

  attachments?: EmailAttachment[];

  created_at?: string | null;

  updated_at?: string | null;
}

/* =====================================================
   CREATE EMAIL
===================================================== */

export interface CreateEmailData {
  recipients: string;

  cc?: string;

  bcc?: string;

  subject: string;

  body: string;

  lead?: number;
  deal?: number;
  company?: number;
  ticket?: number;

  selectedAttachmentIds?: number[];
}

/* =====================================================
   CREATE CALL
===================================================== */

export interface CreateCallData {
  call_outcome: string;

  call_date: string;

  call_time: string;

  note: string;

  lead?: number;

  deal?: number;

  company?: number;

  ticket?: number;

  duration?: number;
}

/* =====================================================
   INITIATE TWILIO CALL
===================================================== */

export interface InitiateTwilioCallData {
  phone_number: string;

  lead?: number;

  deal?: number;

  company?: number;

  ticket?: number;
}

/* =====================================================
   TWILIO RESPONSE
===================================================== */

export interface TwilioCallResponse {
  success: boolean;

  message: string;

  call_sid: string;

  status: string;

  to: string;

  from: string;

  call_id: number;

  lead?: number | null;

  deal?: number | null;

  company?: number | null;

  ticket?: number | null;

  voice_url?: string;
}

/* =====================================================
   STATE
===================================================== */

interface ActivityState {
  activities: Activity[];

  tasks: Task[];

  meetings: Meeting[];

  calls: Call[];

  emails: Email[];

  loading: boolean;

  tasksLoading: boolean;

  meetingsLoading: boolean;

  creating: boolean;

  updating: boolean;

  meetingCreating: boolean;

  callCreating: boolean;

  emailCreating: boolean;

  emailSending: boolean;

  error: string | null;

  createError: string | null;

  updateError: string | null;

  meetingCreateError: string | null;

  callCreateError: string | null;

  emailCreateError: string | null;

  emailSendError: string | null;

  currentModule: ActivityModule | null;

  currentModuleId: number | null;

  tasksFetchRequestId: string | null;

  meetingsFetchRequestId: string | null;

  tasksVersion: number;

  meetingsVersion: number;

  tasksFetchVersion: number;

  meetingsFetchVersion: number;
}

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState: ActivityState = {
  activities: [],

  tasks: [],

  meetings: [],

  calls: [],

  emails: [],

  loading: false,

  tasksLoading: false,

  meetingsLoading: false,

  creating: false,

  updating: false,

  meetingCreating: false,

  callCreating: false,

  emailCreating: false,

  emailSending: false,

  error: null,

  createError: null,

  updateError: null,

  meetingCreateError: null,

  callCreateError: null,

  emailCreateError: null,

  emailSendError: null,

  currentModule: null,

  currentModuleId: null,

  tasksFetchRequestId: null,

  meetingsFetchRequestId: null,

  tasksVersion: 0,

  meetingsVersion: 0,

  tasksFetchVersion: 0,

  meetingsFetchVersion: 0,
};

/* =====================================================
   HELPERS
===================================================== */

function getResults<T>(data: any): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

/* =====================================================
   ERROR HELPER
===================================================== */

function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  const data = error?.response?.data;

  if (data) {
    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return String(data.detail);
    }

    const firstKey = Object.keys(data)[0];

    if (firstKey && Array.isArray(data[firstKey])) {
      return String(data[firstKey][0]);
    }

    if (firstKey) {
      const value = data[firstKey];

      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      return String(value);
    }
  }

  return error?.message || "Something went wrong.";
}

/* =====================================================
   MODULE FILTER
===================================================== */

function belongsToCurrentModule(
  item: {
    lead?: number | null;
    deal?: number | null;
    company?: number | null;
    ticket?: number | null;
  },
  module: ActivityModule | null,
  moduleId: number | null,
): boolean {
  if (!module || moduleId === null) {
    return false;
  }

  return Number(item[module]) === Number(moduleId);
}

/* =====================================================
   CALL → ACTIVITY
===================================================== */

function callToActivity(call: Call): Activity {
  return {
    ...call,

    id: call.id,

    activity_type: "call",

    title: call.title || "Logged Call",

    content: call.note || "",

    note: call.note || "",

    call_outcome: call.call_outcome,

    call_date: call.call_date,

    call_time: call.call_time,

    duration: call.duration,

    created_by: call.created_by,

    lead: call.lead,

    deal: call.deal,

    company: call.company,

    ticket: call.ticket,

    created_at: call.created_at,

    updated_at: call.updated_at,
  };
}

/* =====================================================
   MEETING → ACTIVITY
===================================================== */

function meetingToActivity(meeting: Meeting): Activity {
  return {
    id: meeting.id,

    activity_type: "meeting",

    title: meeting.title,

    start_date: meeting.start_date,

    start_time: meeting.start_time,

    end_time: meeting.end_time,

    created_by: meeting.created_by,

    attendees: meeting.attendees,

    location: meeting.location,

    reminder: meeting.reminder,

    note: meeting.note,

    lead: meeting.lead,

    deal: meeting.deal,

    company: meeting.company,

    ticket: meeting.ticket,

    created_at: meeting.created_at,

    updated_at: meeting.updated_at,
  };
}

/* =====================================================
   TASK → ACTIVITY
===================================================== */

function taskToActivity(task: Task): Activity {
  return {
    id: task.id,

    activity_type: "task",

    title: task.task_name,

    content: task.note || "",

    note: task.note || "",

    task_name: task.task_name,

    due_date: task.due_date,

    due_time: task.due_time,

    task_type: task.task_type,

    priority: task.priority,

    status: task.status,

    created_by: task.created_by,

    assigned_to: task.assigned_to,

    lead: task.lead,

    deal: task.deal,

    company: task.company,

    ticket: task.ticket,

    created_at: task.created_at,

    updated_at: task.updated_at,
  };
}

/* =====================================================
   FETCH ACTIVITIES
===================================================== */

export const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",

  async (
    {
      module,
      moduleId,
    }: {
      module: ActivityModule;
      moduleId: number;
    },
    thunkAPI,
  ) => {
    try {
      /* =============================================
         FETCH ALL ACTIVITY TYPES

         IMPORTANT:
         Meetings and Tasks are now filtered
         directly by the backend.

         Examples:

         /meeting/?lead=10
         /meeting/?deal=5
         /meeting/?company=3
         /meeting/?ticket=7

         /tasks/?lead=10
         /tasks/?deal=5
         /tasks/?company=3
         /tasks/?ticket=7
      ============================================= */

      const [
        notesResponse,
        emailsResponse,
        callsResponse,
        meetingsResponse,
        tasksResponse,
      ] = await Promise.all([
        api.get("/notes/"),

        api.get("/emails/"),

        api.get("/calls/"),

        /* =========================================
           IMPORTANT MEETING FIX
        ========================================= */

        api.get("/meeting/", {
          params: {
            [module]: moduleId,
          },
        }),

        /* =========================================
           IMPORTANT TASK FIX
        ========================================= */

        api.get("/tasks/", {
          params: {
            [module]: moduleId,
          },
        }),
      ]);

      /* =============================================
         RAW DATA
      ============================================= */

      const notes = getResults<Activity>(notesResponse.data);

      const emails = getResults<Email>(emailsResponse.data);

      const calls = getResults<Call>(callsResponse.data);

      const meetings = getResults<Meeting>(meetingsResponse.data);

      const tasks = getResults<Task>(tasksResponse.data);

      /* =============================================
         FILTER CALLS
      ============================================= */

      const filteredCalls = calls.filter((call) =>
        belongsToCurrentModule(call, module, moduleId),
      );

      /* =============================================
         FILTER EMAILS
      ============================================= */

      const filteredEmails = emails.filter((email) =>
        belongsToCurrentModule(email, module, moduleId),
      );

      /* =============================================
         FILTER NOTES
      ============================================= */

      const filteredNotes = notes.filter((note) =>
        belongsToCurrentModule(note, module, moduleId),
      );

      /* =============================================
         FILTER MEETINGS

         Backend already filters meetings.

         This extra frontend filter is intentional
         as a safety check.
      ============================================= */

      const filteredMeetings = meetings.filter((meeting) =>
        belongsToCurrentModule(meeting, module, moduleId),
      );

      /* =============================================
         FILTER TASKS

         Backend already filters tasks.

         This extra frontend filter protects
         against unexpected backend responses.
      ============================================= */

      const filteredTasks = tasks.filter((task) =>
        belongsToCurrentModule(task, module, moduleId),
      );

      /* =============================================
         NOTE ACTIVITIES
      ============================================= */

      const noteActivities: Activity[] = filteredNotes.map(
        (item): Activity => ({
          ...item,

          activity_type: item.activity_type || "note",
        }),
      );

      /* =============================================
         EMAIL ACTIVITIES
      ============================================= */

      const emailActivities: Activity[] = filteredEmails.map(
        (item): Activity => ({
          ...item,

          activity_type: "email",

          title: item.subject,

          content: item.body,

          subject: item.subject,

          body: item.body,

          sent_by: item.sent_by,

          sent_at: item.sent_at,
        }),
      );

      /* =============================================
         CALL ACTIVITIES
      ============================================= */

      const callActivities: Activity[] = filteredCalls.map((call) =>
        callToActivity(call),
      );

      /* =============================================
         MEETING ACTIVITIES
      ============================================= */

      const meetingActivities: Activity[] = filteredMeetings.map((meeting) =>
        meetingToActivity(meeting),
      );

      /* =============================================
         TASK ACTIVITIES
      ============================================= */

      const taskActivities: Activity[] = filteredTasks.map((task) =>
        taskToActivity(task),
      );

      /* =============================================
         COMBINE EVERYTHING
      ============================================= */

      const activities: Activity[] = [
        ...noteActivities,

        ...emailActivities,

        ...callActivities,

        ...meetingActivities,

        ...taskActivities,
      ].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;

        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

        return dateB - dateA;
      });

      return {
        module,

        moduleId,

        activities,

        emails: filteredEmails,

        calls: filteredCalls,

        tasks: filteredTasks,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   FETCH TASKS
===================================================== */

export const fetchTasks = createAsyncThunk(
  "activities/fetchTasks",

  async (
    {
      module,
      moduleId,
    }: {
      module: ActivityModule;
      moduleId: number;
    },
    thunkAPI,
  ) => {
    try {
      /*
       * IMPORTANT:
       * Use backend filtering instead of:
       *
       * GET /tasks/
       * then filtering only the first page.
       */

      const response = await api.get("/tasks/", {
        params: {
          [module]: moduleId,
        },
      });

      const tasks = getResults<Task>(response.data);

      /*
       * Extra safety filter.
       */

      const filteredTasks = tasks.filter((task) =>
        belongsToCurrentModule(task, module, moduleId),
      );

      return {
        module,

        moduleId,

        tasks: filteredTasks,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   FETCH MEETINGS
===================================================== */

export const fetchMeetings = createAsyncThunk(
  "activities/fetchMeetings",

  async (
    {
      module,
      moduleId,
    }: {
      module: ActivityModule;
      moduleId: number;
    },
    thunkAPI,
  ) => {
    try {
      /*
       * IMPORTANT MEETING FIX
       *
       * Do NOT use:
       *
       * api.get("/meeting/")
       *
       * because that may return only the first
       * paginated page.
       *
       * Instead ask Django for meetings belonging
       * to the current entity.
       *
       * Examples:
       *
       * /meeting/?lead=10
       * /meeting/?deal=5
       * /meeting/?company=3
       * /meeting/?ticket=7
       */

      const response = await api.get("/meeting/", {
        params: {
          [module]: moduleId,
        },
      });

      const meetings = getResults<Meeting>(response.data);

      /*
       * Extra frontend safety filter.
       */

      const filteredMeetings = meetings.filter((meeting) =>
        belongsToCurrentModule(meeting, module, moduleId),
      );

      return {
        module,

        moduleId,

        meetings: filteredMeetings,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   CREATE NOTE
===================================================== */

export const createNote = createAsyncThunk(
  "activities/createNote",

  async (data: CreateNoteData, thunkAPI) => {
    try {
      const response = await api.post("/notes/", data);

      return response.data as Activity;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   CREATE TASK
===================================================== */

export const createTask = createAsyncThunk(
  "activities/createTask",

  async (data: CreateTaskData, thunkAPI) => {
    try {
      const response = await api.post("/tasks/", data);

      return response.data as Task;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   UPDATE TASK
===================================================== */

export const updateTask = createAsyncThunk(
  "activities/updateTask",

  async (
    {
      id,
      data,
    }: {
      id: number;
      data: UpdateTaskData;
    },
    thunkAPI,
  ) => {
    try {
      const response = await api.patch(`/tasks/${id}/`, data);

      return response.data as Task;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   CREATE MEETING
===================================================== */

export const createMeeting = createAsyncThunk(
  "activities/createMeeting",

  async (data: CreateMeetingData, thunkAPI) => {
    try {
      const response = await api.post("/meeting/", data);

      return response.data as Meeting;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   CREATE EMAIL
===================================================== */

export const createEmail = createAsyncThunk(
  "activities/createEmail",

  async (data: CreateEmailData, thunkAPI) => {
    try {
      const response = await api.post("/emails/", data);

      return response.data as Email;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   SEND EMAIL
===================================================== */

export const sendEmail = createAsyncThunk(
  "activities/sendEmail",

  async (emailId: number, thunkAPI) => {
    try {
      const response = await api.post(`/emails/${emailId}/send/`);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   CREATE / LOG CALL
===================================================== */

export const createCall = createAsyncThunk(
  "activities/createCall",

  async (data: CreateCallData, thunkAPI) => {
    try {
      const response = await api.post("/calls/", data);

      return response.data as Call;
    } catch (error) {
      console.error("Create call error:", error);

      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   INITIATE TWILIO CALL
===================================================== */

export const initiateTwilioCall = createAsyncThunk(
  "activities/initiateTwilioCall",

  async (data: InitiateTwilioCallData, thunkAPI) => {
    try {
      console.log("=================================");

      console.log("📞 INITIATING TWILIO CALL");

      console.log("Phone:", data.phone_number);

      console.log("Request:", data);

      console.log("=================================");

      const response = await api.post("/calls/twilio/", data);

      console.log("=================================");

      console.log("✅ TWILIO CALL SUCCESS");

      console.log("Response:", response.data);

      console.log("=================================");

      return response.data as TwilioCallResponse;
    } catch (error: any) {
      console.error("=================================");

      console.error("❌ TWILIO CALL FAILED");

      console.error("Error:", error);

      console.error("Response:", error?.response?.data);

      console.error("Status:", error?.response?.status);

      console.error("=================================");

      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =====================================================
   SLICE
===================================================== */

const activitySlice = createSlice({
  name: "activities",

  initialState,

  reducers: {
    /* ===============================================
       CLEAR ERRORS
    =============================================== */

    clearActivityError(state) {
      state.error = null;

      state.createError = null;

      state.updateError = null;

      state.meetingCreateError = null;

      state.callCreateError = null;

      state.emailCreateError = null;

      state.emailSendError = null;
    },

    /* ===============================================
       CLEAR ALL ACTIVITIES
    =============================================== */

    clearActivities(state) {
      state.activities = [];

      state.tasks = [];

      state.meetings = [];

      state.calls = [];

      state.emails = [];

      state.currentModule = null;

      state.currentModuleId = null;

      state.tasksFetchRequestId = null;

      state.meetingsFetchRequestId = null;

      state.tasksVersion = 0;

      state.meetingsVersion = 0;

      state.tasksFetchVersion = 0;

      state.meetingsFetchVersion = 0;
    },

    /* ===============================================
       CLEAR MEETINGS
    =============================================== */

    clearMeetings(state) {
      state.meetings = [];
    },

    /* ===============================================
       CLEAR CALLS
    =============================================== */

    clearCalls(state) {
      state.calls = [];
    },

    /* ===============================================
       CLEAR EMAILS
    =============================================== */

    clearEmails(state) {
      state.emails = [];
    },
  },

  extraReducers: (builder) => {
    /* =================================================
       FETCH ACTIVITIES
    ================================================= */

    builder

      .addCase(
        fetchActivities.pending,

        (state, action) => {
          state.loading = true;

          state.error = null;

          state.activities = [];

          state.emails = [];

          state.calls = [];

          state.currentModule = action.meta.arg.module;

          state.currentModuleId = action.meta.arg.moduleId;
        },
      )

      .addCase(
        fetchActivities.fulfilled,

        (state, action) => {
          state.loading = false;

          if (
            state.currentModule !== action.payload.module ||
            state.currentModuleId !== action.payload.moduleId
          ) {
            return;
          }

          state.activities = action.payload.activities;

          state.emails = action.payload.emails;

          state.calls = action.payload.calls;

          /*
           * Do NOT directly overwrite state.tasks
           * here because fetchTasks has its own
           * request/version protection.
           *
           * Meeting data also has its own
           * fetchMeetings protection.
           */
        },
      )

      .addCase(
        fetchActivities.rejected,

        (state, action) => {
          state.loading = false;

          state.error = String(action.payload || "Failed to load activities.");
        },
      );

    /* =================================================
       FETCH TASKS
    ================================================= */

    builder

      .addCase(
        fetchTasks.pending,

        (state, action) => {
          state.tasksLoading = true;

          state.error = null;

          state.tasksFetchRequestId = action.meta.requestId;

          state.tasksFetchVersion = state.tasksVersion;
        },
      )

      .addCase(
        fetchTasks.fulfilled,

        (state, action) => {
          state.tasksLoading = false;

          if (state.tasksFetchRequestId !== action.meta.requestId) {
            return;
          }

          if (
            state.currentModule !== action.payload.module ||
            state.currentModuleId !== action.payload.moduleId
          ) {
            return;
          }

          if (state.tasksVersion !== state.tasksFetchVersion) {
            return;
          }

          state.tasks = action.payload.tasks;
        },
      )

      .addCase(
        fetchTasks.rejected,

        (state, action) => {
          state.tasksLoading = false;

          if (state.tasksFetchRequestId !== action.meta.requestId) {
            return;
          }

          state.error = String(action.payload || "Failed to load tasks.");
        },
      );

    /* =================================================
       FETCH MEETINGS
    ================================================= */

    builder

      .addCase(
        fetchMeetings.pending,

        (state, action) => {
          state.meetingsLoading = true;

          state.error = null;

          state.meetingsFetchRequestId = action.meta.requestId;

          state.meetingsFetchVersion = state.meetingsVersion;
        },
      )

      .addCase(
        fetchMeetings.fulfilled,

        (state, action) => {
          state.meetingsLoading = false;

          if (state.meetingsFetchRequestId !== action.meta.requestId) {
            return;
          }

          if (
            state.currentModule !== action.payload.module ||
            state.currentModuleId !== action.payload.moduleId
          ) {
            return;
          }

          if (state.meetingsVersion !== state.meetingsFetchVersion) {
            return;
          }

          state.meetings = action.payload.meetings;
        },
      )

      .addCase(
        fetchMeetings.rejected,

        (state, action) => {
          state.meetingsLoading = false;

          if (state.meetingsFetchRequestId !== action.meta.requestId) {
            return;
          }

          state.error = String(action.payload || "Failed to load meetings.");
        },
      );

    /* =================================================
       CREATE NOTE
    ================================================= */

    builder

      .addCase(
        createNote.pending,

        (state) => {
          state.creating = true;

          state.createError = null;
        },
      )

      .addCase(
        createNote.fulfilled,

        (state, action) => {
          state.creating = false;

          const note = action.payload;

          if (!note) {
            return;
          }

          if (
            !belongsToCurrentModule(
              note,
              state.currentModule,
              state.currentModuleId,
            )
          ) {
            return;
          }

          state.activities.unshift({
            ...note,

            activity_type: note.activity_type || "note",
          });
        },
      )

      .addCase(
        createNote.rejected,

        (state, action) => {
          state.creating = false;

          state.createError = String(
            action.payload || "Failed to create note.",
          );
        },
      );

    /* =================================================
       CREATE TASK
    ================================================= */

    builder

      .addCase(
        createTask.pending,

        (state) => {
          state.creating = true;

          state.createError = null;
        },
      )

      .addCase(
        createTask.fulfilled,

        (state, action: PayloadAction<Task>) => {
          state.creating = false;

          const task = action.payload;

          if (!task) {
            return;
          }

          if (
            !belongsToCurrentModule(
              task,
              state.currentModule,
              state.currentModuleId,
            )
          ) {
            return;
          }

          /*
           * Increase version so an older fetch
           * cannot overwrite the newly-created task.
           */

          state.tasksVersion += 1;

          /* =========================================
             TASK TAB
          ========================================= */

          const index = state.tasks.findIndex(
            (existingTask) => existingTask.id === task.id,
          );

          if (index === -1) {
            state.tasks.unshift(task);
          } else {
            state.tasks[index] = task;
          }

          /* =========================================
             ACTIVITY TIMELINE
          ========================================= */

          const taskActivity = taskToActivity(task);

          const activityExists = state.activities.some(
            (activity) =>
              activity.id === taskActivity.id &&
              activity.activity_type === "task",
          );

          if (!activityExists) {
            state.activities.unshift(taskActivity);
          }
        },
      )

      .addCase(
        createTask.rejected,

        (state, action) => {
          state.creating = false;

          state.createError = String(
            action.payload || "Failed to create task.",
          );
        },
      );

    /* =================================================
       UPDATE TASK
    ================================================= */

    builder

      .addCase(
        updateTask.pending,

        (state) => {
          state.updating = true;

          state.updateError = null;
        },
      )

      .addCase(
        updateTask.fulfilled,

        (state, action: PayloadAction<Task>) => {
          state.updating = false;

          const updatedTask = action.payload;

          if (!updatedTask) {
            return;
          }

          state.tasksVersion += 1;

          /* =========================================
             UPDATE TASK TAB
          ========================================= */

          const index = state.tasks.findIndex(
            (task) => task.id === updatedTask.id,
          );

          if (index === -1) {
            if (
              belongsToCurrentModule(
                updatedTask,
                state.currentModule,
                state.currentModuleId,
              )
            ) {
              state.tasks.unshift(updatedTask);
            }
          } else {
            state.tasks[index] = updatedTask;
          }

          /* =========================================
             UPDATE ACTIVITY TIMELINE
          ========================================= */

          if (
            belongsToCurrentModule(
              updatedTask,
              state.currentModule,
              state.currentModuleId,
            )
          ) {
            const taskActivity = taskToActivity(updatedTask);

            const activityIndex = state.activities.findIndex(
              (activity) =>
                activity.id === updatedTask.id &&
                activity.activity_type === "task",
            );

            if (activityIndex === -1) {
              state.activities.unshift(taskActivity);
            } else {
              state.activities[activityIndex] = taskActivity;
            }
          }
        },
      )

      .addCase(
        updateTask.rejected,

        (state, action) => {
          state.updating = false;

          state.updateError = String(
            action.payload || "Failed to update task.",
          );
        },
      );

    /* =================================================
       CREATE MEETING
    ================================================= */

    builder

      .addCase(
        createMeeting.pending,

        (state) => {
          state.meetingCreating = true;

          state.meetingCreateError = null;
        },
      )

      .addCase(
        createMeeting.fulfilled,

        (state, action: PayloadAction<Meeting>) => {
          state.meetingCreating = false;

          const meeting = action.payload;

          if (!meeting) {
            return;
          }

          if (
            !belongsToCurrentModule(
              meeting,
              state.currentModule,
              state.currentModuleId,
            )
          ) {
            return;
          }

          /*
           * Increase version so an older fetch
           * cannot overwrite the newly-created
           * meeting.
           */

          state.meetingsVersion += 1;

          /* =========================================
             MEETINGS TAB
          ========================================= */

          const index = state.meetings.findIndex(
            (existingMeeting) => existingMeeting.id === meeting.id,
          );

          if (index === -1) {
            state.meetings.unshift(meeting);
          } else {
            state.meetings[index] = meeting;
          }

          /* =========================================
             ACTIVITY TIMELINE
          ========================================= */

          const meetingActivity = meetingToActivity(meeting);

          const activityExists = state.activities.some(
            (activity) =>
              activity.id === meetingActivity.id &&
              activity.activity_type === "meeting",
          );

          if (!activityExists) {
            state.activities.unshift(meetingActivity);
          }
        },
      )

      .addCase(
        createMeeting.rejected,

        (state, action) => {
          state.meetingCreating = false;

          state.meetingCreateError = String(
            action.payload || "Failed to create meeting.",
          );
        },
      );

    /* =================================================
       CREATE EMAIL
    ================================================= */

    builder

      .addCase(
        createEmail.pending,

        (state) => {
          state.emailCreating = true;

          state.emailCreateError = null;
        },
      )

      .addCase(
        createEmail.fulfilled,

        (state, action: PayloadAction<Email>) => {
          state.emailCreating = false;

          const email = action.payload;

          if (!email) {
            return;
          }

          if (
            !belongsToCurrentModule(
              email,
              state.currentModule,
              state.currentModuleId,
            )
          ) {
            return;
          }

          state.emails.unshift(email);

          state.activities.unshift({
            ...email,

            activity_type: "email",

            title: email.subject,

            content: email.body,

            subject: email.subject,

            body: email.body,
          });
        },
      )

      .addCase(
        createEmail.rejected,

        (state, action) => {
          state.emailCreating = false;

          state.emailCreateError = String(
            action.payload || "Failed to create email.",
          );
        },
      );

    /* =================================================
       SEND EMAIL
    ================================================= */

    builder

      .addCase(
        sendEmail.pending,

        (state) => {
          state.emailSending = true;

          state.emailSendError = null;
        },
      )

      .addCase(
        sendEmail.fulfilled,

        (state, action) => {
          state.emailSending = false;

          const emailId = action.payload?.email_id;

          if (!emailId) {
            return;
          }

          const email = state.emails.find((item) => item.id === emailId);

          if (email) {
            email.status = "sent";

            email.sent_at = new Date().toISOString();
          }

          const activity = state.activities.find(
            (item) => item.id === emailId && item.activity_type === "email",
          );

          if (activity) {
            activity.status = "sent";

            activity.sent_at = new Date().toISOString();
          }
        },
      )

      .addCase(
        sendEmail.rejected,

        (state, action) => {
          state.emailSending = false;

          state.emailSendError = String(
            action.payload || "Failed to send email.",
          );
        },
      );

    /* =================================================
       CREATE / LOG CALL
    ================================================= */

    builder

      .addCase(
        createCall.pending,

        (state) => {
          state.callCreating = true;

          state.callCreateError = null;
        },
      )

      .addCase(
        createCall.fulfilled,

        (state, action: PayloadAction<Call>) => {
          state.callCreating = false;

          const call = action.payload;

          if (!call) {
            return;
          }

          /* =========================================
             Only add call if it belongs to the
             currently opened entity.
          ========================================= */

          if (
            !belongsToCurrentModule(
              call,
              state.currentModule,
              state.currentModuleId,
            )
          ) {
            return;
          }

          /* =========================================
             CALL TAB
          ========================================= */

          const callIndex = state.calls.findIndex(
            (existingCall) => existingCall.id === call.id,
          );

          if (callIndex === -1) {
            state.calls.unshift(call);
          } else {
            state.calls[callIndex] = call;
          }

          /* =========================================
             ACTIVITY TAB
          ========================================= */

          const callActivity = callToActivity(call);

          const activityIndex = state.activities.findIndex(
            (activity) =>
              activity.id === call.id && activity.activity_type === "call",
          );

          if (activityIndex === -1) {
            state.activities.unshift(callActivity);
          } else {
            state.activities[activityIndex] = callActivity;
          }
        },
      )

      .addCase(
        createCall.rejected,

        (state, action) => {
          state.callCreating = false;

          state.callCreateError = String(
            action.payload || "Failed to create call.",
          );
        },
      );

    /* =================================================
       INITIATE TWILIO CALL
    ================================================= */

    builder

      .addCase(
        initiateTwilioCall.pending,

        (state) => {
          state.callCreating = true;

          state.callCreateError = null;
        },
      )

      .addCase(
        initiateTwilioCall.fulfilled,

        (state) => {
          state.callCreating = false;

          state.callCreateError = null;
        },
      )

      .addCase(
        initiateTwilioCall.rejected,

        (state, action) => {
          state.callCreating = false;

          state.callCreateError = String(
            action.payload || "Failed to initiate Twilio call.",
          );
        },
      );
  },
});

/* =====================================================
   ACTIONS
===================================================== */

export const {
  clearActivityError,
  clearActivities,
  clearMeetings,
  clearCalls,
  clearEmails,
} = activitySlice.actions;

/* =====================================================
   REDUCER
===================================================== */

export default activitySlice.reducer;
