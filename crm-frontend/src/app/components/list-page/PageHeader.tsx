"use client";

import { Box, Typography, Button } from "@mui/material";

type PageHeaderProps = {
  title: string;
  primaryButton: string;
  secondaryButton?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
};

export default function PageHeader({
  title,
  primaryButton,
  secondaryButton,
  onPrimaryClick,
  onSecondaryClick,
  primaryDisabled = false,
  secondaryDisabled = false,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {/* Desktop / Tablet */}
      <Box
        sx={{
          display: {
            xs: "none",
            sm: "flex",
          },
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Secondary Button */}
          {secondaryButton && (
            <Button
              type="button"
              variant="outlined"
              onClick={onSecondaryClick}
              disabled={secondaryDisabled}
              sx={{
                width: 134,
                height: 44,
                px: 2,
                borderRadius: "6px",
                border: "1px solid",
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 500,
                textTransform: "none",
                whiteSpace: "nowrap",
                cursor: secondaryDisabled ? "not-allowed" : "pointer",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(91, 77, 222, 0.04)",
                },
              }}
            >
              {secondaryButton}
            </Button>
          )}

          {/* Primary Button */}
          <Button
            type="button"
            variant="contained"
            onClick={onPrimaryClick}
            disabled={primaryDisabled}
            sx={{
              width: 134,
              height: 44,
              px: 2,
              borderRadius: "6px",
              fontWeight: 500,
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "none",
              cursor: primaryDisabled ? "not-allowed" : "pointer",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            {primaryButton}
          </Button>
        </Box>
      </Box>

      {/* Mobile */}
      <Box
        sx={{
          display: {
            xs: "flex",
            sm: "none",
          },
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {/* Mobile Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: "100%",
          }}
        >
          {/* Secondary Button */}
          {secondaryButton && (
            <Button
              type="button"
              variant="outlined"
              onClick={onSecondaryClick}
              disabled={secondaryDisabled}
              sx={{
                flex: 1,
                minWidth: 0,
                height: 44,
                borderRadius: "6px",
                border: "1px solid",
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 500,
                textTransform: "none",
                whiteSpace: "nowrap",
                cursor: secondaryDisabled ? "not-allowed" : "pointer",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(91, 77, 222, 0.04)",
                },
              }}
            >
              {secondaryButton}
            </Button>
          )}

          {/* Primary Button */}
          <Button
            type="button"
            variant="contained"
            onClick={onPrimaryClick}
            disabled={primaryDisabled}
            sx={{
              flex: 1,
              minWidth: 0,
              height: 44,
              borderRadius: "6px",
              fontWeight: 500,
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "none",
              cursor: primaryDisabled ? "not-allowed" : "pointer",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            {primaryButton}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
