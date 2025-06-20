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
  Paper,
  Avatar,
  LinearProgress,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
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
  Receipt as ExpenseIcon,
  MonetizationOn as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Person as PersonIcon,
  Business as DepartmentIcon,
  DateRange as DateIcon,
  Category as CategoryIcon,
  AttachFile as AttachmentIcon,
  Assignment as ReportIcon,
  Assessment as AnalyticsIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Send as SubmitIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  FlightTakeoff as TravelIcon,
  Restaurant as MealIcon,
  LocalGasStation as FuelIcon,
  Hotel as AccommodationIcon,
  Phone as CommunicationIcon,
  Build as SuppliesIcon,
  DirectionsCar as TransportIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  PhotoCamera as PhotoIcon,
  Map as LocationIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
// import { expenseAPI } from '../../../services/api/expense.api';

const ExpenseReportsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [expenseReports, setExpenseReports] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("current_month");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createReportDialogOpen, setCreateReportDialogOpen] = useState(false);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showOnlyMyReports, setShowOnlyMyReports] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(
    startOfMonth(new Date())
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    endOfMonth(new Date())
  );

  // Form state for expense report
  const [reportFormData, setReportFormData] = useState({
    report_title: "",
    description: "",
    purpose: "",
    department_id: "",
    start_date: null,
    end_date: null,
    status: "draft",
    notes: "",
  });

  // Form state for individual expense
  const [expenseFormData, setExpenseFormData] = useState({
    report_id: "",
    expense_date: new Date(),
    category: "",
    description: "",
    amount: "",
    currency: "TZS",
    vendor: "",
    payment_method: "cash",
    location: "",
    business_purpose: "",
    receipt_attached: false,
    billable_to_client: false,
    project_id: "",
    notes: "",
  });

  // Mock data for development
  const mockExpenseReports = [
    {
      id: 1,
      report_number: "EXP-2024-001",
      report_title: "Business Trip to Mombasa",
      employee_name: "John Doe",
      employee_id: 1,
      department: "Sales",
      purpose: "Client meetings and contract negotiations",
      start_date: "2024-06-10",
      end_date: "2024-06-12",
      total_amount: 485000,
      reimbursable_amount: 450000,
      expense_count: 8,
      status: "approved",
      submitted_date: "2024-06-15",
      approved_date: "2024-06-18",
      approved_by: "Jane Smith",
      created_at: "2024-06-13",
      last_updated: "2024-06-18",
    },
    {
      id: 2,
      report_number: "EXP-2024-002",
      report_title: "Conference Attendance - Dar es Salaam",
      employee_name: "Sarah Wilson",
      employee_id: 2,
      department: "Marketing",
      purpose: "Digital Marketing Conference 2024",
      start_date: "2024-06-18",
      end_date: "2024-06-20",
      total_amount: 320000,
      reimbursable_amount: 300000,
      expense_count: 6,
      status: "pending",
      submitted_date: "2024-06-21",
      approved_date: null,
      approved_by: null,
      created_at: "2024-06-21",
      last_updated: "2024-06-21",
    },
    {
      id: 3,
      report_number: "EXP-2024-003",
      report_title: "Monthly Office Supplies",
      employee_name: "Mike Johnson",
      employee_id: 3,
      department: "Administration",
      purpose: "Office supplies and maintenance items",
      start_date: "2024-06-01",
      end_date: "2024-06-30",
      total_amount: 125000,
      reimbursable_amount: 125000,
      expense_count: 12,
      status: "draft",
      submitted_date: null,
      approved_date: null,
      approved_by: null,
      created_at: "2024-06-28",
      last_updated: "2024-06-30",
    },
  ];

  const mockExpenses = [
    {
      id: 1,
      report_id: 1,
      expense_date: "2024-06-10",
      category: "Transportation",
      description: "Flight tickets to Mombasa",
      amount: 180000,
      currency: "TZS",
      vendor: "Air Tanzania",
      payment_method: "company_card",
      location: "Dar es Salaam Airport",
      business_purpose: "Travel to client meetings",
      receipt_attached: true,
      billable_to_client: false,
      reimbursable: true,
    },
    {
      id: 2,
      report_id: 1,
      expense_date: "2024-06-10",
      category: "Accommodation",
      description: "Hotel stay - 2 nights",
      amount: 150000,
      currency: "TZS",
      vendor: "Serena Hotel Mombasa",
      payment_method: "company_card",
      location: "Mombasa",
      business_purpose: "Accommodation during business trip",
      receipt_attached: true,
      billable_to_client: false,
      reimbursable: true,
    },
    {
      id: 3,
      report_id: 1,
      expense_date: "2024-06-11",
      category: "Meals",
      description: "Client lunch meeting",
      amount: 85000,
      currency: "TZS",
      vendor: "Ocean View Restaurant",
      payment_method: "cash",
      location: "Mombasa",
      business_purpose: "Client entertainment",
      receipt_attached: true,
      billable_to_client: true,
      reimbursable: true,
    },
  ];

  // Expense categories with icons
  const expenseCategories = [
    {
      value: "transportation",
      label: "Transportation",
      icon: <TransportIcon />,
    },
    {
      value: "accommodation",
      label: "Accommodation",
      icon: <AccommodationIcon />,
    },
    { value: "meals", label: "Meals & Entertainment", icon: <MealIcon /> },
    { value: "fuel", label: "Fuel", icon: <FuelIcon /> },
    {
      value: "communication",
      label: "Communication",
      icon: <CommunicationIcon />,
    },
    { value: "supplies", label: "Office Supplies", icon: <SuppliesIcon /> },
    { value: "travel", label: "Travel Expenses", icon: <TravelIcon /> },
    { value: "other", label: "Other", icon: <CategoryIcon /> },
  ];

  // Expense statuses
  const expenseStatuses = [
    { value: "draft", label: "Draft", color: "default" },
    { value: "submitted", label: "Submitted", color: "info" },
    { value: "pending", label: "Pending Review", color: "warning" },
    { value: "approved", label: "Approved", color: "success" },
    { value: "rejected", label: "Rejected", color: "error" },
    { value: "paid", label: "Paid", color: "success" },
  ];

  // Payment methods
  const paymentMethods = [
    { value: "cash", label: "Cash", icon: <MoneyIcon /> },
    { value: "company_card", label: "Company Card", icon: <CardIcon /> },
    { value: "personal_card", label: "Personal Card", icon: <CardIcon /> },
    { value: "bank_transfer", label: "Bank Transfer", icon: <BankIcon /> },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Reports",
      value: mockExpenseReports.length.toString(),
      subtitle: "This month",
      icon: <ReportIcon />,
      color: "primary",
    },
    {
      title: "Total Expenses",
      value: `TZS ${mockExpenseReports.reduce((sum, report) => sum + report.total_amount, 0).toLocaleString()}`,
      subtitle: "This month",
      icon: <MoneyIcon />,
      color: "success",
    },
    {
      title: "Pending Approval",
      value: mockExpenseReports
        .filter((report) => report.status === "pending")
        .length.toString(),
      subtitle: "Requiring action",
      icon: <PendingIcon />,
      color: "warning",
    },
    {
      title: "Reimbursements Due",
      value: `TZS ${mockExpenseReports
        .filter((r) => r.status === "approved")
        .reduce((sum, report) => sum + report.reimbursable_amount, 0)
        .toLocaleString()}`,
      subtitle: "Approved reports",
      icon: <BankIcon />,
      color: "info",
    },
  ];

  // DataGrid columns for expense reports
  const reportColumns = [
    {
      field: "report_info",
      headerName: "Report",
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.report_title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.report_number} • {params.row.department}
          </Typography>
        </Box>
      ),
    },
    {
      field: "employee_name",
      headerName: "Employee",
      width: 150,
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
      field: "period",
      headerName: "Period",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.row.start_date), "dd/MM/yyyy")} -{" "}
          {format(new Date(params.row.end_date), "dd/MM/yyyy")}
        </Typography>
      ),
    },
    {
      field: "total_amount",
      headerName: "Total Amount",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "expense_count",
      headerName: "Expenses",
      width: 100,
      renderCell: (params) => (
        <Chip label={`${params.value} items`} size="small" variant="outlined" />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = expenseStatuses.find((s) => s.value === params.value);
        return (
          <Chip
            label={status?.label}
            size="small"
            color={status?.color}
            variant="filled"
          />
        );
      },
    },
    {
      field: "submitted_date",
      headerName: "Submitted",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Typography variant="body2">
            {format(new Date(params.value), "dd/MM/yyyy")}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Not submitted
          </Typography>
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
            setSelectedReport(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // DataGrid columns for individual expenses
  const expenseColumns = [
    {
      field: "expense_date",
      headerName: "Date",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), "dd/MM/yyyy")}
        </Typography>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      renderCell: (params) => {
        const category = expenseCategories.find(
          (c) => c.value === params.value
        );
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {category?.icon}
            <Typography variant="body2">{category?.label}</Typography>
          </Box>
        );
      },
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
            {params.row.vendor}
          </Typography>
        </Box>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.row.currency} {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "payment_method",
      headerName: "Payment Method",
      width: 130,
      renderCell: (params) => {
        const method = paymentMethods.find((m) => m.value === params.value);
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {method?.icon}
            <Typography variant="body2">{method?.label}</Typography>
          </Box>
        );
      },
    },
    {
      field: "receipt_attached",
      headerName: "Receipt",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Yes" size="small" color="success" />
        ) : (
          <Chip label="No" size="small" color="default" />
        ),
    },
    {
      field: "reimbursable",
      headerName: "Reimbursable",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Yes" size="small" color="primary" />
        ) : (
          <Chip label="No" size="small" color="default" />
        ),
    },
  ];

  // Load expense reports data
  useEffect(() => {
    fetchExpenseReports();
    fetchExpenses();
  }, [selectedStartDate, selectedEndDate]);

  const fetchExpenseReports = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await expenseAPI.getExpenseReports({
      //   start_date: format(selectedStartDate, 'yyyy-MM-dd'),
      //   end_date: format(selectedEndDate, 'yyyy-MM-dd'),
      //   employee_id: showOnlyMyReports ? user.id : null
      // });
      // setExpenseReports(response.data || []);
      setExpenseReports(mockExpenseReports);
    } catch (error) {
      showError("Failed to fetch expense reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      // Replace with actual API call
      // const response = await expenseAPI.getExpenses();
      // setExpenses(response.data || []);
      setExpenses(mockExpenses);
    } catch (error) {
      showError("Failed to fetch expenses");
    }
  };

  // Handle form submission for expense report
  const handleReportSubmit = async () => {
    try {
      if (editingReport) {
        // await expenseAPI.updateExpenseReport(editingReport.id, reportFormData);
        showSuccess("Expense report updated successfully");
      } else {
        // await expenseAPI.createExpenseReport(reportFormData);
        showSuccess("Expense report created successfully");
      }
      setCreateReportDialogOpen(false);
      resetReportForm();
      fetchExpenseReports();
    } catch (error) {
      showError("Failed to save expense report");
    }
  };

  // Handle form submission for individual expense
  const handleExpenseSubmit = async () => {
    try {
      // await expenseAPI.createExpense(expenseFormData);
      showSuccess("Expense added successfully");
      setAddExpenseDialogOpen(false);
      resetExpenseForm();
      fetchExpenses();
    } catch (error) {
      showError("Failed to add expense");
    }
  };

  const resetReportForm = () => {
    setReportFormData({
      report_title: "",
      description: "",
      purpose: "",
      department_id: "",
      start_date: null,
      end_date: null,
      status: "draft",
      notes: "",
    });
    setEditingReport(null);
  };

  const resetExpenseForm = () => {
    setExpenseFormData({
      report_id: "",
      expense_date: new Date(),
      category: "",
      description: "",
      amount: "",
      currency: "TZS",
      vendor: "",
      payment_method: "cash",
      location: "",
      business_purpose: "",
      receipt_attached: false,
      billable_to_client: false,
      project_id: "",
      notes: "",
    });
  };

  // Handle report actions
  const handleEditReport = (report) => {
    setReportFormData({ ...report });
    setEditingReport(report);
    setCreateReportDialogOpen(true);
    setAnchorEl(null);
  };

  const handleSubmitReport = async (report) => {
    try {
      // await expenseAPI.submitExpenseReport(report.id);
      showSuccess("Expense report submitted for approval");
      fetchExpenseReports();
    } catch (error) {
      showError("Failed to submit expense report");
    }
    setAnchorEl(null);
  };

  const handleApproveReport = async (report) => {
    try {
      // await expenseAPI.approveExpenseReport(report.id);
      showSuccess("Expense report approved");
      fetchExpenseReports();
    } catch (error) {
      showError("Failed to approve expense report");
    }
    setAnchorEl(null);
  };

  const handleRejectReport = async (report) => {
    try {
      // await expenseAPI.rejectExpenseReport(report.id);
      showSuccess("Expense report rejected");
      fetchExpenseReports();
    } catch (error) {
      showError("Failed to reject expense report");
    }
    setAnchorEl(null);
  };

  // Filter expense reports
  const filteredExpenseReports = expenseReports.filter((report) => {
    const matchesSearch =
      report.report_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.report_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || report.status === statusFilter;
    const matchesEmployee =
      !employeeFilter ||
      report.employee_name.toLowerCase().includes(employeeFilter.toLowerCase());
    const matchesMyReports =
      !showOnlyMyReports || report.employee_id === user?.id;

    return (
      matchesSearch && matchesStatus && matchesEmployee && matchesMyReports
    );
  });

  // Get expenses for selected report
  const getExpensesForReport = (reportId) => {
    return expenses.filter((expense) => expense.report_id === reportId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h4">Expense Reports</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setRefreshing(true);
                  fetchExpenseReports();
                  setRefreshing(false);
                }}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                onClick={() => navigate("/reports/finance")}
              >
                Analytics
              </Button>
              {hasPermission(PERMISSIONS.MANAGE_EXPENSES) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateReportDialogOpen(true)}
                >
                  New Report
                </Button>
              )}
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Track, manage, and approve employee expense reports and
            reimbursements
          </Typography>
        </Box>

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

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Filters and Controls */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search reports..."
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
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {expenseStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="Start Date"
                    value={selectedStartDate}
                    onChange={setSelectedStartDate}
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="End Date"
                    value={selectedEndDate}
                    onChange={setSelectedEndDate}
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showOnlyMyReports}
                          onChange={(e) =>
                            setShowOnlyMyReports(e.target.checked)
                          }
                          size="small"
                        />
                      }
                      label="My Reports Only"
                    />
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        /* Export function */
                      }}
                      size="small"
                    >
                      Export
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Content Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
            >
              <Tab label="Expense Reports" />
              <Tab label="All Expenses" />
              <Tab label="Pending Approvals" />
              <Tab label="Analytics" />
            </Tabs>
            {/* Expense Reports Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredExpenseReports}
                    columns={reportColumns}
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
            )}

            {/* All Expenses Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">All Expense Items</Typography>
                  {hasPermission(PERMISSIONS.MANAGE_EXPENSES) && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setAddExpenseDialogOpen(true)}
                    >
                      Add Expense
                    </Button>
                  )}
                </Box>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={expenses}
                    columns={expenseColumns}
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
            )}

            {/* Pending Approvals Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Reports Awaiting Approval
                </Typography>
                {filteredExpenseReports.filter(
                  (report) => report.status === "pending"
                ).length > 0 ? (
                  <Grid container spacing={2}>
                    {filteredExpenseReports
                      .filter((report) => report.status === "pending")
                      .map((report) => (
                        <Grid item xs={12} md={6} key={report.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "start",
                                  mb: 2,
                                }}
                              >
                                <Box>
                                  <Typography variant="h6">
                                    {report.report_title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {report.report_number} •{" "}
                                    {report.employee_name}
                                  </Typography>
                                </Box>
                                <Chip
                                  label="Pending"
                                  size="small"
                                  color="warning"
                                  variant="filled"
                                />
                              </Box>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Total Amount
                                  </Typography>
                                  <Typography variant="h6" color="primary">
                                    TZS {report.total_amount.toLocaleString()}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Submitted
                                  </Typography>
                                  <Typography variant="body2">
                                    {format(
                                      new Date(report.submitted_date),
                                      "dd/MM/yyyy"
                                    )}
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Box sx={{ mt: 2 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Purpose
                                </Typography>
                                <Typography variant="body2">
                                  {report.purpose}
                                </Typography>
                              </Box>
                              {hasPermission(PERMISSIONS.APPROVE_EXPENSES) && (
                                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<ApprovedIcon />}
                                    onClick={() => handleApproveReport(report)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<RejectedIcon />}
                                    onClick={() => handleRejectReport(report)}
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ViewIcon />}
                                    onClick={() => {
                                      setSelectedReport(report);
                                      setViewDialogOpen(true);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    <Typography variant="body2">
                      No expense reports pending approval.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}

            {/* Analytics Tab */}
            {activeTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Expense Analytics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Expenses by Category
                        </Typography>
                        <List>
                          {expenseCategories.map((category) => {
                            const categoryExpenses = expenses.filter(
                              (exp) => exp.category === category.value
                            );
                            const totalAmount = categoryExpenses.reduce(
                              (sum, exp) => sum + exp.amount,
                              0
                            );

                            return categoryExpenses.length > 0 ? (
                              <ListItem key={category.value}>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: "primary.main" }}>
                                    {category.icon}
                                  </Avatar>
                                </ListItemAvatar>
                                <MUIListItemText
                                  primary={category.label}
                                  secondary={`${categoryExpenses.length} expenses • TZS ${totalAmount.toLocaleString()}`}
                                />
                              </ListItem>
                            ) : null;
                          })}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Monthly Trends
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
                            Monthly expense trends chart will be displayed here
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Top Spenders
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell align="right">Reports</TableCell>
                                <TableCell align="right">
                                  Total Amount
                                </TableCell>
                                <TableCell align="right">
                                  Average per Report
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredExpenseReports.map((report) => (
                                <TableRow key={report.id}>
                                  <TableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        {report.employee_name?.charAt(0)}
                                      </Avatar>
                                      <Typography variant="body2">
                                        {report.employee_name}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>{report.department}</TableCell>
                                  <TableCell align="right">1</TableCell>
                                  <TableCell align="right">
                                    TZS {report.total_amount.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    TZS {report.total_amount.toLocaleString()}
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
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Actions Menu */}
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
          {hasPermission(PERMISSIONS.MANAGE_EXPENSES) &&
            selectedReport?.status === "draft" && (
              <MenuItem onClick={() => handleEditReport(selectedReport)}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Report</ListItemText>
              </MenuItem>
            )}
          {selectedReport?.status === "draft" && (
            <MenuItem onClick={() => handleSubmitReport(selectedReport)}>
              <ListItemIcon>
                <SubmitIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Submit for Approval</ListItemText>
            </MenuItem>
          )}
          {selectedReport?.status === "pending" &&
            hasPermission(PERMISSIONS.APPROVE_EXPENSES) && (
              <>
                <Divider />
                <MenuItem onClick={() => handleApproveReport(selectedReport)}>
                  <ListItemIcon>
                    <ApprovedIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>Approve</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleRejectReport(selectedReport)}>
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
              /* Print report */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Report</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              /* Export report */
            }}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Report</ListItemText>
          </MenuItem>
        </Menu>

        {/* Create/Edit Expense Report Dialog */}
        <Dialog
          open={createReportDialogOpen}
          onClose={() => setCreateReportDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingReport
              ? "Edit Expense Report"
              : "Create New Expense Report"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Report Title"
                  value={reportFormData.report_title}
                  onChange={(e) =>
                    setReportFormData({
                      ...reportFormData,
                      report_title: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., Business Trip to Mombasa"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose"
                  value={reportFormData.purpose}
                  onChange={(e) =>
                    setReportFormData({
                      ...reportFormData,
                      purpose: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., Client meetings and contract negotiations"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={reportFormData.description}
                  onChange={(e) =>
                    setReportFormData({
                      ...reportFormData,
                      description: e.target.value,
                    })
                  }
                  multiline
                  rows={3}
                  placeholder="Detailed description of the expenses..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={reportFormData.start_date}
                  onChange={(date) =>
                    setReportFormData({ ...reportFormData, start_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={reportFormData.end_date}
                  onChange={(date) =>
                    setReportFormData({ ...reportFormData, end_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={reportFormData.department_id}
                    onChange={(e) =>
                      setReportFormData({
                        ...reportFormData,
                        department_id: e.target.value,
                      })
                    }
                    label="Department"
                    required
                  >
                    <MenuItem value="1">Sales</MenuItem>
                    <MenuItem value="2">Marketing</MenuItem>
                    <MenuItem value="3">IT Department</MenuItem>
                    <MenuItem value="4">Administration</MenuItem>
                    <MenuItem value="5">Finance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={reportFormData.status}
                    onChange={(e) =>
                      setReportFormData({
                        ...reportFormData,
                        status: e.target.value,
                      })
                    }
                    label="Status"
                  >
                    {expenseStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={reportFormData.notes}
                  onChange={(e) =>
                    setReportFormData({
                      ...reportFormData,
                      notes: e.target.value,
                    })
                  }
                  multiline
                  rows={2}
                  placeholder="Additional notes or comments..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setReportFormData({ ...reportFormData, status: "draft" });
                handleReportSubmit();
              }}
              variant="outlined"
              startIcon={<SaveIcon />}
            >
              Save Draft
            </Button>
            <Button
              onClick={() => {
                setReportFormData({ ...reportFormData, status: "submitted" });
                handleReportSubmit();
              }}
              variant="contained"
              startIcon={<SubmitIcon />}
            >
              Save & Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Expense Dialog */}
        <Dialog
          open={addExpenseDialogOpen}
          onClose={() => setAddExpenseDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Expense Report</InputLabel>
                  <Select
                    value={expenseFormData.report_id}
                    onChange={(e) =>
                      setExpenseFormData({
                        ...expenseFormData,
                        report_id: e.target.value,
                      })
                    }
                    label="Expense Report"
                    required
                  >
                    {expenseReports
                      .filter(
                        (report) =>
                          report.status === "draft" ||
                          report.status === "submitted"
                      )
                      .map((report) => (
                        <MenuItem key={report.id} value={report.id}>
                          {report.report_title}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Expense Date"
                  value={expenseFormData.expense_date}
                  onChange={(date) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      expense_date: date,
                    })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={expenseFormData.category}
                    onChange={(e) =>
                      setExpenseFormData({
                        ...expenseFormData,
                        category: e.target.value,
                      })
                    }
                    label="Category"
                    required
                  >
                    {expenseCategories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {category.icon}
                          {category.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={expenseFormData.amount}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      amount: e.target.value,
                    })
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">TZS</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={expenseFormData.description}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      description: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., Flight tickets to Mombasa"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vendor/Merchant"
                  value={expenseFormData.vendor}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      vendor: e.target.value,
                    })
                  }
                  placeholder="e.g., Air Tanzania"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={expenseFormData.payment_method}
                    onChange={(e) =>
                      setExpenseFormData({
                        ...expenseFormData,
                        payment_method: e.target.value,
                      })
                    }
                    label="Payment Method"
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {method.icon}
                          {method.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={expenseFormData.location}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g., Dar es Salaam Airport"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project ID"
                  value={expenseFormData.project_id}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      project_id: e.target.value,
                    })
                  }
                  placeholder="If billable to specific project"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Purpose"
                  value={expenseFormData.business_purpose}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      business_purpose: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., Travel to client meetings"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={expenseFormData.receipt_attached}
                        onChange={(e) =>
                          setExpenseFormData({
                            ...expenseFormData,
                            receipt_attached: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Receipt Attached"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={expenseFormData.billable_to_client}
                        onChange={(e) =>
                          setExpenseFormData({
                            ...expenseFormData,
                            billable_to_client: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Billable to Client"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={expenseFormData.notes}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      notes: e.target.value,
                    })
                  }
                  multiline
                  rows={2}
                  placeholder="Additional notes or comments..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddExpenseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExpenseSubmit}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Add Expense
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Expense Report Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Expense Report Details - {selectedReport?.report_number}
          </DialogTitle>
          <DialogContent>
            {selectedReport && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Report Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Title
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedReport.report_title}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Employee
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
                                sx={{
                                  width: 24,
                                  height: 24,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {selectedReport.employee_name?.charAt(0)}
                              </Avatar>
                              <Typography variant="body1">
                                {selectedReport.employee_name}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Department
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedReport.department}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Period
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {format(
                                new Date(selectedReport.start_date),
                                "dd/MM/yyyy"
                              )}{" "}
                              -{" "}
                              {format(
                                new Date(selectedReport.end_date),
                                "dd/MM/yyyy"
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Purpose
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedReport.purpose}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Expense Items
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell>Receipt</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {getExpensesForReport(selectedReport.id).map(
                                (expense) => (
                                  <TableRow key={expense.id}>
                                    <TableCell>
                                      {format(
                                        new Date(expense.expense_date),
                                        "dd/MM/yyyy"
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        {
                                          expenseCategories.find(
                                            (c) => c.value === expense.category
                                          )?.icon
                                        }
                                        <Typography variant="body2">
                                          {
                                            expenseCategories.find(
                                              (c) =>
                                                c.value === expense.category
                                            )?.label
                                          }
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {expense.description}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {expense.vendor}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      TZS {expense.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={
                                          expense.receipt_attached
                                            ? "Yes"
                                            : "No"
                                        }
                                        size="small"
                                        color={
                                          expense.receipt_attached
                                            ? "success"
                                            : "default"
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
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
                          Financial Summary
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Amount
                          </Typography>
                          <Typography variant="h6" color="primary">
                            TZS {selectedReport.total_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Reimbursable Amount
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            TZS{" "}
                            {selectedReport.reimbursable_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Number of Expenses
                          </Typography>
                          <Typography variant="h6">
                            {selectedReport.expense_count}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={
                              expenseStatuses.find(
                                (s) => s.value === selectedReport.status
                              )?.label
                            }
                            color={
                              expenseStatuses.find(
                                (s) => s.value === selectedReport.status
                              )?.color
                            }
                            variant="filled"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        {selectedReport.submitted_date && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Submitted Date
                            </Typography>
                            <Typography variant="body1">
                              {format(
                                new Date(selectedReport.submitted_date),
                                "dd/MM/yyyy"
                              )}
                            </Typography>
                          </Box>
                        )}
                        {selectedReport.approved_date && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Approved Date
                            </Typography>
                            <Typography variant="body1">
                              {format(
                                new Date(selectedReport.approved_date),
                                "dd/MM/yyyy"
                              )}
                            </Typography>
                          </Box>
                        )}
                        {selectedReport.approved_by && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Approved By
                            </Typography>
                            <Typography variant="body1">
                              {selectedReport.approved_by}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>

                    {/* Approval Workflow */}
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Approval Workflow
                        </Typography>
                        <Stepper
                          orientation="vertical"
                          activeStep={
                            selectedReport.status === "draft"
                              ? 0
                              : selectedReport.status === "submitted" ||
                                  selectedReport.status === "pending"
                                ? 1
                                : selectedReport.status === "approved" ||
                                    selectedReport.status === "paid"
                                  ? 2
                                  : 0
                          }
                        >
                          <Step>
                            <StepLabel>Report Created</StepLabel>
                            <StepContent>
                              <Typography variant="caption">
                                {format(
                                  new Date(selectedReport.created_at),
                                  "dd/MM/yyyy HH:mm"
                                )}
                              </Typography>
                            </StepContent>
                          </Step>
                          <Step>
                            <StepLabel>Submitted for Review</StepLabel>
                            <StepContent>
                              {selectedReport.submitted_date && (
                                <Typography variant="caption">
                                  {format(
                                    new Date(selectedReport.submitted_date),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </Typography>
                              )}
                            </StepContent>
                          </Step>
                          <Step>
                            <StepLabel>
                              {selectedReport.status === "approved"
                                ? "Approved"
                                : selectedReport.status === "rejected"
                                  ? "Rejected"
                                  : "Pending Approval"}
                            </StepLabel>
                            <StepContent>
                              {selectedReport.approved_date && (
                                <Typography variant="caption">
                                  {format(
                                    new Date(selectedReport.approved_date),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </Typography>
                              )}
                            </StepContent>
                          </Step>
                        </Stepper>
                      </CardContent>
                    </Card>
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
                /* Print expense report */
              }}
            >
              Print Report
            </Button>
            {hasPermission(PERMISSIONS.MANAGE_EXPENSES) &&
              selectedReport?.status === "draft" && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEditReport(selectedReport);
                  }}
                >
                  Edit Report
                </Button>
              )}
          </DialogActions>
        </Dialog>

        {/* Confirm Dialog */}
        {isOpen && (
          <Dialog open={isOpen} onClose={closeDialog}>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogContent>
              <Typography>{config.message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog}>Cancel</Button>
              <Button
                onClick={handleConfirm}
                color="primary"
                variant="contained"
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ExpenseReportsPage;
