import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Pagination,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Create as CreateIcon,
  Delete as DeleteIcon,
  Update as UpdateIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { useNotification } from "../../components/common/NotificationProvider";
import activityLogsAPI from "../../services/api/activityLogs.api";
import apiClient from "../../services/api/axios.config";
import { API_ENDPOINTS } from "../../constants";


const ActivityLogsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();

  // State management
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Build query parameters
  const queryParams = {
    page,
    limit,
    search: searchTerm,
    action: actionFilter,
    module: moduleFilter,
    status: statusFilter,
    user: userFilter,
    date_from: dateFrom,
    date_to: dateTo,
  };

  // Fetch activities with React Query
  const {
    data: activitiesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["activity-logs", queryParams],
    queryFn: () => activityLogsAPI.getActivityLogs(queryParams),
    keepPreviousData: true,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fetch activity statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["activity-stats"],
    queryFn: () => activityLogsAPI.getActivityStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const activities = activitiesResponse?.data || [];
  const totalPages = Math.ceil((activitiesResponse?.total || 0) / limit);
  const stats = statsData?.data || {};

  // Filter options
  const actionOptions = [
    { value: "", label: "All Actions" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
    { value: "view", label: "View" },
    { value: "login", label: "Login" },
    { value: "logout", label: "Logout" },
  ];

  const moduleOptions = [
    { value: "", label: "All Modules" },
    { value: "auth", label: "Authentication" },
    { value: "employees", label: "Employees" },
    { value: "leaves", label: "Leaves" },
    { value: "attendance", label: "Attendance" },
    { value: "finance", label: "Finance" },
    { value: "settings", label: "Settings" },
    { value: "system", label: "System" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
  ];

  // Handle search and filters
  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleReset = () => {
    setSearchTerm("");
    setActionFilter("");
    setModuleFilter("");
    setStatusFilter("");
    setUserFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await activityLogsAPI.exportActivityLogs(queryParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-logs-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess("Activity logs exported successfully");
    } catch (error) {
      showError("Failed to export activity logs");
    }
  };

  // Handle view details
  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setDetailDialogOpen(true);
  };

  if (!hasPermission("VIEW_AUDIT_LOGS")) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          You don't have permission to view audit logs.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Activity Logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and track all system activities and user actions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {!statsLoading && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="primary">
                  {stats.today || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Activities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="success.main">
                  {stats.this_week || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="warning.main">
                  {stats.failed_logins || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed Logins
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="error.main">
                  {stats.security_events || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Security Events
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search activities..."
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
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  {actionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Module</InputLabel>
                <Select
                  value={moduleFilter}
                  label="Module"
                  onChange={(e) => setModuleFilter(e.target.value)}
                >
                  {moduleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                >
                  Search
                </Button>
                <Button variant="outlined" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleExport}
                  startIcon={<DownloadIcon />}
                >
                  Export
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load activity logs. Please try again.
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Activity</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Module</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                              <ActivityIcon
                                action={activity.action}
                                status={activity.status}
                              />
                            </Avatar>
                            <Typography variant="body2">
                              {activity.description || "No description"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {activity.user_name || "System"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.user_role || ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.action || "Unknown"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.module || "General"}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <StatusChip status={activity.status} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(
                              activity.timestamp || activity.created_at
                            ).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(activity)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Activity Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Activity Details
          <IconButton
            sx={{ position: "absolute", right: 8, top: 8 }}
            onClick={() => setDetailDialogOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedActivity.description || "No description"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  User
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedActivity.user_name || "System"} (
                  {selectedActivity.user_role || "Unknown"})
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Action
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedActivity.action || "Unknown"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Module
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedActivity.module || "General"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <StatusChip status={selectedActivity.status} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  IP Address
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedActivity.ip_address || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Timestamp
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {new Date(
                    selectedActivity.timestamp || selectedActivity.created_at
                  ).toLocaleString()}
                </Typography>
              </Grid>
              {selectedActivity.metadata && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Information
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <pre style={{ fontSize: "12px", margin: 0 }}>
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Activity Icon Component
const ActivityIcon = ({ action, status }) => {
  if (status === "failed" || status === "error") {
    return <ErrorIcon fontSize="small" />;
  }

  switch (action?.toLowerCase()) {
    case "create":
      return <CreateIcon fontSize="small" />;
    case "update":
    case "edit":
      return <UpdateIcon fontSize="small" />;
    case "delete":
      return <DeleteIcon fontSize="small" />;
    case "view":
    case "read":
      return <VisibilityIcon fontSize="small" />;
    case "login":
      return <LoginIcon fontSize="small" />;
    case "logout":
      return <LogoutIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
};

// Status Chip Component
const StatusChip = ({ status }) => {
  switch (status?.toLowerCase()) {
    case "success":
    case "completed":
      return <Chip label="Success" color="success" size="small" />;
    case "failed":
    case "error":
      return <Chip label="Failed" color="error" size="small" />;
    case "pending":
      return <Chip label="Pending" color="warning" size="small" />;
    case "approved":
      return <Chip label="Approved" color="success" size="small" />;
    case "rejected":
      return <Chip label="Rejected" color="error" size="small" />;
    default:
      return <Chip label={status || "Unknown"} color="default" size="small" />;
  }
};

// Export components for use
export { DashboardRecentActivity, ActivityLogsPage, activityLogsAPI };

// Main component
export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Box
        sx={{ p: 2, bgcolor: "white", borderBottom: 1, borderColor: "divider" }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant={currentView === "dashboard" ? "contained" : "outlined"}
            onClick={() => setCurrentView("dashboard")}
            startIcon={<DashboardIcon />}
          >
            Dashboard View
          </Button>
          <Button
            variant={currentView === "logs" ? "contained" : "outlined"}
            onClick={() => setCurrentView("logs")}
            startIcon={<HistoryIcon />}
          >
            Full Activity Logs
          </Button>
        </Stack>
      </Box>

      {currentView === "dashboard" ? (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Dashboard - Recent Activity Demo
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <DashboardRecentActivity limit={5} showViewAll={true} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Quick Stats
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The View All button now properly navigates to the full
                    activity logs page.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <ActivityLogsPage />
      )}
    </Box>
  );
}
