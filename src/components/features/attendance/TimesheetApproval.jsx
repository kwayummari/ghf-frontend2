import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";

const TimesheetApproval = () => {
  const user = useSelector(selectUser);
  const [pendingTimesheets, setPendingTimesheets] = useState([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // 'approve' or 'reject'
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingTimesheets();
  }, []);

  const fetchPendingTimesheets = async () => {
    try {
      // Simulate API call to get pending timesheets for supervisor approval
      const sampleTimesheets = [
        {
          id: 1,
          employee: {
            id: 2,
            name: "John Doe",
            email: "john.doe@ghf.org",
            department: "IT Department",
          },
          month: 1,
          year: 2024,
          total_hours: 168.5,
          working_days: 21,
          submitted_date: "2024-01-25T10:30:00",
          status: "submitted",
          entries: [
            {
              date: "2024-01-15",
              day: "Monday",
              arrival_time: "08:15:00",
              departure_time: "17:30:00",
              working_hours: "8.25",
              activity: "Software Development",
              description:
                "Worked on user authentication module, implemented JWT token validation and refresh mechanism.",
            },
            {
              date: "2024-01-16",
              day: "Tuesday",
              arrival_time: "08:10:00",
              departure_time: "17:25:00",
              working_hours: "8.25",
              activity: "Code Review & Testing",
              description:
                "Reviewed pull requests from team members, conducted unit testing for login functionality.",
            },
            {
              date: "2024-01-17",
              day: "Wednesday",
              arrival_time: "08:20:00",
              departure_time: "17:35:00",
              working_hours: "8.25",
              activity: "Database Design",
              description:
                "Designed database schema for employee management system, created migration scripts.",
            },
          ],
        },
        {
          id: 2,
          employee: {
            id: 3,
            name: "Jane Smith",
            email: "jane.smith@ghf.org",
            department: "IT Department",
          },
          month: 1,
          year: 2024,
          total_hours: 164.0,
          working_days: 20,
          submitted_date: "2024-01-24T14:15:00",
          status: "submitted",
          entries: [
            {
              date: "2024-01-15",
              day: "Monday",
              arrival_time: "08:30:00",
              departure_time: "17:30:00",
              working_hours: "8.00",
              activity: "Frontend Development",
              description:
                "Developed React components for employee registration form with validation.",
            },
            {
              date: "2024-01-16",
              day: "Tuesday",
              arrival_time: "08:25:00",
              departure_time: "17:45:00",
              working_hours: "8.33",
              activity: "UI/UX Implementation",
              description:
                "Implemented Material-UI theme, created responsive layout for dashboard.",
            },
          ],
        },
      ];

      setPendingTimesheets(sampleTimesheets);
    } catch (error) {
      console.error("Failed to fetch pending timesheets:", error);
    }
  };

  const handleApproveReject = (timesheet, action) => {
    setSelectedTimesheet(timesheet);
    setActionType(action);
    setDialogOpen(true);
    setComment("");
  };

  const handleSubmitAction = async () => {
    setLoading(true);

    try {
      const actionData = {
        timesheet_id: selectedTimesheet.id,
        action: actionType,
        comment: comment,
        approved_by: user.id,
        approved_date: new Date().toISOString(),
      };

      console.log("Timesheet action:", actionData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update local state
      setPendingTimesheets((prev) =>
        prev.filter((t) => t.id !== selectedTimesheet.id)
      );

      // If approved, this timesheet data will be sent to payroll automatically
      if (actionType === "approve") {
        alert(
          `Timesheet approved! ${selectedTimesheet.employee.name}'s timesheet has been sent to payroll for processing.`
        );
      } else {
        alert(
          `Timesheet rejected and returned to ${selectedTimesheet.employee.name} for revision.`
        );
      }

      setDialogOpen(false);
      setSelectedTimesheet(null);
    } catch (error) {
      console.error("Failed to process timesheet action:", error);
      alert("Failed to process action. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB");
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Timesheet Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve employee timesheets for payroll processing
        </Typography>
      </Box>

      {/* Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <TimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {pendingTimesheets.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <ApproveIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    15
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    1,280
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours to Process
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Timesheets */}
      {pendingTimesheets.length === 0 ? (
        <Alert severity="info">
          No pending timesheets for approval. All timesheets have been
          processed.
        </Alert>
      ) : (
        <Box>
          {pendingTimesheets.map((timesheet) => (
            <Accordion key={timesheet.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {getInitials(timesheet.employee.name)}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                      {timesheet.employee.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {timesheet.employee.department} • Submitted:{" "}
                      {formatDateTime(timesheet.submitted_date)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`${timesheet.total_hours}h`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`${timesheet.working_days} days`}
                      color="info"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "medium", mb: 2 }}
                  >
                    Timesheet Details -{" "}
                    {new Date(
                      timesheet.year,
                      timesheet.month - 1
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>

                  <TableContainer
                    component={Paper}
                    sx={{ maxHeight: 300, mb: 3 }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Date</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Day</strong>
                          </TableCell>
                          <TableCell>
                            <strong>In</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Out</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Hours</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Activity</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Description</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {timesheet.entries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(entry.date)}</TableCell>
                            <TableCell>{entry.day}</TableCell>
                            <TableCell>
                              <Chip
                                label={entry.arrival_time.slice(0, 5)}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={entry.departure_time.slice(0, 5)}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{entry.working_hours}h</TableCell>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Divider sx={{ mb: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        Total Working Hours:{" "}
                        <strong>{timesheet.total_hours}h</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Working Days: {timesheet.working_days}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleApproveReject(timesheet, "reject")}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() =>
                          handleApproveReject(timesheet, "approve")
                        }
                      >
                        Approve
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Approval/Rejection Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === "approve" ? "Approve Timesheet" : "Reject Timesheet"}
        </DialogTitle>
        <DialogContent>
          {selectedTimesheet && (
            <Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {actionType === "approve"
                  ? `Approve timesheet for ${selectedTimesheet.employee.name}? This will send the timesheet data to payroll for processing.`
                  : `Reject timesheet for ${selectedTimesheet.employee.name}? The employee will need to revise and resubmit.`}
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                label={
                  actionType === "approve"
                    ? "Approval Notes (Optional)"
                    : "Rejection Reason (Required)"
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Any additional notes..."
                    : "Please specify what needs to be corrected..."
                }
                required={actionType === "reject"}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color={actionType === "approve" ? "success" : "error"}
            loading={loading}
            disabled={actionType === "reject" && !comment.trim()}
            onClick={handleSubmitAction}
          >
            {actionType === "approve"
              ? "Approve & Send to Payroll"
              : "Reject Timesheet"}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimesheetApproval;
