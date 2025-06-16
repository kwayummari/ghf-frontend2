import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  GetApp as ExportIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  getAttendanceStats,
  getDepartmentAttendanceReport,
  selectAttendanceStats,
  selectDepartmentReport,
  selectAttendanceLoading,
  selectAttendanceError,
  clearError,
} from "../../../store/slices/attendanceSlice";
import { useAuth } from "../auth/AuthGuard";
import { ATTENDANCE_STATUS, ROLES } from "../../../constants";
import attendanceAPI from "../../../services/api/attendance.api";

const AttendanceReports = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useAuth();

  const attendanceStats = useSelector(selectAttendanceStats);
  const departmentReport = useSelector(selectDepartmentReport);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);

  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const isManager = hasAnyRole([
    ROLES.ADMIN,
    ROLES.HR_MANAGER,
    ROLES.DEPARTMENT_HEAD,
  ]);

  useEffect(() => {
    if (isManager) {
      loadReportsData();
    }
  }, [
    dispatch,
    selectedPeriod,
    selectedMonth,
    selectedYear,
    selectedDepartment,
  ]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      dispatch(clearError());
    }
  }, [error, enqueueSnackbar, dispatch]);

  const loadReportsData = () => {
    const params = {
      period: selectedPeriod,
      month: selectedMonth,
      year: selectedYear,
      department_id: selectedDepartment || undefined,
    };

    dispatch(getAttendanceStats(params));

    if (selectedDepartment) {
      dispatch(
        getDepartmentAttendanceReport({
          departmentId: selectedDepartment,
          params: {
            date: `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}-01`,
          },
        })
      );
    }
  };

  const handleExportReport = async () => {
    try {
      const params = {
        period: selectedPeriod,
        month: selectedMonth,
        year: selectedYear,
        department_id: selectedDepartment || undefined,
        format: "excel",
      };

      const blob = await attendanceAPI.exportAttendanceReport(params);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_report_${selectedYear}_${selectedMonth}.xlsx`;
      link.click();

      window.URL.revokeObjectURL(url);
      enqueueSnackbar("Report exported successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to export report", { variant: "error" });
    }
  };

  // Sample data - replace with real data from API
  const sampleStats = {
    totalEmployees: 156,
    presentToday: 142,
    absentToday: 8,
    onLeaveToday: 6,
    attendanceRate: 91.0,
    avgWorkingHours: 7.8,
    lateArrivals: 12,
    earlyDepartures: 5,
  };

  const monthlyTrends = [
    { month: "Jan", present: 85, absent: 10, onLeave: 5 },
    { month: "Feb", present: 88, absent: 8, onLeave: 4 },
    { month: "Mar", present: 91, absent: 6, onLeave: 3 },
    { month: "Apr", present: 89, absent: 7, onLeave: 4 },
    { month: "May", present: 92, absent: 5, onLeave: 3 },
    { month: "Jun", present: 90, absent: 6, onLeave: 4 },
  ];

  const departmentStats = [
    {
      department: "IT",
      total: 25,
      present: 23,
      absent: 1,
      onLeave: 1,
      rate: 92,
    },
    {
      department: "HR",
      total: 15,
      present: 14,
      absent: 1,
      onLeave: 0,
      rate: 93,
    },
    {
      department: "Finance",
      total: 20,
      present: 18,
      absent: 1,
      onLeave: 1,
      rate: 90,
    },
    {
      department: "Operations",
      total: 35,
      present: 32,
      absent: 2,
      onLeave: 1,
      rate: 91,
    },
    {
      department: "Admin",
      total: 12,
      present: 11,
      absent: 0,
      onLeave: 1,
      rate: 92,
    },
  ];

  const attendanceBreakdown = [
    { name: "Present", value: 142, color: "#4caf50" },
    { name: "Absent", value: 8, color: "#f44336" },
    { name: "On Leave", value: 6, color: "#2196f3" },
  ];

  const topPerformers = [
    { id: 1, name: "Alice Johnson", attendance: 98, avatar: "AJ" },
    { id: 2, name: "Bob Smith", attendance: 97, avatar: "BS" },
    { id: 3, name: "Carol Davis", attendance: 96, avatar: "CD" },
    { id: 4, name: "David Wilson", attendance: 95, avatar: "DW" },
    { id: 5, name: "Eva Martinez", attendance: 94, avatar: "EM" },
  ];

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  if (!isManager) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Access restricted to managers and administrators only
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Attendance Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive attendance analytics and insights
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<ExportIcon />}
          onClick={handleExportReport}
        >
          Export Report
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {monthOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                inputProps={{ min: 2020, max: new Date().getFullYear() + 1 }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                <MenuItem value="1">IT Department</MenuItem>
                <MenuItem value="2">Human Resources</MenuItem>
                <MenuItem value="3">Finance</MenuItem>
                <MenuItem value="4">Operations</MenuItem>
                <MenuItem value="5">Administration</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {sampleStats.presentToday}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Today
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "success.main" }}
                  >
                    {sampleStats.attendanceRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: "success.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "info.main" }}
                  >
                    {sampleStats.avgWorkingHours}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Working Hours
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, color: "info.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", color: "warning.main" }}
                  >
                    {sampleStats.lateArrivals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late Arrivals
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: "warning.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Attendance Trends Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Monthly Attendance Trends
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#4caf50" name="Present" />
                  <Bar dataKey="absent" fill="#f44336" name="Absent" />
                  <Bar dataKey="onLeave" fill="#2196f3" name="On Leave" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Breakdown Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Today's Breakdown
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Performance */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Department Performance
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="center">Total</TableCell>
                      <TableCell align="center">Present</TableCell>
                      <TableCell align="center">Absent</TableCell>
                      <TableCell align="center">On Leave</TableCell>
                      <TableCell align="center">Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentStats.map((dept) => (
                      <TableRow key={dept.department}>
                        <TableCell>{dept.department}</TableCell>
                        <TableCell align="center">{dept.total}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={dept.present}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={dept.absent}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={dept.onLeave}
                            color="info"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={dept.rate}
                              sx={{ width: 60, height: 6 }}
                              color={
                                dept.rate >= 90
                                  ? "success"
                                  : dept.rate >= 80
                                    ? "warning"
                                    : "error"
                              }
                            />
                            <Typography variant="body2">
                              {dept.rate}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Top Performers
              </Typography>

              {topPerformers.map((performer, index) => (
                <Box
                  key={performer.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1,
                    borderBottom:
                      index < topPerformers.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{ bgcolor: "primary.main", width: 32, height: 32 }}
                    >
                      {performer.avatar}
                    </Avatar>
                    <Typography variant="body2">{performer.name}</Typography>
                  </Box>
                  <Chip
                    label={`${performer.attendance}%`}
                    color="success"
                    size="small"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttendanceReports;
