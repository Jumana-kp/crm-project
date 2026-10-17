"use client";

import { useEffect, useMemo, useState } from "react";

import dayjs, { Dayjs } from "dayjs";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

import SearchBar from "../list-page/SearchBar";

import NotesForm from "../forms/NotesForm";
import MeetingForm from "../forms/MeetingForm";
import TaskForm from "../forms/TaskForm";
import EmailForm from "../forms/EmailForm";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  createNote,
  createTask,
  createMeeting,
  fetchActivities,
  fetchTasks,
  fetchMeetings,
  updateTask,
  createEmail,
  sendEmail,
  initiateTwilioCall,
} from "@/store/slices/activitySlice";

import { uploadAttachment } from "@/store/slices/attachmentSlice";

import type {
  Activity,
  ActivityModule,
  Task,
  Meeting,
  CreateMeetingData,
  CreateEmailData,
} from "@/store/slices/activitySlice";

import { fetchUsers } from "@/store/slices/userSlice";

import type { User } from "@/store/slices/userSlice";

import axiosInstance from "@/api/axios";

/* =====================================================
   TYPES
===================================================== */

type TimelineType = "Note" | "Email" | "Call" | "Task" | "Meeting";

interface TimelineItem {
  id: string;
  type: TimelineType;
  title: string;
  description: string;
  timestamp: string;
  sortDate: string;
  activity?: Activity;
  task?: Task;
  meeting?: Meeting;
}

interface EmailFormValues {
  recipients: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  attachments: File[];
  selectedAttachmentIds?: number[];
}

type CallActivity = Activity & {
  call_outcome?: string | null;
  call_time?: string | null;
};

/* =====================================================
   TABS
===================================================== */

const TABS = ["Activity", "Notes", "Emails", "Calls", "Tasks", "Meetings"];

/* =====================================================
   ACTION BUTTON LABELS
===================================================== */

const ACTION_BUTTON_LABELS: Record<string, string> = {
  Notes: "Create Note",
  Emails: "Create Email",
  Calls: "Make Phone Call",
  Tasks: "Create Task",
  Meetings: "Create Meeting",
};

/* =====================================================
   PROPS
===================================================== */

type ActivityTimeLineProps = {
  module: ActivityModule;
  moduleId: number;
  activitiesAvailable?: boolean;
  convertButton?: React.ReactNode;
  onMakeCall?: () => void;
  allowedAttendeeIds?: number[];
};

/* =====================================================
   TIMELINE HELPERS
===================================================== */

function getTimelineDate(item: TimelineItem) {
  const date = dayjs(item.sortDate);

  return date.isValid() ? date : null;
}

/* =====================================================
   UPCOMING
===================================================== */

function isUpcomingTimelineItem(item: TimelineItem) {
  const date = getTimelineDate(item);

  if (!date) {
    return false;
  }

  const now = dayjs();

  if (item.type === "Task") {
    return item.task?.status !== "completed" && date.isAfter(now);
  }

  if (item.type === "Meeting") {
    return date.isAfter(now);
  }

  return false;
}

/* =====================================================
   MONTH / YEAR
===================================================== */

function getMonthYearLabel(item: TimelineItem) {
  const date = getTimelineDate(item);

  if (!date) {
    return "Unknown Date";
  }

  return date.format("MMMM YYYY");
}

