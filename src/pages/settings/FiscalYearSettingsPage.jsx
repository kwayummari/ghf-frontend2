import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Avatar,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  DateRange as DateIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Timeline as TimelineIcon,
  Sync as SyncIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Business as CompanyIcon,
  Assignment as ReportIcon,
  Update as UpdateIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addYears, addMonths, startOfYear, endOfYear, differenceInDays, isBefore, isAfter } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { settingsAPI } from '../../../services/api/settings.api';

const FiscalYearSettingsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [fiscalYears, setFiscalYears] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [editingFiscalYear, setEditingFiscalYear] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    fiscal_year_name: "",
    start_date: null,
    end_date: null,
    description: "",
    is_current: false,
    status: "draft",
    auto_generate_quarters: true,
    budget_cycle: "annual",
    currency: "TZS",
    company_id: 1,
  });

  // Mock data for development
  const mockFiscalYears = [
    {
      id: 1,
      fiscal_year_name: "2024-2025",
      start_date: "2024-07-01",
      end_date: "2025-06-30",
      description: "Financial Year 2024-2025",
      is_current: true,
      status: "active",
      budget_cycle: "annual",
      currency: "TZS",
      total_budgets: 15,
      total_budget_amount: 89500000,
      quarters_count: 4,
      days_remaining: 245,
      created_by: "System Admin",
      created_at: "2024-06-01",
      activated_at: "2024-07-01",
    },
    {
      id: 2,
      fiscal_year_name: "2023-2024",
      start_date: "2023-07-01",
      end_date: "2024-06-30",
      description: "Financial Year 2023-2024",
      is_current: false,
      status: "closed",
      budget_cycle: "annual",
      currency: "TZS",
      total_budgets: 18,
      total_budget_amount: 76200000,
      quarters_count: 4,
      days_remaining: 0,
      created_by: "System Admin",
      created_at: "2023-06-01",
      activated_at: "2023-07-01",
    },
    {
      id: 3,
      fiscal_year_name: "2025-2026",
      start_date: "2025-07-01",
      end_date: "2026-06-30",
      description: "Financial Year 2025-2026",
      is_current: false,
      status: "draft",
      budget_cycle: "annual",
      currency: "TZS",
      total_budgets: 0,
      total_budget_amount: 0,
      quarters_count: 4,
      days_remaining: 381,
      created_by: "Finance Manager",
      created_at: "2024-04-01",
      activated_at: null,
    },
  ];

  const mockQuarters = [
    {
      id: 1,
      fiscal_year_id: 1,
      quarter_name: "Q1 2024-2025",
      quarter_number: 1,
      start_date: "2024-07-01",
      end_date: "2024-09-30",
      status: "closed",
      budget_allocated: 22375000,
      budget_utilized: 21800000,
      utilization_percentage: 97.4,
    },
    {
      id: 2,
      fiscal_year_id: 1,
      quarter_name: "Q2 2024-2025",
      quarter_number: 2,
      start_date: "2024-10-01",
      end_date: "2024-12-31",
      status: "closed",
      budget_allocated: 22375000,
      budget_utilized: 20100000,
      utilization_percentage: 89.8,
    },
    {
      id: 3,
      fiscal_year_id: 1,
      quarter_name: "Q3 2024-2025",
      quarter_number: 3,
      start_date: "2025-01-01",
      end_date: "2025-03-31",
      status: "active",
      budget_allocated: 22375000,
      budget_utilized: 8500000,
      utilization_percentage: 38.0,
    },
    {
      id: 4,
      fiscal_year_id: 1,
      quarter_name: "Q4 2024-2025",
      quarter_number: 4,
      start_date: "2025-04-01",
      end_date: "2025-06-30",
      status: "future",
      budget_allocated: 22375000,
      budget_utilized: 0,
      utilization_percentage: 0,
    },
  ];

  // Fiscal year statuses
  const fiscalYearStatuses = [
    {
      value: "draft",
      label: "Draft",
      color: "default",
      icon: <ScheduleIcon />,
    },
    {
      value: "active",
      label: "Active",
      color: "success",
      icon: <ActiveIcon />,
    },
    { value: "closed", label: "Closed", color: "error", icon: <LockIcon /> },
    {
      value: "archived",
      label: "Archived",
      color: "default",
      icon: <InactiveIcon />,
    },
  ];

  // Quarter statuses
  const quarterStatuses = [
    { value: "future", label: "Future", color: "info" },
    { value: "active", label: "Active", color: "success" },
    { value: "closed", label: "Closed", color: "default" },
  ];

  // Budget cycles
  const budgetCycles = [
    {
      value: "annual",
      label: "Annual",
      description: "One budget per fiscal year",
    },
    {
      value: "quarterly",
      label: "Quarterly",
      description: "Budget reviewed quarterly",
    },
    {
      value: "monthly",
      label: "Monthly",
      description: "Monthly budget cycles",
    },
  ];

  // Setup steps
  const setupSteps = [
    "Basic Information",
    "Date Configuration",
    "Quarters Setup",
    "Review & Activate",
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Current Fiscal Year",
      value:
        mockFiscalYears.find((fy) => fy.is_current)?.fiscal_year_name || "None",
      subtitle: `${mockFiscalYears.find((fy) => fy.is_current)?.days_remaining || 0} days remaining`,
      icon: <CalendarIcon />,
      color: "primary",
    },
    {
      title: "Total Fiscal Years",
      value: mockFiscalYears.length.toString(),
      subtitle: `${mockFiscalYears.filter((fy) => fy.status === "active").length} active`,
      icon: <TimelineIcon />,
      color: "info",
    },
    {
      title: "Active Budgets",
      value:
        mockFiscalYears
          .find((fy) => fy.is_current)
          ?.total_budgets?.toString() || "0",
      subtitle: `TZS ${mockFiscalYears.find((fy) => fy.is_current)?.total_budget_amount?.toLocaleString() || "0"}`,
      icon: <ReportIcon />,
      color: "success",
    },
    {
      title: "Current Quarter",
      value:
        mockQuarters.find((q) => q.status === "active")?.quarter_name || "None",
      subtitle: `${mockQuarters.find((q) => q.status === "active")?.utilization_percentage?.toFixed(1) || 0}% utilized`,
      icon: <EventIcon />,
      color: "warning",
    },
  ];

  // DataGrid columns for fiscal years
  const fiscalYearColumns = [
    {
      field: "fiscal_year_name",
      headerName: "Fiscal Year",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DateIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          {params.row.is_current && (
            <Chip label="Current" size="small" color="success" />
          )}
        </Box>
      ),
    },
    {
      field: "period",
      headerName: "Period",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.row.start_date), "dd/MM/yyyy")} -{" "}
          {format(new Date(params.row.end_date), "dd/MM/yyyy")}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const status = fiscalYearStatuses.find((s) => s.value === params.value);
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
      field: "total_budgets",
      headerName: "Budgets",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "total_budget_amount",
      headerName: "Total Amount",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "days_remaining",
      headerName: "Days Remaining",
      width: 130,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color={
            params.value < 30
              ? "error.main"
              : params.value < 90
                ? "warning.main"
                : "text.primary"
          }
        >
          {params.value} days
        </Typography>
      ),
    },
    {
      field: "created_by",
      headerName: "Created By",
      width: 130,
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
            setSelectedFiscalYear(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // DataGrid columns for quarters
  const quarterColumns = [
    {
      field: "quarter_name",
      headerName: "Quarter",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EventIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "period",
      headerName: "Period",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.row.start_date), "dd/MM/yyyy")} -{" "}
          {format(new Date(params.row.end_date), "dd/MM/yyyy")}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => {
        const status = quarterStatuses.find((s) => s.value === params.value);
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
      field: "budget_allocated",
      headerName: "Allocated",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "budget_utilized",
      headerName: "Utilized",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "utilization_percentage",
      headerName: "Utilization",
      width: 120,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color={
            params.value > 95
              ? "error.main"
              : params.value > 85
                ? "warning.main"
                : "success.main"
          }
        >
          {params.value?.toFixed(1)}%
        </Typography>
      ),
    },
  ];

  // Load fiscal year data
  useEffect(() => {
    fetchFiscalYears();
    fetchQuarters();
  }, []);

  const fetchFiscalYears = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await settingsAPI.getFiscalYears();
      // setFiscalYears(response.data || []);
      setFiscalYears(mockFiscalYears);
    } catch (error) {
      showError("Failed to fetch fiscal years");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuarters = async () => {
    try {
      // Replace with actual API call
      // const response = await settingsAPI.getQuarters();
      // setQuarters(response.data || []);
      setQuarters(mockQuarters);
    } catch (error) {
      showError("Failed to fetch quarters");
    }
  };

  // Auto-generate quarters based on fiscal year dates
  const generateQuarters = (startDate, endDate) => {
    const quarters = [];
    let currentStart = new Date(startDate);

    for (let i = 1; i <= 4; i++) {
      const quarterEnd = addMonths(currentStart, 3);
      quarterEnd.setDate(quarterEnd.getDate() - 1); // Last day of quarter

      if (quarterEnd > new Date(endDate)) {
        quarterEnd.setTime(new Date(endDate).getTime());
      }

      quarters.push({
        quarter_number: i,
        quarter_name: `Q${i} ${formData.fiscal_year_name}`,
        start_date: currentStart.toISOString().split("T")[0],
        end_date: quarterEnd.toISOString().split("T")[0],
        status: "future",
      });

      currentStart = addMonths(currentStart, 3);
    }

    return quarters;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const fiscalYearData = {
        ...formData,
        quarters: formData.auto_generate_quarters
          ? generateQuarters(formData.start_date, formData.end_date)
          : [],
      };

      if (editingFiscalYear) {
        // await settingsAPI.updateFiscalYear(editingFiscalYear.id, fiscalYearData);
        showSuccess("Fiscal year updated successfully");
      } else {
        // await settingsAPI.createFiscalYear(fiscalYearData);
        showSuccess("Fiscal year created successfully");
      }
      setDialogOpen(false);
      setSetupDialogOpen(false);
      resetForm();
      fetchFiscalYears();
      fetchQuarters();
    } catch (error) {
      showError("Failed to save fiscal year");
    }
  };

  const resetForm = () => {
    setFormData({
      fiscal_year_name: "",
      start_date: null,
      end_date: null,
      description: "",
      is_current: false,
      status: "draft",
      auto_generate_quarters: true,
      budget_cycle: "annual",
      currency: "TZS",
      company_id: 1,
    });
    setEditingFiscalYear(null);
    setActiveStep(0);
  };

  // Handle fiscal year activation
  const handleActivateFiscalYear = async (fiscalYear) => {
    openDialog({
      title: "Activate Fiscal Year",
      message: `This will set "${fiscalYear.fiscal_year_name}" as the current active fiscal year. The previously active fiscal year will be closed. Continue?`,
      onConfirm: async () => {
        try {
          // await settingsAPI.activateFiscalYear(fiscalYear.id);
          showSuccess("Fiscal year activated successfully");
          fetchFiscalYears();
        } catch (error) {
          showError("Failed to activate fiscal year");
        }
      },
    });
    setAnchorEl(null);
  };

  // Handle edit
  const handleEdit = (fiscalYear) => {
    setFormData({ ...fiscalYear });
    setEditingFiscalYear(fiscalYear);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete
  const handleDelete = (fiscalYear) => {
    openDialog({
      title: "Delete Fiscal Year",
      message: `Are you sure you want to delete fiscal year "${fiscalYear.fiscal_year_name}"? This action cannot be undone and will affect all related budgets.`,
      onConfirm: async () => {
        try {
          // await settingsAPI.deleteFiscalYear(fiscalYear.id);
          showSuccess("Fiscal year deleted successfully");
          fetchFiscalYears();
        } catch (error) {
          showError("Failed to delete fiscal year");
        }
      },
    });
    setAnchorEl(null);
  };

  // Filter fiscal years
  const filteredFiscalYears = fiscalYears.filter((fiscalYear) => {
    const matchesSearch = fiscalYear.fiscal_year_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || fiscalYear.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get current fiscal year quarters
  const currentFiscalYearQuarters = quarters.filter((q) =>
    selectedFiscalYear
      ? q.fiscal_year_id === selectedFiscalYear.id
      : q.fiscal_year_id === fiscalYears.find((fy) => fy.is_current)?.id
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Fiscal Year Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure and manage fiscal years, quarters, and financial periods
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
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search fiscal years..."
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
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {fiscalYearStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                  >
                    {hasPermission(PERMISSIONS.MANAGE_FISCAL_YEAR) && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setSetupDialogOpen(true)}
                      >
                        New Fiscal Year
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<SyncIcon />}
                      onClick={() => {
                        /* Sync with accounting system */
                      }}
                    >
                      Sync
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
              <Tab label="Fiscal Years" />
              <Tab label="Quarters" />
              <Tab label="System Settings" />
            </Tabs>

            {/* Fiscal Years Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 500, width: "100%" }}>
                  <DataGrid
                    rows={filteredFiscalYears}
                    columns={fiscalYearColumns}
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

            {/* Quarters Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Select Fiscal Year</InputLabel>
                    <Select
                      value={selectedFiscalYear?.id || ""}
                      onChange={(e) => {
                        const fy = fiscalYears.find(
                          (f) => f.id === e.target.value
                        );
                        setSelectedFiscalYear(fy);
                      }}
                      label="Select Fiscal Year"
                    >
                      {fiscalYears.map((fy) => (
                        <MenuItem key={fy.id} value={fy.id}>
                          {fy.fiscal_year_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={currentFiscalYearQuarters}
                    columns={quarterColumns}
                    pageSize={10}
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

            {/* System Settings Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Default Settings
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel>Default Currency</InputLabel>
                            <Select defaultValue="TZS" label="Default Currency">
                              <MenuItem value="TZS">
                                Tanzanian Shilling (TZS)
                              </MenuItem>
                              <MenuItem value="USD">US Dollar (USD)</MenuItem>
                              <MenuItem value="EUR">Euro (EUR)</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel>Default Budget Cycle</InputLabel>
                            <Select
                              defaultValue="annual"
                              label="Default Budget Cycle"
                            >
                              {budgetCycles.map((cycle) => (
                                <MenuItem key={cycle.value} value={cycle.value}>
                                  {cycle.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Auto-generate quarters"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Enable budget rollover"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Automation Rules
                        </Typography>
                        <FormControlLabel
                          control={<Switch />}
                          label="Auto-close previous fiscal year"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Auto-create next fiscal year"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Send fiscal year reminders"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Sync with accounting system"
                        />
                        <Box sx={{ mt: 3 }}>
                          <Button variant="outlined" fullWidth>
                            Configure Notifications
                          </Button>
                        </Box>
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
          {hasPermission(PERMISSIONS.MANAGE_FISCAL_YEAR) &&
            selectedFiscalYear?.status === "draft" && (
              <MenuItem onClick={() => handleEdit(selectedFiscalYear)}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Fiscal Year</ListItemText>
              </MenuItem>
            )}
          {selectedFiscalYear?.status === "draft" && (
            <MenuItem
              onClick={() => handleActivateFiscalYear(selectedFiscalYear)}
            >
              <ListItemIcon>
                <ActiveIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Activate</ListItemText>
            </MenuItem>
          )}
          <Divider />
          {hasPermission(PERMISSIONS.MANAGE_FISCAL_YEAR) &&
            selectedFiscalYear?.status === "draft" && (
              <MenuItem
                onClick={() => handleDelete(selectedFiscalYear)}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
        </Menu>

        {/* Fiscal Year Setup Dialog */}
        <Dialog
          open={setupDialogOpen}
          onClose={() => setSetupDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Fiscal Year</DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Step 1: Basic Information */}
              <Step>
                <StepLabel>Basic Information</StepLabel>
                <StepContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Fiscal Year Name"
                        value={formData.fiscal_year_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fiscal_year_name: e.target.value,
                          })
                        }
                        placeholder="e.g., 2025-2026"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        multiline
                        rows={3}
                        placeholder="Description of the fiscal year..."
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Budget Cycle</InputLabel>
                        <Select
                          value={formData.budget_cycle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              budget_cycle: e.target.value,
                            })
                          }
                          label="Budget Cycle"
                        >
                          {budgetCycles.map((cycle) => (
                            <MenuItem key={cycle.value} value={cycle.value}>
                              {cycle.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={formData.currency}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currency: e.target.value,
                            })
                          }
                          label="Currency"
                        >
                          <MenuItem value="TZS">
                            Tanzanian Shilling (TZS)
                          </MenuItem>
                          <MenuItem value="USD">US Dollar (USD)</MenuItem>
                          <MenuItem value="EUR">Euro (EUR)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                      sx={{ mr: 1 }}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 2: Date Configuration */}
              <Step>
                <StepLabel>Date Configuration</StepLabel>
                <StepContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Start Date"
                        value={formData.start_date}
                        onChange={(date) => {
                          setFormData({ ...formData, start_date: date });
                          if (date) {
                            const endDate = addYears(date, 1);
                            endDate.setDate(endDate.getDate() - 1);
                            setFormData((prev) => ({
                              ...prev,
                              end_date: endDate,
                            }));
                          }
                        }}
                        slotProps={{
                          textField: { fullWidth: true, required: true },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="End Date"
                        value={formData.end_date}
                        onChange={(date) =>
                          setFormData({ ...formData, end_date: date })
                        }
                        slotProps={{
                          textField: { fullWidth: true, required: true },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          The fiscal year period will be:{" "}
                          {formData.start_date && formData.end_date
                            ? `${format(formData.start_date, "dd/MM/yyyy")} to ${format(formData.end_date, "dd/MM/yyyy")} (${differenceInDays(formData.end_date, formData.start_date) + 1} days)`
                            : "Select dates to see period information"}
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button onClick={() => setActiveStep(0)} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(2)}
                      sx={{ mr: 1 }}
                      disabled={!formData.start_date || !formData.end_date}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 3: Quarters Setup */}
              <Step>
                <StepLabel>Quarters Setup</StepLabel>
                <StepContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.auto_generate_quarters}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            auto_generate_quarters: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Auto-generate quarters"
                  />

                  {formData.auto_generate_quarters &&
                    formData.start_date &&
                    formData.end_date && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Generated Quarters:
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Quarter</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {generateQuarters(
                                formData.start_date,
                                formData.end_date
                              ).map((quarter, index) => (
                                <TableRow key={index}>
                                  <TableCell>{quarter.quarter_name}</TableCell>
                                  <TableCell>
                                    {format(
                                      new Date(quarter.start_date),
                                      "dd/MM/yyyy"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {format(
                                      new Date(quarter.end_date),
                                      "dd/MM/yyyy"
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                  <Box sx={{ mt: 2 }}>
                    <Button onClick={() => setActiveStep(1)} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(3)}
                      sx={{ mr: 1 }}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 4: Review & Activate */}
              <Step>
                <StepLabel>Review & Activate</StepLabel>
                <StepContent>
                  <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Fiscal Year Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body1">
                          {formData.fiscal_year_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Period
                        </Typography>
                        <Typography variant="body1">
                          {formData.start_date && formData.end_date
                            ? `${format(formData.start_date, "dd/MM/yyyy")} - ${format(formData.end_date, "dd/MM/yyyy")}`
                            : "Not set"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Budget Cycle
                        </Typography>
                        <Typography variant="body1">
                          {
                            budgetCycles.find(
                              (c) => c.value === formData.budget_cycle
                            )?.label
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Quarters
                        </Typography>
                        <Typography variant="body1">
                          {formData.auto_generate_quarters
                            ? "4 (Auto-generated)"
                            : "Manual setup required"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_current}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_current: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Set as current active fiscal year"
                  />

                  <Box sx={{ mt: 2 }}>
                    <Button onClick={() => setActiveStep(2)} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      sx={{ mr: 1 }}
                    >
                      Create Fiscal Year
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setSetupDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Fiscal Year Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingFiscalYear ? "Edit Fiscal Year" : "New Fiscal Year"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fiscal Year Name"
                  value={formData.fiscal_year_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fiscal_year_name: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    label="Status"
                  >
                    {fiscalYearStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) =>
                    setFormData({ ...formData, start_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) =>
                    setFormData({ ...formData, end_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
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
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_current}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_current: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Set as current fiscal year"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingFiscalYear ? "Update" : "Create"} Fiscal Year
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
            Fiscal Year Details - {selectedFiscalYear?.fiscal_year_name}
          </DialogTitle>
          <DialogContent>
            {selectedFiscalYear && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Basic Information
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Fiscal Year Name
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              {selectedFiscalYear.fiscal_year_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Period
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              {format(
                                new Date(selectedFiscalYear.start_date),
                                "dd/MM/yyyy"
                              )}{" "}
                              -{" "}
                              {format(
                                new Date(selectedFiscalYear.end_date),
                                "dd/MM/yyyy"
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Status
                            </Typography>
                            <Chip
                              label={
                                fiscalYearStatuses.find(
                                  (s) => s.value === selectedFiscalYear.status
                                )?.label
                              }
                              size="small"
                              color={
                                fiscalYearStatuses.find(
                                  (s) => s.value === selectedFiscalYear.status
                                )?.color
                              }
                              sx={{ mb: 1 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Current
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              {selectedFiscalYear.is_current ? "Yes" : "No"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Financial Summary
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Total Budgets
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {selectedFiscalYear.total_budgets}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Total Budget Amount
                            </Typography>
                            <Typography variant="h6" color="success.main">
                              TZS{" "}
                              {selectedFiscalYear.total_budget_amount?.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Days Remaining
                            </Typography>
                            <Typography
                              variant="h6"
                              color={
                                selectedFiscalYear.days_remaining < 30
                                  ? "error.main"
                                  : "text.primary"
                              }
                            >
                              {selectedFiscalYear.days_remaining} days
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            {hasPermission(PERMISSIONS.MANAGE_FISCAL_YEAR) && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEdit(selectedFiscalYear);
                }}
              >
                Edit Fiscal Year
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

export default FiscalYearSettingsPage;