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
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
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
  Payment as PayrollIcon,
  Calculate as CalculateIcon,
  PlayArrow as ProcessIcon,
  CheckCircle as ApproveIcon,
  Send as SendIcon,
  AccountBalance as BankIcon,
  Receipt as PayslipIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckBox as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  DateRange as DateIcon,
  Person as PersonIcon,
  MonetizationOn as MoneyIcon,
  Business as DepartmentIcon,
  Assignment as TaskIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  ExpandMore as ExpandMoreIcon,
  FileCopy as CopyIcon,
  Email as EmailIcon,
  AttachMoney as SalaryIcon,
  Savings as DeductionIcon,
  TrendingUp as BonusIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../../constants";
import useNotification from "../../../hooks/common/useNotification";
import useConfirmDialog from "../../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../../components/common/Loading";
// import { payrollAPI } from '../../../services/api/payroll.api';

const PayrollProcessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const payrollId = searchParams.get("payrollId");
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedPayrollPeriod, setSelectedPayrollPeriod] = useState(
    new Date()
  );
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Payroll processing steps
  const processingSteps = [
    {
      label: "Setup & Configuration",
      description: "Configure payroll period and parameters",
      icon: <SettingsIcon />,
    },
    {
      label: "Employee Selection",
      description: "Select employees for payroll processing",
      icon: <PersonIcon />,
    },
    {
      label: "Calculate Payroll",
      description: "Calculate salaries, deductions, and benefits",
      icon: <CalculateIcon />,
    },
    {
      label: "Review & Approve",
      description: "Review calculations and approve payroll",
      icon: <ApproveIcon />,
    },
    {
      label: "Process Payment",
      description: "Generate bank files and payslips",
      icon: <BankIcon />,
    },
    {
      label: "Finalize",
      description: "Complete payroll and send notifications",
      icon: <CheckIcon />,
    },
  ];

  // Mock data for development
  const mockPayrollRecords = [
    {
      id: 1,
      employee_id: "EMP001",
      employee_name: "John Doe",
      department: "IT Department",
      position: "Senior Developer",
      basic_salary: 1200000,
      gross_salary: 1450000,
      total_deductions: 290000,
      net_salary: 1160000,
      overtime_hours: 8,
      overtime_amount: 120000,
      bonus_amount: 50000,
      allowances: 80000,
      paye_tax: 180000,
      nhif: 15000,
      nssf: 20000,
      loan_deductions: 75000,
      bank_account: "1234567890",
      bank_name: "CRDB Bank",
      status: "calculated",
      attendance_days: 22,
      leave_days: 0,
      notes: "",
    },
    {
      id: 2,
      employee_id: "EMP002",
      employee_name: "Jane Smith",
      department: "Finance",
      position: "Finance Manager",
      basic_salary: 1500000,
      gross_salary: 1700000,
      total_deductions: 350000,
      net_salary: 1350000,
      overtime_hours: 4,
      overtime_amount: 60000,
      bonus_amount: 80000,
      allowances: 60000,
      paye_tax: 230000,
      nhif: 15000,
      nssf: 20000,
      loan_deductions: 85000,
      bank_account: "0987654321",
      bank_name: "NMB Bank",
      status: "calculated",
      attendance_days: 22,
      leave_days: 0,
      notes: "",
    },
    {
      id: 3,
      employee_id: "EMP003",
      employee_name: "Mike Johnson",
      department: "HR",
      position: "HR Officer",
      basic_salary: 900000,
      gross_salary: 1050000,
      total_deductions: 220000,
      net_salary: 830000,
      overtime_hours: 6,
      overtime_amount: 90000,
      bonus_amount: 30000,
      allowances: 30000,
      paye_tax: 140000,
      nhif: 15000,
      nssf: 20000,
      loan_deductions: 45000,
      bank_account: "5555666677",
      bank_name: "Equity Bank",
      status: "pending",
      attendance_days: 20,
      leave_days: 2,
      notes: "Sick leave adjustment required",
    },
  ];

  const mockPayrollSummary = {
    period: "2024-06",
    total_employees: 3,
    processed_employees: 2,
    pending_employees: 1,
    total_gross: 4200000,
    total_deductions: 860000,
    total_net: 3340000,
    total_paye: 550000,
    total_nhif: 45000,
    total_nssf: 60000,
    status: "in_progress",
    created_by: user?.name || "System Admin",
    created_at: new Date().toISOString(),
  };

  // Payroll statuses
  const payrollStatuses = [
    { value: "draft", label: "Draft", color: "default" },
    { value: "pending", label: "Pending", color: "warning" },
    { value: "calculated", label: "Calculated", color: "info" },
    { value: "approved", label: "Approved", color: "success" },
    { value: "processed", label: "Processed", color: "primary" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "rejected", label: "Rejected", color: "error" },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Employees",
      value: mockPayrollSummary.total_employees.toString(),
      subtitle: `${mockPayrollSummary.processed_employees} processed`,
      icon: <PersonIcon />,
      color: "primary",
    },
    {
      title: "Gross Payroll",
      value: `TZS ${mockPayrollSummary.total_gross.toLocaleString()}`,
      subtitle: "Total gross amount",
      icon: <SalaryIcon />,
      color: "success",
    },
    {
      title: "Total Deductions",
      value: `TZS ${mockPayrollSummary.total_deductions.toLocaleString()}`,
      subtitle: "All deductions",
      icon: <DeductionIcon />,
      color: "warning",
    },
    {
      title: "Net Payroll",
      value: `TZS ${mockPayrollSummary.total_net.toLocaleString()}`,
      subtitle: "Final payout",
      icon: <MoneyIcon />,
      color: "info",
    },
  ];

  // DataGrid columns for payroll records
  const columns = [
    {
      field: "selection",
      headerName: "",
      width: 50,
      sortable: false,
      renderHeader: () => (
        <Checkbox
          checked={selectAll}
          indeterminate={
            selectedEmployees.length > 0 &&
            selectedEmployees.length < payrollRecords.length
          }
          onChange={handleSelectAll}
        />
      ),
      renderCell: (params) => (
        <Checkbox
          checked={selectedEmployees.includes(params.row.id)}
          onChange={() => handleEmployeeSelect(params.row.id)}
        />
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
            {params.row.employee_id} • {params.row.position}
          </Typography>
        </Box>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          icon={<DepartmentIcon />}
        />
      ),
    },
    {
      field: "basic_salary",
      headerName: "Basic Salary",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "gross_salary",
      headerName: "Gross Salary",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="success.main">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "total_deductions",
      headerName: "Deductions",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="warning.main">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "net_salary",
      headerName: "Net Salary",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="primary.main">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "attendance_info",
      headerName: "Attendance",
      width: 100,
      renderCell: (params) => (
        <Box>
          <Typography variant="caption">
            {params.row.attendance_days} days
          </Typography>
          {params.row.leave_days > 0 && (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ display: "block" }}
            >
              {params.row.leave_days} leave
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const status = payrollStatuses.find((s) => s.value === params.value);
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
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            setSelectedEmployee(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load payroll data
  useEffect(() => {
    fetchPayrollData();
  }, [selectedPayrollPeriod]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await payrollAPI.getPayrollProcess({
      //   period: format(selectedPayrollPeriod, 'yyyy-MM'),
      //   include_calculations: true
      // });
      // setPayrollRecords(response.data.records || []);
      // setPayrollSummary(response.data.summary || {});
      setPayrollRecords(mockPayrollRecords);
      setPayrollSummary(mockPayrollSummary);
    } catch (error) {
      showError("Failed to fetch payroll data");
    } finally {
      setLoading(false);
    }
  };

  // Handle employee selection
  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(payrollRecords.map((record) => record.id));
    }
    setSelectAll(!selectAll);
  };

  // Payroll processing functions
  const handleCalculatePayroll = async () => {
    if (selectedEmployees.length === 0) {
      showWarning("Please select employees to calculate payroll");
      return;
    }

    openDialog({
      title: "Calculate Payroll",
      message: `Calculate payroll for ${selectedEmployees.length} selected employees for ${format(selectedPayrollPeriod, "MMMM yyyy")}?`,
      onConfirm: async () => {
        try {
          setProcessing(true);
          // Replace with actual API call
          // await payrollAPI.calculatePayroll({
          //   period: format(selectedPayrollPeriod, 'yyyy-MM'),
          //   employee_ids: selectedEmployees
          // });

          // Simulate processing delay
          await new Promise((resolve) => setTimeout(resolve, 2000));

          showSuccess("Payroll calculated successfully");
          setActiveStep(2); // Move to review step
          fetchPayrollData();
        } catch (error) {
          showError("Failed to calculate payroll");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleApprovePayroll = async () => {
    openDialog({
      title: "Approve Payroll",
      message: "Approve payroll calculations? This action cannot be undone.",
      onConfirm: async () => {
        try {
          setProcessing(true);
          // Replace with actual API call
          // await payrollAPI.approvePayroll({
          //   period: format(selectedPayrollPeriod, 'yyyy-MM')
          // });

          showSuccess("Payroll approved successfully");
          setActiveStep(4); // Move to payment step
          fetchPayrollData();
        } catch (error) {
          showError("Failed to approve payroll");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleProcessPayment = async () => {
    openDialog({
      title: "Process Payment",
      message:
        "Generate bank files and process payments? This will finalize the payroll.",
      onConfirm: async () => {
        try {
          setProcessing(true);
          // Replace with actual API call
          // await payrollAPI.processPayment({
          //   period: format(selectedPayrollPeriod, 'yyyy-MM')
          // });

          showSuccess("Payment processing initiated");
          setActiveStep(5); // Move to finalize step
          fetchPayrollData();
        } catch (error) {
          showError("Failed to process payment");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleFinalizePayroll = async () => {
    openDialog({
      title: "Finalize Payroll",
      message:
        "Finalize payroll and send notifications? This completes the payroll process.",
      onConfirm: async () => {
        try {
          setProcessing(true);
          // Replace with actual API call
          // await payrollAPI.finalizePayroll({
          //   period: format(selectedPayrollPeriod, 'yyyy-MM')
          // });

          showSuccess("Payroll finalized successfully");
          navigate("/finance/payroll");
        } catch (error) {
          showError("Failed to finalize payroll");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  // Generate reports and files
  const handleGeneratePayslips = async () => {
    try {
      // Replace with actual API call
      // await payrollAPI.generatePayslips({
      //   period: format(selectedPayrollPeriod, 'yyyy-MM'),
      //   employee_ids: selectedEmployees.length > 0 ? selectedEmployees : null
      // });
      showSuccess("Payslips generated successfully");
    } catch (error) {
      showError("Failed to generate payslips");
    }
  };

  const handleGenerateBankFile = async () => {
    try {
      // Replace with actual API call
      // const response = await payrollAPI.generateBankFile({
      //   period: format(selectedPayrollPeriod, 'yyyy-MM')
      // });
      showSuccess("Bank file generated successfully");
    } catch (error) {
      showError("Failed to generate bank file");
    }
  };

  // Filter payroll records
  const filteredPayrollRecords = payrollRecords.filter((record) => {
    const matchesSearch =
      record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !departmentFilter || record.department === departmentFilter;
    const matchesStatus = !statusFilter || record.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
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
            <Typography variant="h4">Payroll Processing</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchPayrollData}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setSettingsDialogOpen(true)}
              >
                Settings
              </Button>
              <Button
                variant="contained"
                startIcon={<PayrollIcon />}
                onClick={() => navigate("/finance/payroll")}
              >
                Back to Payroll
              </Button>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Process employee payroll for{" "}
            {format(selectedPayrollPeriod, "MMMM yyyy")}
          </Typography>
        </Box>

        {/* Processing Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Payroll Processing Workflow
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {processingSteps.map((step, index) => (
                <Step key={index}>
                  <StepLabel
                    icon={step.icon}
                    optional={
                      <Typography variant="caption">
                        {step.description}
                      </Typography>
                    }
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

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
            {/* Filters and Actions */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search employees..."
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
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      label="Department"
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      <MenuItem value="IT Department">IT Department</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                      <MenuItem value="HR">HR</MenuItem>
                      <MenuItem value="Operations">Operations</MenuItem>
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
                      {payrollStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="Payroll Period"
                    value={selectedPayrollPeriod}
                    onChange={setSelectedPayrollPeriod}
                    views={["year", "month"]}
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={
                        processing ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CalculateIcon />
                        )
                      }
                      onClick={handleCalculatePayroll}
                      disabled={processing || selectedEmployees.length === 0}
                      size="small"
                    >
                      Calculate
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ApproveIcon />}
                      onClick={handleApprovePayroll}
                      disabled={processing}
                      size="small"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<BankIcon />}
                      onClick={handleProcessPayment}
                      disabled={processing}
                      size="small"
                    >
                      Process
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
              <Tab label="Employee Payroll" />
              <Tab label="Summary Report" />
              <Tab label="Deductions Breakdown" />
              <Tab label="Bank File Preview" />
            </Tabs>

            {/* Employee Payroll Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                {selectedEmployees.length > 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {selectedEmployees.length} employee(s) selected for
                      processing
                    </Typography>
                  </Alert>
                )}
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredPayrollRecords}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    checkboxSelection={false}
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

            {/* Summary Report Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Payroll Summary
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell>Total Employees</TableCell>
                                <TableCell align="right">
                                  {mockPayrollSummary.total_employees}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Processed</TableCell>
                                <TableCell align="right">
                                  {mockPayrollSummary.processed_employees}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Pending</TableCell>
                                <TableCell align="right">
                                  {mockPayrollSummary.pending_employees}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Total Gross Salary</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>
                                    TZS{" "}
                                    {mockPayrollSummary.total_gross.toLocaleString()}
                                  </strong>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Total PAYE Tax</TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {mockPayrollSummary.total_paye.toLocaleString()}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Total NHIF</TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {mockPayrollSummary.total_nhif.toLocaleString()}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Total NSSF</TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {mockPayrollSummary.total_nssf.toLocaleString()}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <strong>Total Deductions</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>
                                    TZS{" "}
                                    {mockPayrollSummary.total_deductions.toLocaleString()}
                                  </strong>
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ bgcolor: "primary.50" }}>
                                <TableCell>
                                  <strong>Net Payroll Amount</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>
                                    TZS{" "}
                                    {mockPayrollSummary.total_net.toLocaleString()}
                                  </strong>
                                </TableCell>
                              </TableRow>
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
                          Processing Status
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Current Status
                          </Typography>
                          <Chip
                            label={
                              payrollStatuses.find(
                                (s) => s.value === mockPayrollSummary.status
                              )?.label
                            }
                            color={
                              payrollStatuses.find(
                                (s) => s.value === mockPayrollSummary.status
                              )?.color
                            }
                            variant="filled"
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Processing Progress
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={
                              (mockPayrollSummary.processed_employees /
                                mockPayrollSummary.total_employees) *
                              100
                            }
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ mt: 0.5, display: "block" }}
                          >
                            {mockPayrollSummary.processed_employees} of{" "}
                            {mockPayrollSummary.total_employees} completed
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Created By
                          </Typography>
                          <Typography variant="body1">
                            {mockPayrollSummary.created_by}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Created Date
                          </Typography>
                          <Typography variant="body1">
                            {format(
                              new Date(mockPayrollSummary.created_at),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Deductions Breakdown Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Deductions Breakdown
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                          Statutory Deductions
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="right">Employees</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>PAYE Tax</TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {mockPayrollSummary.total_paye.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                  {mockPayrollSummary.total_employees}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>NHIF</TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {mockPayrollSummary.total_nhif.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                  {mockPayrollSummary.total_employees}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>NSSF</TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {mockPayrollSummary.total_nssf.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                  {mockPayrollSummary.total_employees}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                          Other Deductions
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="right">Employees</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>Loan Repayments</TableCell>
                                <TableCell align="right">TZS 205,000</TableCell>
                                <TableCell align="right">3</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Insurance</TableCell>
                                <TableCell align="right">TZS 45,000</TableCell>
                                <TableCell align="right">2</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Union Dues</TableCell>
                                <TableCell align="right">TZS 15,000</TableCell>
                                <TableCell align="right">1</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Bank File Preview Tab */}
            {activeTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Bank File Preview</Typography>
                  <Button
                    variant="contained"
                    startIcon={<BankIcon />}
                    onClick={handleGenerateBankFile}
                  >
                    Generate Bank File
                  </Button>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Employee Name</TableCell>
                        <TableCell>Bank Account</TableCell>
                        <TableCell>Bank Name</TableCell>
                        <TableCell align="right">Net Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPayrollRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.employee_id}</TableCell>
                          <TableCell>{record.employee_name}</TableCell>
                          <TableCell>{record.bank_account}</TableCell>
                          <TableCell>{record.bank_name}</TableCell>
                          <TableCell align="right">
                            TZS {record.net_salary.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: "grey.100" }}>
                        <TableCell colSpan={4} sx={{ fontWeight: "bold" }}>
                          Total Transfer Amount
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          TZS{" "}
                          {filteredPayrollRecords
                            .reduce((sum, record) => sum + record.net_salary, 0)
                            .toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PayslipIcon />}
                  onClick={handleGeneratePayslips}
                >
                  Generate Payslips
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={() => showSuccess("Email notifications sent")}
                >
                  Send Notifications
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => showSuccess("Payroll report exported")}
                >
                  Export Report
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CheckIcon />}
                  onClick={handleFinalizePayroll}
                  color="success"
                >
                  Finalize Payroll
                </Button>
              </Grid>
            </Grid>
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
          {hasPermission(PERMISSIONS.MANAGE_PAYROLL) && (
            <MenuItem
              onClick={() => {
                // Handle edit payroll record
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Record</ListItemText>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              // Generate individual payslip
              showSuccess("Payslip generated");
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <PayslipIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Generate Payslip</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              // Print payroll record
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Record</ListItemText>
          </MenuItem>
        </Menu>

        {/* Employee Payroll Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Payroll Details - {selectedEmployee?.employee_name}
          </DialogTitle>
          <DialogContent>
            {selectedEmployee && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Employee Information
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Employee ID
                          </Typography>
                          <Typography variant="body1">
                            {selectedEmployee.employee_id}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Department
                          </Typography>
                          <Typography variant="body1">
                            {selectedEmployee.department}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Position
                          </Typography>
                          <Typography variant="body1">
                            {selectedEmployee.position}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Bank Details
                          </Typography>
                          <Typography variant="body1">
                            {selectedEmployee.bank_name} -{" "}
                            {selectedEmployee.bank_account}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Salary Breakdown
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell>Basic Salary</TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {selectedEmployee.basic_salary?.toLocaleString()}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  Overtime ({selectedEmployee.overtime_hours}h)
                                </TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {selectedEmployee.overtime_amount?.toLocaleString()}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Bonus</TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {selectedEmployee.bonus_amount?.toLocaleString()}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Allowances</TableCell>
                                <TableCell align="right">
                                  TZS{" "}
                                  {selectedEmployee.allowances?.toLocaleString()}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ bgcolor: "success.50" }}>
                                <TableCell>
                                  <strong>Gross Salary</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>
                                    TZS{" "}
                                    {selectedEmployee.gross_salary?.toLocaleString()}
                                  </strong>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Deductions
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Statutory Deductions</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>PAYE Tax</TableCell>
                                    <TableCell align="right">
                                      TZS{" "}
                                      {selectedEmployee.paye_tax?.toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>NHIF</TableCell>
                                    <TableCell align="right">
                                      TZS{" "}
                                      {selectedEmployee.nhif?.toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>NSSF</TableCell>
                                    <TableCell align="right">
                                      TZS{" "}
                                      {selectedEmployee.nssf?.toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Other Deductions</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>Loan Repayments</TableCell>
                                    <TableCell align="right">
                                      TZS{" "}
                                      {selectedEmployee.loan_deductions?.toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <strong>Total Deductions</strong>
                                    </TableCell>
                                    <TableCell align="right">
                                      <strong>
                                        TZS{" "}
                                        {selectedEmployee.total_deductions?.toLocaleString()}
                                      </strong>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                        </Grid>
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: "primary.50",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="h6" color="primary">
                            Net Salary: TZS{" "}
                            {selectedEmployee.net_salary?.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                {selectedEmployee.notes && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Notes:</strong> {selectedEmployee.notes}
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button
              variant="outlined"
              startIcon={<PayslipIcon />}
              onClick={() => {
                showSuccess("Payslip generated");
                setViewDialogOpen(false);
              }}
            >
              Generate Payslip
            </Button>
            {hasPermission(PERMISSIONS.MANAGE_PAYROLL) && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  // Navigate to edit or open edit dialog
                }}
              >
                Edit Record
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Payroll Settings Dialog */}
        <Dialog
          open={settingsDialogOpen}
          onClose={() => setSettingsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Payroll Processing Settings</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Auto-calculate overtime"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Include attendance bonus"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch />}
                  label="Prorate for late joiners"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Send email notifications"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PAYE Tax Rate (%)"
                  type="number"
                  defaultValue={30}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Overtime Rate Multiplier"
                  type="number"
                  defaultValue={1.5}
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                setSettingsDialogOpen(false);
                showSuccess("Settings saved successfully");
              }}
            >
              Save Settings
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

export default PayrollProcessPage;
