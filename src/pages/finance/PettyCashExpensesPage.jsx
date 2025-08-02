import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  CircularProgress,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  AccountBalance as PettyCashIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as MoneyIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Business as VendorIcon,
  Category as CategoryIcon,
  DateRange as DateIcon,
  AttachFile as AttachmentIcon,
  PhotoCamera as PhotoIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalanceWallet as WalletIcon,
  CreditCard as ExpenseCardIcon,
  RequestQuote as RequestIcon,
  Notifications as AlertIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, startOfMonth, endOfMonth, parseISO, isValid } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
import { pettyCashAPI } from "../../services/api/pettyCash.api";

// ==================== CONSTANTS & STATIC DATA ====================

const EXPENSE_CATEGORIES = [
  { value: "office_supplies", label: "Office Supplies", color: "primary" },
  { value: "transportation", label: "Transportation", color: "success" },
  { value: "refreshments", label: "Refreshments", color: "warning" },
  { value: "communication", label: "Communication", color: "info" },
  { value: "utilities", label: "Utilities", color: "secondary" },
  { value: "maintenance", label: "Maintenance", color: "error" },
  { value: "miscellaneous", label: "Miscellaneous", color: "default" },
];

const EXPENSE_STATUSES = [
  { value: "draft", label: "Draft", color: "info", icon: <SaveIcon /> },
  {
    value: "pending",
    label: "Pending Review",
    color: "warning",
    icon: <PendingIcon />,
  },
  {
    value: "finance_manager_approved",
    label: "Finance Manager Approved",
    color: "info",
    icon: <ApprovedIcon />,
  },
  {
    value: "admin_approved",
    label: "Approved",
    color: "success",
    icon: <ApprovedIcon />,
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "error",
    icon: <RejectedIcon />,
  },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "mobile_money", label: "Mobile Money" },
];

// ==================== MAIN COMPONENT ====================

