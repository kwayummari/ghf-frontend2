import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DepartmentDetailsPage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Department Details
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Detailed department information and employee lists will be implemented
        here.
      </Typography>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </Box>
  );
};

export default DepartmentDetailsPage;
