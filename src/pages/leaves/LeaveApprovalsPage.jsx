import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
  Grid,
  Divider,
  Paper,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as PendingIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, LEAVE_STATUS, ROLES } from "../../constants";
import { leavesAPI } from "../../services/api/leaves.api";
import useNotification from "../../hooks/common/useNotification";

const LeaveApprovalsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasRole } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();

  // State management
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [expandedLeave, setExpandedLeave] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  });

  // Initialize data
  useEffect(() => {
    fetchPendingLeaves();
  }, [pagination.page, pagination.rowsPerPage]);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      console.log("Fetching leaves for approval...");

      const params = {
        page: pagination.page + 1, // Backend expects 1-based pagination
        limit: pagination.rowsPerPage,
      };

      // Add filters if selected
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type_id = typeFilter;

      console.log("API params:", params);

      const response = await leavesAPI.getForApproval(params);
      console.log("API response:", response);

      if (response && response.success) {
        const leavesData = response.data.applications || [];
        const paginationData = response.data.pagination || {};

        console.log("Leaves data:", leavesData);
        setLeaves(leavesData);
        setPagination((prev) => ({
          ...prev,
          total: paginationData.totalItems || leavesData.length,
        }));
      } else {
        throw new Error(response?.message || "Failed to fetch leaves");
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      showError("Failed to load leave applications for approval");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchPendingLeaves();
    showSuccess("Leave approvals refreshed");
  };

  const handleMenuOpen = (event, leave) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeave(leave);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Only clear selectedLeave if no dialog is open
    if (!approvalDialogOpen) {
      setSelectedLeave(null);
    }
  };

  const handleDialogClose = () => {
    setApprovalDialogOpen(false);
    setApprovalAction(null);
    setSelectedLeave(null); // Clear it here instead
    setApprovalComment("");
  };

  const handleViewDetails = (leave) => {
    setExpandedLeave(expandedLeave === leave.id ? null : leave.id);
    handleMenuClose();
  };

  const handleQuickAction = (action) => {
    console.log("Quick action:", action, "for leave:", selectedLeave?.id);
    setApprovalAction(action);
    setApprovalComment("");
    setApprovalDialogOpen(true);
    // DON'T call handleMenuClose() here - keep selectedLeave available
    setAnchorEl(null); // Just close the menu without clearing selectedLeave
  };

  const confirmApprovalAction = async () => {
    if (!selectedLeave || !approvalAction) {
      console.log("Missing data:", { selectedLeave, approvalAction });
      return;
    }

    try {
      setActionLoading(true);
      console.log("Processing approval action:", {
        leaveId: selectedLeave.id,
        action: approvalAction,
        comment: approvalComment,
      });

      // Simple status mapping - backend handles the logic
      const newStatus = approvalAction === "approve" ? "approved" : "rejected";

      const statusData = {
        status: newStatus,
        comment:
          approvalComment ||
          `${approvalAction === "approve" ? "Approved" : "Rejected"} by ${user.first_name} ${user.sur_name}`,
      };

      console.log("Sending status update:", statusData);

      const response = await leavesAPI.updateStatus(
        selectedLeave.id,
        statusData
      );
      console.log("Update response:", response);

      if (response && response.success) {
        showSuccess(
          `Leave application ${approvalAction === "approve" ? "approved" : "rejected"} successfully`
        );
        await fetchPendingLeaves();
        handleDialogClose();
      } else {
        throw new Error(response?.message || "Failed to update leave status");
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
      showError(error.message || "Failed to update leave application status");
    } finally {
      setActionLoading(false);
      setApprovalDialogOpen(false);
      setApprovalAction(null);
      setSelectedLeave(null);
      setApprovalComment("");
    }
  };

  const canUserApprove = (leave) => {
    // Check if user is the assigned approver for this leave
    const isAssignedApprover = leave.approver_id === user?.id;
    const isAdmin = hasRole(ROLES.ADMIN);

    if (!isAssignedApprover && !isAdmin) {
      return false;
    }

    // Supervisor level: can approve pending applications
    if (leave.approval_status === "pending" && isAssignedApprover) {
      return true;
    }

    // Admin level: can approve supervisor-approved applications
    if (isAdmin && leave.approval_status === "approved by supervisor") {
      return true;
    }

    return false;
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
      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  const getPriorityLevel = (leave) => {
    const today = new Date();
    const startDate = new Date(leave.starting_date);
    const daysUntilStart = Math.ceil(
      (startDate - today) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilStart <= 1) {
      return { label: "Critical", color: "error" };
    } else if (daysUntilStart <= 3) {
      return { label: "Urgent", color: "error" };
    } else if (daysUntilStart <= 7) {
      return { label: "High", color: "warning" };
    } else {
      return { label: "Normal", color: "default" };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end - start);
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  };

  // Filter data based on search and filters
  const getFilteredLeaves = () => {
    let filtered = leaves;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((leave) => {
        const user = leave.user;
        const fullName = user
          ? `${user.first_name || ""} ${user.middle_name || ""} ${user.sur_name || ""}`.toLowerCase()
          : "";
        const leaveTypeName = (
          leave.leaveType?.name ||
          leave.type ||
          ""
        ).toLowerCase();
        const comment = (leave.comment || "").toLowerCase();

        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          leaveTypeName.includes(searchTerm.toLowerCase()) ||
          comment.includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  };

  const filteredLeaves = getFilteredLeaves();

  // Get unique leave types for filters
  const leaveTypes = [
    ...new Set(leaves.map((leave) => leave.leaveType?.name || leave.type)),
  ].filter(Boolean);

  const handleChangePage = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    }));
  };

  const renderLeaveDetails = (leave) => (
    <Box sx={{ p: 2, bgcolor: "grey.50" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Employee Details
          </Typography>
          <Box sx={{ ml: 3 }}>
            <Typography variant="body2">
              <strong>Name:</strong> {leave.user?.first_name}{" "}
              {leave.user?.middle_name} {leave.user?.sur_name}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {leave.user?.email}
            </Typography>
            <Typography variant="body2">
              <strong>Department:</strong>{" "}
              {leave.user?.basicEmployeeData?.department?.department_name ||
                "N/A"}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            <EventIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Leave Details
          </Typography>
          <Box sx={{ ml: 3 }}>
            <Typography variant="body2">
              <strong>Type:</strong> {leave.leaveType?.name || "N/A"}
            </Typography>
            <Typography variant="body2">
              <strong>Duration:</strong>{" "}
              {calculateDays(leave.starting_date, leave.end_date)} days
            </Typography>
            <Typography variant="body2">
              <strong>Applied:</strong> {formatDate(leave.created_at)}
            </Typography>
          </Box>
        </Grid>

        {leave.comment && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              <DescriptionIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Comment
            </Typography>
            <Typography
              variant="body2"
              sx={{ ml: 3, bgcolor: "white", p: 1, borderRadius: 1 }}
            >
              {leave.comment}
            </Typography>
          </Grid>
        )}

        {leave.attachment && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              <AttachFileIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Attachment
            </Typography>
            <Box sx={{ ml: 3 }}>
              <Button size="small" startIcon={<AttachFileIcon />}>
                {leave.attachment.name}
              </Button>
            </Box>
          </Grid>
        )}

        {canUserApprove(leave) && (
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => {
                  setSelectedLeave(leave);
                  handleQuickAction("approve");
                }}
                size="small"
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => {
                  setSelectedLeave(leave);
                  handleQuickAction("reject");
                }}
                size="small"
              >
                Reject
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );

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
            Leave Approvals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve leave applications
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={
              loading ? <CircularProgress size={16} /> : <RefreshIcon />
            }
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="outlined" onClick={() => navigate(ROUTES.LEAVES)}>
            View All Leaves
          </Button>
        </Box>
      </Box>

      {/* Alert for pending approvals */}
      {filteredLeaves.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<PendingIcon />}>
          You have {filteredLeaves.length} leave application
          {filteredLeaves.length > 1 ? "s" : ""} awaiting your review.
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              placeholder="Search by employee, type, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
              size="small"
            />

            <TextField
              select
              label="Leave Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              <MenuItem value="">All Types</MenuItem>
              {leaveTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved by supervisor">
                Approved by Supervisor
              </MenuItem>
            </TextField>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: "auto" }}
            >
              Showing {filteredLeaves.length} applications
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Leaves List */}
      <Card>
        {filteredLeaves.length === 0 && !loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Alert severity="info">
              {searchTerm || statusFilter || typeFilter
                ? "No leave applications match your current filters."
                : "No leave applications require your approval at this time."}
            </Alert>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <React.Fragment key={leave.id}>
                        <TableRow
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleViewDetails(leave)}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">
                                {leave.user?.first_name} {leave.user?.sur_name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {leave.user?.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={leave.leaveType?.name || "Unknown"}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {formatDate(leave.starting_date)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                to {formatDate(leave.end_date)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${calculateDays(leave.starting_date, leave.end_date)}d`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={formatStatus(leave.approval_status)}
                              color={getStatusColor(leave.approval_status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const priority = getPriorityLevel(leave);
                              return (
                                <Chip
                                  label={priority.label}
                                  color={priority.color}
                                  size="small"
                                />
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={(event) => {
                                event.stopPropagation();
                                handleMenuOpen(event, leave);
                              }}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        {expandedLeave === leave.id && (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ p: 0 }}>
                              {renderLeaveDetails(leave)}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={pagination.total}
              rowsPerPage={pagination.rowsPerPage}
              page={pagination.page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedLeave)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {expandedLeave === selectedLeave?.id
              ? "Hide Details"
              : "View Details"}
          </ListItemText>
        </MenuItem>

        {selectedLeave &&
          canUserApprove(selectedLeave) && [
            <MenuItem
              key="approve"
              onClick={() => handleQuickAction("approve")}
            >
              <ListItemIcon>
                <ApproveIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Approve</ListItemText>
            </MenuItem>,
            <MenuItem key="reject" onClick={() => handleQuickAction("reject")}>
              <ListItemIcon>
                <RejectIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Reject</ListItemText>
            </MenuItem>,
          ]}
      </Menu>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={handleDialogClose} // Use the new handler
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalAction === "approve" ? "Approve" : "Reject"} Leave
          Application
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to {approvalAction} the leave application for{" "}
            <strong>
              {selectedLeave?.user?.first_name || "this employee"}
            </strong>
            ?
          </DialogContentText>

          <TextField
            fullWidth
            label="Comment (Optional)"
            multiline
            rows={3}
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            placeholder={`Add a comment for the ${approvalAction} decision...`}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={confirmApprovalAction}
            color={approvalAction === "approve" ? "success" : "error"}
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : null}
          >
            {actionLoading
              ? "Processing..."
              : approvalAction === "approve"
                ? "Approve"
                : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveApprovalsPage;
