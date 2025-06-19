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
  Alert,
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
  Tooltip,
  LinearProgress,
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
  PlayArrow as ProcessIcon,
  CheckCircle as ApproveIcon,
  Print as PrintIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  MonetizationOn as MoneyIcon,
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

const PayrollPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [payrollSummary, setPayrollSummary] = useState({
    totalEmployees: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
    processed: 0,
    pending: 0,
    approved: 0,
  });

  // Sample data - replace with API calls
  const samplePayrollData = [
    {
      id: 1,
      employee_id: 1,
      employee_name: "John Doe",
      employee_number: "GHF001",
      department: "IT Department",
      position: "Software Developer",
      basic_salary: 1200000,
      allowances: 300000,
      overtime: 50000,
      gross_pay: 1550000,
      paye_tax: 155000,
      nhif: 17500,
      nssf: 24000,
      other_deductions: 0,
      total_deductions: 196500,
      net_pay: 1353500,
      pay_period: "2024-02",
      status: "processed",
      processed_date: "2024-02-28",
      approved_by: null,
      bank_account: "1234567890",
      bank_name: "CRDB Bank",
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: "Jane Smith",
      employee_number: "GHF002",
      department: "Finance",
      position: "Finance Officer",
      basic_salary: 1000000,
      allowances: 250000,
      overtime: 0,
      gross_pay: 1250000,
      paye_tax: 112500,
      nhif: 15000,
      nssf: 20000,
      other_deductions: 25000,
      total_deductions: 172500,
      net_pay: 1077500,
      pay_period: "2024-02",
      status: "pending",
      processed_date: null,
      approved_by: null,
      bank_account: "0987654321",
      bank_name: "NMB Bank",
    },
  ];

  useEffect(() => {
    fetchPayrollData();
    fetchPayrollSummary();
  }, [selectedPeriod, departmentFilter]);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const periodStr = format(selectedPeriod, "yyyy-MM");
      const filteredData = samplePayrollData.filter(
        (record) =>
          record.pay_period === periodStr &&
          (departmentFilter === "" || record.department === departmentFilter)
      );

      setPayrollRecords(filteredData);
    } catch (error) {
      showError("Failed to fetch payroll data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollSummary = () => {
    // Calculate summary from current data
    const summary = payrollRecords.reduce(
      (acc, record) => {
        acc.totalEmployees += 1;
        acc.totalGrossPay += record.gross_pay;
        acc.totalDeductions += record.total_deductions;
        acc.totalNetPay += record.net_pay;

        if (record.status === "processed") acc.processed += 1;
        else if (record.status === "pending") acc.pending += 1;
        else if (record.status === "approved") acc.approved += 1;

        return acc;
      },
      {
        totalEmployees: 0,
        totalGrossPay: 0,
        totalDeductions: 0,
        totalNetPay: 0,
        processed: 0,
        pending: 0,
        approved: 0,
      }
    );

    setPayrollSummary(summary);
  };

  const handleProcessPayroll = async () => {
    try {
      // API call to process payroll
      showSuccess("Payroll processing initiated successfully");
      setProcessDialogOpen(false);
      fetchPayrollData();
    } catch (error) {
      showError("Failed to process payroll");
    }
  };

  const handleApprovePayroll = async (payrollId) => {
    try {
      // API call to approve payroll
      showSuccess("Payroll approved successfully");
      fetchPayrollData();
    } catch (error) {
      showError("Failed to approve payroll");
    }
  };

  const handleGeneratePayslip = (payrollId) => {
    // Navigate to payslip generation or download
    window.open(`/api/payroll/payslips/${payrollId}`, "_blank");
  };

  const handleMenuClick = (event, payroll) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayroll(payroll);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayroll(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processed":
        return "success";
      case "approved":
        return "primary";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      field: "employee_number",
      headerName: "Employee #",
      width: 120,
    },
    {
      field: "employee_name",
      headerName: "Employee Name",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.employee_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.position}
          </Typography>
        </Box>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 150,
    },
    {
      field: "gross_pay",
      headerName: "Gross Pay",
      width: 130,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "total_deductions",
      headerName: "Deductions",
      width: 130,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "net_pay",
      headerName: "Net Pay",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="primary">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
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
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const summaryCards = [
    {
      title: "Total Employees",
      value: payrollSummary.totalEmployees,
      icon: <PeopleIcon />,
      color: "primary",
    },
    {
      title: "Gross Pay",
      value: formatCurrency(payrollSummary.totalGrossPay),
      icon: <MoneyIcon />,
      color: "success",
    },
    {
      title: "Total Deductions",
      value: formatCurrency(payrollSummary.totalDeductions),
      icon: <TrendingUpIcon />,
      color: "warning",
    },
    {
      title: "Net Pay",
      value: formatCurrency(payrollSummary.totalNetPay),
      icon: <BankIcon />,
      color: "info",
    },
  ];

  const filteredPayroll = payrollRecords
    .filter(
      (record) =>
        record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employee_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((record) => statusFilter === "" || record.status === statusFilter);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Payroll Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage employee payroll processing and salary payments
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
                  <DatePicker
                    label="Pay Period"
                    value={selectedPeriod}
                    onChange={setSelectedPeriod}
                    views={["year", "month"]}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processed">Processed</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Department"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    <MenuItem value="IT Department">IT Department</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="HR">Human Resources</MenuItem>
                    <MenuItem value="Admin">Administration</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {hasPermission(PERMISSIONS.PROCESS_PAYROLL) && (
                      <Button
                        variant="contained"
                        startIcon={<ProcessIcon />}
                        onClick={() => setProcessDialogOpen(true)}
                        size="small"
                      >
                        Process Payroll
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      size="small"
                    >
                      Export
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Data Grid */}
            {loading ? (
              <LoadingSpinner />
            ) : (
              <DataGrid
                rows={filteredPayroll}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                autoHeight
                sx={{
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              navigate(`/finance/payroll/${selectedPayroll?.id}`);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>

          {hasPermission(PERMISSIONS.UPDATE_PAYROLL) && (
            <MenuItem
              onClick={() => {
                navigate(`/finance/payroll/${selectedPayroll?.id}/edit`);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Payroll</ListItemText>
            </MenuItem>
          )}

          {hasPermission(PERMISSIONS.APPROVE_PAYROLL) &&
            selectedPayroll?.status === "processed" && (
              <MenuItem
                onClick={() => {
                  handleApprovePayroll(selectedPayroll.id);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <ApproveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Approve Payroll</ListItemText>
              </MenuItem>
            )}

          <MenuItem
            onClick={() => {
              handleGeneratePayslip(selectedPayroll?.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Generate Payslip</ListItemText>
          </MenuItem>
        </Menu>

        {/* Process Payroll Dialog */}
        <Dialog
          open={processDialogOpen}
          onClose={() => setProcessDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Process Payroll</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to process payroll for{" "}
                <strong>{format(selectedPeriod, "MMMM yyyy")}</strong>?
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                This action will calculate salaries, deductions, and generate
                payroll records for all active employees.
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Pay Period: {format(startOfMonth(selectedPeriod), "dd/MM/yyyy")}{" "}
                - {format(endOfMonth(selectedPeriod), "dd/MM/yyyy")}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProcessDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleProcessPayroll}
              variant="contained"
              startIcon={<ProcessIcon />}
            >
              Process Payroll
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default PayrollPage;
