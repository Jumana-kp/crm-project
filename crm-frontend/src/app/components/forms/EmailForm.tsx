
"use client";

import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  Button,
  Popover,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LinkIcon from "@mui/icons-material/Link";
import InsertEmoticonOutlinedIcon from "@mui/icons-material/InsertEmoticonOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

import {
  useState,
  useRef,
  type MouseEvent,
  useEffect,
} from "react";

import { useDispatch, useSelector } from "react-redux";

import type {
  AppDispatch,
  RootState,
} from "@/store";

import { fetchAttachments } from "@/store/slices/attachmentSlice";

import api from "@/api/axios";

import RichTextEditor, {
  RichTextEditorHandle,
} from "../editors/EmailTextEditor";

/* =========================================================
   TYPES
========================================================= */

type EmailFormValues = {
  recipients: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  attachments: File[];
  selectedAttachmentIds: number[];
};

interface ExistingAttachment {
  id: number;
  file_name: string;
  file?: string;
}

interface EmailFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: EmailFormValues,
    selectedAttachmentIds: number[],
  ) => void;
  type: "lead" | "deal" | "company" | "ticket";
  id: number;
}

/* =========================================================
   GET RECIPIENT EMAIL
========================================================= */

const getRecipientEmail = (
  type: EmailFormProps["type"],
  data: any,
): string => {
  switch (type) {
    case "lead":
      return data?.email || "";

    case "deal":
      return data?.lead?.email || "";

    case "company":
      return data?.email || "";

    case "ticket":
      return data?.associated_deal?.lead?.email || "";

    default:
      return "";
  }
};

/* =========================================================
   EMAIL FORM
========================================================= */

