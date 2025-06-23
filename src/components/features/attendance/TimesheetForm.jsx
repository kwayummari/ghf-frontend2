import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Save as SaveIcon,
  Send as SendIcon,
  AccessTime as TimeIcon,
  Assignment as TaskIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { ROUTES } from "../../../constants";

const TimesheetForm = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [timesheetData, setTimesheetData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitType, setSubmitType] = useState("save"); // 'save' or 'submit'
  const [timesheetStatus, setTimesheetStatus] = useState("draft");

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [selectedMonth]);

  const fetchMonthlyAttendance = async () => {
    try {
      // Simulate API call to get attendance data for the month
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();

      // Sample attendance data - replace with actual API call
      const sampleData = Array.from({ length: 20 }, (_, index) => {
        const date = new Date(year, month, index + 1);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isHoliday = false; // You can add holiday logic here

        if (isWeekend || isHoliday || date > new Date()) {
          return null;
        }

        return {
          id: index + 1,
          date: date.toISOString().split("T")[0],
          day: date.toLocaleDateString("en-US", { weekday: "long" }),
          arrival_time: "08:15:00",
          departure_time: index < 15 ? "17:30:00" : null, // Some days not clocked out yet
          working_hours: index < 15 ? "8.25" : null,
          activity: "", // Employee needs to fill this
          description: "", // Employee needs to fill this
          status: "present",
        };
      }).filter(Boolean);

      setAttendanceData(sampleData);

      // Initialize timesheet data if not exists
      const initialTimesheet = {};
      sampleData.forEach((record) => {
        if (!timesheetData[record.date]) {
          initialTimesheet[record.date] = {
            activity: record.activity || "",
            description: record.description || "",
          };
        }
      });
      setTimesheetData((prev) => ({ ...prev, ...initialTimesheet }));
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
    }
  };

  const handleActivityChange = (date, field, value) => {
    setTimesheetData((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (type) => {
    setLoading(true);
    setSubmitType(type);

    try {
      const submissionData = {
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
        user_id: user.id,
        timesheet_entries: attendanceData.map((record) => ({
          date: record.date,
          arrival_time: record.arrival_time,
          departure_time: record.departure_time,
          working_hours: record.working_hours,
          activity: timesheetData[record.date]?.activity || "",
          description: timesheetData[record.date]?.description || "",
          status: record.status,
        })),
        status: type === "save" ? "draft" : "submitted",
      };

      console.log("Submitting timesheet:", submissionData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (type === "submit") {
        setTimesheetStatus("submitted");
        alert(
          "Timesheet submitted successfully! It will be reviewed by your supervisor."
        );
        navigate(ROUTES.ATTENDANCE);
      } else {
        setTimesheetStatus("draft");
        alert("Timesheet saved as draft.");
      }
    } catch (error) {
      console.error("Failed to submit timesheet:", error);
      alert("Failed to submit timesheet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = () => {
    return attendanceData
      .reduce((total, record) => {
        return total + (parseFloat(record.working_hours) || 0);
      }, 0)
      .toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const isTimesheetLocked =
    timesheetStatus === "submitted" || timesheetStatus === "approved";

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
            Monthly Timesheet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in your activities and descriptions for each working day
          </Typography>
        </Box>

        <Chip
          label={`Status: ${timesheetStatus.charAt(0).toUpperCase() + timesheetStatus.slice(1)}`}
          color={getStatusColor(timesheetStatus)}
          size="large"
        />
      </Box>

      {/* Month Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Select Month"
                views={["year", "month"]}
                value={selectedMonth}
                onChange={(newValue) => setSelectedMonth(newValue)}
                disabled={isTimesheetLocked}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TimeIcon color="primary" />
                <Typography variant="h6">
                  Total Hours: {calculateTotalHours()}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Working Days: {attendanceData.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Timesheet locked notice */}
      {isTimesheetLocked && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This timesheet has been {timesheetStatus} and cannot be edited.
          {timesheetStatus === "submitted" &&
            " Please wait for supervisor approval."}
        </Alert>
      )}

      {/* Timesheet Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Day</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Clock In</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Clock Out</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Hours</strong>
                  </TableCell>
                  <TableCell width="200">
                    <strong>Activity/Task</strong>
                  </TableCell>
                  <TableCell width="300">
                    <strong>Description</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.day}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.arrival_time?.slice(0, 5) || "--:--"}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.departure_time?.slice(0, 5) || "--:--"}
                        size="small"
                        color={record.departure_time ? "error" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {record.working_hours || "0.00"}h
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g., Project work, Meeting, Research"
                        value={timesheetData[record.date]?.activity || ""}
                        onChange={(e) =>
                          handleActivityChange(
                            record.date,
                            "activity",
                            e.target.value
                          )
                        }
                        disabled={isTimesheetLocked}
                        inputProps={{ maxLength: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        placeholder="Describe what you accomplished..."
                        value={timesheetData[record.date]?.description || ""}
                        onChange={(e) =>
                          handleActivityChange(
                            record.date,
                            "description",
                            e.target.value
                          )
                        }
                        disabled={isTimesheetLocked}
                        inputProps={{ maxLength: 300 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isTimesheetLocked && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            onClick={() => navigate(ROUTES.ATTENDANCE)}
          >
            Cancel
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            <LoadingButton
              variant="outlined"
              startIcon={<SaveIcon />}
              loading={loading && submitType === "save"}
              onClick={() => handleSubmit("save")}
            >
              Save Draft
            </LoadingButton>

            <LoadingButton
              variant="contained"
              startIcon={<SendIcon />}
              loading={loading && submitType === "submit"}
              onClick={() => handleSubmit("submit")}
              disabled={attendanceData.some(
                (record) =>
                  !timesheetData[record.date]?.activity ||
                  !timesheetData[record.date]?.description
              )}
            >
              Submit for Approval
            </LoadingButton>
          </Box>
        </Box>
      )}

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Instructions:</strong>
          <br />• Fill in your main activity/task for each day
          <br />• Provide a detailed description of what you accomplished
          <br />• All fields must be completed before submission
          <br />• Once submitted, the timesheet will be locked until supervisor
          review
          <br />• Approved timesheets are automatically sent to payroll
          processing
        </Typography>
      </Alert>
    </Box>
  );
};

export default TimesheetForm;
