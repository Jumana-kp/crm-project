"use client";

import { useEffect, useRef, useState } from "react";

import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Box,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

interface RichTextEditorProps {
  value: string;

  onChange: (value: string) => void;

  placeholder?: string;
}

const toolbarButtonBase = {
  width: 30,

  height: 30,

  minWidth: 30,

  padding: 0,

  border: "1px solid",

  borderRadius: "0px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  backgroundColor: "#fff",

  "&:hover": {
    backgroundColor: "#F9FAFB",
  },
};

export default function RichTextEditor({
  value,

  onChange,

  placeholder = "Write a note...",
}: RichTextEditorProps) {
  const theme = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [textStyle, setTextStyle] = useState("paragraph");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),

      Underline,

      Image,

      Placeholder.configure({
        placeholder,

        includeChildren: true,
      }),
    ],

    content: value || "",

    immediatelyRender: false,

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // sync value from parent

  useEffect(() => {
    if (!editor) return;

    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // update heading dropdown

  useEffect(() => {
    if (!editor) return;

    const updateStyle = () => {
      if (
        editor.isActive("heading", {
          level: 1,
        })
      ) {
        setTextStyle("h1");
      } else if (
        editor.isActive("heading", {
          level: 2,
        })
      ) {
        setTextStyle("h2");
      } else {
        setTextStyle("paragraph");
      }
    };

    updateStyle();

    editor.on("selectionUpdate", updateStyle);

    editor.on("update", updateStyle);

    return () => {
      editor.off("selectionUpdate", updateStyle);

      editor.off("update", updateStyle);
    };
  }, [editor]);

  const handleTextStyleChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;

    setTextStyle(value);

    if (!editor) return;

    switch (value) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();

        break;

      case "h1":
        editor
          .chain()
          .focus()
          .setHeading({
            level: 1,
          })
          .run();

        break;

      case "h2":
        editor
          .chain()
          .focus()
          .setHeading({
            level: 2,
          })
          .run();

        break;
    }
  };

  const handleImageUpload = (file: File) => {
    if (!editor) return;

    const reader = new FileReader();

    reader.onload = () => {
      editor
        .chain()
        .focus()
        .setImage({
          src: reader.result as string,
        })
        .run();
    };

    reader.readAsDataURL(file);
  };

  const activeStyle = (active: boolean) => ({
    backgroundColor: active ? theme.palette.primary.light : "transparent",

    borderColor: active ? theme.palette.primary.main : theme.palette.divider,

    color: active ? theme.palette.primary.main : theme.palette.text.primary,
  });

  if (!editor) return null;

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,

        borderRadius: 1,

        overflow: "hidden",

        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* TOOLBAR */}

      <Box
        sx={{
          height: 44,

          display: "flex",

          alignItems: "center",

          gap: 1,

          px: 1,

          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Select
          value={textStyle}
          onChange={handleTextStyleChange}
          size="small"
          sx={{
            width: 120,

            height: 30,

            fontSize: 13,

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.divider,
            },
          }}
        >
          <MenuItem value="paragraph">Normal text</MenuItem>

          <MenuItem value="h1">Heading 1</MenuItem>

          <MenuItem value="h2">Heading 2</MenuItem>
        </Select>

        <IconButton
          disableRipple
          onClick={() => editor.chain().focus().toggleBold().run()}
          sx={{
            ...toolbarButtonBase,

            ...activeStyle(editor.isActive("bold")),
          }}
        >
          <FormatBoldIcon fontSize="small" />
        </IconButton>

        <IconButton
          disableRipple
          onClick={() => editor.chain().focus().toggleItalic().run()}
          sx={{
            ...toolbarButtonBase,

            ...activeStyle(editor.isActive("italic")),
          }}
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>

        <IconButton
          disableRipple
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          sx={{
            ...toolbarButtonBase,

            ...activeStyle(editor.isActive("underline")),
          }}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </IconButton>

        <IconButton
          disableRipple
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          sx={{
            ...toolbarButtonBase,

            ...activeStyle(editor.isActive("bulletList")),
          }}
        >
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>

        <IconButton
          disableRipple
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          sx={{
            ...toolbarButtonBase,

            ...activeStyle(editor.isActive("orderedList")),
          }}
        >
          <FormatListNumberedIcon fontSize="small" />
        </IconButton>

        <IconButton
          disableRipple
          onClick={() => fileInputRef.current?.click()}
          sx={{
            ...toolbarButtonBase,

            color: theme.palette.text.primary,
          }}
        >
          <ImageOutlinedIcon fontSize="small" />
        </IconButton>

        <input
          hidden
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              handleImageUpload(file);
            }

            e.target.value = "";
          }}
        />
      </Box>

      {/* EDITOR AREA */}

      <Box
        sx={{
          px: 2,

          py: 1.5,

          "& .ProseMirror": {
            minHeight: 160,

            outline: "none",

            fontSize: 16,

            color: theme.palette.text.primary,
          },

          "& .ProseMirror p": {
            margin: "6px 0",
          },

          "& .ProseMirror h1": {
            fontSize: 26,

            fontWeight: 700,
          },

          "& .ProseMirror h2": {
            fontSize: 20,

            fontWeight: 600,
          },

          "& .ProseMirror p.is-editor-empty:first-child::before": {
            content: `attr(data-placeholder)`,

            color: theme.palette.text.secondary,

            float: "left",

            pointerEvents: "none",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
