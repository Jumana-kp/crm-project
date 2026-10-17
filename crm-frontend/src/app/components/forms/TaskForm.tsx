"use client";

import { useState } from "react";

import type { Dayjs } from "dayjs";

import {
  Box,
  Button,
  Drawer,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { useTheme } from "@mui/material/styles";

import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import RichTextEditor from "../editors/RichTextEditor";

import type { User } from "@/store/slices/userSlice";

/* =====================================================
   PROPS
===================================================== */

interface TaskFormProps {
  open: boolean;

  taskName: string;

  dueDate: Dayjs | null;

  dueTime: Dayjs | null;

  taskType: string;

  priority: string;

  assignedTo: string[];

  note: string;

  users: User[];

  onTaskNameChange: (value: string) => void;

  onDueDateChange: (value: Dayjs | null) => void;

  onDueTimeChange: (value: Dayjs | null) => void;

  onTaskTypeChange: (value: string) => void;

  onPriorityChange: (value: string) => void;

  // onAssignedToChange: (value: string) => void;
  onAssignedToChange: (value: string[]) => void;
  onNoteChange: (value: string) => void;

  onClose: () => void;

  onSave: () => void | Promise<void>;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function TaskForm({
  open,
  taskName,
  dueDate,
  dueTime,
  taskType,
  priority,
  assignedTo,
  note,
  users,
  onTaskNameChange,
  onDueDateChange,
  onDueTimeChange,
  onTaskTypeChange,
  onPriorityChange,
  onAssignedToChange,
  onNoteChange,
  onClose,
  onSave,
}: TaskFormProps) {
  const theme = useTheme();

  const [errors, setErrors] = useState({
    taskName: false,
    dueDate: false,
    dueTime: false,
    taskType: false,
    priority: false,
    assignedTo: false,
    note: false,
  });

  const labelStyle = {
    color: theme.palette.text.primary,
    fontSize: 14,
    fontWeight: 500,
  };

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",

      "& fieldset": {
        borderColor: theme.palette.divider,
      },

      "&:hover fieldset": {
        borderColor: theme.palette.grey[400],
      },

      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
  };

  const menuProps = {
    slotProps: {
      paper: {
        sx: {
          maxHeight: 300,
          zIndex: 3000,
        },
      },
    },
  };

  /* =====================================================
     CLEAR ERROR
  ===================================================== */

  const clearError = (field: keyof typeof errors) => {
    setErrors((previous) => ({
      ...previous,
      [field]: false,
    }));
  };

  /* =====================================================
     CLOSE
  ===================================================== */

  const handleClose = () => {
    setErrors({
      taskName: false,
      dueDate: false,
      dueTime: false,
      taskType: false,
      priority: false,
      assignedTo: false,
      note: false,
    });

    onClose();
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = () => {
    const plainTextNote = note
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    const validation = {
      taskName: taskName.trim() === "",

      dueDate: !dueDate,

      dueTime: !dueTime,

      taskType: taskType === "",

      priority: priority === "",

      assignedTo: assignedTo.length === 0,

      note: plainTextNote === "",
    };

    setErrors(validation);

    if (Object.values(validation).some(Boolean)) {
      return;
    }

    onSave();
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        sx={{
          zIndex: (theme) => theme.zIndex.modal,
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            },
          },

          paper: {
            sx: {
              width: {
                xs: "100vw",
                sm: 420,
                md: 450,
              },

              maxWidth: "100vw",

              height: "100dvh",

              borderRadius: {
                xs: 0,
                sm: "12px 0 0 12px",
              },

              overflow: "hidden",
            },
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: theme.palette.background.paper,
          }}
        >
          {/* HEADER */}

          <Box
            sx={{
              height: 72,
              px: {
                xs: 2,
                sm: 3,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Create Task
            </Typography>

            <IconButton
              onClick={handleClose}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "8px",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* BODY */}

          <Box
            sx={{
              flex: 1,
              px: {
                xs: 2,
                sm: 3,
              },
              py: {
                xs: 2,
                sm: 3,
              },
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: {
                xs: 1.5,
                sm: 2,
              },
            }}
          >
            {/* TASK NAME */}

            <Box>
              <FormLabel sx={labelStyle}>Task Name *</FormLabel>

              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={taskName}
                onChange={(event) => {
                  onTaskNameChange(event.target.value);

                  clearError("taskName");
                }}
                error={errors.taskName}
                helperText={errors.taskName ? "Task name is required" : ""}
                sx={fieldStyle}
              />
            </Box>

            {/* DUE DATE */}

            <Box>
              <FormLabel sx={labelStyle}>Due Date *</FormLabel>

              <DatePicker
                value={dueDate}
                onChange={(value) => {
                  onDueDateChange(value);

                  clearError("dueDate");
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: errors.dueDate,
                    helperText: errors.dueDate ? "Due date is required" : "",
                    sx: fieldStyle,
                  },

                  popper: {
                    sx: {
                      zIndex: theme.zIndex.modal + 10,
                    },
                  },
                }}
              />
            </Box>

            {/* DUE TIME */}

            <Box>
              <FormLabel sx={labelStyle}>Time *</FormLabel>

              <TimePicker
                value={dueTime}
                onChange={(value) => {
                  onDueTimeChange(value);

                  clearError("dueTime");
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: errors.dueTime,
                    helperText: errors.dueTime ? "Time is required" : "",
                    sx: fieldStyle,
                  },

                  popper: {
                    sx: {
                      zIndex: theme.zIndex.modal + 10,
                    },
                  },
                }}
              />
            </Box>

            {/* TASK TYPE + PRIORITY */}

            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                gap: 2,
              }}
            >
              {/* TASK TYPE */}

              <Box
                sx={{
                  flex: 1,
                }}
              >
                <FormLabel sx={labelStyle}>Task Type *</FormLabel>

                <Select
                  fullWidth
                  size="small"
                  displayEmpty
                  value={taskType}
                  onChange={(event) => {
                    onTaskTypeChange(event.target.value);

                    clearError("taskType");
                  }}
                  error={errors.taskType}
                  MenuProps={menuProps}
                  sx={{
                    borderRadius: "8px",
                  }}
                >
                  <MenuItem value="" disabled>
                    Choose
                  </MenuItem>

                  <MenuItem value="to_do">To Do</MenuItem>

                  <MenuItem value="follow_up">Follow Up</MenuItem>

                  <MenuItem value="reminder">Reminder</MenuItem>
                </Select>

                {errors.taskType && (
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 12,
                      color: "error.main",
                    }}
                  >
                    Task type is required
                  </Typography>
                )}
              </Box>

              {/* PRIORITY */}

              <Box
                sx={{
                  flex: 1,
                }}
              >
                <FormLabel sx={labelStyle}>Priority *</FormLabel>

                <Select
                  fullWidth
                  size="small"
                  displayEmpty
                  value={priority}
                  onChange={(event) => {
                    onPriorityChange(event.target.value);

                    clearError("priority");
                  }}
                  error={errors.priority}
                  MenuProps={menuProps}
                  sx={{
                    borderRadius: "8px",
                  }}
                >
                  <MenuItem value="" disabled>
                    Choose
                  </MenuItem>

                  <MenuItem value="high">High</MenuItem>

                  <MenuItem value="medium">Medium</MenuItem>

                  <MenuItem value="low">Low</MenuItem>
                </Select>

                {errors.priority && (
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 12,
                      color: "error.main",
                    }}
                  >
                    Priority is required
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ASSIGNED TO */}

            <Box>
              <FormLabel sx={labelStyle}>Assigned To *</FormLabel>

              <Select
                fullWidth
                size="small"
                multiple
                displayEmpty
                value={assignedTo}
                onChange={(event) => {
                  const value = event.target.value;

                  onAssignedToChange(
                    typeof value === "string" ? value.split(",") : value,
                  );

                  clearError("assignedTo");
                }}
                error={errors.assignedTo}
                MenuProps={menuProps}
                renderValue={(selected) => {
                  const selectedIds = selected as string[];

                  if (selectedIds.length === 0) {
                    return "Choose";
                  }

                  return users
                    .filter((user) => selectedIds.includes(String(user.id)))
                    .map((user) => {
                      const fullName = `${user.first_name || ""} ${
                        user.last_name || ""
                      }`.trim();

                      return fullName || user.email;
                    })
                    .join(", ");
                }}
                sx={{
                  borderRadius: "8px",
                }}
              >
                {users.map((user) => {
                  const fullName = `${user.first_name || ""} ${
                    user.last_name || ""
                  }`.trim();

                  return (
                    <MenuItem key={user.id} value={String(user.id)}>
                      {fullName || user.email}
                    </MenuItem>
                  );
                })}
              </Select>

              {errors.assignedTo && (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: "error.main",
                  }}
                >
                  Assigned person is required
                </Typography>
              )}

              {!users.length && (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  No users available
                </Typography>
              )}
            </Box>

            {/* NOTE */}

            <Box>
              <FormLabel
                sx={{
                  display: "flex",
                  mb: 1,
                  fontSize: 14,
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                }}
              >
                Note
                <Typography
                  component="span"
                  sx={{
                    ml: 0.5,
                    color: theme.palette.error.main,
                  }}
                >
                  *
                </Typography>
              </FormLabel>

              <Box
                sx={{
                  border: `1px solid ${
                    errors.note
                      ? theme.palette.error.main
                      : theme.palette.divider
                  }`,
                  borderRadius: "8px",
                  overflow: "hidden",
                  minHeight: {
                    xs: 120,
                    sm: 160,
                  },
                }}
              >
                <RichTextEditor
                  value={note}
                  onChange={(value) => {
                    onNoteChange(value);

                    clearError("note");
                  }}
                  placeholder="Enter"
                />
              </Box>

              {errors.note && (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: "error.main",
                  }}
                >
                  Note is required
                </Typography>
              )}
            </Box>
          </Box>

          {/* FOOTER */}

          <Box
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              p: 2,
              display: "flex",
              gap: 1,
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                flex: 1,
                height: 40,
                minWidth: 0,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: 14,
                fontWeight: 600,
                borderColor: "#D0D5DD",
                color: "#344054",

                "&:hover": {
                  borderColor: "#D0D5DD",
                  backgroundColor: "#F9FAFB",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                flex: 1,
                height: 40,
                minWidth: 0,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "none",

                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Drawer>
    </LocalizationProvider>
  );
}
