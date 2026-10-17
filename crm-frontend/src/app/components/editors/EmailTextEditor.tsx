"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

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
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import Link from "@tiptap/extension-link"; // add this

export interface RichTextEditorHandle {
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleBulletList: () => void;
  toggleOrderedList: () => void;
  undo: () => void;
  redo: () => void;
  setLink: (url: string) => void;
  insertImage: (file: File) => void;
  insertEmoji: (emoji: string) => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showToolbar?: boolean;
  hideImageButton?: boolean;
  showBorder?: boolean;
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

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = "Write a note...",
      showToolbar = true,
      hideImageButton = false,
      showBorder = true,
    }: RichTextEditorProps,
    ref,
  ) => {
    const theme = useTheme();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // const [textStyle, setTextStyle] = useState("paragraph");

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2],
          },
          
        }),

        Underline,
        Image,

        Link.configure({
          openOnClick: false,
        }),

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

    const insertImage = (file: File) => {
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

    useImperativeHandle(
      ref,
      () => ({
        toggleBold: () => editor?.chain().focus().toggleBold().run(),
        toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
        toggleUnderline: () => editor?.chain().focus().toggleUnderline().run(),
        toggleBulletList: () =>
          editor?.chain().focus().toggleBulletList().run(),
        toggleOrderedList: () =>
          editor?.chain().focus().toggleOrderedList().run(),
        undo: () => editor?.chain().focus().undo().run(),
        redo: () => editor?.chain().focus().redo().run(),

        setLink: (url: string) => {
          if (!editor) return;

          const { from, to } = editor.state.selection;

          if (from === to) {
            return;
          }

          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        },
        insertImage,
        insertEmoji: (emoji: string) =>
          editor?.chain().focus().insertContent(emoji).run(),
      }),
      [editor, insertImage],
    );

    const handleImageUpload = (file: File) => {
      insertImage(file);
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
          border: showBorder ? `1px solid ${theme.palette.divider}` : "none",
          borderRadius: showBorder ? 1 : 0,
          overflow: "hidden",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* TOOLBAR */}
        {showToolbar && (
          <Box
            sx={{
              height: 44,

              display: "flex",

              alignItems: "center",

              gap: 1,

              px: 1,

              borderBottom: `1px solid ${theme.palette.divider}`,
              overflowX: "auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormatColorTextIcon sx={{ color: "text.secondary", mr: 0.5 }} />
              <input
                aria-label="Text color"
                type="color"
                onChange={(e) => {
                  const color = e.target.value;

                  if (!editor) return;

                  // prefer Color extension's setColor if available
                  if ((editor as any).chain().focus().setColor) {
                    (editor as any).chain().focus().setColor(color).run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .setMark("textStyle", { color })
                      .run();
                  }
                }}
                style={{
                  width: 28,
                  height: 28,
                  padding: 0,
                  border: 0,
                  background: "transparent",
                }}
              />
            </Box>

            <IconButton
              disableRipple
              onClick={() => editor.chain().focus().undo().run()}
              sx={{ ...toolbarButtonBase }}
            >
              <UndoIcon fontSize="small" />
            </IconButton>

            <IconButton
              disableRipple
              onClick={() => editor.chain().focus().redo().run()}
              sx={{ ...toolbarButtonBase }}
            >
              <RedoIcon fontSize="small" />
            </IconButton>

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

            {!hideImageButton && (
              <>
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
              </>
            )}
          </Box>
        )}

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
  },
);

export default RichTextEditor;