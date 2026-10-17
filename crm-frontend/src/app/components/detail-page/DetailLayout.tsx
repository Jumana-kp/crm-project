"use client";

import { useEffect, useState } from "react";

import type { Dayjs } from "dayjs";

import {
  Alert,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { usePathname, useRouter } from "next/navigation";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

import AvatarSection from "./AvatarActionSection";
import EntityQuickActions from "./EntityQuickActions";
import SectionHeader from "./SectionHeader";

import NotesForm from "@/app/components/forms/NotesForm";
import TaskForm from "@/app/components/forms/TaskForm";
import LogCallForm from "@/app/components/forms/LogCallForm";
import EmailForm from "@/app/components/forms/EmailForm";
import MeetingForm from "@/app/components/forms/MeetingForm";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  createTask,
  fetchActivities,
  fetchTasks,
  createEmail,
  sendEmail,
} from "@/store/slices/activitySlice";

import { fetchUsers } from "@/store/slices/userSlice";

import { uploadAttachment } from "@/store/slices/attachmentSlice";

import axiosInstance from "@/api/axios";

/* =====================================================
   TYPES
===================================================== */

type EntityField = {
  key: string;
  label: string;
  value: string;
};

type DetailLayoutProps = {
  entity: any;

  /*
   * Company/contact owner IDs.
   *
   * These are passed from the parent detail page.
   * Admin IDs are added inside this component.
   */
  allowedAttendeeIds?: number[];

  actions?: React.ReactNode;

  onSaveAbout?: (fields: EntityField[]) => Promise<void>;

  /*
   * Used by Ticket.
   * Ticket status is changed from
   * the dropdown under the ticket name.
   */
  onStatusChange?: (status: string) => Promise<void>;

  /*
   * Used by Deal.
   * Deal stage is changed from
   * the dropdown under the deal amount.
   */
  onStageChange?: (stage: string) => Promise<void>;

  /*
   * CALL FORM
   */
  callOpen?: boolean;

  onCallOpenChange?: (open: boolean) => void;

  saving?: boolean;

  saveError?: any;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function DetailLayout({
  entity,
  allowedAttendeeIds: ownerAttendeeIds = [],
  onSaveAbout,
  onStatusChange,
  onStageChange,
  callOpen,
  onCallOpenChange,
  saving = false,
  saveError,
}: DetailLayoutProps) {
  const router = useRouter();

  const pathname = usePathname();

  const dispatch = useAppDispatch();

  /* ===================================================
     CURRENT MODULE
  =================================================== */

  const segment = pathname?.split("/")[1] || "companies";

  const label = segment.charAt(0).toUpperCase() + segment.slice(1);

  const aboutTitle =
    segment === "leads"
      ? "Lead"
      : segment === "companies"
        ? "Company"
        : segment === "deals"
          ? "Deal"
          : "Ticket";

  const isTicket = segment === "tickets";

  const isDeal = segment === "deals";

  /* ===================================================
     USERS
  =================================================== */

  const { users } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length]);

  /* ===================================================
     ABOUT
  =================================================== */

  const [openAbout, setOpenAbout] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(entity);

  useEffect(() => {
    setFormData(entity);
    setIsEditing(false);
  }, [entity]);

  /* ===================================================
     TICKET STATUS MENU
  =================================================== */

  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const statusMenuOpen = Boolean(statusAnchorEl);

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  const handleTicketStatusChange = async (status: string) => {
    setStatusAnchorEl(null);

    setFormData((previous: any) => ({
      ...previous,

      subtitle: status,

      header: {
        ...previous?.header,
        subtitle: status,
      },
    }));

    if (onStatusChange) {
      try {
        await onStatusChange(status);
      } catch {
        // Parent handles the error
      }
    }
  };

  /* ===================================================
     DEAL STAGE MENU
  =================================================== */

  const [stageAnchorEl, setStageAnchorEl] = useState<null | HTMLElement>(null);

  const stageMenuOpen = Boolean(stageAnchorEl);

  const handleStageClick = (event: React.MouseEvent<HTMLElement>) => {
    setStageAnchorEl(event.currentTarget);
  };

  const handleStageClose = () => {
    setStageAnchorEl(null);
  };

  const handleDealStageChange = async (stage: string) => {
    setStageAnchorEl(null);

    setFormData((previous: any) => ({
      ...previous,

      subtitle: stage,

      header: {
        ...previous?.header,
        subtitle: stage,
      },
    }));

    if (onStageChange) {
      try {
        await onStageChange(stage);
      } catch {
        // Parent handles save error
      }
    }
  };

  /* ===================================================
     DEAL STAGE OPTIONS
  =================================================== */

  const dealStageOptions = [
    {
      value: "prospecting",
      label: "Prospecting",
    },
    {
      value: "qualification",
      label: "Qualification",
    },
    {
      value: "proposal",
      label: "Proposal",
    },
    {
      value: "negotiation",
      label: "Negotiation",
    },
    {
      value: "closed_won",
      label: "Closed Won",
    },
    {
      value: "closed_lost",
      label: "Closed Lost",
    },
  ];

  /* ===================================================
     ACTIVITY FORMS
  =================================================== */

  const [openNoteForm, setOpenNoteForm] = useState(false);

  const [openTaskForm, setOpenTaskForm] = useState(false);

  /* ===================================================
     CALL
  =================================================== */

  const [internalCallOpen, setInternalCallOpen] = useState(false);

  const effectiveCallOpen = callOpen ?? internalCallOpen;

  const handleCallOpenChange = onCallOpenChange ?? setInternalCallOpen;

  const [openEmailForm, setOpenEmailForm] = useState(false);

  const [openMeetingForm, setOpenMeetingForm] = useState(false);

  /* ===================================================
     NOTE
  =================================================== */

  const [note, setNote] = useState("");

  /* ===================================================
     TASK
  =================================================== */

  const [taskName, setTaskName] = useState("");

  const [dueDate, setDueDate] = useState<Dayjs | null>(null);

  const [dueTime, setDueTime] = useState<Dayjs | null>(null);

  const [taskType, setTaskType] = useState("");

  const [priority, setPriority] = useState("");

  // const [assignedTo, setAssignedTo] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  const [taskNote, setTaskNote] = useState("");

  /* ===================================================
     FIELD CHANGE
  =================================================== */

  const handleFieldChange = (index: number, value: string) => {
    setFormData((previous: any) => {
      if (!previous) {
        return previous;
      }

      const fields = [...(previous.fields || [])];

      if (!fields[index]) {
        return previous;
      }

      fields[index] = {
        ...fields[index],
        value,
      };

      return {
        ...previous,
        fields,
      };
    });
  };

  /* ===================================================
     EDIT
  =================================================== */

  const handleEdit = () => {
    setIsEditing(true);
  };

  /* ===================================================
     CANCEL
  =================================================== */

  const handleCancel = () => {
    setFormData(entity);
    setIsEditing(false);
  };

  /* ===================================================
     SAVE
  =================================================== */

  const handleSave = async () => {
    if (!onSaveAbout) {
      setIsEditing(false);
      return;
    }

    try {
      await onSaveAbout(formData?.fields || []);

      setIsEditing(false);
    } catch {
      setIsEditing(true);
    }
  };

  /* ===================================================
     QUICK ACTION
  =================================================== */

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "Note":
        setOpenNoteForm(true);
        break;

      case "Email":
        setOpenEmailForm(true);
        break;

      case "Call":
        handleCallOpenChange(true);
        break;

      case "Task":
        setOpenTaskForm(true);
        break;

      case "Meeting":
        setOpenMeetingForm(true);
        break;

      default:
        break;
    }
  };

  /* ===================================================
     QUICK ACTIONS
  =================================================== */

  const actionsList = [
    {
      label: "Note",
      icon: (
        <NoteAltOutlinedIcon
          sx={{
            fontSize: 18,
          }}
        />
      ),
    },

    {
      label: "Email",
      icon: (
        <EmailOutlinedIcon
          sx={{
            fontSize: 18,
          }}
        />
      ),
    },

    {
      label: "Call",
      icon: (
        <CallOutlinedIcon
          sx={{
            fontSize: 18,
          }}
        />
      ),
    },

    {
      label: "Task",
      icon: (
        <CheckCircleOutlineOutlinedIcon
          sx={{
            fontSize: 18,
          }}
        />
      ),
    },

    {
      label: "Meeting",
      icon: (
        <EventOutlinedIcon
          sx={{
            fontSize: 18,
          }}
        />
      ),
    },
  ];

  /* ===================================================
     ENTITY TYPE
  =================================================== */

  const entityType =
    segment === "leads"
      ? "lead"
      : segment === "deals"
        ? "deal"
        : segment === "companies"
          ? "company"
          : "ticket";

  /* ===================================================
     SAVE MEETING
  =================================================== */

  const handleSaveMeeting = async (data: any) => {
    try {
      const currentEntityId = Number(entity.id);

      if (!currentEntityId) {
        console.error("Entity ID is missing");

        return;
      }

      setOpenMeetingForm(false);

      await dispatch(
        fetchActivities({
          module: entityType,
          moduleId: currentEntityId,
        }),
      ).unwrap();
    } catch (error) {
      console.error("MEETING SAVE FAILED:", error);
    }
  };

  /* ===================================================
     CREATE TASK
  =================================================== */

  const handleCreateTask = async () => {
    if (!entity?.id) {
      throw new Error("Record ID is missing.");
    }

    if (!taskName.trim()) {
      throw new Error("Task name is required.");
    }

    if (!dueDate) {
      throw new Error("Due date is required.");
    }

    if (!dueTime) {
      throw new Error("Due time is required.");
    }

    if (assignedTo.length === 0) {
      throw new Error("Assigned user is required.");
    }

    if (!taskType) {
      throw new Error("Task type is required.");
    }

    if (!priority) {
      throw new Error("Priority is required.");
    }

    const entityId = Number(entity.id);

    if (!Number.isInteger(entityId) || entityId <= 0) {
      throw new Error("Invalid record ID.");
    }

    const taskData = {
      task_name: taskName.trim(),

      due_date: dueDate.format("YYYY-MM-DD"),

      due_time: dueTime.format("HH:mm:ss"),

      task_type: taskType,

      priority: priority,

      assigned_to_id: assignedTo.map(Number),

      note: taskNote,
    };

    if (segment === "leads") {
      (taskData as any).lead = entityId;
    } else if (segment === "deals") {
      (taskData as any).deal = entityId;
    } else if (segment === "companies") {
      (taskData as any).company = entityId;
    } else if (segment === "tickets") {
      (taskData as any).ticket = entityId;
    }

    const module =
      segment === "leads"
        ? "lead"
        : segment === "deals"
          ? "deal"
          : segment === "tickets"
            ? "ticket"
            : "company";

    await dispatch(createTask(taskData as any)).unwrap();

    setOpenTaskForm(false);

    setTaskName("");

    setDueDate(null);

    setDueTime(null);

    setTaskType("");

    setPriority("");

    setAssignedTo([]);

    setTaskNote("");

    await dispatch(
      fetchActivities({
        module,
        moduleId: entityId,
      }),
    ).unwrap();

    await dispatch(
      fetchTasks({
        module,
        moduleId: entityId,
      }),
    ).unwrap();
  };

  /* ===================================================
     CONNECTED NAME
  =================================================== */

  const connectedName =
    formData?.header?.name ||
    formData?.name ||
    formData?.deal_name ||
    formData?.company_name ||
    formData?.ticket_name ||
    "";

  /* ===================================================
     ALLOWED MEETING ATTENDEES

     COMPANY:
       - Company/contact owners
       - Admin users

     OTHER MODULES:
       - IDs passed by parent
       - Admin users

     IMPORTANT:
     We DO NOT use entity.company_owners here.
     The parent page passes the owner IDs
     through allowedAttendeeIds.
  =================================================== */

  const adminIds = users
    .filter((user: any) => String(user?.role).toLowerCase().trim() === "admin")
    .map((user: any) => Number(user?.id))
    .filter(
      (userId): userId is number => Number.isFinite(userId) && userId > 0,
    );

  const ownerIds = (Array.isArray(ownerAttendeeIds) ? ownerAttendeeIds : [])
    .map((id: any) => Number(id))
    .filter((id): id is number => Number.isFinite(id) && id > 0);

  //task assignned users
  const taskAssignedUsers = users.filter((user: any) =>
    ownerIds.includes(Number(user.id)),
  );
  /*
   * FINAL LIST:
   *
   * Company/contact owners
   * +
   * Admins
   *
   * Set removes duplicates.
   */
  const finalAllowedAttendeeIds = Array.from(
    new Set([...ownerIds, ...adminIds]),
  );

  /* ===================================================
     ENTITY ID
  =================================================== */

  const entityId = Number(entity?.id);

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#fff",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          bgcolor: "#fff",
          borderRadius: 1.5,
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
          }}
        >
          {/* BACK */}

          <Box
            onClick={() => router.push(`/${segment}`)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              cursor: "pointer",
              width: "fit-content",
              mb: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 21,
                lineHeight: 1,
                color: "#344054",
              }}
            >
              ‹
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 500,
                color: "#344054",
              }}
            >
              {label}
            </Typography>
          </Box>

          {/* HEADER */}

          {isTicket ? (
            <Box
              sx={{
                mb: 2.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#101828",
                  lineHeight: 1.3,
                  mb: 0.5,
                }}
              >
                {formData?.name || "Unknown Ticket"}
              </Typography>

              <Box>
                <Box
                  onClick={handleStatusClick}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    width: "fit-content",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#475467",
                    }}
                  >
                    {formData?.subtitle || "-"}
                  </Typography>

                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 18,
                      color: "#667085",
                      ml: 0.25,
                    }}
                  />
                </Box>

                <Menu
                  anchorEl={statusAnchorEl}
                  open={statusMenuOpen}
                  onClose={handleStatusClose}
                  slotProps={{
                    list: {
                      dense: true,
                    },
                  }}
                >
                  <MenuItem
                    selected={formData?.subtitle === "Open"}
                    onClick={() => handleTicketStatusChange("Open")}
                  >
                    Open
                  </MenuItem>

                  <MenuItem
                    selected={formData?.subtitle === "In Progress"}
                    onClick={() => handleTicketStatusChange("In Progress")}
                  >
                    In Progress
                  </MenuItem>

                  <MenuItem
                    selected={formData?.subtitle === "On Hold"}
                    onClick={() => handleTicketStatusChange("On Hold")}
                  >
                    On Hold
                  </MenuItem>

                  <MenuItem
                    selected={formData?.subtitle === "Resolved"}
                    onClick={() => handleTicketStatusChange("Resolved")}
                  >
                    Resolved
                  </MenuItem>

                  <MenuItem
                    selected={formData?.subtitle === "Closed"}
                    onClick={() => handleTicketStatusChange("Closed")}
                  >
                    Closed
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          ) : isDeal ? (
            <Box
              sx={{
                mb: 2.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#101828",
                  lineHeight: 1.3,
                  mb: 0.5,
                }}
              >
                {formData?.header?.name || formData?.name || "Unknown Deal"}
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#475467",
                  lineHeight: 1.5,
                  mb: 0.25,
                }}
              >
                {formData?.header?.amount
                  ? `Amount: ${formData.header.amount}`
                  : "Amount: -"}
              </Typography>

              <Box>
                <Box
                  onClick={handleStageClick}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    width: "fit-content",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#475467",
                      lineHeight: 1.5,
                    }}
                  >
                    Stage:{" "}
                    {formatStage(
                      formData?.header?.subtitle || formData?.subtitle || "-",
                    )}
                  </Typography>

                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 18,
                      color: "#667085",
                      ml: 0.25,
                    }}
                  />
                </Box>

                <Menu
                  anchorEl={stageAnchorEl}
                  open={stageMenuOpen}
                  onClose={handleStageClose}
                  slotProps={{
                    list: {
                      dense: true,
                    },
                  }}
                >
                  {dealStageOptions.map((stage) => (
                    <MenuItem
                      key={stage.value}
                      selected={
                        formData?.header?.subtitle === stage.value ||
                        formData?.subtitle === stage.value
                      }
                      onClick={() => handleDealStageChange(stage.value)}
                    >
                      {stage.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>
          ) : (
            <AvatarSection entity={formData} />
          )}

          {/* QUICK ACTIONS */}

          <Box
            sx={{
              mt: 1.5,
              mb: 2.5,
            }}
          >
            <EntityQuickActions
              actions={actionsList}
              onActionClick={handleQuickAction}
            />
          </Box>

          {/* ABOUT HEADER */}

          <SectionHeader
            title={`About this ${aboutTitle}`}
            open={openAbout}
            setOpen={setOpenAbout}
            isEditing={isEditing}
            onEditToggle={isEditing ? handleSave : handleEdit}
            EditIcon={
              <EditOutlinedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            }
            SaveIcon={
              saving ? (
                <CircularProgress size={18} />
              ) : (
                <SaveOutlinedIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              )
            }
          />

          {/* ABOUT CONTENT */}

          {openAbout && (
            <Box
              sx={{
                mt: 1,
              }}
            >
              {isEditing ? (
                <EditableFields
                  fields={formData?.fields || []}
                  onChange={handleFieldChange}
                  disabled={saving}
                  onCancel={handleCancel}
                />
              ) : (
                <ReadOnlyFields fields={formData?.fields || []} />
              )}

              {saveError && (
                <Alert
                  severity="error"
                  sx={{
                    mt: 2,
                  }}
                >
                  {getErrorMessage(saveError)}
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* =================================================
          NOTE
      ================================================= */}

      <NotesForm
        open={openNoteForm}
        value={note}
        onChange={setNote}
        onClose={() => {
          setOpenNoteForm(false);
          setNote("");
        }}
        onSave={() => {
          setOpenNoteForm(false);
          setNote("");
        }}
      />

      {/* =================================================
          TASK
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
        onClose={() => setOpenTaskForm(false)}
        onSave={handleCreateTask}
      />
      {/* =================================================
          CALL
      ================================================= */}

      <LogCallForm
        open={effectiveCallOpen}
        connectedName={connectedName}
        phoneNumber={formData?.phone || ""}
        module={entityType}
        moduleId={entityId}
        onClose={() => handleCallOpenChange(false)}
        onSave={async (data, callId) => {
          try {
            if (!data.date || !data.time) {
              return;
            }

            if (!callId) {
              console.error("CRM Call ID is missing.");

              return;
            }

            if (!entityId) {
              console.error("Entity ID is missing.");

              return;
            }

            const callData = {
              call_outcome: data.outcome,

              call_date: data.date.format("YYYY-MM-DD"),

              call_time: data.time.format("HH:mm:ss"),

              note: data.note,
            };

            console.log("========================================");

            console.log("UPDATING EXISTING CRM CALL");

            console.log("Call ID:", callId);

            console.log("Call payload:", callData);

            console.log("========================================");

            const result = await axiosInstance.patch(
              `/calls/${callId}/`,
              callData,
            );

            console.log("Call updated successfully:", result.data);

            await dispatch(
              fetchActivities({
                module: entityType,
                moduleId: entityId,
              }),
            ).unwrap();

            handleCallOpenChange(false);
          } catch (error: any) {
            console.error("Call update failed:", error);

            console.error("Call update response:", error?.response?.data);
          }
        }}
      />

      {/* =================================================
          EMAIL
      ================================================= */}

      <EmailForm
        open={openEmailForm}
        onClose={() => setOpenEmailForm(false)}
        type={entityType}
        id={Number(entity.id)}
        onSave={async (data, selectedAttachmentIds) => {
          try {
            const currentEntityId = Number(entity.id);

            if (!currentEntityId) {
              console.error("Entity ID is missing");

              return;
            }

            /* ==========================================
               1. Upload NEW files
            ========================================== */

            const uploadedAttachments = await Promise.all(
              data.attachments.map((file) =>
                dispatch(
                  uploadAttachment({
                    file,
                    type: entityType,
                    id: currentEntityId,
                  }),
                ).unwrap(),
              ),
            );

            /* ==========================================
               2. Get NEW attachment IDs
            ========================================== */

            const uploadedAttachmentIds = uploadedAttachments
              .map((attachment) => attachment.id)
              .filter(
                (attachmentId): attachmentId is number =>
                  typeof attachmentId === "number",
              );

            /* ==========================================
               3. Combine EXISTING + NEW
            ========================================== */

            const allAttachmentIds = [
              ...(selectedAttachmentIds ?? []),
              ...uploadedAttachmentIds,
            ];

            console.log("SELECTED ATTACHMENT IDS:", allAttachmentIds);

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

                selectedAttachmentIds: allAttachmentIds,

                [entityType]: currentEntityId,
              }),
            ).unwrap();

            console.log("CREATED EMAIL:", result);

            /* ==========================================
               5. Send email
            ========================================== */

            await dispatch(sendEmail(result.id)).unwrap();

            console.log("EMAIL SENT SUCCESSFULLY");

            /* ==========================================
               6. Close form
            ========================================== */

            setOpenEmailForm(false);

            /* ==========================================
               7. Refresh Activity
            ========================================== */

            await dispatch(
              fetchActivities({
                module: entityType,
                moduleId: currentEntityId,
              }),
            ).unwrap();
          } catch (error) {
            console.error("EMAIL SENDING FAILED:", error);
          }
        }}
      />

      {/* =================================================
          MEETING
      ================================================= */}

      <MeetingForm
        open={openMeetingForm}
        onClose={() => setOpenMeetingForm(false)}
        onSave={handleSaveMeeting}
        allowedAttendeeIds={finalAllowedAttendeeIds}
      />
    </Box>
  );
}

