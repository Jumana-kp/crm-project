"use client";

import { useEffect } from "react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers } from "@/store/slices/userSlice";

import RichTextEditor from "../editors/RichTextEditor";

import {
  Box,
  Button,
  Drawer,
  FormControl,
  FormHelperText,
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

import { Dayjs } from "dayjs";

/* =====================================================
   SCHEMA
===================================================== */

const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),

  startDate: z
    .custom<Dayjs>()
    .nullable()
    .refine((value): value is Dayjs => value !== null, {
      message: "Start date is required",
    }),

  startTime: z
    .custom<Dayjs>()
    .nullable()
    .refine((value): value is Dayjs => value !== null, {
      message: "Start time is required",
    }),

  endTime: z
    .custom<Dayjs>()
    .nullable()
    .refine((value): value is Dayjs => value !== null, {
      message: "End time is required",
    }),

  attendees: z.array(z.number()).min(1, "At least one attendee is required"),

  location: z.string().optional(),

  reminder: z.string().optional(),

  note: z
    .string()
    .refine((value) => value.replace(/<[^>]*>/g, "").trim().length > 0, {
      message: "Note is required",
    }),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

type MeetingFormInputValues = z.input<typeof meetingSchema>;

/* =====================================================
   BACKEND DATA
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
   PROPS
===================================================== */
interface MeetingFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateMeetingData) => void;
  leadId?: number;
  dealId?: number;
  companyId?: number;
  ticketId?: number;
  allowedAttendeeIds?: number[];
}

/* =====================================================
   OPTIONS
===================================================== */

const locationOptions = ["Office", "Google Meet", "Zoom", "Microsoft Teams"];

const reminderOptions = [
  {
    value: "none",
    label: "None",
  },
  {
    value: "10",
    label: "10 Minutes Before",
  },
  {
    value: "30",
    label: "30 Minutes Before",
  },
  {
    value: "60",
    label: "1 Hour Before",
  },
  {
    value: "1440",
    label: "1 Day Before",
  },
];

/* =====================================================
   COMPONENT
===================================================== */

