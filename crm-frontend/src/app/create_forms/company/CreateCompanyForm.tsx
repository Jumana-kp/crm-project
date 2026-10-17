"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Checkbox,
  Drawer,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import type { SxProps, Theme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";

import { useTheme } from "@mui/material/styles";

import { US, AE, IN, GB } from "country-flag-icons/react/3x2";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { createCompany, updateCompany } from "@/store/slices/companySlice";

import type { Company } from "@/store/slices/companySlice";

import { fetchUsers } from "@/store/slices/userSlice";

// Types

type Props = {
  open: boolean;
  onClose: () => void;
  company?: Company | null;
};

type Country = "" | "india" | "uae" | "usa" | "uk";

type FormData = {
  domain: string;
  companyName: string;
  owner: number[];
  industry: string;
  type: string;
  city: string;
  countryRegion: string;
  employees: string;
  revenue: string;
  phone: string;
  email: string;
};

// Countries

const countries = {
  india: { maxLength: 10 },
  uae: { maxLength: 9 },
  usa: { maxLength: 10 },
  uk: { maxLength: 10 },
};

// Industries

const industries = [
  "IT",
  "Healthcare",
  "Retail",
  "Finance",
  "Education",
  "Manufacturing",
  "Agriculture",
  "Other",
];

// Company types

const companyTypes = [
  "Private",
  "Public",
  "Startup",
  "Government",
  "NGO",
  "Partnership",
];

// Initial form

const initialForm: FormData = {
  domain: "",
  companyName: "",
  owner: [],
  industry: "",
  type: "",
  city: "",
  countryRegion: "",
  employees: "",
  revenue: "",
  phone: "",
  email: "",
};

// Component

export default function CreateCompanyDrawer({ open, onClose, company }: Props) {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // Edit mode

  const isEditMode = !!company;

  // Auth user

  const { user } = useAppSelector((state) => state.auth);

  // Users

  const users = useAppSelector((state) => state.users.users);

  const usersLoading = useAppSelector((state) => state.users.loading);

  // State

  const [country, setCountry] = useState<Country>("");

  const [form, setForm] = useState<FormData>(initialForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [success, setSuccess] = useState(false);

  const [apiError, setApiError] = useState("");

  const [saving, setSaving] = useState(false);

  // Get country code

  const getCountryCode = (countryName: string): Country => {
    const value = countryName?.trim().toLowerCase();

    if (value === "india") {
      return "india";
    }

    if (value === "uae" || value === "united arab emirates") {
      return "uae";
    }

    if (
      value === "usa" ||
      value === "united states" ||
      value === "united states of america"
    ) {
      return "usa";
    }

    if (value === "uk" || value === "united kingdom") {
      return "uk";
    }

    return "";
  };

  // Selected country

  const selectedCountry = country ? countries[country] : null;

  // Set default owner for create

  useEffect(() => {
    if (open && !company && user?.id && form.owner.length === 0) {
      setForm((prev) => ({
        ...prev,
        owner: [user.id],
      }));
    }
  }, [open, company, user, form.owner.length]);

  // Fetch users

  useEffect(() => {
    if (open) {
      dispatch(fetchUsers());
    }
  }, [open, dispatch]);

  // Load create/edit data

  useEffect(() => {
    if (!open) {
      return;
    }

    // Create mode

    if (!company) {
      setForm(initialForm);
      setErrors({});
      setApiError("");
      setSuccess(false);
      setCountry("");

      return;
    }

    // Edit mode

    const ownerIds = Array.isArray(company.company_owners)
      ? company.company_owners.map((owner) => owner.id)
      : [];

    setForm({
      domain: company.domain_name || "",

      companyName: company.company_name || "",

      owner: ownerIds,

      industry: company.industry || "",

      type: company.company_type || "",

      city: company.city || "",

      countryRegion: company.country || "",

      employees:
        company.no_of_employees !== null &&
        company.no_of_employees !== undefined
          ? String(company.no_of_employees)
          : "",

      revenue:
        company.annual_revenue !== null && company.annual_revenue !== undefined
          ? String(company.annual_revenue)
          : "",

      phone: company.phone_number || "",

      email: company.email || "",
    });

    // Restore phone country

    setCountry(getCountryCode(company.country || ""));

    setErrors({});
    setApiError("");
    setSuccess(false);
  }, [open, company]);

  // Update form field

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setApiError("");
  };

  // Update phone

  const updatePhone = (value: string) => {
    const number = value.replace(/\D/g, "");

    if (!selectedCountry) {
      updateField("phone", number);
      return;
    }

    updateField("phone", number.slice(0, selectedCountry.maxLength));
  };

  // Reset form

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setCountry("");
    setSuccess(false);
    setApiError("");
    setSaving(false);
  };

  // Close drawer

  const handleClose = () => {
    if (saving) {
      return;
    }

    resetForm();
    onClose();
  };

  // Get user name

  const getUserName = (userId: number) => {
    const selectedUser = users.find((item) => item.id === userId);

    if (!selectedUser) {
      return `User ${userId}`;
    }

    return `${selectedUser.first_name} ${selectedUser.last_name}`;
  };

  // Validation

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.domain.trim()) {
      newErrors.domain = "Domain name is required";
    } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.domain.trim())) {
      newErrors.domain = "Enter valid domain";
    }

    if (!form.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    } else if (form.companyName.trim().length < 3) {
      newErrors.companyName = "Minimum 3 characters required";
    }

    if (!form.owner || form.owner.length === 0) {
      newErrors.owner = "At least one company owner is required";
    }

    if (!form.industry) {
      newErrors.industry = "Industry is required";
    }

    if (!form.type) {
      newErrors.type = "Type is required";
    }

    if (!country) {
      newErrors.phone = "Please select a country";
    } else if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (
      selectedCountry &&
      form.phone.length !== selectedCountry.maxLength
    ) {
      newErrors.phone = `Enter valid ${selectedCountry.maxLength} digit number`;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Invalid email address";
    }

    if (form.employees && isNaN(Number(form.employees))) {
      newErrors.employees = "Only numbers allowed";
    }

    if (form.revenue && isNaN(Number(form.revenue))) {
      newErrors.revenue = "Only numbers allowed";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Create / update company

  const handleSubmit = async () => {
    setApiError("");

    if (!validate()) {
      return;
    }

    if (!user?.id) {
      setApiError("User information is missing. Please login again.");

      return;
    }

    try {
      setSaving(true);

      // Backend payload

      const companyData = {
        domain_name: form.domain.trim(),

        company_name: form.companyName.trim(),

        company_owner_ids: form.owner,

        industry: form.industry,

        company_type: form.type,

        city: form.city.trim(),

        country: form.countryRegion.trim(),

        no_of_employees: form.employees ? Number(form.employees) : null,

        annual_revenue: form.revenue ? form.revenue : null,

        phone_number: form.phone,

        email: form.email.trim(),
      };

      // Update

      if (isEditMode && company) {
        await dispatch(
          updateCompany({
            id: company.id,
            data: companyData,
          }),
        ).unwrap();

        setSuccess(true);

        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);

        return;
      }

      // Create

      await dispatch(createCompany(companyData)).unwrap();

      setSuccess(true);

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (error: any) {
      // Handle API error

      if (typeof error === "object" && error !== null) {
        const messages = Object.entries(error)
          .map(([field, message]) => {
            if (Array.isArray(message)) {
              return `${field}: ${message.join(", ")}`;
            }

            return `${field}: ${String(message)}`;
          })
          .join("\n");

        setApiError(
          messages ||
            (isEditMode
              ? "Failed to update company."
              : "Failed to create company."),
        );
      } else {
        setApiError(
          String(error) ||
            (isEditMode
              ? "Failed to update company."
              : "Failed to create company."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Styles

  const inputStyle: SxProps<Theme> = {
    "& .MuiOutlinedInput-root": {
      height: 40,
      borderRadius: "8px",

      "& fieldset": {
        borderColor: theme.palette.divider,
      },

      "&:hover fieldset": {
        borderColor: theme.palette.primary.main,
      },

      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },

    "& input": {
      fontSize: 14,
    },
  };

  const selectStyle: SxProps<Theme> = {
    minHeight: 40,

    borderRadius: "8px",

    "& .MuiSelect-select": {
      fontSize: 14,

      display: "flex",

      alignItems: "center",

      flexWrap: "wrap",

      gap: 0.5,
    },
  };

  const labelStyle: SxProps<Theme> = {
    fontSize: 13,

    fontWeight: 500,

    color: theme.palette.text.primary,

    mb: 0.8,
  };

  // Menu props

  const menuProps = {
    slotProps: {
      paper: {
        sx: {
          maxHeight: 300,
          borderRadius: "8px",
        },
      },
    },
  };

  // UI

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={{
        zIndex: theme.zIndex.modal,
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0,0,0,0.25)",

            backdropFilter: "blur(6px)",
          },
        },

        paper: {
          sx: {
            width: {
              xs: "100%",
              sm: 380,
            },

            height: "100vh",

            overflow: "visible",
          },
        },
      }}
    >
      <Box
        sx={{
          height: "100%",

          display: "flex",

          flexDirection: "column",

          bgcolor: "background.paper",
        }}
      >
        {/* Header */}

        <Box
          sx={{
            height: 72,

            px: 3,

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
            {isEditMode ? "Edit Company" : "Create Company"}
          </Typography>

          <IconButton
            onClick={handleClose}
            disabled={saving}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "8px",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Body */}

        <Box
          sx={{
            flex: 1,

            px: 3,

            py: 3,

            overflowY: "auto",

            display: "flex",

            flexDirection: "column",

            gap: 2,
          }}
        >
          {apiError && (
            <Alert
              severity="error"
              sx={{
                whiteSpace: "pre-line",
              }}
            >
              {apiError}
            </Alert>
          )}

          {usersLoading && users.length === 0 && (
            <Alert severity="info">Loading company owners...</Alert>
          )}

          {/* Domain */}

          <Field
            label="Domain Name"
            required
            value={form.domain}
            placeholder="Enter"
            sx={inputStyle}
            error={!!errors.domain}
            helperText={errors.domain}
            onChange={(value) => updateField("domain", value)}
          />

          {/* Company name */}

          <Field
            label="Company Name"
            required
            value={form.companyName}
            placeholder="Enter"
            sx={inputStyle}
            error={!!errors.companyName}
            helperText={errors.companyName}
            onChange={(value) => updateField("companyName", value)}
          />

          {/* Company owners */}

          <Box>
            <Typography sx={labelStyle}>
              Company Owners
              <span
                style={{
                  color: "#E53935",
                }}
              >
                {" "}
                *
              </span>
            </Typography>

            <Select
              fullWidth
              multiple
              displayEmpty
              value={form.owner}
              error={!!errors.owner}
              sx={selectStyle}
              MenuProps={menuProps}
              renderValue={(selected) => {
                const selectedIds = selected as number[];

                if (selectedIds.length === 0) {
                  return (
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: 14,
                      }}
                    >
                      Choose owners
                    </Typography>
                  );
                }

                return (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    {selectedIds.map((id) => (
                      <Chip key={id} size="small" label={getUserName(id)} />
                    ))}
                  </Box>
                );
              }}
              onChange={(event) => {
                const value = event.target.value;

                const ownerIds =
                  typeof value === "string"
                    ? value.split(",").map(Number)
                    : value.map(Number);

                updateField("owner", ownerIds);
              }}
            >
              <MenuItem disabled value="">
                Choose owners
              </MenuItem>

              {users.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  <Checkbox checked={form.owner.includes(item.id)} />

                  <ListItemText
                    primary={`${item.first_name} ${item.last_name}`}
                    secondary={item.email}
                  />
                </MenuItem>
              ))}
            </Select>

            {errors.owner && (
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 12,
                  color: "error.main",
                }}
              >
                {errors.owner}
              </Typography>
            )}
          </Box>

          {/* Industry / type */}

          <Box
            sx={{
              display: "flex",
              gap: 3,
            }}
          >
            <SelectField
              label="Industry"
              required
              value={form.industry}
              options={industries}
              error={errors.industry}
              selectStyle={selectStyle}
              menuProps={menuProps}
              onChange={(value) => updateField("industry", value)}
            />

            <SelectField
              label="Type"
              required
              value={form.type}
              options={companyTypes}
              error={errors.type}
              selectStyle={selectStyle}
              menuProps={menuProps}
              onChange={(value) => updateField("type", value)}
            />
          </Box>

          {/* City / country */}

          <TwoFields
            left="City"
            right="Country/Region"
            leftValue={form.city}
            rightValue={form.countryRegion}
            inputStyle={inputStyle}
            onLeftChange={(value) => updateField("city", value)}
            onRightChange={(value) => updateField("countryRegion", value)}
          />

          {/* Employees / revenue */}

          <TwoFields
            left="No of Employees"
            right="Annual Revenue"
            leftValue={form.employees}
            rightValue={form.revenue}
            inputStyle={inputStyle}
            onLeftChange={(value) => updateField("employees", value)}
            onRightChange={(value) => updateField("revenue", value)}
          />

          {/* Phone */}

          <Box>
            <Typography sx={labelStyle}>
              Phone Number
              <span
                style={{
                  color: "#E53935",
                }}
              >
                {" "}
                *
              </span>
            </Typography>

            <Box
              sx={{
                height: 40,

                display: "flex",

                alignItems: "center",

                border: `1px solid ${
                  errors.phone
                    ? theme.palette.error.main
                    : theme.palette.divider
                }`,

                borderRadius: "8px",

                "&:focus-within": {
                  borderColor: errors.phone
                    ? theme.palette.error.main
                    : theme.palette.primary.main,
                },
              }}
            >
              {/* Country */}

              <Select
                value={country}
                variant="standard"
                disableUnderline
                displayEmpty
                MenuProps={menuProps}
                onChange={(event) => {
                  const selected = event.target.value as Country;

                  setCountry(selected);

                  updateField("phone", "");

                  setErrors((prev) => ({
                    ...prev,
                    phone: "",
                  }));
                }}
                sx={{
                  width: 75,

                  "& .MuiSelect-select": {
                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    minHeight: "40px",

                    padding: "0 8px",
                  },
                }}
              >
                <MenuItem value="">
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    Choose
                  </Typography>
                </MenuItem>

                <MenuItem value="india">
                  <IN width={24} />
                </MenuItem>

                <MenuItem value="uae">
                  <AE width={24} />
                </MenuItem>

                <MenuItem value="usa">
                  <US width={24} />
                </MenuItem>

                <MenuItem value="uk">
                  <GB width={24} />
                </MenuItem>
              </Select>

              {/* Divider */}

              <Box
                sx={{
                  width: "1px",
                  height: 24,
                  bgcolor: theme.palette.divider,
                }}
              />

              {/* Phone input */}

              <TextField
                fullWidth
                placeholder={country ? "Enter" : "Select country first"}
                value={form.phone}
                disabled={!country}
                onChange={(event) => updatePhone(event.target.value)}
                error={!!errors.phone}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 40,

                    "& fieldset": {
                      border: 0,
                    },
                  },

                  "& .MuiInputBase-input": {
                    fontSize: 14,
                  },
                }}
              />
            </Box>

            {errors.phone && (
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 12,
                  color: "error.main",
                }}
              >
                {errors.phone}
              </Typography>
            )}
          </Box>

          {/* Email */}

          <Field
            label="Email"
            required
            value={form.email}
            placeholder="Enter"
            sx={inputStyle}
            error={!!errors.email}
            helperText={errors.email}
            onChange={(value) => updateField("email", value)}
          />
        </Box>

        {/* Footer */}

        <Box
          sx={{
            height: 80,

            px: 3,

            display: "flex",

            gap: 1.5,

            alignItems: "center",

            borderTop: `1px solid ${theme.palette.divider}`,

            flexShrink: 0,
          }}
        >
          <Button
            fullWidth
            onClick={handleClose}
            disabled={saving}
            sx={{
              height: 40,

              border: "1px solid",

              borderColor: "divider",

              color: "text.secondary",

              borderRadius: "8px",

              textTransform: "none",

              fontSize: 14,

              fontWeight: 500,
            }}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            sx={{
              height: 40,

              borderRadius: "8px",

              textTransform: "none",

              fontSize: 14,

              fontWeight: 500,

              boxShadow: "none",

              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </Box>

        {/* Success message */}

        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setSuccess(false)}
          >
            {isEditMode
              ? "Company updated successfully"
              : "Company created successfully"}
          </Alert>
        </Snackbar>
      </Box>
    </Drawer>
  );
}

