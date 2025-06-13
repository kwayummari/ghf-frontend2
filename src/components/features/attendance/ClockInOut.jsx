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
import {
  AccessTime as ClockIcon,
  CheckCircle as CheckInIcon,
  ExitToApp as CheckOutIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";

// Custom LoadingButton component to replace @mui/lab
const LoadingButton = ({
  loading,
  children,
  startIcon,
  disabled,
  onClick,
  variant = "contained",
  size = "medium",
  fullWidth = false,
  sx = {},
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? <CircularProgress size={16} /> : startIcon}
      sx={{
        position: "relative",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

const ClockInOut = () => {
  const user = useSelector(selectUser);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance status
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        // Simulate API call
        const sampleAttendance = {
          id: 1,
          date: new Date().toISOString().split("T")[0],
          arrival_time: "08:15:00",
          departure_time: null,
          status: "present",
          activity: "Office work",
        };

        // Check if user has already clocked in today
        if (sampleAttendance.arrival_time && !sampleAttendance.departure_time) {
          setAttendanceStatus("clocked_in");
          setTodayAttendance(sampleAttendance);
        } else if (
          sampleAttendance.arrival_time &&
          sampleAttendance.departure_time
        ) {
          setAttendanceStatus("completed");
          setTodayAttendance(sampleAttendance);
        } else {
          setAttendanceStatus("not_started");
        }
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setAttendanceStatus("not_started");
      }
    };

    fetchTodayAttendance();
  }, []);

  const handleClockIn = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const clockInData = {
        arrival_time: currentTime.toTimeString().split(" ")[0],
        date: currentTime.toISOString().split("T")[0],
        activity: "Office work",
      };

      console.log("Clock in:", clockInData);

      setTodayAttendance({
        ...clockInData,
        departure_time: null,
        status: "present",
      });
      setAttendanceStatus("clocked_in");
    } catch (error) {
      console.error("Clock in failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const clockOutData = {
        departure_time: currentTime.toTimeString().split(" ")[0],
      };

      console.log("Clock out:", clockOutData);

      setTodayAttendance((prev) => ({
        ...prev,
        ...clockOutData,
      }));
      setAttendanceStatus("completed");
    } catch (error) {
      console.error("Clock out failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingHours = () => {
    if (!todayAttendance?.arrival_time) return "0h 0m";

    const arrival = new Date(`2000-01-01T${todayAttendance.arrival_time}`);
    const departure = todayAttendance.departure_time
      ? new Date(`2000-01-01T${todayAttendance.departure_time}`)
      : currentTime;

    const diffMs = departure - arrival;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const getWorkingHoursProgress = () => {
    if (!todayAttendance?.arrival_time) return 0;

    const arrival = new Date(`2000-01-01T${todayAttendance.arrival_time}`);
    const now = new Date(
      `2000-01-01T${currentTime.toTimeString().split(" ")[0]}`
    );
    const diffMs = now - arrival;
    const hours = diffMs / (1000 * 60 * 60);

    return Math.min((hours / 8) * 100, 100); // 8 hours = 100%
  };

  const formatTime = (time) => {
    return time?.slice(0, 5) || "--:--"; // HH:MM format
  };

  const getUserDisplayName = () => {
    const firstName = user?.first_name || "";
    const surname = user?.sur_name || "";
    return firstName && surname
      ? `${firstName} ${surname}`
      : user?.email || "User";
  };

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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Attendance
        </Typography>
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
                        Office Location
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

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
              {attendanceStatus === "clocked_in" && (
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
                  />
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
                      32h
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
                      4/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Days Present
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
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
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ClockInOut;
