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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
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
  CompareArrows as VarianceIcon,
  TrendingUp as FavorableIcon,
  TrendingDown as UnfavorableIcon,
  Remove as NeutralIcon,
  Assessment as AnalysisIcon,
  Timeline as TrendIcon,
  PieChart as ChartIcon,
  ShowChart as LineChartIcon,
  Warning as WarningIcon,
  CheckCircle as GoodIcon,
  Error as BadIcon,
  Info as InfoIcon,
  DateRange as DateIcon,
  Category as CategoryIcon,
  Business as DepartmentIcon,
  MonetizationOn as MoneyIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  TableChart as TableIcon,
  BarChart as BarChartIcon,
  Schedule as PeriodIcon,
  AccountBalance as BudgetIcon,
  Receipt as ExpenseIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
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
// import { budgetAPI } from '../../../services/api/budget.api';

const BudgetVarianceAnalysisPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const budgetId = searchParams.get("budgetId");
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [varianceData, setVarianceData] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudgetId, setSelectedBudgetId] = useState(budgetId || "");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [varianceTypeFilter, setVarianceTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState("table");
  const [analysisType, setAnalysisType] = useState("monthly");
  const [showOnlySignificant, setShowOnlySignificant] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVariance, setSelectedVariance] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());
  const [comparisonPeriod, setComparisonPeriod] = useState(
    subMonths(new Date(), 1)
  );

  // Mock data for development
  const mockVarianceData = [
    {
      id: 1,
      budget_id: 1,
      budget_name: "IT Department Budget 2024-2025",
      department: "IT Department",
      category: "Hardware",
      period: "2024-06",
      budget_amount: 1250000,
      actual_amount: 1450000,
      variance_amount: 200000,
      variance_percentage: 16.0,
      variance_type: "unfavorable",
      significance: "high",
      cumulative_variance: 350000,
      trend: "increasing",
      last_month_variance: 150000,
      ytd_budget: 7500000,
      ytd_actual: 8200000,
      ytd_variance: 700000,
      explanation: "Unplanned server upgrades for new project requirements",
      corrective_action: "Budget reallocation approved from Software category",
      responsible_person: "John Doe",
      created_at: "2024-06-30",
    },
    {
      id: 2,
      budget_id: 1,
      budget_name: "IT Department Budget 2024-2025",
      department: "IT Department",
      category: "Software",
      period: "2024-06",
      budget_amount: 750000,
      actual_amount: 650000,
      variance_amount: -100000,
      variance_percentage: -13.3,
      variance_type: "favorable",
      significance: "medium",
      cumulative_variance: -180000,
      trend: "stable",
      last_month_variance: -80000,
      ytd_budget: 4500000,
      ytd_actual: 4100000,
      ytd_variance: -400000,
      explanation: "Delayed software license renewals, negotiated better rates",
      corrective_action: "Reallocate savings to Hardware category as approved",
      responsible_person: "Jane Smith",
      created_at: "2024-06-30",
    },
    {
      id: 3,
      budget_id: 2,
      budget_name: "Marketing Campaign Q3-Q4",
      department: "Marketing",
      category: "Digital Marketing",
      period: "2024-06",
      budget_amount: 800000,
      actual_amount: 920000,
      variance_amount: 120000,
      variance_percentage: 15.0,
      variance_type: "unfavorable",
      significance: "high",
      cumulative_variance: 280000,
      trend: "increasing",
      last_month_variance: 160000,
      ytd_budget: 4800000,
      ytd_actual: 5200000,
      ytd_variance: 400000,
      explanation:
        "Increased advertising spend due to competitive market pressure",
      corrective_action:
        "Request additional budget allocation or reduce other categories",
      responsible_person: "Mike Johnson",
      created_at: "2024-06-30",
    },
    {
      id: 4,
      budget_id: 3,
      budget_name: "HR Operations 2024",
      department: "Human Resources",
      category: "Training",
      period: "2024-06",
      budget_amount: 500000,
      actual_amount: 320000,
      variance_amount: -180000,
      variance_percentage: -36.0,
      variance_type: "favorable",
      significance: "high",
      cumulative_variance: -680000,
      trend: "decreasing",
      last_month_variance: -200000,
      ytd_budget: 3000000,
      ytd_actual: 1800000,
      ytd_variance: -1200000,
      explanation: "Training programs delayed due to remote work arrangements",
      corrective_action:
        "Accelerate virtual training programs or reallocate budget",
      responsible_person: "Sarah Wilson",
      created_at: "2024-06-30",
    },
  ];

  const mockBudgets = [
    {
      id: 1,
      budget_name: "IT Department Budget 2024-2025",
      department: "IT Department",
    },
    { id: 2, budget_name: "Marketing Campaign Q3-Q4", department: "Marketing" },
    { id: 3, budget_name: "HR Operations 2024", department: "Human Resources" },
  ];

  // Variance types and their characteristics
  const varianceTypes = [
    {
      value: "favorable",
      label: "Favorable",
      color: "success",
      icon: <FavorableIcon />,
      description: "Actual spending below budget",
    },
    {
      value: "unfavorable",
      label: "Unfavorable",
      color: "error",
      icon: <UnfavorableIcon />,
      description: "Actual spending above budget",
    },
    {
      value: "neutral",
      label: "Neutral",
      color: "default",
      icon: <NeutralIcon />,
      description: "Actual spending within acceptable range",
    },
  ];

  // Significance levels
  const significanceLevels = [
    { value: "low", label: "Low", color: "default", threshold: "< 5%" },
    { value: "medium", label: "Medium", color: "warning", threshold: "5-15%" },
    { value: "high", label: "High", color: "error", threshold: "> 15%" },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Variance",
      value: `TZS ${mockVarianceData.reduce((sum, item) => sum + Math.abs(item.variance_amount), 0).toLocaleString()}`,
      subtitle: "Absolute variance",
      icon: <VarianceIcon />,
      color: "primary",
    },
    {
      title: "Unfavorable Variance",
      value: `TZS ${mockVarianceData
        .filter((item) => item.variance_type === "unfavorable")
        .reduce((sum, item) => sum + item.variance_amount, 0)
        .toLocaleString()}`,
      subtitle: "Over budget",
      icon: <UnfavorableIcon />,
      color: "error",
    },
    {
      title: "Favorable Variance",
      value: `TZS ${Math.abs(mockVarianceData.filter((item) => item.variance_type === "favorable").reduce((sum, item) => sum + item.variance_amount, 0)).toLocaleString()}`,
      subtitle: "Under budget",
      icon: <FavorableIcon />,
      color: "success",
    },
    {
      title: "High Significance",
      value: mockVarianceData
        .filter((item) => item.significance === "high")
        .length.toString(),
      subtitle: "Requiring attention",
      icon: <WarningIcon />,
      color: "warning",
    },
  ];

  // Variance analysis metrics
  const analysisMetrics = [
    {
      label: "Average Variance",
      value: `${(mockVarianceData.reduce((sum, item) => sum + Math.abs(item.variance_percentage), 0) / mockVarianceData.length).toFixed(1)}%`,
      trend: "stable",
      status: "good",
    },
    {
      label: "Categories Over Budget",
      value: `${mockVarianceData.filter((item) => item.variance_type === "unfavorable").length}/${mockVarianceData.length}`,
      trend: "increasing",
      status: "warning",
    },
    {
      label: "Largest Variance",
      value: `${Math.max(...mockVarianceData.map((item) => Math.abs(item.variance_percentage))).toFixed(1)}%`,
      trend: "stable",
      status: "warning",
    },
    {
      label: "Variance Trend",
      value: "Increasing",
      trend: "increasing",
      status: "warning",
    },
  ];

  // DataGrid columns for variance analysis
  const columns = [
    {
      field: "budget_info",
      headerName: "Budget / Category",
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.budget_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.department} • {params.row.category}
          </Typography>
        </Box>
      ),
    },
    {
      field: "period",
      headerName: "Period",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value + "-01"), "MMM yyyy")}
        </Typography>
      ),
    },
    {
      field: "budget_amount",
      headerName: "Budget",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "actual_amount",
      headerName: "Actual",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "variance_amount",
      headerName: "Variance Amount",
      width: 140,
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          color={
            params.value > 0
              ? "error.main"
              : params.value < 0
                ? "success.main"
                : "text.primary"
          }
        >
          {params.value > 0 ? "+" : ""}TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "variance_percentage",
      headerName: "Variance %",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={`${params.value > 0 ? "+" : ""}${params.value?.toFixed(1)}%`}
          size="small"
          color={
            params.value > 0
              ? "error"
              : params.value < 0
                ? "success"
                : "default"
          }
          variant="filled"
        />
      ),
    },
    {
      field: "variance_type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => {
        const type = varianceTypes.find((t) => t.value === params.value);
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
      field: "significance",
      headerName: "Significance",
      width: 120,
      renderCell: (params) => {
        const significance = significanceLevels.find(
          (s) => s.value === params.value
        );
        return (
          <Chip
            label={significance?.label}
            size="small"
            color={significance?.color}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "trend",
      headerName: "Trend",
      width: 100,
      renderCell: (params) => (
        <Tooltip title={`Variance trend: ${params.value}`}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {params.value === "increasing" && <TrendingUp color="error" />}
            {params.value === "decreasing" && <TrendingDown color="success" />}
            {params.value === "stable" && <Remove color="action" />}
          </Box>
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
            setSelectedVariance(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load variance analysis data
  useEffect(() => {
    fetchVarianceData();
    fetchBudgets();
  }, [selectedPeriod, selectedBudgetId]);

  const fetchVarianceData = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await budgetAPI.getBudgetVarianceAnalysis({
      //   period: format(selectedPeriod, 'yyyy-MM'),
      //   budget_id: selectedBudgetId,
      //   include_trends: true,
      //   include_explanations: true
      // });
      // setVarianceData(response.data || []);
      setVarianceData(mockVarianceData);
    } catch (error) {
      showError("Failed to fetch variance data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      // Replace with actual API call
      // const response = await budgetAPI.getAllBudgets();
      // setBudgets(response.data || []);
      setBudgets(mockBudgets);
    } catch (error) {
      showError("Failed to fetch budgets");
    }
  };

  // Handle refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVarianceData();
    setRefreshing(false);
    showSuccess("Variance data refreshed successfully");
  };

  // Calculate variance trends
  const getVarianceTrend = (current, previous) => {
    if (!previous) return "stable";
    const change = ((current - previous) / Math.abs(previous)) * 100;
    if (change > 10) return "increasing";
    if (change < -10) return "decreasing";
    return "stable";
  };

  // Filter variance data
  const filteredVarianceData = varianceData.filter((item) => {
    const matchesSearch =
      item.budget_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBudget =
      !selectedBudgetId || item.budget_id.toString() === selectedBudgetId;
    const matchesDepartment =
      !departmentFilter || item.department === departmentFilter;
    const matchesVarianceType =
      !varianceTypeFilter || item.variance_type === varianceTypeFilter;
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesSignificance =
      !showOnlySignificant || item.significance === "high";

    return (
      matchesSearch &&
      matchesBudget &&
      matchesDepartment &&
      matchesVarianceType &&
      matchesCategory &&
      matchesSignificance
    );
  });

  // Group variance data for analysis
  const groupedVarianceData = filteredVarianceData.reduce((acc, item) => {
    const key = `${item.department}-${item.category}`;
    if (!acc[key]) {
      acc[key] = {
        department: item.department,
        category: item.category,
        budget_name: item.budget_name,
        total_variance: 0,
        variance_count: 0,
        items: [],
      };
    }
    acc[key].total_variance += item.variance_amount;
    acc[key].variance_count += 1;
    acc[key].items.push(item);
    return acc;
  }, {});

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
            <Typography variant="h4">Budget Variance Analysis</Typography>
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
                startIcon={<ComparisonDialogOpen />}
                onClick={() => setComparisonDialogOpen(true)}
              >
                Compare Periods
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  /* Export variance report */
                }}
              >
                Export Report
              </Button>
              <Button
                variant="contained"
                startIcon={<AnalysisIcon />}
                onClick={() => navigate("/finance/budgets/monitoring")}
              >
                Back to Monitoring
              </Button>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Detailed analysis of budget vs actual variances with trend analysis
            and explanations
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

        {/* Analysis Metrics */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Variance Analysis Metrics
            </Typography>
            <Grid container spacing={3}>
              {analysisMetrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h5"
                      color={
                        metric.status === "good"
                          ? "success.main"
                          : metric.status === "warning"
                            ? "warning.main"
                            : "error.main"
                      }
                    >
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 0.5,
                      }}
                    >
                      {metric.trend === "increasing" && (
                        <TrendingUp fontSize="small" color="error" />
                      )}
                      {metric.trend === "decreasing" && (
                        <TrendingDown fontSize="small" color="success" />
                      )}
                      {metric.trend === "stable" && (
                        <Remove fontSize="small" color="action" />
                      )}
                    </Box>
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
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
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
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Budget</InputLabel>
                    <Select
                      value={selectedBudgetId}
                      onChange={(e) => setSelectedBudgetId(e.target.value)}
                      label="Budget"
                    >
                      <MenuItem value="">All Budgets</MenuItem>
                      {budgets.map((budget) => (
                        <MenuItem key={budget.id} value={budget.id.toString()}>
                          {budget.budget_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={varianceTypeFilter}
                      onChange={(e) => setVarianceTypeFilter(e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {varianceTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1.5}>
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
                <Grid item xs={12} md={2}>
                  <ToggleButtonGroup
                    value={analysisType}
                    exclusive
                    onChange={(e, newType) =>
                      newType && setAnalysisType(newType)
                    }
                    size="small"
                  >
                    <ToggleButton value="monthly">Monthly</ToggleButton>
                    <ToggleButton value="quarterly">Quarterly</ToggleButton>
                    <ToggleButton value="ytd">YTD</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showOnlySignificant}
                          onChange={(e) =>
                            setShowOnlySignificant(e.target.checked)
                          }
                          size="small"
                        />
                      }
                      label="Significant Only"
                    />
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => newMode && setViewMode(newMode)}
                      size="small"
                    >
                      <ToggleButton value="table">
                        <TableIcon />
                      </ToggleButton>
                      <ToggleButton value="chart">
                        <BarChartIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Content Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
            >
              <Tab label="Variance Analysis" />
              <Tab label="Trend Analysis" />
              <Tab label="Category Breakdown" />
              <Tab label="Root Cause Analysis" />
            </Tabs>

            {/* Variance Analysis Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                {viewMode === "table" ? (
                  <Box sx={{ height: 600, width: "100%" }}>
                    <DataGrid
                      rows={filteredVarianceData}
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
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Interactive variance charts and visualizations will be
                        displayed here.
                      </Typography>
                    </Alert>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Variance by Category
                            </Typography>
                            <Box
                              sx={{
                                height: 300,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Pie chart showing variance distribution by
                                category
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Variance Trends
                            </Typography>
                            <Box
                              sx={{
                                height: 300,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Line chart showing variance trends over time
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            )}

            {/* Trend Analysis Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Variance Trend Analysis
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Budget / Category</TableCell>
                                <TableCell align="right">
                                  Current Period
                                </TableCell>
                                <TableCell align="right">
                                  Previous Period
                                </TableCell>
                                <TableCell align="right">Change</TableCell>
                                <TableCell>Trend</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredVarianceData.map((item) => {
                                const change =
                                  item.variance_amount -
                                  item.last_month_variance;
                                const changePercentage =
                                  item.last_month_variance !== 0
                                    ? (change /
                                        Math.abs(item.last_month_variance)) *
                                      100
                                    : 0;

                                return (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                        >
                                          {item.budget_name}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {item.category}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography
                                        variant="body2"
                                        color={
                                          item.variance_amount > 0
                                            ? "error.main"
                                            : "success.main"
                                        }
                                      >
                                        {item.variance_amount > 0 ? "+" : ""}TZS{" "}
                                        {item.variance_amount.toLocaleString()}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography
                                        variant="body2"
                                        color={
                                          item.last_month_variance > 0
                                            ? "error.main"
                                            : "success.main"
                                        }
                                      >
                                        {item.last_month_variance > 0
                                          ? "+"
                                          : ""}
                                        TZS{" "}
                                        {item.last_month_variance.toLocaleString()}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography
                                        variant="body2"
                                        color={
                                          change > 0
                                            ? "error.main"
                                            : change < 0
                                              ? "success.main"
                                              : "text.primary"
                                        }
                                      >
                                        {change > 0 ? "+" : ""}TZS{" "}
                                        {change.toLocaleString()}
                                        <br />
                                        <Typography variant="caption">
                                          ({changePercentage > 0 ? "+" : ""}
                                          {changePercentage.toFixed(1)}%)
                                        </Typography>
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        {item.trend === "increasing" && (
                                          <>
                                            <TrendingUp
                                              color="error"
                                              fontSize="small"
                                            />
                                            <Typography
                                              variant="caption"
                                              color="error.main"
                                            >
                                              Increasing
                                            </Typography>
                                          </>
                                        )}
                                        {item.trend === "decreasing" && (
                                          <>
                                            <TrendingDown
                                              color="success"
                                              fontSize="small"
                                            />
                                            <Typography
                                              variant="caption"
                                              color="success.main"
                                            >
                                              Decreasing
                                            </Typography>
                                          </>
                                        )}
                                        {item.trend === "stable" && (
                                          <>
                                            <Remove
                                              color="action"
                                              fontSize="small"
                                            />
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Stable
                                            </Typography>
                                          </>
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={item.significance}
                                        size="small"
                                        color={
                                          item.significance === "high"
                                            ? "error"
                                            : item.significance === "medium"
                                              ? "warning"
                                              : "default"
                                        }
                                        variant="outlined"
                                      />
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
                </Grid>
              </Box>
            )}

            {/* Category Breakdown Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  {Object.values(groupedVarianceData).map((group, index) => (
                    <Grid item xs={12} md={6} key={index}>
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
                            <CategoryIcon color="primary" />
                            <Typography variant="h6">
                              {group.department} - {group.category}
                            </Typography>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Total Variance
                              </Typography>
                              <Typography
                                variant="h6"
                                color={
                                  group.total_variance > 0
                                    ? "error.main"
                                    : "success.main"
                                }
                              >
                                {group.total_variance > 0 ? "+" : ""}TZS{" "}
                                {group.total_variance.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Variance Instances
                              </Typography>
                              <Typography variant="h6">
                                {group.variance_count}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              Recent Variances
                            </Typography>
                            {group.items.slice(0, 3).map((item, itemIndex) => (
                              <Box
                                key={itemIndex}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  py: 0.5,
                                }}
                              >
                                <Typography variant="caption">
                                  {format(
                                    new Date(item.period + "-01"),
                                    "MMM yyyy"
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color={
                                    item.variance_amount > 0
                                      ? "error.main"
                                      : "success.main"
                                  }
                                >
                                  {item.variance_amount > 0 ? "+" : ""}
                                  {item.variance_percentage.toFixed(1)}%
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Root Cause Analysis Tab */}
            {activeTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Root Cause Analysis & Corrective Actions
                </Typography>

                {filteredVarianceData
                  .filter((item) => item.significance === "high")
                  .map((item) => (
                    <Accordion key={item.id} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flexGrow: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {item.variance_type === "unfavorable" ? (
                              <BadIcon color="error" />
                            ) : (
                              <GoodIcon color="success" />
                            )}
                            <Typography variant="subtitle1" fontWeight="medium">
                              {item.category} - {item.department}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${item.variance_amount > 0 ? "+" : ""}${item.variance_percentage.toFixed(1)}%`}
                            size="small"
                            color={
                              item.variance_type === "unfavorable"
                                ? "error"
                                : "success"
                            }
                            variant="filled"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={8}>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                Root Cause Explanation
                              </Typography>
                              <Typography variant="body2">
                                {item.explanation}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                Corrective Action Taken
                              </Typography>
                              <Typography variant="body2">
                                {item.corrective_action}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                Responsible Person
                              </Typography>
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
                                  {item.responsible_person?.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">
                                  {item.responsible_person}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                  Variance Details
                                </Typography>
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Budget Amount
                                  </Typography>
                                  <Typography variant="body2">
                                    TZS {item.budget_amount.toLocaleString()}
                                  </Typography>
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Actual Amount
                                  </Typography>
                                  <Typography variant="body2">
                                    TZS {item.actual_amount.toLocaleString()}
                                  </Typography>
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Variance Amount
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color={
                                      item.variance_amount > 0
                                        ? "error.main"
                                        : "success.main"
                                    }
                                  >
                                    {item.variance_amount > 0 ? "+" : ""}TZS{" "}
                                    {item.variance_amount.toLocaleString()}
                                  </Typography>
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    YTD Variance
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color={
                                      item.ytd_variance > 0
                                        ? "error.main"
                                        : "success.main"
                                    }
                                  >
                                    {item.ytd_variance > 0 ? "+" : ""}TZS{" "}
                                    {item.ytd_variance.toLocaleString()}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                {filteredVarianceData.filter(
                  (item) => item.significance === "high"
                ).length === 0 && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      No high-significance variances found for the selected
                      period and filters.
                    </Typography>
                  </Alert>
                )}
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
          <MenuItem
            onClick={() =>
              navigate(
                `/finance/budgets/monitoring?budgetId=${selectedVariance?.budget_id}`
              )
            }
          >
            <ListItemIcon>
              <AnalysisIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Budget Monitoring</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_BUDGET) && (
            <MenuItem
              onClick={() =>
                navigate(
                  `/finance/budgets/planning?budgetId=${selectedVariance?.budget_id}`
                )
              }
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Budget</ListItemText>
            </MenuItem>
          )}
          <Divider />
          <MenuItem
            onClick={() => {
              /* Export variance analysis */
            }}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Analysis</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              /* Print variance report */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Report</ListItemText>
          </MenuItem>
        </Menu>

        {/* Variance Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Variance Analysis Details - {selectedVariance?.category}
          </DialogTitle>
          <DialogContent>
            {selectedVariance && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Variance Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Budget Name
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedVariance.budget_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Period
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {format(
                                new Date(selectedVariance.period + "-01"),
                                "MMMM yyyy"
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Department
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedVariance.department}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Category
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedVariance.category}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Explanation
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedVariance.explanation}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Corrective Action
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedVariance.corrective_action}
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
                          Financial Details
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Budget Amount
                          </Typography>
                          <Typography variant="h6" color="primary">
                            TZS{" "}
                            {selectedVariance.budget_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Actual Amount
                          </Typography>
                          <Typography variant="h6">
                            TZS{" "}
                            {selectedVariance.actual_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Variance Amount
                          </Typography>
                          <Typography
                            variant="h6"
                            color={
                              selectedVariance.variance_amount > 0
                                ? "error.main"
                                : "success.main"
                            }
                          >
                            {selectedVariance.variance_amount > 0 ? "+" : ""}TZS{" "}
                            {selectedVariance.variance_amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Variance Percentage
                          </Typography>
                          <Typography
                            variant="h6"
                            color={
                              selectedVariance.variance_percentage > 0
                                ? "error.main"
                                : "success.main"
                            }
                          >
                            {selectedVariance.variance_percentage > 0
                              ? "+"
                              : ""}
                            {selectedVariance.variance_percentage?.toFixed(1)}%
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            YTD Budget
                          </Typography>
                          <Typography variant="body1">
                            TZS {selectedVariance.ytd_budget?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            YTD Actual
                          </Typography>
                          <Typography variant="body1">
                            TZS {selectedVariance.ytd_actual?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            YTD Variance
                          </Typography>
                          <Typography
                            variant="h6"
                            color={
                              selectedVariance.ytd_variance > 0
                                ? "error.main"
                                : "success.main"
                            }
                          >
                            {selectedVariance.ytd_variance > 0 ? "+" : ""}TZS{" "}
                            {selectedVariance.ytd_variance?.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Variance Classification
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Type
                          </Typography>
                          <Chip
                            label={
                              varianceTypes.find(
                                (t) =>
                                  t.value === selectedVariance.variance_type
                              )?.label
                            }
                            color={
                              varianceTypes.find(
                                (t) =>
                                  t.value === selectedVariance.variance_type
                              )?.color
                            }
                            variant="filled"
                            icon={
                              varianceTypes.find(
                                (t) =>
                                  t.value === selectedVariance.variance_type
                              )?.icon
                            }
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Significance
                          </Typography>
                          <Chip
                            label={
                              significanceLevels.find(
                                (s) => s.value === selectedVariance.significance
                              )?.label
                            }
                            color={
                              significanceLevels.find(
                                (s) => s.value === selectedVariance.significance
                              )?.color
                            }
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Trend
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 0.5,
                            }}
                          >
                            {selectedVariance.trend === "increasing" && (
                              <>
                                <TrendingUp color="error" />
                                <Typography variant="body2" color="error.main">
                                  Increasing
                                </Typography>
                              </>
                            )}
                            {selectedVariance.trend === "decreasing" && (
                              <>
                                <TrendingDown color="success" />
                                <Typography
                                  variant="body2"
                                  color="success.main"
                                >
                                  Decreasing
                                </Typography>
                              </>
                            )}
                            {selectedVariance.trend === "stable" && (
                              <>
                                <Remove color="action" />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Stable
                                </Typography>
                              </>
                            )}
                          </Box>
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
                /* Print variance details */
              }}
            >
              Print Details
            </Button>
            {hasPermission(PERMISSIONS.MANAGE_BUDGET) && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  navigate(
                    `/finance/budgets/planning?budgetId=${selectedVariance?.budget_id}`
                  );
                }}
              >
                Edit Budget
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Period Comparison Dialog */}
        <Dialog
          open={comparisonDialogOpen}
          onClose={() => setComparisonDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Compare Budget Variance Across Periods</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Primary Period"
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  views={["year", "month"]}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Comparison Period"
                  value={comparisonPeriod}
                  onChange={setComparisonPeriod}
                  views={["year", "month"]}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Period comparison analysis will show variance trends,
                    improvements, and deteriorations between selected periods.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setComparisonDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setComparisonDialogOpen(false);
                showSuccess("Period comparison analysis generated");
              }}
            >
              Generate Comparison
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

export default BudgetVarianceAnalysisPage;
