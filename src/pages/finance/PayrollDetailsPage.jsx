import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Send as SendIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Payment as PaymentIcon,
  Receipt as PayslipIcon,
  MonetizationOn as MoneyIcon,
  Person as PersonIcon,
  Business as DepartmentIcon,
  DateRange as DateIcon,
  TrendingUp as BonusIcon,
  TrendingDown as DeductionIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Description as DocumentIcon,
  Timeline as HistoryIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as AddressIcon,
  Work as PositionIcon,
  Schedule as ScheduleIcon,
  Calculate as CalculateIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { payrollAPI } from '../../../services/api/payroll.api';

const PayrollDetailsPage = () => {
  const navigate = useNavigate();
  const { id: payrollId } = useParams();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } = useConfirmDialog();

  // State management
  const [payrollRecord, setPayrollRecord] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [payslipDialogOpen, setPayslipDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  // Form state for adjustments
  const [adjustmentData, setAdjustmentData] = useState({
    adjustment_type: 'bonus',
    amount: '',
    description: '',
    effective_date: new Date(),
  });

  // Mock data for development
  const mockPayrollRecord = {
    id: payrollId || 1,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_number: 'EMP001',
    department: 'IT Department',
    position: 'Senior Software Developer',
    employment_type: 'full_time',
    pay_period: '2024-06',
    pay_date: '2024-06-30',
    pay_frequency: 'monthly',
    currency: 'TZS',
    
    // Personal Information
    email: 'john.doe@ghfoundation.org',
    phone: '+255 123 456 789',
    address: '123 Uhuru Street, Dar es Salaam',
    bank_name: 'NBC Bank',
    bank_account: '1234567890',
    
    // Basic Salary Information
    basic_salary: 2500000,
    gross_salary: 3200000,
    net_salary: 2560000,
    total_deductions: 640000,
    total_allowances: 700000,
    
    // Earnings Breakdown
    earnings: [
      { name: 'Basic Salary', amount: 2500000, type: 'basic', taxable: true },
      { name: 'Housing Allowance', amount: 400000, type: 'allowance', taxable: true },
      { name: 'Transport Allowance', amount: 200000, type: 'allowance', taxable: false },
      { name: 'Performance Bonus', amount: 100000, type: 'bonus', taxable: true },
    ],
    
    // Deductions Breakdown
    deductions: [
      { name: 'PAYE Tax', amount: 320000, type: 'tax', mandatory: true },
      { name: 'NSSF Contribution', amount: 120000, type: 'social_security', mandatory: true },
      { name: 'Health Insurance', amount: 80000, type: 'insurance', mandatory: false },
      { name: 'Staff Loan Repayment', amount: 120000, type: 'loan', mandatory: false },
    ],
    
    // Attendance & Time
    days_worked: 22,
    total_working_days: 22,
    overtime_hours: 8,
    overtime_rate: 15000,
    overtime_amount: 120000,
    leave_days: 0,
    sick_days: 0,
    
    // Status & Approval
    status: 'approved',
    approval_stage: 3,
    total_stages: 3,
    processed_by: 'Jane Smith',
    approved_by: 'Mike Johnson',
    processed_date: '2024-06-28',
    approved_date: '2024-06-29',
    payment_status: 'paid',
    payment_date: '2024-06-30',
    payment_method: 'bank_transfer',
    
    // Additional Information
    notes: 'Regular monthly payroll processing',
    tax_year: '2024',
    tax_period: '06',
    payslip_generated: true,
    payslip_sent: true,
    
    // Calculations
    taxable_income: 3000000,
    tax_relief: 150000,
    tax_before_relief: 470000,
    final_tax: 320000,
    pension_contribution: 120000,
    
    // Year to Date
    ytd_gross: 19200000,
    ytd_tax: 1920000,
    ytd_net: 15360000,
    ytd_pension: 720000,
  };

  const mockPayrollHistory = [
    {
      id: 1,
      pay_period: '2024-06',
      gross_salary: 3200000,
      net_salary: 2560000,
      status: 'paid',
      pay_date: '2024-06-30'
    },
    {
      id: 2,
      pay_period: '2024-05',
      gross_salary: 3100000,
      net_salary: 2480000,
      status: 'paid',
      pay_date: '2024-05-31'
    },
    {
      id: 3,
      pay_period: '2024-04',
      gross_salary: 3100000,
      net_salary: 2480000,
      status: 'paid',
      pay_date: '2024-04-30'
    },
  ];

  // Payroll statuses
  const payrollStatuses = [
    { value: 'draft', label: 'Draft', color: 'default', icon: <DocumentIcon /> },
    { value: 'pending', label: 'Pending Approval', color: 'warning', icon: <ScheduleIcon /> },
    { value: 'approved', label: 'Approved', color: 'success', icon: <ApproveIcon /> },
    { value: 'rejected', label: 'Rejected', color: 'error', icon: <RejectIcon /> },
    { value: 'paid', label: 'Paid', color: 'primary', icon: <PaymentIcon /> },
  ];

  // Payment statuses
  const paymentStatuses = [
    { value: 'pending', label: 'Pending Payment', color: 'warning' },
    { value: 'processing', label: 'Processing', color: 'info' },
    { value: 'paid', label: 'Paid', color: 'success' },
    { value: 'failed', label: 'Payment Failed', color: 'error' },
  ];

  // Approval stages
  const approvalStages = [
    'HR Review',
    'Finance Approval',
    'Final Authorization',
  ];

  // Load payroll details
  useEffect(() => {
    fetchPayrollDetails();
    fetchPayrollHistory();
  }, [payrollId, employeeId]);

  const fetchPayrollDetails = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await payrollAPI.getPayrollDetails(payrollId || employeeId);
      // setPayrollRecord(response.data);
      setPayrollRecord(mockPayrollRecord);
    } catch (error) {
      showError('Failed to fetch payroll details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollHistory = async () => {
    try {
      // Replace with actual API call
      // const response = await payrollAPI.getEmployeePayrollHistory(employeeId || mockPayrollRecord.employee_id);
      // setPayrollHistory(response.data || []);
      setPayrollHistory(mockPayrollHistory);
    } catch (error) {
      showError('Failed to fetch payroll history');
    }
  };

  // Handle payroll actions
  const handleApprovePayroll = async () => {
    try {
      // await payrollAPI.approvePayroll(payrollRecord.id);
      showSuccess('Payroll approved successfully');
      fetchPayrollDetails();
    } catch (error) {
      showError('Failed to approve payroll');
    }
    setApprovalDialogOpen(false);
  };

  const handleRejectPayroll = async (reason) => {
    try {
      // await payrollAPI.rejectPayroll(payrollRecord.id, { reason });
      showSuccess('Payroll rejected');
      fetchPayrollDetails();
    } catch (error) {
      showError('Failed to reject payroll');
    }
    setApprovalDialogOpen(false);
  };

  const handleProcessPayment = async () => {
    try {
      // await payrollAPI.processPayment(payrollRecord.id);
      showSuccess('Payment processed successfully');
      fetchPayrollDetails();
    } catch (error) {
      showError('Failed to process payment');
    }
    setPaymentDialogOpen(false);
  };

  const handleGeneratePayslip = async () => {
    try {
      // const response = await payrollAPI.generatePayslip(payrollRecord.id);
      // // Handle PDF download or display
      showSuccess('Payslip generated successfully');
    } catch (error) {
      showError('Failed to generate payslip');
    }
  };

  const handleSendPayslip = async () => {
    try {
      // await payrollAPI.sendPayslip(payrollRecord.id);
      showSuccess('Payslip sent to employee email');
    } catch (error) {
      showError('Failed to send payslip');
    }
  };

  const handleAddAdjustment = async () => {
    try {
      // await payrollAPI.addPayrollAdjustment(payrollRecord.id, adjustmentData);
      showSuccess('Payroll adjustment added successfully');
      setAdjustmentDialogOpen(false);
      fetchPayrollDetails();
    } catch (error) {
      showError('Failed to add adjustment');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!payrollRecord) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Payroll record not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/finance/payroll')}
          sx={{ mt: 2 }}
        >
          Back to Payroll
        </Button>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/finance/payroll')}
            sx={{ textDecoration: 'none' }}
          >
            Payroll Management
          </Link>
          <Typography color="text.primary">
            {payrollRecord.employee_name} - {format(new Date(payrollRecord.pay_period + '-01'), 'MMMM yyyy')}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/finance/payroll')}>
                <BackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4">
                  Payroll Details
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {payrollRecord.employee_name} • {payrollRecord.employee_number} • {format(new Date(payrollRecord.pay_period + '-01'), 'MMMM yyyy')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PayslipIcon />}
                onClick={() => setPayslipDialogOpen(true)}
              >
                View Payslip
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleGeneratePayslip}
              >
                Download
              </Button>
              {hasPermission(PERMISSIONS.MANAGE_PAYROLL) && payrollRecord.status === 'pending' && (
                <Button
                  variant="contained"
                  startIcon={<ApproveIcon />}
                  onClick={() => setApprovalDialogOpen(true)}
                >
                  Approve
                </Button>
              )}
              {hasPermission(PERMISSIONS.MANAGE_PAYROLL) && payrollRecord.status === 'approved' && payrollRecord.payment_status === 'pending' && (
                <Button
                  variant="contained"
                  startIcon={<PaymentIcon />}
                  onClick={() => setPaymentDialogOpen(true)}
                  color="success"
                >
                  Process Payment
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Status Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" component="div">
                      TZS {payrollRecord.gross_salary?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gross Salary
                    </Typography>
                  </Box>
                  <MoneyIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" component="div">
                      TZS {payrollRecord.net_salary?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Net Salary
                    </Typography>
                  </Box>
                  <PaymentIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Chip
                      label={payrollStatuses.find(s => s.value === payrollRecord.status)?.label}
                      color={payrollStatuses.find(s => s.value === payrollRecord.status)?.color}
                      variant="filled"
                      icon={payrollStatuses.find(s => s.value === payrollRecord.status)?.icon}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Payroll Status
                    </Typography>
                  </Box>
                  <SuccessIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Chip
                      label={paymentStatuses.find(s => s.value === payrollRecord.payment_status)?.label}
                      color={paymentStatuses.find(s => s.value === payrollRecord.payment_status)?.color}
                      variant="filled"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Payment Status
                    </Typography>
                  </Box>
                  <BankIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Content Tabs */}
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Employee Details" />
              <Tab label="Salary Breakdown" />
              <Tab label="Approval Workflow" />
              <Tab label="Payment Information" />
              <Tab label="Payroll History" />
            </Tabs>

            {/* Employee Details Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Employee Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <PersonIcon color="primary" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Full Name
                                </Typography>
                                <Typography variant="body1">
                                  {payrollRecord.employee_name}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <PersonIcon color="primary" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Employee Number
                                </Typography>
                                <Typography variant="body1">
                                  {payrollRecord.employee_number}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <DepartmentIcon color="primary" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Department
                                </Typography>
                                <Typography variant="body1">
                                  {payrollRecord.department}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <PositionIcon color="primary" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Position
                                </Typography>
                                <Typography variant="body1">
                                  {payrollRecord.position}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <EmailIcon color="primary" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Email
                                </Typography>
                                <Typography variant="body1">
                                  {payrollRecord.email}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <PhoneIcon color="primary" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Phone
                                </Typography>
                                <Typography variant="body1">
                                  {payrollRecord.phone}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <AddressIcon color="primary" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Address
                                </Typography>
                                <Typography variant="body1">
                                  {payrollRecord.address}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Attendance Information */}
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Attendance & Time Information
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" color="primary">
                                {payrollRecord.days_worked}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Days Worked
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5">
                                {payrollRecord.total_working_days}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Working Days
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" color="warning.main">
                                {payrollRecord.overtime_hours}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Overtime Hours
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" color="success.main">
                                TZS {payrollRecord.overtime_amount?.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Overtime Pay
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    {/* Bank Information */}
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Bank Information
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <BankIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Bank Name
                            </Typography>
                            <Typography variant="body1">
                              {payrollRecord.bank_name}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <CardIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Account Number
                            </Typography>
                            <Typography variant="body1">
                              {payrollRecord.bank_account}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <PaymentIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Payment Method
                            </Typography>
                            <Typography variant="body1">
                              {payrollRecord.payment_method === 'bank_transfer' ? 'Bank Transfer' : payrollRecord.payment_method}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Pay Period Information */}
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Pay Period Details
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Pay Period
                          </Typography>
                          <Typography variant="body1">
                            {format(new Date(payrollRecord.pay_period + '-01'), 'MMMM yyyy')}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Pay Date
                          </Typography>
                          <Typography variant="body1">
                            {format(new Date(payrollRecord.pay_date), 'dd/MM/yyyy')}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Frequency
                          </Typography>
                          <Typography variant="body1">
                            {payrollRecord.pay_frequency === 'monthly' ? 'Monthly' : payrollRecord.pay_frequency}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Currency
                          </Typography>
                          <Typography variant="body1">
                            {payrollRecord.currency}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Salary Breakdown Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {/* Earnings */}
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            Earnings
                          </Typography>
                          {hasPermission(PERMISSIONS.MANAGE_PAYROLL) && (
                            <Button
                            size="small"
                            startIcon={<BonusIcon />}
                            onClick={() => {
                              setAdjustmentData({...adjustmentData, adjustment_type: 'bonus'});
                              setAdjustmentDialogOpen(true);
                            }}
                          >
                            Add Bonus
                          </Button>
                        )}
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Description</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell align="center">Taxable</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {payrollRecord.earnings.map((earning, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {earning.type === 'basic' && <MoneyIcon fontSize="small" color="primary" />}
                                    {earning.type === 'allowance' && <BonusIcon fontSize="small" color="success" />}
                                    {earning.type === 'bonus' && <BonusIcon fontSize="small" color="warning" />}
                                    <Typography variant="body2">
                                      {earning.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium">
                                    TZS {earning.amount.toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={earning.taxable ? 'Yes' : 'No'}
                                    size="small"
                                    color={earning.taxable ? 'warning' : 'success'}
                                    variant="outlined"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell sx={{ fontWeight: 'bold' }}>
                                Total Earnings
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                TZS {payrollRecord.gross_salary.toLocaleString()}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  {/* Deductions */}
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Deductions
                        </Typography>
                        {hasPermission(PERMISSIONS.MANAGE_PAYROLL) && (
                          <Button
                            size="small"
                            startIcon={<DeductionIcon />}
                            onClick={() => {
                              setAdjustmentData({...adjustmentData, adjustment_type: 'deduction'});
                              setAdjustmentDialogOpen(true);
                            }}
                          >
                            Add Deduction
                          </Button>
                        )}
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Description</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell align="center">Type</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {payrollRecord.deductions.map((deduction, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {deduction.type === 'tax' && <DeductionIcon fontSize="small" color="error" />}
                                    {deduction.type === 'social_security' && <DeductionIcon fontSize="small" color="primary" />}
                                    {deduction.type === 'insurance' && <DeductionIcon fontSize="small" color="info" />}
                                    {deduction.type === 'loan' && <DeductionIcon fontSize="small" color="warning" />}
                                    <Typography variant="body2">
                                      {deduction.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium" color="error.main">
                                    TZS {deduction.amount.toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={deduction.mandatory ? 'Mandatory' : 'Optional'}
                                    size="small"
                                    color={deduction.mandatory ? 'error' : 'default'}
                                    variant="outlined"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell sx={{ fontWeight: 'bold' }}>
                                Total Deductions
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                TZS {payrollRecord.total_deductions.toLocaleString()}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Net Salary Summary */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'primary.50' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Salary Summary
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" color="primary">
                              TZS {payrollRecord.gross_salary.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Gross Salary
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" color="error.main">
                              TZS {payrollRecord.total_deductions.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Deductions
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" color="success.main">
                              TZS {payrollRecord.net_salary.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Net Salary
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" color="info.main">
                              TZS {payrollRecord.ytd_net.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              YTD Net Pay
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

          {/* Approval Workflow Tab */}
          {activeTab === 2 && (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3 }}>
                        Approval Workflow
                      </Typography>
                      <Stepper activeStep={payrollRecord.approval_stage} orientation="vertical">
                        {approvalStages.map((stage, index) => (
                          <Step key={index}>
                            <StepLabel>
                              <Typography variant="body1" fontWeight="medium">
                                {stage}
                              </Typography>
                              {index < payrollRecord.approval_stage && (
                                <Typography variant="caption" color="success.main">
                                  Completed
                                </Typography>
                              )}
                              {index === payrollRecord.approval_stage && payrollRecord.status === 'pending' && (
                                <Typography variant="caption" color="warning.main">
                                  Pending
                                </Typography>
                              )}
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Approval Details
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Processed By
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {payrollRecord.processed_by?.charAt(0)}
                          </Avatar>
                          <Typography variant="body1">
                            {payrollRecord.processed_by}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Processed Date
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(payrollRecord.processed_date), 'dd/MM/yyyy')}
                        </Typography>
                      </Box>
                      {payrollRecord.approved_by && (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Approved By
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                {payrollRecord.approved_by?.charAt(0)}
                              </Avatar>
                              <Typography variant="body1">
                                {payrollRecord.approved_by}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Approved Date
                            </Typography>
                            <Typography variant="body1">
                              {format(new Date(payrollRecord.approved_date), 'dd/MM/yyyy')}
                            </Typography>
                          </Box>
                        </>
                      )}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography variant="body2">
                          {payrollRecord.notes || 'No additional notes'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Payment Information Tab */}
          {activeTab === 3 && (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Payment Details
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payment Status
                        </Typography>
                        <Chip
                          label={paymentStatuses.find(s => s.value === payrollRecord.payment_status)?.label}
                          color={paymentStatuses.find(s => s.value === payrollRecord.payment_status)?.color}
                          variant="filled"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payment Method
                        </Typography>
                        <Typography variant="body1">
                          {payrollRecord.payment_method === 'bank_transfer' ? 'Bank Transfer' : payrollRecord.payment_method}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payment Date
                        </Typography>
                        <Typography variant="body1">
                          {payrollRecord.payment_date ? format(new Date(payrollRecord.payment_date), 'dd/MM/yyyy') : 'Not processed yet'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Net Amount
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          TZS {payrollRecord.net_salary.toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Bank Transfer Details
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bank Name
                        </Typography>
                        <Typography variant="body1">
                          {payrollRecord.bank_name}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Account Number
                        </Typography>
                        <Typography variant="body1">
                          {payrollRecord.bank_account}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Account Holder
                        </Typography>
                        <Typography variant="body1">
                          {payrollRecord.employee_name}
                        </Typography>
                      </Box>
                      {payrollRecord.payment_status === 'paid' && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            Payment successfully transferred on {format(new Date(payrollRecord.payment_date), 'dd/MM/yyyy')}
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Payslip Information */}
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Payslip Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <PayslipIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          Payslip Generated
                        </Typography>
                        <Chip
                          label={payrollRecord.payslip_generated ? 'Yes' : 'No'}
                          color={payrollRecord.payslip_generated ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <EmailIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          Payslip Sent
                        </Typography>
                        <Chip
                          label={payrollRecord.payslip_sent ? 'Yes' : 'No'}
                          color={payrollRecord.payslip_sent ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <DownloadIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          Actions
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() => setPayslipDialogOpen(true)}
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EmailIcon />}
                            onClick={handleSendPayslip}
                          >
                            Send
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Payroll History Tab */}
          {activeTab === 4 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Employee Payroll History
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pay Period</TableCell>
                      <TableCell align="right">Gross Salary</TableCell>
                      <TableCell align="right">Net Salary</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Pay Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payrollHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.pay_period + '-01'), 'MMMM yyyy')}
                        </TableCell>
                        <TableCell align="right">
                          TZS {record.gross_salary.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          TZS {record.net_salary.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            size="small"
                            color={record.status === 'paid' ? 'success' : 'default'}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.pay_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/finance/payroll/${record.id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Payslip Dialog */}
      <Dialog
        open={payslipDialogOpen}
        onClose={() => setPayslipDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Payslip - {payrollRecord.employee_name} ({format(new Date(payrollRecord.pay_period + '-01'), 'MMMM yyyy')})
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Payslip preview will be displayed here. This would typically show a formatted payslip with company letterhead, employee details, earnings, deductions, and net pay.
            </Typography>
          </Alert>
          
          {/* Simplified Payslip Preview */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                GH Foundation - Payslip
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Employee:</strong> {payrollRecord.employee_name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Employee ID:</strong> {payrollRecord.employee_number}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Department:</strong> {payrollRecord.department}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Pay Period:</strong> {format(new Date(payrollRecord.pay_period + '-01'), 'MMMM yyyy')}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Earnings
                  </Typography>
                  {payrollRecord.earnings.map((earning, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{earning.name}</Typography>
                      <Typography variant="body2">TZS {earning.amount.toLocaleString()}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <Typography variant="body2">Total Earnings</Typography>
                    <Typography variant="body2">TZS {payrollRecord.gross_salary.toLocaleString()}</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Deductions
                  </Typography>
                  {payrollRecord.deductions.map((deduction, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{deduction.name}</Typography>
                      <Typography variant="body2">TZS {deduction.amount.toLocaleString()}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <Typography variant="body2">Total Deductions</Typography>
                    <Typography variant="body2">TZS {payrollRecord.total_deductions.toLocaleString()}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ textAlign: 'center', bgcolor: 'primary.50', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" color="primary">
                  Net Salary: TZS {payrollRecord.net_salary.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayslipDialogOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleGeneratePayslip}>
            Download PDF
          </Button>
          <Button variant="contained" startIcon={<EmailIcon />} onClick={handleSendPayslip}>
            Send to Employee
          </Button>
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
          Payroll Approval
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Review and approve payroll for {payrollRecord.employee_name} for {format(new Date(payrollRecord.pay_period + '-01'), 'MMMM yyyy')}.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Net Salary: TZS {payrollRecord.net_salary.toLocaleString()}
            </Typography>
          </Alert>
          <TextField
            fullWidth
            label="Approval Comments"
            multiline
            rows={3}
            placeholder="Add any comments for this approval..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={() => handleRejectPayroll('Requires revision')}>
            Reject
          </Button>
          <Button variant="contained" onClick={handleApprovePayroll}>
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Process Payment
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Process payment for {payrollRecord.employee_name}.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This will initiate the bank transfer for TZS {payrollRecord.net_salary.toLocaleString()} to {payrollRecord.bank_name} account {payrollRecord.bank_account}.
            </Typography>
          </Alert>
          <TextField
            fullWidth
            label="Payment Reference"
            placeholder="Enter payment reference number..."
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Payment Notes"
            multiline
            rows={2}
            placeholder="Add any payment notes..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleProcessPayment}>
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog
        open={adjustmentDialogOpen}
        onClose={() => setAdjustmentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Payroll Adjustment
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Adjustment Type</InputLabel>
                <Select
                  value={adjustmentData.adjustment_type}
                  onChange={(e) => setAdjustmentData({...adjustmentData, adjustment_type: e.target.value})}
                  label="Adjustment Type"
                >
                  <MenuItem value="bonus">Bonus</MenuItem>
                  <MenuItem value="allowance">Allowance</MenuItem>
                  <MenuItem value="deduction">Deduction</MenuItem>
                  <MenuItem value="reimbursement">Reimbursement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount (TZS)"
                type="number"
                value={adjustmentData.amount}
                onChange={(e) => setAdjustmentData({...adjustmentData, amount: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={adjustmentData.description}
                onChange={(e) => setAdjustmentData({...adjustmentData, description: e.target.value})}
                placeholder="Describe the adjustment..."
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Effective Date"
                value={adjustmentData.effective_date}
                onChange={(date) => setAdjustmentData({...adjustmentData, effective_date: date})}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustmentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAdjustment}>
            Add Adjustment
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
            <Button onClick={handleConfirm} color="primary" variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  </LocalizationProvider>
);
};

export default PayrollDetailsPage;