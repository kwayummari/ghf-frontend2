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
  CircularProgress,
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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as OnTrackIcon,
  Error as OverBudgetIcon,
  Schedule as PendingIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
  DateRange as DateIcon,
  Business as DepartmentIcon,
  Category as CategoryIcon,
  Timeline as TimelineIcon,
  Speed as GaugeIcon,
  ShowChart as ChartIcon,
  Notifications as AlertIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  CompareArrows as CompareIcon,
  AccountBalance as BudgetIcon,
  CreditCard as ExpenseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInDays, startOfMonth, endOfMonth, startOfYear, endOfYear, addMonths } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
import { budgetAPI } from '../../services/api/budget.api';

const BudgetMonitoringPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const budgetId = searchParams.get('budgetId');
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } = useConfirmDialog();

  // State management
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('current');
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());

  // Mock data for development
  const mockBudgets = [
    {
      id: 1,
      budget_name: 'IT Department Budget 2024-2025',
      department: 'IT Department',
      budget_type: 'operational',
      total_budget: 15000000,
      allocated_amount: 12000000,
      spent_amount: 8500000,
      committed_amount: 1500000,
      remaining_amount: 2000000,
      utilization_percentage: 70.8,
      period_start: '2024-07-01',
      period_end: '2025-06-30',
      status: 'on_track',
      last_expense_date: '2024-06-15',
      monthly_burn_rate: 1200000,
      projected_total: 14400000,
      variance_amount: -600000,
      variance_percentage: -4.0,
      alerts_count: 2,
      categories: [
        { name: 'Hardware', allocated: 5000000, spent: 3500000, percentage: 70 },
        { name: 'Software', allocated: 3000000, spent: 2200000, percentage: 73.3 },
        { name: 'Services', allocated: 4000000, spent: 2800000, percentage: 70 },
      ]
    },
    {
      id: 2,
      budget_name: 'Marketing Campaign Q3-Q4',
      department: 'Marketing',
      budget_type: 'project',
      total_budget: 8500000,
      allocated_amount: 8500000,
      spent_amount: 7200000,
      committed_amount: 800000,
      remaining_amount: 500000,
      utilization_percentage: 94.1,
      period_start: '2024-07-01',
      period_end: '2024-12-31',
      status: 'at_risk',
      last_expense_date: '2024-06-20',
      monthly_burn_rate: 1800000,
      projected_total: 9000000,
      variance_amount: 500000,
      variance_percentage: 5.9,
      alerts_count: 3,
      categories: [
        { name: 'Digital Marketing', allocated: 4000000, spent: 3800000, percentage: 95 },
        { name: 'Events', allocated: 2500000, spent: 2100000, percentage: 84 },
        { name: 'Content Creation', allocated: 2000000, spent: 1300000, percentage: 65 },
      ]
    },
    {
      id: 3,
      budget_name: 'HR Operations 2024',
      department: 'Human Resources',
      budget_type: 'operational',
      total_budget: 6000000,
      allocated_amount: 6000000,
      spent_amount: 2800000,
      committed_amount: 600000,
      remaining_amount: 2600000,
      utilization_percentage: 56.7,
      period_start: '2024-01-01',
      period_end: '2024-12-31',
      status: 'under_utilized',
      last_expense_date: '2024-06-18',
      monthly_burn_rate: 500000,
      projected_total: 5400000,
      variance_amount: -600000,
      variance_percentage: -10.0,
      alerts_count: 1,
      categories: [
        { name: 'Training', allocated: 2000000, spent: 800000, percentage: 40 },
        { name: 'Recruitment', allocated: 2500000, spent: 1200000, percentage: 48 },
        { name: 'Employee Benefits', allocated: 1500000, spent: 800000, percentage: 53.3 },
      ]
    },
  ];

  const mockRecentExpenses = [
    {
      id: 1,
      date: '2024-06-20',
      description: 'Server Hardware Purchase',
      amount: 850000,
      budget_name: 'IT Department Budget 2024-2025',
      category: 'Hardware',
      vendor: 'Tech Solutions Ltd',
      status: 'approved',
    },
    {
      id: 2,
      date: '2024-06-19',
      description: 'Software Licenses Renewal',
      amount: 320000,
      budget_name: 'IT Department Budget 2024-2025',
      category: 'Software',
      vendor: 'Microsoft',
      status: 'approved',
    },
    {
      id: 3,
      date: '2024-06-18',
      description: 'Facebook Ads Campaign',
      amount: 180000,
      budget_name: 'Marketing Campaign Q3-Q4',
      category: 'Digital Marketing',
      vendor: 'Meta',
      status: 'pending',
    },
  ];

  // Budget status configurations
  const budgetStatuses = [
    { 
      value: 'on_track', 
      label: 'On Track', 
      color: 'success', 
      icon: <OnTrackIcon />,
      description: 'Budget utilization is within expected range'
    },
    { 
      value: 'at_risk', 
      label: 'At Risk', 
      color: 'warning', 
      icon: <WarningIcon />,
      description: 'Budget utilization is approaching limits'
    },
    { 
      value: 'over_budget', 
      label: 'Over Budget', 
      color: 'error', 
      icon: <OverBudgetIcon />,
      description: 'Budget has exceeded allocated amount'
    },
    { 
      value: 'under_utilized', 
      label: 'Under Utilized', 
      color: 'info', 
      icon: <TrendingDownIcon />,
      description: 'Budget utilization is below expected rate'
    },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: 'Total Budgets',
      value: mockBudgets.length.toString(),
      subtitle: 'Active budgets',
      icon: <BudgetIcon />,
      color: 'primary',
    },
    {
      title: 'Total Allocated',
      value: `TZS ${mockBudgets.reduce((sum, budget) => sum + budget.total_budget, 0).toLocaleString()}`,
      subtitle: 'Across all budgets',
      icon: <MoneyIcon />,
      color: 'success',
    },
    {
      title: 'Total Spent',
      value: `TZS ${mockBudgets.reduce((sum, budget) => sum + budget.spent_amount, 0).toLocaleString()}`,
      subtitle: `${Math.round((mockBudgets.reduce((sum, budget) => sum + budget.spent_amount, 0) / mockBudgets.reduce((sum, budget) => sum + budget.total_budget, 0)) * 100)}% utilized`,
      icon: <ExpenseIcon />,
      color: 'warning',
    },
    {
      title: 'At Risk Budgets',
      value: mockBudgets.filter(budget => budget.status === 'at_risk' || budget.status === 'over_budget').length.toString(),
      subtitle: 'Require attention',
      icon: <AlertIcon />,
      color: 'error',
    },
  ];

  // Performance indicators
  const performanceMetrics = [
    {
      label: 'Average Utilization',
      value: `${Math.round(mockBudgets.reduce((sum, budget) => sum + budget.utilization_percentage, 0) / mockBudgets.length)}%`,
      target: '75%',
      status: 'good',
    },
    {
      label: 'Budgets On Track',
      value: `${mockBudgets.filter(b => b.status === 'on_track').length}/${mockBudgets.length}`,
      target: '80%',
      status: 'warning',
    },
    {
      label: 'Monthly Burn Rate',
      value: `TZS ${mockBudgets.reduce((sum, budget) => sum + budget.monthly_burn_rate, 0).toLocaleString()}`,
      target: 'TZS 3.2M',
      status: 'good',
    },
    {
      label: 'Projected Variance',
      value: `${Math.round(mockBudgets.reduce((sum, budget) => sum + budget.variance_percentage, 0) / mockBudgets.length)}%`,
      target: '±5%',
      status: 'good',
    },
  ];

  // DataGrid columns for budget monitoring
  const columns = [
    {
      field: 'budget_info',
      headerName: 'Budget',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.budget_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.department} • {params.row.budget_type}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'total_budget',
      headerName: 'Total Budget',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'utilization',
      headerName: 'Utilization',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">
              TZS {params.row.spent_amount?.toLocaleString()}
            </Typography>
            <Typography variant="caption">
              {params.row.utilization_percentage?.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={params.row.utilization_percentage}
            sx={{ height: 8, borderRadius: 4 }}
            color={
              params.row.utilization_percentage > 90 ? 'error' :
              params.row.utilization_percentage > 75 ? 'warning' : 'primary'
            }
          />
        </Box>
      ),
    },
    {
      field: 'remaining_amount',
      headerName: 'Remaining',
      width: 130,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          fontWeight="medium"
          color={params.value < 1000000 ? 'error.main' : 'success.main'}
        >
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'monthly_burn_rate',
      headerName: 'Monthly Burn',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'variance_percentage',
      headerName: 'Variance',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`${params.value > 0 ? '+' : ''}${params.value?.toFixed(1)}%`}
          size="small"
          color={params.value > 5 ? 'error' : params.value < -5 ? 'warning' : 'success'}
          variant="filled"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const status = budgetStatuses.find(s => s.value === params.value);
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
      field: 'alerts_count',
      headerName: 'Alerts',
      width: 80,
      renderCell: (params) => (
        params.value > 0 ? (
          <Badge badgeContent={params.value} color="error">
            <AlertIcon color="error" />
          </Badge>
        ) : (
          <AlertIcon color="disabled" />
        )
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            setSelectedBudget(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load budget monitoring data
  useEffect(() => {
    fetchBudgetData();
    fetchRecentExpenses();
  }, [selectedPeriod]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await budgetAPI.getBudgetMonitoring({
      //   period: format(selectedPeriod, 'yyyy-MM'),
      //   include_utilization: true,
      //   include_projections: true
      // });
      // setBudgets(response.data || []);
      setBudgets(mockBudgets);
    } catch (error) {
      showError('Failed to fetch budget data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentExpenses = async () => {
    try {
      // Replace with actual API call
      // const response = await budgetAPI.getRecentExpenses();
      // setExpenses(response.data || []);
      setExpenses(mockRecentExpenses);
    } catch (error) {
      showError('Failed to fetch recent expenses');
    }
  };

  // Handle refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBudgetData();
    await fetchRecentExpenses();
    setRefreshing(false);
    showSuccess('Budget data refreshed successfully');
  };

  // Handle budget drill-down
  const handleViewBudgetDetails = (budget) => {
    setSelectedBudget(budget);
    setViewDialogOpen(true);
    setAnchorEl(null);
  };

  // Calculate trend indicators
  const getTrendIndicator = (budget) => {
    const daysInPeriod = differenceInDays(new Date(budget.period_end), new Date(budget.period_start));
    const daysElapsed = differenceInDays(new Date(), new Date(budget.period_start));
    const expectedUtilization = (daysElapsed / daysInPeriod) * 100;
    const actualUtilization = budget.utilization_percentage;
    
    if (actualUtilization > expectedUtilization + 10) return 'ahead';
    if (actualUtilization < expectedUtilization - 10) return 'behind';
    return 'on_track';
  };

  // Filter budgets
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.budget_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || budget.department === departmentFilter;
    const matchesStatus = !statusFilter || budget.status === statusFilter;
    
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h4">
              Budget Monitoring Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReportIcon />}
                onClick={() => navigate('/reports/budget')}
              >
                Reports
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/finance/budgets/planning')}
              >
                New Budget
              </Button>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Real-time budget performance monitoring and variance analysis
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    <Box sx={{ color: `${card.color}.main` }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Performance Metrics */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Performance Indicators
            </Typography>
            <Grid container spacing={3}>
              {performanceMetrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" color={
                      metric.status === 'good' ? 'success.main' : 
                      metric.status === 'warning' ? 'warning.main' : 'error.main'
                    }>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Target: {metric.target}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

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
                    placeholder="Search budgets..."
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
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="Human Resources">Human Resources</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
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
                      {budgetStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value)}
                      label="Period"
                    >
                      <MenuItem value="current">Current Period</MenuItem>
                      <MenuItem value="previous">Previous Period</MenuItem>
                      <MenuItem value="ytd">Year to Date</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Period"
                    value={selectedPeriod}
                    onChange={setSelectedPeriod}
                    views={['year', 'month']}
                    slotProps={{
                      textField: { size: 'small', fullWidth: true }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            

            {/* Content Tabs */}
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Budget Overview" />
              <Tab label="Department Analysis" />
              <Tab label="Recent Activity" />
              <Tab label="Alerts & Warnings" />
            </Tabs>

            {/* Budget Overview Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: '100%' }}>
                  <DataGrid
                    rows={filteredBudgets}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    getRowHeight={() => 'auto'}
                    sx={{
                      '& .MuiDataGrid-cell': {
                        py: 1,
                      },
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Department Analysis Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  {/* Group budgets by department */}
                  {Array.from(new Set(filteredBudgets.map(b => b.department))).map((department) => {
                    const deptBudgets = filteredBudgets.filter(b => b.department === department);
                    const totalBudget = deptBudgets.reduce((sum, b) => sum + b.total_budget, 0);
                    const totalSpent = deptBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
                    const utilization = (totalSpent / totalBudget) * 100;

                    return (
                      <Grid item xs={12} md={6} key={department}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <DepartmentIcon color="primary" />
                              <Typography variant="h6">
                                {department}
                              </Typography>
                            </Box>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Total Budget
                                </Typography>
                                <Typography variant="h6">
                                  TZS {totalBudget.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Utilization
                                </Typography>
                                <Typography variant="h6" color={
                                  utilization > 90 ? 'error.main' : 
                                  utilization > 75 ? 'warning.main' : 'success.main'
                                }>
                                  {utilization.toFixed(1)}%
                                </Typography>
                              </Grid>
                            </Grid>
                            <Box sx={{ mt: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={utilization}
                                sx={{ height: 8, borderRadius: 4 }}
                                color={
                                  utilization > 90 ? 'error' : 
                                  utilization > 75 ? 'warning' : 'primary'
                                }
                              />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Active Budgets: {deptBudgets.length}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
            {/* Recent Activity Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Recent Expenses
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Budget</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            {format(new Date(expense.date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {expense.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {expense.budget_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={expense.category}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              TZS {expense.amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {expense.vendor}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={expense.status}
                              size="small"
                              color={expense.status === 'approved' ? 'success' : 'warning'}
                              variant="filled"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Budget Activity Timeline */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Budget Activity Timeline
                  </Typography>
                  <Alert severity="info">
                    <Typography variant="body2">
                      Interactive timeline showing budget creation, modifications, and major expenses will be displayed here.
                    </Typography>
                  </Alert>
                </Box>
              </Box>
            )}

            {/* Alerts & Warnings Tab */}
            {activeTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Budget Alerts & Warnings
                </Typography>
                
                {/* Critical Alerts */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OverBudgetIcon color="error" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Critical Alerts (2)
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.main' }}>
                            <WarningIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <MUIListItemText
                          primary="Marketing Campaign Q3-Q4 - Over Budget"
                          secondary="Budget utilization: 94.1% | Projected overspend: TZS 500,000"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.main' }}>
                            <TrendingUpIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <MUIListItemText
                          primary="High Burn Rate Detected"
                          secondary="IT Department monthly burn rate exceeds target by 15%"
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* Warning Alerts */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon color="warning" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Warnings (3)
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <TrendingUpIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <MUIListItemText
                          primary="IT Department - Approaching Budget Limit"
                          secondary="Budget utilization: 70.8% | Remaining: TZS 2,000,000"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <ScheduleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <MUIListItemText
                          primary="Quarter End Approaching"
                          secondary="15 days remaining in Q2 - Review pending expenses"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <TrendingDownIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <MUIListItemText
                          primary="HR Operations - Under Utilized"
                          secondary="Budget utilization: 56.7% | Consider reallocation"
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* Recommendations */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Recommendations
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'success.main' }}>
                              <CompareIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <MUIListItemText
                            primary="Budget Reallocation Opportunity"
                            secondary="Consider reallocating TZS 600,000 from HR Operations to Marketing Campaign to prevent overspend"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                              <SettingsIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <MUIListItemText
                            primary="Review IT Department Spending"
                            secondary="Hardware category at 70% utilization - may need additional allocation for Q4 projects"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <TimelineIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <MUIListItemText
                            primary="Quarterly Budget Review"
                            secondary="Schedule budget review meeting for next week to address current variances"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Box>
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
          <MenuItem onClick={() => handleViewBudgetDetails(selectedBudget)}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => navigate(`/finance/budgets/variance?budgetId=${selectedBudget?.id}`)}>
            <ListItemIcon>
              <CompareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Variance Analysis</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_BUDGET) && (
            <MenuItem onClick={() => navigate(`/finance/budgets/planning?budgetId=${selectedBudget?.id}`)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Budget</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => setAlertDialogOpen(true)}>
            <ListItemIcon>
              <AlertIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Set Alerts</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {/* Export budget report */}}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Report</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {/* Print budget summary */}}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Summary</ListItemText>
          </MenuItem>
        </Menu>

        {/* Budget Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Budget Details - {selectedBudget?.budget_name}
          </DialogTitle>
          <DialogContent>
            {selectedBudget && (
              <Box>
                <Grid container spacing={3}>
                  {/* Budget Overview */}
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Budget Overview
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Department
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedBudget.department}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Budget Type
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedBudget.budget_type}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Period
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {format(new Date(selectedBudget.period_start), 'dd/MM/yyyy')} - {format(new Date(selectedBudget.period_end), 'dd/MM/yyyy')}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Status
                            </Typography>
                            <Chip
                              label={budgetStatuses.find(s => s.value === selectedBudget.status)?.label}
                              size="small"
                              color={budgetStatuses.find(s => s.value === selectedBudget.status)?.color}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Category Breakdown */}
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Category Breakdown
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Allocated</TableCell>
                                <TableCell align="right">Spent</TableCell>
                                <TableCell align="right">Utilization</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedBudget.categories?.map((category, index) => (
                                <TableRow key={index}>
                                  <TableCell>{category.name}</TableCell>
                                  <TableCell align="right">
                                    TZS {category.allocated.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    TZS {category.spent.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={category.percentage}
                                        sx={{ width: 60, height: 6 }}
                                        color={category.percentage > 90 ? 'error' : 'primary'}
                                      />
                                      <Typography variant="caption">
                                        {category.percentage.toFixed(1)}%
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Financial Summary */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Financial Summary
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Budget
                          </Typography>
                          <Typography variant="h6" color="primary">
                            TZS {selectedBudget.total_budget?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Spent Amount
                          </Typography>
                          <Typography variant="h6" color="warning.main">
                            TZS {selectedBudget.spent_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Committed Amount
                          </Typography>
                          <Typography variant="h6">
                            TZS {selectedBudget.committed_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Remaining Amount
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            TZS {selectedBudget.remaining_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Utilization Progress
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={selectedBudget.utilization_percentage}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                              color={selectedBudget.utilization_percentage > 90 ? 'error' : 'primary'}
                            />
                            <Typography variant="body2">
                              {selectedBudget.utilization_percentage?.toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Monthly Burn Rate
                          </Typography>
                          <Typography variant="h6">
                            TZS {selectedBudget.monthly_burn_rate?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Projected Total
                          </Typography>
                          <Typography variant="h6" color={
                            selectedBudget.variance_percentage > 5 ? 'error.main' : 'text.primary'
                          }>
                            TZS {selectedBudget.projected_total?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Variance
                          </Typography>
                          <Typography variant="h6" color={
                            selectedBudget.variance_percentage > 5 ? 'error.main' : 
                            selectedBudget.variance_percentage < -5 ? 'warning.main' : 'success.main'
                          }>
                            {selectedBudget.variance_percentage > 0 ? '+' : ''}
                            {selectedBudget.variance_percentage?.toFixed(1)}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Trend Indicator */}
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Spending Trend
                        </Typography>
                        <Box sx={{ textAlign: 'center' }}>
                          {getTrendIndicator(selectedBudget) === 'ahead' && (
                            <Box>
                              <TrendingUpIcon sx={{ fontSize: 48, color: 'warning.main' }} />
                              <Typography variant="body2" color="warning.main">
                                Spending Ahead of Schedule
                              </Typography>
                            </Box>
                          )}
                          {getTrendIndicator(selectedBudget) === 'behind' && (
                            <Box>
                              <TrendingDownIcon sx={{ fontSize: 48, color: 'info.main' }} />
                              <Typography variant="body2" color="info.main">
                                Spending Behind Schedule
                              </Typography>
                            </Box>
                          )}
                          {getTrendIndicator(selectedBudget) === 'on_track' && (
                            <Box>
                              <OnTrackIcon sx={{ fontSize: 48, color: 'success.main' }} />
                              <Typography variant="body2" color="success.main">
                                On Track
                              </Typography>
                            </Box>
                          )}
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
              startIcon={<CompareIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                navigate(`/finance/budgets/variance?budgetId=${selectedBudget?.id}`);
              }}
            >
              Variance Analysis
            </Button>
            {hasPermission(PERMISSIONS.MANAGE_BUDGET) && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  navigate(`/finance/budgets/planning?budgetId=${selectedBudget?.id}`);
                }}
              >
                Edit Budget
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Budget Alerts Configuration Dialog */}
        <Dialog
          open={alertDialogOpen}
          onClose={() => setAlertDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Configure Budget Alerts - {selectedBudget?.budget_name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set up automated alerts for budget thresholds and spending patterns.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Warning Threshold (%)"
                  type="number"
                  defaultValue={75}
                  helperText="Alert when utilization reaches this percentage"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Critical Threshold (%)"
                  type="number"
                  defaultValue={90}
                  helperText="Critical alert threshold"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Alert Frequency</InputLabel>
                  <Select defaultValue="weekly" label="Alert Frequency">
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="threshold">Threshold Based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAlertDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setAlertDialogOpen(false);
              showSuccess('Budget alerts configured successfully');
            }}>
              Save Alerts
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

export default BudgetMonitoringPage;