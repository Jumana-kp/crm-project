"use client";

import { useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

import axiosInstance from "@/api/axios";

type ImportTicketDrawerProps = {
  open: boolean;
  onClose: () => void;
  onImported?: () => void;
};

type ImportResult = {
  success?: boolean;
  message?: string;
  created?: number;
  failed?: number;
  total_rows?: number;
  errors?: Array<{
    row?: number;
    ticket_name?: string;
    errors?: string[] | Record<string, string[] | string>;
  }>;
};

export default function ImportTicketDrawer({
  open,
  onClose,
  onImported,
}: ImportTicketDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  // Download CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      "ticket_name",
      "description",
      "ticket_status",
      "source",
      "priority",
      "ticket_owner_ids",
      "associated_deal_id",
    ];

    const csvContent = headers.join(",");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "tickets_import_template.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Open file picker
  const handleChooseFile = () => {
    if (importing) return;

    setError("");
    setResult(null);

    fileInputRef.current?.click();
  };

  // Select CSV file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setResult(null);

    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setSelectedFile(null);
      setError("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // Import CSV
  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    setImporting(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await axiosInstance.post("/tickets/import/", formData);

      const data = response.data as ImportResult;

      setResult(data);

      if (data.failed && data.failed > 0) {
        setError(
          `${data.created ?? 0} ticket(s) imported and ${
            data.failed
          } row(s) failed.`,
        );
      } else {
        onImported?.();
      }
    } catch (error: any) {
      console.error("Ticket import error:", error);

      const responseData = error?.response?.data;

      setError(
        responseData?.message ||
          responseData?.detail ||
          "Ticket import failed. Please check your CSV file.",
      );
    } finally {
      setImporting(false);
    }
  };

  // Close drawer
  const handleClose = () => {
    if (importing) return;

    setSelectedFile(null);
    setError("");
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Box
        sx={{
          width: {
            xs: "100vw",
            sm: 480,
          },
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Import Tickets
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Import multiple tickets using a CSV file.
            </Typography>
          </Box>

          <IconButton onClick={handleClose} disabled={importing}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
          }}
        >
          <Box
            sx={{
              border: "1px solid #E3E8EF",
              borderRadius: 2,
              p: 2.5,
              mb: 3,
              backgroundColor: "#FAFBFD",
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              Step 1: Download template
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Download the CSV template and enter your ticket data below the
              column headers.
            </Typography>

            <Button
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              onClick={handleDownloadTemplate}
              fullWidth
            >
              Download CSV Template
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              How to import
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Open the downloaded template in Excel, enter each ticket on a new
              row, save the file as CSV, and upload it here.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              For ticket owners, enter existing user IDs in the{" "}
              <strong>ticket_owner_ids</strong> column. For multiple owners,
              separate the IDs with a semicolon, for example{" "}
              <strong>1;2</strong>.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              For the associated deal, enter the ID of an existing deal in the{" "}
              <strong>associated_deal_id</strong> column.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Ticket status must be one of:
              <strong> Open, In Progress, On Hold, Resolved, Closed</strong>.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Source must be one of:
              <strong> Email, Phone, Website, Chat, Other</strong>.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Priority must be one of:
              <strong> Low, Medium, High, Urgent</strong>.
            </Typography>
          </Box>

          <Box
            sx={{
              border: "1px solid #E3E8EF",
              borderRadius: 2,
              p: 2.5,
              mb: 3,
              backgroundColor: "#FAFBFD",
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              Example
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontSize: 12,
                wordBreak: "break-word",
              }}
            >
              Payment issue,Customer cannot pay,Open,Email,High,1,12
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontSize: 12,
                wordBreak: "break-word",
                mt: 1,
              }}
            >
              Login issue,Customer cannot login,In
              Progress,Website,Medium,1;2,15
            </Typography>
          </Box>

          <Box
            sx={{
              border: "1px solid #E3E8EF",
              borderRadius: 2,
              p: 2.5,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              Step 2: Select CSV file
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload the completed CSV file.
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={handleFileChange}
            />

            <Button
              variant="contained"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={handleChooseFile}
              disabled={importing}
              fullWidth
            >
              Choose CSV File
            </Button>

            {selectedFile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mt: 2,
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: "#F5F6FA",
                }}
              >
                <InsertDriveFileOutlinedIcon color="primary" />

                <Box
                  sx={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedFile.name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {error && (
            <Alert
              severity={
                result?.failed && result.failed > 0 ? "warning" : "error"
              }
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          {result && (
            <Box
              sx={{
                border: "1px solid #E3E8EF",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Import Result
              </Typography>

              <Typography variant="body2">
                Total rows: {result.total_rows ?? 0}
              </Typography>

              <Typography variant="body2" sx={{ color: "success.main" }}>
                Imported: {result.created ?? 0}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    (result.failed ?? 0) > 0 ? "error.main" : "text.secondary",
                }}
              >
                Failed: {result.failed ?? 0}
              </Typography>

              {result.errors && result.errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Failed rows
                  </Typography>

                  <List dense>
                    {result.errors.map((item, index) => (
                      <ListItem
                        key={`${item.row}-${index}`}
                        disableGutters
                        sx={{
                          alignItems: "flex-start",
                        }}
                      >
                        <ListItemText
                          primary={`Row ${item.row ?? "-"}${
                            item.ticket_name ? ` - ${item.ticket_name}` : ""
                          }`}
                          secondary={formatRowErrors(item.errors)}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Divider />

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            p: 2.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={importing}
            sx={{
              minWidth: 90,
              height: 38,
              borderRadius: "6px",
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!selectedFile || importing}
            disableElevation
            startIcon={
              importing ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
            sx={{
              minWidth: 110,
              height: 38,
              px: 2,
              borderRadius: "6px",
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              bgcolor: "#5B4DDE",
              "&:hover": {
                bgcolor: "#4B3FD0",
              },
            }}
          >
            {importing ? "Importing..." : "Import"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

function formatRowErrors(
  errors: string[] | Record<string, string[] | string> | undefined,
) {
  if (!errors) {
    return "Unknown error.";
  }

  if (Array.isArray(errors)) {
    return errors.join(", ");
  }

  return Object.entries(errors)
    .map(([field, value]) => {
      const message = Array.isArray(value) ? value.join(", ") : value;

      return `${field}: ${message}`;
    })
    .join("\n");
}
