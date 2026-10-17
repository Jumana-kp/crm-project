"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Button,
  useTheme,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";

import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import RichTextEditor from "../editors/RichTextEditor";

import axiosInstance from "@/api/axios";

/* =====================================================
   FORM VALUES
===================================================== */

export interface LogCallFormValues {
  connected: string;
  outcome: string;
  date: Dayjs | null;
  time: Dayjs | null;
  note: string;
}

/* =====================================================
   PROPS
===================================================== */

interface LogCallFormProps {
  open: boolean;

  connectedName?: string;

  phoneNumber?: string;

  module?: "lead" | "deal" | "company" | "ticket";

  moduleId?: number;

  onClose: () => void;

  /*
   * IMPORTANT:
   *
   * callId is passed when Save is clicked.
   *
   * The Call record was already created by
   * POST /calls/twilio/.
   */
  onSave: (data: LogCallFormValues, callId: number) => void;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function LogCallForm({
  open,
  connectedName,
  phoneNumber,
  module,
  moduleId,
  onClose,
  onSave,
}: LogCallFormProps) {
  const theme = useTheme();

  /* ===================================================
     BODY SCROLL LOCK
  =================================================== */

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  /* ===================================================
     FORM STATE
  =================================================== */

  const [form, setForm] = useState<LogCallFormValues>({
    connected: "",
    outcome: "",
    date: null,
    time: null,
    note: "",
  });

  /* ===================================================
     CALL STATE
  =================================================== */

  const [callId, setCallId] = useState<number | null>(null);

  const [callSid, setCallSid] = useState<string | null>(null);

  const [callStarted, setCallStarted] = useState(false);

  const [calling, setCalling] = useState(false);

  const [callError, setCallError] = useState("");

  const [callStatus, setCallStatus] = useState("");

  const [callDuration, setCallDuration] = useState<number | null>(null);

  /* ===================================================
     POLLING STATE
  =================================================== */

  const [refreshingCall, setRefreshingCall] = useState(false);

  /* ===================================================
     ERRORS
  =================================================== */

  const [errors, setErrors] = useState<
    Partial<Record<keyof LogCallFormValues, string>>
  >({});

  /* ===================================================
     INITIALIZE FORM
  =================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      connected: connectedName || "",
      outcome: "",
      date: null,
      time: null,
      note: "",
    });

    setErrors({});

    setCallId(null);

    setCallSid(null);

    setCallStarted(false);

    setCalling(false);

    setCallError("");

    setCallStatus("");

    setCallDuration(null);

    setRefreshingCall(false);
  }, [open, connectedName]);

  /* ===================================================
     FIELD CHANGE
  =================================================== */

  const handleChange = (key: keyof LogCallFormValues, value: any) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: value ? "" : "This field is required",
    }));
  };

  /* ===================================================
     APPLY CALL DATA TO FORM
  =================================================== */

  const applyCallData = (data: any) => {
    if (!data) {
      return;
    }

    /* =================================================
       CALL ID
    ================================================= */

    const returnedCallId = data.call_id ?? data.id ?? data.call?.id;

    if (returnedCallId !== null && returnedCallId !== undefined) {
      const numericCallId = Number(returnedCallId);

      if (!Number.isNaN(numericCallId)) {
        setCallId(numericCallId);
      }
    }

    /* =================================================
       CALL SID
    ================================================= */

    const returnedCallSid = data.call_sid ?? data.call?.call_sid;

    if (returnedCallSid) {
      setCallSid(String(returnedCallSid));
    }

    /* =================================================
       CALL STATUS
    ================================================= */

    if (data.call_status) {
      setCallStatus(String(data.call_status));
    }

    /* =================================================
       DURATION
    ================================================= */

    if (data.duration !== null && data.duration !== undefined) {
      const duration = Number(data.duration);

      if (!Number.isNaN(duration)) {
        setCallDuration(duration);
      }
    }

    /* =================================================
       OUTCOME
    ================================================= */

    if (data.call_outcome) {
      setForm((previous) => ({
        ...previous,
        outcome: data.call_outcome,
      }));

      setErrors((previous) => ({
        ...previous,
        outcome: "",
      }));
    }

    /* =================================================
       DATE
    ================================================= */

    if (data.call_date) {
      setForm((previous) => ({
        ...previous,
        date: dayjs(data.call_date),
      }));

      setErrors((previous) => ({
        ...previous,
        date: "",
      }));
    }

    /* =================================================
       TIME
    ================================================= */

    if (data.call_time) {
      const parsedTime = dayjs(`2000-01-01T${data.call_time}`);

      if (parsedTime.isValid()) {
        setForm((previous) => ({
          ...previous,
          time: parsedTime,
        }));

        setErrors((previous) => ({
          ...previous,
          time: "",
        }));
      }
    }
  };

  /* ===================================================
     FETCH SAME CALL RECORD
  =================================================== */

  const fetchCallRecord = async (
    currentCallId: number,
    showLoading = false,
  ) => {
    try {
      if (showLoading) {
        setRefreshingCall(true);
      }

      const response = await axiosInstance.get(`/calls/${currentCallId}/`);

      console.log("Updated CRM call:", response.data);

      applyCallData(response.data);

      return response.data;
    } catch (error: any) {
      console.error("Unable to fetch CRM call:", error);

      console.error("Call fetch error:", error?.response?.data);

      return null;
    } finally {
      if (showLoading) {
        setRefreshingCall(false);
      }
    }
  };

  /* ===================================================
     POLL CALL STATUS
  =================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!callId) {
      return;
    }

    let stopped = false;

    const pollCall = async () => {
      if (stopped) {
        return;
      }

      const data = await fetchCallRecord(callId, false);

      if (stopped || !data) {
        return;
      }

      const status = String(data.call_status || "").toLowerCase();

      const finalStatuses = [
        "completed",
        "no-answer",
        "busy",
        "failed",
        "canceled",
      ];

      if (finalStatuses.includes(status)) {
        return;
      }

      window.setTimeout(pollCall, 2000);
    };

    const timer = window.setTimeout(pollCall, 1000);

    return () => {
      stopped = true;

      window.clearTimeout(timer);
    };
  }, [open, callId]);

  /* ===================================================
     START TWILIO PHONE CALL
  =================================================== */

  const handleCall = async () => {
    if (!phoneNumber?.trim()) {
      setCallError("No phone number is available.");

      return;
    }

    if (calling) {
      return;
    }

    setCalling(true);

    setCallStarted(false);

    setCallError("");

    setCallStatus("");

    setCallDuration(null);

    try {
      /* =================================================
           CLEAN PHONE NUMBER
        ================================================= */

      const cleanedPhone = phoneNumber.trim();

      /* =================================================
           DEBUG
        ================================================= */

      console.log("========================================");

      console.log("TWILIO CALL DEBUG");

      console.log("Phone received:", phoneNumber);

      console.log("Cleaned phone:", cleanedPhone);

      console.log("Module:", module);

      console.log("Module ID:", moduleId);

      console.log("========================================");

      /* =================================================
           BUILD REQUEST PAYLOAD
        ================================================= */

      const payload: Record<string, any> = {
        phone_number: cleanedPhone,
      };

      /* =================================================
           ADD CRM RELATIONSHIP
        ================================================= */

      if (module && moduleId) {
        if (module === "lead") {
          payload.lead = moduleId;
        }

        if (module === "deal") {
          payload.deal = moduleId;
        }

        if (module === "company") {
          payload.company = moduleId;
        }

        if (module === "ticket") {
          payload.ticket = moduleId;
        }
      }

      /* =================================================
           PAYLOAD DEBUG
        ================================================= */

      console.log("Starting Twilio call...");

      console.log("Twilio payload:", payload);

      console.log("Sending POST:", "/calls/twilio/");

      /* =================================================
           CALL DJANGO API
        ================================================= */

      const response = await axiosInstance.post("/calls/twilio/", payload);

      /* =================================================
           RESPONSE DEBUG
        ================================================= */

      console.log("Twilio response:", response);

      console.log("Twilio response data:", response.data);

      /* =================================================
           SUCCESS
        ================================================= */

      if (response.data?.success) {
        setCallStarted(true);

        /* =================================================
             CRM CALL ID
          ================================================= */

        const returnedCallId =
          response.data?.call_id ??
          response.data?.id ??
          response.data?.call?.id;

        console.log("Returned CRM Call ID:", returnedCallId);

        if (returnedCallId !== null && returnedCallId !== undefined) {
          const numericCallId = Number(returnedCallId);

          if (!Number.isNaN(numericCallId)) {
            setCallId(numericCallId);
          }
        }

        /* =================================================
             CALL SID
          ================================================= */

        const returnedCallSid =
          response.data?.call_sid ?? response.data?.call?.call_sid;

        console.log("Returned Twilio SID:", returnedCallSid);

        if (returnedCallSid) {
          setCallSid(String(returnedCallSid));
        }

        /* =================================================
             CALL STATUS
          ================================================= */

        if (response.data?.status) {
          setCallStatus(String(response.data.status));
        }

        return;
      }

      /* =================================================
           BACKEND RETURNED FAILURE
        ================================================= */

      console.error("Twilio backend returned failure:", response.data);

      setCallError(
        response.data?.message ||
          response.data?.error ||
          "Unable to initiate the call.",
      );
    } catch (error: any) {
      /* =================================================
           ERROR DEBUG
        ================================================= */

      console.error("========================================");

      console.error("TWILIO CALL FAILED");

      console.error("Full Axios error:", error);

      console.error("Error message:", error?.message);

      console.error("HTTP status:", error?.response?.status);

      console.error("Backend response:", error?.response?.data);

      console.error("Backend message:", error?.response?.data?.message);

      console.error("Backend error:", error?.response?.data?.error);

      console.error("Twilio code:", error?.response?.data?.twilio_code);

      console.error("Twilio status:", error?.response?.data?.twilio_status);

      console.error("Twilio message:", error?.response?.data?.twilio_message);

      console.error("========================================");

      /* =================================================
           ERROR MESSAGE
        ================================================= */

      const backendMessage = error?.response?.data?.message;

      const backendError = error?.response?.data?.error;

      const twilioMessage = error?.response?.data?.twilio_message;

      setCallError(
        twilioMessage ||
          backendMessage ||
          backendError ||
          "Unable to initiate Twilio call.",
      );
    } finally {
      setCalling(false);
    }
  };

  /* ===================================================
     VALIDATION
  =================================================== */

  const validateForm = () => {
    const newErrors: Partial<Record<keyof LogCallFormValues, string>> = {};

    /* =================================================
         CONNECTED
      ================================================= */

    if (!form.connected.trim()) {
      newErrors.connected = "Connected person is required";
    }

    /* =================================================
         CALL MUST BE STARTED
      ================================================= */

    if (!callId) {
      setCallError("Please make the call before saving.");

      return false;
    }

    /* =================================================
         OUTCOME
      ================================================= */

    if (!form.outcome) {
      newErrors.outcome = "Call outcome is required";
    }

    /* =================================================
         DATE
      ================================================= */

    if (!form.date) {
      newErrors.date = "Date is required";
    }

    /* =================================================
         TIME
      ================================================= */

    if (!form.time) {
      newErrors.time = "Time is required";
    }

    /* =================================================
         SET ERRORS
      ================================================= */

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ===================================================
     SAVE
  =================================================== */

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * The Twilio endpoint already created
     * the CRM Call record.
     *
     * Pass that existing ID to the parent
     * so the parent can UPDATE it.
     */

    if (!callId) {
      setCallError("Please make the call before saving.");

      return;
    }

    onSave(form, callId);
  };

  /* ===================================================
     CLOSED
  =================================================== */

  if (!open) {
    return null;
  }

  /* ===================================================
     UI
  =================================================== */

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* BACKDROP */}

      <Box
        onClick={onClose}
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          zIndex: 1299,
        }}
      />

      {/* DRAWER */}

      <Box
        sx={{
          position: "fixed",
          right: 0,
          top: 0,
          width: {
            xs: "100%",
            sm: 420,
          },
          maxWidth: "100%",
          height: "100dvh",
          bgcolor: "background.paper",
          zIndex: 1300,
          boxShadow: theme.shadows[3],
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <Box
          sx={{
            minHeight: 64,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
            }}
          >
            Log Call
          </Typography>

          <IconButton onClick={onClose}>
            <CloseIcon color="action" />
          </IconButton>
        </Box>

        {/* CONTENT */}

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            p: 3,
          }}
        >
          {/* CONNECTED */}

          <FormLabel theme={theme}>Connected</FormLabel>

          <TextField
            fullWidth
            value={form.connected}
            error={!!errors.connected}
            helperText={errors.connected}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.palette.grey[100],
                borderRadius: `${theme.shape.borderRadius}px`,
              },
              "& .MuiInputBase-input": {
                color: theme.palette.text.secondary,
              },
            }}
          />

          {/* PHONE NUMBER + CALL BUTTON */}

          <Box
            sx={{
              mb: 3,
              p: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: `${theme.shape.borderRadius}px`,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                  }}
                >
                  Phone Number
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.25,
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {phoneNumber || "No phone number available"}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                startIcon={
                  calling ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <PhoneIcon />
                  )
                }
                disabled={!phoneNumber?.trim() || calling || !!callId}
                onClick={handleCall}
                sx={{
                  minWidth: 105,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                {calling ? "Calling..." : callId ? "Called" : "Call"}
              </Button>
            </Box>

            {/* CALL STATUS */}

            {callStarted && (
              <Box
                sx={{
                  mt: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{
                    display: "block",
                  }}
                >
                  Call initiated successfully.
                </Typography>

                {callStatus && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      textTransform: "capitalize",
                    }}
                  >
                    Status: {callStatus.replace("-", " ")}
                  </Typography>
                )}

                {callDuration !== null && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 0.25,
                    }}
                  >
                    Duration: {callDuration} seconds
                  </Typography>
                )}

                {refreshingCall && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 0.25,
                    }}
                  >
                    Updating call details...
                  </Typography>
                )}
              </Box>
            )}

            {/* CALL ERROR */}

            {callError && (
              <Alert
                severity="error"
                sx={{
                  mt: 1.5,
                }}
              >
                {callError}
              </Alert>
            )}
          </Box>

          {/* CALL OUTCOME */}

          <FormLabel theme={theme}>Call Outcome</FormLabel>

          <FormControl
            fullWidth
            sx={{
              mb: 3,
            }}
            error={!!errors.outcome}
          >
            <Select
              displayEmpty
              value={form.outcome}
              onChange={(event) => handleChange("outcome", event.target.value)}
              sx={{
                height: 40,
                borderRadius: `${theme.shape.borderRadius}px`,
                "& .MuiSelect-select": {
                  padding: "8px 10px",
                  fontSize: theme.typography.body2.fontSize,
                },
              }}
            >
              <MenuItem value="">
                <Typography variant="body2" color="text.secondary">
                  Choose
                </Typography>
              </MenuItem>

              <MenuItem value="connected">Connected</MenuItem>

              <MenuItem value="interested">Interested</MenuItem>

              <MenuItem value="not_interested">Not Interested</MenuItem>

              <MenuItem value="no_answer">No Answer</MenuItem>

              <MenuItem value="busy">Busy</MenuItem>

              <MenuItem value="wrong_number">Wrong Number</MenuItem>

              <MenuItem value="callback">Callback</MenuItem>
            </Select>

            {errors.outcome && (
              <Typography
                variant="caption"
                color="error"
                sx={{
                  mt: 0.5,
                  display: "block",
                }}
              >
                {errors.outcome}
              </Typography>
            )}
          </FormControl>

          {/* DATE + TIME */}

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mb: 3,
              width: "100%",
            }}
          >
            {/* DATE */}

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <FormLabel theme={theme}>Date</FormLabel>

              <DatePicker
                value={form.date}
                onChange={(value) => handleChange("date", value)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date,
                    sx: {
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: 40,
                        borderRadius: "12px",
                      },
                      "& input": {
                        fontSize: "14px",
                        padding: "8px 10px",
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* TIME */}

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <FormLabel theme={theme}>Time</FormLabel>

              <TimePicker
                value={form.time}
                onChange={(value) => handleChange("time", value)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!errors.time,
                    helperText: errors.time,
                    sx: {
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: 40,
                        borderRadius: "12px",
                      },
                      "& input": {
                        fontSize: "14px",
                        padding: "8px 10px",
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* NOTE */}

          <FormLabel theme={theme}>Note</FormLabel>

          <Box
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: `${theme.shape.borderRadius}px`,
              overflow: "hidden",
              "& .ql-toolbar": {
                border: "none",
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              "& .ql-container": {
                border: "none",
                minHeight: 180,
              },
              "& .ql-editor": {
                minHeight: 180,
              },
            }}
          >
            <RichTextEditor
              value={form.note}
              onChange={(value) => handleChange("note", value)}
            />
          </Box>

          {errors.note && (
            <Typography
              variant="caption"
              color="error"
              sx={{
                mt: 0.5,
                display: "block",
              }}
            >
              {errors.note}
            </Typography>
          )}
        </Box>

        {/* FOOTER */}

        <Divider />

        <Box
          sx={{
            p: 3,
            display: "flex",
            gap: 2,
            bgcolor: theme.palette.background.paper,
            flexShrink: 0,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{
              height: 40,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.light,
              },
            }}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={!callId || calling}
            sx={{
              height: 40,
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

/* =====================================================
   FORM LABEL
===================================================== */

function FormLabel({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: any;
}) {
  return (
    <Typography
      variant="body2"
      sx={{
        mb: 1,
        fontWeight: 500,
        color: theme.palette.text.primary,
        "&::after": {
          content: '" *"',
          color: theme.palette.error.main,
        },
      }}
    >
      {children}
    </Typography>
  );
}
