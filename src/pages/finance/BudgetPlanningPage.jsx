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
  LinearProgress,
  Tooltip,
  Alert,
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
  AccountBalance as BudgetIcon,
  TrendingUp as IncreaseIcon,
  TrendingDown as DecreaseIcon,
  AccountTree as PlanningIcon,
  Assessment as ReportIcon,
  CompareArrows as VarianceIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, getYear } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";

const BudgetPlanningPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [fiscalYearFilter, setFiscalYearFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    allocatedBudget: 0,
    remainingBudget: 0,
    utilizedBudget: 0,
    pendingApprovals: 0,
  });

  // Sample budget data based on GH Budget template
  const sampleBudgets = [
    {
      id: 1,
      budget_code: "BUD-2024-001",
      budget_name: "IT Department Annual Budget",
      fiscal_year: "2024",
      department: "IT Department",
      category: "Operational",
      total_budget: 50000000,
      allocated_amount: 45000000,
      utilized_amount: 30000000,
      remaining_amount: 15000000,
      status: "approved",
      created_by: "Finance Manager",
      approval_date: "2024-01-15",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      description:
        "Annual operational budget for IT Department including hardware, software, and maintenance",
      budget_lines: [
        { category: "Hardware", allocated: 20000000, utilized: 15000000 },
        { category: "Software", allocated: 15000000, utilized: 10000000 },
        { category: "Maintenance", allocated: 10000000, utilized: 5000000 },
      ],
    },
    {
      id: 2,
      budget_code: "BUD-2024-002",
      budget_name: "HR Training & Development",
      fiscal_year: "2024",
      department: "Human Resources",
      category: "Development",
      total_budget: 25000000,
      allocated_amount: 25000000,
      utilized_amount: 12000000,
      remaining_amount: 13000000,
      status: "active",
      created_by: "HR Manager",
      approval_date: "2024-02-01",
      start_date: "2024-02-01",
      end_date: "2024-12-31",
      description:
        "Budget for employee training, workshops, and professional development programs",
      budget_lines: [
        {
          category: "External Training",
          allocated: 15000000,
          utilized: 8000000,
        },
        {
          category: "Internal Workshops",
          allocated: 7000000,
          utilized: 3000000,
        },
        {
          category: "Certification Programs",
          allocated: 3000000,
          utilized: 1000000,
        },
      ],
    },
    {
      id: 3,
      budget_code: "BUD-2024-003",
      budget_name: "Program Implementation - GBV Prevention",
      fiscal_year: "2024",
      department: "Programs",
      category: "Program",
      total_budget: 100000000,
      allocated_amount: 80000000,
      utilized_amount: 40000000,
      remaining_amount: 40000000,
      status: "pending",
      created_by: "Program Manager",
      approval_date: null,
      start_date: "2024-03-01",
      end_date: "2024-12-31",
      description:
        "Budget for Gender-Based Violence prevention and response program activities",
      budget_lines: [
        {
          category: "Community Outreach",
          allocated: 40000000,
          utilized: 20000000,
        },
        {
          category: "Training Materials",
          allocated: 25000000,
          utilized: 15000000,
        },
        { category: "Transportation", allocated: 15000000, utilized: 5000000 },
      ],
    },
  ];

  // Sample fiscal years
  const fiscalYears = ["2023", "2024", "2025"];
  const departments = [
    "IT Department",
    "Human Resources",
    "Finance",
    "Programs",
    "Administration",
  ];

  useEffect(() => {
    fetchBudgets();
    calculateSummary();
  }, [fiscalYearFilter, departmentFilter]);

  useEffect(() => {
    calculateSummary();
  }, [budgets]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let filteredData = sampleBudgets;
      if (fiscalYearFilter) {
        filteredData = filteredData.filter(
          (b) => b.fiscal_year === fiscalYearFilter
        );
      }
      if (departmentFilter) {
        filteredData = filteredData.filter(
          (b) => b.department === departmentFilter
        );
      }

      setBudgets(filteredData);
    } catch (error) {
      showError("Failed to fetch budgets");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const summary = budgets.reduce(
      (acc, budget) => {
        acc.totalBudget += budget.total_budget;
        acc.allocatedBudget += budget.allocated_amount;
        acc.utilizedBudget += budget.utilized_amount;
        acc.remainingBudget += budget.remaining_amount;
        if (budget.status === "pending") acc.pendingApprovals += 1;
        return acc;
      },
      {
        totalBudget: 0,
        allocatedBudget: 0,
        remainingBudget: 0,
        utilizedBudget: 0,
        pendingApprovals: 0,
      }
    );

    setBudgetSummary(summary);
  };

  const handleCreateBudget = () => {
    navigate("/finance/budgets/create");
  };

  const handleEditBudget = (budgetId) => {
    navigate(`/finance/budgets/${budgetId}/edit`);
  };

  const handleViewBudget = (budgetId) => {
    navigate(`/finance/budgets/${budgetId}`);
  };

  const handleCopyBudget = async (budgetId) => {
    try {
      // API call to copy budget
      showSuccess("Budget copied successfully");
      fetchBudgets();
    } catch (error) {
      showError("Failed to copy budget");
    }
  };

  const handleApproveBudget = async (budgetId) => {
    openDialog({
      title: "Approve Budget",
      message: "Are you sure you want to approve this budget?",
      onConfirm: async () => {
        try {
          // API call to approve budget
          showSuccess("Budget approved successfully");
          fetchBudgets();
        } catch (error) {
          showError("Failed to approve budget");
        }
      },
    });
  };

  const handleDeleteBudget = async (budgetId) => {
    openDialog({
      title: "Delete Budget",
      message:
        "Are you sure you want to delete this budget? This action cannot be undone.",
      onConfirm: async () => {
        try {
          // API call to delete budget
          showSuccess("Budget deleted successfully");
          fetchBudgets();
        } catch (error) {
          showError("Failed to delete budget");
        }
      },
    });
  };

  const handleMenuClick = (event, budget) => {
    setAnchorEl(event.currentTarget);
    setSelectedBudget(budget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBudget(null);
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
      case "approved":
        return "success";
      case "active":
        return "primary";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      case "expired":
        return "error";
      default:
        return "default";
    }
  };

  const getUtilizationPercentage = (utilized, allocated) => {
    return allocated > 0 ? (utilized / allocated) * 100 : 0;
  };

  const getUtilizationColor = (percentage) => {
    if (percentage <= 50) return "success";
    if (percentage <= 80) return "warning";
    return "error";
  };

  const columns = [
    {
      field: "budget_code",
      headerName: "Budget Code",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "budget_name",
      headerName: "Budget Name",
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
      field: "total_budget",
      headerName: "Total Budget",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: "utilization",
      headerName: "Utilization",
      width: 200,
      renderCell: (params) => {
        const percentage = getUtilizationPercentage(
          params.row.utilized_amount,
          params.row.allocated_amount
        );
        return (
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="caption">
                {formatCurrency(params.row.utilized_amount)}
              </Typography>
              <Typography variant="caption">
                {percentage.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              color={getUtilizationColor(percentage)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        );
      },
    },
    {
      field: "remaining_amount",
      headerName: "Remaining",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" color="primary" fontWeight="medium">
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

  const filteredBudgets = budgets
    .filter(
      (budget) =>
        budget.budget_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.budget_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((budget) => statusFilter === "" || budget.status === statusFilter);

  const summaryCards = [
    {
      title: "Total Budget",
      value: formatCurrency(budgetSummary.totalBudget),
      icon: <BudgetIcon />,
      color: "primary",
    },
    {
      title: "Allocated",
      value: formatCurrency(budgetSummary.allocatedBudget),
      icon: <PlanningIcon />,
      color: "info",
    },
    {
      title: "Utilized",
      value: formatCurrency(budgetSummary.utilizedBudget),
      icon: <IncreaseIcon />,
      color: "success",
    },
    {
      title: "Remaining",
      value: formatCurrency(budgetSummary.remainingBudget),
      icon: <DecreaseIcon />,
      color: "warning",
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Budget Planning & Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Plan, monitor, and control organizational budgets and expenditures
            </Typography>
          </Box>
          {hasPermission(PERMISSIONS.CREATE_BUDGET_PLANS) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateBudget}
            >
              Create Budget
            </Button>
          )}
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

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="All Budgets" />
            <Tab label="Budget Analysis" />
            <Tab label="Variance Report" />
            <Tab label="Budget Templates" />
          </Tabs>
        </Card>

        {/* Main Content */}
        <Card>
          <CardContent>
            {activeTab === 0 && (
              <>
                {/* Filters */}
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
                      <TextField
                        fullWidth
                        size="small"
                        select
                        label="Fiscal Year"
                        value={fiscalYearFilter}
                        onChange={(e) => setFiscalYearFilter(e.target.value)}
                      >
                        <MenuItem value="">All Years</MenuItem>
                        {fiscalYears.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
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
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </TextField>
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
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="expired">Expired</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<ExportIcon />}
                          size="small"
                        >
                          Export
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ReportIcon />}
                          size="small"
                          onClick={() => navigate("/reports/budget")}
                        >
                          Reports
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
                    rows={filteredBudgets}
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
              </>
            )}

            {activeTab === 1 && (
              // Budget Analysis Tab
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Budget Analysis by Department
                </Typography>
                <Grid container spacing={3}>
                  {departments.map((department) => {
                    const deptBudgets = budgets.filter(
                      (b) => b.department === department
                    );
                    const totalBudget = deptBudgets.reduce(
                      (sum, b) => sum + b.total_budget,
                      0
                    );
                    const utilizedBudget = deptBudgets.reduce(
                      (sum, b) => sum + b.utilized_amount,
                      0
                    );
                    const utilizationPercentage =
                      totalBudget > 0
                        ? (utilizedBudget / totalBudget) * 100
                        : 0;

                    return (
                      <Grid item xs={12} md={6} key={department}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              {department}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 1,
                                }}
                              >
                                <Typography variant="body2">
                                  Total Budget:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {formatCurrency(totalBudget)}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 1,
                                }}
                              >
                                <Typography variant="body2">
                                  Utilized:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {formatCurrency(utilizedBudget)}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 2,
                                }}
                              >
                                <Typography variant="body2">
                                  Utilization:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {utilizationPercentage.toFixed(1)}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(utilizationPercentage, 100)}
                                color={getUtilizationColor(
                                  utilizationPercentage
                                )}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {deptBudgets.length} budget(s) allocated
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            {activeTab === 2 && (
              // Variance Report Tab
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Budget Variance Analysis
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Budget Name</TableCell>
                        <TableCell align="right">Allocated</TableCell>
                        <TableCell align="right">Utilized</TableCell>
                        <TableCell align="right">Variance</TableCell>
                        <TableCell align="right">Variance %</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {budgets.map((budget) => {
                        const variance =
                          budget.allocated_amount - budget.utilized_amount;
                        const variancePercentage =
                          budget.allocated_amount > 0
                            ? (variance / budget.allocated_amount) * 100
                            : 0;
                        const isOverBudget = variance < 0;

                        return (
                          <TableRow key={budget.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {budget.budget_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {budget.department}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(budget.allocated_amount)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(budget.utilized_amount)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                color={isOverBudget ? "error" : "success"}
                                fontWeight="medium"
                              >
                                {formatCurrency(Math.abs(variance))}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${isOverBudget ? "+" : ""}${variancePercentage.toFixed(1)}%`}
                                color={isOverBudget ? "error" : "success"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {isOverBudget ? (
                                  <WarningIcon color="error" fontSize="small" />
                                ) : (
                                  <CheckCircle
                                    color="success"
                                    fontSize="small"
                                  />
                                )}
                                <Typography variant="body2">
                                  {isOverBudget
                                    ? "Over Budget"
                                    : "Within Budget"}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeTab === 3 && (
              // Budget Templates Tab
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Budget Templates
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Create budget templates to streamline budget planning for
                  recurring activities and departments.
                </Alert>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card
                      sx={{
                        height: 200,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "2px dashed",
                        borderColor: "grey.300",
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <AddIcon
                          sx={{ fontSize: 48, color: "grey.500", mb: 2 }}
                        />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Create Template
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create a new budget template
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Department Annual Budget
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Standard template for department annual budgets
                        </Typography>
                        <Button variant="outlined" size="small">
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Program Budget
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Template for program implementation budgets
                        </Typography>
                        <Button variant="outlined" size="small">
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
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
              handleViewBudget(selectedBudget?.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>

          {hasPermission(PERMISSIONS.CREATE_BUDGET_PLANS) && (
            <MenuItem
              onClick={() => {
                handleEditBudget(selectedBudget?.id);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Budget</ListItemText>
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              handleCopyBudget(selectedBudget?.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy Budget</ListItemText>
          </MenuItem>

          {hasPermission(PERMISSIONS.APPROVE_BUDGET_REVISIONS) &&
            selectedBudget?.status === "pending" && (
              <MenuItem
                onClick={() => {
                  handleApproveBudget(selectedBudget?.id);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <ApprovedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Approve Budget</ListItemText>
              </MenuItem>
            )}

          {hasPermission(PERMISSIONS.CREATE_BUDGET_PLANS) && (
            <MenuItem
              onClick={() => {
                handleDeleteBudget(selectedBudget?.id);
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete Budget</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>
    </LocalizationProvider>
  );
};

export default BudgetPlanningPage;
