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

type ImportLeadDrawerProps = {
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
    company_name?: string;
    errors?: string[];
  }>;
};

export default function ImportLeadDrawer({
  open,
  onClose,
  onImported,
}: ImportLeadDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  // Download CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      "email",
      "first_name",
      "last_name",
      "country_code",
      "phone_number",
      "job_title",
      "contact_owners",
      "company",
      "products",
      "lead_status",
      "city",
    ];

    const csvContent = headers.join(",");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "leads_import_template.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Open file picker
  const handleChooseFile = () => {
    setError("");
    setResult(null);

    fileInputRef.current?.click();
  };

  // Select file
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setError("");
    setResult(null);

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

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

      const response = await axiosInstance.post(
        "/leads/import/",
        formData,
      );

      const data = response.data as ImportResult;

      setResult(data);

      if (data.failed && data.failed > 0) {
        setError(
          `${data.created ?? 0} lead(s) imported and ${
            data.failed
          } row(s) failed.`,
        );
      } else {
        onImported?.();
      }
    } catch (error: any) {
      console.error("Lead import error:", error);

      const responseData = error?.response?.data;

      setError(
        responseData?.message ||
          responseData?.detail ||
          "Lead import failed. Please check your CSV file.",
      );
    } finally {
      setImporting(false);
    }
  };

  // Close drawer
  const handleClose = () => {
    if (importing) {
      return;
    }

    setSelectedFile(null);
    setError("");
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
    >
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
        {/* Header */}
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
              }}
            >
              Import Leads
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Import multiple leads using a CSV file.
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            disabled={importing}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
          }}
        >
          {/* Step 1 */}
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

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              Download the CSV template and enter your lead
              information under the column headers.
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

          {/* CSV information */}
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
                mb: 1.5,
              }}
            >
              CSV information
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Enter one lead per row.
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Contact owners must be existing User IDs.
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              For multiple contact owners, separate User IDs
              with a semicolon (;).
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Company must be the name of an existing company.
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Products must be existing Product IDs.
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              For multiple products, separate Product IDs with
              a semicolon (;).
            </Typography>
          </Box>

          {/* Step 2 */}
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

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
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

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Error */}
          {error && (
            <Alert
              severity={
                result?.failed && result.failed > 0
                  ? "warning"
                  : "error"
              }
              sx={{
                mb: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {/* Result */}
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

              <Typography
                variant="body2"
                sx={{
                  color: "success.main",
                }}
              >
                Imported: {result.created ?? 0}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    (result.failed ?? 0) > 0
                      ? "error.main"
                      : "text.secondary",
                }}
              >
                Failed: {result.failed ?? 0}
              </Typography>

              {result.errors &&
                result.errors.length > 0 && (
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
                      {result.errors.map(
                        (item, index) => (
                          <ListItem
                            key={`${item.row}-${index}`}
                            disableGutters
                            sx={{
                              alignItems: "flex-start",
                            }}
                          >
                            <ListItemText
                              primary={`Row ${
                                item.row ?? "-"
                              }${
                                item.company_name
                                  ? ` - ${item.company_name}`
                                  : ""
                              }`}
                              secondary={(
                                item.errors ?? []
                              ).join(", ")}
                            />
                          </ListItem>
                        ),
                      )}
                    </List>
                  </Box>
                )}
            </Box>
          )}
        </Box>

        {/* Footer */}
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
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!selectedFile || importing}
            startIcon={
              importing ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {importing ? "Importing..." : "Import"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}