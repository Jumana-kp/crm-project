"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import GroupIcon from "@mui/icons-material/Group";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchDashboard } from "@/store/slices/dashboardSlice";

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const { data, loading, error } = useAppSelector((state) => state.dashboard);

  const [reportType, setReportType] = useState("Monthly");

  // Fetch dashboard

  useEffect(() => {
    dispatch(fetchDashboard(reportType));
  }, [dispatch, reportType]);

  // Cards

  const cards = useMemo(
    () => [
      {
        id: "total-leads",
        title: "Total Leads",
        description: (data?.total_leads ?? 0).toLocaleString(),
        iconColor: "#5646DB",
        iconBg: "linear-gradient(180deg, #837cc3 0%, #FFFFFF 100%)",
        icon: <GroupIcon />,
      },
      {
        id: "active-deals",
        title: "Active Deals",
        description: (data?.active_deals ?? 0).toLocaleString(),
        iconColor: "#058d1b",
        iconBg: "linear-gradient(180deg, #a1e7ad 0%, #FFFFFF 100%)",
        icon: <BusinessCenterIcon />,
      },
      {
        id: "closed-deals",
        title: "Closed Deals",
        description: (data?.closed_deals ?? 0).toLocaleString(),
        iconColor: "#fa4b4b",
        iconBg: "linear-gradient(180deg, #d6b2b2 0%, #FFFFFF 100%)",
        icon: <BusinessCenterIcon />,
      },
      {
        id: "monthly-revenue",
        title: "Monthly Revenue",
        description: `$${Number(data?.monthly_revenue ?? 0).toLocaleString()}`,
        iconColor: "rgb(193, 148, 26)",
        iconBg: "linear-gradient(180deg, #d6cf7b 0%, #FFFFFF 100%)",
        icon: <MonetizationOnIcon />,
      },
    ],
    [data],
  );

  // Pipeline

  const pipelineStages = data?.conversion_pipeline ?? [];

  // Sales report

  const chartData = useMemo(() => {
    return (data?.sales_report ?? []).map((item) => {
      const actual = Number(item.actual ?? 0);

      const target = Number(item.target ?? 0);

      return {
        label: item.label,
        year: item.year,
        actual,
        target,
        remaining: Math.max(target - actual, 0),
      };
    });
  }, [data]);

  // Team

  const teamData = data?.team_performance ?? [];

  // Export CSV

  const handleExportCSV = () => {
    if (teamData.length === 0) {
      return;
    }

    const headers = [
      "Employee",
      "Active Deals",
      "Closed Deals",
      "Revenue",
      "Change",
    ];

    const rows = teamData.map((row) => [
      row.name,
      row.active_deals,
      row.closed_deals,
      row.revenue,
      row.change || "0%",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => {
            const stringValue = String(value ?? "");

            // Escape CSV values
            if (
              stringValue.includes(",") ||
              stringValue.includes('"') ||
              stringValue.includes("\n")
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }

            return stringValue;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `team-performance-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Loading

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error

  if (error && !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        backgroundColor: "background.default",
      }}
    >
      {/* Cards */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 3,
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            sx={{
              height: 150,
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <CardContent
              sx={{
                height: "100%",
                p: 3,
                position: "relative",
              }}
            >
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#7890A6",
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  position: "absolute",
                  bottom: 35,
                  left: 24,
                  fontSize: 40,
                  fontWeight: 545,
                  color: "#062B52",
                  lineHeight: 1,
                }}
              >
                {card.description}
              </Typography>

              <Box
                sx={{
                  position: "absolute",
                  right: 20,
                  top: 45,
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: card.iconBg,
                }}
              >
                {React.cloneElement(card.icon, {
                  sx: {
                    fontSize: 45,
                    color: card.iconColor,
                  },
                })}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Pipeline + Sales */}

      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            lg: "row",
          },
          gap: 2,
          mb: 4,
        }}
      >
        {/* Pipeline */}

        <Box
          sx={{
            width: {
              xs: "100%",
              lg: 500,
            },
            flexShrink: 0,
          }}
        >
          <Card
            sx={{
              width: "100%",
              minHeight: 450,
              borderRadius: "10px",
              border: "1px solid #E8EDF5",
              boxShadow: "none",
              p: {
                xs: 3,
                md: 5,
              },
            }}
          >
            <CardContent
              sx={{
                p: 0,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Conversion Pipeline
              </Typography>

              {pipelineStages.length === 0 ? (
                <Typography color="text.secondary">
                  No pipeline data available.
                </Typography>
              ) : (
                pipelineStages.map((stage) => (
                  <Box key={stage.key} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">{stage.label}</Typography>

                      <Typography variant="body2" color="text.secondary">
                        {stage.count}
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(Math.max(Number(stage.value), 0), 100)}
                      sx={{
                        height: 8,
                        borderRadius: 10,
                        backgroundColor: "#ECEFF3",

                        "& .MuiLinearProgress-bar": {
                          backgroundColor: stage.color,
                          borderRadius: 10,
                        },
                      }}
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Sales report */}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Card
            sx={{
              width: "100%",
              minHeight: 450,
              borderRadius: "10px",
              boxShadow: "none",
              border: "1px solid #F0F0F0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  Sales Reports
                </Typography>

                <FormControl size="small">
                  <Select
                    value={reportType}
                    onChange={(event) => setReportType(event.target.value)}
                    sx={{
                      width: 110,
                      height: 36,
                      fontSize: 14,
                    }}
                  >
                    <MenuItem value="Monthly">Monthly</MenuItem>

                    <MenuItem value="Weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {chartData.length === 0 ? (
                <Box
                  sx={{
                    height: 350,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    No sales report available.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 350,
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="purpleGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#A855F7" />

                          <stop offset="100%" stopColor="#7D69D8" />
                        </linearGradient>
                      </defs>

                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                          `$${Number(value).toLocaleString()}`
                        }
                      />

                      <Tooltip
                        formatter={(value, name) => [
                          `$${Number(value).toLocaleString()}`,
                          name === "actual" ? "Actual" : "Target",
                        ]}
                      />

                      <Bar
                        dataKey="actual"
                        stackId="sales"
                        fill="url(#purpleGradient)"
                        barSize={20}
                      />

                      <Bar
                        dataKey="remaining"
                        stackId="sales"
                        fill="#EEE8FF"
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Team performance */}

      <Card
        sx={{
          borderRadius: "10px",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Team Performance Tracking</Typography>

            <Button
              variant="outlined"
              onClick={handleExportCSV}
              disabled={teamData.length === 0}
            >
              Export CSV
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>

                  <TableCell align="center">Active Deals</TableCell>

                  <TableCell align="center">Closed Deals</TableCell>

                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {teamData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No team performance data
                    </TableCell>
                  </TableRow>
                ) : (
                  teamData.map((row, index) => (
                    <TableRow key={row.id ?? `team-${index}`}>
                      <TableCell>{row.name}</TableCell>

                      <TableCell align="center">{row.active_deals}</TableCell>

                      <TableCell align="center">{row.closed_deals}</TableCell>

                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography>
                            ${Number(row.revenue).toLocaleString()}
                          </Typography>

                          {row.change && (
                            <Chip
                              label={row.change}
                              size="small"
                              sx={{
                                bgcolor: row.is_positive
                                  ? "#E8F5E9"
                                  : "#FFEBEE",

                                color: row.is_positive ? "#2E7D32" : "#C62828",
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
