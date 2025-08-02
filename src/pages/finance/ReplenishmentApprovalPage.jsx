import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  AttachFile as AttachIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  MonetizationOn as MoneyIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";

// Enhanced Components
import EnhancedDataTable from "../../components/features/finance/EnhancedDataTable";
import QuickActionsToolbar from "../../components/features/finance/QuickActionsToolbar";
import WorkflowTracker from "../../components/features/finance/WorkflowTracker";
import AdvancedFilters from "../../components/features/finance/AdvancedFilters";
import { exportToPDF, exportToCSV } from "../../utils/printExport";
import { pettyCashAPI } from "../../services/api/pettyCash.api";

const ReplenishmentApprovalPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [replenishments, setReplenishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [approvalAction, setApprovalAction] = useState("");

  // Filter state
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchReplenishmentApprovalQueue();
  }, [filters, searchTerm, statusFilter]);

  const fetchReplenishmentApprovalQueue = async () => {
    try {
      setLoading(true);
      const response = await pettyCashAPI.getReplenishmentApprovalQueue({
        search: searchTerm,
        status: statusFilter,
        ...filters,
      });

      console.log("Frontend - User roles:", user.roles);
      console.log(
        "Frontend - Replenishments received:",
        response.data.replenishments
      );
      console.log(
        "Frontend - Replenishment statuses:",
        response.data.replenishments?.map((r) => ({
          id: r.id,
          status: r.status,
        }))
      );

      setReplenishments(response.data.replenishments || []);
    } catch (error) {
      showError(
        error.message || "Failed to fetch replenishment approval queue"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowStatus = async (id) => {
    try {
      const response = await pettyCashAPI.getReplenishmentWorkflowStatus(id);
      setWorkflowStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch workflow status:", error);
    }
  };

  // Approval actions
  const handleApprove = async (item) => {
    setSelectedRequest(item);
    setApprovalAction("approve");
    setApprovalDialogOpen(true);
  };

  const handleReject = async (item) => {
    setSelectedRequest(item);
    setApprovalAction("reject");
    setApprovalDialogOpen(true);
  };

  const handleResubmit = async (item) => {
    try {
      await pettyCashAPI.resubmitReplenishment(item.id);
      showSuccess("Replenishment request resubmitted successfully");
      fetchReplenishmentApprovalQueue();
    } catch (error) {
      showError(error.message || "Failed to resubmit request");
    }
  };

  const confirmApproval = async () => {
    try {
      if (approvalAction === "approve") {
        await pettyCashAPI.approveReplenishment(selectedRequest.id, {
          approved_amount: selectedRequest.amount,
          comments: approvalComments,
        });
        showSuccess("Replenishment request approved successfully");
      } else {
        await pettyCashAPI.rejectReplenishment(selectedRequest.id, {
          rejection_reason: approvalComments,
        });
        showSuccess("Replenishment request rejected");
      }

      setApprovalDialogOpen(false);
      setApprovalComments("");
      setSelectedRequest(null);
      fetchReplenishmentApprovalQueue();
    } catch (error) {
      showError(error.message || `Failed to ${approvalAction} request`);
    }
  };

  // Bulk operations
  const handleBulkAction = async (action, items) => {
    try {
      const promises = items.map((id) => {
        return action === "approve"
          ? pettyCashAPI.approveReplenishment(id, { approved_amount: null })
          : pettyCashAPI.rejectReplenishment(id, {
              rejection_reason: "Bulk rejection",
            });
      });

      await Promise.all(promises);
      showSuccess(
        `${items.length} replenishment requests ${action}d successfully`
      );
      setSelectedItems([]);
      fetchReplenishmentApprovalQueue();
    } catch (error) {
      showError(`Failed to ${action} replenishment requests`);
    }
  };

  // Table columns
  const replenishmentColumns = [
    { field: "date", headerName: "Date", type: "date" },
    { field: "amount", headerName: "Amount", type: "currency" },
    {
      field: "book_name",
      headerName: "Book",
      type: "text",
      valueGetter: (row) => row.pettyCashBook?.book_number || "-",
    },
    {
      field: "requested_by_name",
      headerName: "Requested By",
      type: "text",
      valueGetter: (row) =>
        `${row.requester?.first_name || ""} ${row.requester?.sur_name || ""}`,
    },
    { field: "status", headerName: "Status", type: "status" },
    { field: "urgency", headerName: "Priority", type: "status" },
    {
      field: "current_step",
      headerName: "Current Step",
      type: "text",
      valueGetter: (row) => row.current_step || "Finance Manager Review",
    },
  ];

  const filterOptions = {
    status: [
      { value: "pending", label: "Pending" },
      { value: "submitted", label: "Submitted" },
      { value: "finance_manager_approved", label: "Finance Manager Approved" },
      { value: "admin_approved", label: "Admin Approved" },
      { value: "rejected", label: "Rejected" },
    ],
    dateRange: true,
    urgency: [
      { value: "low", label: "Low" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  };

  const getPendingCounts = () => {
    const userRoles = user.roles || [];
    let pendingReplenishments = 0;

    if (userRoles.includes("Finance Manager")) {
      // Finance Manager sees pending and submitted requests
      pendingReplenishments = replenishments.filter(
        (r) => r.status === "pending" || r.status === "submitted"
      ).length;
    } else if (userRoles.includes("Admin")) {
      // Admin sees finance_manager_approved requests
      pendingReplenishments = replenishments.filter(
        (r) => r.status === "finance_manager_approved"
      ).length;
    }

    return { replenishments: pendingReplenishments };
  };

  const { replenishments: pendingReplenishmentCount } = getPendingCounts();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ color: "#4F78AE", fontWeight: 600, mb: 1 }}
        >
          Replenishment Approvals
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage petty cash replenishment request approvals
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#4F78AE" }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "#4F78AE", fontWeight: 600 }}
                  >
                    {pendingReplenishmentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Replenishments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* Filters */}
          <AdvancedFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={setFilters}
            filterOptions={filterOptions}
          />
          {/* Replenishment Approvals */}
          <Box>
            <QuickActionsToolbar
              selectedItems={selectedItems}
              onBulkApprove={(items) => handleBulkAction("approve", items)}
              onBulkReject={(items) => handleBulkAction("reject", items)}
              onExport={() =>
                exportToCSV(replenishments, "replenishment-approvals")
              }
              showBulkActions={true}
              hideAddNew={true}
            />
            <EnhancedDataTable
              data={replenishments}
              columns={replenishmentColumns}
              loading={loading}
              selectable={true}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              onView={(request) => {
                setSelectedRequest(request);
                setViewDialogOpen(true);
                fetchWorkflowStatus(request.id);
              }}
              actionButtons={[
                {
                  label: "Approve",
                  icon: <ApproveIcon />,
                  color: "success",
                  onClick: (request) => handleApprove(request),
                  show: (request) => {
                    // Finance Manager can approve pending/submitted requests
                    // Admin can approve finance_manager_approved requests
                    const userRoles = user.roles || [];
                    const canShow =
                      (userRoles.includes("Finance Manager") &&
                        (request.status === "pending" ||
                          request.status === "submitted")) ||
                      (userRoles.includes("Admin") &&
                        request.status === "finance_manager_approved");

                    console.log(`Approve button for request ${request.id}:`, {
                      userRoles,
                      requestStatus: request.status,
                      canShow,
                    });

                    return canShow;
                  },
                },
                {
                  label: "Reject",
                  icon: <RejectIcon />,
                  color: "error",
                  onClick: (request) => handleReject(request),
                  show: (request) => {
                    // Finance Manager can reject pending/submitted requests
                    // Admin can reject finance_manager_approved requests
                    const userRoles = user.roles || [];
                    if (userRoles.includes("Finance Manager")) {
                      return (
                        request.status === "pending" ||
                        request.status === "submitted"
                      );
                    } else if (userRoles.includes("Admin")) {
                      return request.status === "finance_manager_approved";
                    }
                    return false;
                  },
                },
                {
                  label: "Resubmit",
                  icon: <EditIcon />,
                  color: "primary",
                  onClick: (request) => handleResubmit(request),
                  show: (request) => {
                    // Only show resubmit for rejected requests by the requester
                    return (
                      request.status === "rejected" &&
                      request.requested_by === user.id
                    );
                  },
                },
              ]}
            />
          </Box>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Replenishment Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount Requested
                </Typography>
                <Typography variant="h6" sx={{ color: "#4F78AE" }}>
                  TZS {selectedRequest.amount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Request Date
                </Typography>
                <Typography variant="body1">
                  {format(parseISO(selectedRequest.date), "dd/MM/yyyy")}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Justification
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.description}
                </Typography>
              </Grid>
              {workflowStatus && (
                <Grid item xs={12}>
                  <WorkflowTracker workflowStatus={workflowStatus} />
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {(() => {
            const userRoles = user.roles || [];
            const canApprove =
              (userRoles.includes("Finance Manager") &&
                (selectedRequest?.status === "pending" ||
                  selectedRequest?.status === "submitted")) ||
              (userRoles.includes("Admin") &&
                selectedRequest?.status === "finance_manager_approved");

            return canApprove ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleApprove(selectedRequest);
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleReject(selectedRequest);
                  }}
                >
                  Reject
                </Button>
              </>
            ) : null;
          })()}
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalAction === "approve" ? "Approve Request" : "Reject Request"}
        </DialogTitle>
        <DialogContent>
          <Alert
            severity={approvalAction === "approve" ? "info" : "warning"}
            sx={{ mb: 2 }}
          >
            {approvalAction === "approve"
              ? "You are about to approve this request. Please add any comments below."
              : "You are about to reject this request. Please provide a reason below."}
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={
              approvalAction === "approve"
                ? "Comments (Optional)"
                : "Rejection Reason"
            }
            value={approvalComments}
            onChange={(e) => setApprovalComments(e.target.value)}
            required={approvalAction === "reject"}
            placeholder={
              approvalAction === "approve"
                ? "Add any additional comments..."
                : "Please provide a reason for rejection..."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={approvalAction === "approve" ? "success" : "error"}
            onClick={confirmApproval}
            disabled={approvalAction === "reject" && !approvalComments.trim()}
            startIcon={
              approvalAction === "approve" ? <ApproveIcon /> : <RejectIcon />
            }
          >
            {approvalAction === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{config?.title}</DialogTitle>
        <DialogContent>
          <Typography>{config?.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {loading && <LoadingSpinner />}
    </Container>
  );
};

export default ReplenishmentApprovalPage;