export default function EmailForm({
  open,
  onClose,
  onSave,
  id,
  type,
}: EmailFormProps) {
  const dispatch = useDispatch<AppDispatch>();

  /* =======================================================
     ATTACHMENTS FROM REDUX
  ======================================================= */

  const existingAttachments = useSelector(
    (state: RootState) =>
      state.attachments.attachments,
  );

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  /* =======================================================
     UI STATE
  ======================================================= */

  const [showFormatting, setShowFormatting] =
    useState(false);

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const [emojiAnchor, setEmojiAnchor] =
    useState<null | HTMLElement>(null);

  /* =======================================================
     FILE STATE
  ======================================================= */

  const [attachments, setAttachments] =
    useState<File[]>([]);

  const [selectedAttachmentIds, setSelectedAttachmentIds] =
    useState<number[]>([]);

  /* =======================================================
     REFS
  ======================================================= */

  const editorRef =
    useRef<RichTextEditorHandle | null>(null);

  const attachmentInputRef =
    useRef<HTMLInputElement>(null);

  const imageInputRef =
    useRef<HTMLInputElement>(null);

  /* =======================================================
     EMOJIS
  ======================================================= */

  const emojis = [
    "😀",
    "😂",
    "😍",
    "👍",
    "🎉",
    "❤️",
    "🔥",
    "😊",
  ];

  const openToolbar = Boolean(anchorEl);
  const openEmoji = Boolean(emojiAnchor);

  /* =========================================================
     LOAD CRM RECORD + AUTOFILL RECIPIENT
  ========================================================= */

  useEffect(() => {
    if (!open || !id) return;

    const loadRecipient = async () => {
      try {
        let endpoint = "";

        switch (type) {
          case "lead":
            endpoint = `/leads/${id}/`;
            break;

          case "deal":
            endpoint = `/deals/${id}/`;
            break;

          case "company":
            endpoint = `/companies/${id}/`;
            break;

          case "ticket":
            endpoint = `/tickets/${id}/`;
            break;

          default:
            return;
        }

        const response = await api.get(endpoint);

        const email = getRecipientEmail(
          type,
          response.data,
        );

        setRecipients(email);
      } catch (error) {
        console.error(
          `Failed to load ${type} details:`,
          error,
        );

        setRecipients("");
      }
    };

    loadRecipient();
  }, [open, id, type]);

  /* =========================================================
     LOAD EXISTING ATTACHMENTS
  ========================================================= */

  useEffect(() => {
    if (!open || !id) return;

    dispatch(
      fetchAttachments({
        type,
        id,
      }),
    );
  }, [open, id, type, dispatch]);

  /* =========================================================
     RESET FORM WHEN CLOSED
  ========================================================= */

  useEffect(() => {
    if (!open) {
      setRecipients("");
      setCc("");
      setBcc("");
      setSubject("");
      setBody("");
      setAttachments([]);
      setSelectedAttachmentIds([]);
      setShowCc(false);
      setShowBcc(false);
      setShowFormatting(false);
    }
  }, [open]);

  /* =========================================================
     FORMAT BUTTON
  ========================================================= */

  const handleFormatClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  /* =========================================================
     DELETE / DISCARD
  ========================================================= */

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Discard this email draft?",
    );

    if (!confirmed) return;

    setRecipients("");
    setCc("");
    setBcc("");
    setSubject("");
    setBody("");
    setAttachments([]);
    setSelectedAttachmentIds([]);

    onClose();
  };

  /* =========================================================
     SAVE / SEND
  ========================================================= */

  const handleSave = () => {
    if (!recipients.trim()) {
      alert("Recipient is required");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(recipients.trim())) {
      alert("Please enter a valid email address");
      return;
    }

    if (!subject.trim()) {
      alert("Subject is required");
      return;
    }

    if (
      !body.trim() ||
      body === "<p></p>"
    ) {
      alert("Email body is required");
      return;
    }

    const data: EmailFormValues = {
      recipients: recipients.trim(),
      cc: cc.trim(),
      bcc: bcc.trim(),
      subject: subject.trim(),
      body,
      attachments,
      selectedAttachmentIds,
    };

    console.log("EMAIL DATA:", data);

    onSave(
      data,
      selectedAttachmentIds,
    );

    setRecipients("");
    setCc("");
    setBcc("");
    setSubject("");
    setBody("");
    setAttachments([]);
    setSelectedAttachmentIds([]);

    onClose();
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const handleClose = () => {
    onClose();
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        scroll="paper"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor:
                "rgba(0,0,0,0.25)",
              backdropFilter:
                "blur(6px)",
              WebkitBackdropFilter:
                "blur(6px)",
            },
          },

          paper: {
            sx: {
              width: 600,
              maxWidth:
                "calc(100vw - 32px)",
              height: {
                xs: "90vh",
                sm: 608,
              },
              maxHeight: "90vh",
              borderRadius: 0.5,
              overflow: "hidden",
            },
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0,
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <Box
            sx={{
              height: 40,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              px: 2,
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              New Email
            </Typography>

            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: "white",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* =================================================
              RECIPIENTS + SUBJECT
          ================================================= */}

          <Box sx={{ px: 2 }}>
            <Box
              sx={{
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >
              <TextField
                variant="standard"
                placeholder="Recipients"
                fullWidth
                value={recipients}
                onChange={(e) =>
                  setRecipients(
                    e.target.value,
                  )
                }
                slotProps={{
                  input: {
                    disableUnderline: true,
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  ml: 2,
                }}
              >
                <Typography
                  onClick={() =>
                    setShowCc(true)
                  }
                  sx={{
                    fontSize: 13,
                    color:
                      "text.secondary",
                    cursor: "pointer",
                  }}
                >
                  Cc
                </Typography>

                <Typography
                  onClick={() =>
                    setShowBcc(true)
                  }
                  sx={{
                    fontSize: 13,
                    color:
                      "text.secondary",
                    cursor: "pointer",
                  }}
                >
                  Bcc
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* =================================================
                CC
            ================================================= */}

            {showCc && (
              <>
                <Divider />

                <Box
                  sx={{
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                  }}
                >
                  <Typography
                    sx={{
                      width: 40,
                      color:
                        "text.secondary",
                      fontSize: 14,
                    }}
                  >
                    Cc
                  </Typography>

                  <TextField
                    variant="standard"
                    value={cc}
                    onChange={(e) =>
                      setCc(
                        e.target.value,
                      )
                    }
                    fullWidth
                    slotProps={{
                      input: {
                        disableUnderline: true,
                      },
                    }}
                  />
                </Box>

                <Divider />
              </>
            )}

            {/* =================================================
                BCC
            ================================================= */}

            {showBcc && (
              <>
                <Box
                  sx={{
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                  }}
                >
                  <Typography
                    sx={{
                      width: 40,
                      color:
                        "text.secondary",
                      fontSize: 14,
                    }}
                  >
                    Bcc
                  </Typography>

                  <TextField
                    variant="standard"
                    value={bcc}
                    onChange={(e) =>
                      setBcc(
                        e.target.value,
                      )
                    }
                    fullWidth
                    slotProps={{
                      input: {
                        disableUnderline: true,
                      },
                    }}
                  />
                </Box>

                <Divider />
              </>
            )}

            {/* =================================================
                SUBJECT
            ================================================= */}

            <Box
              sx={{
                height: 52,
                display: "flex",
                alignItems: "center",
              }}
            >
              <TextField
                variant="standard"
                placeholder="Subject"
                fullWidth
                value={subject}
                onChange={(e) =>
                  setSubject(
                    e.target.value,
                  )
                }
                slotProps={{
                  input: {
                    disableUnderline: true,
                  },
                }}
              />
            </Box>

            <Divider />
          </Box>

          {/* =================================================
              EMAIL BODY
          ================================================= */}

          <Box
            sx={{
              flex: 1,
              px: 2,
              py: 1,
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            <RichTextEditor
              ref={editorRef}
              value={body}
              onChange={setBody}
              placeholder="Body Text"
              showToolbar={
                showFormatting
              }
              hideImageButton
              showBorder={false}
            />
          </Box>

          {/* =================================================
              NEW ATTACHMENTS
          ================================================= */}

          {attachments.length > 0 && (
            <Box
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {attachments.map(
                (file, index) => (
                  <Box
                    key={index}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      border:
                        "1px solid",
                      borderColor:
                        "divider",
                      borderRadius: 1,
                      fontSize: 12,
                    }}
                  >
                    {file.name}
                  </Box>
                ),
              )}
            </Box>
          )}

          {/* =================================================
              EXISTING ATTACHMENTS
          ================================================= */}

          {existingAttachments?.length >
            0 && (
            <Box
              sx={{
                px: 2,
                py: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                Existing
                attachments
              </Typography>

              {existingAttachments.map(
                (
                  attachment,
                ) => (
                  <Box
                    key={
                      attachment.id
                    }
                    sx={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAttachmentIds.includes(
                        attachment.id,
                      )}
                      onChange={(
                        e,
                      ) => {
                        if (
                          e.target
                            .checked
                        ) {
                          setSelectedAttachmentIds(
                            (
                              prev,
                            ) => [
                              ...prev,
                              attachment.id,
                            ],
                          );
                        } else {
                          setSelectedAttachmentIds(
                            (
                              prev,
                            ) =>
                              prev.filter(
                                (
                                  existingId,
                                ) =>
                                  existingId !==
                                  attachment.id,
                              ),
                          );
                        }
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 13,
                      }}
                    >
                      {
                        attachment.file_name
                      }
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          )}

          <Divider />

          {/* =================================================
              BOTTOM TOOLBAR
          ================================================= */}

          <Divider />

          <Box
            sx={{
              height: 56,
              px: 2,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
            }}
          >

            {/* =================================================
                FORMATTING POPOVER
            ================================================= */}

            <Popover
              open={openToolbar}
              anchorEl={anchorEl}
              onClose={() =>
                setAnchorEl(null)
              }
              anchorOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical:
                  "bottom",
                horizontal:
                  "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  p: 1,
                }}
              >
                <IconButton
                  onClick={() =>
                    editorRef.current?.undo()
                  }
                >
                  <UndoIcon />
                </IconButton>

                <IconButton
                  onClick={() =>
                    editorRef.current?.redo()
                  }
                >
                  <RedoIcon />
                </IconButton>

                <IconButton
                  onClick={() =>
                    editorRef.current?.toggleBold()
                  }
                >
                  <FormatBoldIcon />
                </IconButton>

                <IconButton
                  onClick={() =>
                    editorRef.current?.toggleItalic()
                  }
                >
                  <FormatItalicIcon />
                </IconButton>

                <IconButton
                  onClick={() =>
                    editorRef.current?.toggleUnderline()
                  }
                >
                  <FormatUnderlinedIcon />
                </IconButton>

                <IconButton
                  onClick={() =>
                    editorRef.current?.toggleBulletList()
                  }
                >
                  <FormatListBulletedIcon />
                </IconButton>

                <IconButton
                  onClick={() =>
                    editorRef.current?.toggleOrderedList()
                  }
                >
                  <FormatListNumberedIcon />
                </IconButton>
              </Box>
            </Popover>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <Box
              sx={{
                height: 56,
                px: 2,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 1,
                  flexWrap:
                    "wrap",
                }}
              >

                {/* SEND */}

                <Button
                  variant="contained"
                  onClick={handleSave}
                  endIcon={
                    <KeyboardArrowDownIcon />
                  }
                >
                  Send
                </Button>

                {/* FORMAT */}

                <IconButton
                  onClick={
                    handleFormatClick
                  }
                  size="small"
                >
                  <TextFormatIcon
                    sx={{
                      color:
                        "text.secondary",
                      fontSize: 22,
                    }}
                  />
                </IconButton>

                {/* ATTACHMENT */}

                <IconButton
                  onClick={() =>
                    attachmentInputRef.current?.click()
                  }
                  size="small"
                >
                  <AttachFileIcon
                    sx={{
                      fontSize: 20,
                      color:
                        "text.secondary",
                    }}
                  />
                </IconButton>

                {/* LINK */}

                <IconButton
                  onClick={() => {
                    const url =
                      window.prompt(
                        "Enter URL",
                      );

                    if (url) {
                      editorRef.current?.setLink(
                        url,
                      );
                    }
                  }}
                  size="small"
                >
                  <LinkIcon
                    sx={{
                      fontSize: 20,
                      color:
                        "text.secondary",
                    }}
                  />
                </IconButton>

                {/* EMOJI */}

                <IconButton
                  onClick={(e) =>
                    setEmojiAnchor(
                      e.currentTarget,
                    )
                  }
                  size="small"
                >
                  <InsertEmoticonOutlinedIcon
                    sx={{
                      fontSize: 20,
                      color:
                        "text.secondary",
                    }}
                  />
                </IconButton>

                {/* IMAGE */}

                <IconButton
                  onClick={() =>
                    imageInputRef.current?.click()
                  }
                  size="small"
                >
                  <ImageOutlinedIcon
                    sx={{
                      fontSize: 20,
                      color:
                        "text.secondary",
                    }}
                  />
                </IconButton>
              </Box>

              {/* DELETE */}

              <IconButton
                size="small"
                onClick={
                  handleDelete
                }
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* =================================================
              EMOJI PICKER
          ================================================= */}

          <Popover
            open={openEmoji}
            anchorEl={emojiAnchor}
            onClose={() =>
              setEmojiAnchor(null)
            }
            anchorOrigin={{
              vertical: "top",
              horizontal:
                "center",
            }}
            transformOrigin={{
              vertical:
                "bottom",
              horizontal:
                "center",
            }}
          >
            <Box
              sx={{
                p: 1,
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                maxWidth: 220,
              }}
            >
              {emojis.map(
                (emoji) => (
                  <IconButton
                    key={emoji}
                    onClick={() => {
                      editorRef.current?.insertEmoji(
                        emoji,
                      );

                      setEmojiAnchor(
                        null,
                      );
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 24,
                      }}
                    >
                      {emoji}
                    </Typography>
                  </IconButton>
                ),
              )}
            </Box>
          </Popover>

          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <input
            hidden
            multiple
            type="file"
            ref={
              attachmentInputRef
            }
            onChange={(e) => {
              const files =
                Array.from(
                  e.target.files ||
                    [],
                );

              setAttachments(
                (prev) => [
                  ...prev,
                  ...files,
                ],
              );

              e.target.value = "";
            }}
          />

          {/* =================================================
              IMAGE UPLOAD
          ================================================= */}

          <input
            hidden
            type="file"
            accept="image/*"
            ref={
              imageInputRef
            }
            onChange={(e) => {
              const file =
                e.target.files?.[0];

              if (file) {
                editorRef.current?.insertImage(
                  file,
                );
              }

              e.target.value = "";
            }}
          />

        </Box>
      </Dialog>
    </>
  );
}

