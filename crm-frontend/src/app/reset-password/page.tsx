"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { resetPassword } from "@/store/slices/authSlice";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Token
  const token = searchParams.get("token");

  // Redux
  const dispatch = useAppDispatch();

  const { loading, error, successMessage } = useAppSelector(
    (state) => state.auth,
  );

  // Form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form errors
  const [newPasswordError, setNewPasswordError] = useState("");

  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Validation
  const validateForm = () => {
    let isValid = true;

    setNewPasswordError("");
    setConfirmPasswordError("");

    // Token
    if (!token) {
      return false;
    }

    // New password
    if (!newPassword.trim()) {
      setNewPasswordError("New password is required");
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    // Confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Confirm password is required");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  // Submit
  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await dispatch(
      resetPassword({
        token: token!,
        password: newPassword,
        confirm_password: confirmPassword,
      }),
    );

    if (resetPassword.fulfilled.match(result)) {
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
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

    return "Password reset failed.";
  };

  // UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
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
          <Stack spacing={2.5}>
            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              Reset Password
            </Typography>

            {/* Backend error */}
            {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}

            {/* Success */}
            {successMessage && (
              <Alert severity="success">{successMessage}</Alert>
            )}

            {/* Token error */}
            {!token && (
              <Alert severity="error">Invalid or missing reset token.</Alert>
            )}

            {/* New password */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                New Password{" "}
                <Box component="span" sx={{ color: "error.main" }}>
                  *
                </Box>
              </Typography>

              <TextField
                fullWidth
                size="small"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setNewPasswordError("");
                }}
                error={Boolean(newPasswordError)}
                helperText={newPasswordError}
              />
            </Box>

            {/* Confirm password */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                Confirm Password{" "}
                <Box component="span" sx={{ color: "error.main" }}>
                  *
                </Box>
              </Typography>

              <TextField
                fullWidth
                size="small"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError("");
                }}
                error={Boolean(confirmPasswordError)}
                helperText={confirmPasswordError}
              />
            </Box>

            {/* Reset button */}
            <Button
              variant="contained"
              fullWidth
              disabled={loading || !token}
              sx={{
                mt: 1,
                bgcolor: "primary.main",
                textTransform: "none",
                borderRadius: 2,
                py: 1.2,
              }}
              onClick={handleResetPassword}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>

            {/* Login */}
            <Button
              component={Link}
              href="/"
              variant="text"
              sx={{
                textTransform: "none",
              }}
            >
              Back to Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
