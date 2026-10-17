import LoginPage from "@/app/login/page";
import { Box, Typography } from "@mui/material";

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 600,
          mt: 4,
          color: "text.primary",
          gap: 2,
        }}
      >
        Welcome to CRM
      </Typography>

      <LoginPage />
    </Box>
  );
}
