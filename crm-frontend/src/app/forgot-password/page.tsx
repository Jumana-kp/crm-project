"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { forgotPassword } from "@/store/slices/authSlice";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux
  const { loading, error, successMessage } = useAppSelector(
    (state) => state.auth,
  );

  // Form
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Validation
  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError("Enter a valid email address");
      return false;
    }

    setEmailError("");
    return true;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateEmail()) {
      return;
    }

    await dispatch(
      forgotPassword({
        email: email.trim(),
      }),
    );
  };

  // Error message
  const getErrorMessage = (error: any) => {
    if (!error) return "";

    if (typeof error === "string") {
      return error;
    }

    if (error.detail) {
      return error.detail;
    }

    if (error.message) {
      return error.message;
    }

    const firstError = Object.values(error)[0];

    if (Array.isArray(firstError)) {
      return firstError[0] as string;
    }

    if (typeof firstError === "string") {
      return firstError;
    }

    return "Something went wrong.";
  };

  // UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: 400,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Title */}
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, textAlign: "center" }}
          >
            Forgot Password
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: "center",
              mb: 3,
            }}
          >
            Enter your email address to receive a password reset link.
          </Typography>

          {/* Backend error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {getErrorMessage(error)}
            </Alert>
          )}

          {/* Success */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Email */}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            size="small"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            error={Boolean(emailError)}
            helperText={emailError}
            sx={{ mb: 3 }}
          />

          {/* Send button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          {/* Login */}
          <Button
            fullWidth
            sx={{
              mt: 2,
              textTransform: "none",
            }}
            onClick={() => router.push("/")}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
