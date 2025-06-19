import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalAtm as CashIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
  TrendingDown as ExpenseIcon,
  TrendingUp as ReplenishIcon,
  Warning as WarningIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  MoneyOff as MoneyOffIcon,
  AddCard as AddCardIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";

const PettyCashPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [pettyCashBooks, setPettyCashBooks] = useState([]);
  const [pettyCashExpenses, setPettyCashExpenses] = useState([]);
  const [replenishmentRequests, setReplenishmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [replenishDialogOpen, setReplenishDialogOpen] = useState(false);
  const [cashSummary, setCashSummary] = useState({
    totalFloat: 0,
    currentBalance: 0,
    totalExpenses: 0,
    pendingReplenishment: 0,
    lowBalanceAlert: false,
  });

  // Sample petty cash data
  const samplePettyCashBooks = [
    {
      id: 1,
      book_number: "PCB-2024-001",
      custodian_name: "Admin Assistant",
      custodian_id: 1,
      opening_balance: 500000,
      current_balance: 150000,
      period: "2024-06",
      status: "active",
      created_at: "2024-06-01",
      last_replenishment: "2024-06-01",
      replenishment_amount: 500000,
    },
    {
      id: 2,
      book_number: "PCB-2024-002",
      custodian_name: "Finance Officer",
      custodian_id: 2,
      opening_balance: 300000,
      current_balance: 80000,
      total_expenses: 220000,
      period: "2024-06",
      status: "low_balance",
      created_at: "2024-06-01",
      last_replenishment: "2024-05-15",
      replenishment_amount: 300000,
    },
  ];

  const sampleExpenses = [
    {
      id: 1,
      petty_cash_book_id: 1,
      expense_date: "2024-06-15",
      description: "Office stationery and supplies",
      amount: 45000,
      category: "Office Supplies",
      receipt_number: "RCP-001",
      vendor: "Stationery Plus",
      created_by: "Admin Assistant",
      approved: true,
    },
    {
      id: 2,
      petty_cash_book_id: 1,
      expense_date: "2024-06-16",
      description: "Fuel for generator",
      amount: 85000,
      category: "Utilities",
      receipt_number: "RCP-002",
      vendor: "Total Tanzania",
      created_by: "Admin Assistant",
      approved: true,
    },
  ];

  const sampleReplenishments = [
    {
      id: 1,
      petty_cash_book_id: 2,
      request_amount: 200000,
      reason: "Monthly replenishment - balance below threshold",
      requested_by: "Finance Officer",
      request_date: "2024-06-18",
      status: "pending",
      approved_by: null,
      approval_date: null,
    },
  ];

  useEffect(() => {
    fetchPettyCashData();
    calculateSummary();
  }, [periodFilter]);

  const fetchPettyCashData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPettyCashBooks(samplePettyCashBooks);
      setPettyCashExpenses(sampleExpenses);
      setReplenishmentRequests(sampleReplenishments);
    } catch (error) {
      showError("Failed to fetch petty cash data");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const summary = pettyCashBooks.reduce(
      (acc, book) => {
        acc.totalFloat += book.opening_balance;
        acc.currentBalance += book.current_balance;
        acc.totalExpenses += book.total_expenses;

        if (book.current_balance < book.opening_balance * 0.2) {
          acc.lowBalanceAlert = true;
        }

        return acc;
      },
      {
        totalFloat: 0,
        currentBalance: 0,
        totalExpenses: 0,
        pendingReplenishment: replenishmentRequests
          .filter((r) => r.status === "pending")
          .reduce((sum, r) => sum + r.request_amount, 0),
        lowBalanceAlert: false,
      }
    );

    setCashSummary(summary);
  };

  const handleAddExpense = () => {
    setExpenseDialogOpen(true);
  };

  const handleRequestReplenishment = () => {
    setReplenishDialogOpen(true);
  };

  const handleApproveReplenishment = async (requestId) => {
    openDialog({
      title: "Approve Replenishment",
      message: "Are you sure you want to approve this replenishment request?",
      onConfirm: async () => {
        try {
          // API call to approve replenishment
          showSuccess("Replenishment approved successfully");
          fetchPettyCashData();
        } catch (error) {
          showError("Failed to approve replenishment");
        }
      },
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBalanceColor = (current, opening) => {
    const percentage = (current / opening) * 100;
    if (percentage <= 20) return "error";
    if (percentage <= 50) return "warning";
    return "success";
  };

  const summaryCards = [
    {
      title: "Total Float",
      value: formatCurrency(cashSummary.totalFloat),
      icon: <WalletIcon />,
      color: "primary",
    },
    {
      title: "Current Balance",
      value: formatCurrency(cashSummary.currentBalance),
      icon: <CashIcon />,
      color: cashSummary.lowBalanceAlert ? "error" : "success",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(cashSummary.totalExpenses),
      icon: <ExpenseIcon />,
      color: "info",
    },
    {
      title: "Pending Replenishment",
      value: formatCurrency(cashSummary.pendingReplenishment),
      icon: <ReplenishIcon />,
      color: "warning",
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Petty Cash Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor and manage petty cash expenses and replenishments
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {hasPermission(PERMISSIONS.CREATE_PETTY_CASH_ENTRY) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddExpense}
              >
                Add Expense
              </Button>
            )}
            {hasPermission(PERMISSIONS.REQUEST_REPLENISHMENT) && (
              <Button
                variant="outlined"
                startIcon={<ReplenishIcon />}
                onClick={handleRequestReplenishment}
              >
                Request Replenishment
              </Button>
            )}
          </Box>
        </Box>

        {/* Alert for Low Balance */}
        {cashSummary.lowBalanceAlert && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Low Balance Alert:</strong> One or more petty cash books
              have balance below 20% of opening amount. Consider requesting
              replenishment.
            </Typography>
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="h6" component="div">
                        {card.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                    </Box>
                    <Box sx={{ color: `${card.color}.main` }}>{card.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Petty Cash Books" />
            <Tab label="Recent Expenses" />
            <Tab label="Replenishment Requests" />
          </Tabs>
        </Card>

        {/* Tab Content */}
        <Card>
          <CardContent>
            {activeTab === 0 && (
              // Petty Cash Books Tab
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Book Number</TableCell>
                      <TableCell>Custodian</TableCell>
                      <TableCell>Opening Balance</TableCell>
                      <TableCell>Current Balance</TableCell>
                      <TableCell>Total Expenses</TableCell>
                      <TableCell>Balance %</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pettyCashBooks.map((book) => {
                      const balancePercentage =
                        (book.current_balance / book.opening_balance) * 100;
                      return (
                        <TableRow key={book.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {book.book_number}
                            </Typography>
                          </TableCell>
                          <TableCell>{book.custodian_name}</TableCell>
                          <TableCell>
                            {formatCurrency(book.opening_balance)}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color={getBalanceColor(
                                book.current_balance,
                                book.opening_balance
                              )}
                              fontWeight="medium"
                            >
                              {formatCurrency(book.current_balance)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(book.total_expenses)}
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={balancePercentage}
                                color={getBalanceColor(
                                  book.current_balance,
                                  book.opening_balance
                                )}
                                sx={{ width: 60, height: 6 }}
                              />
                              <Typography variant="caption">
                                {balancePercentage.toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={book.status.replace("_", " ")}
                              color={
                                book.status === "active" ? "success" : "warning"
                              }
                              size="small"
                              sx={{ textTransform: "capitalize" }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/finance/petty-cash/${book.id}`)
                              }
                            >
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 1 && (
              // Recent Expenses Tab
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Vendor</TableCell>
                      <TableCell>Receipt #</TableCell>
                      <TableCell>Created By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pettyCashExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {format(new Date(expense.expense_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <Chip label={expense.category} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(expense.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>{expense.vendor}</TableCell>
                        <TableCell>{expense.receipt_number}</TableCell>
                        <TableCell>{expense.created_by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 2 && (
              // Replenishment Requests Tab
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Request Date</TableCell>
                      <TableCell>Requested By</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {replenishmentRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {format(new Date(request.request_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>{request.requested_by}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(request.request_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={
                              request.status === "pending"
                                ? "warning"
                                : "success"
                            }
                            size="small"
                            sx={{ textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell>
                          {hasPermission(PERMISSIONS.APPROVE_REPLENISHMENT) &&
                            request.status === "pending" && (
                              <Button
                                size="small"
                                startIcon={<ApprovedIcon />}
                                onClick={() =>
                                  handleApproveReplenishment(request.id)
                                }
                              >
                                Approve
                              </Button>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default PettyCashPage;
