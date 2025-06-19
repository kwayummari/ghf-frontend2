import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Badge,
  Tooltip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  QrCode as QrCodeIcon,
  Inventory as AssetIcon,
  Build as MaintenanceIcon,
  TrendingDown as DepreciationIcon,
  MonetizationOn as ValueIcon,
  DateRange as DateIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Business as LocationIcon,
  Assignment as AssignIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  PhotoCamera as PhotoIcon,
  AttachFile as DocumentIcon,
  Schedule as ScheduleIcon,
  Receipt as InvoiceIcon,
  Security as InsuranceIcon,
  Build as RepairIcon,
  Upgrade as UpgradeIcon,
  SwapHoriz as TransferIcon,
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreVertIcon,
  Timeline as TimelineIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { format, differenceInYears, differenceInDays } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../../constants";
import useNotification from "../../../hooks/common/useNotification";
import useConfirmDialog from "../../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../../components/common/Loading";
// import { assetAPI } from '../../../services/api/asset.api';

const AssetDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [asset, setAsset] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [depreciationData, setDepreciationData] = useState(null);
  const [assetDocuments, setAssetDocuments] = useState([]);
  const [assetHistory, setAssetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  // Mock data for development
  const mockAsset = {
    id: 1,
    asset_tag: "GHF-LT-001",
    asset_name: "Dell Latitude 5520",
    description: "Business laptop with Intel i7 processor, 16GB RAM, 512GB SSD",
    category: "IT Equipment",
    sub_category: "Laptops",
    brand: "Dell",
    model: "Latitude 5520",
    serial_number: "DL5520001",
    purchase_date: "2023-01-15",
    purchase_cost: 1200000,
    current_book_value: 960000,
    salvage_value: 50000,
    supplier: "Tech Solutions Ltd",
    warranty_start: "2023-01-15",
    warranty_expiry: "2025-01-15",
    warranty_status: "active",
    location: "Head Office",
    department: "IT Department",
    assigned_to: "John Doe",
    assigned_date: "2023-01-20",
    condition: "excellent",
    status: "active",
    depreciation_method: "straight_line",
    useful_life_years: 5,
    annual_depreciation: 230000,
    accumulated_depreciation: 240000,
    age_years: 1.4,
    remaining_life: 3.6,
    next_maintenance: "2024-07-15",
    last_maintenance: "2024-04-15",
    insurance_policy: "INS-2023-001",
    insurance_expiry: "2024-12-31",
    created_by: "System Admin",
    created_at: "2023-01-15",
    updated_at: "2024-06-15",
    specifications: {
      processor: "Intel Core i7-1165G7",
      memory: "16GB DDR4",
      storage: "512GB NVMe SSD",
      display: '15.6" FHD',
      graphics: "Intel Iris Xe",
      os: "Windows 11 Pro",
    },
    images: [
      {
        id: 1,
        url: "/assets/images/laptop1.jpg",
        title: "Front View",
        type: "primary",
      },
      {
        id: 2,
        url: "/assets/images/laptop2.jpg",
        title: "Side View",
        type: "secondary",
      },
      {
        id: 3,
        url: "/assets/images/laptop3.jpg",
        title: "Ports View",
        type: "secondary",
      },
    ],
  };

  const mockMaintenanceHistory = [
    {
      id: 1,
      maintenance_date: "2024-04-15",
      maintenance_type: "preventive",
      title: "Quarterly System Maintenance",
      description: "System cleanup, software updates, hardware inspection",
      cost: 45000,
      vendor: "Internal IT Team",
      status: "completed",
      next_due: "2024-07-15",
    },
    {
      id: 2,
      maintenance_date: "2024-01-20",
      maintenance_type: "corrective",
      title: "Battery Replacement",
      description: "Replaced aging battery with new OEM battery",
      cost: 85000,
      vendor: "Dell Service Center",
      status: "completed",
      next_due: null,
    },
    {
      id: 3,
      maintenance_date: "2023-10-10",
      maintenance_type: "preventive",
      title: "Initial Setup & Configuration",
      description:
        "Initial setup, software installation, security configuration",
      cost: 25000,
      vendor: "Internal IT Team",
      status: "completed",
      next_due: "2024-01-10",
    },
  ];

  const mockAssetHistory = [
    {
      id: 1,
      date: "2024-06-15",
      action: "condition_updated",
      description:
        'Asset condition updated from "good" to "excellent" after maintenance',
      performed_by: "John Doe",
      details: "Post-maintenance inspection showed improved performance",
    },
    {
      id: 2,
      date: "2024-04-15",
      action: "maintenance_completed",
      description: "Quarterly preventive maintenance completed",
      performed_by: "IT Support Team",
      details: "System cleanup, updates, and hardware inspection performed",
    },
    {
      id: 3,
      date: "2024-01-20",
      action: "repair_completed",
      description: "Battery replacement completed",
      performed_by: "Dell Service Center",
      details: "OEM battery installed, tested, and verified",
    },
    {
      id: 4,
      date: "2023-01-20",
      action: "asset_assigned",
      description: "Asset assigned to John Doe - IT Department",
      performed_by: "HR Department",
      details: "Asset allocation for new employee onboarding",
    },
    {
      id: 5,
      date: "2023-01-15",
      action: "asset_created",
      description: "Asset registered in system",
      performed_by: "System Admin",
      details: "Initial asset registration and setup",
    },
  ];

  const mockDocuments = [
    {
      id: 1,
      name: "Purchase Invoice",
      type: "invoice",
      file_name: "invoice_GHF-LT-001.pdf",
      uploaded_date: "2023-01-15",
      size: "245 KB",
    },
    {
      id: 2,
      name: "Warranty Certificate",
      type: "warranty",
      file_name: "warranty_dell_laptop.pdf",
      uploaded_date: "2023-01-15",
      size: "156 KB",
    },
    {
      id: 3,
      name: "User Manual",
      type: "manual",
      file_name: "dell_latitude_5520_manual.pdf",
      uploaded_date: "2023-01-15",
      size: "2.1 MB",
    },
    {
      id: 4,
      name: "Insurance Policy",
      type: "insurance",
      file_name: "insurance_policy_2023.pdf",
      uploaded_date: "2023-02-01",
      size: "189 KB",
    },
  ];

  // Asset conditions
  const assetConditions = [
    {
      value: "excellent",
      label: "Excellent",
      color: "success",
      description: "Like new, no visible wear",
    },
    {
      value: "good",
      label: "Good",
      color: "primary",
      description: "Minor wear, fully functional",
    },
    {
      value: "fair",
      label: "Fair",
      color: "warning",
      description: "Moderate wear, some issues",
    },
    {
      value: "poor",
      label: "Poor",
      color: "error",
      description: "Significant wear, major issues",
    },
  ];

  // Asset statuses
  const assetStatuses = [
    {
      value: "active",
      label: "Active",
      color: "success",
      icon: <ActiveIcon />,
    },
    {
      value: "inactive",
      label: "Inactive",
      color: "default",
      icon: <InactiveIcon />,
    },
    {
      value: "maintenance",
      label: "Under Maintenance",
      color: "warning",
      icon: <MaintenanceIcon />,
    },
    {
      value: "disposed",
      label: "Disposed",
      color: "error",
      icon: <DeleteIcon />,
    },
  ];

  // Load asset details
  useEffect(() => {
    if (id) {
      fetchAssetDetails();
      fetchMaintenanceHistory();
      fetchDepreciationData();
      fetchAssetDocuments();
      fetchAssetHistory();
    }
  }, [id]);

  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await assetAPI.getAssetById(id);
      // setAsset(response.data);
      setAsset(mockAsset);
    } catch (error) {
      showError("Failed to fetch asset details");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceHistory = async () => {
    try {
      // Replace with actual API call
      // const response = await assetAPI.getAssetMaintenanceHistory(id);
      // setMaintenanceHistory(response.data || []);
      setMaintenanceHistory(mockMaintenanceHistory);
    } catch (error) {
      showError("Failed to fetch maintenance history");
    }
  };

  const fetchDepreciationData = async () => {
    try {
      // Replace with actual API call
      // const response = await assetAPI.getAssetDepreciation(id);
      // setDepreciationData(response.data);
      setDepreciationData({
        purchase_cost: mockAsset.purchase_cost,
        current_book_value: mockAsset.current_book_value,
        accumulated_depreciation: mockAsset.accumulated_depreciation,
        annual_depreciation: mockAsset.annual_depreciation,
        depreciation_percentage:
          (mockAsset.accumulated_depreciation /
            (mockAsset.purchase_cost - mockAsset.salvage_value)) *
          100,
      });
    } catch (error) {
      showError("Failed to fetch depreciation data");
    }
  };

  const fetchAssetDocuments = async () => {
    try {
      // Replace with actual API call
      // const response = await assetAPI.getAssetDocuments(id);
      // setAssetDocuments(response.data || []);
      setAssetDocuments(mockDocuments);
    } catch (error) {
      showError("Failed to fetch asset documents");
    }
  };

  const fetchAssetHistory = async () => {
    try {
      // Replace with actual API call
      // const response = await assetAPI.getAssetHistory(id);
      // setAssetHistory(response.data || []);
      setAssetHistory(mockAssetHistory);
    } catch (error) {
      showError("Failed to fetch asset history");
    }
  };

  // Handle asset deletion
  const handleDelete = () => {
    openDialog({
      title: "Delete Asset",
      message: `Are you sure you want to delete asset "${asset.asset_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // await assetAPI.deleteAsset(id);
          showSuccess("Asset deleted successfully");
          navigate("/finance/assets/register");
        } catch (error) {
          showError("Failed to delete asset");
        }
      },
    });
  };

  // Get condition configuration
  const getConditionConfig = (condition) => {
    return (
      assetConditions.find((c) => c.value === condition) || assetConditions[0]
    );
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    return assetStatuses.find((s) => s.value === status) || assetStatuses[0];
  };

  // Calculate warranty status
  const getWarrantyStatus = () => {
    if (!asset.warranty_expiry)
      return { status: "none", label: "No Warranty", color: "default" };

    const daysUntilExpiry = differenceInDays(
      new Date(asset.warranty_expiry),
      new Date()
    );

    if (daysUntilExpiry < 0) {
      return { status: "expired", label: "Expired", color: "error" };
    } else if (daysUntilExpiry <= 30) {
      return { status: "expiring", label: "Expiring Soon", color: "warning" };
    } else {
      return { status: "active", label: "Active", color: "success" };
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!asset) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Asset not found. Please check the asset ID and try again.
        </Alert>
      </Box>
    );
  }

  const conditionConfig = getConditionConfig(asset.condition);
  const statusConfig = getStatusConfig(asset.status);
  const warrantyStatus = getWarrantyStatus();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate("/finance/assets/register")}>
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4">{asset.asset_name}</Typography>
              <Typography variant="body1" color="text.secondary">
                {asset.asset_tag} • {asset.category} • {asset.department}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<QrCodeIcon />}
              onClick={() => setQrDialogOpen(true)}
            >
              QR Code
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => {
                /* Print asset details */
              }}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                /* Export asset details */
              }}
            >
              Export
            </Button>
            {hasPermission(PERMISSIONS.MANAGE_ASSETS) && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditDialogOpen(true)}
                >
                  Edit
                </Button>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreVertIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Status Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            variant="filled"
            icon={statusConfig.icon}
          />
          <Chip
            label={conditionConfig.label}
            color={conditionConfig.color}
            variant="outlined"
          />
          <Chip
            label={`Warranty: ${warrantyStatus.label}`}
            color={warrantyStatus.color}
            variant="outlined"
          />
          {asset.assigned_to && (
            <Chip
              label={`Assigned to: ${asset.assigned_to}`}
              variant="outlined"
              icon={<PersonIcon />}
            />
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Asset Information */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
              >
                <Tab label="Overview" />
                <Tab label="Specifications" />
                <Tab label="Maintenance" />
                <Tab label="Depreciation" />
                <Tab label="Documents" />
                <Tab label="History" />
              </Tabs>

              {/* Overview Tab */}
              {activeTab === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Basic Information
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Asset Name
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {asset.asset_name}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Asset Tag
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {asset.asset_tag}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {asset.description}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {asset.category} - {asset.sub_category}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Brand & Model
                        </Typography>
                        <Typography variant="body1">
                          {asset.brand} {asset.model}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Serial Number
                        </Typography>
                        <Typography variant="body1" fontFamily="monospace">
                          {asset.serial_number}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Location & Assignment
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body1">
                          {asset.location}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body1">
                          {asset.department}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Assigned To
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                          >
                            {asset.assigned_to?.charAt(0)}
                          </Avatar>
                          <Typography variant="body1">
                            {asset.assigned_to}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Assignment Date
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(asset.assigned_date), "dd/MM/yyyy")}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Asset Age
                        </Typography>
                        <Typography variant="body1">
                          {asset.age_years.toFixed(1)} years
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color}
                          size="small"
                          icon={statusConfig.icon}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Asset Images */}
                  {asset.images && asset.images.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Asset Images
                      </Typography>
                      <ImageList cols={3} rowHeight={200}>
                        {asset.images.map((image) => (
                          <ImageListItem key={image.id}>
                            <img
                              src={`${image.url}?w=200&h=200&fit=crop&auto=format`}
                              srcSet={`${image.url}?w=200&h=200&fit=crop&auto=format&dpr=2 2x`}
                              alt={image.title}
                              loading="lazy"
                              style={{ borderRadius: 8 }}
                            />
                            <ImageListItemBar
                              title={image.title}
                              position="below"
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  )}
                </Box>
              )}

              {/* Specifications Tab */}
              {activeTab === 1 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Technical Specifications
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableBody>
                        {Object.entries(asset.specifications || {}).map(
                          ([key, value]) => (
                            <TableRow key={key}>
                              <TableCell
                                sx={{
                                  fontWeight: "medium",
                                  textTransform: "capitalize",
                                }}
                              >
                                {key.replace(/_/g, " ")}
                              </TableCell>
                              <TableCell>{value}</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Maintenance Tab */}
              {activeTab === 2 && (
                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Maintenance History</Typography>
                    {hasPermission(PERMISSIONS.SCHEDULE_MAINTENANCE) && (
                      <Button
                        variant="outlined"
                        startIcon={<ScheduleIcon />}
                        onClick={() =>
                          navigate(
                            `/finance/assets/maintenance?assetId=${asset.id}`
                          )
                        }
                      >
                        Schedule Maintenance
                      </Button>
                    )}
                  </Box>

                  <Alert severity="info" sx={{ mb: 2 }}>
                    Next maintenance due:{" "}
                    {format(new Date(asset.next_maintenance), "dd/MM/yyyy")}
                  </Alert>

                  <Timeline>
                    {maintenanceHistory.map((maintenance, index) => (
                      <TimelineItem key={maintenance.id}>
                        <TimelineOppositeContent color="text.secondary">
                          {format(
                            new Date(maintenance.maintenance_date),
                            "dd/MM/yyyy"
                          )}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot
                            color={
                              maintenance.maintenance_type === "preventive"
                                ? "primary"
                                : maintenance.maintenance_type === "corrective"
                                  ? "warning"
                                  : "error"
                            }
                          >
                            {maintenance.maintenance_type === "preventive" ? (
                              <ScheduleIcon />
                            ) : (
                              <RepairIcon />
                            )}
                          </TimelineDot>
                          {index < maintenanceHistory.length - 1 && (
                            <TimelineConnector />
                          )}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="h6" component="span">
                            {maintenance.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {maintenance.description}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Chip
                              label={maintenance.maintenance_type}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={`TZS ${maintenance.cost.toLocaleString()}`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={maintenance.vendor}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Box>
              )}

              {/* Depreciation Tab */}
              {activeTab === 3 && (
                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Depreciation Analysis</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<DepreciationIcon />}
                      onClick={() =>
                        navigate(
                          `/finance/assets/depreciation?assetId=${asset.id}`
                        )
                      }
                    >
                      View Full Analysis
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
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
                              TZS {asset.purchase_cost?.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Current Book Value
                            </Typography>
                            <Typography variant="h6" color="success.main">
                              TZS {asset.current_book_value?.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Accumulated Depreciation
                            </Typography>
                            <Typography variant="h6" color="error.main">
                              TZS{" "}
                              {asset.accumulated_depreciation?.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Salvage Value
                            </Typography>
                            <Typography variant="body1">
                              TZS {asset.salvage_value?.toLocaleString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Depreciation Details
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Depreciation Method
                            </Typography>
                            <Typography variant="body1">
                              {asset.depreciation_method === "straight_line"
                                ? "Straight Line"
                                : asset.depreciation_method}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Useful Life
                            </Typography>
                            <Typography variant="body1">
                              {asset.useful_life_years} years
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Annual Depreciation
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              TZS {asset.annual_depreciation?.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Remaining Life
                            </Typography>
                            <Typography variant="body1">
                              {asset.remaining_life?.toFixed(1)} years
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
                            {asset.age_years?.toFixed(1)} /{" "}
                            {asset.useful_life_years} years
                          </Typography>
                          <Typography variant="body2">
                            {depreciationData?.depreciation_percentage?.toFixed(
                              1
                            )}
                            % depreciated
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={depreciationData?.depreciation_percentage || 0}
                          sx={{ height: 10, borderRadius: 5 }}
                          color={
                            depreciationData?.depreciation_percentage > 80
                              ? "error"
                              : "primary"
                          }
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Based on {asset.depreciation_method} depreciation method
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Documents Tab */}
              {activeTab === 4 && (
                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Asset Documents</Typography>
                    {hasPermission(PERMISSIONS.MANAGE_ASSETS) && (
                      <Button
                        variant="outlined"
                        startIcon={<DocumentIcon />}
                        onClick={() => {
                          /* Upload document */
                        }}
                      >
                        Upload Document
                      </Button>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    {assetDocuments.map((document) => (
                      <Grid item xs={12} sm={6} md={4} key={document.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              {document.type === "invoice" && (
                                <InvoiceIcon color="primary" />
                              )}
                              {document.type === "warranty" && (
                                <InfoIcon color="success" />
                              )}
                              {document.type === "manual" && (
                                <DocumentIcon color="info" />
                              )}
                              {document.type === "insurance" && (
                                <InsuranceIcon color="warning" />
                              )}
                              <Typography variant="subtitle2">
                                {document.name}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {document.file_name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {document.size} •{" "}
                                {format(
                                  new Date(document.uploaded_date),
                                  "dd/MM/yyyy"
                                )}
                              </Typography>
                              <Button size="small" startIcon={<DownloadIcon />}>
                                Download
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {assetDocuments.length === 0 && (
                    <Alert severity="info">
                      No documents uploaded for this asset yet.
                    </Alert>
                  )}
                </Box>
              )}

              {/* History Tab */}
              {activeTab === 5 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Asset Activity History
                  </Typography>

                  <Timeline>
                    {assetHistory.map((historyItem, index) => (
                      <TimelineItem key={historyItem.id}>
                        <TimelineOppositeContent color="text.secondary">
                          {format(
                            new Date(historyItem.date),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot
                            color={
                              historyItem.action === "asset_created"
                                ? "primary"
                                : historyItem.action === "asset_assigned"
                                  ? "success"
                                  : historyItem.action ===
                                      "maintenance_completed"
                                    ? "info"
                                    : historyItem.action === "condition_updated"
                                      ? "warning"
                                      : "default"
                            }
                          >
                            {historyItem.action === "asset_created" && (
                              <AssetIcon />
                            )}
                            {historyItem.action === "asset_assigned" && (
                              <AssignIcon />
                            )}
                            {historyItem.action === "maintenance_completed" && (
                              <MaintenanceIcon />
                            )}
                            {historyItem.action === "condition_updated" && (
                              <EditIcon />
                            )}
                            {historyItem.action === "repair_completed" && (
                              <RepairIcon />
                            )}
                          </TimelineDot>
                          {index < assetHistory.length - 1 && (
                            <TimelineConnector />
                          )}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="h6" component="span">
                            {historyItem.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            By: {historyItem.performed_by}
                          </Typography>
                          {historyItem.details && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {historyItem.details}
                            </Typography>
                          )}
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Summary & Quick Actions */}
        <Grid item xs={12} lg={4}>
          {/* Quick Info Card */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Purchase Date
                </Typography>
                <Typography variant="body1">
                  {format(new Date(asset.purchase_date), "dd/MM/yyyy")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Supplier
                </Typography>
                <Typography variant="body1">{asset.supplier}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Value
                </Typography>
                <Typography variant="h6" color="success.main">
                  TZS {asset.current_book_value?.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Condition
                </Typography>
                <Chip
                  label={conditionConfig.label}
                  color={conditionConfig.color}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Warranty Information */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Warranty Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Warranty Status
                </Typography>
                <Chip
                  label={warrantyStatus.label}
                  color={warrantyStatus.color}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Warranty Start
                </Typography>
                <Typography variant="body1">
                  {format(new Date(asset.warranty_start), "dd/MM/yyyy")}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Warranty Expiry
                </Typography>
                <Typography variant="body1">
                  {format(new Date(asset.warranty_expiry), "dd/MM/yyyy")}
                </Typography>
              </Box>
              {warrantyStatus.status === "expiring" && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Warranty expires in{" "}
                    {differenceInDays(
                      new Date(asset.warranty_expiry),
                      new Date()
                    )}{" "}
                    days
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Insurance Information */}
          {asset.insurance_policy && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Insurance Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Policy Number
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {asset.insurance_policy}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Policy Expiry
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(asset.insurance_expiry), "dd/MM/yyyy")}
                  </Typography>
                </Box>
                {differenceInDays(
                  new Date(asset.insurance_expiry),
                  new Date()
                ) <= 30 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Insurance expires soon
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {hasPermission(PERMISSIONS.SCHEDULE_MAINTENANCE) && (
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    fullWidth
                    onClick={() =>
                      navigate(
                        `/finance/assets/maintenance?assetId=${asset.id}`
                      )
                    }
                  >
                    Schedule Maintenance
                  </Button>
                )}
                {hasPermission(PERMISSIONS.MANAGE_ASSETS) && (
                  <Button
                    variant="outlined"
                    startIcon={<AssignIcon />}
                    fullWidth
                    onClick={() => setAssignDialogOpen(true)}
                  >
                    Reassign Asset
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<DepreciationIcon />}
                  fullWidth
                  onClick={() =>
                    navigate(`/finance/assets/depreciation?assetId=${asset.id}`)
                  }
                >
                  View Depreciation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ReportIcon />}
                  fullWidth
                  onClick={() => {
                    /* Generate asset report */
                  }}
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAssignDialogOpen(true)}>
          <ListItemIcon>
            <AssignIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reassign Asset</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() =>
            navigate(`/finance/assets/maintenance?assetId=${asset.id}`)
          }
        >
          <ListItemIcon>
            <MaintenanceIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule Maintenance</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            /* Transfer asset */
          }}
        >
          <ListItemIcon>
            <TransferIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Transfer Asset</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            /* Dispose asset */
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Disposed</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Asset</ListItemText>
        </MenuItem>
      </Menu>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Asset QR Code - {asset.asset_tag}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", p: 2 }}>
            <Box
              sx={{
                width: 200,
                height: 200,
                bgcolor: "grey.100",
                border: "2px dashed",
                borderColor: "grey.300",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <QrCodeIcon sx={{ fontSize: 64, color: "grey.500" }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              QR Code for {asset.asset_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Asset Tag: {asset.asset_tag}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download QR Code
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />}>
            Print Label
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset Assignment Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reassign Asset - {asset.asset_name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Currently assigned to: {asset.assigned_to}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>New Assignee</InputLabel>
                <Select label="New Assignee">
                  <MenuItem value="john_doe">John Doe - IT Department</MenuItem>
                  <MenuItem value="jane_smith">
                    Jane Smith - HR Department
                  </MenuItem>
                  <MenuItem value="mike_johnson">
                    Mike Johnson - Marketing
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select label="Department">
                  <MenuItem value="it">IT Department</MenuItem>
                  <MenuItem value="hr">HR Department</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select label="Location">
                  <MenuItem value="head_office">Head Office</MenuItem>
                  <MenuItem value="mombasa_office">Mombasa Office</MenuItem>
                  <MenuItem value="arusha_office">Arusha Office</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setAssignDialogOpen(false);
              showSuccess("Asset reassigned successfully");
            }}
          >
            Reassign Asset
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

export default AssetDetailsPage;
