import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Skeleton,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  ArrowBack as BackIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Download as DownloadIcon,
  Comment as CommentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  AttachFile as AttachmentIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser, selectUserRoles } from "../../../store/slices/authSlice";
import { ROUTES, ROLES } from "../../../constants";
import { leavesAPI } from "../../../services/api/leaves.api";
import { documentsAPI } from "../../../services/api/documents.api";
import useNotification from "../../../hooks/common/useNotification";
import { hasRole } from "../../../utils/permissions";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "approved by supervisor":
      return "info";
    case "approved by hr":
      return "primary";
    case "rejected":
      return "error";
    case "cancelled":
      return "default";
    case "draft":
      return "secondary";
    default:
      return "default";
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return <CheckCircleIcon />;
    case "pending":
      return <ScheduleIcon />;
    case "approved by supervisor":
      return <PersonIcon />;
    case "approved by hr":
      return <BadgeIcon />;
    case "rejected":
      return <CancelIcon />;
    case "cancelled":
      return <CancelIcon />;
    case "draft":
      return <CommentIcon />;
    default:
      return <InfoIcon />;
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const getUserDisplayName = (userData) => {
  if (!userData) return "N/A";
  const { first_name, middle_name, sur_name } = userData;
  return `${first_name || ""} ${middle_name || ""} ${sur_name || ""}`.trim();
};

