// "use client";

import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const SIDEBAR_WIDTH = 90;
const NAVBAR_HEIGHT = 80;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <Box sx={{ display: "flex" }}>
      <Navbar />
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: `${NAVBAR_HEIGHT}px`,
          pl: `${SIDEBAR_WIDTH}px`,
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#f8fafc",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}