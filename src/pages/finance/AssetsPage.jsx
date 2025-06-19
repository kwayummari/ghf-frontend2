import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  IconButton,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
} from "@mui/material";
import {
  Inventory as AssetsIcon,
  TrendingDown as DepreciationIcon,
  Build as MaintenanceIcon,
  MonetizationOn as ValueIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Assessment as ReportsIcon,
  Warning as WarningIcon,
  CheckCircle as GoodIcon,
  Schedule as ScheduledIcon,
  Category as CategoryIcon,
  Business as LocationIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import { LoadingSpinner } from "../../components/common/Loading";

const AssetsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission } = useAuth();
  const { showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [assetData, setAssetData] = useState({});

  // Mock data for asset dashboard
  const mockAssetData = {
    summary: {
      totalAssets: 156,
      totalValue: 85400000,
      maintenanceDue: 8,
      fullyDepreciated: 12,
    },
    recentAssets: [
      {
        id: 1,
        name: "Dell Latitude 5520",
        tag: "GHF-LT-001",
        category: "IT Equipment",
        location: "Head Office",
        value: 1200000,
        condition: "excellent",
      },
      {
        id: 2,
        name: "Toyota Hilux",
        tag: "GHF-VH-001",
        category: "Vehicles",
        location: "Mombasa Office",
        value: 4500000,
        condition: "good",
      },
    ],
    maintenanceAlerts: [
      {
        id: 1,
        assetName: "Dell Latitude 5520",
        type: "Preventive",
        dueDate: "2024-07-15",
        priority: "medium",
      },
      {
        id: 2,
        assetName: "Toyota Hilux",
        type: "Corrective",
        dueDate: "2024-07-10",
        priority: "high",
      },
    ],
    categoryBreakdown: [
      { category: "IT Equipment", count: 45, value: 25000000, percentage: 29 },
      { category: "Vehicles", count: 12, value: 35000000, percentage: 41 },
      { category: "Furniture", count: 89, value: 15000000, percentage: 18 },
      { category: "Equipment", count: 10, value: 10400000, percentage: 12 },
    ],
  };

  useEffect(() => {
    fetchAssetData();
  }, []);

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await assetAPI.getDashboardData();
      // setAssetData(response.data);
      setAssetData(mockAssetData);
    } catch (error) {
      showError("Failed to fetch asset data");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Asset Register",
      description: "View and manage all assets",
      icon: <AssetsIcon />,
      color: "primary",
      path: "/finance/assets/register",
      permission: PERMISSIONS.VIEW_ASSETS,
    },
    {
      title: "Asset Maintenance",
      description: "Schedule and track maintenance",
      icon: <MaintenanceIcon />,
      color: "warning",
      path: "/finance/assets/maintenance",
      permission: PERMISSIONS.SCHEDULE_MAINTENANCE,
    },
    {
      title: "Asset Depreciation",
      description: "Calculate and track depreciation",
      icon: <DepreciationIcon />,
      color: "info",
      path: "/finance/assets/depreciation",
      permission: PERMISSIONS.CALCULATE_DEPRECIATION,
    },
    {
      title: "Add New Asset",
      description: "Register a new asset",
      icon: <AddIcon />,
      color: "success",
      action: () => navigate("/finance/assets/register?action=create"),
      permission: PERMISSIONS.MANAGE_ASSETS,
    },
  ];

  const summaryCards = [
    {
      title: "Total Assets",
      value: assetData.summary?.totalAssets?.toString() || "0",
      icon: <AssetsIcon />,
      color: "primary",
      subtitle: "Registered assets",
    },
    {
      title: "Total Value",
      value: `TZS ${assetData.summary?.totalValue?.toLocaleString() || "0"}`,
      icon: <ValueIcon />,
      color: "success",
      subtitle: "Current book value",
    },
    {
      title: "Maintenance Due",
      value: assetData.summary?.maintenanceDue?.toString() || "0",
      icon: <WarningIcon />,
      color: "warning",
      subtitle: "Assets requiring attention",
    },
    {
      title: "Fully Depreciated",
      value: assetData.summary?.fullyDepreciated?.toString() || "0",
      icon: <DepreciationIcon />,
      color: "error",
      subtitle: "End of useful life",
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Asset Management Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive overview of organizational assets, maintenance, and
          depreciation
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
                  <Avatar sx={{ bgcolor: `${card.color}.main` }}>
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map(
              (action, index) =>
                hasPermission(action.permission) && (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                      onClick={() =>
                        action.path ? navigate(action.path) : action.action?.()
                      }
                    >
                      <CardContent sx={{ textAlign: "center", py: 3 }}>
                        <Avatar
                          sx={{
                            bgcolor: `${action.color}.main`,
                            mx: "auto",
                            mb: 2,
                            width: 56,
                            height: 56,
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Assets */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Recent Assets</Typography>
                <Button
                  size="small"
                  onClick={() => navigate("/finance/assets/register")}
                  endIcon={<ViewIcon />}
                >
                  View All
                </Button>
              </Box>
              <List>
                {assetData.recentAssets?.map((asset, index) => (
                  <React.Fragment key={asset.id}>
                    <ListItem
                      sx={{ px: 0, cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/finance/assets/register?assetId=${asset.id}`)
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <AssetsIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body1" fontWeight="medium">
                              {asset.name}
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              TZS {asset.value.toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {asset.tag} • {asset.category}
                            </Typography>
                            <Chip
                              label={asset.condition}
                              size="small"
                              color={
                                asset.condition === "excellent"
                                  ? "success"
                                  : "primary"
                              }
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < assetData.recentAssets.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Maintenance Alerts</Typography>
                <Button
                  size="small"
                  onClick={() => navigate("/finance/assets/maintenance")}
                  endIcon={<CalendarIcon />}
                >
                  Schedule
                </Button>
              </Box>
              {assetData.maintenanceAlerts?.length > 0 ? (
                <List>
                  {assetData.maintenanceAlerts.map((alert, index) => (
                    <React.Fragment key={alert.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                alert.priority === "high"
                                  ? "error.main"
                                  : alert.priority === "medium"
                                    ? "warning.main"
                                    : "info.main",
                            }}
                          >
                            <MaintenanceIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={alert.assetName}
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {alert.type} maintenance due: {alert.dueDate}
                              </Typography>
                              <Chip
                                label={`${alert.priority} priority`}
                                size="small"
                                color={
                                  alert.priority === "high"
                                    ? "error"
                                    : "warning"
                                }
                                variant="filled"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < assetData.maintenanceAlerts.length - 1 && (
                        <Divider />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="success">
                  <Typography variant="body2">
                    No maintenance alerts. All assets are up to date!
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Categories Breakdown */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Asset Categories Overview
              </Typography>
              <Grid container spacing={2}>
                {assetData.categoryBreakdown?.map((category, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
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
                          <Typography variant="subtitle1" fontWeight="medium">
                            {category.category}
                          </Typography>
                        </Box>
                        <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                          {category.count}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          TZS {category.value.toLocaleString()}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={category.percentage}
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">
                            {category.percentage}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="outlined"
          startIcon={<ReportsIcon />}
          onClick={() => navigate("/reports/assets")}
        >
          Asset Reports
        </Button>
        <Button
          variant="outlined"
          startIcon={<TrendingUpIcon />}
          onClick={() => navigate("/finance/assets/depreciation")}
        >
          Depreciation Analysis
        </Button>
        {hasPermission(PERMISSIONS.MANAGE_ASSETS) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/finance/assets/register?action=create")}
          >
            Add New Asset
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AssetsPage;
