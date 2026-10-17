"use client";

import { Box, TextField, Typography } from "@mui/material";

type AboutField = {
  key: string;
  label: string;
  value?: string | number | null;
};

type AboutSectionProps = {
  title?: string;
  fields: AboutField[];
  isEditing?: boolean;
  onChange?: (index: number, value: string) => void;
};

export default function AboutSection({
  title = "About",
  fields,
  isEditing = false,
  onChange,
}: AboutSectionProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Fields */}

      {fields?.map((field, index) => (
        <Box key={field.key || index}>
          {/* Label */}

          <Typography
            sx={{
              fontSize: 12,
              color: "#667085",
              mb: 0.5,
            }}
          >
            {field.label}
          </Typography>

          {/* Value */}

          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              value={
                field.value === null || field.value === undefined
                  ? ""
                  : String(field.value)
              }
              onChange={(event) => onChange?.(index, event.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: 14,
                },
              }}
            />
          ) : (
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 500,
                color: "#101828",
                mt: 0.5,
                wordBreak: "break-word",
              }}
            >
              {field.value === null ||
              field.value === undefined ||
              field.value === ""
                ? "-"
                : String(field.value)}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
