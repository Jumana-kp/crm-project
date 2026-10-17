"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { usePathname, useRouter } from "next/navigation";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Toolbar,
  Typography,
  CircularProgress,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { logoutUser } from "@/store/slices/authSlice";

import axiosInstance from "@/api/axios";

/* =========================================================
   TYPES
========================================================= */

type GlobalSearchResult = {
  type: "lead" | "deal" | "company" | "ticket" | "user";
  id: number;
  name: string;

  // Lead
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string | null;
  lead_status?: string;
  city?: string;
  job_title?: string;

  // Deal
  amount?: number;
  stage?: string;
  priority?: string;
  close_date?: string;

  // Company
  domain_name?: string;
  industry?: string;
  company_type?: string;
  country?: string;
  no_of_employees?: number | null;
  annual_revenue?: number | null;

  // Ticket
  description?: string;
  ticket_status?: string;
  source?: string;

  // User
  role?: string;
  company_name?: string | null;
  industry_type?: string | null;
};

type GlobalSearchResponse = {
  search: string;
  count: number;
  results: GlobalSearchResult[];
};
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/store/slices/notificationsSlice";

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const pathname = usePathname();

  const router = useRouter();

  const dispatch = useAppDispatch();

  /* =======================================================
     AUTH USER
  ======================================================= */

  const user = useAppSelector((state) => state.auth.user);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const notifications = useAppSelector(
    (state) => state.notifications.notifications,
  );

  const unreadCount = useAppSelector(
    (state) => state.notifications.unreadCount,
  );

  const notificationLoading = useAppSelector(
    (state) => state.notifications.loading,
  );

  const readLoading = useAppSelector(
    (state) => state.notifications.readLoading,
  );

  /* =======================================================
     MOUNTED
     
     Prevent hydration mismatch.
  ======================================================= */

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* =======================================================
     NOTIFICATION DROPDOWN
  ======================================================= */

  const [openNotifications, setOpenNotifications] = useState(false);

  /* =======================================================
     FETCH UNREAD COUNT AUTOMATICALLY
  ======================================================= */

  useEffect(() => {
    if (!mounted || !user) {
      return;
    }

    // Fetch immediately
    dispatch(fetchUnreadCount());

    // Then check every 5 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [mounted, user, dispatch]);

  /* =======================================================
     FETCH NOTIFICATIONS WHEN DROPDOWN OPENS
  ======================================================= */

  useEffect(() => {
    if (!openNotifications || !user) {
      return;
    }

    dispatch(fetchNotifications());
  }, [openNotifications, user, dispatch]);

  /* =======================================================
     PROFILE
  ======================================================= */

  const [openProfile, setOpenProfile] = useState(false);

  /* =======================================================
     GLOBAL SEARCH
  ======================================================= */

  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);

  const [searchLoading, setSearchLoading] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchError, setSearchError] = useState(false);

  /* =======================================================
     AI
  ======================================================= */

  const showAI = pathname === "/dashboard";

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    dispatch(logoutUser());

    setOpenProfile(false);

    setOpenNotifications(false);

    router.push("/");
  };

  /* =======================================================
     GLOBAL SEARCH API
  ======================================================= */

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchOpen(false);
      setSearchLoading(false);
      setSearchError(false);

      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);

        setSearchError(false);

        setSearchOpen(true);

        const response = await axiosInstance.get<GlobalSearchResponse>(
          "/global-search/",
          {
            params: {
              search: query,
            },
          },
        );

        setSearchResults(response.data?.results || []);
      } catch (error) {
        console.error("Global search failed:", error);

        setSearchResults([]);

        setSearchError(true);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  /* =======================================================
     GROUP SEARCH RESULTS
  ======================================================= */

  const groupedResults = useMemo(() => {
    return {
      lead: searchResults.filter((item) => item.type === "lead"),

      deal: searchResults.filter((item) => item.type === "deal"),

      company: searchResults.filter((item) => item.type === "company"),

      ticket: searchResults.filter((item) => item.type === "ticket"),

      user: searchResults.filter((item) => item.type === "user"),
    };
  }, [searchResults]);

  /* =======================================================
     SEARCH RESULT SUBTITLE
  ======================================================= */

  const getResultSubtitle = (result: GlobalSearchResult) => {
    switch (result.type) {
      case "lead":
        return result.email || result.lead_status || "Lead";

      case "deal":
        if (result.stage) {
          return result.stage
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
        }

        return "Deal";

      case "company":
        return result.domain_name || result.email || "Company";

      case "ticket":
        if (result.ticket_status && result.priority) {
          return `${result.ticket_status} • ${result.priority}`;
        }

        return result.ticket_status || result.priority || "Ticket";

      case "user":
        return result.email || result.role || "User";

      default:
        return "";
    }
  };

  /* =======================================================
     SEARCH RESULT ICON
  ======================================================= */

  const getResultIcon = (type: GlobalSearchResult["type"]) => {
    switch (type) {
      case "lead":
        return <PersonOutlineOutlinedIcon fontSize="small" />;

      case "deal":
        return <BusinessCenterOutlinedIcon fontSize="small" />;

      case "company":
        return <BusinessOutlinedIcon fontSize="small" />;

      case "ticket":
        return <ConfirmationNumberOutlinedIcon fontSize="small" />;

      case "user":
        return <GroupOutlinedIcon fontSize="small" />;

      default:
        return null;
    }
  };

  /* =======================================================
     SEARCH RESULT NAVIGATION
  ======================================================= */

  const handleSearchResultClick = (result: GlobalSearchResult) => {
    setSearchOpen(false);

    setSearchQuery("");

    switch (result.type) {
      case "lead":
        router.push(`/leads/${result.id}`);
        break;

      case "deal":
        router.push(`/deals/${result.id}`);
        break;

      case "company":
        router.push(`/companies/${result.id}`);
        break;

      case "ticket":
        router.push(`/tickets/${result.id}`);
        break;

      case "user":
        router.push(`/users/${result.id}`);
        break;

      default:
        break;
    }
  };

  /* =======================================================
     NOTIFICATION CLICK
  ======================================================= */

  const handleNotificationClick = (notificationId: number, isRead: boolean) => {
    if (isRead || readLoading) {
      return;
    }

    dispatch(markNotificationAsRead(notificationId));
  };

  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0 || readLoading) {
      return;
    }

    dispatch(markAllNotificationsAsRead());
  };

  /* =======================================================
     USER DETAILS
  ======================================================= */

  const displayedUser = mounted ? user : null;

  const userInitial = displayedUser?.first_name?.charAt(0).toUpperCase() || "U";

  const fullName =
    `${displayedUser?.first_name || ""} ${
      displayedUser?.last_name || ""
    }`.trim() || "User";

  /* =======================================================
     SEARCH GROUP CONFIGURATION
  ======================================================= */

  const searchGroups: {
    type: GlobalSearchResult["type"];
    label: string;
  }[] = [
    {
      type: "lead",
      label: "Leads",
    },
    {
      type: "deal",
      label: "Deals",
    },
    {
      type: "company",
      label: "Companies",
    },
    {
      type: "ticket",
      label: "Tickets",
    },
    {
      type: "user",
      label: "Users",
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        ml: "90px",
        height: "86px",
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          height: "86px",
          px: {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 5,
          },
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: {
              xs: 18,
              sm: 24,
            },
            color: "text.primary",
            whiteSpace: "nowrap",
          }}
        >
          CRM
        </Typography>

        <Box
          sx={{
            flex: 1,
          }}
        />

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* =================================================
              SEARCH
          ================================================= */}

          <Box
            sx={{
              position: "relative",
              width: {
                xs: 120,
                sm: 220,
                md: 300,
              },
            }}
          >
            {/* Search input */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: 44,
                borderRadius: 0.5,
                border: "1px solid",
                borderColor:
                  searchOpen && searchQuery.trim() ? "primary.main" : "divider",
                px: 1,
                backgroundColor: "background.paper",
                transition: "border-color 0.2s ease",
              }}
            >
              <SearchIcon
                sx={{
                  fontSize: 18,
                  color: "text.secondary",
                }}
              />

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  mx: 1,
                  borderColor: "divider",
                }}
              />

              <InputBase
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);

                  if (event.target.value.trim()) {
                    setSearchOpen(true);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setSearchOpen(true);
                  }
                }}
                placeholder="Search"
                inputProps={{
                  "aria-label": "Global search",
                }}
                sx={{
                  ml: 1,
                  flex: 1,
                  fontSize: 14,
                  minWidth: 0,
                }}
              />

              {searchLoading && (
                <CircularProgress
                  size={18}
                  thickness={4}
                  sx={{
                    ml: 0.5,
                    mr: 0.5,
                  }}
                />
              )}
            </Box>

            {/* Search dropdown */}

            {searchOpen && (
              <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
                <Paper
                  elevation={8}
                  sx={{
                    position: "absolute",
                    top: 52,
                    left: 0,
                    width: {
                      xs: 280,
                      sm: 360,
                      md: 420,
                    },
                    maxHeight: 520,
                    overflowY: "auto",
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: "divider",
                    zIndex: 2000,
                  }}
                >
                  {searchLoading ? (
                    <Box
                      sx={{
                        py: 3,
                        px: 2,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Searching...
                      </Typography>
                    </Box>
                  ) : searchError ? (
                    <Box
                      sx={{
                        py: 3,
                        px: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" color="error">
                        Unable to search right now.
                      </Typography>
                    </Box>
                  ) : searchResults.length === 0 ? (
                    <Box
                      sx={{
                        py: 3,
                        px: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No results found
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ py: 1 }}>
                      {searchGroups.map(({ type, label }) => {
                        const items = groupedResults[type];

                        if (!items.length) {
                          return null;
                        }

                        return (
                          <Box key={type}>
                            <Typography
                              sx={{
                                px: 2,
                                py: 1,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "text.secondary",
                                textTransform: "uppercase",
                              }}
                            >
                              {label}
                            </Typography>

                            {items.slice(0, 5).map((result) => (
                              <Box
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleSearchResultClick(result)}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  px: 2,
                                  py: 1.25,
                                  cursor: "pointer",
                                  "&:hover": {
                                    backgroundColor: "action.hover",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 32,
                                    height: 32,
                                    flexShrink: 0,
                                    borderRadius: "8px",
                                    backgroundColor: "action.selected",
                                    color: "primary.main",
                                  }}
                                >
                                  {getResultIcon(result.type)}
                                </Box>

                                <Box
                                  sx={{
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {result.name}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.25,
                                      fontSize: 12,
                                      color: "text.secondary",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {getResultSubtitle(result)}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}

                            <Divider />
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              </ClickAwayListener>
            )}
          </Box>

          {/* =================================================
              AI BUTTON
          ================================================= */}

          {showAI && (
            <IconButton
              sx={{
                width: 40,
                height: 40,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                backgroundColor: "background.paper",

                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Image
                src="/images/chatbot.jpg"
                alt="Chatbot"
                width={22}
                height={22}
              />
            </IconButton>
          )}

          {/* =================================================
              NOTIFICATION
          ================================================= */}

          <Box
            sx={{
              width: 40,
              height: 40,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
              backgroundColor: "background.paper",

              "&:hover": {
                backgroundColor: "action.hover",
              },
              position: "relative",
            }}
          >
            <IconButton
              onClick={() => {
                setOpenNotifications((prev) => !prev);

                setOpenProfile(false);
              }}
              sx={{
                width: 40,
                height: 40,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                backgroundColor: "background.paper",

                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Badge
                badgeContent={unreadCount > 99 ? "99+" : unreadCount}
                invisible={unreadCount === 0}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    padding: "0 4px",
                    borderRadius: "10px",
                  },
                }}
              >
                <NotificationsNoneOutlinedIcon
                  sx={{
                    color: "primary.main",
                  }}
                />
              </Badge>
            </IconButton>

            {/* =================================================
                NOTIFICATION DROPDOWN
            ================================================= */}

            {openNotifications && (
              <ClickAwayListener
                onClickAway={() => setOpenNotifications(false)}
              >
                <Paper
                  elevation={8}
                  sx={{
                    position: "absolute",
                    top: 52,
                    right: 0,
                    width: {
                      xs: 320,
                      sm: 400,
                    },
                    maxHeight: 500,
                    borderRadius: "12px",
                    border: "1px solid #EAECF0",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0px 12px 32px rgba(16,24,40,0.14)",
                    zIndex: 1600,
                    overflow: "hidden",
                  }}
                >
                  {/* =================================================
                      HEADER
                  ================================================= */}

                  <Box
                    sx={{
                      px: 2,
                      py: 1.8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #EAECF0",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "text.primary",
                        }}
                      >
                        Notifications
                      </Typography>

                      {unreadCount > 0 && (
                        <Typography
                          sx={{
                            mt: 0.3,
                            fontSize: 12,
                            color: "text.secondary",
                          }}
                        >
                          {unreadCount} unread
                        </Typography>
                      )}
                    </Box>

                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        startIcon={
                          <DoneAllIcon
                            sx={{
                              fontSize: 16,
                            }}
                          />
                        }
                        onClick={handleMarkAllAsRead}
                        disabled={readLoading}
                        sx={{
                          textTransform: "none",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Mark all read
                      </Button>
                    )}
                  </Box>

                  {/* =================================================
                      BODY
                  ================================================= */}

                  <Box
                    sx={{
                      maxHeight: 420,
                      overflowY: "auto",
                    }}
                  >
                    {notificationLoading ? (
                      <Box
                        sx={{
                          height: 180,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CircularProgress size={28} />
                      </Box>
                    ) : notifications.length === 0 ? (
                      <Box
                        sx={{
                          py: 5,
                          px: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <NotificationsOffOutlinedIcon
                          sx={{
                            fontSize: 42,
                            color: "text.disabled",
                            mb: 1,
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "text.secondary",
                          }}
                        >
                          No notifications
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.5,
                            fontSize: 12,
                            color: "text.disabled",
                          }}
                        >
                          You&apos;re all caught up.
                        </Typography>
                      </Box>
                    ) : (
                      notifications.map((notification) => (
                        <Box
                          key={notification.id}
                          onClick={() =>
                            handleNotificationClick(
                              notification.id,
                              notification.is_read,
                            )
                          }
                          sx={{
                            px: 2,
                            py: 1.6,
                            display: "flex",
                            gap: 1.5,
                            cursor: notification.is_read
                              ? "default"
                              : "pointer",
                            backgroundColor: notification.is_read
                              ? "#FFFFFF"
                              : "#F5F8FF",
                            borderBottom: "1px solid #F0F1F3",
                            transition: "background-color 0.2s",

                            "&:hover": {
                              backgroundColor: notification.is_read
                                ? "#FFFFFF"
                                : "#EEF4FF",
                            },
                          }}
                        >
                          {/* UNREAD DOT */}

                          <Box
                            sx={{
                              width: 8,
                              minWidth: 8,
                              height: 8,
                              borderRadius: "50%",
                              mt: 0.8,
                              backgroundColor: notification.is_read
                                ? "transparent"
                                : "primary.main",
                            }}
                          />

                          {/* MESSAGE */}

                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 14,
                                lineHeight: 1.5,
                                fontWeight: notification.is_read ? 400 : 600,
                                color: "text.primary",
                                wordBreak: "break-word",
                              }}
                            >
                              {notification.message}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 11,
                                color: "text.secondary",
                              }}
                            >
                              {new Date(
                                notification.created_at,
                              ).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Paper>
              </ClickAwayListener>
            )}
          </Box>

          {/* =================================================
              USER
          ================================================= */}

          <Box
            sx={{
              position: "relative",
            }}
          >
            <Avatar
              onClick={() => {
                setOpenProfile((prev) => !prev);
                setOpenNotifications(false);
              }}
              sx={{
                bgcolor: "primary.main",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {userInitial}
            </Avatar>

            {openProfile && (
              <ClickAwayListener onClickAway={() => setOpenProfile(false)}>
                <Paper
                  elevation={6}
                  sx={{
                    position: "absolute",
                    top: 54,
                    right: 0,
                    width: 360,
                    p: 3,
                    borderRadius: "12px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EAECF0",
                    boxShadow: "0px 12px 24px rgba(16,24,40,0.08)",
                    zIndex: 1500,
                  }}
                >
                  {/* =================================================
                      USER NAME
                  ================================================= */}

                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    {fullName}
                  </Typography>

                  {/* =================================================
                      USER EMAIL
                  ================================================= */}

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 16,
                      color: "#667085",
                    }}
                  >
                    {displayedUser?.email || "No email"}
                  </Typography>

                  {/* =================================================
                      LOGOUT
                  ================================================= */}

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleLogout}
                    sx={{
                      mt: 3,
                      height: 52,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: 18,
                      fontWeight: 600,
                      boxShadow: "none",
                    }}
                  >
                    Log Out
                  </Button>
                </Paper>
              </ClickAwayListener>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
