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
  TrendingDown as DepreciationIcon,
  Calculate as CalculateIcon,
  Assessment as ReportIcon,
  MonetizationOn as MoneyIcon,
  DateRange as DateIcon,
  Category as CategoryIcon,
  Inventory as AssetIcon,
  Timeline as TimelineIcon,
  AccountBalance as BookValueIcon,
  TrendingUp as AppreciationIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Update as RecalculateIcon,
  Settings as MethodIcon,
  Schedule as ScheduleIcon,
  PieChart as ChartIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  format,
  differenceInYears,
  differenceInMonths,
  addYears,
  startOfYear,
  endOfYear,
} from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
// import { assetAPI } from '../../../services/api/asset.api';

const AssetDepreciationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get("assetId");
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [depreciationRecords, setDepreciationRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [assetFilter, setAssetFilter] = useState(assetId || "");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("2024");

  // Form state
  const [formData, setFormData] = useState({
    asset_id: assetId || "",
    depreciation_method: "straight_line",
    useful_life_years: 5,
    salvage_value: 0,
    depreciation_rate: 20,
    start_date: null,
    notes: "",
  });

  // Mock data for development
  const mockDepreciationRecords = [
    {
      id: 1,
      asset_id: 1,
      asset_name: "Dell Latitude 5520",
      asset_tag: "GHF-LT-001",
      category: "IT Equipment",
      purchase_date: "2023-01-15",
      purchase_cost: 1200000,
      current_book_value: 960000,
      accumulated_depreciation: 240000,
      depreciation_method: "straight_line",
      useful_life_years: 5,
      salvage_value: 50000,
      annual_depreciation: 230000,
      monthly_depreciation: 19167,
      depreciation_rate: 20,
      age_years: 1.4,
      remaining_life: 3.6,
      depreciation_percentage: 20,
      last_calculated: "2024-06-30",
      status: "active",
      created_by: "System",
    },
    {
      id: 2,
      asset_id: 2,
      asset_name: "Toyota Hilux",
      asset_tag: "GHF-VH-001",
      category: "Vehicles",
      purchase_date: "2023-03-20",
      purchase_cost: 4500000,
      current_book_value: 3825000,
      accumulated_depreciation: 675000,
      depreciation_method: "declining_balance",
      useful_life_years: 8,
      salvage_value: 500000,
      annual_depreciation: 562500,
      monthly_depreciation: 46875,
      depreciation_rate: 15,
      age_years: 1.2,
      remaining_life: 6.8,
      depreciation_percentage: 15,
      last_calculated: "2024-06-30",
      status: "active",
      created_by: "Finance Team",
    },
    {
      id: 3,
      asset_id: 3,
      asset_name: "Executive Desk",
      asset_tag: "GHF-FN-001",
      category: "Furniture",
      purchase_date: "2022-11-10",
      purchase_cost: 85000,
      current_book_value: 72250,
      accumulated_depreciation: 12750,
      depreciation_method: "straight_line",
      useful_life_years: 10,
      salvage_value: 5000,
      annual_depreciation: 8000,
      monthly_depreciation: 667,
      depreciation_rate: 10,
      age_years: 1.6,
      remaining_life: 8.4,
      depreciation_percentage: 15,
      last_calculated: "2024-06-30",
      status: "active",
      created_by: "System",
    },
  ];

  // Depreciation methods
  const depreciationMethods = [
    {
      value: "straight_line",
      label: "Straight Line",
      description: "Equal depreciation amount each year",
      formula: "(Cost - Salvage Value) / Useful Life",
    },
    {
      value: "declining_balance",
      label: "Declining Balance",
      description: "Higher depreciation in early years",
      formula: "Book Value × Depreciation Rate",
    },
    {
      value: "double_declining",
      label: "Double Declining Balance",
      description: "Accelerated depreciation method",
      formula: "Book Value × (2 / Useful Life)",
    },
    {
      value: "sum_of_years",
      label: "Sum of Years Digits",
      description: "Weighted depreciation based on remaining life",
      formula: "Remaining Life / Sum of Years × Depreciable Amount",
    },
    {
      value: "units_of_production",
      label: "Units of Production",
      description: "Based on actual usage or production",
      formula: "(Cost - Salvage) / Total Units × Units Used",
    },
  ];

  // Asset categories with standard depreciation rates
  const categoryDepreciationRates = [
    { category: "IT Equipment", rate: 20, life: 5 },
    { category: "Vehicles", rate: 15, life: 8 },
    { category: "Furniture", rate: 10, life: 10 },
    { category: "Buildings", rate: 2.5, life: 40 },
    { category: "Machinery", rate: 12.5, life: 8 },
    { category: "Office Equipment", rate: 15, life: 7 },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Assets",
      value: mockDepreciationRecords.length.toString(),
      icon: <AssetIcon />,
      color: "primary",
    },
    {
      title: "Total Book Value",
      value: `TZS ${mockDepreciationRecords.reduce((sum, record) => sum + record.current_book_value, 0).toLocaleString()}`,
      icon: <BookValueIcon />,
      color: "success",
    },
    {
      title: "Annual Depreciation",
      value: `TZS ${mockDepreciationRecords.reduce((sum, record) => sum + record.annual_depreciation, 0).toLocaleString()}`,
      icon: <DepreciationIcon />,
      color: "warning",
    },
    {
      title: "Accumulated Depreciation",
      value: `TZS ${mockDepreciationRecords.reduce((sum, record) => sum + record.accumulated_depreciation, 0).toLocaleString()}`,
      icon: <TrendingDown />,
      color: "error",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "asset_info",
      headerName: "Asset",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.asset_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.asset_tag} • {params.row.category}
          </Typography>
        </Box>
      ),
    },
    {
      field: "purchase_cost",
      headerName: "Purchase Cost",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "current_book_value",
      headerName: "Book Value",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="success.main">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "accumulated_depreciation",
      headerName: "Accumulated Depreciation",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="error.main">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "depreciation_method",
      headerName: "Method",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={
            depreciationMethods.find((m) => m.value === params.value)?.label ||
            params.value
          }
          size="small"
          variant="outlined"
          icon={<MethodIcon />}
        />
      ),
    },
    {
      field: "annual_depreciation",
      headerName: "Annual Depreciation",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "depreciation_progress",
      headerName: "Depreciation Progress",
      width: 180,
      renderCell: (params) => (
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography variant="caption">
              {params.row.age_years.toFixed(1)} / {params.row.useful_life_years}{" "}
              years
            </Typography>
            <Typography variant="caption">
              {params.row.depreciation_percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={params.row.depreciation_percentage}
            sx={{ height: 6, borderRadius: 3 }}
            color={
              params.row.depreciation_percentage > 80 ? "error" : "primary"
            }
          />
        </Box>
      ),
    },
    {
      field: "remaining_life",
      headerName: "Remaining Life",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.toFixed(1)} years
        </Typography>
      ),
    },
    {
      field: "last_calculated",
      headerName: "Last Calculated",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), "dd/MM/yyyy")}
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
            setSelectedRecord(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load depreciation records data
  useEffect(() => {
    fetchDepreciationRecords();
    fetchAssets();
  }, []);

  const fetchDepreciationRecords = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await assetAPI.getAssetDepreciation();
      // setDepreciationRecords(response.data || []);
      setDepreciationRecords(mockDepreciationRecords);
    } catch (error) {
      showError("Failed to fetch depreciation records");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      // Replace with actual API call
      // const response = await assetAPI.getAllAssets();
      // setAssets(response.data || []);
      setAssets([
        {
          id: 1,
          asset_name: "Dell Latitude 5520",
          asset_tag: "GHF-LT-001",
          category: "IT Equipment",
        },
        {
          id: 2,
          asset_name: "Toyota Hilux",
          asset_tag: "GHF-VH-001",
          category: "Vehicles",
        },
        {
          id: 3,
          asset_name: "Executive Desk",
          asset_tag: "GHF-FN-001",
          category: "Furniture",
        },
      ]);
    } catch (error) {
      showError("Failed to fetch assets");
    }
  };

  // Calculate depreciation
  const calculateDepreciation = (assetData, method = "straight_line") => {
    const { purchase_cost, salvage_value, useful_life_years, purchase_date } =
      assetData;
    const depreciableAmount = purchase_cost - salvage_value;
    const currentDate = new Date();
    const ageInYears = differenceInYears(currentDate, new Date(purchase_date));
    const ageInMonths = differenceInMonths(
      currentDate,
      new Date(purchase_date)
    );

    let annualDepreciation = 0;
    let accumulatedDepreciation = 0;
    let bookValue = purchase_cost;

    switch (method) {
      case "straight_line":
        annualDepreciation = depreciableAmount / useful_life_years;
        accumulatedDepreciation = Math.min(
          annualDepreciation * ageInYears,
          depreciableAmount
        );
        break;

      case "declining_balance":
        const rate = 2 / useful_life_years; // Double declining rate
        for (let year = 1; year <= ageInYears; year++) {
          const yearlyDepreciation = Math.max(bookValue * rate, 0);
          accumulatedDepreciation += yearlyDepreciation;
          bookValue -= yearlyDepreciation;
          if (year === ageInYears) annualDepreciation = yearlyDepreciation;
        }
        break;

      case "sum_of_years":
        const sumOfYears = (useful_life_years * (useful_life_years + 1)) / 2;
        for (let year = 1; year <= ageInYears; year++) {
          const remainingLife = useful_life_years - year + 1;
          const yearlyDepreciation =
            (remainingLife / sumOfYears) * depreciableAmount;
          accumulatedDepreciation += yearlyDepreciation;
          if (year === ageInYears) annualDepreciation = yearlyDepreciation;
        }
        break;

      default:
        annualDepreciation = depreciableAmount / useful_life_years;
        accumulatedDepreciation = Math.min(
          annualDepreciation * ageInYears,
          depreciableAmount
        );
    }

    bookValue = Math.max(
      purchase_cost - accumulatedDepreciation,
      salvage_value
    );
    const monthlyDepreciation = annualDepreciation / 12;
    const depreciationPercentage =
      (accumulatedDepreciation / depreciableAmount) * 100;

    return {
      annualDepreciation: Math.round(annualDepreciation),
      monthlyDepreciation: Math.round(monthlyDepreciation),
      accumulatedDepreciation: Math.round(accumulatedDepreciation),
      currentBookValue: Math.round(bookValue),
      depreciationPercentage: Math.min(depreciationPercentage, 100),
      remainingLife: Math.max(useful_life_years - ageInYears, 0),
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingRecord) {
        // await assetAPI.updateAssetDepreciation(editingRecord.id, formData);
        showSuccess("Depreciation settings updated successfully");
      } else {
        // await assetAPI.calculateAssetDepreciation(formData);
        showSuccess("Depreciation calculated successfully");
      }
      setDialogOpen(false);
      setCalculationDialogOpen(false);
      resetForm();
      fetchDepreciationRecords();
    } catch (error) {
      showError("Failed to save depreciation settings");
    }
  };

  const resetForm = () => {
    setFormData({
      asset_id: assetId || "",
      depreciation_method: "straight_line",
      useful_life_years: 5,
      salvage_value: 0,
      depreciation_rate: 20,
      start_date: null,
      notes: "",
    });
    setEditingRecord(null);
  };

  // Handle edit
  const handleEdit = (record) => {
    setFormData({ ...record });
    setEditingRecord(record);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle recalculate
  const handleRecalculate = async (record) => {
    try {
      // await assetAPI.recalculateDepreciation(record.asset_id);
      showSuccess("Depreciation recalculated successfully");
      fetchDepreciationRecords();
    } catch (error) {
      showError("Failed to recalculate depreciation");
    }
    setAnchorEl(null);
  };

  // Handle bulk recalculation
  const handleBulkRecalculation = async () => {
    openDialog({
      title: "Recalculate All Depreciation",
      message:
        "This will recalculate depreciation for all assets. This action may take a few moments. Continue?",
      onConfirm: async () => {
        try {
          // await assetAPI.bulkRecalculateDepreciation();
          showSuccess("All depreciation records recalculated successfully");
          fetchDepreciationRecords();
        } catch (error) {
          showError("Failed to recalculate depreciation");
        }
      },
    });
  };

  // Filter depreciation records
  const filteredDepreciationRecords = depreciationRecords.filter((record) => {
    const matchesSearch =
      record.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.asset_tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod =
      !methodFilter || record.depreciation_method === methodFilter;
    const matchesCategory =
      !categoryFilter || record.category === categoryFilter;
    const matchesAsset =
      !assetFilter || record.asset_id.toString() === assetFilter;

    return matchesSearch && matchesMethod && matchesCategory && matchesAsset;
  });

  // Handle category change in form
  const handleCategoryChange = (category) => {
    const categoryInfo = categoryDepreciationRates.find(
      (c) => c.category === category
    );
    if (categoryInfo) {
      setFormData((prev) => ({
        ...prev,
        useful_life_years: categoryInfo.life,
        depreciation_rate: categoryInfo.rate,
      }));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Asset Depreciation Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Calculate, track, and manage asset depreciation using various
            methods
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
                    placeholder="Search assets..."
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
                    <InputLabel>Method</InputLabel>
                    <Select
                      value={methodFilter}
                      onChange={(e) => setMethodFilter(e.target.value)}
                      label="Method"
                    >
                      <MenuItem value="">All Methods</MenuItem>
                      {depreciationMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categoryDepreciationRates.map((cat) => (
                        <MenuItem key={cat.category} value={cat.category}>
                          {cat.category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Fiscal Year</InputLabel>
                    <Select
                      value={selectedFiscalYear}
                      onChange={(e) => setSelectedFiscalYear(e.target.value)}
                      label="Fiscal Year"
                    >
                      <MenuItem value="2024">2024-2025</MenuItem>
                      <MenuItem value="2023">2023-2024</MenuItem>
                      <MenuItem value="2022">2022-2023</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {hasPermission(PERMISSIONS.CALCULATE_DEPRECIATION) && (
                      <Button
                        variant="contained"
                        startIcon={<CalculateIcon />}
                        onClick={() => setCalculationDialogOpen(true)}
                      >
                        Calculate
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<RecalculateIcon />}
                      onClick={handleBulkRecalculation}
                    >
                      Recalculate All
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ReportIcon />}
                      onClick={() => navigate("/reports/assets")}
                    >
                      Reports
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
              <Tab label="Depreciation Records" />
              <Tab label="Depreciation Schedule" />
              <Tab label="Analytics" />
              <Tab label="Methods Guide" />
            </Tabs>

            {/* Depreciation Records Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredDepreciationRecords}
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

            {/* Depreciation Schedule Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Depreciation Schedule for Fiscal Year {selectedFiscalYear}-
                  {parseInt(selectedFiscalYear) + 1}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Asset</TableCell>
                        <TableCell align="right">
                          Beginning Book Value
                        </TableCell>
                        <TableCell align="right">Annual Depreciation</TableCell>
                        <TableCell align="right">Ending Book Value</TableCell>
                        <TableCell>Method</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredDepreciationRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {record.asset_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {record.asset_tag}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            TZS{" "}
                            {(
                              record.current_book_value +
                              record.annual_depreciation
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            TZS {record.annual_depreciation.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            TZS {record.current_book_value.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                depreciationMethods.find(
                                  (m) => m.value === record.depreciation_method
                                )?.label
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          TZS{" "}
                          {filteredDepreciationRecords
                            .reduce(
                              (sum, record) =>
                                sum +
                                record.current_book_value +
                                record.annual_depreciation,
                              0
                            )
                            .toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          TZS{" "}
                          {filteredDepreciationRecords
                            .reduce(
                              (sum, record) => sum + record.annual_depreciation,
                              0
                            )
                            .toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          TZS{" "}
                          {filteredDepreciationRecords
                            .reduce(
                              (sum, record) => sum + record.current_book_value,
                              0
                            )
                            .toLocaleString()}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
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
                          Depreciation by Method
                        </Typography>
                        <List>
                          {depreciationMethods.map((method) => {
                            const count = filteredDepreciationRecords.filter(
                              (record) =>
                                record.depreciation_method === method.value
                            ).length;
                            const totalValue = filteredDepreciationRecords
                              .filter(
                                (record) =>
                                  record.depreciation_method === method.value
                              )
                              .reduce(
                                (sum, record) =>
                                  sum + record.annual_depreciation,
                                0
                              );

                            return count > 0 ? (
                              <ListItem key={method.value}>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: "primary.main" }}>
                                    <MethodIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <MUIListItemText
                                  primary={method.label}
                                  secondary={`${count} assets • TZS ${totalValue.toLocaleString()}/year`}
                                />
                              </ListItem>
                            ) : null;
                          })}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Depreciation by Category
                        </Typography>
                        <List>
                          {categoryDepreciationRates.map((category) => {
                            const assets = filteredDepreciationRecords.filter(
                              (record) => record.category === category.category
                            );
                            const totalValue = assets.reduce(
                              (sum, record) => sum + record.annual_depreciation,
                              0
                            );

                            return assets.length > 0 ? (
                              <ListItem key={category.category}>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: "success.main" }}>
                                    <CategoryIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <MUIListItemText
                                  primary={category.category}
                                  secondary={`${assets.length} assets • TZS ${totalValue.toLocaleString()}/year`}
                                />
                              </ListItem>
                            ) : null;
                          })}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Asset Lifecycle Overview
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="primary">
                                {
                                  filteredDepreciationRecords.filter(
                                    (r) => r.depreciation_percentage < 25
                                  ).length
                                }
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                New Assets (&lt;25% depreciated)
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="warning.main">
                                {
                                  filteredDepreciationRecords.filter(
                                    (r) =>
                                      r.depreciation_percentage >= 25 &&
                                      r.depreciation_percentage < 75
                                  ).length
                                }
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Mid-life Assets (25-75%)
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="error.main">
                                {
                                  filteredDepreciationRecords.filter(
                                    (r) => r.depreciation_percentage >= 75
                                  ).length
                                }
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                End-of-life Assets (&gt;75%)
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="success.main">
                                {
                                  filteredDepreciationRecords.filter(
                                    (r) => r.remaining_life < 1
                                  ).length
                                }
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Fully Depreciated
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

            {/* Methods Guide Tab */}
            {activeTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Depreciation Methods Guide
                </Typography>
                <Grid container spacing={3}>
                  {depreciationMethods.map((method) => (
                    <Grid item xs={12} md={6} key={method.value}>
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
                            <MethodIcon color="primary" />
                            <Typography variant="h6">{method.label}</Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {method.description}
                          </Typography>
                          <Box
                            sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}
                          >
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Formula:
                            </Typography>
                            <Typography variant="body2" fontFamily="monospace">
                              {method.formula}
                            </Typography>
                          </Box>

                          {/* Example calculation */}
                          {method.value === "straight_line" && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Example:
                              </Typography>
                              <Typography variant="body2">
                                Asset Cost: TZS 1,000,000
                                <br />
                                Salvage Value: TZS 100,000
                                <br />
                                Useful Life: 5 years
                                <br />
                                <strong>
                                  Annual Depreciation: TZS 180,000
                                </strong>
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Standard Depreciation Rates */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Standard Depreciation Rates by Category
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Asset Category</TableCell>
                          <TableCell align="center">
                            Standard Rate (%)
                          </TableCell>
                          <TableCell align="center">
                            Useful Life (Years)
                          </TableCell>
                          <TableCell>Recommended Method</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoryDepreciationRates.map((category) => (
                          <TableRow key={category.category}>
                            <TableCell>{category.category}</TableCell>
                            <TableCell align="center">
                              {category.rate}%
                            </TableCell>
                            <TableCell align="center">
                              {category.life}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="Straight Line"
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
          {hasPermission(PERMISSIONS.CALCULATE_DEPRECIATION) && (
            <MenuItem onClick={() => handleEdit(selectedRecord)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Settings</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => handleRecalculate(selectedRecord)}>
            <ListItemIcon>
              <RecalculateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Recalculate</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() =>
              navigate(
                `/finance/assets/register?assetId=${selectedRecord?.asset_id}`
              )
            }
          >
            <ListItemIcon>
              <AssetIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Asset</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              /* Print depreciation report */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Report</ListItemText>
          </MenuItem>
        </Menu>

        {/* Calculate Depreciation Dialog */}
        <Dialog
          open={calculationDialogOpen}
          onClose={() => setCalculationDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Calculate Asset Depreciation</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Select an asset and depreciation method to calculate
                    depreciation values.
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Asset</InputLabel>
                  <Select
                    value={formData.asset_id}
                    onChange={(e) =>
                      setFormData({ ...formData, asset_id: e.target.value })
                    }
                    label="Asset"
                    required
                  >
                    {assets.map((asset) => (
                      <MenuItem key={asset.id} value={asset.id}>
                        {asset.asset_tag} - {asset.asset_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Depreciation Method</InputLabel>
                  <Select
                    value={formData.depreciation_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        depreciation_method: e.target.value,
                      })
                    }
                    label="Depreciation Method"
                    required
                  >
                    {depreciationMethods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Useful Life (Years)"
                  type="number"
                  value={formData.useful_life_years}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      useful_life_years: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Salvage Value (TZS)"
                  type="number"
                  value={formData.salvage_value}
                  onChange={(e) =>
                    setFormData({ ...formData, salvage_value: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Depreciation Rate (%)"
                  type="number"
                  value={formData.depreciation_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depreciation_rate: e.target.value,
                    })
                  }
                  InputProps={{
                    readOnly: formData.depreciation_method === "straight_line",
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Depreciation Start Date"
                  value={formData.start_date}
                  onChange={(date) =>
                    setFormData({ ...formData, start_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Asset Category</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    label="Asset Category"
                  >
                    {categoryDepreciationRates.map((category) => (
                      <MenuItem
                        key={category.category}
                        value={category.category}
                      >
                        {category.category} ({category.rate}% - {category.life}{" "}
                        years)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  multiline
                  rows={3}
                  placeholder="Additional notes about depreciation calculation..."
                />
              </Grid>

              {/* Preview Calculation */}
              {formData.asset_id && formData.useful_life_years && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Depreciation Preview
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Annual Depreciation
                        </Typography>
                        <Typography variant="h6" color="primary">
                          TZS 230,000
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Monthly Depreciation
                        </Typography>
                        <Typography variant="h6">TZS 19,167</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCalculationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<CalculateIcon />}
            >
              Calculate Depreciation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Depreciation Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingRecord ? "Edit Depreciation Settings" : "New Depreciation"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Depreciation Method</InputLabel>
                  <Select
                    value={formData.depreciation_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        depreciation_method: e.target.value,
                      })
                    }
                    label="Depreciation Method"
                  >
                    {depreciationMethods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Useful Life (Years)"
                  type="number"
                  value={formData.useful_life_years}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      useful_life_years: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salvage Value (TZS)"
                  type="number"
                  value={formData.salvage_value}
                  onChange={(e) =>
                    setFormData({ ...formData, salvage_value: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Depreciation Rate (%)"
                  type="number"
                  value={formData.depreciation_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depreciation_rate: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingRecord ? "Update" : "Save"} Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Depreciation Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Depreciation Details - {selectedRecord?.asset_name}
          </DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Asset Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Asset Name
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedRecord.asset_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Asset Tag
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedRecord.asset_tag}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Category
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedRecord.category}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Purchase Date
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {format(
                                new Date(selectedRecord.purchase_date),
                                "dd/MM/yyyy"
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Depreciation Method
                            </Typography>
                            <Chip
                              label={
                                depreciationMethods.find(
                                  (m) =>
                                    m.value ===
                                    selectedRecord.depreciation_method
                                )?.label
                              }
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Asset Age
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedRecord.age_years.toFixed(1)} years
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
                            Purchase Cost
                          </Typography>
                          <Typography variant="h6" color="primary">
                            TZS {selectedRecord.purchase_cost?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Current Book Value
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            TZS{" "}
                            {selectedRecord.current_book_value?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Accumulated Depreciation
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            TZS{" "}
                            {selectedRecord.accumulated_depreciation?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Salvage Value
                          </Typography>
                          <Typography variant="body1">
                            TZS {selectedRecord.salvage_value?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Annual Depreciation
                          </Typography>
                          <Typography variant="h6">
                            TZS{" "}
                            {selectedRecord.annual_depreciation?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Monthly Depreciation
                          </Typography>
                          <Typography variant="body1">
                            TZS{" "}
                            {selectedRecord.monthly_depreciation?.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Depreciation Progress */}
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Depreciation Progress
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
                          {selectedRecord.age_years.toFixed(1)} /{" "}
                          {selectedRecord.useful_life_years} years
                        </Typography>
                        <Typography variant="body2">
                          {selectedRecord.depreciation_percentage.toFixed(1)}%
                          depreciated
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={selectedRecord.depreciation_percentage}
                        sx={{ height: 10, borderRadius: 5 }}
                        color={
                          selectedRecord.depreciation_percentage > 80
                            ? "error"
                            : "primary"
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Remaining useful life:{" "}
                      {selectedRecord.remaining_life.toFixed(1)} years
                    </Typography>
                  </CardContent>
                </Card>
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
              Print Report
            </Button>
            {hasPermission(PERMISSIONS.CALCULATE_DEPRECIATION) && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEdit(selectedRecord);
                }}
              >
                Edit Settings
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

export default AssetDepreciationPage;