/* =====================================================
   COMPONENT
===================================================== */
export default function ActivityTimeLine({
  module,
  moduleId,
  activitiesAvailable = true,
  convertButton,
  onMakeCall,
  allowedAttendeeIds = [],
}: ActivityTimeLineProps) {
  const dispatch = useAppDispatch();

  /* =================================================
     REDUX
  ================================================= */

  const {
    activities,
    tasks,
    meetings,

    loading,
    tasksLoading,
    meetingsLoading,

    creating,
    updating,
    meetingCreating,

    createError,
    updateError,
    meetingCreateError,
  } = useAppSelector((state) => state.activities);

  const { users } = useAppSelector((state) => state.users);
  const adminIds = users
    .filter((user) => String(user.role).toLowerCase() === "admin")
    .map((user) => Number(user.id))
    .filter((id) => Number.isFinite(id) && id > 0);

  const eligibleAttendeeIds = Array.from(
    new Set([...allowedAttendeeIds, ...adminIds]),
  );
  const taskAssignedUsers = users.filter((user) =>
    eligibleAttendeeIds.includes(Number(user.id)),
  );
  /* =================================================
     UI STATE
  ================================================= */

  const [tabValue, setTabValue] = useState(0);

  const [search, setSearch] = useState("");

  /* =================================================
     NOTE STATE
  ================================================= */

  const [openNoteForm, setOpenNoteForm] = useState(false);

  const [noteValue, setNoteValue] = useState("");

  /* =================================================
     TASK STATE
  ================================================= */

  const [openTaskForm, setOpenTaskForm] = useState(false);

  const [taskName, setTaskName] = useState("");

  const [dueDate, setDueDate] = useState<Dayjs | null>(null);

  const [dueTime, setDueTime] = useState<Dayjs | null>(null);

  const [taskType, setTaskType] = useState("");

  const [priority, setPriority] = useState("");

  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  const [taskNote, setTaskNote] = useState("");

  /* =================================================
     MEETING STATE
  ================================================= */

  const [openMeetingForm, setOpenMeetingForm] = useState(false);

  /* =================================================
     EMAIL STATE
  ================================================= */

  const [emailOpen, setEmailOpen] = useState(false);

  /* =================================================
     TWILIO CALL STATE
  ================================================= */

  const [callOpen, setCallOpen] = useState(false);

  const [callPhoneNumber, setCallPhoneNumber] = useState("");

  const [callLoading, setCallLoading] = useState(false);

  const [callSuccess, setCallSuccess] = useState("");

  const [callError, setCallError] = useState("");

  /* =================================================
     MODULE PAYLOAD
  ================================================= */

  const modulePayload = useMemo(
    () => ({
      [module]: moduleId,
    }),
    [module, moduleId],
  );

  /* =================================================
     FETCH ACTIVITIES
  ================================================= */

  useEffect(() => {
    if (!activitiesAvailable) {
      return;
    }

    if (!moduleId || !Number.isInteger(moduleId) || moduleId <= 0) {
      return;
    }

    dispatch(
      fetchActivities({
        module,
        moduleId,
      }),
    );

    dispatch(
      fetchTasks({
        module,
        moduleId,
      }),
    );

    dispatch(
      fetchMeetings({
        module,
        moduleId,
      }),
    );
  }, [module, moduleId, activitiesAvailable, dispatch]);

  /* =================================================
     FETCH USERS
  ================================================= */

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [users.length, dispatch]);

  /* =================================================
     UNIQUE USERS
  ================================================= */

  const uniqueUsers = useMemo(() => {
    const map = new Map<number, User>();

    users.forEach((user) => {
      if (user && !map.has(user.id)) {
        map.set(user.id, user);
      }
    });

    return Array.from(map.values());
  }, [users]);

  /* =================================================
     USER NAME
  ================================================= */

  // const getUserName = (
  //   assigned:
  //     | Task["assigned_to"]
  //     | Activity["assigned_to"]
  //     | User
  //     | number
  //     | null
  //     | undefined,
  // ) => {
  //   if (!assigned) {
  //     return "Unknown User";
  //   }

  //   if (typeof assigned === "object") {
  //     const name = `${assigned.first_name || ""} ${
  //       assigned.last_name || ""
  //     }`.trim();

  //     return name || assigned.email || "Unknown User";
  //   }

  //   const user = uniqueUsers.find((item) => item.id === Number(assigned));

  //   if (!user) {
  //     return "Unknown User";
  //   }

  //   const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();

  //   return name || user.email || "Unknown User";
  // };

  const getUserName = (
    assigned:
      | Task["assigned_to"]
      | Activity["assigned_to"]
      | User
      | number
      | null
      | undefined,
  ) => {
    if (!assigned) {
      return "Unknown User";
    }

    if (Array.isArray(assigned)) {
      const names = assigned.map((user) => {
        if (typeof user === "number") {
          const foundUser = uniqueUsers.find((item) => item.id === user);

          if (!foundUser) {
            return "Unknown User";
          }

          const name = `${foundUser.first_name || ""} ${
            foundUser.last_name || ""
          }`.trim();

          return name || foundUser.email || "Unknown User";
        }

        const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();

        return name || user.email || "Unknown User";
      });

      return names.join(", ");
    }

    if (typeof assigned === "object") {
      const name = `${assigned.first_name || ""} ${
        assigned.last_name || ""
      }`.trim();

      return name || assigned.email || "Unknown User";
    }

    const user = uniqueUsers.find((item) => item.id === Number(assigned));

    if (!user) {
      return "Unknown User";
    }

    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();

    return name || user.email || "Unknown User";
  };

  /* =================================================
     TASK DATE TIME
  ================================================= */

  const getTaskDateTime = (task: Task) => {
    if (!task.due_date) {
      return null;
    }

    const dateTime = dayjs(`${task.due_date} ${task.due_time || "00:00:00"}`);

    return dateTime.isValid() ? dateTime : null;
  };

  /* =================================================
     MEETING DATE TIME
  ================================================= */

  const getMeetingDateTime = (meeting: Meeting) => {
    if (!meeting.start_date) {
      return null;
    }

    const dateTime = dayjs(
      `${meeting.start_date} ${meeting.start_time || "00:00:00"}`,
    );

    return dateTime.isValid() ? dateTime : null;
  };

  /* =================================================
     ACTIVITY TYPE
  ================================================= */

  const getActivityType = (activity: Activity): TimelineType => {
    const type = (activity.activity_type || "").toLowerCase();

    if (type.includes("meeting")) {
      return "Meeting";
    }

    if (type.includes("email")) {
      return "Email";
    }

    if (type.includes("call")) {
      return "Call";
    }

    if (type.includes("task") || activity.task_name) {
      return "Task";
    }

    return "Note";
  };

  /* =================================================
     CREATOR NAME
  ================================================= */

  const getCreatorName = (activity: Activity) => {
    if (getActivityType(activity) === "Email") {
      if (activity.sent_by) {
        return getUserName(activity.sent_by);
      }

      return "Unknown User";
    }

    if (activity.created_by) {
      return getUserName(activity.created_by);
    }

    return "Unknown User";
  };

  /* =================================================
     ACTIVITY TITLE
  ================================================= */

  const getActivityTitle = (activity: Activity) => {
    const type = getActivityType(activity);

    const creator = getCreatorName(activity);

    switch (type) {
      case "Meeting":
        return activity.title || `Meeting by ${creator}`;

      case "Email":
        return activity.subject
          ? `Logged Email - ${activity.subject} by ${creator}`
          : `Logged Email by ${creator}`;

      case "Call":
        return `Call from ${creator}`;

      case "Task":
        return activity.task_name || `Task by ${creator}`;

      default:
        return `Note by ${creator}`;
    }
  };

  /* =================================================
     ACTIVITY DESCRIPTION
  ================================================= */

  const getActivityDescription = (activity: Activity) => {
    const type = getActivityType(activity);

    if (type === "Email") {
      return activity.body || activity.content || activity.description || "";
    }

    return (
      activity.content ||
      activity.note ||
      activity.description ||
      activity.body ||
      ""
    );
  };

  /* =================================================
     NORMAL ACTIVITY ITEMS
  ================================================= */

  const activityItems = useMemo(() => {
    return activities
      .map((activity): TimelineItem => {
        const createdDate = activity.created_at
          ? dayjs(activity.created_at)
          : dayjs();

        const type = getActivityType(activity);

        return {
          id: `${type.toLowerCase()}-${activity.id}`,

          type,

          title: getActivityTitle(activity),

          description: getActivityDescription(activity),

          timestamp: createdDate.format("MMM D, YYYY [at] h:mm A"),

          sortDate: createdDate.toISOString(),

          activity,
        };
      })
      .filter(
        (item) =>
          item.type === "Note" || item.type === "Email" || item.type === "Call",
      );
  }, [activities, uniqueUsers]);

  /* =================================================
     TASK ITEMS
  ================================================= */

  const taskItems = useMemo(() => {
    return tasks.map((task): TimelineItem => {
      const dateTime = getTaskDateTime(task);

      const assignedName = getUserName(task.assigned_to);

      return {
        id: `task-${task.id}`,

        type: "Task",

        title: `Task assigned to ${assignedName}`,

        description: task.note || "",

        timestamp: dateTime
          ? dateTime.format("MMM D, YYYY [at] h:mm A")
          : task.created_at
            ? dayjs(task.created_at).format("MMM D, YYYY [at] h:mm A")
            : "-",

        sortDate: dateTime
          ? dateTime.toISOString()
          : task.created_at || new Date().toISOString(),

        task,
      };
    });
  }, [tasks, uniqueUsers]);

  /* =================================================
     MEETING ITEMS
  ================================================= */

  const meetingItems = useMemo(() => {
    return meetings.map((meeting): TimelineItem => {
      const dateTime = getMeetingDateTime(meeting);

      return {
        id: `meeting-${meeting.id}`,

        type: "Meeting",

        title: meeting.title || "Meeting",

        description: meeting.note || "",

        timestamp: dateTime
          ? dateTime.format("MMM D, YYYY [at] h:mm A")
          : meeting.created_at
            ? dayjs(meeting.created_at).format("MMM D, YYYY [at] h:mm A")
            : "-",

        sortDate: dateTime
          ? dateTime.toISOString()
          : meeting.created_at || new Date().toISOString(),

        meeting,
      };
    });
  }, [meetings]);

  /* =================================================
     ALL TIMELINE
  ================================================= */

  const allTimeline = useMemo(() => {
    return [...activityItems, ...taskItems, ...meetingItems].sort(
      (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime(),
    );
  }, [activityItems, taskItems, meetingItems]);

  /* =================================================
     SEARCH
  ================================================= */

  const filteredTimeline = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return allTimeline;
    }

    return allTimeline.filter((item) => {
      const task = item.task;

      const meeting = item.meeting;

      const attendeeNames = Array.isArray(meeting?.attendees)
        ? meeting.attendees
            .map((attendee) =>
              `${attendee.first_name ?? ""} ${attendee.last_name ?? ""}`.trim(),
            )
            .join(" ")
            .toLowerCase()
        : "";

      return (
        item.title.toLowerCase().includes(value) ||
        item.description.toLowerCase().includes(value) ||
        item.type.toLowerCase().includes(value) ||
        task?.task_name?.toLowerCase().includes(value) ||
        meeting?.title?.toLowerCase().includes(value) ||
        meeting?.location?.toLowerCase().includes(value) ||
        attendeeNames.includes(value)
      );
    });
  }, [allTimeline, search]);

  /* =================================================
     CURRENT TAB ITEMS
  ================================================= */

  const tabItems = useMemo(() => {
    const current = TABS[tabValue];

    if (current === "Activity") {
      return filteredTimeline;
    }

    const typeMap: Record<string, TimelineType> = {
      Notes: "Note",
      Emails: "Email",
      Calls: "Call",
      Tasks: "Task",
      Meetings: "Meeting",
    };

    const targetType = typeMap[current];

    return filteredTimeline.filter((item) => item.type === targetType);
  }, [filteredTimeline, tabValue]);

  /* =================================================
     UPCOMING
  ================================================= */

  const upcomingItems = useMemo(() => {
    if (TABS[tabValue] !== "Activity") {
      return [];
    }

    return tabItems
      .filter(isUpcomingTimelineItem)
      .sort(
        (a, b) =>
          new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime(),
      );
  }, [tabItems, tabValue]);

  /* =================================================
     GROUPED TIMELINE
  ================================================= */

  const groupedTimeline = useMemo(() => {
    if (TABS[tabValue] !== "Activity") {
      return [];
    }

    const pastItems = tabItems.filter((item) => !isUpcomingTimelineItem(item));

    const groups = new Map<string, TimelineItem[]>();

    pastItems.forEach((item) => {
      const label = getMonthYearLabel(item);

      if (!groups.has(label)) {
        groups.set(label, []);
      }

      groups.get(label)!.push(item);
    });

    return Array.from(groups.entries());
  }, [tabItems, tabValue]);

  /* =================================================
     RESET TASK FORM
  ================================================= */

  const resetTaskForm = () => {
    setTaskName("");

    setDueDate(null);

    setDueTime(null);

    setTaskType("");

    setPriority("");

    setAssignedTo([]);

    setTaskNote("");
  };

  /* =================================================
     SAVE NOTE
  ================================================= */

  const handleSaveNote = async () => {
    if (!activitiesAvailable) {
      return;
    }

    if (!noteValue.trim()) {
      return;
    }

    try {
      await dispatch(
        createNote({
          title: "Note",

          content: noteValue,

          ...modulePayload,
        }),
      ).unwrap();

      setNoteValue("");

      setOpenNoteForm(false);

      await dispatch(
        fetchActivities({
          module,
          moduleId,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  /* =================================================
     CREATE TASK
  ================================================= */

  const handleCreateTask = async () => {
    if (!activitiesAvailable) {
      return;
    }

    if (
      !taskName.trim() ||
      !dueDate ||
      !taskType ||
      !priority ||
      assignedTo.length === 0
    ) {
      return;
    }

    try {
      await dispatch(
        createTask({
          task_name: taskName.trim(),

          due_date: dueDate.format("YYYY-MM-DD"),

          due_time: dueTime ? dueTime.format("HH:mm:ss") : "",

          task_type: taskType,

          priority,

          assigned_to_id: assignedTo.map(Number),

          note: taskNote,

          ...modulePayload,
        }),
      ).unwrap();

      resetTaskForm();

      setOpenTaskForm(false);

      await dispatch(
        fetchTasks({
          module,
          moduleId,
        }),
      ).unwrap();

      await dispatch(
        fetchActivities({
          module,
          moduleId,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  /* =================================================
     SAVE MEETING
  ================================================= */

  const handleSaveMeeting = async (data?: CreateMeetingData) => {
    if (!activitiesAvailable) {
      return;
    }

    if (!data) {
      console.error("MeetingForm did not provide meeting data.");

      return;
    }

    try {
      await dispatch(
        createMeeting({
          ...data,

          ...modulePayload,
        }),
      ).unwrap();

      setOpenMeetingForm(false);

      await dispatch(
        fetchMeetings({
          module,
          moduleId,
        }),
      ).unwrap();

      await dispatch(
        fetchActivities({
          module,
          moduleId,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to create meeting:", error);
    }
  };

  /* =================================================
     SAVE EMAIL
  ================================================= */

  const handleEmailSave = (data: EmailFormValues) => {
    const emailData: CreateEmailData = {
      recipients: data.recipients
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)
        .join(","),

      cc: data.cc
        ? data.cc
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean)
            .join(",")
        : "",

      bcc: data.bcc
        ? data.bcc
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean)
            .join(",")
        : "",

      subject: data.subject,

      body: data.body,

      selectedAttachmentIds: data.selectedAttachmentIds,
    };

    if (module === "lead") {
      emailData.lead = moduleId;
    }

    if (module === "deal") {
      emailData.deal = moduleId;
    }

    if (module === "company") {
      emailData.company = moduleId;
    }

    if (module === "ticket") {
      emailData.ticket = moduleId;
    }

    dispatch(createEmail(emailData));
  };

  /* =================================================
     TOGGLE TASK
  ================================================= */

  const handleTaskToggle = async (task: Task) => {
    if (!activitiesAvailable) {
      return;
    }

    try {
      await dispatch(
        updateTask({
          id: task.id,

          data: {
            status: task.status === "completed" ? "pending" : "completed",
          },
        }),
      ).unwrap();

      await dispatch(
        fetchTasks({
          module,
          moduleId,
        }),
      ).unwrap();

      await dispatch(
        fetchActivities({
          module,
          moduleId,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  /* =================================================
     OPEN CALL DIALOG
  ================================================= */

  const handleOpenCall = () => {
    setCallError("");

    setCallSuccess("");

    setCallOpen(true);
  };

  /* =================================================
     CLOSE CALL DIALOG
  ================================================= */

  const handleCloseCall = () => {
    if (callLoading) {
      return;
    }

    setCallOpen(false);

    setCallPhoneNumber("");

    setCallError("");

    setCallSuccess("");
  };

  /* =================================================
   MAKE TWILIO CALL
===================================================== */

  const handleMakeCall = async () => {
    const phoneNumber = callPhoneNumber.trim();

    /* ===============================================
     VALIDATE PHONE NUMBER
  =============================================== */

    if (!phoneNumber) {
      setCallError("Please enter a phone number.");
      return;
    }

    /* ===============================================
     START LOADING
  =============================================== */

    setCallLoading(true);
    setCallError("");
    setCallSuccess("");

    try {
      /* =============================================
       DEBUG - START CALL
    ============================================= */

      console.log("=================================");
      console.log("📞 STARTING TWILIO CALL");
      console.log("Phone Number:", phoneNumber);
      console.log("Module:", module);
      console.log("Module ID:", moduleId);
      console.log("Module Payload:", modulePayload);
      console.log("=================================");

      /* =============================================
       CALL DJANGO TWILIO ENDPOINT

       POST /api/v1/calls/twilio/

       Example Lead:
       {
         phone_number: "+971547422454",
         lead: 10
       }
    ============================================= */

      const result = await dispatch(
        initiateTwilioCall({
          phone_number: phoneNumber,
          ...modulePayload,
        }),
      ).unwrap();

      /* =============================================
       SUCCESS
    ============================================= */

      console.log("=================================");
      console.log("✅ TWILIO CALL STARTED");
      console.log("Twilio Response:", result);
      console.log("=================================");

      setCallSuccess("Call started successfully.");

      /* =============================================
       REFRESH ACTIVITIES
    ============================================= */

      await dispatch(
        fetchActivities({
          module,
          moduleId,
        }),
      ).unwrap();

      /* =============================================
       CLOSE DIALOG AFTER SUCCESS
    ============================================= */

      setTimeout(() => {
        setCallOpen(false);
        setCallPhoneNumber("");
        setCallSuccess("");
      }, 1200);
    } catch (error: any) {
      /* =============================================
       DETAILED ERROR
    ============================================= */

      console.error("=================================");
      console.error("❌ TWILIO CALL FAILED");
      console.error("RAW ERROR:", error);
      console.error("ERROR TYPE:", typeof error);
      console.error("ERROR JSON:", JSON.stringify(error, null, 2));
      console.error("=================================");

      /* =============================================
       SHOW ERROR IN DIALOG
    ============================================= */

      const message =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.detail ||
            error?.error ||
            "Unable to initiate Twilio call.";

      setCallError(message);
    } finally {
      /* =============================================
       STOP LOADING
    ============================================= */

      setCallLoading(false);
    }
  };

  /* =================================================
     CURRENT TAB
  ================================================= */

  const currentTab = TABS[tabValue];

  /* =================================================
     CREATE ACTION
  ================================================= */

  const handleCreateAction = () => {
    if (!activitiesAvailable) {
      return;
    }

    switch (currentTab) {
      case "Notes":
        setOpenNoteForm(true);
        break;

      case "Emails":
        setEmailOpen(true);
        break;

      case "Calls":
        onMakeCall?.();
        break;

      case "Tasks":
        setOpenTaskForm(true);
        break;

      case "Meetings":
        setOpenMeetingForm(true);
        break;

      default:
        break;
    }
  };

  /* =================================================
     LOADING
  ================================================= */

  const isLoading = loading || tasksLoading || meetingsLoading;

  /* =================================================
     TAB CREATE BUTTON
  ================================================= */

  const renderTabCreateButton = () => {
    if (currentTab === "Activity") {
      return null;
    }

    const isCallButton = currentTab === "Calls";

    const isBusy =
      creating || updating || meetingCreating || (isCallButton && callLoading);

    return (
      <Button
        variant="contained"
        onClick={handleCreateAction}
        disabled={isBusy}
        disableElevation
        startIcon={
          isCallButton && !isBusy ? (
            <PhoneOutlinedIcon sx={{ fontSize: 17 }} />
          ) : undefined
        }
        sx={{
          minWidth:
            currentTab === "Calls"
              ? 150
              : currentTab === "Meetings"
                ? 124
                : currentTab === "Emails"
                  ? 108
                  : currentTab === "Notes"
                    ? 104
                    : 104,

          height: 36,

          px: 2,

          borderRadius: "8px",

          textTransform: "none",

          fontSize: 12,

          fontWeight: 600,

          lineHeight: 1,

          bgcolor: "#5B4DDE",

          color: "#FFFFFF",

          boxShadow: "none",

          "&:hover": {
            bgcolor: "#4B3FD0",

            boxShadow: "none",
          },

          "&:disabled": {
            opacity: 0.6,
          },

          flexShrink: 0,
        }}
      >
        {isBusy ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          ACTION_BUTTON_LABELS[currentTab]
        )}
      </Button>
    );
  };

  /* =================================================
     TAB HEADING
  ================================================= */

  const renderTabHeading = () => {
    if (currentTab === "Activity") {
      return null;
    }

    return (
      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          justifyContent: "space-between",

          width: "100%",

          mb: 2,

          mt: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 15,

            fontWeight: 600,

            color: "text.primary",
          }}
        >
          {currentTab}
        </Typography>

        {renderTabCreateButton()}
      </Box>
    );
  };

  /* =================================================
     RENDER
  ================================================= */

  return (
    <Box
      sx={{
        width: "100%",

        minWidth: 0,

        p: 0,

        m: 0,
      }}
    >
      {/* =================================================
          SEARCH + CONVERT
      ================================================= */}

      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          width: "100%",

          minHeight: 50,

          mb: 1.5,

          gap: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,

            minWidth: 0,
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search activities"
            fullWidth
          />
        </Box>

        {activitiesAvailable && convertButton}
      </Box>

      {/* =================================================
          TABS
      ================================================= */}

      <Tabs
        value={tabValue}
        onChange={(_event, value) => setTabValue(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: "1px solid",

          borderColor: "divider",

          mb: 0,

          "& .MuiTab-root": {
            textTransform: "none",

            fontSize: 14,

            minWidth: 90,

            fontWeight: 500,
          },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab} label={tab} />
        ))}
      </Tabs>

      {/* =================================================
          ACTIVITIES NOT AVAILABLE
      ================================================= */}

      {!activitiesAvailable ? (
        <EmptyState text="Activities are currently not available for Leads" />
      ) : (
        <>
          {renderTabHeading()}

          {/* =================================================
              ERRORS
          ================================================= */}

          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}

          {meetingCreateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {meetingCreateError}
            </Alert>
          )}

          {updateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updateError}
            </Alert>
          )}

          {/* =================================================
              CALL SUCCESS
          ================================================= */}

          {callSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {callSuccess}
            </Alert>
          )}

          {/* =================================================
              CONTENT
          ================================================= */}

          {isLoading ? (
            <LoadingState />
          ) : currentTab === "Activity" ? (
            <ActivityGroupedTimeline
              upcomingItems={upcomingItems}
              groupedTimeline={groupedTimeline}
              getUserName={getUserName}
              onTaskToggle={handleTaskToggle}
            />
          ) : tabItems.length === 0 ? (
            <EmptyState text={`No ${currentTab} Found`} />
          ) : (
            <Box>
              {tabItems.map((item) => {
                if (item.type === "Task") {
                  return (
                    <TaskAccordion
                      key={item.id}
                      task={item.task!}
                      userName={getUserName(item.task!.assigned_to)}
                      onToggle={handleTaskToggle}
                      showTaskInfo={true}
                    />
                  );
                }

                if (item.type === "Meeting") {
                  return (
                    <MeetingAccordion
                      key={item.id}
                      meeting={item.meeting!}
                      item={item}
                      showMeetingInfo={true}
                    />
                  );
                }

                if (item.type === "Call") {
                  return <CallAccordion key={item.id} item={item} />;
                }

                return <ActivityAccordion key={item.id} item={item} />;
              })}
            </Box>
          )}

          {/* =================================================
              NOTE FORM
          ================================================= */}

          <NotesForm
            open={openNoteForm}
            value={noteValue}
            onChange={setNoteValue}
            onClose={() => {
              setOpenNoteForm(false);

              setNoteValue("");
            }}
            onSave={handleSaveNote}
          />

          {/* =================================================
              TASK FORM
          ================================================= */}

          <TaskForm
            open={openTaskForm}
            taskName={taskName}
            dueDate={dueDate}
            dueTime={dueTime}
            taskType={taskType}
            priority={priority}
            assignedTo={assignedTo}
            note={taskNote}
            users={taskAssignedUsers}
            onTaskNameChange={setTaskName}
            onDueDateChange={setDueDate}
            onDueTimeChange={setDueTime}
            onTaskTypeChange={setTaskType}
            onPriorityChange={setPriority}
            onAssignedToChange={setAssignedTo}
            onNoteChange={setTaskNote}
            onClose={() => {
              resetTaskForm();
              setOpenTaskForm(false);
            }}
            onSave={handleCreateTask}
          />
          {/* =================================================
              EMAIL FORM
          ================================================= */}

          <EmailForm
            open={emailOpen}
            onClose={() => setEmailOpen(false)}
            type={module}
            id={moduleId}
            onSave={async (data) => {
              try {
                /* ==========================================
                   1. Upload NEW files
                ========================================== */

                const uploadedAttachments = await Promise.all(
                  data.attachments.map((file) =>
                    dispatch(
                      uploadAttachment({
                        file,

                        type: module,

                        id: moduleId,
                      }),
                    ).unwrap(),
                  ),
                );

                /* ==========================================
                   2. NEW attachment IDs
                ========================================== */

                const uploadedAttachmentIds = uploadedAttachments
                  .map((attachment) => attachment.id)
                  .filter(
                    (attachmentId): attachmentId is number =>
                      typeof attachmentId === "number",
                  );

                /* ==========================================
                   3. Combine existing + new IDs
                ========================================== */

                const selectedAttachmentIds = [
                  ...(data.selectedAttachmentIds ?? []),

                  ...uploadedAttachmentIds,
                ];

                /* ==========================================
                   4. Create email
                ========================================== */

                const result = await dispatch(
                  createEmail({
                    recipients: data.recipients,

                    cc: data.cc,

                    bcc: data.bcc,

                    subject: data.subject,

                    body: data.body,

                    selectedAttachmentIds,

                    [module]: moduleId,
                  }),
                ).unwrap();

                /* ==========================================
                   5. Send email
                ========================================== */

                await dispatch(sendEmail(result.id)).unwrap();

                /* ==========================================
                   6. Refresh timeline
                ========================================== */

                await dispatch(
                  fetchActivities({
                    module,

                    moduleId,
                  }),
                ).unwrap();

                setEmailOpen(false);
              } catch (error) {
                console.error("EMAIL SENDING FAILED:", error);
              }
            }}
          />

          {/* =================================================
              MEETING FORM
          ================================================= */}
          <MeetingForm
            open={openMeetingForm}
            onClose={() => setOpenMeetingForm(false)}
            onSave={handleSaveMeeting}
            allowedAttendeeIds={eligibleAttendeeIds}
          />

          {/* =================================================
              TWILIO CALL DIALOG
          ================================================= */}

          <Dialog
            open={callOpen}
            onClose={handleCloseCall}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle
              sx={{
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Make Phone Call
            </DialogTitle>

            <DialogContent>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  mb: 2,
                }}
              >
                Enter the phone number you want to call.
              </Typography>

              <TextField
                fullWidth
                autoFocus
                label="Phone Number"
                placeholder="+971501234567"
                value={callPhoneNumber}
                onChange={(event) => setCallPhoneNumber(event.target.value)}
                disabled={callLoading}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();

                    handleMakeCall();
                  }
                }}
                error={Boolean(callError)}
                helperText={
                  callError || "Use international format, e.g. +971501234567"
                }
                sx={{
                  mt: 1,
                }}
              />

              {callSuccess && (
                <Alert
                  severity="success"
                  sx={{
                    mt: 2,
                  }}
                >
                  {callSuccess}
                </Alert>
              )}
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                pb: 2,
              }}
            >
              <Button
                onClick={handleCloseCall}
                disabled={callLoading}
                sx={{
                  textTransform: "none",
                  color: "text.secondary",
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={handleMakeCall}
                disabled={callLoading || !callPhoneNumber.trim()}
                disableElevation
                startIcon={
                  callLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PhoneOutlinedIcon
                      sx={{
                        fontSize: 18,
                      }}
                    />
                  )
                }
                sx={{
                  minWidth: 120,
                  height: 36,
                  borderRadius: "8px",
                  textTransform: "none",
                  bgcolor: "#5B4DDE",
                  "&:hover": {
                    bgcolor: "#4B3FD0",
                  },
                }}
              >
                {callLoading ? "Calling..." : "Call Now"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

/* =====================================================
   ACTIVITY GROUPED TIMELINE
===================================================== */

function ActivityGroupedTimeline({
  upcomingItems,
  groupedTimeline,
  getUserName,
  onTaskToggle,
}: {
  upcomingItems: TimelineItem[];

  groupedTimeline: [string, TimelineItem[]][];

  getUserName: (
    assigned:
      | Task["assigned_to"]
      | Activity["assigned_to"]
      | User
      | number
      | null
      | undefined,
  ) => string;

  onTaskToggle: (task: Task) => void;
}) {
  const hasUpcoming = upcomingItems.length > 0;

  const hasGroupedItems = groupedTimeline.length > 0;

  if (!hasUpcoming && !hasGroupedItems) {
    return <EmptyState text="No Activity Found" />;
  }

  return (
    <Box>
      {/* =================================================
          UPCOMING
      ================================================= */}

      {hasUpcoming && (
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 600,
              color: "text.primary",
              mb: 1.5,
            }}
          >
            Upcoming
          </Typography>

          {upcomingItems.map((item) => {
            if (item.type === "Task") {
              return (
                <UpcomingTaskItem
                  key={item.id}
                  task={item.task!}
                  userName={getUserName(item.task!.assigned_to)}
                  onToggle={onTaskToggle}
                />
              );
            }

            if (item.type === "Meeting") {
              return (
                <MeetingAccordion
                  key={item.id}
                  meeting={item.meeting!}
                  item={item}
                  showMeetingInfo={true}
                />
              );
            }

            return null;
          })}
        </Box>
      )}

      {/* =================================================
          MONTH GROUPS
      ================================================= */}

      {groupedTimeline.map(([monthYear, items]) => (
        <Box
          key={monthYear}
          sx={{
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 600,
              color: "text.primary",
              mb: 1.5,
            }}
          >
            {monthYear}
          </Typography>

          {items.map((item) => {
            if (item.type === "Task") {
              return (
                <TaskAccordion
                  key={item.id}
                  task={item.task!}
                  userName={getUserName(item.task!.assigned_to)}
                  onToggle={onTaskToggle}
                  showTaskInfo={true}
                />
              );
            }

            if (item.type === "Meeting") {
              return (
                <MeetingAccordion
                  key={item.id}
                  meeting={item.meeting!}
                  item={item}
                  showMeetingInfo={true}
                />
              );
            }

            if (item.type === "Call") {
              return <CallAccordion key={item.id} item={item} />;
            }

            return <ActivityAccordion key={item.id} item={item} />;
          })}
        </Box>
      ))}
    </Box>
  );
}

/* =====================================================
   UPCOMING TASK
===================================================== */

function UpcomingTaskItem({
  task,
  userName,
  onToggle,
}: {
  task: Task;

  userName: string;

  onToggle: (task: Task) => void;
}) {
  const dateTime = getTaskDateTimeStatic(task);

  return (
    <Box
      sx={{
        display: "flex",

        alignItems: "center",

        width: "100%",

        minHeight: 58,

        px: 1,

        py: 1,

        mb: 1,

        border: "1px solid",

        borderColor: "divider",

        borderRadius: "12px",

        gap: 1,
      }}
    >
      <Checkbox
        size="small"
        checked={false}
        onChange={() => onToggle(task)}
        sx={{
          p: 0.5,

          flexShrink: 0,

          "& .MuiSvgIcon-root": {
            fontSize: 21,
          },
        }}
      />

      <Box
        sx={{
          flex: 1,

          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,

            fontWeight: 500,

            color: "text.primary",

            overflow: "hidden",

            textOverflow: "ellipsis",

            whiteSpace: "nowrap",
          }}
        >
          Task assigned to{" "}
          <Box
            component="span"
            sx={{
              fontWeight: 600,
            }}
          >
            {userName}
          </Box>
        </Typography>

        <Typography
          sx={{
            fontSize: 13,

            color: "text.secondary",

            mt: 0.25,

            overflow: "hidden",

            textOverflow: "ellipsis",

            whiteSpace: "nowrap",
          }}
        >
          {task.task_name}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: 12,

          color: "text.secondary",

          whiteSpace: "nowrap",

          flexShrink: 0,

          display: {
            xs: "none",
            sm: "block",
          },
        }}
      >
        {dateTime ? dateTime.format("MMM D, YYYY [at] h:mm A") : "-"}
      </Typography>
    </Box>
  );
}

/* =====================================================
   ACTIVITY ACCORDION
===================================================== */

function sanitizeRichText(value: string) {
  if (typeof window === "undefined") {
    return value;
  }

  const template = document.createElement("template");

  template.innerHTML = value;

  template.content
    .querySelectorAll("script, style, iframe, object, embed, form")
    .forEach((element) => element.remove());

  template.content.querySelectorAll<HTMLElement>("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith("on")) {
        element.removeAttribute(attribute.name);
      }
    });

    if (
      (element.tagName === "A" || element.tagName === "IMG") &&
      (element.getAttribute("href") || element.getAttribute("src"))?.startsWith(
        "javascript:",
      )
    ) {
      element.removeAttribute(element.tagName === "A" ? "href" : "src");
    }
  });

  return template.innerHTML;
}

