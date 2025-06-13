import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
} from "@mui/material";
import {
  PeopleOutlined,
  EventNoteOutlined,
  AccessTimeOutlined,
  TrendingUpOutlined,
  CheckCircleOutlined,
  PendingOutlined,
} from "@mui/icons-material";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES } from "../../constants";

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon,
  color = "primary",
  trend,
  trendValue,
}) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: `${color}.main` }}
          >
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {title}
          </Typography>
          {trend && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <TrendingUpOutlined
                sx={{
                  fontSize: 16,
                  color: trend === "up" ? "success.main" : "error.main",
                  mr: 0.5,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: trend === "up" ? "success.main" : "error.main",
                  fontWeight: "medium",
                }}
              >
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: 56,
            height: 56,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Quick Action Card Component
const QuickActionCard = ({
  title,
  description,
  icon,
  action,
  color = "primary",
}) => (
  <Card
    sx={{
      height: "100%",
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: 4,
      },
    }}
    onClick={action}
  >
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: 40,
            height: 40,
            mr: 2,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: "medium" }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

// Recent Activity Item Component
const ActivityItem = ({ title, description, time, status }) => (
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
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {time}
      </Typography>
    </Box>
    <Chip
      label={status}
      size="small"
      color={
        status === "Approved" || status === "Completed"
          ? "success"
          : status === "Pending"
            ? "warning"
            : status === "Rejected"
              ? "error"
              : "default"
      }
    />
  </Box>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { isAdmin, isHR, isManager } = useAuth();

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "Good morning";

    if (hour >= 12 && hour < 17) {
      greeting = "Good afternoon";
    } else if (hour >= 17) {
      greeting = "Good evening";
    }

    const firstName = user?.first_name || "User";
    return `${greeting}, ${firstName}!`;
  };

  // Sample data - replace with real data from APIs
  const statsData = {
    totalEmployees: 156,
    activeLeaves: 8,
    pendingApprovals: 5,
    attendanceRate: "94%",
  };

  const recentActivities = [
    {
      title: "Leave Request Submitted",
      description: "John Doe submitted a sick leave request",
      time: "2 hours ago",
      status: "Pending",
    },
    {
      title: "Budget Approved",
      description: "Q1 2024 marketing budget has been approved",
      time: "4 hours ago",
      status: "Approved",
    },
    {
      title: "New Employee Onboarded",
      description: "Sarah Wilson joined the Development team",
      time: "1 day ago",
      status: "Completed",
    },
    {
      title: "Attendance Report Generated",
      description: "Monthly attendance report for December 2023",
      time: "2 days ago",
      status: "Completed",
    },
  ];

  const handleQuickAction = (actionType) => {
    switch (actionType) {
      case "leave":
        navigate(ROUTES.LEAVE_CREATE);
        break;
      case "attendance":
        navigate(ROUTES.ATTENDANCE);
        break;
      case "employee":
        navigate(ROUTES.EMPLOYEE_CREATE);
        break;
      case "approvals":
        navigate(ROUTES.LEAVE_APPROVALS);
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
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Employees"
            value={statsData.totalEmployees}
            icon={<PeopleOutlined />}
            color="primary"
            trend="up"
            trendValue="+12 this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Leaves"
            value={statsData.activeLeaves}
            icon={<EventNoteOutlined />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Approvals"
            value={statsData.pendingApprovals}
            icon={<PendingOutlined />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Attendance Rate"
            value={statsData.attendanceRate}
            icon={<AccessTimeOutlined />}
            color="success"
            trend="up"
            trendValue="+2% from last month"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <QuickActionCard
                    title="Apply for Leave"
                    description="Submit a new leave request"
                    icon={<EventNoteOutlined />}
                    color="primary"
                    action={() => handleQuickAction("leave")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <QuickActionCard
                    title="Clock In/Out"
                    description="Record your attendance"
                    icon={<AccessTimeOutlined />}
                    color="success"
                    action={() => handleQuickAction("attendance")}
                  />
                </Grid>
                {(isAdmin || isHR) && (
                  <Grid item xs={12}>
                    <QuickActionCard
                      title="Add Employee"
                      description="Register a new employee"
                      icon={<PeopleOutlined />}
                      color="secondary"
                      action={() => handleQuickAction("employee")}
                    />
                  </Grid>
                )}
                {isManager && (
                  <Grid item xs={12}>
                    <QuickActionCard
                      title="Approve Requests"
                      description="Review pending approvals"
                      icon={<CheckCircleOutlined />}
                      color="warning"
                      action={() => handleQuickAction("approvals")}
                    />
                  </Grid>
                )}
              </Grid>
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
                <Button variant="outlined" size="small">
                  View All
                </Button>
              </Box>
              <Box>
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    status={activity.status}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
