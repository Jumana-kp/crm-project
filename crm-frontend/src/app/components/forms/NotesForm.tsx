"use client";

import { useState } from "react";

import {
  Box,
  Button,
  Drawer,
  FormLabel,
  IconButton,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { useTheme } from "@mui/material/styles";

import RichTextEditor from "../editors/RichTextEditor";

interface NotesFormProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function NotesForm({
  open,
  value,
  onChange,
  onClose,
  onSave,
}: NotesFormProps) {
  const theme = useTheme();

  const [error, setError] = useState(false);

  const handleSave = () => {
    if (!value.trim()) {
      setError(true);
      return;
    }

    onSave();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: theme.palette.background.paper,
        }}
      >
        {/* HEADER */}

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
              color: theme.palette.text.primary,
            }}
          >
            Create Note
          </Typography>

          <IconButton
            onClick={onClose}
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

            px: {
              xs: 2,
              sm: 3,
            },

            py: {
              xs: 2,
              sm: 3,
            },

            overflowY: "auto",
          }}
        >
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

          <Box
            sx={{
              border: `1px solid ${
                error ? theme.palette.error.main : theme.palette.divider
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
              value={value}
              onChange={(content) => {
                onChange(content);
                setError(false);
              }}
              placeholder="Enter"
            />
          </Box>

          {error && (
            <Typography
              sx={{
                fontSize: 12,
                color: theme.palette.error.main,
                mt: 0.5,
              }}
            >
              Note is required
            </Typography>
          )}
        </Box>

        {/* FOOTER */}

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
            fullWidth
            onClick={onClose}
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
            fullWidth
            variant="contained"
            onClick={handleSave}
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
  );
}
