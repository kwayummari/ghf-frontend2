import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Divider,
  LinearProgress,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  AccessTime as ClockIcon,
  CheckCircle as CheckInIcon,
  ExitToApp as CheckOutIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import attendanceAPI from "../../../services/api/attendance.api";
import useNotification from "../../../hooks/common/useNotification";

const ClockInOut = () => {
  const user = useSelector(selectUser);
  const { showSuccess, showError, showWarning } = useNotification();

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({
    totalHours: "0h",
    daysPresent: 0,
    totalDays: 5,
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Helper function to get week start (Monday)
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  };

  // Helper function to format hours from minutes
  const formatHoursFromMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  // Fetch today's attendance status
  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await attendanceAPI.getMyAttendance({
        date: today,
        limit: 1,
      });

      if (response.success && response.data && response.data.length > 0) {
        const attendance = response.data[0]; // ✅ Get first item from array

        // Check attendance status based on API response
        if (attendance.arrival_time && !attendance.departure_time) {
          setAttendanceStatus("clocked_in");
          setTodayAttendance(attendance);
        } else if (attendance.arrival_time && attendance.departure_time) {
          setAttendanceStatus("completed");
          setTodayAttendance(attendance);
        } else {
          setAttendanceStatus("not_started");
          setTodayAttendance(null);
        }
      } else {
        setAttendanceStatus("not_started");
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setAttendanceStatus("not_started");
      setTodayAttendance(null);

      // Only show error if it's not a "no data found" scenario
      if (error.status !== 404) {
        showError("Failed to load attendance data");
      }
    }
  };

  // Fetch weekly stats
  const fetchWeeklyStats = async () => {
    try {
      const response = await attendanceAPI.getWeeklyAttendance({
        user_id: user?.id,
        week_start: getWeekStart(),
      });

      if (response.success && response.data) {
        const stats = response.data;
        setWeeklyStats({
          totalHours: formatHoursFromMinutes(stats.total_minutes || 0),
          daysPresent: stats.days_present || 0,
          totalDays: stats.total_working_days || 5,
        });
      }
    } catch (error) {
      console.error("Failed to fetch weekly stats:", error);
      // Don't show error for weekly stats as it's secondary data
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchTodayAttendance(),
          user?.id ? fetchWeeklyStats() : Promise.resolve(),
        ]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchTodayAttendance(), fetchWeeklyStats()]);
      showSuccess("Data refreshed successfully");
    } catch (error) {
      showError("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle clock in
  const handleClockIn = async () => {
    if (!user?.id) {
      showError("User information not available");
      return;
    }

    setLoading(true);
    try {
      const clockInData = {
        activity: "Office work",
      };

      const response = await attendanceAPI.clockIn(clockInData);

      if (response.success) {
        const attendance = response.data;
        setTodayAttendance(attendance);
        setAttendanceStatus("clocked_in");
        showSuccess("Successfully clocked in!");

        // Refresh weekly stats
        await fetchWeeklyStats();
      } else {
        throw new Error(response.message || "Failed to clock in");
      }
    } catch (error) {
      console.error("Clock in failed:", error);
      showError(error.userMessage || "Failed to clock in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle clock out
  const handleClockOut = async () => {
    if (!todayAttendance?.id) {
      showError("No active clock-in session found");
      return;
    }

    setLoading(true);
    try {
      const clockOutData = {
        activity: todayAttendance.activity || "Completed work",
        description: "Clocked out via web application",
      };

      const response = await attendanceAPI.clockOut(clockOutData);

      if (response.success) {
        const attendance = response.data;
        setTodayAttendance(attendance);
        setAttendanceStatus("completed");
        showSuccess("Successfully clocked out!");

        // Refresh weekly stats
        await fetchWeeklyStats();
      } else {
        throw new Error(response.message || "Failed to clock out");
      }
    } catch (error) {
      console.error("Clock out failed:", error);
      showError(error.userMessage || "Failed to clock out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate working hours
  const calculateWorkingHours = () => {
    if (!todayAttendance?.arrival_time) return "0h 0m";

    const arrival = new Date(todayAttendance.arrival_time);
    const departure = todayAttendance.departure_time
      ? new Date(todayAttendance.departure_time)
      : new Date(); // Use current time if not clocked out yet

    const diffMs = departure - arrival;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return diffMinutes > 0
        ? `${diffHours}h ${diffMinutes}m`
        : `${diffHours}h`;
    }
    return `${diffMinutes}m`;
  };

  // Get working hours progress (out of 8 hours)
  const getWorkingHoursProgress = () => {
    if (!todayAttendance?.arrival_time) return 0;

    const arrival = new Date(todayAttendance.arrival_time);
    const now =
      attendanceStatus === "completed" && todayAttendance.departure_time
        ? new Date(todayAttendance.departure_time)
        : currentTime;

    const diffMs = now - arrival;
    const hours = diffMs / (1000 * 60 * 60);

    return Math.min((hours / 8) * 100, 100); // 8 hours = 100%
  };

  // Format time from ISO string to HH:MM
  const formatTime = (timeString) => {
    if (!timeString) return "--:--";

    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "--:--";
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    const firstName = user?.first_name || "";
    const surname = user?.sur_name || user?.last_name || "";
    return firstName && surname
      ? `${firstName} ${surname}`
      : user?.email || "User";
  };

  // Get status color
  const getStatusColor = () => {
    switch (attendanceStatus) {
      case "clocked_in":
        return "success";
      case "completed":
        return "info";
      case "not_started":
      default:
        return "warning";
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (attendanceStatus) {
      case "clocked_in":
        return "Clocked In";
      case "completed":
        return "Day Completed";
      case "not_started":
      default:
        return "Not Clocked In";
    }
  };

  // Check if it's within working hours (7 AM to 8 PM)
  const isWithinWorkingHours = () => {
    const hour = currentTime.getHours();
    return hour >= 7 && hour <= 20;
  };

  // Show loading spinner for initial load
  if (initialLoading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Attendance
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Clock in and out to track your working hours
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Attendance
          </Typography>
          <Button
            variant="outlined"
            startIcon={
              refreshing ? <CircularProgress size={16} /> : <RefreshIcon />
            }
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Clock in and out to track your working hours
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Clock In/Out Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              {/* Current Time */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography
                  variant="h2"
                  sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}
                >
                  {currentTime.toLocaleTimeString()}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* User Info */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: "primary.main",
                    mr: 2,
                  }}
                >
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    {getUserDisplayName()}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label={getStatusText()}
                      color={getStatusColor()}
                      size="small"
                    />
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {todayAttendance?.location || "Office Location"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Working Hours Warning */}
              {!isWithinWorkingHours() &&
                attendanceStatus === "not_started" && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    You are outside normal working hours (7:00 AM - 8:00 PM).
                    Please contact your supervisor if you need to clock in
                    during this time.
                  </Alert>
                )}

              {/* Attendance Actions */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <LoadingButton
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<CheckInIcon />}
                    loading={loading && attendanceStatus === "not_started"}
                    disabled={attendanceStatus !== "not_started"}
                    onClick={handleClockIn}
                    sx={{ py: 2 }}
                  >
                    Clock In
                  </LoadingButton>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LoadingButton
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<CheckOutIcon />}
                    loading={loading && attendanceStatus === "clocked_in"}
                    disabled={attendanceStatus !== "clocked_in"}
                    onClick={handleClockOut}
                    sx={{ py: 2 }}
                  >
                    Clock Out
                  </LoadingButton>
                </Grid>
              </Grid>

              {/* Working Hours Progress */}
              {(attendanceStatus === "clocked_in" ||
                attendanceStatus === "completed") && (
                <Box sx={{ mt: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Working Hours Today
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {calculateWorkingHours()} / 8h
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getWorkingHoursProgress()}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={
                      getWorkingHoursProgress() >= 100 ? "success" : "primary"
                    }
                  />
                  {getWorkingHoursProgress() >= 100 && (
                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{ mt: 1, display: "block" }}
                    >
                      ✓ Minimum working hours completed
                    </Typography>
                  )}
                </Box>
              )}

              {/* Additional Info */}
              {todayAttendance?.notes && (
                <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {todayAttendance.notes}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Today's Summary
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CheckInIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Clock In Time</Typography>
                </Box>
                <Typography variant="h6" sx={{ ml: 4 }}>
                  {formatTime(todayAttendance?.arrival_time)}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CheckOutIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2">Clock Out Time</Typography>
                </Box>
                <Typography variant="h6" sx={{ ml: 4 }}>
                  {formatTime(todayAttendance?.departure_time)}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">Total Hours</Typography>
                </Box>
                <Typography variant="h6" sx={{ ml: 4 }}>
                  {calculateWorkingHours()}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Status
                </Typography>
                <Chip
                  label={getStatusText()}
                  color={getStatusColor()}
                  variant="filled"
                />
              </Box>

              {/* Activity */}
              {todayAttendance?.activity && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {todayAttendance.activity}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                This Week
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      color="primary.main"
                      sx={{ fontWeight: "bold" }}
                    >
                      {weeklyStats.totalHours}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Hours
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      color="success.main"
                      sx={{ fontWeight: "bold" }}
                    >
                      {weeklyStats.daysPresent}/{weeklyStats.totalDays}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Days Present
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Weekly Progress */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Weekly Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    (weeklyStats.daysPresent / weeklyStats.totalDays) * 100
                  }
                  sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Instructions */}
      {attendanceStatus === "not_started" && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Instructions:</strong> Click "Clock In" when you arrive at
            work. Remember to clock out when you finish your workday. Standard
            working hours are 8 hours per day.
            {!isWithinWorkingHours() && (
              <span style={{ display: "block", marginTop: "8px" }}>
                <strong>Note:</strong> You are currently outside normal working
                hours (7:00 AM - 8:00 PM).
              </span>
            )}
          </Typography>
        </Alert>
      )}

      {attendanceStatus === "completed" && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Great job!</strong> You have completed your workday. Total
            working time: {calculateWorkingHours()}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ClockInOut;
