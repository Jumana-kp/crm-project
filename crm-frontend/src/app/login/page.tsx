"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Box, TextField, Button, Stack, Alert, Link } from "@mui/material";

import Typography from "@mui/material/Typography";

import NextLink from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { loginUser } from "@/store/slices/authSlice";

export default function LoginPage() {
  // Router
  const router = useRouter();

  // Redux
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.auth);

  // Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Form errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Validation
  const validateForm = () => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");

    // Email
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError("Enter a valid email address");
      isValid = false;
    }

    // Password
    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  // Login
  const handleLogin = async () => {
    if (!validateForm()) return;

    const result = await dispatch(
      loginUser({
        email: email.trim(),
        password,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      router.push("/dashboard");
    }
  };

  // UI
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Box>
        {/* Login card */}
        <Box
          sx={{
            width: 485,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 1,
            boxShadow: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              color: "text.primary",
              mb: 3,
            }}
          >
            Log in
          </Typography>

          {/* Backend error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {typeof error === "string"
                ? error
                : error?.detail || error?.message || "Login failed"}
            </Alert>
          )}

          <Stack spacing={1.5}>
            {/* Email */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              Email
            </Typography>
            <TextField
              required
              fullWidth
              value={email}
              placeholder="Enter your email"
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={Boolean(emailError)}
              helperText={emailError}
            />

            {/* Password header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2">Password</Typography>

              {/* Forgot password */}
              <Link
                component={NextLink}
                href="/forgot-password"
                underline="none"
                sx={{
                  color: "primary.main",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            {/* Password */}
            <TextField
              required
              fullWidth
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              error={Boolean(passwordError)}
              helperText={passwordError}
            />

            {/* Login button */}
            <Button
              variant="contained"
              fullWidth
              disabled={loading}
              onClick={handleLogin}
              sx={{
                py: 1.3,
                mt: 3,
              }}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </Stack>
        </Box>

        {/* Register */}
        <Typography
          sx={{
            mt: 3,
            textAlign: "center",
            fontSize: 14,
          }}
          color="text.secondary"
        >
          Don’t have an account?{" "}
          <Link
            component={NextLink}
            href="/register"
            sx={{
              fontWeight: 500,
              color: "primary.main",
              textDecoration: "none",
            }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
