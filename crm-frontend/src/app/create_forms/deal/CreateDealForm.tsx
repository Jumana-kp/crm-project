"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { createDeal, updateDeal } from "@/store/slices/dealSlice";

import type { Deal } from "@/store/slices/dealSlice";

import { fetchLeads } from "@/store/slices/leadSlice";

import { fetchUsers } from "@/store/slices/userSlice";

import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Button,
  IconButton,
  useTheme,
  Chip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import Drawer from "@mui/material/Drawer";

import type { SelectChangeEvent } from "@mui/material/Select";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";

/* PROPS */

type CreateDealDrawerProps = {
  open: boolean;
  onClose: () => void;
  deal?: Deal | null;
  initialLeadId?: number | null;
};

/* FORM DATA */

type DealFormData = {
  dealName: string;
  dealStage: string;
  associatedLead: string;
  amount: string;
  dealOwner: number[];
  closeDate: string;
  priority: string;
};

/* COMPONENT */

export default function CreateDealDrawer({
  open,
  onClose,
  deal,
  initialLeadId = null,
}: CreateDealDrawerProps) {
  const theme = useTheme();

  const dispatch = useAppDispatch();

  const isEditMode = Boolean(deal);

  /*
   * Lead Detail -> Convert mode.
   *
   * In this mode the Associated Lead is locked because
   * the Deal is being created from a specific Lead.
   */
  const isLeadLocked =
    !isEditMode && initialLeadId !== null && initialLeadId !== undefined;

  /* FORM STATE */

  const [formData, setFormData] = useState<DealFormData>({
    dealName: "",
    dealStage: "",
    associatedLead: "",
    amount: "",
    dealOwner: [],
    closeDate: "",
    priority: "",
  });

  /* ERRORS */

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* REDUX */

  const saving = useAppSelector((state) => state.deals?.saving ?? false);

  const saveError = useAppSelector((state) => state.deals?.saveError ?? null);

  const users = useAppSelector((state) => state.users?.users ?? []);

  const leads = useAppSelector((state) => state.leads?.leads ?? []);

  const leadsLoading = useAppSelector((state) => state.leads?.loading ?? false);

  const leadsError = useAppSelector((state) => state.leads?.error ?? null);

  /* QUALIFIED LEADS */

  const qualifiedLeads = leads.filter((lead: any) => {
    const status = String(lead.lead_status ?? lead.status ?? "")
      .trim()
      .toLowerCase();

    return status === "qualified";
  });

  /* CURRENT EDIT LEAD */

  /*
   * IMPORTANT:
   *
   * For an imported Deal, the API returns:
   *
   * deal.lead = {
   *   id: 33,
   *   first_name: "...",
   *   last_name: "...",
   *   email: "..."
   * }
   *
   * The Lead may NOT be present in the currently loaded
   * paginated qualifiedLeads array.
   *
   * Therefore we always use deal.lead as the source of
   * truth for the currently associated Lead in edit mode.
   */
  const currentDealLead = isEditMode && deal?.lead ? deal.lead : null;

  /* CURRENT INITIAL LEAD */

  /*
   * Used when creating a Deal from Lead Detail.
   */
  const initialLead =
    initialLeadId !== null && initialLeadId !== undefined
      ? leads.find((lead: any) => Number(lead.id) === Number(initialLeadId))
      : null;

  /* LEAD OPTIONS */

  /*
   * CREATE FROM LEAD DETAIL:
   *
   * Show the current Lead even if it is not in the first
   * page of fetched Leads.
   */
  const leadOptions = (() => {
    /*
     * Lead Detail -> Create Deal
     */
    if (isLeadLocked) {
      if (initialLead) {
        return [initialLead];
      }

      return [
        {
          id: initialLeadId,
          first_name: "",
          last_name: "",
          email: "",
        },
      ];
    }

    /*
     * EDIT DEAL
     *
     * Always include the Deal's associated Lead.
     *
     * This is the important fix for imported Deals.
     */
    if (isEditMode && currentDealLead) {
      const alreadyExists = qualifiedLeads.some(
        (lead: any) => Number(lead.id) === Number(currentDealLead.id),
      );

      if (alreadyExists) {
        return qualifiedLeads;
      }

      return [currentDealLead, ...qualifiedLeads];
    }

    /*
     * NORMAL CREATE DEAL
     */
    return qualifiedLeads;
  })();

  /* LOAD USERS + LEADS */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (users.length === 0) {
      dispatch(fetchUsers());
    }

    if (leads.length === 0) {
      dispatch(
        fetchLeads({
          page: 1,
        }),
      );
    }
  }, [open, users.length, leads.length, dispatch]);

  /* INITIALIZE FORM */

  useEffect(() => {
    if (!open) {
      return;
    }

    /* CREATE MODE */

    if (!deal) {
      setFormData({
        dealName: "",

        /*
         * Deal Stage is intentionally not selected
         * automatically.
         */
        dealStage: "",

        /*
         * Automatically associate the Lead when the
         * drawer was opened from Lead Detail.
         */
        associatedLead:
          initialLeadId !== null && initialLeadId !== undefined
            ? String(initialLeadId)
            : "",

        amount: "",
        dealOwner: [],
        closeDate: "",
        priority: "",
      });

      setErrors({});

      return;
    }

    /* EDIT MODE */

    /*
     * IMPORTANT:
     *
     * GET Deal response:
     *
     * {
     *   "lead": {
     *     "id": 33
     *   }
     * }
     *
     * We MUST use:
     *
     * deal.lead.id
     *
     * NOT:
     *
     * deal.lead_id
     *
     * because lead_id is the write field.
     */
    const associatedLeadId =
      deal.lead?.id !== undefined && deal.lead?.id !== null
        ? String(deal.lead.id)
        : "";

    setFormData({
      dealName: deal.deal_name ?? "",
      dealStage: deal.stage ?? "",
      associatedLead: associatedLeadId,

      amount:
        deal.amount !== undefined && deal.amount !== null
          ? String(deal.amount)
          : "",

      dealOwner: Array.isArray(deal.owners)
        ? deal.owners.map((owner) => owner.id)
        : [],

      closeDate: deal.close_date ?? "",
      priority: deal.priority ?? "",
    });

    setErrors({});
  }, [open, deal, initialLeadId]);

  /* BODY SCROLL */

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  /* NORMAL FIELD CHANGE */

  const handleChange = (field: keyof DealFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  /* OWNER CHANGE */

  const handleDealOwnerChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;

    const ownerIds =
      typeof value === "string"
        ? value.split(",").filter(Boolean).map(Number)
        : value;

    setFormData((previous) => ({
      ...previous,
      dealOwner: ownerIds,
    }));

    setErrors((previous) => ({
      ...previous,
      dealOwner: "",
    }));
  };

  /* VALIDATION */

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    /* DEAL NAME */

    if (!formData.dealName.trim()) {
      newErrors.dealName = "Deal Name is required";
    } else if (formData.dealName.trim().length < 3) {
      newErrors.dealName = "Minimum 3 characters required";
    }

    /* DEAL STAGE */

    if (!formData.dealStage) {
      newErrors.dealStage = "Deal Stage is required";
    }

    /* ASSOCIATED LEAD */

    if (!formData.associatedLead) {
      newErrors.associatedLead = "Associated Lead is required";
    } else if (!isEditMode) {
      /*
       * When creating normally, only Qualified Leads can
       * be selected.
       *
       * When creating from Lead Detail, the Lead is already
       * validated by the Lead page.
       */
      if (!isLeadLocked) {
        const selectedLead = qualifiedLeads.find(
          (lead: any) => String(lead.id) === formData.associatedLead,
        );

        if (!selectedLead) {
          newErrors.associatedLead =
            "Only Qualified Leads can be associated with a Deal";
        }
      }
    }

    /* AMOUNT */

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (
      Number.isNaN(Number(formData.amount)) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = "Enter a valid amount";
    }

    /* OWNER */

    if (formData.dealOwner.length === 0) {
      newErrors.dealOwner = "Deal Owner is required";
    }

    /* CLOSE DATE */

    if (!formData.closeDate) {
      newErrors.closeDate = "Close Date is required";
    }

    /* PRIORITY */

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* SAVE DEAL */

  const handleSave = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    /* PAYLOAD */

    const payload = {
      deal_name: formData.dealName.trim(),

      /*
       * Backend expects lead_id for POST/PATCH.
       */
      lead_id: Number(formData.associatedLead),

      owner_ids: formData.dealOwner,

      amount: formData.amount.trim(),

      stage: formData.dealStage,

      priority: formData.priority,

      close_date: formData.closeDate,
    };

    try {
      /* EDIT */

      if (isEditMode && deal) {
        await dispatch(
          updateDeal({
            id: deal.id,
            data: payload,
          }),
        ).unwrap();
      } else {
        /* CREATE */

        await dispatch(createDeal(payload)).unwrap();
      }

      /* CLOSE */

      onClose();
    } catch {
      /*
       * saveError is handled by Redux.
       */
    }
  };

  /* RENDER */

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <>
        {/* OVERLAY */}

        {open && (
          <Box
            onClick={onClose}
            sx={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15,23,42,0.35)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 1100,
            }}
          />
        )}

        {/* DRAWER */}

        <Drawer
          anchor="right"
          open={open}
          onClose={onClose}
          hideBackdrop
          sx={{
            zIndex: 1200,
          }}
          slotProps={{
            paper: {
              sx: {
                width: 380,
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: theme.palette.background.paper,
                borderRadius: 0,
              },
            },
          }}
        >
          {/* HEADER */}

          <Box
            sx={{
              height: 60,
              px: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {isEditMode ? "Edit Deal" : "Create Deal"}
            </Typography>

            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* BODY */}

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: 2.5,
              py: 3,
            }}
          >
            {/* DEAL NAME */}

            <FieldLabel text="Deal Name" />

            <TextField
              fullWidth
              size="small"
              placeholder="Enter"
              value={formData.dealName}
              onChange={(event) => handleChange("dealName", event.target.value)}
              error={Boolean(errors.dealName)}
              helperText={errors.dealName}
              sx={inputStyle}
            />

            {/* DEAL STAGE */}

            <FieldLabel text="Deal Stage" mt={3} />

            <FormControl
              fullWidth
              size="small"
              error={Boolean(errors.dealStage)}
            >
              <Select
                displayEmpty
                value={formData.dealStage}
                IconComponent={KeyboardArrowDownIcon}
                MenuProps={selectMenuProps}
                onChange={(event) =>
                  handleChange("dealStage", event.target.value)
                }
                sx={inputStyle}
              >
                <MenuItem value="">Choose</MenuItem>

                <MenuItem value="new">New</MenuItem>

                <MenuItem value="qualified">Qualified</MenuItem>

                <MenuItem value="proposal">Proposal</MenuItem>

                <MenuItem value="negotiation">Negotiation</MenuItem>

                <MenuItem value="closed_won">Closed Won</MenuItem>

                <MenuItem value="closed_lost">Closed Lost</MenuItem>
              </Select>
            </FormControl>

            {errors.dealStage && <ErrorText>{errors.dealStage}</ErrorText>}

            {/* ASSOCIATED LEAD */}

            <FieldLabel text="Associated Lead" mt={3} />

            <FormControl
              fullWidth
              size="small"
              error={Boolean(errors.associatedLead)}
            >
              <Select
                displayEmpty
                value={formData.associatedLead}
                disabled={isLeadLocked}
                IconComponent={KeyboardArrowDownIcon}
                MenuProps={selectMenuProps}
                onChange={(event) =>
                  handleChange("associatedLead", event.target.value)
                }
                sx={{
                  ...inputStyle,

                  "& .MuiSelect-select.Mui-disabled": {
                    WebkitTextFillColor: "#1F2937",

                    color: "#1F2937",

                    opacity: 1,
                  },

                  "& .MuiOutlinedInput-root.Mui-disabled": {
                    backgroundColor: "#F3F4F6",
                  },
                }}
              >
                <MenuItem value="">
                  {leadsLoading
                    ? "Loading qualified leads..."
                    : leadOptions.length === 0
                      ? "No qualified leads available"
                      : "Choose"}
                </MenuItem>

                {leadOptions.map((lead: any) => {
                  const name = `${lead.first_name ?? ""} ${
                    lead.last_name ?? ""
                  }`.trim();

                  return (
                    <MenuItem key={lead.id} value={String(lead.id)}>
                      {name || lead.email || `Lead #${lead.id}`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {/* AUTO SELECTED LEAD MESSAGE */}

            {isLeadLocked && (
              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 11,
                  color: "text.secondary",
                }}
              >
                Associated automatically from the current Lead.
              </Typography>
            )}

            {isEditMode && currentDealLead && (
              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 11,
                  color: "text.secondary",
                }}
              >
                Associated Lead is loaded from this Deal.
              </Typography>
            )}

            {leadsError && <ErrorText>Failed to load leads</ErrorText>}

            {errors.associatedLead && (
              <ErrorText>{errors.associatedLead}</ErrorText>
            )}

            {/* AMOUNT */}

            <FieldLabel text="Amount" mt={3} />

            <TextField
              fullWidth
              size="small"
              placeholder="Enter"
              value={formData.amount}
              onChange={(event) => handleChange("amount", event.target.value)}
              error={Boolean(errors.amount)}
              helperText={errors.amount}
              sx={inputStyle}
              slotProps={{
                htmlInput: {
                  inputMode: "decimal",
                },
              }}
            />

            {/* DEAL OWNER */}

            <FieldLabel text="Deal Owner" mt={3} />

            <FormControl
              fullWidth
              size="small"
              error={Boolean(errors.dealOwner)}
            >
              <Select
                multiple
                value={formData.dealOwner}
                onChange={handleDealOwnerChange}
                IconComponent={KeyboardArrowDownIcon}
                MenuProps={selectMenuProps}
                sx={inputStyle}
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    {selected.map((userId) => {
                      const user = users.find((item) => item.id === userId);

                      if (!user) {
                        return null;
                      }

                      return (
                        <Chip
                          key={user.id}
                          label={
                            `${user.first_name ?? ""} ${
                              user.last_name ?? ""
                            }`.trim() || user.email
                          }
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {errors.dealOwner && <ErrorText>{errors.dealOwner}</ErrorText>}

            {/* CLOSE DATE + PRIORITY */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mt: 3,
                width: "100%",
              }}
            >
              {/* CLOSE DATE */}

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <FieldLabel text="Close Date" />

                <DatePicker
                  value={formData.closeDate ? dayjs(formData.closeDate) : null}
                  onChange={(newValue) => {
                    handleChange(
                      "closeDate",
                      newValue ? newValue.format("YYYY-MM-DD") : "",
                    );
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: Boolean(errors.closeDate),
                      helperText: errors.closeDate,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          height: 40,
                          borderRadius: "4px",
                          backgroundColor: "#fff",
                        },

                        "& .MuiInputBase-input": {
                          padding: "8px 12px",
                        },
                      },
                    },

                    popper: {
                      sx: {
                        zIndex: 2000,
                      },
                    },
                  }}
                />
              </Box>

              {/* PRIORITY */}

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <FieldLabel text="Priority" />

                <FormControl
                  fullWidth
                  size="small"
                  error={Boolean(errors.priority)}
                >
                  <Select
                    displayEmpty
                    value={formData.priority}
                    IconComponent={KeyboardArrowDownIcon}
                    MenuProps={selectMenuProps}
                    onChange={(event) =>
                      handleChange("priority", event.target.value)
                    }
                    sx={inputStyle}
                  >
                    <MenuItem value="">Choose</MenuItem>

                    <MenuItem value="low">Low</MenuItem>

                    <MenuItem value="medium">Medium</MenuItem>

                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>

                {errors.priority && <ErrorText>{errors.priority}</ErrorText>}
              </Box>
            </Box>

            {/* SAVE ERROR */}

            {saveError && (
              <Typography
                sx={{
                  mt: 2,
                  color: "error.main",
                  fontSize: 13,
                }}
              >
                {getSaveErrorMessage(saveError)}
              </Typography>
            )}
          </Box>

          {/* FOOTER */}

          <Box
            sx={{
              p: 2.5,
              display: "flex",
              gap: 1.5,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              disabled={saving}
              sx={buttonOutline}
            >
              Cancel
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={buttonPrimary}
            >
              {saving
                ? isEditMode
                  ? "Saving..."
                  : "Saving..."
                : isEditMode
                  ? "Save"
                  : "Save"}
            </Button>
          </Box>
        </Drawer>
      </>
    </LocalizationProvider>
  );
}

/* FIELD LABEL */

function FieldLabel({ text, mt = 0 }: { text: string; mt?: number }) {
  const theme = useTheme();

  return (
    <Typography
      sx={{
        mt,
        mb: 1,
        fontSize: theme.typography.body2.fontSize,
        fontWeight: 500,
        color: theme.palette.text.secondary,
      }}
    >
      {text}

      <Box
        component="span"
        sx={{
          color: theme.palette.error.main,
          ml: 0.5,
        }}
      >
        *
      </Box>
    </Typography>
  );
}

/* ERROR TEXT */

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        mt: 0.5,
        fontSize: 12,
        color: "error.main",
      }}
    >
      {children}
    </Typography>
  );
}

/* INPUT STYLE */

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    minHeight: 40,
    borderRadius: "4px",
    backgroundColor: "#fff",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "4px !important",
  },
};

/* OUTLINE BUTTON */

const buttonOutline = {
  height: 40,
  textTransform: "none",
  borderRadius: "4px",
  borderColor: "divider",
  color: "text.primary",
  fontWeight: 600,
};

/* PRIMARY BUTTON */

const buttonPrimary = {
  height: 40,
  textTransform: "none",
  borderRadius: "4px",
  fontWeight: 600,
  bgcolor: "primary.main",

  "&:hover": {
    bgcolor: "primary.dark",
  },
};

/* SELECT MENU */

const selectMenuProps = {
  slotProps: {
    paper: {
      sx: {
        maxHeight: 250,
        borderRadius: "8px",
      },
    },
  },
};

/* SAVE ERROR MESSAGE */

function getSaveErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

  if (error?.detail && typeof error.detail === "string") {
    return error.detail;
  }

  if (typeof error === "object" && error !== null) {
    const messages: string[] = [];

    Object.entries(error).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${field}: ${value}`);
      }
    });

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return "Failed to save deal";
}
