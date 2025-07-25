// src/pages/dashboard/DashboardPage.jsx
import React from "react";
import { Box, Grid } from "@mui/material";
import DashboardStats from "../../components/features/dashboard/DashboardStats";
// import DashboardRecentActivity from "../../components/features/dashboard/DashboardRecentActivity";
// import AttendanceWidget from "../../components/features/dashboard/AttendanceWidget";
// import LeaveWidget from "../../components/features/dashboard/LeaveWidget";
// import TaskWidget from "../../components/features/dashboard/TaskWidget";

const DashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Main Dashboard Stats */}
      <DashboardStats />

      {/* Additional Widgets */}
      {/* <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <AttendanceWidget />
        </Grid>
        <Grid item xs={12} md={4}>
          <LeaveWidget />
        </Grid>
        <Grid item xs={12} md={4}>
          <TaskWidget />
        </Grid>
      </Grid> */}
    </Box>
  );
};

export default DashboardPage;
