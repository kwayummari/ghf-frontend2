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
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
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
  Build as MaintenanceIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  Cancel as CancelledIcon,
  Person as PersonIcon,
  MonetizationOn as MoneyIcon,
  DateRange as DateIcon,
  Category as CategoryIcon,
  Inventory as AssetIcon,
  Assignment as TaskIcon,
  Notifications as NotificationIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  AttachFile as AttachIcon,
  Photo as PhotoIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, differenceInDays, addDays, addMonths } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
// import { assetAPI } from '../../../services/api/asset.api';

const AssetMaintenancePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get("assetId"); // For direct asset maintenance
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [assetFilter, setAssetFilter] = useState(assetId || "");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    asset_id: assetId || "",
    maintenance_type: "preventive",
    title: "",
    description: "",
    scheduled_date: null,
    estimated_duration: "",
    estimated_cost: "",
    assigned_to: "",
    vendor_id: "",
    priority: "medium",
    maintenance_category: "",
    status: "scheduled",
    notes: "",
  });

  // Mock data for development
  const mockMaintenanceRecords = [
    {
      id: 1,
      maintenance_number: "MAINT-2024-001",
      asset_id: 1,
      asset_name: "Dell Latitude 5520",
      asset_tag: "GHF-LT-001",
      maintenance_type: "preventive",
      title: "Quarterly System Maintenance",
      description: "Regular system cleanup and hardware inspection",
      scheduled_date: "2024-07-15",
      completed_date: "2024-07-15",
      estimated_duration: "2 hours",
      actual_duration: "1.5 hours",
      estimated_cost: 50000,
      actual_cost: 45000,
      assigned_to: "Tech Team",
      vendor: "Internal",
      priority: "medium",
      status: "completed",
      completion_percentage: 100,
      created_by: "John Doe",
      created_at: "2024-07-01",
      last_updated: "2024-07-15",
    },
    {
      id: 2,
      maintenance_number: "MAINT-2024-002",
      asset_id: 2,
      asset_name: "Toyota Hilux",
      asset_tag: "GHF-VH-001",
      maintenance_type: "corrective",
      title: "Brake System Repair",
      description: "Replace brake pads and check brake fluid",
      scheduled_date: "2024-07-20",
      completed_date: null,
      estimated_duration: "4 hours",
      actual_duration: null,
      estimated_cost: 350000,
      actual_cost: null,
      assigned_to: "Auto Garage Ltd",
      vendor: "External",
      priority: "high",
      status: "in_progress",
      completion_percentage: 60,
      created_by: "Jane Smith",
      created_at: "2024-07-18",
      last_updated: "2024-07-20",
    },
    {
      id: 3,
      maintenance_number: "MAINT-2024-003",
      asset_id: 1,
      asset_name: "Dell Latitude 5520",
      asset_tag: "GHF-LT-001",
      maintenance_type: "preventive",
      title: "Monthly Antivirus Update",
      description: "Update antivirus definitions and run full scan",
      scheduled_date: "2024-07-05",
      completed_date: null,
      estimated_duration: "30 minutes",
      actual_duration: null,
      estimated_cost: 0,
      actual_cost: null,
      assigned_to: "IT Support",
      vendor: "Internal",
      priority: "low",
      status: "overdue",
      completion_percentage: 0,
      created_by: "System",
      created_at: "2024-06-05",
      last_updated: "2024-06-05",
    },
  ];

  const mockAssets = [
    {
      id: 1,
      asset_name: "Dell Latitude 5520",
      asset_tag: "GHF-LT-001",
      location: "Head Office",
    },
    {
      id: 2,
      asset_name: "Toyota Hilux",
      asset_tag: "GHF-VH-001",
      location: "Mombasa Office",
    },
    {
      id: 3,
      asset_name: "Executive Desk",
      asset_tag: "GHF-FN-001",
      location: "Head Office",
    },
  ];

  // Maintenance types
  const maintenanceTypes = [
    { value: "preventive", label: "Preventive", color: "primary" },
    { value: "corrective", label: "Corrective", color: "warning" },
    { value: "emergency", label: "Emergency", color: "error" },
    { value: "upgrade", label: "Upgrade", color: "info" },
  ];

  // Maintenance statuses
  const maintenanceStatuses = [
    { value: "scheduled", label: "Scheduled", color: "info" },
    { value: "in_progress", label: "In Progress", color: "warning" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "default" },
    { value: "overdue", label: "Overdue", color: "error" },
    { value: "postponed", label: "Postponed", color: "default" },
  ];

  // Priority levels
  const priorities = [
    { value: "low", label: "Low", color: "default" },
    { value: "medium", label: "Medium", color: "primary" },
    { value: "high", label: "High", color: "warning" },
    { value: "critical", label: "Critical", color: "error" },
  ];

  // Maintenance categories
  const maintenanceCategories = [
    "Hardware Maintenance",
    "Software Maintenance",
    "Mechanical Repair",
    "Electrical Work",
    "Cleaning & Inspection",
    "Safety Check",
    "Performance Optimization",
    "Replacement",
    "Upgrade",
    "Calibration",
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Maintenance",
      value: mockMaintenanceRecords.length.toString(),
      icon: <MaintenanceIcon />,
      color: "primary",
    },
    {
      title: "Overdue Tasks",
      value: mockMaintenanceRecords
        .filter((m) => m.status === "overdue")
        .length.toString(),
      icon: <OverdueIcon />,
      color: "error",
    },
    {
      title: "In Progress",
      value: mockMaintenanceRecords
        .filter((m) => m.status === "in_progress")
        .length.toString(),
      icon: <PendingIcon />,
      color: "warning",
    },
    {
      title: "This Month Cost",
      value: `TZS ${mockMaintenanceRecords.reduce((sum, m) => sum + (m.actual_cost || m.estimated_cost), 0).toLocaleString()}`,
      icon: <MoneyIcon />,
      color: "success",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "maintenance_number",
      headerName: "Maintenance #",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MaintenanceIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
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
            {params.row.asset_tag}
          </Typography>
        </Box>
      ),
    },
    {
      field: "title",
      headerName: "Maintenance Title",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Chip
            label={
              maintenanceTypes.find(
                (t) => t.value === params.row.maintenance_type
              )?.label
            }
            size="small"
            color={
              maintenanceTypes.find(
                (t) => t.value === params.row.maintenance_type
              )?.color
            }
            variant="outlined"
          />
        </Box>
      ),
    },
    {
      field: "scheduled_date",
      headerName: "Scheduled Date",
      width: 130,
      renderCell: (params) => {
        const daysUntilScheduled = differenceInDays(
          new Date(params.value),
          new Date()
        );
        const isOverdue =
          daysUntilScheduled < 0 && params.row.status !== "completed";
        return (
          <Box>
            <Typography
              variant="body2"
              color={isOverdue ? "error.main" : "text.primary"}
            >
              {format(new Date(params.value), "dd/MM/yyyy")}
            </Typography>
            {isOverdue && (
              <Typography variant="caption" color="error">
                {Math.abs(daysUntilScheduled)} days overdue
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "assigned_to",
      headerName: "Assigned To",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => {
        const priority = priorities.find((p) => p.value === params.value);
        return (
          <Chip
            label={priority?.label}
            size="small"
            color={priority?.color}
            variant="filled"
          />
        );
      },
    },
    {
      field: "estimated_cost",
      headerName: "Cost",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {(params.row.actual_cost || params.value)?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = maintenanceStatuses.find(
          (s) => s.value === params.value
        );
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
      field: "completion_percentage",
      headerName: "Progress",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 6,
              bgcolor: "grey.300",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${params.value}%`,
                height: "100%",
                bgcolor: params.value === 100 ? "success.main" : "primary.main",
              }}
            />
          </Box>
          <Typography variant="caption">{params.value}%</Typography>
        </Box>
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
            setSelectedMaintenance(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load maintenance records data
  useEffect(() => {
    fetchMaintenanceRecords();
    fetchAssets();
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await assetAPI.getAssetMaintenance();
      // setMaintenanceRecords(response.data || []);
      setMaintenanceRecords(mockMaintenanceRecords);
    } catch (error) {
      showError("Failed to fetch maintenance records");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      // Replace with actual API call
      // const response = await assetAPI.getAllAssets();
      // setAssets(response.data || []);
      setAssets(mockAssets);
    } catch (error) {
      showError("Failed to fetch assets");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingMaintenance) {
        // await assetAPI.updateAssetMaintenance(editingMaintenance.id, formData);
        showSuccess("Maintenance record updated successfully");
      } else {
        // await assetAPI.createAssetMaintenance(formData);
        showSuccess("Maintenance scheduled successfully");
      }
      setDialogOpen(false);
      setScheduleDialogOpen(false);
      resetForm();
      fetchMaintenanceRecords();
    } catch (error) {
      showError("Failed to save maintenance record");
    }
  };

  const resetForm = () => {
    setFormData({
      asset_id: assetId || "",
      maintenance_type: "preventive",
      title: "",
      description: "",
      scheduled_date: null,
      estimated_duration: "",
      estimated_cost: "",
      assigned_to: "",
      vendor_id: "",
      priority: "medium",
      maintenance_category: "",
      status: "scheduled",
      notes: "",
    });
    setEditingMaintenance(null);
  };

  // Handle edit
  const handleEdit = (maintenance) => {
    setFormData({ ...maintenance });
    setEditingMaintenance(maintenance);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete
  const handleDelete = (maintenance) => {
    openDialog({
      title: "Delete Maintenance Record",
      message: `Are you sure you want to delete maintenance "${maintenance.title}"?`,
      onConfirm: async () => {
        try {
          // await assetAPI.deleteAssetMaintenance(maintenance.id);
          showSuccess("Maintenance record deleted successfully");
          fetchMaintenanceRecords();
        } catch (error) {
          showError("Failed to delete maintenance record");
        }
      },
    });
    setAnchorEl(null);
  };

  // Handle status updates
  const handleStatusUpdate = async (maintenance, newStatus) => {
    try {
      // await assetAPI.updateMaintenanceStatus(maintenance.id, { status: newStatus });
      showSuccess(`Maintenance marked as ${newStatus}`);
      fetchMaintenanceRecords();
    } catch (error) {
      showError("Failed to update maintenance status");
    }
    setAnchorEl(null);
  };

  // Filter maintenance records
  const filteredMaintenanceRecords = maintenanceRecords.filter(
    (maintenance) => {
      const matchesSearch =
        maintenance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maintenance.asset_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        maintenance.maintenance_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        !statusFilter || maintenance.status === statusFilter;
      const matchesType =
        !typeFilter || maintenance.maintenance_type === typeFilter;
      const matchesAsset =
        !assetFilter || maintenance.asset_id.toString() === assetFilter;

      return matchesSearch && matchesStatus && matchesType && matchesAsset;
    }
  );

  // Quick schedule maintenance for specific asset
  const quickScheduleMaintenance = (selectedAssetId) => {
    setFormData((prev) => ({ ...prev, asset_id: selectedAssetId }));
    setScheduleDialogOpen(true);
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
            Asset Maintenance Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule, track, and manage asset maintenance activities
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
                    placeholder="Search maintenance..."
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
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {maintenanceStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {maintenanceTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Asset</InputLabel>
                    <Select
                      value={assetFilter}
                      onChange={(e) => setAssetFilter(e.target.value)}
                      label="Asset"
                    >
                      <MenuItem value="">All Assets</MenuItem>
                      {assets.map((asset) => (
                        <MenuItem key={asset.id} value={asset.id.toString()}>
                          {asset.asset_tag} - {asset.asset_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {hasPermission(PERMISSIONS.SCHEDULE_MAINTENANCE) && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setScheduleDialogOpen(true)}
                      >
                        Schedule Maintenance
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      onClick={() => setActiveTab(1)}
                    >
                      Calendar
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

            {/* Main Content Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
            >
              <Tab label="Maintenance List" />
              <Tab label="Calendar View" />
              <Tab label="Analytics" />
            </Tabs>

            {/* Maintenance List Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredMaintenanceRecords}
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

            {/* Calendar View Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Calendar view for maintenance scheduling will be implemented
                    here using a calendar component.
                  </Typography>
                </Alert>
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
                          Maintenance by Type
                        </Typography>
                        <Alert severity="info">
                          <Typography variant="body2">
                            Maintenance type distribution chart will be
                            displayed here.
                          </Typography>
                        </Alert>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Monthly Costs
                        </Typography>
                        <Alert severity="info">
                          <Typography variant="body2">
                            Monthly maintenance cost trends will be displayed
                            here.
                          </Typography>
                        </Alert>
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
          {hasPermission(PERMISSIONS.SCHEDULE_MAINTENANCE) &&
            selectedMaintenance?.status === "scheduled" && (
              <MenuItem onClick={() => handleEdit(selectedMaintenance)}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Maintenance</ListItemText>
              </MenuItem>
            )}
          {selectedMaintenance?.status === "scheduled" && (
            <MenuItem
              onClick={() =>
                handleStatusUpdate(selectedMaintenance, "in_progress")
              }
            >
              <ListItemIcon>
                <PendingIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Start Maintenance</ListItemText>
            </MenuItem>
          )}
          {selectedMaintenance?.status === "in_progress" && (
            <MenuItem
              onClick={() =>
                handleStatusUpdate(selectedMaintenance, "completed")
              }
            >
              <ListItemIcon>
                <CompletedIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Mark Complete</ListItemText>
            </MenuItem>
          )}
          <MenuItem
            onClick={() =>
              navigate(
                `/finance/assets/register?assetId=${selectedMaintenance?.asset_id}`
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
              /* Print maintenance report */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Report</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.SCHEDULE_MAINTENANCE) &&
            selectedMaintenance?.status === "scheduled" && (
              <MenuItem
                onClick={() => handleDelete(selectedMaintenance)}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
        </Menu>

        {/* Schedule Maintenance Dialog */}
        <Dialog
          open={scheduleDialogOpen}
          onClose={() => setScheduleDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Schedule Asset Maintenance</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Asset Selection */}
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
                  <InputLabel>Maintenance Type</InputLabel>
                  <Select
                    value={formData.maintenance_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenance_type: e.target.value,
                      })
                    }
                    label="Maintenance Type"
                    required
                  >
                    {maintenanceTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Maintenance Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="e.g., Quarterly System Maintenance"
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
                  placeholder="Describe the maintenance activities to be performed..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Scheduled Date"
                  value={formData.scheduled_date}
                  onChange={(date) =>
                    setFormData({ ...formData, scheduled_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Duration"
                  value={formData.estimated_duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_duration: e.target.value,
                    })
                  }
                  placeholder="e.g., 2 hours, 1 day"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Cost (TZS)"
                  type="number"
                  value={formData.estimated_cost}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_cost: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    label="Priority"
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Assigned To"
                  value={formData.assigned_to}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_to: e.target.value })
                  }
                  placeholder="Team or person responsible"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.maintenance_category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenance_category: e.target.value,
                      })
                    }
                    label="Category"
                  >
                    {maintenanceCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
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
                  rows={2}
                  placeholder="Additional notes or special requirements..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Schedule Maintenance
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Maintenance Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingMaintenance ? "Edit Maintenance" : "New Maintenance"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    label="Status"
                  >
                    {maintenanceStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Other form fields similar to schedule dialog */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingMaintenance ? "Update" : "Create"} Maintenance
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Maintenance Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Maintenance Details - {selectedMaintenance?.maintenance_number}
          </DialogTitle>
          <DialogContent>
            {selectedMaintenance && (
              <Box>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                >
                  <Tab label="Overview" />
                  <Tab label="Timeline" />
                  <Tab label="Documents" />
                  <Tab label="Cost Details" />
                </Tabs>

                {/* Overview Tab */}
                {activeTab === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Maintenance Information
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Asset
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {selectedMaintenance.asset_name} (
                                  {selectedMaintenance.asset_tag})
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Type
                                </Typography>
                                <Chip
                                  label={
                                    maintenanceTypes.find(
                                      (t) =>
                                        t.value ===
                                        selectedMaintenance.maintenance_type
                                    )?.label
                                  }
                                  size="small"
                                  color={
                                    maintenanceTypes.find(
                                      (t) =>
                                        t.value ===
                                        selectedMaintenance.maintenance_type
                                    )?.color
                                  }
                                  sx={{ mb: 2 }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Scheduled Date
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {format(
                                    new Date(
                                      selectedMaintenance.scheduled_date
                                    ),
                                    "dd/MM/yyyy"
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Status
                                </Typography>
                                <Chip
                                  label={
                                    maintenanceStatuses.find(
                                      (s) =>
                                        s.value === selectedMaintenance.status
                                    )?.label
                                  }
                                  size="small"
                                  color={
                                    maintenanceStatuses.find(
                                      (s) =>
                                        s.value === selectedMaintenance.status
                                    )?.color
                                  }
                                  sx={{ mb: 2 }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Description
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {selectedMaintenance.description}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Assigned To
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 2,
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {selectedMaintenance.assigned_to?.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body1">
                                    {selectedMaintenance.assigned_to}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Priority
                                </Typography>
                                <Chip
                                  label={
                                    priorities.find(
                                      (p) =>
                                        p.value === selectedMaintenance.priority
                                    )?.label
                                  }
                                  size="small"
                                  color={
                                    priorities.find(
                                      (p) =>
                                        p.value === selectedMaintenance.priority
                                    )?.color
                                  }
                                  sx={{ mb: 2 }}
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Progress & Timing
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Completion Progress
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 8,
                                    bgcolor: "grey.300",
                                    borderRadius: 4,
                                    overflow: "hidden",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: `${selectedMaintenance.completion_percentage}%`,
                                      height: "100%",
                                      bgcolor:
                                        selectedMaintenance.completion_percentage ===
                                        100
                                          ? "success.main"
                                          : "primary.main",
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2">
                                  {selectedMaintenance.completion_percentage}%
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Estimated Duration
                              </Typography>
                              <Typography variant="body1">
                                {selectedMaintenance.estimated_duration}
                              </Typography>
                            </Box>
                            {selectedMaintenance.actual_duration && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Actual Duration
                                </Typography>
                                <Typography variant="body1">
                                  {selectedMaintenance.actual_duration}
                                </Typography>
                              </Box>
                            )}
                            {selectedMaintenance.completed_date && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Completed Date
                                </Typography>
                                <Typography variant="body1">
                                  {format(
                                    new Date(
                                      selectedMaintenance.completed_date
                                    ),
                                    "dd/MM/yyyy"
                                  )}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>

                        <Card variant="outlined" sx={{ mt: 2 }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Cost Summary
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Estimated Cost
                              </Typography>
                              <Typography variant="h6" color="primary">
                                TZS{" "}
                                {selectedMaintenance.estimated_cost?.toLocaleString()}
                              </Typography>
                            </Box>
                            {selectedMaintenance.actual_cost && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Actual Cost
                                </Typography>
                                <Typography variant="h6" color="success.main">
                                  TZS{" "}
                                  {selectedMaintenance.actual_cost?.toLocaleString()}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Timeline Tab */}
                {activeTab === 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Maintenance Timeline
                    </Typography>
                    <Timeline>
                      <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                          {format(
                            new Date(selectedMaintenance.created_at),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot color="primary">
                            <ScheduleIcon />
                          </TimelineDot>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="h6" component="span">
                            Maintenance Scheduled
                          </Typography>
                          <Typography>
                            Created by {selectedMaintenance.created_by}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>

                      {selectedMaintenance.status === "in_progress" && (
                        <TimelineItem>
                          <TimelineOppositeContent color="text.secondary">
                            {format(new Date(), "dd/MM/yyyy HH:mm")}
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="warning">
                              <PendingIcon />
                            </TimelineDot>
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="h6" component="span">
                              Maintenance Started
                            </Typography>
                            <Typography>Work in progress</Typography>
                          </TimelineContent>
                        </TimelineItem>
                      )}

                      {selectedMaintenance.completed_date && (
                        <TimelineItem>
                          <TimelineOppositeContent color="text.secondary">
                            {format(
                              new Date(selectedMaintenance.completed_date),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="success">
                              <CompletedIcon />
                            </TimelineDot>
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="h6" component="span">
                              Maintenance Completed
                            </Typography>
                            <Typography>
                              All tasks finished successfully
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                      )}
                    </Timeline>
                  </Box>
                )}

                {/* Documents Tab */}
                {activeTab === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Maintenance Documents
                    </Typography>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Maintenance reports, photos, and documentation will be
                        displayed here.
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Cost Details Tab */}
                {activeTab === 3 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Cost Breakdown
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Estimated</TableCell>
                            <TableCell align="right">Actual</TableCell>
                            <TableCell align="right">Variance</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Labor</TableCell>
                            <TableCell>Technician time</TableCell>
                            <TableCell align="right">TZS 30,000</TableCell>
                            <TableCell align="right">TZS 25,000</TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "success.main" }}
                            >
                              -TZS 5,000
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Parts</TableCell>
                            <TableCell>Replacement components</TableCell>
                            <TableCell align="right">TZS 20,000</TableCell>
                            <TableCell align="right">TZS 20,000</TableCell>
                            <TableCell align="right">TZS 0</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                              Total
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: "bold" }}
                            >
                              TZS{" "}
                              {(
                                selectedMaintenance.actual_cost ||
                                selectedMaintenance.estimated_cost
                              )?.toLocaleString()}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: "bold", color: "success.main" }}
                            >
                              -TZS 5,000
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
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
            {hasPermission(PERMISSIONS.SCHEDULE_MAINTENANCE) &&
              selectedMaintenance?.status !== "completed" && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(selectedMaintenance);
                  }}
                >
                  Edit Maintenance
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
              <Button onClick={handleConfirm} color="error" variant="contained">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AssetMaintenancePage;
