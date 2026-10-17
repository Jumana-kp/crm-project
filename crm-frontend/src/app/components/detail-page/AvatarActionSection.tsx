"use client";

import { useState } from "react";

import { Avatar, Box, IconButton, Tooltip, Typography } from "@mui/material";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";

type AvatarActionSectionProps = {
  entity: any;
};

export default function AvatarActionSection({
  entity,
}: AvatarActionSectionProps) {
  // Header details.
  const header = entity?.header || {
    name: entity?.name || "",

    subtitle: entity?.industry || "",

    email: entity?.domain_name || "",

    secondLine: "",
  };

  // Company name.
  const companyName = header?.name || entity?.name || "Unknown";

  // Industry.
  const industry = header?.subtitle || entity?.industry || "";

  // Domain.
  const domain = header?.email || entity?.domain_name || "";

  // Copy state.
  const [copied, setCopied] = useState(false);

  // Copy domain.
  const handleCopyDomain = async () => {
    if (!domain) {
      return;
    }

    try {
      await navigator.clipboard.writeText(domain);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      // Clipboard access failed.
    }
  };

  const avatarText = getAvatarText(companyName);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        mb: 2,
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          bgcolor: "primary.main",
          fontSize: 18,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {avatarText}
      </Avatar>

      {/* Company details */}
      <Box
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      >
        {/* Company name */}
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: "#101828",
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {companyName}
        </Typography>

        {/* Industry */}
        {industry && (
          <Typography
            sx={{
              fontSize: 13,
              color: "#667085",
              mt: 0.35,
              lineHeight: 1.4,
              wordBreak: "break-word",
            }}
          >
            {industry}
          </Typography>
        )}

        {/* Domain and copy button */}
        {domain && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              mt: 0.25,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: "#475467",
                lineHeight: 1.4,
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {domain}
            </Typography>

            {/* Copy button */}
            <Tooltip title={copied ? "Copied" : "Copy domain"} arrow>
              <IconButton
                size="small"
                onClick={handleCopyDomain}
                sx={{
                  width: 24,
                  height: 24,
                  ml: 0.25,
                  color: copied ? "success.main" : "#667085",

                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                {copied ? (
                  <CheckIcon
                    sx={{
                      fontSize: 15,
                    }}
                  />
                ) : (
                  <ContentCopyOutlinedIcon
                    sx={{
                      fontSize: 15,
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Generate avatar initials.
function getAvatarText(name?: string) {
  if (!name) {
    return "C";
  }

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}
