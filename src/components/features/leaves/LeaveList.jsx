import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { ROUTES } from "../../../constants";
import { leavesAPI } from "../../../services/api/leaves.api";
import { documentsAPI } from "../../../services/api/documents.api";
import useNotification from "../../../hooks/common/useNotification";

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
    case "draft":
      return "secondary";
    default:
      return "default";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB");
};

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const LeaveList = () => {
  // ---------------------------------------------------------------------------
  // HOOKS & STATE
  // ---------------------------------------------------------------------------
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { showSuccess, showError } = useNotification();

  // Data state
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const selectedLeaveRef = useRef(null);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // COMPUTED VALUES
  // ---------------------------------------------------------------------------
  const tabLabels = [
    "My Applications",
    "Drafts",
    "Pending",
    "Approved",
    "Rejected",
  ];

  const statuses = [
    "draft",
    "pending",
    "approved by supervisor",
    "approved by hr",
    "approved",
    "rejected",
  ];

  const getTabFilteredLeaves = (tabIndex) => {
    const myLeaves = leaves.filter((leave) => leave.user_id === user.id);

    switch (tabIndex) {
      case 0: // My Applications - All my leaves
        return myLeaves;
      case 1: // Drafts - Only my drafts
        return myLeaves.filter((leave) => leave.approval_status === "draft");
      case 2: // Pending - My pending applications
        return myLeaves.filter((leave) =>
          ["pending", "approved by supervisor", "approved by hr"].includes(
            leave.approval_status
          )
        );
      case 3: // Approved - My approved leaves
        return myLeaves.filter((leave) => leave.approval_status === "approved");
      case 4: // Rejected - My rejected leaves
        return myLeaves.filter((leave) => leave.approval_status === "rejected");
      default:
        return myLeaves;
    }
  };

  const tabCounts = tabLabels.map(
    (_, index) => getTabFilteredLeaves(index).length
  );

  const filteredLeaves = leaves.filter((leave) => {
    // Only show user's own leaves
    const isMyLeave = leave.user_id === user.id;
    if (!isMyLeave) return false;

    const matchesSearch =
      leave.leaveType?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.comment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !typeFilter || leave.type_id === parseInt(typeFilter);
    const matchesStatus =
      !statusFilter || leave.approval_status === statusFilter;
    const matchesTab = getTabFilteredLeaves(activeTab).includes(leave);

    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchLeaves();
    fetchLeaveTypes();
  }, []);

  // ---------------------------------------------------------------------------
  // DATA FETCHING FUNCTIONS
  // ---------------------------------------------------------------------------
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leavesAPI.getAll();
      if (response && response.success) {
        setLeaves(response.data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      showError("Failed to load leave applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await leavesAPI.getTypes();
      if (response && response.success) {
        setLeaveTypes(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
      // Don't show error for leave types as it's not critical
    }
  };

  // ---------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------
  const handleRefresh = async () => {
    await fetchLeaves();
    showSuccess("Leave applications refreshed");
  };

  const handleMenuOpen = (event, leave) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeave(leave);
    selectedLeaveRef.current = leave;
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    if (!deleteDialogOpen) {
      setSelectedLeave(null);
    }
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
    selectedLeaveRef.current = selectedLeave;
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDeleteLeave = async () => {
    const leaveToDelete = selectedLeaveRef.current;

    if (!leaveToDelete) {
      console.log("No selected leave in ref, returning");
      return;
    }

    try {
      setActionLoading(true);

      // Only delete draft applications (no cancel functionality in personal list)
      if (leaveToDelete.approval_status === "draft") {
        const response = await leavesAPI.delete(leaveToDelete.id);

        if (response && response.success) {
          showSuccess("Leave application deleted successfully");
          await fetchLeaves();
        } else {
          throw new Error(
            response?.message || "Failed to delete leave application"
          );
        }
      } else {
        showError(
          "Only draft applications can be deleted. Submitted applications require approval to cancel."
        );
      }
    } catch (error) {
      console.error("Error deleting leave:", error);
      showError(error.message || "Failed to delete leave application");
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSelectedLeave(null);
      selectedLeaveRef.current = null;
    }
  };

  const handleDownloadAttachment = async (leave) => {
    if (!leave.attachment) return;

    try {
      const blob = await documentsAPI.download(leave.attachment.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = leave.attachment.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess("Document downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      showError("Failed to download document");
    }
  };

  // ---------------------------------------------------------------------------
  // PERMISSION CHECKS
  // ---------------------------------------------------------------------------
  const canEdit = (leave) => {
    return leave.user_id === user.id && leave.approval_status === "draft";
  };

  const canDelete = (leave) => {
    if (!leave || !user) return false;
    // Only allow deletion of own draft applications
    return leave.user_id === user.id && leave.approval_status === "draft";
  };

  // ---------------------------------------------------------------------------
  // RENDER FUNCTIONS
  // ---------------------------------------------------------------------------
  const renderStatusChip = (status) => (
    <Chip
      label={formatStatus(status)}
      color={getStatusColor(status)}
      size="small"
      variant="filled"
    />
  );

  const renderActionMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
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
          <ListItemText>Edit</ListItemText>
        </MenuItem>
      )}

      {selectedLeave && selectedLeave.attachment && (
        <MenuItem onClick={() => handleDownloadAttachment(selectedLeave)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download Attachment</ListItemText>
        </MenuItem>
      )}

      {selectedLeave && canDelete(selectedLeave) && (
        <MenuItem onClick={handleDeleteLeave} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Draft</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ p: 3 }}>
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
          <Typography variant="h4" gutterBottom>
            My Leave Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your leave requests
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
              Showing {filteredLeaves.length} of{" "}
              {getTabFilteredLeaves(0).length} applications
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Leave Table */}
      <Card>
        {filteredLeaves.length === 0 && !loading ? (
          <CardContent>
            <Alert severity="info">
              {searchTerm || typeFilter || statusFilter
                ? "No leave applications match your search criteria."
                : activeTab === 0
                  ? "You haven't applied for any leave yet."
                  : `No ${tabLabels[activeTab].toLowerCase()} found.`}
            </Alert>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied On</TableCell>
                  <TableCell>Attachment</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <CircularProgress size={20} />
                        </TableCell>
                        <TableCell>
                          <CircularProgress size={20} />
                        </TableCell>
                        <TableCell>
                          <CircularProgress size={20} />
                        </TableCell>
                        <TableCell>
                          <CircularProgress size={20} />
                        </TableCell>
                        <TableCell>
                          <CircularProgress size={20} />
                        </TableCell>
                        <TableCell>
                          <CircularProgress size={20} />
                        </TableCell>
                        <TableCell>
                          <CircularProgress size={20} />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredLeaves.map((leave) => (
                      <TableRow key={leave.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {leave.leaveType?.name}
                            </Typography>
                            {leave.comment && (
                              <Tooltip title={leave.comment}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                >
                                  {leave.comment.length > 30
                                    ? `${leave.comment.substring(0, 30)}...`
                                    : leave.comment}
                                </Typography>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(leave.starting_date)} -{" "}
                            {formatDate(leave.end_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {calculateDays(leave.starting_date, leave.end_date)}{" "}
                            day
                            {calculateDays(
                              leave.starting_date,
                              leave.end_date
                            ) !== 1
                              ? "s"
                              : ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(leave.approval_status)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(leave.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {leave.attachment ? (
                            <Tooltip title={leave.attachment.name}>
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadAttachment(leave)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, leave)}
                          >
                            <MoreIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Action Menu */}
      {renderActionMenu()}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !actionLoading && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Leave Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this draft leave application? This
            action cannot be undone.
            {selectedLeave && (
              <>
                <br />
                <br />
                <strong>Leave Details:</strong>
                <br />
                Type: {selectedLeave.leaveType?.name}
                <br />
                Dates: {formatDate(selectedLeave.starting_date)} -{" "}
                {formatDate(selectedLeave.end_date)}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            loading={actionLoading}
            onClick={confirmDeleteLeave}
            startIcon={!actionLoading && <DeleteIcon />}
          >
            Delete Application
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveList;
