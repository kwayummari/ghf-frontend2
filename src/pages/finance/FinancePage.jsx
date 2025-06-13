import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const FinancePage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Finance Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Budgets
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Manage organizational budgets and allocations
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/finance/budgets")}
              >
                View Budgets
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Assets
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Track and manage organizational assets
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/finance/assets")}
              >
                View Assets
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Requisitions
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Handle purchase requests and approvals
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/finance/requisitions")}
              >
                View Requisitions
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancePage;
