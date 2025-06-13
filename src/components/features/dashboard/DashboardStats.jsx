// src/pages/dashboard/DashboardPage.jsx
import React from "react";
import { useSelector } from "react-redux";
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
  WarningOutlined,
} from "@mui/icons-material";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";

// Import the dashboard components
import DashboardStats from "../../components/features/dashboard/DashboardStats";
import AttendanceWidget from "../../components/features/dashboard/AttendanceWidget";
import LeaveWidget from "../../components/features/dashboard/LeaveWidget";
import TaskWidget from "../../components/features/dashboard/TaskWidget";

// Quick Action Card Component
const QuickActionCard = ({
  title,
  description,
  icon,
  action,
  color = "primary",
}) => (
  <Card sx={{ height: "100%", cursor: "pointer" }} onClick={action}>
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
        status === "Approved"
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

  const attendanceData = {
    todayPresent: 142,
    totalEmployees: 156,
    onLeave: 8,
    absent: 6,
    lateArrivals: 3,
  };

  const leaveData = {
    pendingRequests: [
      {
        id: 1,
        name: "John Doe",
        type: "Annual Leave",
        days: 5,
        status: "pending",
      },
      {
        id: 2,
        name: "Jane Smith",
        type: "Sick Leave",
        days: 2,
        status: "pending",
      },
      {
        id: 3,
        name: "Bob Wilson",
        type: "Emergency Leave",
        days: 1,
        status: "approved by supervisor",
      },
    ],
    totalPending: 3,
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
      <Box sx={{ mb: 4 }}>
        <DashboardStats stats={statsData} />
      </Box>

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
                    action={() => console.log("Navigate to leave application")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <QuickActionCard
                    title="Clock In/Out"
                    description="Record your attendance"
                    icon={<AccessTimeOutlined />}
                    color="success"
                    action={() => console.log("Navigate to attendance")}
                  />
                </Grid>
                {(isAdmin || isHR) && (
                  <Grid item xs={12}>
                    <QuickActionCard
                      title="Add Employee"
                      description="Register a new employee"
                      icon={<PeopleOutlined />}
                      color="secondary"
                      action={() => console.log("Navigate to add employee")}
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
                      action={() => console.log("Navigate to approvals")}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Widget */}
        <Grid item xs={12} md={4}>
          <AttendanceWidget attendanceData={attendanceData} />
        </Grid>

        {/* Leave Widget */}
        <Grid item xs={12} md={4}>
          <LeaveWidget leaveData={leaveData} />
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

        {/* Tasks Widget */}
        <Grid item xs={12} md={4}>
          <TaskWidget />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