/* =====================================================
   FORMAT DEAL STAGE
===================================================== */

function formatStage(stage: string) {
  if (!stage) {
    return "-";
  }

  return stage
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =====================================================
   READ ONLY FIELDS
===================================================== */

function ReadOnlyFields({ fields }: { fields: EntityField[] }) {
  return (
    <Box>
      {fields.map((field) => (
        <Box
          key={field.key}
          sx={{
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            {field.label}
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 500,
              wordBreak: "break-word",
            }}
          >
            {field.value || "-"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/* =====================================================
   EDITABLE FIELDS
===================================================== */

function EditableFields({
  fields,
  onChange,
  disabled,
  onCancel,
}: {
  fields: EntityField[];

  onChange: (index: number, value: string) => void;

  disabled: boolean;

  onCancel: () => void;
}) {
  return (
    <Box>
      {fields.map((field, index) => {
        if (field.key === "company_owners") {
          return (
            <Box
              key={field.key}
              sx={{
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  mb: 0.5,
                }}
              >
                {field.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  wordBreak: "break-word",
                }}
              >
                {field.value || "-"}
              </Typography>
            </Box>
          );
        }

        if (field.key === "ticket_owners") {
          return (
            <Box
              key={field.key}
              sx={{
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  mb: 0.5,
                }}
              >
                {field.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  wordBreak: "break-word",
                }}
              >
                {field.value || "-"}
              </Typography>
            </Box>
          );
        }

        if (field.key === "created_at") {
          return (
            <Box
              key={field.key}
              sx={{
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  mb: 0.5,
                }}
              >
                {field.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {field.value || "-"}
              </Typography>
            </Box>
          );
        }

        return (
          <Box
            key={field.key}
            sx={{
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                mb: 0.5,
              }}
            >
              {field.label}
            </Typography>

            <TextField
              fullWidth
              size="small"
              type={field.key === "no_of_employees" ? "number" : "text"}
              value={field.value || ""}
              disabled={disabled}
              onChange={(event) => onChange(index, event.target.value)}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: 14,
                },
              }}
            />
          </Box>
        );
      })}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 1,
        }}
      >
        <Typography
          onClick={disabled ? undefined : onCancel}
          sx={{
            fontSize: 13,
            color: disabled ? "text.disabled" : "text.secondary",
            cursor: disabled ? "default" : "pointer",
            fontWeight: 500,
          }}
        >
          Cancel
        </Typography>
      </Box>
    </Box>
  );
}

/* =====================================================
   ERROR MESSAGE
===================================================== */

function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  if (error?.detail && typeof error.detail === "string") {
    return error.detail;
  }

  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

  return "Failed to update record.";
}