/* =====================================================
   RICH TEXT
===================================================== */

function RichTextContent({ value }: { value?: string }) {
  const content = value?.trim() || "-";

  return (
    <Box
      sx={{
        fontSize: 13,

        color: "text.secondary",

        lineHeight: 1.7,

        "& p": {
          margin: "6px 0",
        },

        "& strong": {
          fontWeight: 700,
        },

        "& em": {
          fontStyle: "italic",
        },

        "& u": {
          textDecoration: "underline",
        },

        "& h1": {
          fontSize: 26,
          fontWeight: 700,
          margin: "10px 0",
        },

        "& h2": {
          fontSize: 20,
          fontWeight: 600,
          margin: "8px 0",
        },

        "& ul, & ol": {
          paddingLeft: "24px",
          margin: "6px 0",
        },

        "& li": {
          marginBottom: "4px",
        },

        "& a": {
          color: "primary.main",
          textDecoration: "underline",
        },

        "& img": {
          maxWidth: "100%",
          height: "auto",
        },
      }}
      dangerouslySetInnerHTML={{
        __html: sanitizeRichText(content),
      }}
    />
  );
}

/* =====================================================
   ACTIVITY ACCORDION
===================================================== */

function ActivityAccordion({ item }: { item: TimelineItem }) {
  return (
    <Accordion
      elevation={0}
      defaultExpanded
      sx={{
        border: "1px solid",

        borderColor: "divider",

        mb: 1.5,

        borderRadius: "12px !important",

        "&:before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 58,

          "& .MuiAccordionSummary-expandIconWrapper": {
            order: -1,

            mr: 1,
          },

          "& .MuiAccordionSummary-content": {
            my: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",

            width: "100%",

            gap: 2,

            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,

              fontWeight: 500,

              color: "text.primary",

              overflow: "hidden",

              textOverflow: "ellipsis",

              whiteSpace: "nowrap",
            }}
          >
            {item.title}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,

              color: "text.secondary",

              whiteSpace: "nowrap",

              flexShrink: 0,

              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            {item.timestamp}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          pt: 0,

          pb: 2,

          pl: {
            xs: 3,
            sm: 6,
          },

          pr: 2,
        }}
      >
        <RichTextContent value={item.description} />
      </AccordionDetails>
    </Accordion>
  );
}

