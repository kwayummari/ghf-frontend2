import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { AccessTime as ClockIcon } from "@mui/icons-material";

const AttendanceWidget = ({ attendanceData }) => {
  const defaultData = {
    todayPresent: 142,
    totalEmployees: 156,
    onLeave: 8,
    absent: 6,
    lateArrivals: 3,
  };

  const data = { ...defaultData, ...attendanceData };
  const attendanceRate = (
    (data.todayPresent / data.totalEmployees) *
    100
  ).toFixed(1);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ClockIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Today's Attendance
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Present Rate
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {attendanceRate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={parseFloat(attendanceRate)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <List dense>
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="Present"
              secondary={`${data.todayPresent} employees`}
            />
            <Typography variant="h6" color="success.main">
              {data.todayPresent}
            </Typography>
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="On Leave"
              secondary={`${data.onLeave} employees`}
            />
            <Typography variant="h6" color="warning.main">
              {data.onLeave}
            </Typography>
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="Absent"
              secondary={`${data.absent} employees`}
            />
            <Typography variant="h6" color="error.main">
              {data.absent}
            </Typography>
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="Late Arrivals"
              secondary={`${data.lateArrivals} employees`}
            />
            <Typography variant="h6" color="info.main">
              {data.lateArrivals}
            </Typography>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default AttendanceWidget;
