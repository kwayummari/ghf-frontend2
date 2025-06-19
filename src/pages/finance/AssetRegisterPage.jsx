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
  Avatar,
  LinearProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  TrendingDown as DepreciationIcon,
  Build as MaintenanceIcon,
  Inventory as InventoryIcon,
  AccountBalance as AssetIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
  Cancel as DisposedIcon,
  Schedule as ScheduleIcon,
  GetApp as ExportIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, differenceInYears, addYears } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";

const AssetRegisterPage = () => {
  // Hooks
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetSummary, setAssetSummary] = useState({
    totalAssets: 0,
    totalValue: 0,
    activeAssets: 0,
    maintenanceDue: 0,
    depreciation: 0,
  });

  // Sample asset data based on GH Foundation Asset Register
  const sampleAssets = [
    {
      id: 1,
      asset_code: "GHF-IT-001",
      asset_name: "Dell Laptop Inspiron 15",
      category: "IT Equipment",
      description: "Dell Inspiron 15 3000 Series Laptop",
      purchase_date: "2023-01-15",
      purchase_cost: 1500000,
      current_value: 1200000,
      depreciation_rate: 20,
      useful_life: 5,
      location: "IT Department",
      custodian: "John Doe",
      serial_number: "DL123456789",
      supplier: "Tech Solutions Ltd",
      warranty_expiry: "2026-01-15",
      condition: "Good",
      status: "Active",
      last_maintenance: "2024-01-10",
      next_maintenance: "2024-07-10",
      barcode: "BC001",
      created_at: "2023-01-15",
    },
    {
      id: 2,
      asset_code: "GHF-FUR-001",
      asset_name: "Executive Office Desk",
      category: "Furniture",
      description: "Wooden executive desk with drawers",
      purchase_date: "2023-02-01",
      purchase_cost: 800000,
      current_value: 720000,
      depreciation_rate: 10,
      useful_life: 10,
      location: "Executive Office",
      custodian: "Jane Manager",
      serial_number: "DESK001",
      supplier: "Furniture Plus",
      warranty_expiry: "2025-02-01",
      condition: "Excellent",
      status: "Active",
      last_maintenance: null,
      next_maintenance: "2024-08-01",
      barcode: "BC002",
      created_at: "2023-02-01",
    },
    {
      id: 3,
      asset_code: "GHF-VEH-001",
      asset_name: "Toyota Hilux Double Cab",
      category: "Vehicle",
      description: "2023 Toyota Hilux 4WD Double Cab",
      purchase_date: "2023-03-15",
      purchase_cost: 45000000,
      current_value: 40500000,
      depreciation_rate: 15,
      useful_life: 8,
      location: "Vehicle Pool",
      custodian: "Driver Mike",
      serial_number: "TH2023001",
      supplier: "Toyota Tanzania",
      warranty_expiry: "2026-03-15",
      condition: "Good",
      status: "Active",
      last_maintenance: "2024-01-20",
      next_maintenance: "2024-07-20",
      barcode: "BC003",
      created_at: "2023-03-15",
    },
    {
      id: 4,
      asset_code: "GHF-IT-002",
      asset_name: "HP Printer LaserJet",
      category: "IT Equipment",
      description: "HP LaserJet Pro M404dn Printer",
      purchase_date: "2022-11-10",
      purchase_cost: 750000,
      current_value: 450000,
      depreciation_rate: 25,
      useful_life: 4,
      location: "Admin Office",
      custodian: "Admin Assistant",
      serial_number: "HP202211001",
      supplier: "Office Tech",
      warranty_expiry: "2024-11-10",
      condition: "Fair",
      status: "Maintenance Required",
      last_maintenance: "2023-11-10",
      next_maintenance: "2024-05-10",
      barcode: "BC004",
      created_at: "2022-11-10",
    },
  ];

  // Effects
  useEffect(() => {
    fetchAssets();
    calculateSummary();
  }, []);

  useEffect(() => {
    calculateSummary();
  }, [assets]);

  // Data fetching and processing functions
  const fetchAssets = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAssets(sampleAssets);
    } catch (error) {
      showError("Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const summary = assets.reduce(
      (acc, asset) => {
        acc.totalAssets += 1;
        acc.totalValue += asset.current_value;
        if (asset.status === "Active") acc.activeAssets += 1;
        if (
          asset.status === "Maintenance Required" ||
          (asset.next_maintenance &&
            new Date(asset.next_maintenance) <= new Date())
        ) {
          acc.maintenanceDue += 1;
        }

        // Calculate depreciation
        const years = differenceInYears(
          new Date(),
          new Date(asset.purchase_date)
        );
        const depreciation = asset.purchase_cost - asset.current_value;
        acc.depreciation += depreciation;

        return acc;
      },
      {
        totalAssets: 0,
        totalValue: 0,
        activeAssets: 0,
        maintenanceDue: 0,
        depreciation: 0,
      }
    );

    setAssetSummary(summary);
  };

  // Navigation handlers
  const handleCreateAsset = () => {
    navigate("/finance/assets/create");
  };

  const handleEditAsset = (assetId) => {
    navigate(`/finance/assets/${assetId}/edit`);
  };

  const handleViewAsset = (assetId) => {
    navigate(`/finance/assets/${assetId}`);
  };

  const handleScheduleMaintenance = (assetId) => {
    navigate(`/finance/assets/${assetId}/maintenance`);
  };

  // Action handlers
  const handleDeleteAsset = async (assetId) => {
    openDialog({
      title: "Delete Asset",
      message:
        "Are you sure you want to delete this asset? This action cannot be undone.",
      onConfirm: async () => {
        try {
          // API call to delete asset
          showSuccess("Asset deleted successfully");
          fetchAssets();
        } catch (error) {
          showError("Failed to delete asset");
        }
      },
    });
  };

  const handleDispose = async (assetId) => {
    openDialog({
      title: "Dispose Asset",
      message:
        "Are you sure you want to dispose this asset? This will mark it as disposed.",
      onConfirm: async () => {
        try {
          // API call to dispose asset
          showSuccess("Asset disposed successfully");
          fetchAssets();
        } catch (error) {
          showError("Failed to dispose asset");
        }
      },
    });
  };

  // Menu handlers
  const handleMenuClick = (event, asset) => {
    setAnchorEl(event.currentTarget);
    setSelectedAsset(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAsset(null);
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Maintenance Required":
        return "warning";
      case "Under Maintenance":
        return "info";
      case "Disposed":
        return "error";
      case "Lost/Stolen":
        return "error";
      default:
        return "default";
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "Excellent":
        return "success";
      case "Good":
        return "info";
      case "Fair":
        return "warning";
      case "Poor":
        return "error";
      default:
        return "default";
    }
  };

  const calculateDepreciationPercentage = (asset) => {
    const years = differenceInYears(new Date(), new Date(asset.purchase_date));
    const totalDepreciation =
      (asset.depreciation_rate / 100) * years * asset.purchase_cost;
    return Math.min((totalDepreciation / asset.purchase_cost) * 100, 100);
  };

  // Data processing
  const filteredAssets = assets
    .filter(
      (asset) =>
        asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.custodian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (asset) => categoryFilter === "" || asset.category === categoryFilter
    )
    .filter((asset) => statusFilter === "" || asset.status === statusFilter)
    .filter(
      (asset) => locationFilter === "" || asset.location === locationFilter
    );

  const assetCategories = [...new Set(assets.map((a) => a.category))];
  const assetLocations = [...new Set(assets.map((a) => a.location))];

  // Configuration data
  const summaryCards = [
    {
      title: "Total Assets",
      value: assetSummary.totalAssets,
      icon: <InventoryIcon />,
      color: "primary",
    },
    {
      title: "Total Value",
      value: formatCurrency(assetSummary.totalValue),
      icon: <AssetIcon />,
      color: "success",
    },
    {
      title: "Active Assets",
      value: assetSummary.activeAssets,
      icon: <ActiveIcon />,
      color: "info",
    },
    {
      title: "Maintenance Due",
      value: assetSummary.maintenanceDue,
      icon: <WarningIcon />,
      color: "warning",
    },
  ];

  const columns = [
    {
      field: "asset_code",
      headerName: "Asset Code",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "asset_name",
      headerName: "Asset Name",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.asset_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.category}
          </Typography>
        </Box>
      ),
    },
    {
      field: "purchase_cost",
      headerName: "Purchase Cost",
      width: 130,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "current_value",
      headerName: "Current Value",
      width: 130,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(params.value)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={100 - calculateDepreciationPercentage(params.row)}
            sx={{ mt: 0.5, height: 4 }}
            color="primary"
          />
        </Box>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 150,
    },
    {
      field: "custodian",
      headerName: "Custodian",
      width: 150,
    },
    {
      field: "condition",
      headerName: "Condition",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getConditionColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const maintenanceDue =
          params.row.next_maintenance &&
          new Date(params.row.next_maintenance) <= new Date();

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Chip
              label={params.value}
              color={getStatusColor(params.value)}
              size="small"
            />
            {maintenanceDue && (
              <Tooltip title="Maintenance Due">
                <WarningIcon color="warning" fontSize="small" />
              </Tooltip>
            )}
          </Box>
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
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
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
              Asset Register
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive asset tracking and management system
            </Typography>
          </Box>
          {hasPermission(PERMISSIONS.MANAGE_ASSET_REGISTER) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateAsset}
            >
              Add Asset
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
            <Tab label="All Assets" />
            <Tab label="Maintenance Due" />
            <Tab label="Depreciation Report" />
            <Tab label="Asset Summary" />
          </Tabs>
        </Card>

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Filters */}
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
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {assetCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
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
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Maintenance Required">
                      Maintenance Required
                    </MenuItem>
                    <MenuItem value="Under Maintenance">
                      Under Maintenance
                    </MenuItem>
                    <MenuItem value="Disposed">Disposed</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    {assetLocations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
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
                      startIcon={<PrintIcon />}
                      size="small"
                    >
                      Print
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Tab Content */}
            {activeTab === 0 && (
              // All Assets Tab
              <>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <DataGrid
                    rows={filteredAssets}
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
              // Maintenance Due Tab
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset Code</TableCell>
                      <TableCell>Asset Name</TableCell>
                      <TableCell>Last Maintenance</TableCell>
                      <TableCell>Next Maintenance</TableCell>
                      <TableCell>Days Overdue</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assets
                      .filter(
                        (asset) =>
                          asset.next_maintenance &&
                          new Date(asset.next_maintenance) <= new Date()
                      )
                      .map((asset) => {
                        const daysOverdue = Math.floor(
                          (new Date() - new Date(asset.next_maintenance)) /
                            (1000 * 60 * 60 * 24)
                        );
                        return (
                          <TableRow key={asset.id}>
                            <TableCell>{asset.asset_code}</TableCell>
                            <TableCell>{asset.asset_name}</TableCell>
                            <TableCell>
                              {asset.last_maintenance
                                ? format(
                                    new Date(asset.last_maintenance),
                                    "dd/MM/yyyy"
                                  )
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(asset.next_maintenance),
                                "dd/MM/yyyy"
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${daysOverdue} days`}
                                color={daysOverdue > 30 ? "error" : "warning"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                startIcon={<ScheduleIcon />}
                                onClick={() =>
                                  handleScheduleMaintenance(asset.id)
                                }
                              >
                                Schedule
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 2 && (
              // Depreciation Report Tab
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset Code</TableCell>
                      <TableCell>Asset Name</TableCell>
                      <TableCell>Purchase Cost</TableCell>
                      <TableCell>Current Value</TableCell>
                      <TableCell>Depreciation</TableCell>
                      <TableCell>Age (Years)</TableCell>
                      <TableCell>Remaining Life</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assets.map((asset) => {
                      const age = differenceInYears(
                        new Date(),
                        new Date(asset.purchase_date)
                      );
                      const depreciation =
                        asset.purchase_cost - asset.current_value;
                      const remainingLife = Math.max(
                        0,
                        asset.useful_life - age
                      );

                      return (
                        <TableRow key={asset.id}>
                          <TableCell>{asset.asset_code}</TableCell>
                          <TableCell>{asset.asset_name}</TableCell>
                          <TableCell>
                            {formatCurrency(asset.purchase_cost)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(asset.current_value)}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {formatCurrency(depreciation)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                (
                                {(
                                  (depreciation / asset.purchase_cost) *
                                  100
                                ).toFixed(1)}
                                %)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{age}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${remainingLife} years`}
                              color={
                                remainingLife <= 1
                                  ? "error"
                                  : remainingLife <= 2
                                    ? "warning"
                                    : "success"
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 3 && (
              // Asset Summary Tab
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Assets by Category
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Total Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assetCategories.map((category) => {
                          const categoryAssets = assets.filter(
                            (a) => a.category === category
                          );
                          const totalValue = categoryAssets.reduce(
                            (sum, a) => sum + a.current_value,
                            0
                          );
                          return (
                            <TableRow key={category}>
                              <TableCell>{category}</TableCell>
                              <TableCell align="right">
                                {categoryAssets.length}
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(totalValue)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Assets by Location
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Location</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Total Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assetLocations.map((location) => {
                          const locationAssets = assets.filter(
                            (a) => a.location === location
                          );
                          const totalValue = locationAssets.reduce(
                            (sum, a) => sum + a.current_value,
                            0
                          );
                          return (
                            <TableRow key={location}>
                              <TableCell>{location}</TableCell>
                              <TableCell align="right">
                                {locationAssets.length}
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(totalValue)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
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
              handleViewAsset(selectedAsset?.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>

          {hasPermission(PERMISSIONS.MANAGE_ASSET_REGISTER) && (
            <MenuItem
              onClick={() => {
                handleEditAsset(selectedAsset?.id);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Asset</ListItemText>
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              handleScheduleMaintenance(selectedAsset?.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <MaintenanceIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Schedule Maintenance</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              // Generate QR Code
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <QrCodeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Generate QR Code</ListItemText>
          </MenuItem>

          {hasPermission(PERMISSIONS.ASSET_DISPOSAL) && (
            <MenuItem
              onClick={() => {
                handleDispose(selectedAsset?.id);
                handleMenuClose();
              }}
              sx={{ color: "warning.main" }}
            >
              <ListItemIcon>
                <DisposedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Dispose Asset</ListItemText>
            </MenuItem>
          )}

          {hasPermission(PERMISSIONS.MANAGE_ASSET_REGISTER) && (
            <MenuItem
              onClick={() => {
                handleDeleteAsset(selectedAsset?.id);
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete Asset</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>
    </LocalizationProvider>
  );
};

export default AssetRegisterPage;
