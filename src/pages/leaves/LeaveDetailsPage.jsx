import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Link,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES } from "../../constants";
import { leavesAPI } from "../../services/api/leaves.api";
import useNotification from "../../hooks/common/useNotification";

const LeaveDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useNotification();

  // State management
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
  const [resubmitComment, setResubmitComment] = useState("");

  // Check if this is an approval route
  const isApprovalRoute = location.pathname.includes("/approvals/");
  const isAdmin = hasRole(ROLES.ADMIN);
  const isHR = hasRole(ROLES.HR_MANAGER);

  useEffect(() => {
    if (id) {
      fetchLeaveDetails();
    }
  }, [id]);

  const fetchLeaveDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching leave details for ID:", id);

      const response = await leavesAPI.getById(id);
      console.log("Leave details response:", response);

      if (response && response.success) {
        setLeave(response.data);
      } else {
        throw new Error(response?.message || "Failed to fetch leave details");
      }
    } catch (error) {
      console.error("Error fetching leave details:", error);
      showError("Failed to load leave details");
      // Navigate back if leave not found
      setTimeout(() => navigate(-1), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`${ROUTES.LEAVES}/${id}/edit`);
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      const response = await leavesAPI.cancel(id, {
        comment: "Leave cancelled by employee",
      });

      if (response && response.success) {
        showSuccess("Leave application cancelled successfully");
        await fetchLeaveDetails(); // Refresh data
      } else {
        throw new Error(response?.message || "Failed to cancel leave");
      }
    } catch (error) {
      console.error("Error cancelling leave:", error);
      showError(error.message || "Failed to cancel leave application");
    } finally {
      setActionLoading(false);
      setCancelDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      const response = await leavesAPI.delete(id);

      if (response && response.success) {
        showSuccess("Leave application deleted successfully");
        navigate(ROUTES.LEAVES);
      } else {
        throw new Error(response?.message || "Failed to delete leave");
      }
    } catch (error) {
      console.error("Error deleting leave:", error);
      showError(error.message || "Failed to delete leave application");
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleResubmit = async () => {
    try {
      setActionLoading(true);
      console.log("Resubmitting leave application:", id);

      // Include all required fields from the original leave application
      const updateData = {
        // Keep all original leave data
        type_id: leave.type_id,
        starting_date: leave.starting_date,
        end_date: leave.end_date,
        // Update status and comment
        approval_status: "pending",
        comment: resubmitComment || leave.comment,
        // Add resubmitted timestamp if needed by backend
        resubmitted_at: new Date().toISOString(),
        // Include any other fields that might be required
        ...(leave.attachment_id && { attachment_id: leave.attachment_id }),
      };

      console.log("Resubmit data:", updateData);

      const response = await leavesAPI.resubmit(id, updateData);

      if (response && response.success) {
        showSuccess(
          "Leave application resubmitted successfully and is now pending approval"
        );
        await fetchLeaveDetails(); // Refresh data
      } else {
        throw new Error(response?.message || "Failed to resubmit leave");
      }
    } catch (error) {
      console.error("Error resubmitting leave:", error);

      // Handle validation errors specifically
      if (
        error.response?.status === 400 &&
        error.response?.data?.validationErrors
      ) {
        const validationErrors = error.response.data.validationErrors;
        const errorMessage = validationErrors
          .map((err) => err.message)
          .join(", ");
        showError(`Validation failed: ${errorMessage}`);
      } else {
        showError(error.message || "Failed to resubmit leave application");
      }
    } finally {
      setActionLoading(false);
      setResubmitDialogOpen(false);
      setResubmitComment("");
    }
  };

  const handleDownloadAttachment = (attachment) => {
    if (attachment && attachment.file_path) {
      // Create a download link
      const link = document.createElement("a");
      link.href = attachment.file_path;
      link.download = attachment.name || "attachment";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "approved by hr":
      case "approved by supervisor":
        return "info";
      case "rejected":
        return "error";
      case "draft":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <ApprovedIcon />;
      case "pending":
      case "approved by hr":
      case "approved by supervisor":
        return <PendingIcon />;
      case "rejected":
        return <RejectedIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end - start);
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  };

  const canEditLeave = () => {
    if (!leave) return false;
    const isOwner = leave.user_id === user?.id;
    const editableStatuses = ["draft", "rejected"];
    return isOwner && editableStatuses.includes(leave.approval_status);
  };


  const canCancelLeave = () => {
    if (!leave) return false;
    const isOwner = leave.user_id === user?.id;
    const cancellableStatuses = [
      "pending",
      "approved by supervisor",
      "approved by hr",
    ];
    return isOwner && cancellableStatuses.includes(leave.approval_status);
  };

  const canDeleteLeave = () => {
    if (!leave) return false;
    const isOwner = leave.user_id === user?.id;
    const isDraft = leave.approval_status === "draft";
    return isOwner && isDraft;
  };

  const canResubmitLeave = () => {
    if (!leave) return false;
    const isOwner = leave.user_id === user?.id;
    const isRejected = leave.approval_status === "rejected";
    return isOwner && isRejected;
  };

  const canApproveLeave = () => {
    if (!leave) return false;

    // Check if user can approve this leave
    const isAssignedApprover = leave.approver_id === user?.id;

    // Supervisor can approve pending applications
    if (leave.approval_status === "pending" && isAssignedApprover) {
      return true;
    }

    // Admin can approve supervisor-approved applications
    if (isAdmin && leave.approval_status === "approved by supervisor") {
      return true;
    }

    return false;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!leave) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Leave application not found</Alert>
      </Box>
    );
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Leave Application Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Application #{leave.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint} size="small">
              <PrintIcon />
            </IconButton>
          </Tooltip>

          {canEditLeave() && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size="small"
            >
              {leave.approval_status === "rejected"
                ? "Edit & Resubmit"
                : "Edit"}
            </Button>
          )}

          {canResubmitLeave() && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => setResubmitDialogOpen(true)}
              size="small"
            >
              Resubmit
            </Button>
          )}

          {canCancelLeave() && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<CancelIcon />}
              onClick={() => setCancelDialogOpen(true)}
              size="small"
            >
              Cancel
            </Button>
          )}

          {canDeleteLeave() && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              size="small"
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      {/* Status Alert */}
      <Alert
        severity={getStatusColor(leave.approval_status)}
        icon={getStatusIcon(leave.approval_status)}
        sx={{ mb: 3 }}
        action={
          canResubmitLeave() ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => setResubmitDialogOpen(true)}
              startIcon={<RefreshIcon />}
            >
              Resubmit
            </Button>
          ) : null
        }
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
          Status: {formatStatus(leave.approval_status)}
        </Typography>
        {leave.comment && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Comment: {leave.comment}
          </Typography>
        )}
        {canResubmitLeave() && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
            You can resubmit this application with corrections to restart the
            approval process.
          </Typography>
        )}
      </Alert>

      <Grid container spacing={3}>
        {/* Left Column - Main Details */}
        <Grid item xs={12} md={8}>
          {/* Employee Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <PersonIcon />
                Employee Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {leave.user?.first_name} {leave.user?.middle_name}{" "}
                    {leave.user?.sur_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{leave.user?.email}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {leave.user?.basicEmployeeData?.department
                      ?.department_name || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Designation
                  </Typography>
                  <Typography variant="body1">
                    {leave.user?.basicEmployeeData?.designation || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Leave Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <EventIcon />
                Leave Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Leave Type
                  </Typography>
                  <Chip
                    label={leave.leaveType?.name || "Unknown"}
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {calculateDays(leave.starting_date, leave.end_date)} days
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(leave.starting_date)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(leave.end_date)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Application Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(leave.created_at)}
                  </Typography>
                </Grid>

                {leave.resubmitted_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Last Resubmitted
                    </Typography>
                    <Typography variant="body1" color="primary">
                      {formatDateTime(leave.resubmitted_at)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Comments/Description */}
          {leave.comment && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <DescriptionIcon />
                  Comments/Reason
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">{leave.comment}</Typography>
                </Paper>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {leave.attachment && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <AttachFileIcon />
                  Attachments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper
                  sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <AttachFileIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      {leave.attachment.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {leave.attachment.file_type || "Document"}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadAttachment(leave.attachment)}
                  >
                    Download
                  </Button>
                </Paper>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Approval Info & Actions */}
        <Grid item xs={12} md={4}>
          {/* Approval Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Approval Status
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getStatusIcon(leave.approval_status)}
                  <Chip
                    label={formatStatus(leave.approval_status)}
                    color={getStatusColor(leave.approval_status)}
                    size="small"
                  />
                </Box>

                {leave.approver && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Approver
                    </Typography>
                    <Typography variant="body1">
                      {leave.approver.first_name} {leave.approver.sur_name}
                    </Typography>
                  </Box>
                )}

                {leave.approved_at && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Approved On
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(leave.approved_at)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Quick Actions for Rejected Applications */}
          {canResubmitLeave() && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Application Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Alert severity="warning" sx={{ mb: 2 }}>
                  This application was rejected. You can resubmit with
                  corrections.
                </Alert>

                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    fullWidth
                    onClick={() => setResubmitDialogOpen(true)}
                  >
                    Resubmit Application
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    fullWidth
                    onClick={handleEdit}
                  >
                    Edit & Resubmit
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions for Approvers */}
          {canApproveLeave() && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Approval Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Alert severity="info" sx={{ mb: 2 }}>
                  This application requires your approval
                </Alert>

                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApprovedIcon />}
                    fullWidth
                    onClick={() =>
                      navigate(`${ROUTES.LEAVE_APPROVALS}?focus=${leave.id}`)
                    }
                  >
                    Approve Application
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RejectedIcon />}
                    fullWidth
                    onClick={() =>
                      navigate(`${ROUTES.LEAVE_APPROVALS}?focus=${leave.id}`)
                    }
                  >
                    Reject Application
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1}>
                {leave.leaveType && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Leave Type Details
                    </Typography>
                    <Typography variant="body2">
                      Min: {leave.leaveType.minimum_days} days, Max:{" "}
                      {leave.leaveType.maximum_days} days
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Application ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    #{leave.id}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(leave.updated_at)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Leave Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this leave application? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={actionLoading}
          >
            No, Keep Application
          </Button>
          <Button
            onClick={handleCancel}
            color="warning"
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : null}
          >
            {actionLoading ? "Cancelling..." : "Yes, Cancel Application"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Leave Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this draft leave application? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : null}
          >
            {actionLoading ? "Deleting..." : "Delete Application"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resubmit Confirmation Dialog */}
      <Dialog
        open={resubmitDialogOpen}
        onClose={() => setResubmitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resubmit Leave Application</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You can resubmit this rejected leave application. Please provide any
            additional comments or corrections below.
          </DialogContentText>

          <TextField
            fullWidth
            label="Additional Comments (Optional)"
            multiline
            rows={4}
            value={resubmitComment}
            onChange={(e) => setResubmitComment(e.target.value)}
            placeholder="Add any clarifications or corrections for the resubmission..."
            sx={{ mt: 2 }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            Resubmitting will reset the approval status to "Pending" and restart
            the approval process.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setResubmitDialogOpen(false);
              setResubmitComment("");
            }}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResubmit}
            color="primary"
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : null}
          >
            {actionLoading ? "Resubmitting..." : "Resubmit Application"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveDetailsPage;
