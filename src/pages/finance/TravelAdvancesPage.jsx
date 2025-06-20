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
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  AttachMoney as AdvanceIcon,
  AccountBalance as PaymentIcon,
  Receipt as ExpenseIcon,
  Assignment as ReportIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  MonetizationOn as MoneyIcon,
  Person as PersonIcon,
  DateRange as DateIcon,
  Business as TravelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Send as SubmitIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalanceWallet as WalletIcon,
  CreditCard as CardIcon,
  TrendingUp as OutstandingIcon,
  TrendingDown as SettledIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, differenceInDays, addDays } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
// import { travelAPI } from '../../../services/api/travel.api';

const TravelAdvancesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [travelAdvances, setTravelAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    travel_request_id: requestId || "",
    employee_name: user?.full_name || "",
    employee_id: user?.employee_id || "",
    department: user?.department || "",
    advance_amount: "",
    advance_purpose: "",
    travel_destination: "",
    travel_start_date: null,
    travel_end_date: null,
    expected_expenses: "",
    payment_method: "bank_transfer",
    bank_account: "",
    justification: "",
    advance_type: "travel",
    currency: "TZS",
    repayment_due_date: null,
    notes: "",
  });

  const [settlementData, setSettlementData] = useState({
    settlement_amount: "",
    expense_receipts: "",
    refund_amount: "",
    additional_expense: "",
    settlement_notes: "",
    settlement_date: new Date(),
  });

  // Mock data for development
  const mockTravelAdvances = [
    {
      id: 1,
      advance_number: "ADV-2024-001",
      travel_request_number: "TR-2024-001",
      employee_name: "John Doe",
      employee_id: "EMP001",
      department: "Sales",
      advance_amount: 300000,
      travel_destination: "Nairobi, Kenya",
      travel_start_date: "2024-07-15",
      travel_end_date: "2024-07-17",
      advance_purpose: "Client meeting expenses",
      payment_method: "bank_transfer",
      status: "approved",
      payment_status: "paid",
      settlement_status: "pending",
      disbursed_amount: 300000,
      settled_amount: 0,
      outstanding_amount: 300000,
      created_date: "2024-06-20",
      approved_date: "2024-06-22",
      disbursed_date: "2024-06-23",
      due_date: "2024-08-15",
      approved_by: "Jane Smith",
      advance_type: "travel",
      currency: "TZS",
      days_outstanding: 25,
    },
    {
      id: 2,
      advance_number: "ADV-2024-002",
      travel_request_number: "TR-2024-002",
      employee_name: "Sarah Wilson",
      employee_id: "EMP002",
      department: "IT Department",
      advance_amount: 200000,
      travel_destination: "Mwanza, Tanzania",
      travel_start_date: "2024-07-20",
      travel_end_date: "2024-07-22",
      advance_purpose: "Training workshop advance",
      payment_method: "cash",
      status: "pending",
      payment_status: "pending",
      settlement_status: "not_applicable",
      disbursed_amount: 0,
      settled_amount: 0,
      outstanding_amount: 200000,
      created_date: "2024-06-25",
      approved_date: null,
      disbursed_date: null,
      due_date: "2024-08-20",
      approved_by: null,
      advance_type: "travel",
      currency: "TZS",
      days_outstanding: 0,
    },
    {
      id: 3,
      advance_number: "ADV-2024-003",
      travel_request_number: "TR-2024-003",
      employee_name: "Mike Johnson",
      employee_id: "EMP003",
      department: "Field Operations",
      advance_amount: 150000,
      travel_destination: "Dodoma, Tanzania",
      travel_start_date: "2024-07-01",
      travel_end_date: "2024-07-05",
      advance_purpose: "Field assessment expenses",
      payment_method: "bank_transfer",
      status: "approved",
      payment_status: "paid",
      settlement_status: "settled",
      disbursed_amount: 150000,
      settled_amount: 140000,
      outstanding_amount: 0,
      refund_amount: 10000,
      created_date: "2024-06-15",
      approved_date: "2024-06-16",
      disbursed_date: "2024-06-17",
      settlement_date: "2024-07-10",
      due_date: "2024-08-01",
      approved_by: "Jane Smith",
      advance_type: "travel",
      currency: "TZS",
      days_outstanding: 0,
    },
  ];

  // Advance statuses
  const advanceStatuses = [
    { value: "draft", label: "Draft", color: "default" },
    { value: "pending", label: "Pending Approval", color: "warning" },
    { value: "approved", label: "Approved", color: "success" },
    { value: "rejected", label: "Rejected", color: "error" },
    { value: "cancelled", label: "Cancelled", color: "default" },
  ];

  // Payment statuses
  const paymentStatuses = [
    { value: "pending", label: "Pending Payment", color: "warning" },
    { value: "paid", label: "Paid", color: "success" },
    { value: "failed", label: "Payment Failed", color: "error" },
  ];

  // Settlement statuses
  const settlementStatuses = [
    { value: "not_applicable", label: "N/A", color: "default" },
    { value: "pending", label: "Pending Settlement", color: "warning" },
    { value: "partial", label: "Partially Settled", color: "info" },
    { value: "settled", label: "Fully Settled", color: "success" },
    { value: "overdue", label: "Overdue", color: "error" },
  ];

  // Payment methods
  const paymentMethods = [
    { value: "bank_transfer", label: "Bank Transfer", icon: <PaymentIcon /> },
    { value: "cash", label: "Cash", icon: <MoneyIcon /> },
    { value: "mobile_money", label: "Mobile Money", icon: <CardIcon /> },
    { value: "check", label: "Check", icon: <AccountBalance /> },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Advances",
      value: mockTravelAdvances.length.toString(),
      icon: <AdvanceIcon />,
      color: "primary",
    },
    {
      title: "Outstanding Amount",
      value: `TZS ${mockTravelAdvances.reduce((sum, adv) => sum + adv.outstanding_amount, 0).toLocaleString()}`,
      icon: <OutstandingIcon />,
      color: "warning",
    },
    {
      title: "Settled This Month",
      value: `TZS ${mockTravelAdvances
        .filter((adv) => adv.settlement_status === "settled")
        .reduce((sum, adv) => sum + adv.settled_amount, 0)
        .toLocaleString()}`,
      icon: <SettledIcon />,
      color: "success",
    },
    {
      title: "Pending Settlement",
      value: mockTravelAdvances
        .filter((adv) => adv.settlement_status === "pending")
        .length.toString(),
      icon: <WarningIcon />,
      color: "error",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "advance_number",
      headerName: "Advance #",
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AdvanceIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "employee_info",
      headerName: "Employee",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.employee_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.department} • {params.row.employee_id}
          </Typography>
        </Box>
      ),
    },
    {
      field: "travel_info",
      headerName: "Travel Details",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.travel_destination}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(params.row.travel_start_date), "dd/MM/yyyy")} -{" "}
            {format(new Date(params.row.travel_end_date), "dd/MM/yyyy")}
          </Typography>
        </Box>
      ),
    },
    {
      field: "advance_amount",
      headerName: "Advance Amount",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "outstanding_amount",
      headerName: "Outstanding",
      width: 130,
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          color={params.value > 0 ? "warning.main" : "success.main"}
        >
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = advanceStatuses.find((s) => s.value === params.value);
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
      field: "payment_status",
      headerName: "Payment",
      width: 120,
      renderCell: (params) => {
        const status = paymentStatuses.find((s) => s.value === params.value);
        return (
          <Chip
            label={status?.label}
            size="small"
            color={status?.color}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "settlement_status",
      headerName: "Settlement",
      width: 130,
      renderCell: (params) => {
        const status = settlementStatuses.find((s) => s.value === params.value);
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
      field: "days_outstanding",
      headerName: "Days Outstanding",
      width: 130,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color={
            params.value > 30
              ? "error.main"
              : params.value > 0
                ? "warning.main"
                : "success.main"
          }
        >
          {params.value > 0 ? `${params.value} days` : "Settled"}
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
            setSelectedAdvance(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load travel advances data
  useEffect(() => {
    fetchTravelAdvances();
  }, []);

  const fetchTravelAdvances = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await travelAPI.getTravelAdvances();
      // setTravelAdvances(response.data || []);
      setTravelAdvances(mockTravelAdvances);
    } catch (error) {
      showError("Failed to fetch travel advances");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingAdvance) {
        // await travelAPI.updateTravelAdvance(editingAdvance.id, formData);
        showSuccess("Travel advance updated successfully");
      } else {
        // await travelAPI.createTravelAdvance(formData);
        showSuccess("Travel advance created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchTravelAdvances();
    } catch (error) {
      showError("Failed to save travel advance");
    }
  };

  // Handle settlement submission
  const handleSettlement = async () => {
    try {
      // await travelAPI.settleTravelAdvance(selectedAdvance.id, settlementData);
      showSuccess("Travel advance settled successfully");
      setSettlementDialogOpen(false);
      fetchTravelAdvances();
    } catch (error) {
      showError("Failed to settle travel advance");
    }
  };

  const resetForm = () => {
    setFormData({
      travel_request_id: requestId || "",
      employee_name: user?.full_name || "",
      employee_id: user?.employee_id || "",
      department: user?.department || "",
      advance_amount: "",
      advance_purpose: "",
      travel_destination: "",
      travel_start_date: null,
      travel_end_date: null,
      expected_expenses: "",
      payment_method: "bank_transfer",
      bank_account: "",
      justification: "",
      advance_type: "travel",
      currency: "TZS",
      repayment_due_date: null,
      notes: "",
    });
    setEditingAdvance(null);
  };

  // Handle edit
  const handleEdit = (advance) => {
    setFormData({ ...advance });
    setEditingAdvance(advance);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle approval actions
  const handleApprove = async (advance) => {
    try {
      // await travelAPI.approveTravelAdvance(advance.id);
      showSuccess("Travel advance approved successfully");
      fetchTravelAdvances();
    } catch (error) {
      showError("Failed to approve travel advance");
    }
    setAnchorEl(null);
  };

  const handleReject = async (advance) => {
    try {
      // await travelAPI.rejectTravelAdvance(advance.id);
      showSuccess("Travel advance rejected");
      fetchTravelAdvances();
    } catch (error) {
      showError("Failed to reject travel advance");
    }
    setAnchorEl(null);
  };

  // Handle payment actions
  const handleMarkAsPaid = async (advance) => {
    try {
      // await travelAPI.markAdvanceAsPaid(advance.id);
      showSuccess("Travel advance marked as paid");
      fetchTravelAdvances();
    } catch (error) {
      showError("Failed to update payment status");
    }
    setAnchorEl(null);
  };

  // Filter travel advances
  const filteredTravelAdvances = travelAdvances.filter((advance) => {
    const matchesSearch =
      advance.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advance.advance_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advance.travel_destination
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || advance.status === statusFilter;
    const matchesType = !typeFilter || advance.settlement_status === typeFilter;
    const matchesDepartment =
      !departmentFilter ||
      advance.department.toLowerCase().includes(departmentFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType && matchesDepartment;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Travel Advances Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage travel advance requests, payments, and settlements
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
                    placeholder="Search advances..."
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
                      {advanceStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Settlement</InputLabel>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      label="Settlement"
                    >
                      <MenuItem value="">All Settlements</MenuItem>
                      {settlementStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Department"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {hasPermission(PERMISSIONS.MANAGE_TRAVEL_ADVANCES) && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                      >
                        New Advance
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<TravelIcon />}
                      onClick={() => navigate("/finance/travel/requests")}
                    >
                      Requests
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
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Content Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
            >
              <Tab label="Travel Advances" />
              <Tab label="Settlement Tracking" />
              <Tab label="Outstanding Report" />
            </Tabs>

            {/* Travel Advances Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredTravelAdvances}
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

            {/* Settlement Tracking Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Settlement Tracking
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Advance #</TableCell>
                        <TableCell>Employee</TableCell>
                        <TableCell align="right">Advance Amount</TableCell>
                        <TableCell align="right">Settled Amount</TableCell>
                        <TableCell align="right">Outstanding</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTravelAdvances
                        .filter((adv) => adv.payment_status === "paid")
                        .map((advance) => (
                          <TableRow key={advance.id}>
                            <TableCell>{advance.advance_number}</TableCell>
                            <TableCell>{advance.employee_name}</TableCell>
                            <TableCell align="right">
                              TZS {advance.advance_amount.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              TZS {advance.settled_amount.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                color={
                                  advance.outstanding_amount > 0
                                    ? "warning.main"
                                    : "success.main"
                                }
                              >
                                TZS{" "}
                                {advance.outstanding_amount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                color={
                                  new Date(advance.due_date) < new Date() &&
                                  advance.outstanding_amount > 0
                                    ? "error.main"
                                    : "text.primary"
                                }
                              >
                                {format(
                                  new Date(advance.due_date),
                                  "dd/MM/yyyy"
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  settlementStatuses.find(
                                    (s) => s.value === advance.settlement_status
                                  )?.label
                                }
                                size="small"
                                color={
                                  settlementStatuses.find(
                                    (s) => s.value === advance.settlement_status
                                  )?.color
                                }
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell>
                              {advance.settlement_status === "pending" && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setSelectedAdvance(advance);
                                    setSettlementDialogOpen(true);
                                  }}
                                >
                                  Settle
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Outstanding Report Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Outstanding Advances Report
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Total outstanding amount: TZS{" "}
                    {mockTravelAdvances
                      .reduce((sum, adv) => sum + adv.outstanding_amount, 0)
                      .toLocaleString()}
                  </Typography>
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Aging Analysis
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: "success.main" }}>
                                <InfoIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <MUIListItemText
                              primary="0-30 Days"
                              secondary={`${filteredTravelAdvances.filter((adv) => adv.days_outstanding <= 30 && adv.outstanding_amount > 0).length} advances`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: "warning.main" }}>
                                <WarningIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <MUIListItemText
                              primary="31-60 Days"
                              secondary={`${filteredTravelAdvances.filter((adv) => adv.days_outstanding > 30 && adv.days_outstanding <= 60).length} advances`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: "error.main" }}>
                                <WarningIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <MUIListItemText
                              primary="60+ Days"
                              secondary={`${filteredTravelAdvances.filter((adv) => adv.days_outstanding > 60).length} advances`}
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
                          Department Breakdown
                        </Typography>
                        <Alert severity="info">
                          <Typography variant="body2">
                            Outstanding advances by department breakdown will be
                            displayed here.
                          </Typography>
                        </Alert>
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
          {hasPermission(PERMISSIONS.MANAGE_TRAVEL_ADVANCES) &&
            selectedAdvance?.status === "draft" && (
              <MenuItem onClick={() => handleEdit(selectedAdvance)}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Advance</ListItemText>
              </MenuItem>
            )}
          {selectedAdvance?.status === "pending" &&
            hasPermission(PERMISSIONS.APPROVE_TRAVEL_ADVANCES) && (
              <>
                <Divider />
                <MenuItem onClick={() => handleApprove(selectedAdvance)}>
                  <ListItemIcon>
                    <ApprovedIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>Approve</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleReject(selectedAdvance)}>
                  <ListItemIcon>
                    <RejectedIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Reject</ListItemText>
                </MenuItem>
              </>
            )}
          {selectedAdvance?.status === "approved" &&
            selectedAdvance?.payment_status === "pending" && (
              <MenuItem onClick={() => handleMarkAsPaid(selectedAdvance)}>
                <ListItemIcon>
                  <PaymentIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Mark as Paid</ListItemText>
              </MenuItem>
            )}
          {selectedAdvance?.settlement_status === "pending" && (
            <MenuItem
              onClick={() => {
                setSettlementDialogOpen(true);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <ExpenseIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settle Advance</ListItemText>
            </MenuItem>
          )}
          <Divider />
          <MenuItem
            onClick={() => {
              /* Print advance details */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print</ListItemText>
          </MenuItem>
        </Menu>

        {/* Add/Edit Travel Advance Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingAdvance ? "Edit Travel Advance" : "Create Travel Advance"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={formData.employee_name}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={formData.employee_id}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_id: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Travel Request ID"
                  value={formData.travel_request_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      travel_request_id: e.target.value,
                    })
                  }
                  placeholder="e.g., TR-2024-001"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Travel Destination"
                  value={formData.travel_destination}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      travel_destination: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., Nairobi, Kenya"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Travel Start Date"
                  value={formData.travel_start_date}
                  onChange={(date) =>
                    setFormData({ ...formData, travel_start_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Travel End Date"
                  value={formData.travel_end_date}
                  onChange={(date) =>
                    setFormData({ ...formData, travel_end_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Advance Amount (TZS)"
                  type="number"
                  value={formData.advance_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, advance_amount: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Advance Purpose"
                  value={formData.advance_purpose}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      advance_purpose: e.target.value,
                    })
                  }
                  multiline
                  rows={2}
                  required
                  placeholder="Describe the purpose of this advance..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expected Expenses (TZS)"
                  type="number"
                  value={formData.expected_expenses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expected_expenses: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Repayment Due Date"
                  value={formData.repayment_due_date}
                  onChange={(date) =>
                    setFormData({ ...formData, repayment_due_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Grid>
              {formData.payment_method === "bank_transfer" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bank Account Number"
                    value={formData.bank_account}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_account: e.target.value })
                    }
                    placeholder="Account number for bank transfer"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Justification"
                  value={formData.justification}
                  onChange={(e) =>
                    setFormData({ ...formData, justification: e.target.value })
                  }
                  multiline
                  rows={3}
                  placeholder="Justify why this advance is needed..."
                />
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
                  rows={2}
                  placeholder="Any additional notes or requirements..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setFormData({ ...formData, status: "draft" });
                handleSubmit();
              }}
              variant="outlined"
              startIcon={<SaveIcon />}
            >
              Save Draft
            </Button>
            <Button
              onClick={() => {
                setFormData({ ...formData, status: "pending" });
                handleSubmit();
              }}
              variant="contained"
              startIcon={<SubmitIcon />}
            >
              Submit for Approval
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settlement Dialog */}
        <Dialog
          open={settlementDialogOpen}
          onClose={() => setSettlementDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Settle Travel Advance - {selectedAdvance?.advance_number}
          </DialogTitle>
          <DialogContent>
            {selectedAdvance && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Advance Amount: TZS{" "}
                    {selectedAdvance.advance_amount?.toLocaleString()} |
                    Outstanding: TZS{" "}
                    {selectedAdvance.outstanding_amount?.toLocaleString()}
                  </Typography>
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total Expenses (TZS)"
                      type="number"
                      value={settlementData.settlement_amount}
                      onChange={(e) =>
                        setSettlementData({
                          ...settlementData,
                          settlement_amount: e.target.value,
                        })
                      }
                      required
                      helperText="Total amount of actual expenses incurred"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Receipts Amount (TZS)"
                      type="number"
                      value={settlementData.expense_receipts}
                      onChange={(e) =>
                        setSettlementData({
                          ...settlementData,
                          expense_receipts: e.target.value,
                        })
                      }
                      helperText="Amount supported by receipts"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Refund Amount (TZS)"
                      type="number"
                      value={settlementData.refund_amount}
                      onChange={(e) =>
                        setSettlementData({
                          ...settlementData,
                          refund_amount: e.target.value,
                        })
                      }
                      helperText="Amount to be refunded (if applicable)"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Additional Expense (TZS)"
                      type="number"
                      value={settlementData.additional_expense}
                      onChange={(e) =>
                        setSettlementData({
                          ...settlementData,
                          additional_expense: e.target.value,
                        })
                      }
                      helperText="Amount employee needs to pay back"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Settlement Date"
                      value={settlementData.settlement_date}
                      onChange={(date) =>
                        setSettlementData({
                          ...settlementData,
                          settlement_date: date,
                        })
                      }
                      slotProps={{
                        textField: { fullWidth: true },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Settlement Notes"
                      value={settlementData.settlement_notes}
                      onChange={(e) =>
                        setSettlementData({
                          ...settlementData,
                          settlement_notes: e.target.value,
                        })
                      }
                      multiline
                      rows={3}
                      placeholder="Notes about the settlement process..."
                    />
                  </Grid>
                </Grid>

                {/* Settlement Summary */}
                <Card
                  variant="outlined"
                  sx={{ mt: 3, p: 2, bgcolor: "grey.50" }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Settlement Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Advance Given
                      </Typography>
                      <Typography variant="h6">
                        TZS {selectedAdvance.advance_amount?.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Actual Expenses
                      </Typography>
                      <Typography variant="h6">
                        TZS{" "}
                        {(
                          settlementData.settlement_amount || 0
                        ).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Settlement Status
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          (settlementData.settlement_amount || 0) >
                          selectedAdvance.advance_amount
                            ? "error.main"
                            : (settlementData.settlement_amount || 0) <
                                selectedAdvance.advance_amount
                              ? "success.main"
                              : "primary.main"
                        }
                      >
                        {(settlementData.settlement_amount || 0) >
                        selectedAdvance.advance_amount
                          ? "Employee Owes"
                          : (settlementData.settlement_amount || 0) <
                              selectedAdvance.advance_amount
                            ? "Refund Due"
                            : "Exact Match"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Difference
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          Math.abs(
                            (settlementData.settlement_amount || 0) -
                              selectedAdvance.advance_amount
                          ) === 0
                            ? "success.main"
                            : (settlementData.settlement_amount || 0) >
                                selectedAdvance.advance_amount
                              ? "error.main"
                              : "warning.main"
                        }
                      >
                        TZS{" "}
                        {Math.abs(
                          (settlementData.settlement_amount || 0) -
                            selectedAdvance.advance_amount
                        ).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettlementDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSettlement}
              variant="contained"
              startIcon={<ExpenseIcon />}
            >
              Complete Settlement
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Travel Advance Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Travel Advance Details - {selectedAdvance?.advance_number}
          </DialogTitle>
          <DialogContent>
            {selectedAdvance && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Advance Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Employee Name
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedAdvance.employee_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Employee ID
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedAdvance.employee_id}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Department
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedAdvance.department}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Travel Request
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedAdvance.travel_request_number}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Purpose
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedAdvance.advance_purpose}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Destination
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedAdvance.travel_destination}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Travel Dates
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {format(
                                new Date(selectedAdvance.travel_start_date),
                                "dd/MM/yyyy"
                              )}{" "}
                              -{" "}
                              {format(
                                new Date(selectedAdvance.travel_end_date),
                                "dd/MM/yyyy"
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Payment Method
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {
                                paymentMethods.find(
                                  (m) =>
                                    m.value === selectedAdvance.payment_method
                                )?.label
                              }
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Created Date
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {format(
                                new Date(selectedAdvance.created_date),
                                "dd/MM/yyyy"
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
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
                            Advance Amount
                          </Typography>
                          <Typography variant="h6" color="primary">
                            TZS{" "}
                            {selectedAdvance.advance_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Disbursed Amount
                          </Typography>
                          <Typography variant="h6">
                            TZS{" "}
                            {selectedAdvance.disbursed_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Settled Amount
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            TZS{" "}
                            {selectedAdvance.settled_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Outstanding Amount
                          </Typography>
                          <Typography
                            variant="h6"
                            color={
                              selectedAdvance.outstanding_amount > 0
                                ? "warning.main"
                                : "success.main"
                            }
                          >
                            TZS{" "}
                            {selectedAdvance.outstanding_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        {selectedAdvance.refund_amount > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Refund Amount
                            </Typography>
                            <Typography variant="h6" color="info.main">
                              TZS{" "}
                              {selectedAdvance.refund_amount?.toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Status Information
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Advance Status
                          </Typography>
                          <Chip
                            label={
                              advanceStatuses.find(
                                (s) => s.value === selectedAdvance.status
                              )?.label
                            }
                            size="small"
                            color={
                              advanceStatuses.find(
                                (s) => s.value === selectedAdvance.status
                              )?.color
                            }
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Payment Status
                          </Typography>
                          <Chip
                            label={
                              paymentStatuses.find(
                                (s) =>
                                  s.value === selectedAdvance.payment_status
                              )?.label
                            }
                            size="small"
                            color={
                              paymentStatuses.find(
                                (s) =>
                                  s.value === selectedAdvance.payment_status
                              )?.color
                            }
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Settlement Status
                          </Typography>
                          <Chip
                            label={
                              settlementStatuses.find(
                                (s) =>
                                  s.value === selectedAdvance.settlement_status
                              )?.label
                            }
                            size="small"
                            color={
                              settlementStatuses.find(
                                (s) =>
                                  s.value === selectedAdvance.settlement_status
                              )?.color
                            }
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        {selectedAdvance.days_outstanding > 0 && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Days Outstanding
                            </Typography>
                            <Typography
                              variant="h6"
                              color={
                                selectedAdvance.days_outstanding > 30
                                  ? "error.main"
                                  : "warning.main"
                              }
                            >
                              {selectedAdvance.days_outstanding} days
                            </Typography>
                          </Box>
                        )}
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
                /* Print advance details */
              }}
            >
              Print
            </Button>
            {selectedAdvance?.settlement_status === "pending" && (
              <Button
                variant="contained"
                startIcon={<ExpenseIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  setSettlementDialogOpen(true);
                }}
              >
                Settle Advance
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
              <Button onClick={handleConfirm} color="error" variant="contained">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default TravelAdvancesPage;
