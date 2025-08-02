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
  Tabs,
  Tab,
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
  Receipt as ReceiptIcon,
  CheckCircle,
  Cancel,
  Edit as EditIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { PERMISSIONS, ROLES } from "../../constants";
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

const PettyCashExpenseApprovalPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [approvalAction, setApprovalAction] = useState("");

  // Filter state
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchExpenseApprovalQueue();
  }, [filters, searchTerm, statusFilter]);

  const fetchExpenseApprovalQueue = async () => {
    try {
      setLoading(true);
      const response = await pettyCashAPI.getExpenseApprovalQueue({
        search: searchTerm,
        status: statusFilter,
        ...filters,
      });

      setExpenses(response.data.expenses || []);
    } catch (error) {
      showError(error.message || "Failed to fetch expense approval queue");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowStatus = async (id) => {
    try {
      const response = await pettyCashAPI.getExpenseWorkflowStatus(id);
      setWorkflowStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch workflow status:", error);
    }
  };

  // Check user role and permissions
  const isAdmin = hasAnyRole([ROLES.ADMIN]);
  const isFinanceManager = hasAnyRole([ROLES.FINANCE_MANAGER]);
  const canApprove = hasPermission(PERMISSIONS.APPROVE_PETTY_CASH_EXPENSES);

  console.log("User roles and permissions:", {
    userRole: user.role,
    isAdmin,
    isFinanceManager,
    canApprove,
    userPermissions: user.permissions,
    permissionNames:
      user.permissions?.map((p) => (typeof p === "string" ? p : p.name)) || [],
    lookingFor: PERMISSIONS.APPROVE_PETTY_CASH_EXPENSES,
  });

  // Approval actions
  const handleApprove = async (expense) => {
    setSelectedExpense(expense);
    setApprovalAction("approve");
    setApprovalDialogOpen(true);
  };

  const handleReject = async (expense) => {
    setSelectedExpense(expense);
    setApprovalAction("reject");
    setApprovalDialogOpen(true);
  };

  const handleResubmit = async (expense) => {
    try {
      await pettyCashAPI.resubmitExpense(expense.id);
      showSuccess("Expense resubmitted successfully");
      fetchExpenseApprovalQueue();
    } catch (error) {
      showError(error.message || "Failed to resubmit expense");
    }
  };

  const confirmApproval = async () => {
    try {
      console.log("Confirm approval - User role:", {
        isAdmin,
        isFinanceManager,
        user: user.role,
      });

      if (approvalAction === "approve") {
        const approvalData = {
          comments: approvalComments,
          approved_by_role: isAdmin ? "admin" : "finance_manager",
        };
        console.log("Approval data:", approvalData);

        await pettyCashAPI.approveExpense(selectedExpense.id, approvalData);
        showSuccess("Expense approved successfully");
      } else {
        const rejectionData = {
          rejection_reason: approvalComments,
          rejected_by_role: isAdmin ? "admin" : "finance_manager",
        };
        console.log("Rejection data:", rejectionData);

        await pettyCashAPI.rejectExpense(selectedExpense.id, rejectionData);
        showSuccess("Expense rejected");
      }

      setApprovalDialogOpen(false);
      setApprovalComments("");
      setSelectedExpense(null);
      fetchExpenseApprovalQueue();
    } catch (error) {
      showError(error.message || `Failed to ${approvalAction} expense`);
    }
  };

  // Bulk operations
  const handleBulkAction = async (action, items) => {
    try {
      const promises = items.map((id) => {
        return action === "approve"
          ? pettyCashAPI.approveExpense(id, {
              approved_by_role: isAdmin ? "admin" : "finance_manager",
            })
          : pettyCashAPI.rejectExpense(id, {
              rejection_reason: "Bulk rejection",
              rejected_by_role: isAdmin ? "admin" : "finance_manager",
            });
      });

      await Promise.all(promises);
      showSuccess(`${items.length} expenses ${action}d successfully`);
      setSelectedItems([]);
      fetchExpenseApprovalQueue();
    } catch (error) {
      showError(`Failed to ${action} expenses`);
    }
  };

  // Table columns
  const expenseColumns = [
    { field: "date", headerName: "Date", type: "date" },
    { field: "amount", headerName: "Amount", type: "currency" },
    { field: "description", headerName: "Description", type: "text" },
    { field: "category", headerName: "Category", type: "status" },
    {
      field: "created_by_name",
      headerName: "Created By",
      type: "text",
      valueGetter: (row) =>
        `${row.creator?.first_name || ""} ${row.creator?.sur_name || ""}`,
    },
    { field: "status", headerName: "Status", type: "status" },
    {
      field: "current_step",
      headerName: "Current Step",
      type: "text",
      valueGetter: (row) => {
        if (row.status === "pending") return "Finance Manager Review";
        if (row.status === "finance_manager_approved") return "Admin Review";
        if (row.status === "admin_approved") return "Approved";
        if (row.status === "rejected") return "Rejected";
        return "Unknown";
      },
    },
    {
      field: "book_number",
      headerName: "Petty Cash Book",
      type: "text",
      valueGetter: (row) => row.pettyCashBook?.book_number || "-",
    },
  ];

  const filterOptions = {
    status: [
      { value: "pending", label: "Pending" },
      { value: "finance_manager_approved", label: "Finance Manager Approved" },
      { value: "admin_approved", label: "Admin Approved" },
      { value: "rejected", label: "Rejected" },
    ],
    dateRange: true,
    category: [
      { value: "office_supplies", label: "Office Supplies" },
      { value: "transportation", label: "Transportation" },
      { value: "refreshments", label: "Refreshments" },
      { value: "communication", label: "Communication" },
      { value: "utilities", label: "Utilities" },
      { value: "maintenance", label: "Maintenance" },
      { value: "miscellaneous", label: "Miscellaneous" },
    ],
  };

  const getPendingCounts = () => {
    const pendingExpenses = expenses.filter(
      (e) => e.status === "pending" || e.status === "finance_manager_approved"
    ).length;

    const rejectedExpenses = expenses.filter(
      (e) => e.status === "rejected"
    ).length;

    const approvedExpenses = expenses.filter(
      (e) => e.status === "admin_approved"
    ).length;

    return {
      pending: pendingExpenses,
      rejected: rejectedExpenses,
      approved: approvedExpenses,
    };
  };

  const { pending, rejected, approved } = getPendingCounts();

  // Filter expenses based on user role
  const getFilteredExpenses = () => {
    if (isAdmin) {
      // Admin can see all expenses that need admin approval or are pending
      return expenses.filter(
        (expense) =>
          expense.status === "finance_manager_approved" ||
          expense.status === "pending"
      );
    } else if (isFinanceManager) {
      // Finance Manager can see expenses that need finance manager approval
      return expenses.filter((expense) => expense.status === "pending");
    }
    return expenses;
  };

  const filteredExpenses = getFilteredExpenses();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ color: "#4F78AE", fontWeight: 600, mb: 1 }}
        >
          Petty Cash Expense Approvals
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Review and approve petty cash expenses
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
                    {pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#4CAF50" }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "#4CAF50", fontWeight: 600 }}
                  >
                    {approved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#f44336" }}>
                  <Cancel />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "#f44336", fontWeight: 600 }}
                  >
                    {rejected}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#C2895A" }}>
                  <ReceiptIcon />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "#C2895A", fontWeight: 600 }}
                  >
                    {filteredExpenses.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total in Queue
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

          {/* Data Table */}
          <Box sx={{ mt: 2 }}>
            <QuickActionsToolbar
              selectedItems={selectedItems}
              onBulkApprove={(items) => handleBulkAction("approve", items)}
              onBulkReject={(items) => handleBulkAction("reject", items)}
              onExport={() =>
                exportToCSV(filteredExpenses, "expense-approvals")
              }
              showBulkActions={canApprove}
              hideAddNew={true}
            />
            <EnhancedDataTable
              data={filteredExpenses}
              columns={expenseColumns}
              loading={loading}
              selectable={canApprove}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              onView={(expense) => {
                setSelectedExpense(expense);
                setViewDialogOpen(true);
                fetchWorkflowStatus(expense.id);
              }}
              actionButtons={[
                {
                  label: "Approve",
                  icon: <ApproveIcon />,
                  color: "success",
                  onClick: (expense) => handleApprove(expense),
                  show: (expense) => {
                    console.log("Approve button show check:", {
                      canApprove,
                      isAdmin,
                      isFinanceManager,
                      expenseStatus: expense.status,
                      userRole: user.role,
                    });
                    if (!canApprove) return false;
                    if (isAdmin) {
                      return expense.status === "finance_manager_approved";
                    }
                    if (isFinanceManager) {
                      return expense.status === "pending";
                    }
                    return false;
                  },
                },
                {
                  label: "Reject",
                  icon: <RejectIcon />,
                  color: "error",
                  onClick: (expense) => handleReject(expense),
                  show: (expense) => {
                    console.log("Reject button show check:", {
                      canApprove,
                      isAdmin,
                      isFinanceManager,
                      expenseStatus: expense.status,
                      userRole: user.role,
                    });
                    if (!canApprove) return false;
                    if (isAdmin) {
                      return expense.status === "finance_manager_approved";
                    }
                    if (isFinanceManager) {
                      return expense.status === "pending";
                    }
                    return false;
                  },
                },
                {
                  label: "Resubmit",
                  icon: <EditIcon />,
                  color: "primary",
                  onClick: (expense) => handleResubmit(expense),
                  show: (expense) => {
                    // Only show resubmit for rejected expenses by the creator
                    return (
                      expense.status === "rejected" &&
                      expense.created_by === user.id
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
        <DialogTitle>Expense Details</DialogTitle>
        <DialogContent>
          {selectedExpense && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="h6" sx={{ color: "#4F78AE" }}>
                  TZS {selectedExpense.amount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Chip label={selectedExpense.category} size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {format(parseISO(selectedExpense.date), "dd/MM/yyyy")}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedExpense.status.replace("_", " ").toUpperCase()}
                  size="small"
                  color={
                    selectedExpense.status === "approved"
                      ? "success"
                      : selectedExpense.status === "rejected"
                        ? "error"
                        : selectedExpense.status === "pending"
                          ? "warning"
                          : "default"
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedExpense.description}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1">
                  {selectedExpense.created_by_name}
                </Typography>
              </Grid>
              {workflowStatus && (
                <Grid item xs={12}>
                  <WorkflowTracker workflowStatus={workflowStatus} />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedExpense && canApprove && (
            <>
              {((isAdmin &&
                selectedExpense.status === "finance_manager_approved") ||
                (isFinanceManager && selectedExpense.status === "pending")) && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleApprove(selectedExpense);
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
                      handleReject(selectedExpense);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </>
          )}
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
          {approvalAction === "approve" ? "Approve Expense" : "Reject Expense"}
        </DialogTitle>
        <DialogContent>
          <Alert
            severity={approvalAction === "approve" ? "info" : "warning"}
            sx={{ mb: 2 }}
          >
            {approvalAction === "approve"
              ? "You are about to approve this expense. Please add any comments below."
              : "You are about to reject this expense. Please provide a reason below."}
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

export default PettyCashExpenseApprovalPage;
