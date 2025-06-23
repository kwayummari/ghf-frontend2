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
  CircularProgress,
  Skeleton,
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
  SupervisorAccount as SupervisorIcon,
  GetApp as DownloadIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../auth/AuthGuard";
import { ROUTES, LEAVE_STATUS, ROLES } from "../../../constants";
import { leavesAPI } from "../../../services/api/leaves.api";
import { documentsAPI } from "../../../services/api/documents.api";
import useNotification from "../../../hooks/common/useNotification";

const LeaveApproval = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasRole, hasAnyRole } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();

  // State management
  const [leaveApplication, setLeaveApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // 'approve' or 'reject'
  const [comment, setComment] = useState("");
  const [downloadingDoc, setDownloadingDoc] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLeaveApplication();
    }
  }, [id]);

  const fetchLeaveApplication = async () => {
    try {
      setLoading(true);
      const response = await leavesAPI.getById(id);

      if (response && response.success) {
        setLeaveApplication(response.data);
      } else {
        throw new Error(
          response?.message || "Failed to fetch leave application"
        );
      }
    } catch (error) {
      console.error("Failed to fetch leave application:", error);
      showError("Failed to load leave application");
      navigate(ROUTES.LEAVES);
    } finally {
      setLoading(false);
    }
  };

  const getApprovalSteps = () => {
    if (!leaveApplication) return [];

    const steps = [
      {
        label: "Employee Submission",
        description: "Leave request submitted",
        role: "Employee",
        icon: <PersonIcon />,
        completed: true,
      },
      {
        label: "Supervisor Review",
        description: "Supervisor review and approval",
        role: "Supervisor",
        icon: <SupervisorIcon />,
        completed: [
          "approved by supervisor",
          "approved by hr",
          "approved",
        ].includes(leaveApplication.approval_status),
        active:
          leaveApplication.approval_status === "pending" &&
          hasAnyRole([ROLES.DEPARTMENT_HEAD]) &&
          canUserApproveBySupervisor(),
      },
      {
        label: "HR Review",
        description: "HR review and processing",
        role: "HR Manager",
        icon: <HRIcon />,
        completed: ["approved by hr", "approved"].includes(
          leaveApplication.approval_status
        ),
        active:
          (leaveApplication.approval_status === "approved by supervisor" ||
            (leaveApplication.approval_status === "pending" &&
              hasRole(ROLES.HR_MANAGER))) &&
          canUserApproveByHR(),
      },
      {
        label: "Final Approval",
        description: "Final management approval",
        role: "Admin",
        icon: <AdminIcon />,
        completed: leaveApplication.approval_status === "approved",
        active:
          leaveApplication.approval_status === "approved by hr" &&
          hasRole(ROLES.ADMIN),
      },
    ];

    // Filter out steps that don't apply to this workflow
    return steps.filter((step) => {
      // Always show employee submission
      if (step.role === "Employee") return true;

      // Show supervisor step if there's supervisor approval flow
      if (step.role === "Supervisor") {
        return (
          leaveApplication.user?.basicEmployeeData?.supervisor_id ||
          hasAnyRole([ROLES.DEPARTMENT_HEAD])
        );
      }

      // Always show HR and Admin steps
      return true;
    });
  };

  const canUserApproveBySupervisor = () => {
    if (!leaveApplication) return false;

    // Check if current user is the supervisor of the applicant
    const supervisorId =
      leaveApplication.user?.basicEmployeeData?.supervisor?.id;
    return supervisorId === user.id || hasRole(ROLES.DEPARTMENT_HEAD);
  };

  const canUserApproveByHR = () => {
    return hasRole(ROLES.HR_MANAGER) || hasRole(ROLES.ADMIN);
  };

  const canUserApprove = () => {
    if (!leaveApplication) return false;

    const { approval_status } = leaveApplication;

    // Don't allow approval of own applications
    if (leaveApplication.user_id === user.id) return false;

    // Don't allow approval of already processed applications
    if (["approved", "rejected"].includes(approval_status)) return false;

    // Supervisor can approve pending requests
    if (approval_status === "pending" && canUserApproveBySupervisor()) {
      return true;
    }

    // HR can approve pending or supervisor-approved requests
    if (
      (approval_status === "pending" ||
        approval_status === "approved by supervisor") &&
      canUserApproveByHR()
    ) {
      return true;
    }

    // Admin can approve HR-approved requests
    if (approval_status === "approved by hr" && hasRole(ROLES.ADMIN)) {
      return true;
    }

    return false;
  };

  const getNextApprovalStatus = (action) => {
    if (action === "reject") return "rejected";

    const { approval_status } = leaveApplication;

    // Supervisor approval
    if (approval_status === "pending" && canUserApproveBySupervisor()) {
      return "approved by supervisor";
    }

    // HR approval
    if (
      (approval_status === "pending" ||
        approval_status === "approved by supervisor") &&
      hasRole(ROLES.HR_MANAGER)
    ) {
      return "approved by hr";
    }

    // Admin final approval
    if (approval_status === "approved by hr" && hasRole(ROLES.ADMIN)) {
      return "approved";
    }

    // Direct HR approval (if no supervisor workflow)
    if (approval_status === "pending" && hasRole(ROLES.ADMIN)) {
      return "approved";
    }

    return approval_status;
  };

  const handleActionClick = (action) => {
    setActionType(action);
    setComment("");
    setDialogOpen(true);
  };

  const handleActionSubmit = async () => {
    try {
      setActionLoading(true);

      const newStatus = getNextApprovalStatus(actionType);
      const statusData = {
        status: newStatus,
        comment:
          comment ||
          `${actionType === "approve" ? "Approved" : "Rejected"} by ${user.first_name} ${user.sur_name}`,
      };

      console.log("Processing leave approval:", {
        leave_id: leaveApplication.id,
        action: actionType,
        new_status: newStatus,
        comment: statusData.comment,
      });

      const response = await leavesAPI.updateStatus(
        leaveApplication.id,
        statusData
      );

      if (response && response.success) {
        showSuccess(
          `Leave application ${actionType === "approve" ? "approved" : "rejected"} successfully`
        );

        // Refresh the leave application data
        await fetchLeaveApplication();

        setDialogOpen(false);

        // Navigate back after a short delay
        setTimeout(() => {
          navigate(ROUTES.LEAVES);
        }, 1500);
      } else {
        throw new Error(response?.message || "Failed to update leave status");
      }
    } catch (error) {
      console.error("Failed to process approval:", error);
      showError("Failed to process leave approval");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadAttachment = async () => {
    if (!leaveApplication.attachment) return;

    try {
      setDownloadingDoc(true);
      const blob = await documentsAPI.download(leaveApplication.attachment.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = leaveApplication.attachment.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess("Document downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      showError("Failed to download document");
    } finally {
      setDownloadingDoc(false);
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
      case "approved by supervisor":
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

  const getUserDisplayName = (user) => {
    if (!user) return "Unknown User";
    return `${user.first_name || ""} ${user.middle_name || ""} ${user.sur_name || ""}`.trim();
  };

  const calculateLeaveDays = () => {
    if (!leaveApplication) return 0;

    // Extract days from validity_check or calculate from dates
    if (leaveApplication.validity_check) {
      const days = leaveApplication.validity_check.split(" ")[0];
      return parseInt(days) || 0;
    }

    const start = new Date(leaveApplication.starting_date);
    const end = new Date(leaveApplication.end_date);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={200} height={20} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={400} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
  const leaveDays = calculateLeaveDays();

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
                    {leaveApplication.user?.first_name?.charAt(0) || "U"}
                    {leaveApplication.user?.sur_name?.charAt(0) || ""}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {getUserDisplayName(leaveApplication.user)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {leaveApplication.user?.email || ""}
                    </Typography>
                    {leaveApplication.user?.basicEmployeeData && (
                      <Typography variant="caption" color="text.secondary">
                        Employee ID:{" "}
                        {leaveApplication.user.basicEmployeeData.employee_id ||
                          "N/A"}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Chip
                  label={formatStatus(leaveApplication.approval_status)}
                  color={getStatusColor(leaveApplication.approval_status)}
                  size="large"
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Leave Type"
                        secondary={
                          leaveApplication.leaveType?.name || "Unknown"
                        }
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
                        secondary={`${leaveDays} days`}
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
                          leaveApplication.user?.basicEmployeeData?.supervisor
                            ? getUserDisplayName(
                                leaveApplication.user.basicEmployeeData
                                  .supervisor
                              )
                            : "Not assigned"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Approved By"
                        secondary={
                          leaveApplication.approver
                            ? getUserDisplayName(leaveApplication.approver)
                            : "Pending approval"
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

              {leaveApplication.attachment && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Supporting Document:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {leaveApplication.attachment.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        downloadingDoc ? (
                          <CircularProgress size={16} />
                        ) : (
                          <DownloadIcon />
                        )
                      }
                      onClick={handleDownloadAttachment}
                      disabled={downloadingDoc}
                    >
                      {downloadingDoc ? "Downloading..." : "Download"}
                    </Button>
                  </Paper>
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

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    As a{" "}
                    {hasRole(ROLES.ADMIN)
                      ? "System Administrator"
                      : hasRole(ROLES.HR_MANAGER)
                        ? "HR Manager"
                        : "Department Head"}
                    , you can approve or reject this leave application.
                  </Typography>
                </Alert>

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

          {!canUserApprove() && leaveApplication.user_id === user.id && (
            <Alert severity="info">
              You cannot approve your own leave application.
            </Alert>
          )}

          {!canUserApprove() &&
            leaveApplication.user_id !== user.id &&
            !["approved", "rejected"].includes(
              leaveApplication.approval_status
            ) && (
              <Alert severity="warning">
                You do not have permission to approve this leave application at
                its current stage.
              </Alert>
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
                    <StepLabel
                      icon={step.icon}
                      StepIconProps={{
                        style: {
                          color: step.completed
                            ? "#4caf50"
                            : step.active
                              ? "#ff9800"
                              : "#9e9e9e",
                        },
                      }}
                    >
                      <Typography variant="subtitle2">{step.label}</Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                      {step.active && (
                        <Chip
                          label="Pending Your Action"
                          size="small"
                          color="warning"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Application Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Application Summary
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Application ID
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  #{leaveApplication.id}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Leave Type
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {leaveApplication.leaveType?.name || "Unknown"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {leaveDays} {leaveDays === 1 ? "day" : "days"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Date Range
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(leaveApplication.starting_date)} -{" "}
                  {formatDate(leaveApplication.end_date)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={formatStatus(leaveApplication.approval_status)}
                  color={getStatusColor(leaveApplication.approval_status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
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
            error={actionType === "reject" && !comment.trim()}
            helperText={
              actionType === "reject" && !comment.trim()
                ? "Rejection reason is required"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
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
