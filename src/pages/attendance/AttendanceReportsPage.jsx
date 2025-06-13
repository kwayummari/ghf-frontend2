import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AttendanceReportsPage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Attendance Reports
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Comprehensive attendance reports and analytics will be implemented here.
      </Typography>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </Box>
  );
};

export default AttendanceReportsPage;
