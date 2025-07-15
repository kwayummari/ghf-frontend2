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
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as PendingIcon,
  Refresh as RefreshIcon,
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
  const { hasRole, hasAnyRole } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();

  // State management
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Initialize data
  useEffect(() => {
    fetchPendingLeaves();
  }, [activeTab, pagination.page, pagination.limit]);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);

      // Build query parameters based on user role and active tab
      const isAdmin = hasRole(ROLES.ADMIN);
      const isHR = hasRole(ROLES.HR_MANAGER);
      const isDeptHead = hasRole(ROLES.DEPARTMENT_HEAD);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Determine which leaves to fetch based on tab and role
      switch (activeTab) {
        case 0: // My Queue - leaves that current user can approve
          if (isAdmin) {
            // Admins see HR approved leaves awaiting final approval
            params.status = "approved by hr";
          } else if (isHR) {
            // HR sees pending leaves and supervisor approved leaves
            params.status = "pending,approved by supervisor";
          } else if (isDeptHead) {
            // Department heads see pending leaves for their department
            params.status = "pending";
            // Add department filter if available
          }
          break;
        case 1: // Pending HR
          params.status = "pending,approved by supervisor";
          break;
        case 2: // Pending Admin (only for admins)
          params.status = "approved by hr";
          break;
        default:
          // Default to pending leaves
          params.status = "pending";
          break;
      }

      // Add filters
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (typeFilter) {
        params.type_id = typeFilter;
      }

      const response = await leavesAPI.getAll(params);

      if (response && response.success) {
        const leavesData = response.data.applications || [];
        const metaData = response.meta || {};

        // Filter leaves based on user's approval authority
        const filteredLeaves = leavesData.filter((leave) =>
          canUserApprove(leave)
        );

        setLeaves(filteredLeaves);
        setPagination((prev) => ({
          ...prev,
          totalItems:
            metaData.totalItems || metaData.total || filteredLeaves.length,
          totalPages:
            metaData.totalPages ||
            Math.ceil(
              (metaData.total || filteredLeaves.length) / pagination.limit
            ),
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

  const canUserApprove = (leave) => {
    const isAdmin = hasRole(ROLES.ADMIN);
    const isHR = hasRole(ROLES.HR_MANAGER);
    const isDeptHead = hasRole(ROLES.DEPARTMENT_HEAD);

    // Admin can approve HR-approved leaves
    if (isAdmin && leave.approval_status === "approved by hr") {
      return true;
    }

    // HR can approve pending and supervisor-approved leaves
    if (
      isHR &&
      ["pending", "approved by supervisor"].includes(leave.approval_status)
    ) {
      return true;
    }

    // Department heads can approve pending leaves from their department
    if (isDeptHead && leave.approval_status === "pending") {
      // You might need to add department checking logic here
      return true;
    }

    return false;
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
    setSelectedLeave(null);
  };

  const handleViewLeave = () => {
    if (selectedLeave) {
      navigate(`${ROUTES.LEAVES}/${selectedLeave.id}`);
    }
    handleMenuClose();
  };

  const handleQuickAction = (action) => {
    setApprovalAction(action);
    setApprovalComment("");
    setApprovalDialogOpen(true);
    handleMenuClose();
  };

  const confirmApprovalAction = async () => {
    if (!selectedLeave || !approvalAction) return;

    try {
      setActionLoading(true);

      // Determine the new status based on user role and action
      let newStatus;
      if (approvalAction === "approve") {
        if (hasRole(ROLES.ADMIN)) {
          newStatus = "approved"; // Final approval
        } else if (hasRole(ROLES.HR_MANAGER)) {
          newStatus = "approved by hr";
        } else if (hasRole(ROLES.DEPARTMENT_HEAD)) {
          newStatus = "approved by supervisor";
        }
      } else {
        newStatus = "rejected";
      }

      const statusData = {
        status: newStatus,
        comment:
          approvalComment ||
          `${approvalAction === "approve" ? "Approved" : "Rejected"} by ${user.first_name} ${user.sur_name}`,
      };


      const response = await leavesAPI.updateStatus(
        selectedLeave.id,
        statusData
      );

      if (response && response.success) {
        showSuccess(
          `Leave application ${approvalAction === "approve" ? "approved" : "rejected"} successfully`
        );
        await fetchPendingLeaves(); // Refresh the list
      } else {
        throw new Error(response?.message || "Failed to update leave status");
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
      showError("Failed to update leave application status");
    } finally {
      setActionLoading(false);
      setApprovalDialogOpen(false);
      setApprovalAction(null);
      setSelectedLeave(null);
      setApprovalComment("");
    }
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

  const getApprovalBadge = (leave) => {
    const canApprove = canUserApprove(leave);

    if (canApprove) {
      return (
        <Chip label="Awaiting Your Approval" color="warning" size="small" />
      );
    }

    // Show what level of approval is needed
    if (leave.approval_status === "pending") {
      return <Chip label="Awaiting Supervisor" color="default" size="small" />;
    } else if (leave.approval_status === "approved by supervisor") {
      return <Chip label="Awaiting HR" color="info" size="small" />;
    } else if (leave.approval_status === "approved by hr") {
      return <Chip label="Awaiting Admin" color="secondary" size="small" />;
    }

    return <Chip label="Unknown Status" color="default" size="small" />;
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

  const columns = [
    {
      field: "user_info",
      headerName: "Employee",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const user = params.row.user;
        const fullName = user
          ? `${user.first_name || ""} ${user.middle_name || ""} ${user.sur_name || ""}`.trim()
          : "Unknown User";

        return (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
              {fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || "No email"}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "leave_type",
      headerName: "Leave Type",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.leaveType?.name || params.row.type || "Unknown"}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: "date_range",
      headerName: "Date Range",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {new Date(params.row.starting_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            to {new Date(params.row.end_date).toLocaleDateString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: "validity_check",
      headerName: "Days",
      width: 80,
      renderCell: (params) => {
        const days = params.value ? params.value.split(" ")[0] : "0";
        return (
          <Chip
            label={`${days}d`}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "approval_status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Chip
            label={formatStatus(params.value)}
            color={getStatusColor(params.value)}
            size="small"
            sx={{ mb: 0.5 }}
          />
          <br />
          {getApprovalBadge(params.row)}
        </Box>
      ),
    },
    {
      field: "created_at",
      headerName: "Applied",
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => {
        const priority = getPriorityLevel(params.row);
        return (
          <Chip label={priority.label} color={priority.color} size="small" />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            handleMenuOpen(event, params.row);
          }}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Filter data based on active tab and filters
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

  // Get unique leave types and statuses for filters
  const leaveTypes = [
    ...new Set(leaves.map((leave) => leave.leaveType?.name || leave.type)),
  ].filter(Boolean);
  const statuses = [
    ...new Set(leaves.map((leave) => leave.approval_status)),
  ].filter(Boolean);

  // Get counts for tabs
  const getTabCounts = () => {
    const myQueueCount = leaves.filter((leave) => canUserApprove(leave)).length;
    const pendingHRCount = leaves.filter((leave) =>
      ["pending", "approved by supervisor"].includes(leave.approval_status)
    ).length;
    const pendingAdminCount = leaves.filter(
      (leave) => leave.approval_status === "approved by hr"
    ).length;

    return [myQueueCount, pendingHRCount, pendingAdminCount];
  };

  const tabCounts = getTabCounts();
  const pendingCount = tabCounts[0]; // My queue count

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
            Review and approve pending leave applications
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
      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<PendingIcon />}>
          You have {pendingCount} leave application{pendingCount > 1 ? "s" : ""}{" "}
          awaiting your approval.
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={`My Queue (${tabCounts[0] || 0})`} />
          <Tab label={`Pending HR (${tabCounts[1] || 0})`} />
          {hasRole(ROLES.ADMIN) && (
            <Tab label={`Pending Admin (${tabCounts[2] || 0})`} />
          )}
        </Tabs>
      </Card>

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
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatStatus(status)}
                </MenuItem>
              ))}
            </TextField>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: "auto" }}
            >
              Showing {filteredLeaves.length} of {leaves.length} applications
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Leaves Table */}
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
          <Box sx={{ height: 600 }}>
            <DataGrid
              rows={filteredLeaves}
              columns={columns}
              loading={loading}
              pageSize={pagination.limit}
              rowsPerPageOptions={[5, 10, 25, 50]}
              disableSelectionOnClick
              sx={{
                border: "none",
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-row": {
                  cursor: "pointer",
                },
              }}
              onRowClick={(params) => {
                navigate(`${ROUTES.LEAVES}/${params.id}`);
              }}
              getRowId={(row) => row.id}
              onPageSizeChange={(newPageSize) => {
                setPagination((prev) => ({
                  ...prev,
                  limit: newPageSize,
                  page: 1,
                }));
              }}
              page={pagination.page - 1}
              onPageChange={(newPage) => {
                setPagination((prev) => ({ ...prev, page: newPage + 1 }));
              }}
              rowCount={pagination.totalItems}
              paginationMode="server"
            />
          </Box>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewLeave}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
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
              <ListItemText>Quick Approve</ListItemText>
            </MenuItem>,
            <MenuItem key="reject" onClick={() => handleQuickAction("reject")}>
              <ListItemIcon>
                <RejectIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Quick Reject</ListItemText>
            </MenuItem>,
          ]}
      </Menu>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
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
          <Button
            onClick={() => setApprovalDialogOpen(false)}
            disabled={actionLoading}
          >
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
