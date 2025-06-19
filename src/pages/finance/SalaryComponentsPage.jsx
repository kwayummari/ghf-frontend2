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
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
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
  MonetizationOn as SalaryIcon,
  AccountBalance as AllowanceIcon,
  Remove as DeductionIcon,
  Calculate as CalculateIcon,
  Assessment as ReportIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Business as CompanyIcon,
  Category as ComponentIcon,
  TrendingUp as IncreaseIcon,
  TrendingDown as DecreaseIcon,
  Percent as PercentIcon,
  AttachMoney as FixedIcon,
  ShowChart as VariableIcon,
  Schedule as RegularIcon,
  Update as OneTimeIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as RequiredIcon,
  Info as OptionalIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  SwapHoriz as TransferIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { useAuth } from '../../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../../constants';
import useNotification from '../../../hooks/common/useNotification';
import useConfirmDialog from '../../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../../components/common/Loading';
// import { payrollAPI } from '../../../services/api/payroll.api';

const SalaryComponentsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } = useConfirmDialog();

  // State management
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [employeeSalaries, setEmployeeSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [componentTypeFilter, setComponentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('components');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [calculatorDialogOpen, setCalculatorDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    component_name: '',
    component_code: '',
    component_type: 'allowance',
    calculation_type: 'fixed',
    amount: '',
    percentage: '',
    is_taxable: true,
    is_mandatory: false,
    is_active: true,
    applies_to_all: false,
    frequency: 'monthly',
    description: '',
    conditions: '',
  });

  const [assignmentData, setAssignmentData] = useState({
    employee_id: employeeId || '',
    component_id: '',
    amount: '',
    percentage: '',
    effective_date: null,
    expiry_date: null,
    is_active: true,
    notes: '',
  });

  // Mock data for development
  const mockSalaryComponents = [
    {
      id: 1,
      component_name: 'Basic Salary',
      component_code: 'BASIC',
      component_type: 'earning',
      calculation_type: 'fixed',
      default_amount: 0,
      default_percentage: 0,
      is_taxable: true,
      is_mandatory: true,
      is_active: true,
      applies_to_all: true,
      frequency: 'monthly',
      description: 'Base salary component for all employees',
      created_by: 'System',
      created_at: '2024-01-01',
      usage_count: 25,
    },
    {
      id: 2,
      component_name: 'Housing Allowance',
      component_code: 'HOUSE_ALL',
      component_type: 'allowance',
      calculation_type: 'percentage',
      default_amount: 0,
      default_percentage: 15,
      is_taxable: true,
      is_mandatory: false,
      is_active: true,
      applies_to_all: false,
      frequency: 'monthly',
      description: '15% of basic salary for housing allowance',
      created_by: 'HR Team',
      created_at: '2024-01-01',
      usage_count: 18,
    },
    {
      id: 3,
      component_name: 'Transport Allowance',
      component_code: 'TRANSPORT',
      component_type: 'allowance',
      calculation_type: 'fixed',
      default_amount: 50000,
      default_percentage: 0,
      is_taxable: false,
      is_mandatory: false,
      is_active: true,
      applies_to_all: true,
      frequency: 'monthly',
      description: 'Fixed monthly transport allowance',
      created_by: 'HR Team',
      created_at: '2024-01-01',
      usage_count: 25,
    },
    {
      id: 4,
      component_name: 'Income Tax',
      component_code: 'PAYE',
      component_type: 'deduction',
      calculation_type: 'percentage',
      default_amount: 0,
      default_percentage: 20,
      is_taxable: false,
      is_mandatory: true,
      is_active: true,
      applies_to_all: true,
      frequency: 'monthly',
      description: 'Pay As You Earn income tax deduction',
      created_by: 'System',
      created_at: '2024-01-01',
      usage_count: 25,
    },
    {
      id: 5,
      component_name: 'Pension Contribution',
      component_code: 'PENSION',
      component_type: 'deduction',
      calculation_type: 'percentage',
      default_amount: 0,
      default_percentage: 5,
      is_taxable: false,
      is_mandatory: false,
      is_active: true,
      applies_to_all: false,
      frequency: 'monthly',
      description: '5% employee pension contribution',
      created_by: 'HR Team',
      created_at: '2024-01-01',
      usage_count: 20,
    },
  ];

  const mockEmployeeSalaries = [
    {
      id: 1,
      employee_id: 1,
      employee_name: 'John Doe',
      employee_number: 'EMP001',
      department: 'IT Department',
      position: 'Software Developer',
      basic_salary: 1500000,
      total_allowances: 375000,
      total_deductions: 375000,
      gross_salary: 1875000,
      net_salary: 1500000,
      components: [
        { component_id: 1, component_name: 'Basic Salary', amount: 1500000, type: 'earning' },
        { component_id: 2, component_name: 'Housing Allowance', amount: 225000, type: 'allowance' },
        { component_id: 3, component_name: 'Transport Allowance', amount: 50000, type: 'allowance' },
        { component_id: 4, component_name: 'Income Tax', amount: 300000, type: 'deduction' },
        { component_id: 5, component_name: 'Pension Contribution', amount: 75000, type: 'deduction' },
      ],
      last_updated: '2024-06-01',
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: 'Jane Smith',
      employee_number: 'EMP002',
      department: 'Finance',
      position: 'Accountant',
      basic_salary: 1200000,
      total_allowances: 230000,
      total_deductions: 300000,
      gross_salary: 1430000,
      net_salary: 1130000,
      components: [
        { component_id: 1, component_name: 'Basic Salary', amount: 1200000, type: 'earning' },
        { component_id: 2, component_name: 'Housing Allowance', amount: 180000, type: 'allowance' },
        { component_id: 3, component_name: 'Transport Allowance', amount: 50000, type: 'allowance' },
        { component_id: 4, component_name: 'Income Tax', amount: 240000, type: 'deduction' },
        { component_id: 5, component_name: 'Pension Contribution', amount: 60000, type: 'deduction' },
      ],
      last_updated: '2024-06-01',
    },
  ];

  const mockEmployees = [
    { id: 1, employee_name: 'John Doe', employee_number: 'EMP001', department: 'IT Department' },
    { id: 2, employee_name: 'Jane Smith', employee_number: 'EMP002', department: 'Finance' },
    { id: 3, employee_name: 'Mike Johnson', employee_number: 'EMP003', department: 'HR' },
  ];

  // Component types
  const componentTypes = [
    {
      value: 'earning',
      label: 'Earnings',
      icon: <SalaryIcon />,
      color: 'primary',
      description: 'Base salary and regular earnings'
    },
    {
      value: 'allowance',
      label: 'Allowances',
      icon: <AllowanceIcon />,
      color: 'success',
      description: 'Additional allowances and benefits'
    },
    {
      value: 'deduction',
      label: 'Deductions',
      icon: <DeductionIcon />,
      color: 'error',
      description: 'Tax and other deductions'
    },
    {
      value: 'bonus',
      label: 'Bonuses',
      icon: <IncreaseIcon />,
      color: 'warning',
      description: 'Performance and other bonuses'
    },
  ];

  // Calculation types
  const calculationTypes = [
    { value: 'fixed', label: 'Fixed Amount', icon: <FixedIcon /> },
    { value: 'percentage', label: 'Percentage', icon: <PercentIcon /> },
    { value: 'formula', label: 'Formula Based', icon: <CalculateIcon /> },
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' },
    { value: 'one_time', label: 'One Time' },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: 'Total Components',
      value: mockSalaryComponents.length.toString(),
      subtitle: 'Active components',
      icon: <ComponentIcon />,
      color: 'primary',
    },
    {
      title: 'Active Employees',
      value: mockEmployeeSalaries.length.toString(),
      subtitle: 'With salary structure',
      icon: <PersonIcon />,
      color: 'success',
    },
    {
      title: 'Average Gross Salary',
      value: `TZS ${Math.round(mockEmployeeSalaries.reduce((sum, emp) => sum + emp.gross_salary, 0) / mockEmployeeSalaries.length).toLocaleString()}`,
      subtitle: 'Monthly average',
      icon: <SalaryIcon />,
      color: 'info',
    },
    {
      title: 'Total Payroll',
      value: `TZS ${mockEmployeeSalaries.reduce((sum, emp) => sum + emp.gross_salary, 0).toLocaleString()}`,
      subtitle: 'Monthly gross',
      icon: <CompanyIcon />,
      color: 'warning',
    },
  ];

  // DataGrid columns for salary components
  const componentColumns = [
    {
      field: 'component_info',
      headerName: 'Component',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.component_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.component_code}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'component_type',
      headerName: 'Type',
      width: 130,
      renderCell: (params) => {
        const type = componentTypes.find(t => t.value === params.value);
        return (
          <Chip
            label={type?.label}
            size="small"
            color={type?.color}
            variant="filled"
            icon={type?.icon}
          />
        );
      },
    },
    {
      field: 'calculation_type',
      headerName: 'Calculation',
      width: 130,
      renderCell: (params) => {
        const calcType = calculationTypes.find(c => c.value === params.value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {calcType?.icon}
            <Typography variant="body2">
              {calcType?.label}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'default_value',
      headerName: 'Default Value',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.calculation_type === 'percentage' 
            ? `${params.row.default_percentage}%`
            : `TZS ${params.row.default_amount?.toLocaleString()}`
          }
        </Typography>
      ),
    },
    {
      field: 'is_taxable',
      headerName: 'Taxable',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'warning' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'is_mandatory',
      headerName: 'Mandatory',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'error' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'usage_count',
      headerName: 'Usage',
      width: 100,
      renderCell: (params) => (
        <Badge badgeContent={params.value} color="primary">
          <GroupIcon color="action" />
        </Badge>
      ),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant="filled"
          icon={params.value ? <ActiveIcon /> : <InactiveIcon />}
        />
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
            setSelectedComponent(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // DataGrid columns for employee salaries
  const employeeColumns = [
    {
      field: 'employee_info',
      headerName: 'Employee',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.employee_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.employee_number} • {params.row.position}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
    },
    {
      field: 'basic_salary',
      headerName: 'Basic Salary',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'total_allowances',
      headerName: 'Allowances',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" color="success.main">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'total_deductions',
      headerName: 'Deductions',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" color="error.main">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'gross_salary',
      headerName: 'Gross Salary',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="primary.main">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'net_salary',
      headerName: 'Net Salary',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          TZS {params.value?.toLocaleString()}
        </Typography>
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
            setSelectedEmployee(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load salary components data
  useEffect(() => {
    fetchSalaryComponents();
    fetchEmployeeSalaries();
    fetchEmployees();
  }, []);

  const fetchSalaryComponents = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await payrollAPI.getSalaryComponents();
      // setSalaryComponents(response.data || []);
      setSalaryComponents(mockSalaryComponents);
    } catch (error) {
      showError('Failed to fetch salary components');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeSalaries = async () => {
    try {
      // Replace with actual API call
      // const response = await payrollAPI.getEmployeeSalaries();
      // setEmployeeSalaries(response.data || []);
      setEmployeeSalaries(mockEmployeeSalaries);
    } catch (error) {
      showError('Failed to fetch employee salaries');
    }
  };

  const fetchEmployees = async () => {
    try {
      // Replace with actual API call
      // const response = await payrollAPI.getEmployees();
      // setEmployees(response.data || []);
      setEmployees(mockEmployees);
    } catch (error) {
      showError('Failed to fetch employees');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingComponent) {
        // await payrollAPI.updateSalaryComponent(editingComponent.id, formData);
        showSuccess('Salary component updated successfully');
      } else {
        // await payrollAPI.createSalaryComponent(formData);
        showSuccess('Salary component created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchSalaryComponents();
    } catch (error) {
      showError('Failed to save salary component');
    }
  };

  const resetForm = () => {
    setFormData({
      component_name: '',
      component_code: '',
      component_type: 'allowance',
      calculation_type: 'fixed',
      amount: '',
      percentage: '',
      is_taxable: true,
      is_mandatory: false,
      is_active: true,
      applies_to_all: false,
      frequency: 'monthly',
      description: '',
      conditions: '',
    });
    setEditingComponent(null);
  };

  // Handle component assignment
  const handleAssignComponent = async () => {
    try {
      // await payrollAPI.assignSalaryComponent(assignmentData);
      showSuccess('Salary component assigned successfully');
      setAssignDialogOpen(false);
      fetchEmployeeSalaries();
    } catch (error) {
      showError('Failed to assign salary component');
    }
  };

  // Handle edit
  const handleEdit = (component) => {
    setFormData({ ...component });
    setEditingComponent(component);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete
  const handleDelete = (component) => {
    openDialog({
      title: 'Delete Salary Component',
      message: `Are you sure you want to delete salary component "${component.component_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // await payrollAPI.deleteSalaryComponent(component.id);
          showSuccess('Salary component deleted successfully');
          fetchSalaryComponents();
        } catch (error) {
          showError('Failed to delete salary component');
        }
      },
    });
    setAnchorEl(null);
  };

  // Calculate salary breakdown
  const calculateSalaryBreakdown = (basicSalary, components) => {
    let grossSalary = basicSalary;
    let totalAllowances = 0;
    let totalDeductions = 0;

    components.forEach(component => {
      if (component.calculation_type === 'percentage') {
        const amount = (basicSalary * component.percentage) / 100;
        if (component.component_type === 'deduction') {
          totalDeductions += amount;
        } else {
          totalAllowances += amount;
          grossSalary += amount;
        }
      } else {
        if (component.component_type === 'deduction') {
          totalDeductions += component.amount;
        } else {
          totalAllowances += component.amount;
          grossSalary += component.amount;
        }
      }
    });

    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary,
      totalAllowances,
      totalDeductions,
      netSalary,
    };
  };

  // Filter data
  const filteredComponents = salaryComponents.filter(component => {
    const matchesSearch = component.component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.component_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !componentTypeFilter || component.component_type === componentTypeFilter;
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? component.is_active : !component.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredEmployees = employeeSalaries.filter(employee => {
    const matchesSearch = employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employee_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4">
            Salary Components Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CalculateIcon />}
              onClick={() => setCalculatorDialogOpen(true)}
            >
              Salary Calculator
            </Button>
            <Button
              variant="outlined"
              startIcon={<ReportIcon />}
              onClick={() => navigate('/reports/payroll')}
            >
              Reports
            </Button>
            {hasPermission(PERMISSIONS.MANAGE_PAYROLL) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
              >
                Add Component
              </Button>
            )}
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage salary components, allowances, and deductions for payroll processing
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

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* View Mode Toggle */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="components">
                <ComponentIcon sx={{ mr: 1 }} />
                Components
              </ToggleButton>
              <ToggleButton value="employees">
                <PersonIcon sx={{ mr: 1 }} />
                Employee Salaries
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Search and Filters */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />

              {viewMode === 'components' ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={componentTypeFilter}
                      onChange={(e) => setComponentTypeFilter(e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {componentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </>
              ) : (
                <FormControl size="small" sx={{ minWidth: 150 }}>
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
              )}
            </Box>
          </Box>

          {/* Components View */}
          {viewMode === 'components' && (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={filteredComponents}
                columns={componentColumns}
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
          )}

          {/* Employee Salaries View */}
          {viewMode === 'employees' && (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={filteredEmployees}
                columns={employeeColumns}
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
          )}
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {viewMode === 'components' && selectedComponent ? (
          <>
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
              <MenuItem onClick={() => handleEdit(selectedComponent)}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Component</ListItemText>
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                setAssignmentData(prev => ({ ...prev, component_id: selectedComponent.id }));
                setAssignDialogOpen(true);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Assign to Employee</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                // Handle duplicate component
                setFormData({ ...selectedComponent, component_name: `${selectedComponent.component_name} (Copy)`, component_code: `${selectedComponent.component_code}_COPY` });
                setEditingComponent(null);
                setDialogOpen(true);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <CopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>
            <Divider />
            {hasPermission(PERMISSIONS.MANAGE_PAYROLL) && (
              <MenuItem
                onClick={() => handleDelete(selectedComponent)}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete Component</ListItemText>
              </MenuItem>
            )}
          </>
        ) : selectedEmployee ? (
          <>
            <MenuItem
              onClick={() => {
                setViewDialogOpen(true);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Salary Details</ListItemText>
            </MenuItem>
            {hasPermission(PERMISSIONS.MANAGE_PAYROLL) && (
              <MenuItem
                onClick={() => {
                  setAssignmentData(prev => ({ ...prev, employee_id: selectedEmployee.employee_id }));
                  setAssignDialogOpen(true);
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add Component</ListItemText>
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                // Navigate to payroll processing
                navigate(`/finance/payroll?employeeId=${selectedEmployee.employee_id}`);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <CalculateIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Process Payroll</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {/* Print salary slip */}}>
              <ListItemIcon>
                <PrintIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Print Salary Slip</ListItemText>
            </MenuItem>
          </>
        ) : null}
      </Menu>

      {/* Add/Edit Component Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingComponent ? 'Edit Salary Component' : 'Add New Salary Component'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Component Name"
                value={formData.component_name}
                onChange={(e) => setFormData({...formData, component_name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Component Code"
                value={formData.component_code}
                onChange={(e) => setFormData({...formData, component_code: e.target.value.toUpperCase()})}
                required
                helperText="Unique identifier (e.g., BASIC, HOUSE_ALL)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Component Type</InputLabel>
                <Select
                  value={formData.component_type}
                  onChange={(e) => setFormData({...formData, component_type: e.target.value})}
                  label="Component Type"
                  required
                >
                  {componentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Calculation Type</InputLabel>
                <Select
                  value={formData.calculation_type}
                  onChange={(e) => setFormData({...formData, calculation_type: e.target.value})}
                  label="Calculation Type"
                  required
                >
                  {calculationTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {formData.calculation_type === 'fixed' ? (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Amount (TZS)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </Grid>
            ) : formData.calculation_type === 'percentage' ? (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Percentage (%)"
                  type="number"
                  value={formData.percentage}
                  onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
            ) : (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Calculation Formula"
                  value={formData.formula}
                  onChange={(e) => setFormData({...formData, formula: e.target.value})}
                  placeholder="e.g., BASIC * 0.15"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  label="Frequency"
                >
                  {frequencyOptions.map((freq) => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_taxable}
                    onChange={(e) => setFormData({...formData, is_taxable: e.target.checked})}
                  />
                }
                label="Taxable Component"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({...formData, is_mandatory: e.target.checked})}
                  />
                }
                label="Mandatory Component"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.applies_to_all}
                    onChange={(e) => setFormData({...formData, applies_to_all: e.target.checked})}
                  />
                }
                label="Applies to All Employees"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                }
                label="Active Component"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Conditions"
                value={formData.conditions}
                onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                multiline
                rows={2}
                placeholder="Specify any conditions for this component (e.g., minimum salary, department specific)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingComponent ? 'Update' : 'Create'} Component
          </Button>
        </DialogActions>
      </Dialog>

      {/* Component Assignment Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Salary Component
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={assignmentData.employee_id}
                  onChange={(e) => setAssignmentData({...assignmentData, employee_id: e.target.value})}
                  label="Employee"
                  required
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.employee_name} ({employee.employee_number})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Component</InputLabel>
                <Select
                  value={assignmentData.component_id}
                  onChange={(e) => setAssignmentData({...assignmentData, component_id: e.target.value})}
                  label="Component"
                  required
                >
                  {salaryComponents.filter(comp => comp.is_active).map((component) => (
                    <MenuItem key={component.id} value={component.id}>
                      {component.component_name} ({component.component_code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {assignmentData.component_id && (
              <>
                {salaryComponents.find(c => c.id.toString() === assignmentData.component_id)?.calculation_type === 'fixed' ? (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Amount (TZS)"
                      type="number"
                      value={assignmentData.amount}
                      onChange={(e) => setAssignmentData({...assignmentData, amount: e.target.value})}
                      required
                    />
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Percentage (%)"
                      type="number"
                      value={assignmentData.percentage}
                      onChange={(e) => setAssignmentData({...assignmentData, percentage: e.target.value})}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                      required
                    />
                  </Grid>
                )}
              </>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={assignmentData.notes}
                onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignComponent} variant="contained">
            Assign Component
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {viewMode === 'components' 
            ? `Component Details - ${selectedComponent?.component_name}`
            : `Salary Details - ${selectedEmployee?.employee_name}`
          }
        </DialogTitle>
        <DialogContent>
          {viewMode === 'components' && selectedComponent ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Component Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Component Name
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedComponent.component_name}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Component Code
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedComponent.component_code}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Type
                          </Typography>
                          <Chip
                            label={componentTypes.find(t => t.value === selectedComponent.component_type)?.label}
                            size="small"
                            color={componentTypes.find(t => t.value === selectedComponent.component_type)?.color}
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Calculation Type
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {calculationTypes.find(c => c.value === selectedComponent.calculation_type)?.label}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Description
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedComponent.description}
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
                        Component Properties
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Default Value
                        </Typography>
                        <Typography variant="h6">
                          {selectedComponent.calculation_type === 'percentage' 
                            ? `${selectedComponent.default_percentage}%`
                            : `TZS ${selectedComponent.default_amount?.toLocaleString()}`
                          }
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Frequency
                        </Typography>
                        <Typography variant="body1">
                          {frequencyOptions.find(f => f.value === selectedComponent.frequency)?.label}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Usage Count
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {selectedComponent.usage_count} employees
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={<Switch checked={selectedComponent.is_taxable} disabled />}
                          label="Taxable"
                        />
                        <FormControlLabel
                          control={<Switch checked={selectedComponent.is_mandatory} disabled />}
                          label="Mandatory"
                        />
                        <FormControlLabel
                          control={<Switch checked={selectedComponent.applies_to_all} disabled />}
                          label="Applies to All"
                        />
                        <FormControlLabel
                          control={<Switch checked={selectedComponent.is_active} disabled />}
                          label="Active"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : selectedEmployee ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Salary Components Breakdown
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Component</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell align="right">Amount</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedEmployee.components?.map((component, index) => (
                              <TableRow key={index}>
                                <TableCell>{component.component_name}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={component.type}
                                    size="small"
                                    color={
                                      component.type === 'earning' ? 'primary' :
                                      component.type === 'allowance' ? 'success' :
                                      'error'
                                    }
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Typography 
                                    variant="body2" 
                                    color={
                                      component.type === 'deduction' ? 'error.main' : 'text.primary'
                                    }
                                  >
                                    TZS {component.amount?.toLocaleString()}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
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
                        Salary Summary
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Basic Salary
                        </Typography>
                        <Typography variant="h6" color="primary">
                          TZS {selectedEmployee?.basic_salary?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Allowances
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          TZS {selectedEmployee?.total_allowances?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Deductions
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          TZS {selectedEmployee?.total_deductions?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Gross Salary
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          TZS {selectedEmployee?.gross_salary?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Net Salary
                        </Typography>
                        <Typography variant="h5" color="success.main" fontWeight="bold">
                          TZS {selectedEmployee?.net_salary?.toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => {/* Print component/salary details */}}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Salary Calculator Dialog */}
      <Dialog
        open={calculatorDialogOpen}
        onClose={() => setCalculatorDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Salary Calculator
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Interactive salary calculator to preview salary calculations with different components.
            </Typography>
          </Alert>
          {/* Calculator implementation would go here */}
          <Box sx={{ mt: 2, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Salary Calculation Preview
            </Typography>
            <Typography variant="body2">
              This calculator will allow you to:
            </Typography>
            <List>
              <ListItem>
                <MUIListItemText primary="• Input basic salary and select components" />
              </ListItem>
              <ListItem>
                <MUIListItemText primary="• Preview gross and net salary calculations" />
              </ListItem>
              <ListItem>
                <MUIListItemText primary="• Test different component combinations" />
              </ListItem>
              <ListItem>
                <MUIListItemText primary="• Export calculation results" />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculatorDialogOpen(false)}>Close</Button>
          <Button variant="contained">
            Calculate
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
            <Button onClick={handleConfirm} color="error" variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SalaryComponentsPage;