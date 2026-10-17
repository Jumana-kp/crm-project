"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Grid from "@mui/material/Grid";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

import { registerUser } from "@/store/slices/authSlice";

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux
  const {
    loading,
    error,
    successMessage,
  } = useAppSelector((state) => state.auth);

  // Form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industryType: "",
    country: "",
    role: "",
  });

  // Errors
  const [errors, setErrors] =
    useState<Record<string, string>>({});

  // Validation
  const validateField = (
    name: string,
    value: string
  ) => {
    let error = "";

    if (!value) {
      error = "This field is required";
    }

    // Email
    if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        error = "Invalid email format";
      }
    }

    // Phone
    if (name === "phone") {
      if (!value) {
        error = "Phone is required";
      } else if (!/^[0-9]{8,15}$/.test(value)) {
        error = "Invalid phone number";
      }
    }

    // Password
    if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 6) {
        error = "Minimum 6 characters required";
      }
    }

    // Confirm password
    if (name === "confirmPassword") {
      if (!value) {
        error = "Confirm password is required";
      } else if (value !== formData.password) {
        error = "Passwords do not match";
      }
    }

    return error;
  };

  // Handle change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  // Register
  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const value =
        formData[key as keyof typeof formData];

      const error = validateField(key, value);

      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Django payload
    const payload = {
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone,
      country: formData.country,
      industry_type: formData.industryType,
      company_name: formData.companyName,
      role: formData.role,
    };

    // Redux
    const result = await dispatch(
      registerUser(payload)
    );

    // Success
    if (registerUser.fulfilled.match(result)) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        industryType: "",
        country: "",
        role: "",
      });

      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  };

  // Field style
  const textFieldStyle = {
    width: "100%",

    "& .MuiOutlinedInput-root": {
      height: "40px",

      "& fieldset": {
        borderColor: theme.palette.grey[300],
      },

      "&:hover fieldset": {
        borderColor: theme.palette.primary.main,
      },

      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },

      "& input": {
        padding: "11px 13px",
        fontSize: "14px",
      },
    },

    "& .MuiFormHelperText-root": {
      marginLeft: 0,
      fontSize: "12px",
    },
  };

  // Error message
  const getErrorMessage = (error: any): string => {
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

    return "Registration failed";
  };

  // UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:
          theme.palette.background.default,
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "848px",
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.background.paper,
          p: {
            xs: 3,
            md: 5,
          },
        }}
      >
        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            mb: 4,
            color: theme.palette.text.primary,
          }}
        >
          Register
        </Typography>

        {/* Backend error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {getErrorMessage(error)}
          </Alert>
        )}

        {/* Success */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* First name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              sx={{
                mb: 1,
                fontSize: 14,
                color: theme.palette.text.primary,
              }}
            >
              First Name
            </Typography>

            <TextField
              fullWidth
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              sx={textFieldStyle}
            />
          </Grid>

          {/* Last name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              sx={{
                mb: 1,
                fontSize: 14,
                color: theme.palette.text.primary,
              }}
            >
              Last Name
            </Typography>

            <TextField
              fullWidth
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
              sx={textFieldStyle}
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>
              Email
            </Typography>

            <TextField
              fullWidth
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={textFieldStyle}
            />
          </Grid>

          {/* Phone */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>
              Phone Number
            </Typography>

            <TextField
              fullWidth
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              sx={textFieldStyle}
            />
          </Grid>

          {/* Password */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>
              Password
            </Typography>

            <TextField
              type="password"
              fullWidth
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              sx={textFieldStyle}
            />
          </Grid>

          {/* Confirm password */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>
              Confirm Password
            </Typography>

            <TextField
              type="password"
              fullWidth
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              sx={textFieldStyle}
            />
          </Grid>

          {/* Company */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>
              Company Name
            </Typography>

            <TextField
              fullWidth
              name="companyName"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={handleChange}
              sx={textFieldStyle}
            />
          </Grid>

          {/* Industry */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>
              Industry Type
            </Typography>

            <TextField
              select
              fullWidth
              name="industryType"
              value={formData.industryType}
              onChange={handleChange}
              sx={textFieldStyle}
            >
              <MenuItem value="">Choose</MenuItem>
              <MenuItem value="IT">IT</MenuItem>
              <MenuItem value="Healthcare">
                Healthcare
              </MenuItem>
              <MenuItem value="Education">
                Education
              </MenuItem>
            </TextField>
          </Grid>

          {/* Country */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>
              Country or Region
            </Typography>

            <TextField
              fullWidth
              name="country"
              placeholder="Enter your country or region"
              value={formData.country}
              onChange={handleChange}
              sx={textFieldStyle}
            />
          </Grid>

          {/* Role */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>
              Role
            </Typography>

            <TextField
              select
              fullWidth
              name="role"
              value={formData.role}
              onChange={handleChange}
              error={!!errors.role}
              helperText={errors.role}
              sx={textFieldStyle}
            >
              <MenuItem value="">Choose</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="support">Support</MenuItem>
            </TextField>
          </Grid>

          {/* Register button */}
          <Grid size={{ xs: 12 }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                width: "100%",
                maxWidth: "371.5px",
                height: "44px",
                fontWeight: 500,
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </Grid>
        </Grid>

        {/* Login */}
        <Box
          sx={{
            textAlign: "center",
            mt: 3,
            color: theme.palette.text.secondary,
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}

          <Typography
            component="span"
            onClick={() => router.push("/")}
            sx={{
              color: theme.palette.primary.main,
              cursor: "pointer",
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Login
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}