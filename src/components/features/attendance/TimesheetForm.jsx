import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Save as SaveIcon,
  Send as SendIcon,
  AccessTime as TimeIcon,
  Assignment as TaskIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { ROUTES } from "../../../constants";
import useNotification from "../../../hooks/common/useNotification";
import { LoadingSpinner } from "../../../components/common/Loading";
import attendanceAPI from "../../../services/api/attendance.api";
import timesheetAPI from "../../../services/api/timesheet.api";

const TimesheetForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector(selectUser);
  const { showSuccess, showError, showWarning } = useNotification();

  // Get parameters from URL
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");
  const timesheetIdParam = searchParams.get("timesheetId");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (monthParam && yearParam) {
      return new Date(parseInt(yearParam), parseInt(monthParam) - 1, 1);
    }
    return new Date();
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [timesheetData, setTimesheetData] = useState({});
  const [existingTimesheet, setExistingTimesheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitType, setSubmitType] = useState("save");
  const [timesheetStatus, setTimesheetStatus] = useState("draft");

  useEffect(() => {
    loadTimesheetData();
  }, [selectedMonth]);

  useEffect(() => {
    if (timesheetIdParam) {
      loadExistingTimesheet();
    }
  }, [timesheetIdParam]);

  const calculateWorkingHours = (arrivalTime, departureTime) => {
    if (!arrivalTime || !departureTime) return 0;

    try {
      // Convert time strings to Date objects for calculation
      const arrival = new Date(`2000-01-01T${arrivalTime}`);
      const departure = new Date(`2000-01-01T${departureTime}`);

      // Calculate difference in hours
      const diffMs = departure - arrival;
      const diffHours = diffMs / (1000 * 60 * 60);

      return Math.max(0, diffHours); // Ensure non-negative
    } catch (error) {
      console.error("Error calculating working hours:", error);
      return 0;
    }
  };

  const loadTimesheetData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([fetchMonthlyAttendance(), fetchExistingTimesheet()]);
    } catch (error) {
      console.error("Failed to load timesheet data:", error);
      showError("Failed to load timesheet data");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchMonthlyAttendance = async () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;

      const response = await attendanceAPI.getMyAttendance({
        year: year,
        month: month,
      });

      if (response.success) {
        const attendanceRecords = response.data || [];
        setAttendanceData(attendanceRecords);

        // Initialize timesheet data structure with calculated working hours
        const initialTimesheet = {};
        attendanceRecords.forEach((record) => {
          const workingHours = calculateWorkingHours(
            record.arrival_time,
            record.departure_time
          );

          initialTimesheet[record.date] = {
            activity: record.activity || "",
            description: record.description || "",
            attendance_id: record.id,
            arrival_time: record.arrival_time,
            departure_time: record.departure_time,
            working_hours: workingHours.toFixed(2),
            status: record.status,
            scheduler_status: record.scheduler_status || "working day",
          };
        });
        setTimesheetData((prev) => ({ ...prev, ...initialTimesheet }));
      } else {
        throw new Error(response.message || "Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
      showError(error.userMessage || "Failed to fetch attendance data");
      setAttendanceData([]);
    }
  };

  const fetchExistingTimesheet = async () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;

      const response = await timesheetAPI.getTimesheet({
        year: year,
        month: month,
        user_id: user.id,
      });

      if (response.success && response.data) {
        const timesheet = response.data;
        setExistingTimesheet(timesheet);
        setTimesheetStatus(timesheet.status || "draft");

        // Populate timesheet data from existing timesheet entries
        if (timesheet.entries) {
          const timesheetEntries = {};
          timesheet.entries.forEach((entry) => {
            timesheetEntries[entry.date] = {
              activity: entry.activity || "",
              description: entry.description || "",
              attendance_id: entry.attendance_id,
              arrival_time: entry.arrival_time,
              departure_time: entry.departure_time,
              working_hours: entry.working_hours || 0,
              status: entry.status,
              scheduler_status: entry.scheduler_status,
              id: entry.id,
            };
          });
          setTimesheetData(timesheetEntries);
        }
      } else {
        // No existing timesheet found
        setExistingTimesheet(null);
        setTimesheetStatus("draft");
      }
    } catch (error) {
      console.error("Failed to fetch existing timesheet:", error);
      // Don't show error for missing timesheet - it's normal for new timesheets
    }
  };

  const loadExistingTimesheet = async () => {
    try {
      const response = await timesheetAPI.getTimesheetById(timesheetIdParam);

      if (response.success) {
        const timesheet = response.data;
        setExistingTimesheet(timesheet);
        setTimesheetStatus(timesheet.status);
        setSelectedMonth(new Date(timesheet.year, timesheet.month - 1, 1));

        // Load timesheet entries
        if (timesheet.entries) {
          const timesheetEntries = {};
          timesheet.entries.forEach((entry) => {
            timesheetEntries[entry.date] = {
              activity: entry.activity || "",
              description: entry.description || "",
              attendance_id: entry.attendance_id,
              arrival_time: entry.arrival_time,
              departure_time: entry.departure_time,
              working_hours: entry.working_hours || 0,
              status: entry.status,
              scheduler_status: entry.scheduler_status,
              id: entry.id,
            };
          });
          setTimesheetData(timesheetEntries);
        }
      }
    } catch (error) {
      console.error("Failed to load existing timesheet:", error);
      showError("Failed to load timesheet");
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

  const validateTimesheet = () => {
    const errors = [];
    const incompleteEntries = [];

    attendanceData.forEach((record) => {
      const entry = timesheetData[record.date];
      if (!entry?.activity?.trim()) {
        incompleteEntries.push(`${record.date} - Missing activity`);
      }
      if (!entry?.description?.trim()) {
        incompleteEntries.push(`${record.date} - Missing description`);
      }
    });

    if (incompleteEntries.length > 0) {
      errors.push("Please complete all required fields:");
      errors.push(...incompleteEntries);
    }

    return errors;
  };

  const handleSubmit = async (type) => {
    setLoading(true);
    setSubmitType(type);

    try {
      // Validate timesheet before submission
      if (type === "submit") {
        const validationErrors = validateTimesheet();
        if (validationErrors.length > 0) {
          showWarning("Please complete all required fields before submitting");
          return;
        }
      }

      const submissionData = {
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
        user_id: user.id,
        status: type === "save" ? "draft" : "submitted",
        timesheet_entries: attendanceData
          .map((record) => ({
            date: record.date,
            attendance_id: record.id,
            arrival_time: timesheetData[record.date]?.arrival_time,
            departure_time: timesheetData[record.date]?.departure_time,
            working_hours: parseFloat(
              timesheetData[record.date]?.working_hours || 0
            ),
            activity: timesheetData[record.date]?.activity || "",
            description: timesheetData[record.date]?.description || "",
            status: timesheetData[record.date]?.status || record.status,
            scheduler_status:
              timesheetData[record.date]?.scheduler_status || "working day",
          }))
          .filter((entry) => entry.activity.trim() || entry.description.trim()), // Only include entries with content
      };

      let response;
      if (existingTimesheet?.id) {
        // Update existing timesheet
        response = await timesheetAPI.updateTimesheet(
          existingTimesheet.id,
          submissionData
        );
      } else {
        // Create new timesheet
        response = await timesheetAPI.createTimesheet(submissionData);
      }

      if (response.success) {
        if (type === "submit") {
          setTimesheetStatus("submitted");
          showSuccess(
            "Timesheet submitted successfully! It will be reviewed by your supervisor."
          );
          navigate(ROUTES.ATTENDANCE);
        } else {
          setTimesheetStatus("draft");
          setExistingTimesheet(response.data);
          showSuccess("Timesheet saved as draft.");
        }
      } else {
        throw new Error(response.message || "Failed to save timesheet");
      }
    } catch (error) {
      console.error("Failed to submit timesheet:", error);
      showError(
        error.userMessage || "Failed to submit timesheet. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadTimesheetData();
    showSuccess("Timesheet data refreshed");
  };

  const calculateTotalHours = () => {
    return attendanceData
      .reduce((total, record) => {
        const entry = timesheetData[record.date];
        return total + (parseFloat(entry?.working_hours) || 0);
      }, 0)
      .toFixed(2);
  };

  const calculateCompletionPercentage = () => {
    if (attendanceData.length === 0) return 0;

    const completedEntries = attendanceData.filter((record) => {
      const entry = timesheetData[record.date];
      return entry?.activity?.trim() && entry?.description?.trim();
    }).length;

    return Math.round((completedEntries / attendanceData.length) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "draft":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return <WarningIcon />;
      case "approved":
        return <CheckIcon />;
      case "rejected":
        return <ErrorIcon />;
      case "draft":
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const isTimesheetLocked =
    timesheetStatus === "submitted" ||
    timesheetStatus === "approved" ||
    timesheetStatus === "processing";

  const canEdit = !isTimesheetLocked && user?.id;

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Refresh timesheet data">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Chip
              label={`Status: ${timesheetStatus.charAt(0).toUpperCase() + timesheetStatus.slice(1)}`}
              color={getStatusColor(timesheetStatus)}
              size="large"
              icon={getStatusIcon(timesheetStatus)}
            />
          </Box>
        </Box>

        {/* Month Selection and Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
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

              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TimeIcon color="primary" />
                  <Typography variant="h6">
                    Total Hours: {calculateTotalHours()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TaskIcon color="success" />
                  <Typography variant="body1">
                    Working Days: {attendanceData.length}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckIcon
                    color={
                      calculateCompletionPercentage() === 100
                        ? "success"
                        : "warning"
                    }
                  />
                  <Typography variant="body1">
                    Completed: {calculateCompletionPercentage()}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {existingTimesheet && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary">
                  Last updated:{" "}
                  {existingTimesheet.updated_at
                    ? format(
                        new Date(existingTimesheet.updated_at),
                        "dd/MM/yyyy HH:mm"
                      )
                    : "Never"}
                  {existingTimesheet.submitted_at && (
                    <>
                      {" "}
                      | Submitted:{" "}
                      {format(
                        new Date(existingTimesheet.submitted_at),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Status Alerts */}
        {isTimesheetLocked && (
          <Alert
            severity={timesheetStatus === "approved" ? "success" : "info"}
            sx={{ mb: 3 }}
            icon={getStatusIcon(timesheetStatus)}
          >
            {timesheetStatus === "submitted" && (
              <>
                This timesheet has been submitted and is awaiting supervisor
                approval. You cannot make changes at this time.
              </>
            )}
            {timesheetStatus === "approved" && (
              <>
                This timesheet has been approved and sent to payroll processing.
                No changes are allowed.
              </>
            )}
            {timesheetStatus === "rejected" && (
              <>
                This timesheet was rejected. Please check supervisor comments
                and resubmit after making necessary corrections.
              </>
            )}
          </Alert>
        )}

        {attendanceData.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No attendance data found for the selected month. Please ensure you
            have clocked in/out for working days.
          </Alert>
        )}

        {/* Timesheet Table */}
        {attendanceData.length > 0 && (
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
                        <strong>Activity/Task *</strong>
                      </TableCell>
                      <TableCell width="300">
                        <strong>Description *</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Status</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.map((record) => {
                      const entry = timesheetData[record.date] || {};
                      const isIncomplete =
                        !entry.activity?.trim() || !entry.description?.trim();

                      return (
                        <TableRow
                          key={record.id}
                          sx={{
                            backgroundColor: isIncomplete
                              ? "warning.light"
                              : "inherit",
                            "&:hover": { backgroundColor: "action.hover" },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {format(new Date(record.date), "dd/MM/yyyy")}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(record.date), "EEEE")}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                entry.arrival_time?.slice(0, 5) ||
                                record.arrival_time?.slice(0, 5) ||
                                "--:--"
                              }
                              size="small"
                              color={
                                entry.arrival_time || record.arrival_time
                                  ? "success"
                                  : "default"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                entry.departure_time?.slice(0, 5) ||
                                record.departure_time?.slice(0, 5) ||
                                "--:--"
                              }
                              size="small"
                              color={
                                entry.departure_time || record.departure_time
                                  ? "error"
                                  : "default"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "medium" }}
                            >
                              {entry.working_hours || "0.00"}h
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="e.g., Project work, Meeting, Research"
                              value={entry.activity || ""}
                              onChange={(e) =>
                                handleActivityChange(
                                  record.date,
                                  "activity",
                                  e.target.value
                                )
                              }
                              disabled={!canEdit}
                              required
                              error={
                                !entry.activity?.trim() &&
                                timesheetStatus === "draft"
                              }
                              inputProps={{ maxLength: 100 }}
                              helperText={
                                !entry.activity?.trim() &&
                                timesheetStatus === "draft"
                                  ? "Required"
                                  : `${(entry.activity || "").length}/100`
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              rows={2}
                              placeholder="Describe what you accomplished..."
                              value={entry.description || ""}
                              onChange={(e) =>
                                handleActivityChange(
                                  record.date,
                                  "description",
                                  e.target.value
                                )
                              }
                              disabled={!canEdit}
                              required
                              error={
                                !entry.description?.trim() &&
                                timesheetStatus === "draft"
                              }
                              inputProps={{ maxLength: 1000 }}
                              helperText={
                                !entry.description?.trim() &&
                                timesheetStatus === "draft"
                                  ? "Required"
                                  : `${(entry.description || "").length}/1000`
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={entry.status || record.status || "Unknown"}
                              size="small"
                              color={
                                (entry.status || record.status) === "present"
                                  ? "success"
                                  : "default"
                              }
                              variant="filled"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {canEdit && attendanceData.length > 0 && (
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
                disabled={loading}
              >
                Save Draft
              </LoadingButton>

              <LoadingButton
                variant="contained"
                startIcon={<SendIcon />}
                loading={loading && submitType === "submit"}
                onClick={() => handleSubmit("submit")}
                disabled={
                  loading ||
                  attendanceData.some((record) => {
                    const entry = timesheetData[record.date];
                    return (
                      !entry?.activity?.trim() || !entry?.description?.trim()
                    );
                  })
                }
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
            <br />• Fill in your main activity/task for each working day
            (required)
            <br />• Provide a detailed description of what you accomplished
            (required)
            <br />• You can save as draft and return later to complete
            <br />• All fields must be completed before submission
            <br />• Once submitted, the timesheet will be locked until
            supervisor review
            <br />• Approved timesheets are automatically sent to payroll
            processing
            <br />• You can only edit timesheets in "Draft" status
          </Typography>
        </Alert>

        {/* Additional Information */}
        {timesheetStatus === "rejected" &&
          existingTimesheet?.rejection_reason && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Rejection Reason:</strong>
                <br />
                {existingTimesheet.rejection_reason}
              </Typography>
            </Alert>
          )}
      </Box>
    </LocalizationProvider>
  );
};

export default TimesheetForm;
