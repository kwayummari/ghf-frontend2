// src/components/features/dashboard/DashboardRecentActivity.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
} from "@mui/material";
import {
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Create as CreateIcon,
  Update as UpdateIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
// import { useNotification } from "../../common/NotificationProvider";
import activityLogsAPI from "../../../services/api/activityLogs.api";

// Activity Item Component (inline - no separate file needed)
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (action, status) => {
    if (status === "failed" || status === "error") {
      return <ErrorIcon sx={{ color: "error.main" }} />;
    }

    switch (action?.toLowerCase()) {
      case "create":
        return <CreateIcon sx={{ color: "success.main" }} />;
      case "update":
      case "edit":
        return <UpdateIcon sx={{ color: "warning.main" }} />;
      case "delete":
        return <DeleteIcon sx={{ color: "error.main" }} />;
      case "view":
      case "read":
        return <VisibilityIcon sx={{ color: "info.main" }} />;
      case "login":
        return <LoginIcon sx={{ color: "primary.main" }} />;
      case "logout":
        return <LogoutIcon sx={{ color: "secondary.main" }} />;
      default:
        return <InfoIcon sx={{ color: "grey.500" }} />;
    }
  };

  const getStatusChip = (status) => {
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
        return (
          <Chip label={status || "Unknown"} color="default" size="small" />
        );
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString();
  };

  return (
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
        {getActivityIcon(activity.action, activity.status)}
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

      <Box sx={{ ml: 2 }}>{getStatusChip(activity.status)}</Box>
    </Box>
  );
};

// Main Dashboard Recent Activity Component
const DashboardRecentActivity = ({ limit = 5, showViewAll = true }) => {
  const navigate = useNavigate();
//   const { showError } = useNotification();

  const {
    data: activitiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recent-activities", limit],
    queryFn: () => activityLogsAPI.getRecentActivities(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });

  const handleViewAll = () => {
    navigate("/settings/audit");
  };

  const activities = activitiesData?.data || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load recent activities. Please try again.
          </Alert>
          <Button onClick={() => refetch()} startIcon={<RefreshIcon />}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
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
          {showViewAll && (
            <Button variant="outlined" size="small" onClick={handleViewAll}>
              View All
            </Button>
          )}
        </Box>

        {activities.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <HistoryIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="body1" color="text.secondary">
              No recent activities found
            </Typography>
          </Box>
        ) : (
          <Box>
            {activities.map((activity, index) => (
              <ActivityItem key={activity.id || index} activity={activity} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardRecentActivity;