/* =====================================================
   CALL ACCORDION
===================================================== */

function CallAccordion({ item }: { item: TimelineItem }) {
  const call = item.activity as CallActivity | undefined;

  return (
    <Accordion
      elevation={0}
      defaultExpanded={false}
      sx={{
        border: "1px solid",

        borderColor: "divider",

        mb: 1.5,

        borderRadius: "12px !important",

        "&:before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 58,

          "& .MuiAccordionSummary-expandIconWrapper": {
            order: -1,

            mr: 1,
          },

          "& .MuiAccordionSummary-content": {
            my: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

            width: "100%",

            minWidth: 0,

            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,

              fontWeight: 500,

              color: "text.primary",

              overflow: "hidden",

              textOverflow: "ellipsis",

              whiteSpace: "nowrap",

              minWidth: 0,
            }}
          >
            {item.title}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,

              color: "text.secondary",

              whiteSpace: "nowrap",

              flexShrink: 0,
            }}
          >
            {item.timestamp}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          pt: 0,

          pb: 2,

          pl: {
            xs: 3,
            sm: 6,
          },

          pr: 2,
        }}
      >
        {/* =================================================
    CALL DETAILS
================================================= */}

        <Box
          sx={{
            backgroundColor: "#F8F9FC",
            borderRadius: 2,
            p: 2,
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2,
            }}
          >
            {/* OUTCOME */}

            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  mb: 0.5,
                }}
              >
                Outcome
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {formatCallOutcome(call?.call_outcome)}
              </Typography>
            </Box>

            {/* DURATION */}

            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  mb: 0.5,
                }}
              >
                Duration
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {call?.duration != null ? `${call.duration} seconds` : "-"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* NOTE */}

        <Box>
          <Typography
            sx={{
              fontSize: 11,
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            Note
          </Typography>

          {item.description ? (
            <RichTextContent value={item.description} />
          ) : (
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              No notes added.
            </Typography>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

/* =====================================================
   CALL OUTCOME
===================================================== */

function formatCallOutcome(value?: string | null) {
  if (!value) {
    return "-";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =====================================================
   MEETING ACCORDION
===================================================== */

function MeetingAccordion({
  meeting,
  item,
  showMeetingInfo,
}: {
  meeting: Meeting;

  item: TimelineItem;

  showMeetingInfo: boolean;
}) {
  const dateTime = getMeetingDateTimeStatic(meeting);

  const duration = getMeetingDurationStatic(meeting);

  const attendeeCount = Array.isArray(meeting.attendees)
    ? meeting.attendees.length
    : 0;

  const organizer = getMeetingCreatorName(meeting);

  const attendeeNames = Array.isArray(meeting.attendees)
    ? meeting.attendees
        .map((attendee) =>
          `${attendee.first_name ?? ""} ${attendee.last_name ?? ""}`.trim(),
        )
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <Accordion
      elevation={0}
      defaultExpanded
      sx={{
        border: "1px solid",

        borderColor: "divider",

        mb: 1.5,

        borderRadius: "12px !important",

        "&:before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 58,

          "& .MuiAccordionSummary-expandIconWrapper": {
            order: -1,

            mr: 1,
          },

          "& .MuiAccordionSummary-content": {
            my: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",

            width: "100%",

            gap: 2,

            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,

              fontWeight: 500,

              color: "text.primary",

              overflow: "hidden",

              textOverflow: "ellipsis",

              whiteSpace: "nowrap",
            }}
          >
            Meeting{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 600,
              }}
            >
              {attendeeNames || meeting.title || "Meeting"}
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: 12,

              color: "text.secondary",

              whiteSpace: "nowrap",

              flexShrink: 0,

              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            {item.timestamp}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          pt: 0,

          pb: 2,

          pl: {
            xs: 3,
            sm: 6,
          },

          pr: 2,
        }}
      >
        {showMeetingInfo && (
          <Box
            sx={{
              bgcolor: "#F1F5F9",

              borderRadius: 1,

              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1.2fr 1fr 1fr",
              },

              gap: 2,

              p: 1.5,

              mb: 1.5,
            }}
          >
            <MeetingInfo
              icon={
                <CalendarTodayOutlinedIcon
                  sx={{
                    fontSize: 15,
                  }}
                />
              }
              label="Date & Time"
              value={
                dateTime ? dateTime.format("MMM D, YYYY [at] h:mm A") : "-"
              }
            />

            <MeetingInfo
              icon={
                <AccessTimeOutlinedIcon
                  sx={{
                    fontSize: 15,
                  }}
                />
              }
              label="Duration"
              value={duration}
            />

            <MeetingInfo
              icon={
                <PeopleOutlineOutlinedIcon
                  sx={{
                    fontSize: 15,
                  }}
                />
              }
              label="Attendees"
              value={String(attendeeCount)}
            />
          </Box>
        )}

        {showMeetingInfo && organizer && (
          <Typography
            sx={{
              fontSize: 12,

              color: "text.secondary",

              mb: 1,
            }}
          >
            Organized by{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 600,

                color: "text.primary",
              }}
            >
              {organizer}
            </Box>
          </Typography>
        )}

        {showMeetingInfo && meeting.location && (
          <Typography
            sx={{
              fontSize: 12,

              color: "text.secondary",

              mb: 1,
            }}
          >
            Location: {meeting.location}
          </Typography>
        )}

        <RichTextContent value={item.description ?? meeting.note ?? ""} />
      </AccordionDetails>
    </Accordion>
  );
}

/* =====================================================
   MEETING INFO
===================================================== */

function MeetingInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          gap: 0.5,

          mb: 0.25,

          color: "text.secondary",
        }}
      >
        {icon}

        <Typography
          sx={{
            fontSize: 10,

            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: 12,

          fontWeight: 600,

          color: "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* =====================================================
   TASK ACCORDION
===================================================== */

function TaskAccordion({
  task,
  userName,
  onToggle,
  showTaskInfo,
}: {
  task: Task;

  userName: string;

  onToggle: (task: Task) => void;

  showTaskInfo: boolean;
}) {
  const completed = task.status === "completed";

  const dateTime = getTaskDateTimeStatic(task);

  const overdue = isOverdueStatic(task);

  return (
    <Accordion
      elevation={0}
      defaultExpanded
      sx={{
        border: "1px solid",

        borderColor: "divider",

        mb: 1.5,

        borderRadius: "12px !important",

        "&:before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 58,

          "& .MuiAccordionSummary-expandIconWrapper": {
            order: -1,

            mr: 1,
          },

          "& .MuiAccordionSummary-content": {
            my: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            width: "100%",

            gap: 1,

            minWidth: 0,
          }}
        >
          <Checkbox
            size="small"
            checked={completed}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggle(task)}
            sx={{
              p: 0.5,

              flexShrink: 0,

              "& .MuiSvgIcon-root": {
                fontSize: 20,
              },
            }}
          />

          <Box
            sx={{
              flex: 1,

              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: 14,

                fontWeight: 500,

                color: completed ? "text.disabled" : "text.primary",

                textDecoration: completed ? "line-through" : "none",

                overflow: "hidden",

                textOverflow: "ellipsis",

                whiteSpace: "nowrap",
              }}
            >
              Task assigned to{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                }}
              >
                {userName}
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: 13,

                color: "text.secondary",

                mt: 0.5,

                overflow: "hidden",

                textOverflow: "ellipsis",

                whiteSpace: "nowrap",
              }}
            >
              {task.task_name}
            </Typography>
          </Box>

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "flex",
              },

              alignItems: "center",

              gap: 0.5,

              whiteSpace: "nowrap",

              flexShrink: 0,
            }}
          >
            <CalendarTodayOutlinedIcon
              sx={{
                fontSize: 14,

                color: overdue ? "error.main" : "text.secondary",
              }}
            />

            <Typography
              sx={{
                fontSize: 12,

                color: overdue ? "error.main" : "text.secondary",

                fontWeight: overdue ? 500 : 400,
              }}
            >
              {overdue ? "Overdue: " : ""}

              {dateTime ? dateTime.format("MMM D, YYYY [at] h:mm A") : "-"}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          pt: 0,

          pb: 2,

          pl: {
            xs: 3,
            sm: 7,
          },

          pr: 2,
        }}
      >
        {showTaskInfo && (
          <Box
            sx={{
              bgcolor: "#F1F5F9",

              borderRadius: 1,

              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1.2fr 1fr 1fr",
              },

              gap: 2,

              p: 1.5,

              mb: 1.5,
            }}
          >
            <TaskInfo
              label="Due Date & Time"
              value={
                dateTime ? dateTime.format("MMM D, YYYY [at] h:mm A") : "-"
              }
            />

            <TaskInfo
              label="Priority"
              value={formatPriority(task.priority ?? undefined)}
            />

            <TaskInfo
              label="Type"
              value={formatTaskType(task.task_type ?? undefined)}
            />
          </Box>
        )}

        {task.note && <RichTextContent value={task.note} />}
      </AccordionDetails>
    </Accordion>
  );
}

