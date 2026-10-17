"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, List, ListItemButton, Typography } from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";

const menus = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: DashboardRoundedIcon,
  },
  {
    title: "Leads",
    path: "/leads",
    icon: PeopleOutlineRoundedIcon,
  },
  {
    title: "Companies",
    path: "/companies",
    icon: BusinessCenterOutlinedIcon,
  },
  {
    title: "Deals",
    path: "/deals",
    icon: AssignmentOutlinedIcon,
  },
  {
    title: "Tickets",
    path: "/tickets",
    icon: ConfirmationNumberOutlinedIcon,
  },
];

const NAVBAR_HEIGHT = 80;

export default function Sidebar() {
  const pathname = usePathname();

  const cleanPath =
    pathname?.split("?")[0].split("#")[0].replace(/\/$/, "");

  return (
    <Box
      sx={{
        position: "fixed",
        top: `${NAVBAR_HEIGHT}px`,
        left: 0,
        width: 90,
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        overflowY: "auto",
        backgroundColor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        // "&:hover": {
        // backgroundColor: "primary.main",
        // borderRadius: 2,
        // },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 2,
        // zIndex: 1200,
      }}
    >
      <List
        sx={{
          width: 65,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active =
            cleanPath === menu.path ||
            cleanPath.startsWith(menu.path + "/");

          return (
            <ListItemButton
              key={menu.title}
              component={NextLink}
              href={menu.path}
              selected={active}
              aria-label={menu.title}  
              sx={{
                width: "100%",
                height: 78,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.5,
                p: 0,
                "&:hover": {
                backgroundColor: "primary.main",
                borderRadius: 2,
                },
                "&.Mui-selected": {
                backgroundColor: "primary.light",
                borderRadius: 2,
              },
              }}
            >
              {/* ICON */}
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%",

                  border: active
                    ? "none"
                    : "1px solid",
                  borderColor: "divider",

                  backgroundColor: active
                    ? "primary.main"
                    : "transparent",

                  color: active
                    ? "#fff"
                    : "text.secondary",
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>

              {/* LABEL */}
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  color: active
                    ? "primary.main"
                    : "text.secondary",
                  textAlign: "center",
                }}
              >
                {menu.title}
              </Typography>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}