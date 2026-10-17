"use client";

import { useEffect, useState } from "react";

import api from "@/api/axios";

import { useAppDispatch } from "@/store/hooks";
import { createLead } from "@/store/slices/leadSlice";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
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
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";

import { AE, IN, US, GB } from "country-flag-icons/react/3x2";

// =====================================================
// TYPES
// =====================================================

type Props = {
  open: boolean;
  lead?: any | null;
  onClose: () => void;
  onCreated: () => void;
};

type Country = "uae" | "india" | "usa" | "uk";

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  owner: string[];
  status: string;
  product: string[];
  company: string;
  city: string;
};

type BackendUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type BackendCompany = {
  id: number;
  company_name: string;
  email: string;
};

type BackendProduct = {
  id: number;
  name: string;
  sku: string;
  price: string | number;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// =====================================================
// COUNTRY CONFIG
// =====================================================

const countries = {
  uae: {
    dial: "+971",
    maxLength: 9,
    Flag: AE,
  },

  india: {
    dial: "+91",
    maxLength: 10,
    Flag: IN,
  },

  usa: {
    dial: "+1",
    maxLength: 10,
    Flag: US,
  },

  uk: {
    dial: "+44",
    maxLength: 10,
    Flag: GB,
  },
};

const countryByDialCode: Record<string, Country> = {
  "+971": "uae",
  "+91": "india",
  "+1": "usa",
  "+44": "uk",
};

// =====================================================
// LEAD STATUSES
// =====================================================

const leadStatuses = [
  {
    id: "new",
    label: "New Lead",
  },
  {
    id: "contacted",
    label: "Contacted",
  },
  {
    id: "qualified",
    label: "Qualified",
  },
  {
    id: "proposal_sent",
    label: "Proposal Sent",
  },
  {
    id: "negotiation",
    label: "Negotiation",
  },
  {
    id: "converted",
    label: "Converted",
  },
  {
    id: "lost",
    label: "Lost",
  },
];

// =====================================================
// INITIAL FORM
// =====================================================

const initialForm: FormData = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  jobTitle: "",
  owner: [],
  status: "",
  product: [],
  company: "",
  city: "",
};

// =====================================================
// COMPONENT
// =====================================================

