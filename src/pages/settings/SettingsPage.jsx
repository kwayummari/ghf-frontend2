import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  TextField,
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
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Avatar,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from "@mui/material";
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  People as UsersIcon,
  Business as CompanyIcon,
  Notifications as NotificationsIcon,
  Storage as DatabaseIcon,
  CloudUpload as BackupIcon,
  Email as EmailIcon,
  Payment as PayrollIcon,
  EventNote as LeaveIcon,
  Event as HolidayIcon,
  DateRange as FiscalIcon,
  MonetizationOn as SalaryIcon,
  Category as CategoryIcon,
  Assignment as RoleIcon,
  Menu as MenuIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
  Speed as PerformanceIcon,
  Shield as PermissionIcon,
  History as AuditIcon,
  SystemUpdate as SystemIcon,
  IntegrationInstructions as IntegrationIcon,
  Api as ApiIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as EnabledIcon,
  Cancel as DisabledIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import { LoadingSpinner } from "../../components/common/Loading";

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();

  // State management
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [systemSettings, setSystemSettings] = useState({});

  // Settings categories with their respective items
  const settingsCategories = [
    {
      id: "hr_payroll",
      title: "HR & Payroll",
      description: "Employee management and payroll configuration",
      icon: <PayrollIcon />,
      color: "primary",
      items: [
        {
          id: "fiscal_year",
          title: "Fiscal Year Settings",
          description: "Manage fiscal years, quarters, and accounting periods",
          route: "/settings/fiscal-year",
          icon: <FiscalIcon />,
          permission: PERMISSIONS.MANAGE_FISCAL_YEAR,
          status: "configured",
        },
        {
          id: "salary_scale",
          title: "Salary Scale Management",
          description: "Configure employee salary grades and scales",
          route: "/settings/salary-scale",
          icon: <SalaryIcon />,
          permission: PERMISSIONS.MANAGE_SALARY_SCALE,
          status: "configured",
        },
        {
          id: "leave_types",
          title: "Leave Type Settings",
          description: "Configure leave types, policies, and entitlements",
          route: "/settings/leave-types",
          icon: <LeaveIcon />,
          permission: PERMISSIONS.MANAGE_LEAVE_TYPES,
          status: "configured",
        },
        {
          id: "holidays",
          title: "Holiday Management",
          description: "Manage public holidays and organizational calendar",
          route: "/settings/holidays",
          icon: <HolidayIcon />,
          permission: PERMISSIONS.MANAGE_HOLIDAYS,
          status: "configured",
        },
      ],
    },
    {
      id: "user_management",
      title: "User Management",
      description: "User accounts, roles, and permissions",
      icon: <UsersIcon />,
      color: "success",
      items: [
        {
          id: "users",
          title: "User Management",
          description: "Manage user accounts and profiles",
          route: "/settings/users",
          icon: <UsersIcon />,
          permission: PERMISSIONS.MANAGE_USERS,
          status: "active",
        },
        {
          id: "roles",
          title: "Roles & Permissions",
          description: "Configure user roles and access permissions",
          route: "/settings/roles",
          icon: <RoleIcon />,
          permission: PERMISSIONS.MANAGE_ROLES,
          status: "active",
        },
        {
          id: "menus",
          title: "Menu Management",
          description: "Configure application menus and navigation",
          route: "/settings/menus",
          icon: <MenuIcon />,
          permission: PERMISSIONS.MANAGE_MENUS,
          status: "active",
        },
      ],
    },
    {
      id: "system_config",
      title: "System Configuration",
      description: "Core system settings and preferences",
      icon: <SystemIcon />,
      color: "info",
      items: [
        {
          id: "company_profile",
          title: "Company Profile",
          description: "Organization details and branding settings",
          route: "/settings/company",
          icon: <CompanyIcon />,
          permission: PERMISSIONS.MANAGE_COMPANY_SETTINGS,
          status: "configured",
        },
        {
          id: "email_config",
          title: "Email Configuration",
          description: "SMTP settings and email templates",
          route: "/settings/email",
          icon: <EmailIcon />,
          permission: PERMISSIONS.MANAGE_EMAIL_SETTINGS,
          status: "needs_attention",
        },
        {
          id: "notifications",
          title: "Notification Settings",
          description: "Configure system notifications and alerts",
          route: "/settings/notifications",
          icon: <NotificationsIcon />,
          permission: PERMISSIONS.MANAGE_NOTIFICATIONS,
          status: "configured",
        },
        {
          id: "integrations",
          title: "Third-party Integrations",
          description: "External service integrations and APIs",
          route: "/settings/integrations",
          icon: <IntegrationIcon />,
          permission: PERMISSIONS.MANAGE_INTEGRATIONS,
          status: "partial",
        },
      ],
    },
    {
      id: "security_backup",
      title: "Security & Backup",
      description: "Security settings and data backup",
      icon: <SecurityIcon />,
      color: "warning",
      items: [
        {
          id: "security",
          title: "Security Settings",
          description: "Password policies and security configurations",
          route: "/settings/security",
          icon: <SecurityIcon />,
          permission: PERMISSIONS.MANAGE_SECURITY,
          status: "configured",
        },
        {
          id: "audit_logs",
          title: "Audit Logs",
          description: "System activity logs and monitoring",
          route: "/settings/audit",
          icon: <AuditIcon />,
          permission: PERMISSIONS.VIEW_AUDIT_LOGS,
          status: "active",
        },
        {
          id: "backup",
          title: "Backup & Recovery",
          description: "Data backup settings and restore options",
          route: "/settings/backup",
          icon: <BackupIcon />,
          permission: PERMISSIONS.MANAGE_BACKUP,
          status: "needs_attention",
        },
        {
          id: "api_management",
          title: "API Management",
          description: "API keys and external access configuration",
          route: "/settings/api",
          icon: <ApiIcon />,
          permission: PERMISSIONS.MANAGE_API,
          status: "configured",
        },
      ],
    },
    {
      id: "customization",
      title: "Customization",
      description: "UI themes and system preferences",
      icon: <ThemeIcon />,
      color: "secondary",
      items: [
        {
          id: "themes",
          title: "Theme Settings",
          description: "Application themes and appearance",
          route: "/settings/themes",
          icon: <ThemeIcon />,
          permission: PERMISSIONS.MANAGE_THEMES,
          status: "configured",
        },
        {
          id: "language",
          title: "Language & Localization",
          description: "Language settings and regional preferences",
          route: "/settings/language",
          icon: <LanguageIcon />,
          permission: PERMISSIONS.MANAGE_LANGUAGE,
          status: "configured",
        },
        {
          id: "categories",
          title: "Category Management",
          description: "Manage system categories and classifications",
          route: "/settings/categories",
          icon: <CategoryIcon />,
          permission: PERMISSIONS.MANAGE_CATEGORIES,
          status: "configured",
        },
      ],
    },
  ];

  // Status configurations
  const statusConfig = {
    active: { color: "success", icon: <EnabledIcon />, label: "Active" },
    configured: { color: "info", icon: <EnabledIcon />, label: "Configured" },
    needs_attention: {
      color: "warning",
      icon: <WarningIcon />,
      label: "Needs Attention",
    },
    disabled: { color: "default", icon: <DisabledIcon />, label: "Disabled" },
    partial: {
      color: "warning",
      icon: <InfoIcon />,
      label: "Partially Configured",
    },
  };

  // Quick actions
  const quickActions = [
    {
      title: "Add New User",
      description: "Create a new user account",
      icon: <UsersIcon />,
      action: () => navigate("/settings/users?action=create"),
      permission: PERMISSIONS.MANAGE_USERS,
    },
    {
      title: "Configure Fiscal Year",
      description: "Set up new fiscal period",
      icon: <FiscalIcon />,
      action: () => navigate("/settings/fiscal-year?action=create"),
      permission: PERMISSIONS.MANAGE_FISCAL_YEAR,
    },
    {
      title: "Backup System",
      description: "Create system backup",
      icon: <BackupIcon />,
      action: () => handleQuickBackup(),
      permission: PERMISSIONS.MANAGE_BACKUP,
    },
    {
      title: "View Audit Logs",
      description: "Check recent activity",
      icon: <AuditIcon />,
      action: () => navigate("/settings/audit"),
      permission: PERMISSIONS.VIEW_AUDIT_LOGS,
    },
  ];

  // System status overview
  const systemStatus = {
    database: { status: "healthy", lastBackup: "2024-06-20 03:00:00" },
    email: { status: "warning", lastTest: "2024-06-15 14:30:00" },
    integrations: { status: "healthy", activeCount: 3 },
    security: { status: "healthy", lastScan: "2024-06-20 01:00:00" },
  };

  // Load settings data
  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await settingsAPI.getSystemSettings();
      // setSystemSettings(response.data || {});

      // Mock system settings
      setSystemSettings({
        companyName: "GH Foundation",
        version: "1.0.0",
        environment: "production",
        lastUpdated: "2024-06-20T10:00:00Z",
      });
    } catch (error) {
      showError("Failed to fetch system settings");
    } finally {
      setLoading(false);
    }
  };

  // Handle quick backup
  const handleQuickBackup = async () => {
    try {
      // Replace with actual backup API call
      // await settingsAPI.createBackup();
      showSuccess("System backup initiated successfully");
    } catch (error) {
      showError("Failed to create system backup");
    }
  };

  // Navigate to settings page
  const handleNavigateToSetting = (route, permission) => {
    if (permission && !hasPermission(permission)) {
      showError("You do not have permission to access this setting");
      return;
    }
    navigate(route);
  };

  // Filter settings based on search term
  const filteredCategories = settingsCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure and manage your GHF Office System settings
        </Typography>
      </Box>

      {/* System Status Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            System Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="primary">
                  {systemSettings.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organization
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6">v{systemSettings.version}</Typography>
                <Typography variant="body2" color="text.secondary">
                  System Version
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Chip
                  label={systemSettings.environment}
                  color="success"
                  variant="filled"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Environment
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body1">
                  {user?.role || "Administrator"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your Role
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
                          bgcolor: "action.hover",
                          transform: "translateY(-2px)",
                        },
                      }}
                      onClick={action.action}
                    >
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Box sx={{ color: "primary.main", mb: 1 }}>
                          {action.icon}
                        </Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {action.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search settings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Settings Categories */}
      <Grid container spacing={3}>
        {filteredCategories.map((category) => (
          <Grid item xs={12} key={category.id}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ color: `${category.color}.main` }}>
                    {category.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="medium">
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {category.items.map(
                    (item) =>
                      hasPermission(item.permission) && (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Card
                            variant="outlined"
                            sx={{
                              height: "100%",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                bgcolor: "action.hover",
                                transform: "translateY(-2px)",
                                boxShadow: 2,
                              },
                            }}
                            onClick={() =>
                              handleNavigateToSetting(
                                item.route,
                                item.permission
                              )
                            }
                          >
                            <CardContent>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 2,
                                }}
                              >
                                <Box sx={{ color: "primary.main", mt: 0.5 }}>
                                  {item.icon}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="medium"
                                    >
                                      {item.title}
                                    </Typography>
                                    <Chip
                                      label={statusConfig[item.status]?.label}
                                      size="small"
                                      color={statusConfig[item.status]?.color}
                                      variant="outlined"
                                    />
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                  >
                                    {item.description}
                                  </Typography>
                                </Box>
                                <ChevronRightIcon color="action" />
                              </Box>
                            </CardContent>
                            <CardActions>
                              <Button
                                size="small"
                                startIcon={<LaunchIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigateToSetting(
                                    item.route,
                                    item.permission
                                  );
                                }}
                              >
                                Configure
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      )
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      {/* System Status Details */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            System Health Status
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <DatabaseIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <MUIListItemText
                    primary="Database"
                    secondary={`Healthy • Last backup: ${systemStatus.database.lastBackup}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "warning.main" }}>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <MUIListItemText
                    primary="Email Service"
                    secondary={`Needs attention • Last test: ${systemStatus.email.lastTest}`}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <IntegrationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <MUIListItemText
                    primary="Integrations"
                    secondary={`${systemStatus.integrations.activeCount} active integrations`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <SecurityIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <MUIListItemText
                    primary="Security"
                    secondary={`Secure • Last scan: ${systemStatus.security.lastScan}`}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button
            startIcon={<PerformanceIcon />}
            onClick={() => navigate("/settings/system-health")}
          >
            View Detailed Status
          </Button>
          <Button
            startIcon={<BackupIcon />}
            onClick={handleQuickBackup}
            color="primary"
          >
            Create Backup
          </Button>
        </CardActions>
      </Card>

      {/* Help Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Need Help?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Alert severity="info">
                <Typography variant="subtitle2">Documentation</Typography>
                <Typography variant="body2">
                  Comprehensive guides for system configuration
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="success">
                <Typography variant="subtitle2">Support</Typography>
                <Typography variant="body2">
                  Contact our technical support team
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="warning">
                <Typography variant="subtitle2">Training</Typography>
                <Typography variant="body2">
                  Schedule training sessions for your team
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