const getUserInitials = (userData) => {
  if (!userData) return "NA";
  const { first_name, sur_name } = userData;
  return `${first_name?.[0] || ""}${sur_name?.[0] || ""}`.toUpperCase();
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const LeaveApproval = () => {
  // ---------------------------------------------------------------------------
  // HOOKS & STATE
  // ---------------------------------------------------------------------------
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector(selectUser);
  const userRoles = useSelector(selectUserRoles);
  const { showSuccess, showError } = useNotification();

  // Data state
  const [leaveApplication, setLeaveApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [comment, setComment] = useState("");

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (id) {
      fetchLeaveApplication();
    }
  }, [id]);

  // ---------------------------------------------------------------------------
  // DATA FETCHING
  // ---------------------------------------------------------------------------
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
      console.error("Error fetching leave application:", error);
      showError(error.message || "Failed to load leave application");
      navigate(ROUTES.LEAVES);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------
  const handleActionClick = (action) => {
    setActionType(action);
    setComment("");
    setDialogOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!leaveApplication || !actionType) return;

    // Validate comment for rejection
    if (actionType === "reject" && !comment.trim()) {
      showError("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);

      const newStatus = actionType === "approve" ? "approved" : "rejected";
      const statusData = {
        status: newStatus,
        comment:
          comment.trim() ||
          `${actionType === "approve" ? "Approved" : "Rejected"} by ${user.first_name} ${user.sur_name}`,
      };

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
        setComment("");
        setActionType("");

        // Navigate back after a short delay
        setTimeout(() => {
          navigate(ROUTES.LEAVES);
        }, 2000);
      } else {
        throw new Error(response?.message || "Failed to update leave status");
      }
    } catch (error) {
      console.error("Failed to process approval:", error);
      showError(error.message || "Failed to process leave approval");
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

  const handlePreviewAttachment = async () => {
    try {
      const blob = await documentsAPI.download(leaveApplication.attachment.id);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewDialogOpen(true);
    } catch (error) {
      showError("Cannot preview this file type");
    }
  };

  // ---------------------------------------------------------------------------
  // PERMISSION CHECKS
  // ---------------------------------------------------------------------------
  const canUserApprove = () => {
    if (!leaveApplication || !user) return false;

    // User cannot approve their own leave
    if (leaveApplication.user_id === user.id) return false;

    // Check if user has appropriate role
    const canApprove = hasRole(userRoles, [
      ROLES.ADMIN,
      ROLES.HR_MANAGER,
      ROLES.DEPARTMENT_HEAD,
    ]);

    // Check if application is in a state that can be approved
    const approvableStatuses = [
      "pending",
      "approved by supervisor",
      "approved by hr",
    ];
    const isApprovable = approvableStatuses.includes(
      leaveApplication.approval_status
    );

    return canApprove && isApprovable;
  };

  const getApprovalMessage = () => {
    if (!leaveApplication || !user) return "";

    if (leaveApplication.user_id === user.id) {
      return "You cannot approve your own leave application.";
    }

    if (
      !hasRole(userRoles, [
        ROLES.ADMIN,
        ROLES.HR_MANAGER,
        ROLES.DEPARTMENT_HEAD,
      ])
    ) {
      return "You do not have permission to approve leave applications.";
    }

    const approvableStatuses = [
      "pending",
      "approved by supervisor",
      "approved by hr",
    ];
    if (!approvableStatuses.includes(leaveApplication.approval_status)) {
      return `This application cannot be approved in its current status: ${formatStatus(leaveApplication.approval_status)}.`;
    }

    return "";
  };

  // ---------------------------------------------------------------------------
  // RENDER LOADING STATE
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!leaveApplication) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Leave application not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(ROUTES.LEAVES)}
        >
          Back to Leaves
        </Button>
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton
          onClick={() => navigate(ROUTES.LEAVES)}
          sx={{
            bgcolor: "background.paper",
            boxShadow: 1,
            "&:hover": { boxShadow: 2 },
          }}
        >
          <BackIcon />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0.5 }}>
            Leave Application Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and manage this leave application
          </Typography>
        </Box>

        {/* Status Chip */}
        <Chip
          icon={getStatusIcon(leaveApplication.approval_status)}
          label={formatStatus(leaveApplication.approval_status)}
          color={getStatusColor(leaveApplication.approval_status)}
          size="large"
          variant="filled"
          sx={{
            fontSize: "1rem",
            fontWeight: "bold",
            px: 2,
            py: 1,
            height: "auto",
            "& .MuiChip-icon": {
              fontSize: "1.2rem",
            },
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Employee Information Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <PersonIcon color="primary" />
                Employee Information
              </Typography>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                  {getUserInitials(leaveApplication.user)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {getUserDisplayName(leaveApplication.user)}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {leaveApplication.user?.email || "N/A"}
                    </Typography>
                  </Box>
                  {leaveApplication.user?.basicEmployeeData?.supervisor && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BadgeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Supervisor:{" "}
                        {getUserDisplayName(
                          leaveApplication.user.basicEmployeeData.supervisor
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Leave Details Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CategoryIcon color="primary" />
                Leave Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Leave Type"
                        secondary={
                          <Chip
                            label={leaveApplication.leaveType?.name || "N/A"}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Start Date"
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(leaveApplication.starting_date)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="End Date"
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(leaveApplication.end_date)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Duration"
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <ScheduleIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {calculateDays(
                                leaveApplication.starting_date,
                                leaveApplication.end_date
                              )}{" "}
                              day
                              {calculateDays(
                                leaveApplication.starting_date,
                                leaveApplication.end_date
                              ) !== 1
                                ? "s"
                                : ""}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Applied On"
                        secondary={
                          <Typography variant="body2">
                            {formatDateTime(leaveApplication.created_at)}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Last Updated"
                        secondary={
                          <Typography variant="body2">
                            {formatDateTime(leaveApplication.updated_at)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Employee Comment */}
          {leaveApplication.comment && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CommentIcon color="primary" />
                  Employee Comment
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderLeft: 4,
                    borderLeftColor: "primary.main",
                  }}
                >
                  <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                    "{leaveApplication.comment}"
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          )}

          {/* Supporting Document */}
          {leaveApplication.attachment && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <AttachmentIcon color="primary" />
                  Supporting Document
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <AttachmentIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {leaveApplication.attachment.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click download to view document
                    </Typography>
                  </Box>
                  <LoadingButton
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadAttachment}
                    loading={downloadingDoc}
                    loadingPosition="start"
                  >
                    {downloadingDoc ? "Downloading..." : "Download"}
                  </LoadingButton>
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={handlePreviewAttachment}
                  >
                    Preview
                  </Button>
                </Paper>
              </CardContent>
            </Card>
          )}

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
                    {hasRole(userRoles, [ROLES.ADMIN])
                      ? "System Administrator"
                      : hasRole(userRoles, [ROLES.HR_MANAGER])
                        ? "HR Manager"
                        : "Department Head"}
                    , you can approve or reject this leave application.
                  </Typography>
                </Alert>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleActionClick("approve")}
                    sx={{
                      minWidth: 140,
                      py: 1.5,
                      boxShadow: 3,
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Approve
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<RejectIcon />}
                    onClick={() => handleActionClick("reject")}
                    sx={{
                      minWidth: 140,
                      py: 1.5,
                      boxShadow: 3,
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Reject
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Cannot Approve Message */}
          {!canUserApprove() && (
            <Alert
              severity={
                leaveApplication.user_id === user.id ? "info" : "warning"
              }
              sx={{ mt: 3 }}
              icon={<InfoIcon />}
            >
              <Typography variant="body2">{getApprovalMessage()}</Typography>
            </Alert>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TimelineIcon color="primary" />
                Quick Summary
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Current Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(leaveApplication.approval_status)}
                    label={formatStatus(leaveApplication.approval_status)}
                    color={getStatusColor(leaveApplication.approval_status)}
                    variant="filled"
                    sx={{ fontWeight: "medium" }}
                  />
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Leave Type
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {leaveApplication.leaveType?.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Duration
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {calculateDays(
                      leaveApplication.starting_date,
                      leaveApplication.end_date
                    )}{" "}
                    day
                    {calculateDays(
                      leaveApplication.starting_date,
                      leaveApplication.end_date
                    ) !== 1
                      ? "s"
                      : ""}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Date Range
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {new Date(
                      leaveApplication.starting_date
                    ).toLocaleDateString("en-GB")}{" "}
                    -{" "}
                    {new Date(leaveApplication.end_date).toLocaleDateString(
                      "en-GB"
                    )}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Approval History */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TimelineIcon color="primary" />
                Approval History
              </Typography>

              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Submitted By"
                    secondary={getUserDisplayName(leaveApplication.user)}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Submitted On"
                    secondary={formatDateTime(leaveApplication.created_at)}
                  />
                </ListItem>

                {leaveApplication.approver && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Processed By"
                      secondary={getUserDisplayName(leaveApplication.approver)}
                    />
                  </ListItem>
                )}

                {leaveApplication.updated_at !==
                  leaveApplication.created_at && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Last Action"
                      secondary={formatDateTime(leaveApplication.updated_at)}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approval/Rejection Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !actionLoading && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {actionType === "approve" ? (
              <ApproveIcon color="success" />
            ) : (
              <RejectIcon color="error" />
            )}
            {actionType === "approve"
              ? "Approve Leave Request"
              : "Reject Leave Request"}
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {actionType === "approve"
              ? "Are you sure you want to approve this leave request? This action will notify the employee."
              : "Please provide a clear reason for rejecting this leave request. This will help the employee understand the decision."}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label={
              actionType === "approve"
                ? "Comment (Optional)"
                : "Rejection Reason *"
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              actionType === "approve"
                ? "Add any additional comments for the employee..."
                : "Explain why this request is being rejected..."
            }
            required={actionType === "reject"}
            error={actionType === "reject" && !comment.trim()}
            helperText={
              actionType === "reject" && !comment.trim()
                ? "Rejection reason is required"
                : actionType === "approve"
                  ? "Optional: Add any comments for the employee"
                  : "Be specific and constructive in your feedback"
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={actionLoading}
            color="inherit"
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color={actionType === "approve" ? "success" : "error"}
            loading={actionLoading}
            onClick={handleActionSubmit}
            disabled={actionType === "reject" && !comment.trim()}
            startIcon={
              actionType === "approve" ? <ApproveIcon /> : <RejectIcon />
            }
            sx={{ minWidth: 120 }}
          >
            {actionType === "approve" ? "Approve" : "Reject"}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveApproval;
