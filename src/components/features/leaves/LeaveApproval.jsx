import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Business as HRIcon,
  AdminPanelSettings as AdminIcon,
  Schedule as ScheduleIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../auth/AuthGuard";
import { ROUTES, LEAVE_STATUS, ROLES } from "../../../constants";

const LeaveApproval = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasRole, hasAnyRole } = useAuth();
  const [leaveApplication, setLeaveApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // 'approve' or 'reject'
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchLeaveApplication = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const sampleLeave = {
          id: parseInt(id),
          user: {
            id: 2,
            first_name: "John",
            sur_name: "Doe",
            email: "john.doe@ghf.org",
            department: "IT Department",
            position: "Software Developer",
          },
          type: {
            id: 1,
            name: "Annual Leave",
            max_days: 21,
          },
          starting_date: "2024-02-15",
          end_date: "2024-02-20",
          days: 6,
          approval_status: "pending",
          comment: "Family vacation to attend wedding ceremony",
          attachment_url: null,
          created_at: "2024-02-10T10:30:00Z",
          approval_history: [
            {
              id: 1,
              action: "submitted",
              comment: "Initial submission",
              actor: "John Doe",
              actor_role: "Employee",
              timestamp: "2024-02-10T10:30:00Z",
              status: "pending",
            },
          ],
          current_approver_role: "HR Manager", // Next approver role
          supervisor: {
            id: 3,
            name: "Jane Manager",
            role: "Department Head",
          },
        };

        setLeaveApplication(sampleLeave);
      } catch (error) {
        console.error("Failed to fetch leave application:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveApplication();
  }, [id]);

  const getApprovalSteps = () => {
    const steps = [
      {
        label: "Employee Submission",
        description: "Leave request submitted",
        role: "Employee",
        icon: <PersonIcon />,
        completed: true,
      },
      {
        label: "HR Manager Review",
        description: "HR review and initial approval",
        role: "HR Manager",
        icon: <HRIcon />,
        completed: false,
        active:
          leaveApplication?.approval_status === "pending" &&
          leaveApplication?.current_approver_role === "HR Manager",
      },
      {
        label: "CEO/Admin Approval",
        description: "Final approval by management",
        role: "Admin",
        icon: <AdminIcon />,
        completed: false,
        active: leaveApplication?.approval_status === "approved by hr",
      },
      {
        label: "Approved",
        description: "Leave request approved",
        role: "System",
        icon: <ApproveIcon />,
        completed: leaveApplication?.approval_status === "approved",
      },
    ];

    return steps;
  };

  const canUserApprove = () => {
    if (!leaveApplication) return false;

    const { approval_status, current_approver_role } = leaveApplication;

    // HR Manager can approve pending requests
    if (
      approval_status === "pending" &&
      current_approver_role === "HR Manager"
    ) {
      return hasRole(ROLES.HR_MANAGER);
    }

    // Admin/CEO can approve HR-approved requests
    if (approval_status === "approved by hr") {
      return hasRole(ROLES.ADMIN);
    }

    return false;
  };

  const getNextApprovalStatus = (action) => {
    if (action === "reject") return LEAVE_STATUS.REJECTED;

    const { approval_status } = leaveApplication;

    if (approval_status === "pending" && hasRole(ROLES.HR_MANAGER)) {
      return "approved by hr";
    }

    if (approval_status === "approved by hr" && hasRole(ROLES.ADMIN)) {
      return LEAVE_STATUS.APPROVED;
    }

    return approval_status;
  };

  const handleActionClick = (action) => {
    setActionType(action);
    setComment("");
    setDialogOpen(true);
  };

  const handleActionSubmit = async () => {
    setActionLoading(true);

    try {
      const newStatus = getNextApprovalStatus(actionType);
      const actionData = {
        leave_id: leaveApplication.id,
        action: actionType,
        comment,
        new_status: newStatus,
        approver_id: user.id,
        approver_role: hasRole(ROLES.ADMIN) ? "Admin" : "HR Manager",
      };

      console.log("Processing leave approval:", actionData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update the leave application status
      setLeaveApplication((prev) => ({
        ...prev,
        approval_status: newStatus,
        approval_history: [
          ...prev.approval_history,
          {
            id: prev.approval_history.length + 1,
            action: actionType,
            comment:
              comment ||
              `${actionType === "approve" ? "Approved" : "Rejected"} by ${user.first_name} ${user.sur_name}`,
            actor: `${user.first_name} ${user.sur_name}`,
            actor_role: hasRole(ROLES.ADMIN) ? "Admin" : "HR Manager",
            timestamp: new Date().toISOString(),
            status: newStatus,
          },
        ],
        current_approver_role: newStatus === "approved by hr" ? "Admin" : null,
      }));

      setDialogOpen(false);

      // Navigate back after successful action
      setTimeout(() => {
        navigate(ROUTES.LEAVE_APPROVALS);
      }, 2000);
    } catch (error) {
      console.error("Failed to process approval:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
      case "approved by hr":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Typography>Loading leave application...</Typography>
      </Box>
    );
  }

  if (!leaveApplication) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6">Leave application not found</Typography>
        <Button onClick={() => navigate(ROUTES.LEAVES)} sx={{ mt: 2 }}>
          Back to Leaves
        </Button>
      </Box>
    );
  }

  const steps = getApprovalSteps();

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
            Leave Application Review
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve/reject leave applications
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => navigate(ROUTES.LEAVES)}>
          Back to Leaves
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Leave Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {leaveApplication.user.first_name.charAt(0)}
                    {leaveApplication.user.sur_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {leaveApplication.user.first_name}{" "}
                      {leaveApplication.user.sur_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {leaveApplication.user.position} •{" "}
                      {leaveApplication.user.department}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={formatStatus(leaveApplication.approval_status)}
                  color={getStatusColor(leaveApplication.approval_status)}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Leave Type"
                        secondary={leaveApplication.type.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Start Date"
                        secondary={formatDate(leaveApplication.starting_date)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="End Date"
                        secondary={formatDate(leaveApplication.end_date)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Duration"
                        secondary={`${leaveApplication.days} days`}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Applied On"
                        secondary={formatDateTime(leaveApplication.created_at)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Supervisor"
                        secondary={
                          leaveApplication.supervisor?.name || "Not assigned"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Current Status"
                        secondary={formatStatus(
                          leaveApplication.approval_status
                        )}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              {leaveApplication.comment && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Employee Comment:
                  </Typography>
                  <Alert severity="info" icon={<CommentIcon />}>
                    {leaveApplication.comment}
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {canUserApprove() && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                  Approval Actions
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleActionClick("approve")}
                    size="large"
                  >
                    Approve
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleActionClick("reject")}
                    size="large"
                  >
                    Reject
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Approval Workflow */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Approval Workflow
              </Typography>

              <Stepper orientation="vertical">
                {steps.map((step, index) => (
                  <Step
                    key={index}
                    active={step.active}
                    completed={step.completed}
                  >
                    <StepLabel icon={step.icon}>
                      <Typography variant="subtitle2">{step.label}</Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Approval History */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Approval History
              </Typography>

              <Box>
                {leaveApplication.approval_history.map((entry, index) => (
                  <Paper
                    key={entry.id}
                    elevation={1}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderLeft: "4px solid",
                      borderLeftColor:
                        entry.action === "approved" ||
                        entry.action === "approve"
                          ? "success.main"
                          : entry.action === "rejected" ||
                              entry.action === "reject"
                            ? "error.main"
                            : "primary.main",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          {entry.actor}
                        </Typography>
                        <Chip
                          label={entry.actor_role}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(entry.timestamp)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {entry.comment}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approval/Rejection Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === "approve"
            ? "Approve Leave Request"
            : "Reject Leave Request"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {actionType === "approve"
              ? "Are you sure you want to approve this leave request?"
              : "Please provide a reason for rejecting this leave request."}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label={
              actionType === "approve"
                ? "Comment (Optional)"
                : "Rejection Reason"
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              actionType === "approve"
                ? "Add any additional comments..."
                : "Explain why this request is being rejected..."
            }
            required={actionType === "reject"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color={actionType === "approve" ? "success" : "error"}
            loading={actionLoading}
            onClick={handleActionSubmit}
            disabled={actionType === "reject" && !comment.trim()}
          >
            {actionType === "approve" ? "Approve" : "Reject"}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveApproval;