/* =====================================================
   TASK INFO
===================================================== */

function TaskInfo({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 10,

          color: "text.secondary",

          mb: 0.25,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 12,

          fontWeight: 600,

          color: "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* =====================================================
   TASK DATE
===================================================== */

function getTaskDateTimeStatic(task: Task) {
  if (!task.due_date) {
    return null;
  }

  const dateTime = dayjs(`${task.due_date} ${task.due_time || "00:00:00"}`);

  return dateTime.isValid() ? dateTime : null;
}

/* =====================================================
   MEETING DATE
===================================================== */

function getMeetingDateTimeStatic(meeting: Meeting) {
  if (!meeting.start_date) {
    return null;
  }

  const dateTime = dayjs(
    `${meeting.start_date} ${meeting.start_time || "00:00:00"}`,
  );

  return dateTime.isValid() ? dateTime : null;
}

/* =====================================================
   MEETING DURATION
===================================================== */

function getMeetingDurationStatic(meeting: Meeting) {
  if (!meeting.start_time || !meeting.end_time) {
    return "-";
  }

  const start = dayjs(`2000-01-01 ${meeting.start_time}`);

  const end = dayjs(`2000-01-01 ${meeting.end_time}`);

  if (!start.isValid() || !end.isValid()) {
    return "-";
  }

  let minutes = end.diff(start, "minute");

  if (minutes < 0) {
    minutes += 24 * 60;
  }

  const hours = Math.floor(minutes / 60);

  const remaining = minutes % 60;

  if (hours > 0 && remaining > 0) {
    return `${hours} hr ${remaining} min`;
  }

  if (hours > 0) {
    return `${hours} hr`;
  }

  return `${remaining} min`;
}

/* =====================================================
   MEETING CREATOR
===================================================== */

function getMeetingCreatorName(meeting: Meeting) {
  const creator = meeting.created_by;

  if (!creator) {
    return "";
  }

  if (typeof creator === "object") {
    const name = `${creator.first_name || ""} ${
      creator.last_name || ""
    }`.trim();

    return name || creator.email || "";
  }

  return "";
}

/* =====================================================
   OVERDUE
===================================================== */

function isOverdueStatic(task: Task) {
  if (task.status === "completed") {
    return false;
  }

  const dateTime = getTaskDateTimeStatic(task);

  if (!dateTime) {
    return false;
  }

  return dateTime.isBefore(dayjs());
}

/* =====================================================
   TASK TYPE
===================================================== */

function formatTaskType(value?: string) {
  switch (value) {
    case "to_do":
      return "To-Do";

    case "follow_up":
      return "Follow Up";

    case "reminder":
      return "Reminder";

    default:
      return value || "-";
  }
}

/* =====================================================
   PRIORITY
===================================================== */

function formatPriority(value?: string) {
  if (!value) {
    return "-";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
  return (
    <Box
      sx={{
        display: "flex",

        justifyContent: "center",

        py: 8,
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}

/* =====================================================
   EMPTY
===================================================== */

function EmptyState({ text }: { text: string }) {
  return (
    <Box
      sx={{
        py: 8,

        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: 14,

          color: "text.secondary",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
