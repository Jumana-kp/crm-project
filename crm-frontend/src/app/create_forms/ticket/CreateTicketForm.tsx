"use client";

import {
  Box,
  Button,
  Checkbox,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, Controller } from "react-hook-form";

import { useEffect } from "react";

import {
  createTicket,
  updateTicket,
  type Ticket,
} from "../../../store/slices/ticketSlice";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchUsers } from "@/store/slices/userSlice";
import { fetchDeals } from "@/store/slices/dealSlice";

// Validation

const ticketSchema = z.object({
  ticketName: z.string().trim().min(1, "Ticket Name is required"),

  description: z.string().trim().min(1, "Description is required"),

  status: z.string().min(1, "Status is required"),

  source: z.string().min(1, "Source is required"),

  priority: z.string().min(1, "Priority is required"),

  owner: z.array(z.number()).min(1, "Owner is required"),

  deal: z.number().min(1, "Deal is required"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

// Props

interface Props {
  open: boolean;
  onClose: () => void;
  ticket?: Ticket | null;
}

// Options

const ticketStatusOptions = [
  "Open",
  "In Progress",
  "On Hold",
  "Resolved",
  "Closed",
];

const sourceOptions = ["Email", "Phone", "Website", "Chat", "Other"];

const priorityOptions = ["Low", "Medium", "High", "Urgent"];

// Empty form

const emptyFormValues: TicketFormData = {
  ticketName: "",
  description: "",
  status: "",
  source: "",
  priority: "",
  owner: [],
  deal: 0,
};

// Component

export default function TicketForm({ open, onClose, ticket }: Props) {
  const isEditMode = Boolean(ticket);

  const dispatch = useAppDispatch();

  // Redux

  const users = useAppSelector((state) => state.users.users);

  const deals = useAppSelector((state) => state.deals.deals);

  // Form

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: emptyFormValues,
  });

  // Fetch users and deals

  useEffect(() => {
    if (!open) {
      return;
    }

    dispatch(fetchUsers());
    dispatch(fetchDeals({}));
  }, [open, dispatch]);

  // Reset form when opening

  useEffect(() => {
    if (!open) {
      return;
    }

    // Edit

    if (ticket) {
      const ownerIds = Array.isArray(ticket.ticket_owners)
        ? ticket.ticket_owners
            .map((owner) => Number(owner.id))
            .filter((id) => Number.isFinite(id) && id > 0)
        : [];

      const dealId = ticket.associated_deal?.id
        ? Number(ticket.associated_deal.id)
        : 0;

      reset({
        ticketName: ticket.ticket_name || "",

        description: ticket.description || "",

        status: ticket.ticket_status || "",

        source: ticket.source || "",

        priority: ticket.priority || "",

        owner: ownerIds,

        deal: dealId,
      });

      return;
    }

    // Create

    reset(emptyFormValues);
  }, [open, ticket, reset]);

  // Cancel

  const handleCancel = () => {
    reset(emptyFormValues);
    onClose();
  };

  // Submit

  const handleFormSubmit = async (data: TicketFormData) => {
    try {
      const payload = {
        ticket_name: data.ticketName.trim(),

        description: data.description.trim(),

        ticket_status: data.status,

        source: data.source,

        priority: data.priority,

        ticket_owner_ids: data.owner,

        associated_deal_id: data.deal,
      };

      // Update

      if (ticket) {
        await dispatch(
          updateTicket({
            id: ticket.id,
            data: payload,
          }),
        ).unwrap();
      }

      // Create
      else {
        await dispatch(createTicket(payload)).unwrap();
      }

      reset(emptyFormValues);
      onClose();
    } catch (error) {
      console.error("Failed to save ticket:", error);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={isSubmitting ? undefined : handleCancel}
      sx={{
        zIndex: 1500,
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(14px)",

            backgroundColor: "rgba(0,0,0,0.15)",
          },
        },

        paper: {
          sx: {
            width: {
              xs: "100%",
              sm: 300,
              md: 400,
            },
          },
        },
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
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="h6">
          {isEditMode ? "Edit Ticket" : "Create Ticket"}
        </Typography>

        <IconButton onClick={handleCancel} disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main */}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100% - 72px)",
        }}
      >
        {/* Form */}

        <Box
          component="form"
          id="ticket-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{
            flex: 1,
            overflowY: "auto",
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Stack spacing={4}>
            {/* Ticket Name */}

            <Box>
              <FieldLabel text="Ticket Name" required />

              <Controller
                name="ticketName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    placeholder="Enter"
                    error={!!errors.ticketName}
                    helperText={errors.ticketName?.message}
                  />
                )}
              />
            </Box>

            {/* Description */}

            <Box>
              <FieldLabel text="Description" required />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Box>

            {/* Status and Source */}

            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Dropdown
                  label="Ticket Status"
                  required
                  options={ticketStatusOptions}
                  name="status"
                  control={control}
                  error={errors.status?.message}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Dropdown
                  label="Source"
                  required
                  options={sourceOptions}
                  name="source"
                  control={control}
                  error={errors.source?.message}
                />
              </Grid>
            </Grid>

            {/* Priority */}

            <Dropdown
              label="Priority"
              required
              options={priorityOptions}
              name="priority"
              control={control}
              error={errors.priority?.message}
            />

            {/* Ticket Owner */}

            <Dropdown
              label="Ticket Owner"
              required
              multiple
              options={users.map((user) => ({
                label:
                  `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                  user.email ||
                  `User ${user.id}`,

                value: Number(user.id),
              }))}
              name="owner"
              control={control}
              error={errors.owner?.message}
            />

            {/* Associated Deal */}

            <Dropdown
              label="Associated Deal"
              required
              options={deals.map((deal) => ({
                label: deal.deal_name || `Deal ${deal.id}`,

                value: Number(deal.id),
              }))}
              name="deal"
              control={control}
              error={errors.deal?.message}
            />
          </Stack>
        </Box>

        {/* Footer gap */}

        <Box
          sx={{
            height: 32,
            flexShrink: 0,
          }}
        />

        {/* Footer */}

        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            p: 2,
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: "center",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              sx={{
                width: 223.5,
                height: 44,
                borderRadius: "8px",
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              type="submit"
              form="ticket-form"
              disabled={isSubmitting}
              sx={{
                width: 223.5,
                height: 44,
                borderRadius: "8px",
              }}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update"
                  : "Save"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}

// Field label

function FieldLabel({
  text,
  required = false,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
        mb: 0.8,
      }}
    >
      {text}

      {required && (
        <Box
          component="span"
          sx={{
            color: "error.main",
          }}
        >
          {" "}
          *
        </Box>
      )}
    </Typography>
  );
}

// Dropdown

function Dropdown({
  label,
  required = false,
  options,
  name,
  control,
  error,
  multiple = false,
}: {
  label: string;
  required?: boolean;

  options: Array<
    | string
    | {
        label: string;
        value: string | number;
      }
  >;

  name: keyof TicketFormData;

  control: any;

  error?: string;

  multiple?: boolean;
}) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? {
          label: option,
          value: option,
        }
      : option,
  );

  const menuMaxHeight = Math.min(normalizedOptions.length * 48 + 8, 520);

  return (
    <Box>
      <FieldLabel text={label} required={required} />

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <FormControl fullWidth size="small" error={!!error}>
            <Select
              {...field}
              multiple={multiple}
              displayEmpty
              MenuProps={{
                disablePortal: true,

                slotProps: {
                  paper: {
                    sx: {
                      maxHeight: menuMaxHeight,

                      zIndex: 1600,
                    },
                  },
                },
              }}
              renderValue={(selected) => {
                // Nothing selected

                if (
                  selected === "" ||
                  selected === 0 ||
                  selected === null ||
                  selected === undefined ||
                  (Array.isArray(selected) && selected.length === 0)
                ) {
                  return (
                    <em
                      style={{
                        color: "#9CA3AF",
                      }}
                    >
                      Choose
                    </em>
                  );
                }

                // Multiple

                if (Array.isArray(selected)) {
                  return selected
                    .map((value) => {
                      const found = normalizedOptions.find(
                        (option) => String(option.value) === String(value),
                      );

                      return found?.label ?? String(value);
                    })
                    .join(", ");
                }

                // Single

                const found = normalizedOptions.find(
                  (option) => String(option.value) === String(selected),
                );

                return found?.label ?? String(selected);
              }}
            >
              {!multiple && (
                <MenuItem value="" disabled>
                  <em>Choose</em>
                </MenuItem>
              )}

              {normalizedOptions
                .filter(
                  (option) =>
                    option.value !== "" &&
                    option.value !== null &&
                    option.value !== undefined &&
                    option.label?.trim() !== "",
                )
                .map((option) => (
                  <MenuItem key={String(option.value)} value={option.value}>
                    {multiple && (
                      <Checkbox
                        checked={
                          Array.isArray(field.value) &&
                          field.value.some(
                            (value) => String(value) === String(option.value),
                          )
                        }
                      />
                    )}

                    {option.label}
                  </MenuItem>
                ))}
            </Select>

            {error && (
              <Typography
                variant="caption"
                color="error"
                sx={{
                  mt: 0.5,
                }}
              >
                {error}
              </Typography>
            )}
          </FormControl>
        )}
      />
    </Box>
  );
}
