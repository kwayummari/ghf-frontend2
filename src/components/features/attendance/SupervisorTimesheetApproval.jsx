import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Assignment as TaskIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import useNotification from "../../../hooks/common/useNotification";
import { LoadingSpinner } from "../../../components/common/Loading";
import attendanceAPI from "../../../services/api/attendance.api";

const SupervisorTimesheetApproval = () => {
  const user = useSelector(selectUser);
  const { showSuccess, showError } = useNotification();

  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [expandedTimesheets, setExpandedTimesheets] = useState({});
  const [rejectionReason, setRejectionReason] = useState("");
  const [supervisorComments, setSupervisorComments] = useState("");
  const [filters, setFilters] = useState({
    status: "submitted",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department_id: "",
  });

  useEffect(() => {
    loadTeamTimesheets();
  }, [filters]);

  const loadTeamTimesheets = async () => {
    try {
      setLoading(true);
      const response =
        await attendanceAPI.getTeamTimesheetsForApproval(filters);

      if (response.success) {
        setTimesheets(response.data || []);
      } else {
        throw new Error(response.message || "Failed to load team timesheets");
      }
    } catch (error) {
      console.error("Failed to load team timesheets:", error);
      showError("Failed to load team timesheets");
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedTimesheet) return;

    try {
      setActionLoading(true);
      const response = await attendanceAPI.approveMonthlyTimesheet({
        user_id: selectedTimesheet.user.id,
        month: selectedTimesheet.month,
        year: selectedTimesheet.year,
        supervisor_comments: supervisorComments,
      });

      if (response.success) {
        showSuccess(
          `Timesheet approved for ${selectedTimesheet.user.first_name} ${selectedTimesheet.user.sur_name}. Ready for payroll processing.`
        );
        setApprovalDialog(false);
        setSelectedTimesheet(null);
        setSupervisorComments("");
        await loadTeamTimesheets();
      } else {
        throw new Error(response.message || "Failed to approve timesheet");
      }
    } catch (error) {
      console.error("Failed to approve timesheet:", error);
      showError("Failed to approve timesheet");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTimesheet || !rejectionReason.trim()) {
      showError("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(true);
      const response = await attendanceAPI.rejectMonthlyTimesheet({
        user_id: selectedTimesheet.user.id,
        month: selectedTimesheet.month,
        year: selectedTimesheet.year,
        rejection_reason: rejectionReason,
        supervisor_comments: supervisorComments,
      });

      if (response.success) {
        showSuccess(
          `Timesheet rejected for ${selectedTimesheet.user.first_name} ${selectedTimesheet.user.sur_name}. Employee can resubmit after corrections.`
        );
        setRejectionDialog(false);
        setSelectedTimesheet(null);
        setRejectionReason("");
        setSupervisorComments("");
        await loadTeamTimesheets();
      } else {
        throw new Error(response.message || "Failed to reject timesheet");
      }
    } catch (error) {
      console.error("Failed to reject timesheet:", error);
      showError("Failed to reject timesheet");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleExpanded = (timesheetKey) => {
    setExpandedTimesheets((prev) => ({
      ...prev,
      [timesheetKey]: !prev[timesheetKey],
    }));
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

  const formatEmployeeName = (user) => {
    return `${user.first_name} ${user.middle_name ? user.middle_name + " " : ""}${user.sur_name}`;
  };

  if (loading) {
    return <LoadingSpinner />;
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
            Timesheet Approvals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve monthly timesheets from your team
          </Typography>
        </Box>

        <Tooltip title="Refresh data">
          <IconButton onClick={loadTeamTimesheets} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={filters.month}
                  label="Month"
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, month: e.target.value }))
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {format(new Date(2024, i), "MMMM")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={filters.year}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    year: parseInt(e.target.value),
                  }))
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Timesheets List */}
      {timesheets.length === 0 ? (
        <Alert severity="info">
          No timesheets found for the selected filters.
        </Alert>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="40"></TableCell>
                    <TableCell>
                      <strong>Employee</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Department</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Period</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Hours</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Working Days</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Submitted</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timesheets.map((timesheet, index) => {
                    const timesheetKey = `${timesheet.user.id}-${timesheet.year}-${timesheet.month}`;
                    const isExpanded = expandedTimesheets[timesheetKey];

                    return (
                      <React.Fragment key={timesheetKey}>
                        <TableRow>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleExpanded(timesheetKey)}
                            >
                              {isExpanded ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <PersonIcon color="primary" />
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {formatEmployeeName(timesheet.user)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {timesheet.user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {timesheet.user.basicEmployeeData?.department
                                ?.department_name || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(
                                new Date(timesheet.year, timesheet.month - 1),
                                "MMMM yyyy"
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <TimeIcon color="primary" />
                              <Typography variant="body2" fontWeight="medium">
                                {timesheet.summary.total_hours}h
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <TaskIcon color="success" />
                              <Typography variant="body2">
                                {timesheet.summary.present_days}/
                                {timesheet.summary.total_entries}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={timesheet.summary.status}
                              color={getStatusColor(timesheet.summary.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {timesheet.summary.submitted_at
                                ? format(
                                    new Date(timesheet.summary.submitted_at),
                                    "dd/MM/yyyy HH:mm"
                                  )
                                : "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedTimesheet(timesheet);
                                    setDetailsDialog(true);
                                  }}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              {timesheet.summary.status === "submitted" && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => {
                                        setSelectedTimesheet(timesheet);
                                        setApprovalDialog(true);
                                      }}
                                    >
                                      <ApproveIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => {
                                        setSelectedTimesheet(timesheet);
                                        setRejectionDialog(true);
                                      }}
                                    >
                                      <RejectIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Details */}
                        <TableRow>
                          <TableCell colSpan={9} sx={{ p: 0 }}>
                            <Collapse in={isExpanded}>
                              <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Daily Entries Summary:
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2">
                                      <strong>Total Entries:</strong>{" "}
                                      {timesheet.summary.total_entries}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2">
                                      <strong>Present Days:</strong>{" "}
                                      {timesheet.summary.present_days}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2">
                                      <strong>Total Hours:</strong>{" "}
                                      {timesheet.summary.total_hours}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialog}
        onClose={() => setApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Timesheet</DialogTitle>
        <DialogContent>
          {selectedTimesheet && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Approve timesheet for{" "}
                <strong>{formatEmployeeName(selectedTimesheet.user)}</strong>{" "}
                for{" "}
                <strong>
                  {format(
                    new Date(
                      selectedTimesheet.year,
                      selectedTimesheet.month - 1
                    ),
                    "MMMM yyyy"
                  )}
                </strong>
                ?
              </Typography>
              <TextField
                fullWidth
                label="Supervisor Comments (Optional)"
                multiline
                rows={3}
                value={supervisorComments}
                onChange={(e) => setSupervisorComments(e.target.value)}
                sx={{ mt: 2 }}
                placeholder="Add any comments for the employee..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleApprove}
            loading={actionLoading}
            variant="contained"
            color="success"
          >
            Approve
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectionDialog}
        onClose={() => setRejectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Timesheet</DialogTitle>
        <DialogContent>
          {selectedTimesheet && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Reject timesheet for{" "}
                <strong>{formatEmployeeName(selectedTimesheet.user)}</strong>{" "}
                for{" "}
                <strong>
                  {format(
                    new Date(
                      selectedTimesheet.year,
                      selectedTimesheet.month - 1
                    ),
                    "MMMM yyyy"
                  )}
                </strong>
                ?
              </Typography>
              <TextField
                fullWidth
                label="Rejection Reason *"
                multiline
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                sx={{ mt: 2 }}
                required
                error={!rejectionReason.trim()}
                helperText={
                  !rejectionReason.trim() ? "Rejection reason is required" : ""
                }
                placeholder="Please specify why the timesheet is being rejected..."
              />
              <TextField
                fullWidth
                label="Additional Comments (Optional)"
                multiline
                rows={2}
                value={supervisorComments}
                onChange={(e) => setSupervisorComments(e.target.value)}
                sx={{ mt: 2 }}
                placeholder="Add any additional feedback..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleReject}
            loading={actionLoading}
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Reject
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Timesheet Details</DialogTitle>
        <DialogContent>
          {selectedTimesheet && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Employee:</strong>{" "}
                    {formatEmployeeName(selectedTimesheet.user)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Period:</strong>{" "}
                    {format(
                      new Date(
                        selectedTimesheet.year,
                        selectedTimesheet.month - 1
                      ),
                      "MMMM yyyy"
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Total Hours:</strong>{" "}
                    {selectedTimesheet.summary.total_hours}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Working Days:</strong>{" "}
                    {selectedTimesheet.summary.total_entries}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Daily Entries:
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Day</TableCell>
                      <TableCell>Hours</TableCell>
                      <TableCell>Activity</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTimesheet.entries?.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {format(new Date(entry.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(entry.date), "EEEE")}
                        </TableCell>
                        <TableCell>
                          {entry.working_hours ||
                            calculateWorkingHours(
                              entry.arrival_time,
                              entry.departure_time
                            ).toFixed(2)}
                          h
                        </TableCell>
                        <TableCell>{entry.activity}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {entry.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={entry.status} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupervisorTimesheetApproval;
