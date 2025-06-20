import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  MonetizationOn as MoneyIcon,
  AccountBalance as CashIcon,
  TrendingUp as IncreaseIcon,
  TrendingDown as DecreaseIcon,
  Schedule as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Business as DepartmentIcon,
  DateRange as DateIcon,
  Assignment as RequestIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Send as SubmitIcon,
  Save as SaveIcon,
  AttachFile as AttachIcon,
  Notifications as AlertIcon,
  CompareArrows as TransferIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalanceWallet as WalletIcon,
  CreditCard as CardIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { pettyCashAPI } from '../../../services/api/pettyCash.api';

const ReplenishmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cashBookId = searchParams.get("cashBookId");
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [replenishments, setReplenishments] = useState([]);
  const [cashBooks, setCashBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("current_month");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReplenishment, setSelectedReplenishment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [editingReplenishment, setEditingReplenishment] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    petty_cash_book_id: cashBookId || "",
    request_amount: "",
    justification: "",
    urgency: "normal",
    expected_usage_period: 30,
    supporting_documents: [],
    notes: "",
  });

  // Mock data for development
  const mockReplenishments = [
    {
      id: 1,
      request_number: "REP-2024-001",
      petty_cash_book_id: 1,
      cash_book_name: "Main Office Petty Cash",
      department: "Administration",
      custodian: "John Doe",
      current_balance: 25000,
      request_amount: 500000,
      approved_amount: 500000,
      disbursed_amount: 500000,
      requested_by: "John Doe",
      requested_date: "2024-06-15",
      approved_by: "Jane Smith",
      approved_date: "2024-06-16",
      disbursed_by: "Finance Officer",
      disbursed_date: "2024-06-17",
      status: "disbursed",
      urgency: "normal",
      justification:
        "Monthly office expenses and minor repairs budget replenishment",
      expected_usage_period: 30,
      actual_usage_days: null,
      previous_balance: 25000,
      new_balance: 525000,
      approval_workflow: [
        {
          stage: "Department Head",
          status: "approved",
          date: "2024-06-15",
          approver: "Mike Johnson",
        },
        {
          stage: "Finance Manager",
          status: "approved",
          date: "2024-06-16",
          approver: "Jane Smith",
        },
        {
          stage: "Disbursement",
          status: "completed",
          date: "2024-06-17",
          officer: "Finance Officer",
        },
      ],
      documents: [
        {
          name: "Previous Month Expenses Summary",
          type: "pdf",
          uploaded_date: "2024-06-15",
        },
        { name: "Expense Forecast", type: "xlsx", uploaded_date: "2024-06-15" },
      ],
    },
    {
      id: 2,
      request_number: "REP-2024-002",
      petty_cash_book_id: 2,
      cash_book_name: "Field Office Petty Cash",
      department: "Field Operations",
      custodian: "Sarah Wilson",
      current_balance: 15000,
      request_amount: 300000,
      approved_amount: 250000,
      disbursed_amount: null,
      requested_by: "Sarah Wilson",
      requested_date: "2024-06-18",
      approved_by: "Jane Smith",
      approved_date: "2024-06-19",
      disbursed_by: null,
      disbursed_date: null,
      status: "approved",
      urgency: "high",
      justification:
        "Emergency field operations expenses and travel allowances",
      expected_usage_period: 15,
      actual_usage_days: null,
      previous_balance: 15000,
      new_balance: null,
      approval_workflow: [
        {
          stage: "Department Head",
          status: "approved",
          date: "2024-06-18",
          approver: "Operations Manager",
        },
        {
          stage: "Finance Manager",
          status: "approved",
          date: "2024-06-19",
          approver: "Jane Smith",
        },
        { stage: "Disbursement", status: "pending", date: null, officer: null },
      ],
      documents: [
        {
          name: "Emergency Expense Request",
          type: "pdf",
          uploaded_date: "2024-06-18",
        },
      ],
    },
    {
      id: 3,
      request_number: "REP-2024-003",
      petty_cash_book_id: 3,
      cash_book_name: "HR Department Petty Cash",
      department: "Human Resources",
      custodian: "Mike Johnson",
      current_balance: 8000,
      request_amount: 200000,
      approved_amount: null,
      disbursed_amount: null,
      requested_by: "Mike Johnson",
      requested_date: "2024-06-20",
      approved_by: null,
      approved_date: null,
      disbursed_by: null,
      disbursed_date: null,
      status: "pending",
      urgency: "normal",
      justification: "Staff welfare activities and recruitment expenses",
      expected_usage_period: 45,
      actual_usage_days: null,
      previous_balance: 8000,
      new_balance: null,
      approval_workflow: [
        {
          stage: "Department Head",
          status: "pending",
          date: null,
          approver: null,
        },
        {
          stage: "Finance Manager",
          status: "waiting",
          date: null,
          approver: null,
        },
        { stage: "Disbursement", status: "waiting", date: null, officer: null },
      ],
      documents: [
        {
          name: "HR Activities Budget Plan",
          type: "pdf",
          uploaded_date: "2024-06-20",
        },
        {
          name: "Staff Welfare Proposal",
          type: "docx",
          uploaded_date: "2024-06-20",
        },
      ],
    },
  ];

  const mockCashBooks = [
    {
      id: 1,
      name: "Main Office Petty Cash",
      department: "Administration",
      custodian: "John Doe",
      balance: 525000,
    },
    {
      id: 2,
      name: "Field Office Petty Cash",
      department: "Field Operations",
      custodian: "Sarah Wilson",
      balance: 15000,
    },
    {
      id: 3,
      name: "HR Department Petty Cash",
      department: "Human Resources",
      custodian: "Mike Johnson",
      balance: 8000,
    },
  ];

  // Replenishment statuses
  const replenishmentStatuses = [
    {
      value: "pending",
      label: "Pending Approval",
      color: "warning",
      icon: <PendingIcon />,
    },
    {
      value: "approved",
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
    {
      value: "disbursed",
      label: "Disbursed",
      color: "primary",
      icon: <MoneyIcon />,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "default",
      icon: <Cancel />,
    },
  ];

  // Urgency levels
  const urgencyLevels = [
    { value: "low", label: "Low", color: "default" },
    { value: "normal", label: "Normal", color: "primary" },
    { value: "high", label: "High", color: "warning" },
    { value: "urgent", label: "Urgent", color: "error" },
  ];

  // Replenishment request steps
  const requestSteps = [
    "Request Information",
    "Justification & Documents",
    "Review & Submit",
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Requests",
      value: mockReplenishments.length.toString(),
      subtitle: "This month",
      icon: <RequestIcon />,
      color: "primary",
    },
    {
      title: "Total Requested",
      value: `TZS ${mockReplenishments.reduce((sum, rep) => sum + rep.request_amount, 0).toLocaleString()}`,
      subtitle: "Amount requested",
      icon: <MoneyIcon />,
      color: "info",
    },
    {
      title: "Total Disbursed",
      value: `TZS ${mockReplenishments.reduce((sum, rep) => sum + (rep.disbursed_amount || 0), 0).toLocaleString()}`,
      subtitle: "Amount disbursed",
      icon: <CashIcon />,
      color: "success",
    },
    {
      title: "Pending Approval",
      value: mockReplenishments
        .filter((rep) => rep.status === "pending")
        .length.toString(),
      subtitle: "Awaiting approval",
      icon: <PendingIcon />,
      color: "warning",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "request_number",
      headerName: "Request #",
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RequestIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "cash_book_info",
      headerName: "Cash Book",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.cash_book_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.department} • {params.row.custodian}
          </Typography>
        </Box>
      ),
    },
    {
      field: "current_balance",
      headerName: "Current Balance",
      width: 130,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color={
            params.value < 50000
              ? "error.main"
              : params.value < 100000
                ? "warning.main"
                : "text.primary"
          }
        >
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "request_amount",
      headerName: "Requested Amount",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "approved_amount",
      headerName: "Approved Amount",
      width: 140,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color={params.value ? "success.main" : "text.secondary"}
        >
          {params.value ? `TZS ${params.value.toLocaleString()}` : "Pending"}
        </Typography>
      ),
    },
    {
      field: "requested_date",
      headerName: "Request Date",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), "dd/MM/yyyy")}
        </Typography>
      ),
    },
    {
      field: "urgency",
      headerName: "Urgency",
      width: 100,
      renderCell: (params) => {
        const urgency = urgencyLevels.find((u) => u.value === params.value);
        return (
          <Chip
            label={urgency?.label}
            size="small"
            color={urgency?.color}
            variant="filled"
          />
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const status = replenishmentStatuses.find(
          (s) => s.value === params.value
        );
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
      field: "days_pending",
      headerName: "Days Pending",
      width: 110,
      renderCell: (params) => {
        const daysPending = differenceInDays(
          new Date(),
          new Date(params.row.requested_date)
        );
        return (
          <Typography
            variant="body2"
            color={
              daysPending > 7
                ? "error.main"
                : daysPending > 3
                  ? "warning.main"
                  : "text.primary"
            }
          >
            {daysPending} days
          </Typography>
        );
      },
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
            setSelectedReplenishment(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load replenishment data
  useEffect(() => {
    fetchReplenishments();
    fetchCashBooks();
  }, []);

  const fetchReplenishments = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await pettyCashAPI.getReplenishmentRequests();
      // setReplenishments(response.data || []);
      setReplenishments(mockReplenishments);
    } catch (error) {
      showError("Failed to fetch replenishment requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchCashBooks = async () => {
    try {
      // Replace with actual API call
      // const response = await pettyCashAPI.getPettyCashBooks();
      // setCashBooks(response.data || []);
      setCashBooks(mockCashBooks);
    } catch (error) {
      showError("Failed to fetch cash books");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingReplenishment) {
        // await pettyCashAPI.updateReplenishmentRequest(editingReplenishment.id, formData);
        showSuccess("Replenishment request updated successfully");
      } else {
        // await pettyCashAPI.createReplenishmentRequest(formData);
        showSuccess("Replenishment request submitted successfully");
      }
      setDialogOpen(false);
      setRequestDialogOpen(false);
      resetForm();
      fetchReplenishments();
    } catch (error) {
      showError("Failed to save replenishment request");
    }
  };

  const resetForm = () => {
    setFormData({
      petty_cash_book_id: cashBookId || "",
      request_amount: "",
      justification: "",
      urgency: "normal",
      expected_usage_period: 30,
      supporting_documents: [],
      notes: "",
    });
    setEditingReplenishment(null);
    setActiveStep(0);
  };

  // Handle approval actions
  const handleApprove = async (replenishment) => {
    try {
      // await pettyCashAPI.approveReplenishmentRequest(replenishment.id);
      showSuccess("Replenishment request approved successfully");
      fetchReplenishments();
    } catch (error) {
      showError("Failed to approve replenishment request");
    }
    setAnchorEl(null);
  };

  const handleReject = async (replenishment) => {
    try {
      // await pettyCashAPI.rejectReplenishmentRequest(replenishment.id);
      showSuccess("Replenishment request rejected");
      fetchReplenishments();
    } catch (error) {
      showError("Failed to reject replenishment request");
    }
    setAnchorEl(null);
  };

  const handleDisburse = async (replenishment) => {
    try {
      // await pettyCashAPI.disburseReplenishment(replenishment.id);
      showSuccess("Replenishment disbursed successfully");
      fetchReplenishments();
    } catch (error) {
      showError("Failed to disburse replenishment");
    }
    setAnchorEl(null);
  };

  // Filter replenishments
  const filteredReplenishments = replenishments.filter((replenishment) => {
    const matchesSearch =
      replenishment.request_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      replenishment.cash_book_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      replenishment.requested_by
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter || replenishment.status === statusFilter;
    const matchesDepartment =
      !departmentFilter || replenishment.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

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
            <Typography variant="h4">Petty Cash Replenishment</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchReplenishments}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  /* Export function */
                }}
              >
                Export
              </Button>
              {hasPermission(PERMISSIONS.MANAGE_PETTY_CASH) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setRequestDialogOpen(true)}
                >
                  New Request
                </Button>
              )}
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage petty cash replenishment requests and approval workflows
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

        {/* Cash Book Balances Overview */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cash Book Balances Overview
            </Typography>
            <Grid container spacing={3}>
              {mockCashBooks.map((cashBook) => (
                <Grid item xs={12} md={4} key={cashBook.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <WalletIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="medium">
                          {cashBook.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {cashBook.department} • {cashBook.custodian}
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          cashBook.balance < 50000
                            ? "error.main"
                            : cashBook.balance < 100000
                              ? "warning.main"
                              : "success.main"
                        }
                      >
                        TZS {cashBook.balance.toLocaleString()}
                      </Typography>
                      {cashBook.balance < 100000 && (
                        <Chip
                          label="Low Balance"
                          size="small"
                          color="warning"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Filters and Actions */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search requests..."
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
                      {replenishmentStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      label="Department"
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      <MenuItem value="Administration">Administration</MenuItem>
                      <MenuItem value="Field Operations">
                        Field Operations
                      </MenuItem>
                      <MenuItem value="Human Resources">
                        Human Resources
                      </MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Filter</InputLabel>
                    <Select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      label="Date Filter"
                    >
                      <MenuItem value="current_month">Current Month</MenuItem>
                      <MenuItem value="last_month">Last Month</MenuItem>
                      <MenuItem value="last_3_months">Last 3 Months</MenuItem>
                      <MenuItem value="all">All Time</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Content Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
            >
              <Tab label="Replenishment Requests" />
              <Tab label="Approval Workflow" />
              <Tab label="Analytics" />
            </Tabs>

            {/* Replenishment Requests Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredReplenishments}
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
            )}

            {/* Approval Workflow Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Pending Approvals
                </Typography>
                {filteredReplenishments
                  .filter(
                    (rep) =>
                      rep.status === "pending" || rep.status === "approved"
                  )
                  .map((replenishment) => (
                    <Accordion key={replenishment.id} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flexGrow: 1,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="medium">
                            {replenishment.request_number} -{" "}
                            {replenishment.cash_book_name}
                          </Typography>
                          <Chip
                            label={`TZS ${replenishment.request_amount.toLocaleString()}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={
                              replenishmentStatuses.find(
                                (s) => s.value === replenishment.status
                              )?.label
                            }
                            size="small"
                            color={
                              replenishmentStatuses.find(
                                (s) => s.value === replenishment.status
                              )?.color
                            }
                            variant="filled"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stepper orientation="vertical">
                          {replenishment.approval_workflow.map(
                            (step, index) => (
                              <Step
                                key={index}
                                completed={
                                  step.status === "approved" ||
                                  step.status === "completed"
                                }
                                active={step.status === "pending"}
                              >
                                <StepLabel>
                                  <Typography variant="subtitle2">
                                    {step.stage}
                                  </Typography>
                                </StepLabel>
                                <StepContent>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                    }}
                                  >
                                    {step.status === "approved" && (
                                      <>
                                        <ApprovedIcon color="success" />
                                        <Typography variant="body2">
                                          Approved by {step.approver} on{" "}
                                          {step.date
                                            ? format(
                                                new Date(step.date),
                                                "dd/MM/yyyy"
                                              )
                                            : "N/A"}
                                        </Typography>
                                      </>
                                    )}
                                    {step.status === "completed" && (
                                      <>
                                        <MoneyIcon color="primary" />
                                        <Typography variant="body2">
                                          Disbursed by {step.officer} on{" "}
                                          {step.date
                                            ? format(
                                                new Date(step.date),
                                                "dd/MM/yyyy"
                                              )
                                            : "N/A"}
                                        </Typography>
                                      </>
                                    )}
                                    {step.status === "pending" && (
                                      <>
                                        <PendingIcon color="warning" />
                                        <Typography variant="body2">
                                          Awaiting approval
                                        </Typography>
                                        {hasPermission(
                                          PERMISSIONS.APPROVE_PETTY_CASH
                                        ) && (
                                          <Box sx={{ ml: 2 }}>
                                            <Button
                                              size="small"
                                              color="success"
                                              onClick={() =>
                                                handleApprove(replenishment)
                                              }
                                            >
                                              Approve
                                            </Button>
                                            <Button
                                              size="small"
                                              color="error"
                                              onClick={() =>
                                                handleReject(replenishment)
                                              }
                                              sx={{ ml: 1 }}
                                            >
                                              Reject
                                            </Button>
                                          </Box>
                                        )}
                                      </>
                                    )}
                                    {step.status === "waiting" && (
                                      <>
                                        <InfoIcon color="action" />
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          Waiting for previous stage completion
                                        </Typography>
                                      </>
                                    )}
                                  </Box>
                                </StepContent>
                              </Step>
                            )
                          )}
                        </Stepper>
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </Box>
            )}

            {/* Analytics Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Replenishment Trends
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
                            Monthly replenishment trend chart
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Department Breakdown
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
                            Department-wise replenishment distribution
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Replenishment Statistics
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="primary">
                                {Math.round(
                                  mockReplenishments.reduce(
                                    (sum, rep) => sum + rep.request_amount,
                                    0
                                  ) /
                                    mockReplenishments.length /
                                    1000
                                )}
                                K
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Average Request Amount
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="success.main">
                                {Math.round(
                                  (mockReplenishments.filter(
                                    (rep) => rep.status === "disbursed"
                                  ).length /
                                    mockReplenishments.length) *
                                    100
                                )}
                                %
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Disbursement Rate
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="warning.main">
                                {Math.round(
                                  mockReplenishments.reduce(
                                    (sum, rep) =>
                                      sum +
                                      differenceInDays(
                                        new Date(),
                                        new Date(rep.requested_date)
                                      ),
                                    0
                                  ) / mockReplenishments.length
                                )}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Average Processing Days
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="info.main">
                                {
                                  mockReplenishments.filter(
                                    (rep) =>
                                      rep.urgency === "high" ||
                                      rep.urgency === "urgent"
                                  ).length
                                }
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                High Priority Requests
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
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
          {hasPermission(PERMISSIONS.MANAGE_PETTY_CASH) &&
            selectedReplenishment?.status === "pending" && (
              <MenuItem
                onClick={() => {
                  setFormData({ ...selectedReplenishment });
                  setEditingReplenishment(selectedReplenishment);
                  setDialogOpen(true);
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Request</ListItemText>
              </MenuItem>
            )}
          {hasPermission(PERMISSIONS.APPROVE_PETTY_CASH) &&
            selectedReplenishment?.status === "pending" && (
              <>
                <Divider />
                <MenuItem onClick={() => handleApprove(selectedReplenishment)}>
                  <ListItemIcon>
                    <ApprovedIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>Approve</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleReject(selectedReplenishment)}>
                  <ListItemIcon>
                    <RejectedIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Reject</ListItemText>
                </MenuItem>
              </>
            )}
          {hasPermission(PERMISSIONS.DISBURSE_PETTY_CASH) &&
            selectedReplenishment?.status === "approved" && (
              <MenuItem onClick={() => handleDisburse(selectedReplenishment)}>
                <ListItemIcon>
                  <MoneyIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText>Disburse</ListItemText>
              </MenuItem>
            )}
          <Divider />
          <MenuItem
            onClick={() => {
              /* Print replenishment voucher */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Voucher</ListItemText>
          </MenuItem>
        </Menu>

        {/* New Replenishment Request Dialog */}
        <Dialog
          open={requestDialogOpen}
          onClose={() => setRequestDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Request Petty Cash Replenishment</DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 3 }}>
              {requestSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Request Information */}
            {activeStep === 0 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Cash Book</InputLabel>
                    <Select
                      value={formData.petty_cash_book_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          petty_cash_book_id: e.target.value,
                        })
                      }
                      label="Cash Book"
                      required
                    >
                      {mockCashBooks.map((cashBook) => (
                        <MenuItem key={cashBook.id} value={cashBook.id}>
                          {cashBook.name} - TZS{" "}
                          {cashBook.balance.toLocaleString()} (Current Balance)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Request Amount (TZS)"
                    type="number"
                    value={formData.request_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        request_amount: e.target.value,
                      })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Urgency</InputLabel>
                    <Select
                      value={formData.urgency}
                      onChange={(e) =>
                        setFormData({ ...formData, urgency: e.target.value })
                      }
                      label="Urgency"
                    >
                      {urgencyLevels.map((urgency) => (
                        <MenuItem key={urgency.value} value={urgency.value}>
                          {urgency.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Expected Usage Period (days)"
                    type="number"
                    value={formData.expected_usage_period}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expected_usage_period: e.target.value,
                      })
                    }
                    helperText="Estimated number of days this amount will last"
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 2: Justification & Documents */}
            {activeStep === 1 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Justification"
                    value={formData.justification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        justification: e.target.value,
                      })
                    }
                    multiline
                    rows={4}
                    required
                    placeholder="Provide detailed justification for the replenishment request..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Supporting Documents
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AttachIcon />}
                    component="label"
                    fullWidth
                  >
                    Upload Documents
                    <input type="file" hidden multiple />
                  </Button>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Upload expense reports, forecasts, or other supporting
                    documents
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    multiline
                    rows={3}
                    placeholder="Any additional information..."
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 3: Review & Submit */}
            {activeStep === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Review Request Details
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Cash Book
                        </Typography>
                        <Typography variant="body1">
                          {
                            mockCashBooks.find(
                              (cb) =>
                                cb.id.toString() === formData.petty_cash_book_id
                            )?.name
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Request Amount
                        </Typography>
                        <Typography variant="h6" color="primary">
                          TZS{" "}
                          {Number(
                            formData.request_amount || 0
                          ).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Urgency
                        </Typography>
                        <Chip
                          label={
                            urgencyLevels.find(
                              (u) => u.value === formData.urgency
                            )?.label
                          }
                          size="small"
                          color={
                            urgencyLevels.find(
                              (u) => u.value === formData.urgency
                            )?.color
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Expected Usage Period
                        </Typography>
                        <Typography variant="body1">
                          {formData.expected_usage_period} days
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Justification
                        </Typography>
                        <Typography variant="body1">
                          {formData.justification}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            {activeStep > 0 && (
              <Button onClick={() => setActiveStep(activeStep - 1)}>
                Back
              </Button>
            )}
            {activeStep < requestSteps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SubmitIcon />}
              >
                Submit Request
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* View Replenishment Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Replenishment Request Details -{" "}
            {selectedReplenishment?.request_number}
          </DialogTitle>
          <DialogContent>
            {selectedReplenishment && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Request Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Cash Book
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedReplenishment.cash_book_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Department
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedReplenishment.department}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Custodian
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedReplenishment.custodian}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Requested By
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedReplenishment.requested_by}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Justification
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedReplenishment.justification}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Supporting Documents */}
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Supporting Documents
                        </Typography>
                        <List>
                          {selectedReplenishment.documents?.map(
                            (doc, index) => (
                              <ListItem key={index}>
                                <ListItemAvatar>
                                  <Avatar>
                                    <AttachIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <MUIListItemText
                                  primary={doc.name}
                                  secondary={`${doc.type.toUpperCase()} • Uploaded ${format(new Date(doc.uploaded_date), "dd/MM/yyyy")}`}
                                />
                              </ListItem>
                            )
                          )}
                        </List>
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
                            Previous Balance
                          </Typography>
                          <Typography variant="h6">
                            TZS{" "}
                            {selectedReplenishment.previous_balance?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Requested Amount
                          </Typography>
                          <Typography variant="h6" color="primary">
                            TZS{" "}
                            {selectedReplenishment.request_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        {selectedReplenishment.approved_amount && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Approved Amount
                            </Typography>
                            <Typography variant="h6" color="success.main">
                              TZS{" "}
                              {selectedReplenishment.approved_amount?.toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                        {selectedReplenishment.new_balance && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              New Balance
                            </Typography>
                            <Typography variant="h6" color="success.main">
                              TZS{" "}
                              {selectedReplenishment.new_balance?.toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={
                              replenishmentStatuses.find(
                                (s) => s.value === selectedReplenishment.status
                              )?.label
                            }
                            color={
                              replenishmentStatuses.find(
                                (s) => s.value === selectedReplenishment.status
                              )?.color
                            }
                            variant="filled"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Urgency
                          </Typography>
                          <Chip
                            label={
                              urgencyLevels.find(
                                (u) => u.value === selectedReplenishment.urgency
                              )?.label
                            }
                            color={
                              urgencyLevels.find(
                                (u) => u.value === selectedReplenishment.urgency
                              )?.color
                            }
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
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
                /* Print function */
              }}
            >
              Print Voucher
            </Button>
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

export default ReplenishmentPage;