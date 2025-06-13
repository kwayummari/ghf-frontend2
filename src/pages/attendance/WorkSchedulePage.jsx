import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const WorkSchedulePage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Work Schedule Management
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Work schedule configuration and holiday management will be implemented
        here.
      </Typography>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </Box>
  );
};

export default WorkSchedulePage;