export default function MeetingForm({
  open,
  onClose,
  onSave,

  leadId,
  dealId,
  companyId,
  ticketId,
  allowedAttendeeIds = [],
}: MeetingFormProps) {
  const theme = useTheme();

  const dispatch = useAppDispatch();

  /* ===================================================
     USERS FROM REDUX
  =================================================== */

  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useAppSelector((state) => state.users);

  /* ===================================================
     LOAD USERS
  =================================================== */

  useEffect(() => {
    if (open && users.length === 0 && !usersLoading) {
      dispatch(fetchUsers());
    }
  }, [open, users.length, usersLoading, dispatch]);

  /* ===================================================
     LABEL STYLE
  =================================================== */

  const formLabelSx = {
    color: theme.palette.text.primary,

    fontSize: 14,

    fontWeight: 500,

    "&.Mui-focused": {
      color: theme.palette.text.primary,
    },
  };

  /* ===================================================
     FORM
  =================================================== */

  const {
    control,

    register,

    handleSubmit,

    reset,

    formState: { errors },
  } = useForm<MeetingFormInputValues>({
    resolver: zodResolver(meetingSchema),

    defaultValues: {
      title: "",

      startDate: null,

      startTime: null,

      endTime: null,

      attendees: [],

      location: "",

      reminder: "none",

      note: "",
    },
  });

  /* ===================================================
     CLOSE
  =================================================== */

  const handleClose = () => {
    reset();

    onClose();
  };

  /* ===================================================
     SUBMIT
  =================================================== */

  const onSubmit = (data: MeetingFormInputValues) => {
    if (
      data.startDate === null ||
      data.startTime === null ||
      data.endTime === null
    ) {
      return;
    }

    /*
     * Convert frontend form values
     * into Django serializer format.
     */

    const meetingData: CreateMeetingData = {
      title: data.title,

      start_date: data.startDate.format("YYYY-MM-DD"),

      start_time: data.startTime.format("HH:mm:ss"),

      end_time: data.endTime.format("HH:mm:ss"),

      attendee_ids: data.attendees,

      location: data.location || "",

      reminder: data.reminder || "none",

      note: data.note || "",
    };

    /* ===============================================
       CRM RELATIONSHIP
    =============================================== */

    if (leadId !== undefined) {
      meetingData.lead = leadId;
    }

    if (dealId !== undefined) {
      meetingData.deal = dealId;
    }

    if (companyId !== undefined) {
      meetingData.company = companyId;
    }

    if (ticketId !== undefined) {
      meetingData.ticket = ticketId;
    }

    /* ===============================================
       SEND TO PARENT
    =============================================== */

    onSave(meetingData);

    reset();

    onClose();
  };

  /* ===================================================
     RENDER
  =================================================== */

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
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            height: "100%",

            display: "flex",

            flexDirection: "column",

            bgcolor: theme.palette.background.paper,
          }}
        >
          {/* =================================================
              HEADER
          ================================================= */}

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
              Schedule Meeting
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

          {/* =================================================
              BODY
          ================================================= */}

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
            {/* =================================================
                TITLE
            ================================================= */}

            <FormControl error={!!errors.title}>
              <FormLabel sx={formLabelSx}>Title *</FormLabel>

              <TextField
                {...register("title")}
                size="small"
                placeholder="Enter"
                error={!!errors.title}
              />

              <FormHelperText>{errors.title?.message}</FormHelperText>
            </FormControl>

            {/* =================================================
                START DATE
            ================================================= */}

            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <FormControl error={!!errors.startDate}>
                  <FormLabel sx={formLabelSx}>Start Date *</FormLabel>

                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        size: "small",

                        error: !!errors.startDate,

                        fullWidth: true,
                      },
                    }}
                  />

                  <FormHelperText>{errors.startDate?.message}</FormHelperText>
                </FormControl>
              )}
            />

            {/* =================================================
                START / END TIME
            ================================================= */}

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
              {/* START TIME */}

              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.startTime}>
                    <FormLabel sx={formLabelSx}>Start Time *</FormLabel>

                    <TimePicker
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          size: "small",

                          error: !!errors.startTime,

                          fullWidth: true,
                        },
                      }}
                    />

                    <FormHelperText>{errors.startTime?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              {/* END TIME */}

              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.endTime}>
                    <FormLabel sx={formLabelSx}>End Time *</FormLabel>

                    <TimePicker
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          size: "small",

                          error: !!errors.endTime,

                          fullWidth: true,
                        },
                      }}
                    />

                    <FormHelperText>{errors.endTime?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Box>

            {/* =================================================
                ATTENDEES
            ================================================= */}

            <Controller
              name="attendees"
              control={control}
              render={({ field }) => (
                <FormControl error={!!errors.attendees} fullWidth>
                  <FormLabel sx={formLabelSx}>Attendees *</FormLabel>

                  <Select
                    multiple
                    value={field.value || []}
                    onChange={(event) => {
                      const value = event.target.value;

                      field.onChange(
                        typeof value === "string"
                          ? value.split(",").map(Number)
                          : value.map(Number),
                      );
                    }}
                    size="small"
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return "Select";
                      }

                      return selected
                        .map((userId) => {
                          const user = users.find((item) => item.id === userId);

                          if (!user) {
                            return String(userId);
                          }

                          return `${user.first_name} ${user.last_name}`;
                        })
                        .join(", ");
                    }}
                  >
                    {/* =========================================
                        LOADING
                    ========================================= */}

                    {usersLoading && (
                      <MenuItem disabled>Loading users...</MenuItem>
                    )}

                    {/* =========================================
                        ERROR
                    ========================================= */}

                    {!usersLoading && usersError && (
                      <MenuItem disabled>Failed to load users</MenuItem>
                    )}

                    {/* =========================================
                        USERS
                    ========================================= */}

                    {!usersLoading && !usersError && users.length === 0 && (
                      <MenuItem disabled>No users found</MenuItem>
                    )}

                    {users
                      .filter((user) => allowedAttendeeIds.includes(user.id))
                      .map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </MenuItem>
                      ))}
                  </Select>

                  <FormHelperText>{errors.attendees?.message}</FormHelperText>
                </FormControl>
              )}
            />

            {/* =================================================
                LOCATION
            ================================================= */}

            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <FormLabel sx={formLabelSx}>Location</FormLabel>

                  <Select {...field} size="small" displayEmpty>
                    <MenuItem value="">Select</MenuItem>

                    {locationOptions.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {/* =================================================
                REMINDER
            ================================================= */}

            <Controller
              name="reminder"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <FormLabel sx={formLabelSx}>Reminder</FormLabel>

                  <Select {...field} size="small" displayEmpty>
                    <MenuItem value="">Select</MenuItem>

                    {reminderOptions.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {/* =================================================
                NOTE
            ================================================= */}

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

              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.note} fullWidth>
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
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Enter"
                      />
                    </Box>

                    <FormHelperText>{errors.note?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Box>
          </Box>

          {/* =================================================
              FOOTER
          ================================================= */}

          <Box
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,

              p: 2,

              display: "flex",

              gap: 1,

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
              type="submit"
              variant="contained"
              color="primary"
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
