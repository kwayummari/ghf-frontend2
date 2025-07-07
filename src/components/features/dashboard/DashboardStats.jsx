import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import {
  PeopleOutlined,
  EventNoteOutlined,
  AccessTimeOutlined,
  TrendingUpOutlined,
  CheckCircleOutlined,
  PendingOutlined,
  WarningOutlined,
  Create as CreateIcon,
  Update as UpdateIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../auth/AuthGuard";
import { ROUTES } from "../../../constants";
import { leavesAPI } from "../../../services/api/leaves.api";

// Import actual APIs
import { employeesAPI } from "../../../services/api/employees.api";
import attendanceAPI  from "../../../services/api/attendance.api";
import activityLogsAPI from "../../../services/api/activityLogs.api";

// Activity Icon Component
const ActivityIcon = ({ action, status }) => {
  if (status === "failed" || status === "error") {
    return <ErrorIcon sx={{ color: "error.main", fontSize: 20 }} />;
  }

  switch (action?.toLowerCase()) {
    case "create":
      return <CreateIcon sx={{ color: "success.main", fontSize: 20 }} />;
    case "update":
    case "edit":
      return <UpdateIcon sx={{ color: "warning.main", fontSize: 20 }} />;
    case "delete":
      return <DeleteIcon sx={{ color: "error.main", fontSize: 20 }} />;
    case "view":
    case "read":
      return <VisibilityIcon sx={{ color: "info.main", fontSize: 20 }} />;
    case "login":
      return <LoginIcon sx={{ color: "primary.main", fontSize: 20 }} />;
    case "logout":
      return <LogoutIcon sx={{ color: "secondary.main", fontSize: 20 }} />;
    default:
      return <InfoIcon sx={{ color: "grey.500", fontSize: 20 }} />;
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

// Format time ago utility
const formatTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
};

// Recent Activity Item Component
const ActivityItem = ({ activity }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      py: 2,
      borderBottom: "1px solid",
      borderColor: "divider",
      "&:last-child": {
        borderBottom: "none",
      },
    }}
  >
    <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
      <ActivityIcon action={activity.action} status={activity.status} />
    </Avatar>

    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
        {activity.description || activity.title || "System Activity"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {activity.user_name ? `by ${activity.user_name}` : "System"} •{" "}
        {activity.module || "General"}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatTimeAgo(activity.timestamp || activity.created_at)}
      </Typography>
    </Box>

    <Box sx={{ ml: 2 }}>
      <StatusChip status={activity.status} />
    </Box>
  </Box>
);

// Main Dashboard Stats Component
const DashboardStats = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { isAdmin, isHR, isManager } = useAuth();
  // const { showError } = useNotification();

  // Fetch employees data
  const {
    data: employeesResponse,
    isLoading: employeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees", "dashboard"],
    queryFn: () => employeesAPI.getAll({ limit: 1 }), // Just get count
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch leaves data
  const {
    data: leavesResponse,
    isLoading: leavesLoading,
    error: leavesError,
  } = useQuery({
    queryKey: ["leaves", "dashboard-stats"],
    queryFn: () => leavesAPI.getAll({ status: "pending", limit: 1 }), // Just get pending count
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch recent activities
  const {
    data: activitiesResponse,
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ["recent-activities", "dashboard"],
    queryFn: () => activityLogsAPI.getRecentActivities(5),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch attendance stats if user has permission
  const { data: attendanceResponse, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance", "dashboard-stats"],
    queryFn: () => attendanceAPI.getMyAttendance({ limit: 1 }),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate stats
  const totalEmployees =
    employeesResponse?.total || employeesResponse?.data?.length || 0;
  const pendingLeaves =
    leavesResponse?.total || leavesResponse?.data?.length || 0;
  const activities = activitiesResponse?.data || [];

  // Handle View All button click
  const handleViewAllActivities = () => {
    navigate(ROUTES.SETTINGS_AUDIT || "/settings/audit");
  };

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "Good morning";

    if (hour >= 12 && hour < 17) {
      greeting = "Good afternoon";
    } else if (hour >= 17) {
      greeting = "Good evening";
    }

    const firstName = user?.first_name || user?.name || "User";
    return `${greeting}, ${firstName}!`;
  };

  const handleQuickAction = (actionType) => {
    switch (actionType) {
      case "leave":
        navigate(ROUTES.LEAVE_CREATE || "/leaves/create");
        break;
      case "attendance":
        navigate(ROUTES.ATTENDANCE || "/attendance");
        break;
      case "employee":
        navigate(ROUTES.EMPLOYEE_CREATE || "/employees/create");
        break;
      case "approvals":
        navigate(ROUTES.LEAVE_APPROVALS || "/leaves/approvals");
        break;
      default:
        console.log("Action not defined:", actionType);
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          {getUserGreeting()}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your organization today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Employees */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 48,
                    height: 48,
                    mr: 2,
                  }}
                >
                  <PeopleOutlined />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {employeesLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      totalEmployees
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Leaves */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "warning.main",
                    width: 48,
                    height: 48,
                    mr: 2,
                  }}
                >
                  <EventNoteOutlined />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {leavesLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      pendingLeaves
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Leaves
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "success.main",
                    width: 48,
                    height: 48,
                    mr: 2,
                  }}
                >
                  <AccessTimeOutlined />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {attendanceLoading ? <CircularProgress size={20} /> : "94%"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "info.main",
                    width: 48,
                    height: 48,
                    mr: 2,
                  }}
                >
                  <TrendingUpOutlined />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Healthy
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    System Status
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<EventNoteOutlined />}
                  onClick={() => handleQuickAction("leave")}
                  fullWidth
                >
                  Apply for Leave
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AccessTimeOutlined />}
                  onClick={() => handleQuickAction("attendance")}
                  fullWidth
                >
                  Clock In/Out
                </Button>
                {(isAdmin || isHR) && (
                  <Button
                    variant="outlined"
                    startIcon={<PeopleOutlined />}
                    onClick={() => handleQuickAction("employee")}
                    fullWidth
                  >
                    Add Employee
                  </Button>
                )}
                {isManager && (
                  <Button
                    variant="outlined"
                    startIcon={<CheckCircleOutlined />}
                    onClick={() => handleQuickAction("approvals")}
                    fullWidth
                  >
                    Approve Requests
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Recent Activity
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleViewAllActivities}
                >
                  View All
                </Button>
              </Box>

              {/* Activity Content */}
              {activitiesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : activitiesError ? (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => refetchActivities()}
                      startIcon={<RefreshIcon />}
                    >
                      Retry
                    </Button>
                  }
                >
                  Failed to load recent activities.
                </Alert>
              ) : activities.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No recent activities found
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id || index}
                      activity={activity}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardStats;
