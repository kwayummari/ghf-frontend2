import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import {
  EventNote as LeaveIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const LeaveWidget = ({ leaveData }) => {
  const defaultData = {
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

  const data = { ...defaultData, ...leaveData };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved by supervisor":
        return "info";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LeaveIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Leave Requests
            </Typography>
          </Box>
          <Chip
            label={`${data.totalPending} Pending`}
            color="warning"
            size="small"
          />
        </Box>

        <List dense>
          {data.pendingRequests.map((request) => (
            <ListItem key={request.id} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={request.name}
                secondary={`${request.type} - ${request.days} day${request.days !== 1 ? "s" : ""}`}
              />
              <Chip
                label={formatStatus(request.status)}
                color={getStatusColor(request.status)}
                size="small"
                variant="outlined"
              />
            </ListItem>
          ))}
        </List>

        {data.pendingRequests.length === 0 && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No pending leave requests
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveWidget;