const PettyCashExpensesPage = () => {
  // ==================== HOOKS & SETUP ====================
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pettyCashBookId = searchParams.get("bookId");
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // ==================== STATE MANAGEMENT ====================
  const [expenses, setExpenses] = useState([]);
  const [pettyCashBooks, setPettyCashBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedBookId, setSelectedBookId] = useState(pettyCashBookId || "");
  const [dateFilter, setDateFilter] = useState("current_month");
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());

  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replenishDialogOpen, setReplenishDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    petty_cash_book_id: pettyCashBookId || "",
    expense_date: new Date(),
    category: "",
    description: "",
    amount: "",
    vendor_name: "",
    receipt_number: "",
    payment_method: "cash",
    requested_by: user?.id || "",
    approved_by: "",
    status: "draft",
    notes: "",
    receipt_document_id: null,
  });

  // Submission type state
  const [submitType, setSubmitType] = useState("draft");

  // ==================== COMPUTED VALUES ====================

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Expenses",
      value: `TZS ${expenses.reduce((sum, exp) => sum + (exp.status === "admin_approved" ? exp.amount : 0), 0).toLocaleString()}`,
      subtitle: "This month",
      icon: <ExpenseIcon />,
      color: "error",
    },
    {
      title: "Draft Expenses",
      value: expenses.filter((exp) => exp.status === "draft").length.toString(),
      subtitle: "Saved as drafts",
      icon: <SaveIcon />,
      color: "info",
    },
    {
      title: "Pending Approval",
      value: expenses
        .filter(
          (exp) =>
            exp.status === "pending" ||
            exp.status === "finance_manager_approved"
        )
        .length.toString(),
      subtitle: "Awaiting approval",
      icon: <PendingIcon />,
      color: "warning",
    },
    {
      title: "Available Balance",
      value: `TZS ${pettyCashBooks.reduce((sum, book) => sum + book.current_balance, 0).toLocaleString()}`,
      subtitle: "Across all books",
      icon: <WalletIcon />,
      color: "success",
    },
    {
      title: "Expenses Today",
      value: expenses
        .filter((exp) => {
          const date = parseISO(exp.expense_date);
          return (
            isValid(date) &&
            format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
          );
        })
        .length.toString(),
      subtitle: "Today's transactions",
      icon: <ReceiptIcon />,
      color: "primary",
    },
  ];

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || expense.status === statusFilter;
    const matchesCategory =
      !categoryFilter || expense.category === categoryFilter;
    const matchesBook =
      !selectedBookId ||
      expense.petty_cash_book_id.toString() === selectedBookId;

    return matchesSearch && matchesStatus && matchesCategory && matchesBook;
  });

  // Calculate category totals
  const categoryTotals = EXPENSE_CATEGORIES.map((category) => {
    const categoryExpenses = filteredExpenses.filter(
      (exp) =>
        exp.category === category.label && exp.status === "admin_approved"
    );
    const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      ...category,
      total,
      count: categoryExpenses.length,
    };
  }).filter((cat) => cat.total > 0);

  // DataGrid columns
  const columns = [
    {
      field: "expense_date",
      headerName: "Date",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {isValid(new Date(params.value))
            ? format(new Date(params.value), "dd/MM/yyyy")
            : "N/A"}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.book_name}
          </Typography>
        </Box>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.row.category_color}
          variant="outlined"
          icon={<CategoryIcon />}
        />
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "vendor_name",
      headerName: "Vendor",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <VendorIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "requested_by",
      headerName: "Requested By",
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const status = EXPENSE_STATUSES.find((s) => s.value === params.value);
        return (
          <Chip
            label={status?.label}
            size="small"
            color={status?.color}
            variant="filled"
            icon={status?.icon}
          />
        );
      },
    },
    {
      field: "receipt_attached",
      headerName: "Receipt",
      width: 100,
      renderCell: (params) => (
        <Tooltip title={params.value ? "Receipt attached" : "No receipt"}>
          <Badge color={params.value ? "success" : "error"} variant="dot">
            <ReceiptIcon color={params.value ? "success" : "disabled"} />
          </Badge>
        </Tooltip>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            setSelectedExpense(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // ==================== API FUNCTIONS ====================

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await pettyCashAPI.getAllExpenses({
        page: 1,
        limit: 50,
        petty_cash_book_id: selectedBookId,
        start_date: startOfMonth(selectedPeriod).toISOString().split("T")[0],
        end_date: endOfMonth(selectedPeriod).toISOString().split("T")[0],
        search: searchTerm,
      });
      setExpenses(response.data.expenses || []);
    } catch (error) {
      showError(error.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchPettyCashBooks = async () => {
    try {
      console.log("Fetching petty cash books..."); // Debug log
      const response = await pettyCashAPI.getAllBooks({
        status: "active",
      });

      console.log("API Response:", response); // Debug log

      // Handle different possible response structures
      const books = response.data?.books || response.data || response || [];

      console.log("Processed books:", books); // Debug log

      setPettyCashBooks(books);

      if (books.length === 0) {
        console.warn("No petty cash books found");
        showError(
          "No active petty cash books found. Please create a petty cash book first."
        );
      }
    } catch (error) {
      console.error("Failed to fetch petty cash books:", error); // Better error logging
      showError(`Failed to fetch petty cash books: ${error.message}`);
    }
  };

  // ==================== EVENT HANDLERS ====================

  const handleSubmit = async () => {
    try {
      const expenseData = {
        petty_cash_book_id: formData.petty_cash_book_id,
        date: formData.expense_date.toISOString().split("T")[0],
        description: formData.description,
        amount: parseFloat(formData.amount),
        receipt_document_id: formData.receipt_document_id || null,
        save_as_draft: submitType === "draft",
        submit: submitType === "submit",
      };

      console.log("Submitting expense data:", expenseData); // Debug log

      if (editingExpense) {
        await pettyCashAPI.updateExpense(editingExpense.id, expenseData);
        const message =
          submitType === "draft"
            ? "Expense saved as draft successfully"
            : "Expense submitted successfully";
        showSuccess(message);
      } else {
        await pettyCashAPI.createExpense(expenseData);
        const message =
          submitType === "draft"
            ? "Expense saved as draft successfully"
            : "Expense submitted successfully";
        showSuccess(message);
      }

      setDialogOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      showError(error.message || "Failed to save expense");
    }
  };

  const resetForm = () => {
    setFormData({
      petty_cash_book_id: pettyCashBookId || "",
      expense_date: new Date(),
      category: "",
      description: "",
      amount: "",
      vendor_name: "",
      receipt_number: "",
      payment_method: "cash",
      requested_by: user?.id || "",
      approved_by: "",
      status: "draft",
      notes: "",
      receipt_document_id: null,
    });
    setEditingExpense(null);
    setActiveStep(0);
    setSubmitType("draft");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    await fetchPettyCashBooks();
    setRefreshing(false);
    showSuccess("Data refreshed successfully");
  };

  const handleApprove = async (expense) => {
    try {
      // await pettyCashAPI.approveExpense(expense.id);
      showSuccess("Expense approved successfully");
      fetchExpenses();
    } catch (error) {
      showError("Failed to approve expense");
    }
    setAnchorEl(null);
  };

  const handleReject = async (expense) => {
    try {
      // await pettyCashAPI.rejectExpense(expense.id);
      showSuccess("Expense rejected");
      fetchExpenses();
    } catch (error) {
      showError("Failed to reject expense");
    }
    setAnchorEl(null);
  };

  const handleEdit = (expense) => {
    setFormData({
      ...expense,
      expense_date: new Date(expense.expense_date),
    });
    setEditingExpense(expense);
    setSubmitType("draft"); // Default to draft when editing
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDelete = async (expense) => {
    openDialog({
      title: "Confirm Delete",
      message: `Are you sure you want to delete this expense: ${expense.description}?`,
      onConfirm: async () => {
        try {
          await pettyCashAPI.deleteExpense(expense.id);
          showSuccess("Expense deleted successfully");
          fetchExpenses();
        } catch (error) {
          showError(error.message || "Failed to delete expense");
        }
      },
    });
  };

  const handleResubmit = async (expense) => {
    try {
      await pettyCashAPI.resubmitExpense(expense.id);
      showSuccess("Expense resubmitted successfully");
      fetchExpenses();
    } catch (error) {
      showError(error.message || "Failed to resubmit expense");
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchExpenses();
    fetchPettyCashBooks();
  }, [selectedPeriod, selectedBookId]);

  // ==================== RENDER HELPERS ====================

  const renderHeader = () => (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h4">Petty Cash Expenses</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={
              refreshing ? <CircularProgress size={16} /> : <RefreshIcon />
            }
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RequestIcon />}
            onClick={() => setReplenishDialogOpen(true)}
          >
            Request Replenishment
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReportIcon />}
            onClick={() => navigate("/reports/finance")}
          >
            Reports
          </Button>
          {/* {hasPermission(PERMISSIONS.CREATE_PETTY_CASH_ENTRY) && ( */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Record Expense
          </Button>
          {/* // )} */}
        </Box>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Track and manage petty cash expenses with approval workflow
      </Typography>
    </Box>
  );

  const renderSummaryCards = () => (
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
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </Box>
                <Box sx={{ color: `${card.color}.main` }}>{card.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderPettyCashBooksOverview = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Petty Cash Books Status
        </Typography>
        <Grid container spacing={3}>
          {pettyCashBooks.map((book) => (
            <Grid item xs={12} md={6} key={book.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <PettyCashIcon color="primary" />
                    <Typography variant="h6">{book.book_name}</Typography>
                    <Chip
                      label={book.status}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Current Balance
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        TZS {book.current_balance.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Expenses
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        TZS {book.total_expenses.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Custodian
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{ width: 20, height: 20, fontSize: "0.7rem" }}
                        >
                          {(book.custodian?.name || book.custodian || "")
                            .toString()
                            .charAt(0) || "?"}
                        </Avatar>
                        <Typography variant="body2">
                          {book.custodian?.first_name
                            ? `${book.custodian.first_name} ${book.custodian.sur_name || ""}`.trim()
                            : book.custodian || "Unknown"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Last Replenishment
                      </Typography>
                      <Typography variant="body2">
                        {book.last_replenishment
                          ? format(
                              new Date(book.last_replenishment),
                              "dd/MM/yyyy"
                            )
                          : "Not available"}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(book.total_expenses / book.opening_balance) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                      color={
                        book.current_balance / book.opening_balance < 0.2
                          ? "error"
                          : "primary"
                      }
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {(
                        ((book.opening_balance - book.current_balance) /
                          book.opening_balance) *
                        100
                      ).toFixed(1)}
                      % utilized
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderFilters = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Petty Cash Book</InputLabel>
            <Select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              label="Petty Cash Book"
            >
              <MenuItem value="">All Books</MenuItem>
              {pettyCashBooks.map((book) => (
                <MenuItem key={book.id} value={book.id.toString()}>
                  {book.book_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Statuses</MenuItem>
              {EXPENSE_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {EXPENSE_CATEGORIES.map((category) => (
                <MenuItem key={category.value} value={category.label}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <DatePicker
            label="Period"
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            views={["year", "month"]}
            slotProps={{
              textField: { size: "small", fullWidth: true },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderExpenseRecordsTab = () => (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredExpenses}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          getRowHeight={() => "auto"}
          sx={{
            "& .MuiDataGrid-cell": {
              py: 1,
            },
          }}
        />
      </Box>
    </Box>
  );

  const renderCategoryAnalysisTab = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Expenses by Category
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="center">Count</TableCell>
                      <TableCell align="right">Total Amount</TableCell>
                      <TableCell align="right">Average</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryTotals.map((category) => {
                      const totalExpenses = categoryTotals.reduce(
                        (sum, cat) => sum + cat.total,
                        0
                      );
                      const percentage = (category.total / totalExpenses) * 100;
                      const average = category.total / category.count;

                      return (
                        <TableRow key={category.value}>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Chip
                                label={category.label}
                                size="small"
                                color={category.color}
                                variant="outlined"
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">{category.count}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              TZS {category.total.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              TZS {average.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{ width: 60, height: 6 }}
                                color={category.color}
                              />
                              <Typography variant="caption">
                                {percentage.toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Monthly Trend
              </Typography>
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Monthly expense trend chart will be displayed here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderApprovalQueueTab = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Pending Approvals
      </Typography>
      {filteredExpenses
        .filter((exp) => exp.status === "pending")
        .map((expense) => (
          <Card key={expense.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "warning.main" }}>
                      <PendingIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {expense.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {expense.category} • TZS{" "}
                        {expense.amount.toLocaleString()} •{" "}
                        {expense.vendor_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Requested by {expense.requested_by} on{" "}
                        {format(new Date(expense.expense_date), "dd/MM/yyyy")}
                      </Typography>
                    </Box>
                  </Box>
                  {expense.notes && (
                    <Box
                      sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}
                    >
                      <Typography variant="body2">
                        <strong>Notes:</strong> {expense.notes}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                  >
                    {hasPermission(PERMISSIONS.APPROVE_EXPENSES) && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ApprovedIcon />}
                          onClick={() => handleApprove(expense)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<RejectedIcon />}
                          onClick={() => handleReject(expense)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <IconButton
                      onClick={() => {
                        setSelectedExpense(expense);
                        setViewDialogOpen(true);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

      {filteredExpenses.filter((exp) => exp.status === "pending").length ===
        0 && (
        <Alert severity="info">
          <Typography variant="body2">
            No pending expenses requiring approval.
          </Typography>
        </Alert>
      )}
    </Box>
  );

  const renderReportsTab = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Expense Summary Report
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <ApprovedIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <MUIListItemText
                    primary="Approved Expenses"
                    secondary={`${filteredExpenses.filter((exp) => exp.status === "admin_approved").length} transactions • TZS ${filteredExpenses
                      .filter((exp) => exp.status === "admin_approved")
                      .reduce((sum, exp) => sum + exp.amount, 0)
                      .toLocaleString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "warning.main" }}>
                      <PendingIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <MUIListItemText
                    primary="Pending Expenses"
                    secondary={`${filteredExpenses.filter((exp) => exp.status === "pending").length} transactions • TZS ${filteredExpenses
                      .filter((exp) => exp.status === "pending")
                      .reduce((sum, exp) => sum + exp.amount, 0)
                      .toLocaleString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "error.main" }}>
                      <RejectedIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <MUIListItemText
                    primary="Rejected Expenses"
                    secondary={`${filteredExpenses.filter((exp) => exp.status === "rejected").length} transactions • TZS ${filteredExpenses
                      .filter((exp) => exp.status === "rejected")
                      .reduce((sum, exp) => sum + exp.amount, 0)
                      .toLocaleString()}`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    /* Export monthly report */
                  }}
                >
                  Export Monthly Report
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => {
                    /* Print expense summary */
                  }}
                >
                  Print Expense Summary
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ReceiptIcon />}
                  onClick={() => {
                    /* Generate receipt summary */
                  }}
                >
                  Receipt Summary
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => {
                    /* View expense history */
                  }}
                >
                  View Expense History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderMainContent = () => (
    <Card>
      <CardContent>
        {renderFilters()}

        {/* Content Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Expense Records" />
          <Tab label="Category Analysis" />
          <Tab label="Approval Queue" />
          <Tab label="Reports" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && renderExpenseRecordsTab()}
        {activeTab === 1 && renderCategoryAnalysisTab()}
        {activeTab === 2 && renderApprovalQueueTab()}
        {activeTab === 3 && renderReportsTab()}
      </CardContent>
    </Card>
  );

  const renderActionMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
    >
      <MenuItem
        onClick={() => {
          setViewDialogOpen(true);
          setAnchorEl(null);
        }}
      >
        <ListItemIcon>
          <ViewIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>View Details</ListItemText>
      </MenuItem>
      {hasPermission(PERMISSIONS.CREATE_PETTY_CASH_ENTRY) &&
        selectedExpense?.status === "draft" && (
          <MenuItem onClick={() => handleEdit(selectedExpense)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Expense</ListItemText>
          </MenuItem>
        )}
      {selectedExpense?.status === "rejected" &&
        selectedExpense?.created_by === user.id && (
          <MenuItem onClick={() => handleResubmit(selectedExpense)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Resubmit</ListItemText>
          </MenuItem>
        )}
      {selectedExpense?.status === "pending" &&
        hasPermission(PERMISSIONS.APPROVE_EXPENSES) && (
          <>
            <Divider />
            <MenuItem onClick={() => handleApprove(selectedExpense)}>
              <ListItemIcon>
                <ApprovedIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Approve</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleReject(selectedExpense)}>
              <ListItemIcon>
                <RejectedIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Reject</ListItemText>
            </MenuItem>
          </>
        )}
      <Divider />
      <MenuItem
        onClick={() => {
          /* Print receipt */
        }}
      >
        <ListItemIcon>
          <PrintIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Print Receipt</ListItemText>
      </MenuItem>
      {hasPermission(PERMISSIONS.CREATE_PETTY_CASH_ENTRY) &&
        selectedExpense?.status === "draft" && (
          <MenuItem
            onClick={() => handleDelete(selectedExpense)}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
    </Menu>
  );

  const renderExpenseFormStep1 = () => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Petty Cash Book</InputLabel>
          <Select
            value={formData.petty_cash_book_id}
            onChange={(e) =>
              setFormData({ ...formData, petty_cash_book_id: e.target.value })
            }
            label="Petty Cash Book"
            required
          >
            {pettyCashBooks.map((book) => (
              <MenuItem key={book.id} value={book.id}>
                {book.book_number} (TZS {book.current_balance})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <DatePicker
          label="Expense Date"
          value={formData.expense_date}
          onChange={(date) => setFormData({ ...formData, expense_date: date })}
          slotProps={{
            textField: { fullWidth: true, required: true },
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            label="Category"
            required
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <MenuItem key={category.value} value={category.label}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Amount (TZS)"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          placeholder="Brief description of the expense"
        />
      </Grid>
    </Grid>
  );

  const renderExpenseFormStep2 = () => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Vendor Name (Optional)"
          value={formData.vendor_name}
          onChange={(e) =>
            setFormData({ ...formData, vendor_name: e.target.value })
          }
          placeholder="Enter vendor name if applicable"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Receipt Number (Optional)"
          value={formData.receipt_number}
          onChange={(e) =>
            setFormData({ ...formData, receipt_number: e.target.value })
          }
          placeholder="Enter receipt number if available"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Payment Method (Optional)</InputLabel>
          <Select
            value={formData.payment_method}
            onChange={(e) =>
              setFormData({ ...formData, payment_method: e.target.value })
            }
            label="Payment Method (Optional)"
          >
            {PAYMENT_METHODS.map((method) => (
              <MenuItem key={method.value} value={method.value}>
                {method.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}
        >
          <Button
            variant="outlined"
            startIcon={<PhotoIcon />}
            onClick={() => {
              /* Handle receipt upload */
            }}
          >
            Upload Receipt
          </Button>
          <Button
            variant="outlined"
            startIcon={<AttachmentIcon />}
            onClick={() => {
              /* Handle document attach */
            }}
          >
            Attach Document
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Notes (Optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          multiline
          rows={3}
          placeholder="Any additional notes or justification for this expense (optional)"
        />
      </Grid>
    </Grid>
  );

  const renderExpenseFormStep3 = () => (
    <Card variant="outlined" sx={{ mt: 1, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Expense Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1">{formData.description}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Amount
          </Typography>
          <Typography variant="h6" color="primary">
            TZS {Number(formData.amount || 0).toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Category
          </Typography>
          <Typography variant="body1">{formData.category}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Vendor
          </Typography>
          <Typography variant="body1">{formData.vendor_name}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Date
          </Typography>
          <Typography variant="body1">
            {format(formData.expense_date, "dd/MM/yyyy")}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Payment Method
          </Typography>
          <Typography variant="body1">
            {
              PAYMENT_METHODS.find((m) => m.value === formData.payment_method)
                ?.label
            }
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );

  const renderExpenseDialog = () => (
    <Dialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editingExpense ? "Edit Expense" : "Record New Expense"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: Basic Information */}
            <Step>
              <StepLabel>Expense Information</StepLabel>
              <StepContent>
                {renderExpenseFormStep1()}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    disabled={
                      !formData.petty_cash_book_id ||
                      !formData.category ||
                      !formData.amount ||
                      !formData.description
                    }
                  >
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: Vendor & Receipt Details */}
            <Step>
              <StepLabel>Vendor & Receipt Details</StepLabel>
              <StepContent>
                {renderExpenseFormStep2()}
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button onClick={() => setActiveStep(0)}>Back</Button>
                  <Button variant="contained" onClick={() => setActiveStep(2)}>
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Review & Submit */}
            <Step>
              <StepLabel>Review & Submit</StepLabel>
              <StepContent>
                {renderExpenseFormStep3()}
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button onClick={() => setActiveStep(1)}>Back</Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSubmitType("draft");
                      handleSubmit();
                    }}
                    startIcon={<SaveIcon />}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setSubmitType("submit");
                      handleSubmit();
                    }}
                    startIcon={<SendIcon />}
                    color="primary"
                  >
                    {editingExpense ? "Submit" : "Submit"} Expense
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setDialogOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderViewExpenseDialog = () => (
    <Dialog
      open={viewDialogOpen}
      onClose={() => setViewDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Expense Details - {selectedExpense?.description}
      </DialogTitle>
      <DialogContent>
        {selectedExpense && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Expense Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedExpense.description}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Chip
                          label={selectedExpense.category}
                          size="small"
                          color={selectedExpense.category_color}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                          TZS {selectedExpense.amount?.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Expense Date
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {(() => {
                            const date = parseISO(selectedExpense.expense_date);
                            return isValid(date)
                              ? format(date, "dd/MM/yyyy")
                              : "N/A";
                          })()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Vendor
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedExpense.vendor_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Receipt Number
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedExpense.receipt_number}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Payment Method
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedExpense.payment_method}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Requested By
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                          >
                            {selectedExpense.requested_by?.charAt(0)}
                          </Avatar>
                          <Typography variant="body1">
                            {selectedExpense.requested_by}
                          </Typography>
                        </Box>
                      </Grid>
                      {selectedExpense.notes && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Notes
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedExpense.notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Status & Approval
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={
                          EXPENSE_STATUSES.find(
                            (s) => s.value === selectedExpense.status
                          )?.label
                        }
                        color={
                          EXPENSE_STATUSES.find(
                            (s) => s.value === selectedExpense.status
                          )?.color
                        }
                        variant="filled"
                        icon={
                          EXPENSE_STATUSES.find(
                            (s) => s.value === selectedExpense.status
                          )?.icon
                        }
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    {selectedExpense.approved_by && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Approved By
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                          >
                            {selectedExpense.approved_by?.charAt(0)}
                          </Avatar>
                          <Typography variant="body1">
                            {selectedExpense.approved_by}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {selectedExpense.approved_at && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Approved Date
                        </Typography>
                        <Typography variant="body1">
                          {format(
                            new Date(selectedExpense.approved_at),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Receipt Attached
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <Badge
                          color={
                            selectedExpense.receipt_attached
                              ? "success"
                              : "error"
                          }
                          variant="dot"
                        >
                          <ReceiptIcon
                            color={
                              selectedExpense.receipt_attached
                                ? "success"
                                : "disabled"
                            }
                          />
                        </Badge>
                        <Typography variant="body2">
                          {selectedExpense.receipt_attached ? "Yes" : "No"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {selectedExpense.status === "admin_approved" && (
                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Balance Impact
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Balance Before
                        </Typography>
                        <Typography variant="h6">
                          TZS {selectedExpense.balance_before?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Expense Amount
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          -TZS {selectedExpense.amount?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Balance After
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          TZS {selectedExpense.balance_after?.toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => {
            /* Print expense details */
          }}
        >
          Print
        </Button>
        {hasPermission(PERMISSIONS.CREATE_PETTY_CASH_ENTRY) &&
          selectedExpense?.status === "pending" && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                handleEdit(selectedExpense);
              }}
            >
              Edit Expense
            </Button>
          )}
      </DialogActions>
    </Dialog>
  );

  const renderReplenishmentDialog = () => (
    <Dialog
      open={replenishDialogOpen}
      onClose={() => setReplenishDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Request Petty Cash Replenishment</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Request replenishment when petty cash balance is running low.
                Include justification and required amount.
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Petty Cash Book</InputLabel>
              <Select defaultValue="" label="Petty Cash Book">
                {pettyCashBooks.map((book) => (
                  <MenuItem key={book.id} value={book.id}>
                    {book.book_number} (TZS{" "}
                    {book.current_balance.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Requested Amount (TZS)"
              type="number"
              placeholder="Amount to replenish"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Justification"
              multiline
              rows={4}
              placeholder="Provide justification for replenishment request..."
            />
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Recent Expenses Summary
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses
                        .filter((exp) => exp.status === "admin_approved")
                        .slice(0, 5)
                        .map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>
                              {expense.expense_date &&
                              isValid(new Date(expense.expense_date))
                                ? format(
                                    new Date(expense.expense_date),
                                    "dd/MM/yyyy"
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell align="right">
                              TZS {expense.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReplenishDialogOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<RequestIcon />}
          onClick={() => {
            setReplenishDialogOpen(false);
            showSuccess("Replenishment request submitted successfully");
          }}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderConfirmDialog = () =>
    isOpen && (
      <Dialog open={isOpen} onClose={closeDialog}>
        <DialogTitle>{config.title}</DialogTitle>
        <DialogContent>
          <Typography>{config.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );

  // ==================== MAIN RENDER ====================

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        {renderHeader()}

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Petty Cash Books Overview */}
        {renderPettyCashBooksOverview()}

        {/* Main Content */}
        {renderMainContent()}

        {/* Action Menu */}
        {renderActionMenu()}

        {/* Record Expense Dialog */}
        {renderExpenseDialog()}

        {/* View Expense Dialog */}
        {renderViewExpenseDialog()}

        {/* Replenishment Request Dialog */}
        {renderReplenishmentDialog()}

        {/* Confirm Dialog */}
        {renderConfirmDialog()}
      </Box>
    </LocalizationProvider>
  );
};

export default PettyCashExpensesPage;
