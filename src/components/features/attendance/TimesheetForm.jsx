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

const TimesheetForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector(selectUser);
  const { showSuccess, showError, showWarning } = useNotification();

  // Get parameters from URL
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (monthParam && yearParam) {
      return new Date(parseInt(yearParam), parseInt(monthParam) - 1, 1);
    }
    return new Date();
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [timesheetData, setTimesheetData] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitType, setSubmitType] = useState("save");
  const [timesheetStatus, setTimesheetStatus] = useState("draft");

  useEffect(() => {
    loadTimesheetData();
  }, [selectedMonth]);

  const calculateWorkingHours = (arrivalTime, departureTime) => {
    if (!arrivalTime || !departureTime) return 0;

    try {
      const arrival = new Date(arrivalTime);
      const departure = new Date(departureTime);
      const diffMs = departure - arrival;
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, diffHours);
    } catch (error) {
      console.error("Error calculating working hours:", error);
      return 0;
    }
  };

  const loadTimesheetData = async () => {
    try {
      setInitialLoading(true);
      await fetchMonthlyAttendance();
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

        // Determine overall timesheet status based on attendance approval status
        let overallStatus = "draft";
        if (attendanceRecords.length > 0) {
          const allApproved = attendanceRecords.every(
            (record) => record.approval_status === "approved"
          );
          const anySubmitted = attendanceRecords.some(
            (record) => record.approval_status === "submitted"
          );
          const anyRejected = attendanceRecords.some(
            (record) => record.approval_status === "rejected"
          );

          if (allApproved) {
            overallStatus = "approved";
          } else if (anyRejected) {
            overallStatus = "rejected";
          } else if (anySubmitted) {
            overallStatus = "submitted";
          }
        }
        setTimesheetStatus(overallStatus);

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
            arrival_time: record.arrival_time
              ? format(new Date(record.arrival_time), "HH:mm")
              : null,
            departure_time: record.departure_time
              ? format(new Date(record.departure_time), "HH:mm")
              : null,
            working_hours: workingHours.toFixed(2),
            status: record.status,
            scheduler_status: record.scheduler_status || "working day",
            approval_status: record.approval_status || "draft",
            submitted_at: record.submitted_at,
            approved_at: record.approved_at,
            rejected_at: record.rejected_at,
            rejection_reason: record.rejection_reason,
            supervisor_comments: record.supervisor_comments,
          };
        });
        setTimesheetData(initialTimesheet);
      } else {
        throw new Error(response.message || "Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
      showError(error.userMessage || "Failed to fetch attendance data");
      setAttendanceData([]);
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

  const updateAttendanceRecords = async () => {
    // Update individual attendance records with activity and description
    const updatePromises = attendanceData.map(async (record) => {
      const entry = timesheetData[record.date];
      if (
        entry &&
        (entry.activity !== record.activity ||
          entry.description !== record.description)
      ) {
        try {
          await attendanceAPI.updateAttendance(record.id, {
            activity: entry.activity || "",
            description: entry.description || "",
          });
        } catch (error) {
          console.error(
            `Failed to update attendance for ${record.date}:`,
            error
          );
          throw error;
        }
      }
    });

    await Promise.all(updatePromises);
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

      // First, update all attendance records with activity and description
      await updateAttendanceRecords();

      if (type === "submit") {
        // Submit monthly timesheet for approval
        const response = await attendanceAPI.submitMonthlyTimesheet({
          month: selectedMonth.getMonth() + 1,
          year: selectedMonth.getFullYear(),
          user_id: user.id,
        });

        if (response.success) {
          setTimesheetStatus("submitted");
          showSuccess(
            "Timesheet submitted successfully! It will be reviewed by your supervisor."
          );
          navigate(ROUTES.ATTENDANCE);
        } else {
          throw new Error(response.message || "Failed to submit timesheet");
        }
      } else {
        // Just save as draft
        setTimesheetStatus("draft");
        showSuccess("Timesheet saved as draft.");
        // Refresh data to show updated status
        await fetchMonthlyAttendance();
      }
    } catch (error) {
      console.error("Failed to submit timesheet:", error);
      showError(
        error.userMessage ||
          error.message ||
          "Failed to submit timesheet. Please try again."
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

  // Get rejection reason from any rejected record
  // Get rejection reason from any rejected record
  const rejectionInfo = attendanceData.find((record) => {
    const entry = timesheetData[record.date];
    return entry?.approval_status === "rejected" && entry?.rejection_reason;
  });

  console.log("Rejection Info:", attendanceData);

  const rejectionReason = rejectionInfo
    ? timesheetData[rejectionInfo.date]?.rejection_reason
    : null;
  const supervisorComments = rejectionInfo
    ? timesheetData[rejectionInfo.date]?.supervisor_comments
    : null;

  const submittedAt =
    attendanceData.find((record) => timesheetData[record.date]?.submitted_at)
      ?.submitted_at ||
    Object.values(timesheetData).find((entry) => entry.submitted_at)
      ?.submitted_at;

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

            {submittedAt && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary">
                  Submitted: {format(new Date(submittedAt), "dd/MM/yyyy HH:mm")}
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
                This timesheet was rejected.{" "}
                {rejectionReason && `Reason: ${rejectionReason}.`} Please check
                supervisor comments below and resubmit after making necessary
                corrections.
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
                              label={entry.arrival_time || "--:--"}
                              size="small"
                              color={entry.arrival_time ? "success" : "default"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={entry.departure_time || "--:--"}
                              size="small"
                              color={entry.departure_time ? "error" : "default"}
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
                  new Date().getDate() < 25 ||
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
        {/* Additional Information */}
        {timesheetStatus === "rejected" && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Timesheet Rejected</strong>
              <br />
              {rejectionReason ? (
                <>
                  <strong>Reason:</strong> {rejectionReason}
                  <br />
                </>
              ) : (
                "Your timesheet was rejected. Please contact your supervisor for details."
              )}
              {supervisorComments && (
                <>
                  <strong>Supervisor Comments:</strong> {supervisorComments}
                </>
              )}
              <br />
              <em>Please make the necessary corrections and resubmit.</em>
            </Typography>
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default TimesheetForm;