// Field component

function Field({
  label,
  required,
  placeholder,
  value,
  error,
  helperText,
  sx,
  onChange,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  error?: boolean;
  helperText?: string;
  sx: SxProps<Theme>;
  onChange: (value: string) => void;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 500,
          mb: 0.8,
          color: "text.primary",
        }}
      >
        {label}

        {required && (
          <span
            style={{
              color: "#E53935",
            }}
          >
            {" "}
            *
          </span>
        )}
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={value}
        error={error}
        helperText={helperText}
        sx={sx}
        onChange={(event) => onChange(event.target.value)}
      />
    </Box>
  );
}

// Select field

function SelectField({
  label,
  required,
  value,
  options,
  error,
  selectStyle,
  menuProps,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  error?: string;
  selectStyle: SxProps<Theme>;
  menuProps: any;
  onChange: (value: string) => void;
}) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 500,
          mb: 0.8,
          color: "text.primary",
        }}
      >
        {label}

        {required && (
          <span
            style={{
              color: "#E53935",
            }}
          >
            {" "}
            *
          </span>
        )}
      </Typography>

      <Select
        fullWidth
        displayEmpty
        value={value}
        error={!!error}
        sx={selectStyle}
        MenuProps={menuProps}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">Choose</MenuItem>

        {options.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>

      {error && (
        <Typography
          sx={{
            mt: 0.5,
            fontSize: 12,
            color: "error.main",
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}

// Two fields

function TwoFields({
  left,
  right,
  leftValue,
  rightValue,
  inputStyle,
  onLeftChange,
  onRightChange,
}: {
  left: string;
  right: string;
  leftValue: string;
  rightValue: string;
  inputStyle: SxProps<Theme>;
  onLeftChange: (value: string) => void;
  onRightChange: (value: string) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
      }}
    >
      {/* Left */}

      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 500,
            mb: 0.8,
            color: "text.primary",
          }}
        >
          {left}
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Enter"
          value={leftValue}
          sx={inputStyle}
          onChange={(event) => onLeftChange(event.target.value)}
        />
      </Box>

      {/* Right */}

      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 500,
            mb: 0.8,
            color: "text.primary",
          }}
        >
          {right}
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Enter"
          value={rightValue}
          sx={inputStyle}
          onChange={(event) => onRightChange(event.target.value)}
        />
      </Box>
    </Box>
  );
}
