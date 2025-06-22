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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../auth/AuthGuard";
import { ROUTES, LEAVE_STATUS, ROLES } from "../../../constants";
import { leavesAPI } from "../../../services/api/leaves.api";
import useNotification from "../../../hooks/common/useNotification";

const LeaveList = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasAnyRole, hasRole } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();

  // State management
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Initialize data on component mount
  useEffect(() => {
    loadInitialData();
  }, [activeTab, pagination.page, pagination.limit]);

  const loadInitialData = async () => {
    await Promise.all([fetchLeaves(), fetchLeaveTypes()]);
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      // Build query parameters based on user role and active tab
      const isManager = hasAnyRole([
        ROLES.ADMIN,
        ROLES.HR_MANAGER,
        ROLES.DEPARTMENT_HEAD,
      ]);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Add status filter based on active tab
      switch (activeTab) {
        case 1: // Pending Approvals (managers) or Pending (employees)
          if (isManager) {
            params.status = "pending,approved by supervisor";
          } else {
            params.status = "pending,draft,approved by supervisor";
          }
          break;
        case 2: // Approved
          params.status = "approved";
          break;
        default: // All leaves
          // For non-managers, we'll filter on frontend since backend filters by role
          break;
      }

      // Add additional filters
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (typeFilter) {
        params.type_id = typeFilter;
      }

      // Call the appropriate API endpoint
      const response = await leavesAPI.getAll(params);

      console.log("API Response:", response); // Debug log

      // Handle different response structures
      if (response && response.success) {
        const leavesData = response.data || [];
        const metaData = response.meta || {};

        setLeaves(Array.isArray(leavesData) ? leavesData : []);
        setPagination((prev) => ({
          ...prev,
          totalItems:
            metaData.totalItems || metaData.total || leavesData.length,
          totalPages:
            metaData.totalPages ||
            Math.ceil((metaData.total || leavesData.length) / pagination.limit),
        }));
      } else if (response && response.data) {
        // Handle direct data response
        setLeaves(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      showError("Failed to load leave applications");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await leavesAPI.getTypes();
      console.log("Leave Types Response:", response); // Debug log

      if (response && response.success) {
        setLeaveTypes(response.data || []);
      } else if (response && response.data) {
        setLeaveTypes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
      // Don't show error for leave types as it's not critical
    }
  };

  const handleRefresh = async () => {
    await fetchLeaves();
    showSuccess("Leave applications refreshed");
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

  const handleEditLeave = () => {
    if (selectedLeave) {
      navigate(`${ROUTES.LEAVES}/${selectedLeave.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteLeave = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDeleteLeave = async () => {
    if (!selectedLeave) return;

    try {
      setActionLoading(true);

      // For draft applications, we can delete them directly
      // For other statuses, we should cancel them
      let response;
      if (selectedLeave.approval_status === "draft") {
        // Delete endpoint might not exist, so we'll try cancel first
        response = await leavesAPI.cancel(selectedLeave.id, {
          comment: "Deleted by user",
        });
      } else {
        response = await leavesAPI.cancel(selectedLeave.id, {
          comment: "Cancelled by user",
        });
      }

      if (response && response.success) {
        showSuccess("Leave application removed successfully");
        await fetchLeaves(); // Refresh the list
      } else {
        throw new Error(
          response?.message || "Failed to remove leave application"
        );
      }
    } catch (error) {
      console.error("Error removing leave:", error);
      showError("Failed to remove leave application");
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSelectedLeave(null);
    }
  };

  const handleApprovalAction = (action) => {
    setApprovalAction(action);
    setApprovalDialogOpen(true);
    handleMenuClose();
  };

  const confirmApprovalAction = async () => {
    if (!selectedLeave || !approvalAction) return;

    try {
      setActionLoading(true);

      const statusData = {
        status:
          approvalAction === "approve" ? "approved by supervisor" : "rejected",
        comment: "", // You might want to add a comment field
      };

      const response = await leavesAPI.updateStatus(
        selectedLeave.id,
        statusData
      );

      if (response && response.success) {
        showSuccess(
          `Leave application ${approvalAction === "approve" ? "approved" : "rejected"} successfully`
        );
        await fetchLeaves(); // Refresh the list
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
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
      case "approved by supervisor":
      case "approved by hr":
        return "warning";
      case "rejected":
        return "error";
      case "draft":
        return "default";
      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  const canEdit = (leave) => {
    const isOwner = leave.user_id === user.id;
    const isDraft = leave.approval_status === "draft";
    const isPending = leave.approval_status === "pending";

    return isOwner && (isDraft || isPending);
  };

  const canApprove = (leave) => {
    const isManager = hasAnyRole([
      ROLES.ADMIN,
      ROLES.HR_MANAGER,
      ROLES.DEPARTMENT_HEAD,
    ]);
    const isPending =
      leave.approval_status === "pending" ||
      leave.approval_status === "approved by supervisor";

    return isManager && isPending && leave.user_id !== user.id;
  };

  const canDelete = (leave) => {
    const isOwner = leave.user_id === user.id;
    const isDraft = leave.approval_status === "draft";

    return isOwner && isDraft;
  };

  const canCancel = (leave) => {
    const isOwner = leave.user_id === user.id;
    const isManager = hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]);
    const isPending = leave.approval_status === "pending";

    return (isOwner && isPending) || isManager;
  };

  const columns = [
    {
      field: "user_name",
      headerName: "Employee",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const user = params.row.user;
        const fullName = user
          ? `${user.first_name || ""} ${user.middle_name || ""} ${user.sur_name || ""}`.trim()
          : "Unknown User";

        return (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || ""}
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
            {new Date(params.row.starting_date).toLocaleDateString()} -
          </Typography>
          <Typography variant="body2">
            {new Date(params.row.end_date).toLocaleDateString()}
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
            label={`${days} days`}
            size="small"
            color="info"
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
        <Chip
          label={formatStatus(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Applied",
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(event) => handleMenuOpen(event, params.row)}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

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

    // For employees, filter to show only their leaves if not manager
    if (!hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_HEAD])) {
      filtered = filtered.filter((leave) => leave.user_id === user.id);
    }

    return filtered;
  };

  const filteredLeaves = getFilteredLeaves();

  // Get unique statuses from current data
  const statuses = [
    ...new Set(leaves.map((leave) => leave.approval_status)),
  ].filter(Boolean);

  // Get leave type IDs for filter
  const availableTypeIds = leaveTypes.map((type) => type.id);

  const tabLabels = hasAnyRole([
    ROLES.ADMIN,
    ROLES.HR_MANAGER,
    ROLES.DEPARTMENT_HEAD,
  ])
    ? ["All Leaves", "Pending Approvals", "Approved"]
    : ["My Leaves", "Pending", "Approved"];

  // Get tab counts
  const getTabCounts = () => {
    const allCount = filteredLeaves.length;
    const pendingCount = filteredLeaves.filter((l) =>
      ["pending", "approved by supervisor", "draft"].includes(l.approval_status)
    ).length;
    const approvedCount = filteredLeaves.filter(
      (l) => l.approval_status === "approved"
    ).length;

    return [allCount, pendingCount, approvedCount];
  };

  const tabCounts = getTabCounts();

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
            Leave Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_HEAD])
              ? "Manage leave applications and approvals"
              : "View and manage your leave requests"}
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.LEAVE_CREATE)}
          >
            Apply for Leave
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={`${label} (${tabCounts[index] || 0})`} />
          ))}
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
              placeholder="Search leaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
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
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
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

      {/* Leave Table */}
      <Card>
        {filteredLeaves.length === 0 && !loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Alert severity="info">
              {searchTerm || statusFilter || typeFilter
                ? "No leave applications match your current filters."
                : "No leave applications found."}
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
              }}
              getRowId={(row) => row.id}
              onPageSizeChange={(newPageSize) => {
                setPagination((prev) => ({
                  ...prev,
                  limit: newPageSize,
                  page: 1,
                }));
              }}
              page={pagination.page - 1} // DataGrid uses 0-based pages
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

        {selectedLeave && canEdit(selectedLeave) && (
          <MenuItem onClick={handleEditLeave}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Application</ListItemText>
          </MenuItem>
        )}

        {selectedLeave &&
          canApprove(selectedLeave) && [
            <MenuItem
              key="approve"
              onClick={() => handleApprovalAction("approve")}
            >
              <ListItemIcon>
                <ApproveIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Approve</ListItemText>
            </MenuItem>,
            <MenuItem
              key="reject"
              onClick={() => handleApprovalAction("reject")}
            >
              <ListItemIcon>
                <RejectIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Reject</ListItemText>
            </MenuItem>,
          ]}

        {selectedLeave && canDelete(selectedLeave) && (
          <MenuItem onClick={handleDeleteLeave} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Draft</ListItemText>
          </MenuItem>
        )}

        {selectedLeave && canCancel(selectedLeave) && (
          <MenuItem onClick={handleDeleteLeave} sx={{ color: "warning.main" }}>
            <ListItemIcon>
              <RejectIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Cancel Application</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Delete/Cancel Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          {selectedLeave?.approval_status === "draft" ? "Delete" : "Cancel"}{" "}
          Leave Application
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            {selectedLeave?.approval_status === "draft" ? "delete" : "cancel"}{" "}
            this leave application? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteLeave}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={16} />
            ) : selectedLeave?.approval_status === "draft" ? (
              "Delete"
            ) : (
              "Cancel"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
      >
        <DialogTitle>
          {approvalAction === "approve" ? "Approve" : "Reject"} Leave
          Application
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {approvalAction} this leave application for{" "}
            {selectedLeave?.user?.first_name || "this employee"}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmApprovalAction}
            color={approvalAction === "approve" ? "success" : "error"}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={16} />
            ) : approvalAction === "approve" ? (
              "Approve"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveList;
