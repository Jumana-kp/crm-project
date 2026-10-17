"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Divider, Paper, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAttachments,
  uploadAttachment,
} from "@/store/slices/attachmentSlice";

import type { RootState, AppDispatch } from "@/store";

type RightSidebarProps = {
  title: string;
  summary: string;
  entityType: "lead" | "deal" | "company" | "ticket";
  entityId: number;
};

export default function RightSidebar({
  title,
  summary,
  entityType,
  entityId,
}: RightSidebarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const attachments = useSelector(
    (state: RootState) => state.attachments.attachments,
  );

  const loading = useSelector((state: RootState) => state.attachments.loading);

  // =========================
  // Fetch attachments
  // =========================
  useEffect(() => {
    dispatch(
      fetchAttachments({
        type: entityType,
        id: entityId,
      }),
    );
  }, [dispatch, entityType, entityId]);

  // =========================
  // Upload attachment
  // =========================
  // const handleFileChange = async (
  //   event: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const file = event.target.files?.[0];

  //   if (!file) return;

  //   await dispatch(
  //     uploadAttachment({
  //       file,
  //       type: entityType,
  //       id: entityId,
  //     }),
  //   );

  //   // Reset input so the same file can be selected again
  //   event.target.value = "";
  // };
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log("Selected file:", file.name);
    console.log("Entity:", entityType);
    console.log("Entity ID:", entityId);

    try {
      const result = await dispatch(
        uploadAttachment({
          file,
          type: entityType,
          id: entityId,
        }),
      ).unwrap();

      console.log("Attachment uploaded successfully:", result);

      // Refresh current entity attachments
      const attachmentsResult = await dispatch(
        fetchAttachments({
          type: entityType,
          id: entityId,
        }),
      ).unwrap();

      console.log("Attachments after upload:", attachmentsResult);
    } catch (error: any) {
      console.error("Attachment upload failed:", error);

      // Better error display
      if (error?.detail) {
        console.error("Django detail:", error.detail);
      }

      if (error?.file) {
        console.error("File error:", error.file);
      }

      if (error?.lead) {
        console.error("Lead error:", error.lead);
      }

      if (error?.deal) {
        console.error("Deal error:", error.deal);
      }

      if (error?.company) {
        console.error("Company error:", error.company);
      }

      if (error?.ticket) {
        console.error("Ticket error:", error.ticket);
      }
    }

    event.target.value = "";
  };
  return (
    <>
      {/* Hidden file input */}
      <input ref={inputRef} type="file" hidden onChange={handleFileChange} />

      <Box
        sx={(theme) => ({
          width: 328,
          p: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "23px",
          bgcolor: theme.palette.background.paper,
          boxSizing: "border-box",
          height: "100%",
          minHeight: "calc(100vh - 140px)",
          backgroundColor: "#fff",
        })}
      >
        {/* =========================
            AI SUMMARY
        ========================= */}
        <Paper
          elevation={0}
          sx={(theme) => ({
            width: 288,
            p: "16px",
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxSizing: "border-box",
            alignItems: "center",
            bgcolor: "#F7F7FA",
          })}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src="/images/Ai.png"
              alt="AI"
              sx={{
                width: 24,
                height: 24,
              }}
            />

            <Typography
              sx={(theme) => ({
                fontSize: 14,
                fontWeight: 600,
                color: theme.palette.primary.main,
                textAlign: "center",
              })}
            >
              {title}
            </Typography>
          </Box>

          <Typography
            sx={(theme) => ({
              fontSize: 14,
              lineHeight: "24px",
              color: theme.palette.text.primary,
              textAlign: "center",
            })}
          >
            {summary}
          </Typography>
        </Paper>

        {/* =========================
            ATTACHMENTS
        ========================= */}
        <Paper
          elevation={0}
          sx={(theme) => ({
            width: 288,
            p: "16px",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxSizing: "border-box",
          })}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Expand / collapse */}
            <Box
              onClick={() => setAttachmentsOpen((prev) => !prev)}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <KeyboardArrowDownIcon
                sx={{
                  transform: attachmentsOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Attachments
              </Typography>
            </Box>

            {/* Add */}
            <Box
              onClick={() => inputRef.current?.click()}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
              }}
            >
              <AddIcon
                sx={(theme) => ({
                  fontSize: 16,
                  color: theme.palette.primary.main,
                })}
              />

              <Typography
                sx={(theme) => ({
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                })}
              >
                Add
              </Typography>
            </Box>
          </Box>

          {/* Attachment content */}
          {attachmentsOpen && (
            <>
              <Divider />

              {loading ? (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  Loading attachments...
                </Typography>
              ) : attachments.length === 0 ? (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  No attachments yet
                </Typography>
              ) : (
                attachments.map((attachment) => (
                  <Box
                    key={attachment.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      py: 0.5,
                    }}
                  >
                    <Typography
                      component="a"
                      href={attachment.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontSize: 12,
                        textDecoration: "none",
                        color: "primary.main",
                        cursor: "pointer",
                      }}
                    >
                      📎 {attachment.file_name}
                    </Typography>
                  </Box>
                ))
              )}
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}