export default function CreateLeadForm({
  open,
  lead,
  onClose,
  onCreated,
}: Props) {
  const theme = useTheme();

  const dispatch = useAppDispatch();

  // ===================================================
  // STATE
  // ===================================================

  const [form, setForm] = useState<FormData>(initialForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [country, setCountry] = useState<Country>("uae");

  const [success, setSuccess] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [owners, setOwners] = useState<BackendUser[]>([]);

  const [products, setProducts] = useState<BackendProduct[]>([]);

  const [companies, setCompanies] = useState<BackendCompany[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(false);

  const [saving, setSaving] = useState(false);

  // ===================================================
  // LOAD CREATE / EDIT DATA
  // ===================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    // CREATE MODE
    if (!lead) {
      setForm(initialForm);
      setCountry("uae");
      setErrors({});

      return;
    }

    // EDIT MODE

    setCountry(countryByDialCode[lead.country_code] || "uae");

    setForm({
      email: lead.email || "",

      firstName: lead.first_name || "",

      lastName: lead.last_name || "",

      phone: lead.phone_number || "",

      jobTitle: lead.job_title || "",

      owner: Array.isArray(lead.contact_owners)
        ? lead.contact_owners.map((owner: any) => String(owner.id))
        : [],

      status: lead.lead_status || "",

      product: Array.isArray(lead.products)
        ? lead.products.map((product: any) => String(product.id))
        : [],

      company: lead.company ? String(lead.company.id) : "",

      city: lead.city || "",
    });

    setErrors({});
  }, [open, lead]);

  // ===================================================
  // LOAD OPTIONS
  // ===================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchFormOptions = async () => {
      try {
        setLoadingOptions(true);

        const [usersResponse, companiesResponse, productsResponse] =
          await Promise.all([
            api.get("/users/"),
            api.get("/companies/"),
            api.get("/products/"),
          ]);

        // USERS

        const usersData = usersResponse.data;

        const users = Array.isArray(usersData)
          ? usersData
          : usersData?.results || [];

        setOwners(users);

        // COMPANIES

        const companiesData = companiesResponse.data as
          | PaginatedResponse<BackendCompany>
          | BackendCompany[];

        setCompanies(
          Array.isArray(companiesData)
            ? companiesData
            : companiesData.results || [],
        );

        // PRODUCTS

        const productsData = productsResponse.data as
          | PaginatedResponse<BackendProduct>
          | BackendProduct[];

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : productsData.results || [],
        );
      } catch {
        // Optional dropdown data
        // should not break form.
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchFormOptions();
  }, [open]);

  // ===================================================
  // UPDATE FIELD
  // ===================================================

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  // ===================================================
  // PHONE
  // ===================================================

  const updatePhone = (value: string) => {
    const number = value.replace(/\D/g, "");

    updateField("phone", number.slice(0, countries[country].maxLength));
  };

  // ===================================================
  // RESET
  // ===================================================

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setCountry("uae");
    setSaving(false);
  };

  // ===================================================
  // CLOSE
  // ===================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    resetForm();

    onClose();
  };

  // ===================================================
  // VALIDATION
  // ===================================================

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = "Minimum 2 characters required";
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = "Minimum 2 characters required";
    }

    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (form.phone.length !== countries[country].maxLength) {
      newErrors.phone = `Enter valid ${countries[country].maxLength} digit number`;
    }

    if (form.owner.length === 0) {
      newErrors.owner = "Owner is required";
    }

    if (!form.status) {
      newErrors.status = "Lead status is required";
    }

    if (form.product.length === 0) {
      newErrors.product = "Product is required";
    }

    if (!form.company) {
      newErrors.company = "Company is required";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ===================================================
  // STYLES
  // ===================================================

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

      minHeight: "40px",
      boxSizing: "border-box",
    },
  };

  const labelStyle: SxProps<Theme> = {
    fontSize: 13,
    fontWeight: 500,
    mb: 0.8,
    color: theme.palette.text.primary,
  };

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

  // ===================================================
  // OWNER NAME
  // ===================================================

  const getOwnerName = (ownerId: string) => {
    const owner = owners.find((item) => String(item.id) === ownerId);

    if (!owner) {
      return `User ${ownerId}`;
    }

    return `${owner.first_name} ${owner.last_name}`.trim() || owner.email;
  };

  // ===================================================
  // HANDLE SUBMIT
  // ===================================================

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const leadData = {
      email: form.email.trim(),

      first_name: form.firstName.trim(),

      last_name: form.lastName.trim(),

      phone_number: form.phone,

      country_code: countries[country].dial,

      job_title: form.jobTitle.trim(),

      lead_status: form.status,

      city: form.city.trim(),

      contact_owner_ids: form.owner.map(Number),

      company_id: form.company ? Number(form.company) : null,

      product_ids: form.product.map(Number),
    };

    try {
      setSaving(true);

      /* =================================================
   EDIT
================================================= */

      if (lead) {
        await api.patch(`/leads/${lead.id}/`, leadData);

        // IMPORTANT:
        // Show success FIRST.
        setSuccessMessage("Lead updated successfully");

        setSuccess(true);

        // Refresh parent data.
        onCreated();

        // Notify any open Deal Detail page
        // that this Lead was updated.
        window.dispatchEvent(
          new CustomEvent("lead-updated", {
            detail: {
              leadId: lead.id,
            },
          }),
        );

        // Close AFTER snackbar has been visible.
        setTimeout(() => {
          setSaving(false);
          resetForm();
          onClose();
        }, 1800);

        return;
      }
      // =================================================
      // CREATE
      // =================================================

      const result = await dispatch(createLead(leadData));

      if (createLead.fulfilled.match(result)) {
        setSuccessMessage("Lead created successfully");

        setSuccess(true);

        onCreated();

        setTimeout(() => {
          setSaving(false);
          resetForm();
          onClose();
        }, 1800);
      } else {
        setSaving(false);
      }
    } catch (error) {
      console.error("Lead save error:", error);

      setSaving(false);
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <>
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
          {/* HEADER */}

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
              {lead ? "Edit Lead" : "Create Lead"}
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

          {/* BODY */}

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
            {/* EMAIL */}

            <Field
              label="Email"
              required
              value={form.email}
              placeholder="Enter"
              sx={inputStyle}
              icon={<EmailIcon fontSize="small" />}
              error={!!errors.email}
              helperText={errors.email}
              onChange={(value) => updateField("email", value)}
            />

            {/* FIRST NAME */}

            <Field
              label="First Name"
              required
              value={form.firstName}
              placeholder="Enter"
              sx={inputStyle}
              error={!!errors.firstName}
              helperText={errors.firstName}
              onChange={(value) => updateField("firstName", value)}
            />

            {/* LAST NAME */}

            <Field
              label="Last Name"
              required
              value={form.lastName}
              placeholder="Enter"
              sx={inputStyle}
              error={!!errors.lastName}
              helperText={errors.lastName}
              onChange={(value) => updateField("lastName", value)}
            />

            {/* PHONE */}

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
                <Select
                  value={country}
                  variant="standard"
                  disableUnderline
                  MenuProps={menuProps}
                  disabled={saving}
                  onChange={(event) => {
                    setCountry(event.target.value as Country);

                    updateField("phone", "");
                  }}
                  sx={{
                    width: 70,

                    "& .MuiSelect-select": {
                      display: "flex",

                      justifyContent: "center",

                      alignItems: "center",

                      minHeight: "40px",

                      padding: "0 8px",
                    },
                  }}
                >
                  <MenuItem value="uae">
                    <AE width={24} />
                  </MenuItem>

                  <MenuItem value="india">
                    <IN width={24} />
                  </MenuItem>

                  <MenuItem value="usa">
                    <US width={24} />
                  </MenuItem>

                  <MenuItem value="uk">
                    <GB width={24} />
                  </MenuItem>
                </Select>

                <Box
                  sx={{
                    width: "1px",
                    height: 24,
                    bgcolor: theme.palette.divider,
                  }}
                />

                <TextField
                  fullWidth
                  placeholder="Enter"
                  value={form.phone}
                  disabled={saving}
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

            {/* JOB TITLE */}

            <Field
              label="Job Title"
              value={form.jobTitle}
              placeholder="Enter"
              sx={inputStyle}
              error={!!errors.jobTitle}
              helperText={errors.jobTitle}
              onChange={(value) => updateField("jobTitle", value)}
            />

            {/* CONTACT OWNER */}

            <Box>
              <Typography sx={labelStyle}>
                Contact Owner
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
                  const selectedIds = selected as string[];

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
                        <Chip key={id} size="small" label={getOwnerName(id)} />
                      ))}
                    </Box>
                  );
                }}
                onChange={(event) => {
                  const value = event.target.value;

                  const ownerIds =
                    typeof value === "string"
                      ? value.split(",")
                      : value.map(String);

                  updateField("owner", ownerIds);
                }}
              >
                {owners.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    <Checkbox checked={form.owner.includes(String(item.id))} />

                    <ListItemText
                      primary={`${item.first_name} ${item.last_name}`.trim()}
                      secondary={`${item.role} • ${item.email}`}
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

            {/* STATUS */}

            <Box>
              <Typography sx={labelStyle}>
                Lead Status
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
                displayEmpty
                value={form.status}
                error={!!errors.status}
                sx={selectStyle}
                MenuProps={menuProps}
                renderValue={(selected) => {
                  const item = leadStatuses.find(
                    (status) => status.id === selected,
                  );

                  return item ? (
                    item.label
                  ) : (
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: 14,
                      }}
                    >
                      Choose status
                    </Typography>
                  );
                }}
                onChange={(event) =>
                  updateField("status", event.target.value as string)
                }
              >
                <MenuItem value="">Choose status</MenuItem>

                {leadStatuses.map((status) => (
                  <MenuItem key={status.id} value={status.id}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>

              {errors.status && (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: "error.main",
                  }}
                >
                  {errors.status}
                </Typography>
              )}
            </Box>

            {/* PRODUCTS */}

            <Box>
              <Typography sx={labelStyle}>
                Products
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
                value={form.product}
                error={!!errors.product}
                sx={selectStyle}
                MenuProps={menuProps}
                renderValue={(selected) => {
                  const selectedIds = selected as string[];

                  if (selectedIds.length === 0) {
                    return (
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: 14,
                        }}
                      >
                        Choose products
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
                      {selectedIds.map((id) => {
                        const product = products.find(
                          (item) => String(item.id) === id,
                        );

                        return (
                          <Chip
                            key={id}
                            size="small"
                            label={product?.name || `Product ${id}`}
                          />
                        );
                      })}
                    </Box>
                  );
                }}
                onChange={(event) => {
                  const value = event.target.value;

                  const productIds =
                    typeof value === "string"
                      ? value.split(",")
                      : value.map(String);

                  updateField("product", productIds);
                }}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={String(product.id)}>
                    <Checkbox
                      checked={form.product.includes(String(product.id))}
                    />

                    <ListItemText
                      primary={product.name}
                      secondary={`${product.sku} • ${product.price}`}
                    />
                  </MenuItem>
                ))}
              </Select>

              {errors.product && (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: "error.main",
                  }}
                >
                  {errors.product}
                </Typography>
              )}
            </Box>

            {/* COMPANY */}

            <Box>
              <Typography sx={labelStyle}>
                Company
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
                displayEmpty
                value={form.company}
                error={!!errors.company}
                sx={selectStyle}
                MenuProps={menuProps}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: 14,
                        }}
                      >
                        Choose company
                      </Typography>
                    );
                  }

                  const company = companies.find(
                    (item) => String(item.id) === String(selected),
                  );

                  return company?.company_name || "Choose company";
                }}
                onChange={(event) =>
                  updateField("company", event.target.value as string)
                }
              >
                <MenuItem value="">Choose company</MenuItem>

                {companies.map((company) => (
                  <MenuItem key={company.id} value={String(company.id)}>
                    <ListItemText
                      primary={company.company_name}
                      secondary={company.email}
                    />
                  </MenuItem>
                ))}
              </Select>

              {errors.company && (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: "error.main",
                  }}
                >
                  {errors.company}
                </Typography>
              )}
            </Box>

            {/* CITY */}

            <Field
              label="City"
              required
              value={form.city}
              placeholder="Enter"
              sx={inputStyle}
              error={!!errors.city}
              helperText={errors.city}
              onChange={(value) => updateField("city", value)}
            />

            {/* LOADING */}

            {loadingOptions && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Loading owners, companies and products...
              </Typography>
            )}
          </Box>

          {/* FOOTER */}

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
              {saving
                ? lead
                  ? "Updating..."
                  : "Saving..."
                : lead
                  ? "Update"
                  : "Save"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* =================================================
          SUCCESS SNACKBAR
          IMPORTANT: OUTSIDE DRAWER
      ================================================= */}

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          zIndex: theme.zIndex.modal + 100,
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccess(false)}
          sx={{
            minWidth: 280,
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

// =====================================================
// FIELD COMPONENT
// =====================================================

function Field({
  label,
  required,
  placeholder,
  value,
  error,
  helperText,
  icon,
  sx,
  onChange,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  error?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
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
        slotProps={{
          input: {
            startAdornment: icon ? (
              <Box
                sx={{
                  mr: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {icon}
              </Box>
            ) : null,
          },
        }}
        onChange={(event) => onChange(event.target.value)}
      />
    </Box>
  );
}
