import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  AccountBalance,
  Receipt,
  Inventory,
  FlightTakeoff,
  // MoneyOff,
  RequestQuote,
  TrendingUp,
  Assessment,
  // Maintenance,
  LocalAtm,
  // ExpenseReports,
} from "@mui/icons-material";

const FinancePage = () => {
  const navigate = useNavigate();

  const financeModules = [
    {
      title: "Payroll Management",
      description: "Complete payroll processing and management",
      icon: <Receipt color="primary" />,
      color: "#1976d2",
      shortcuts: [
        { label: "Payroll Overview", path: "/finance/payroll" },
        { label: "Process Payroll", path: "/finance/payroll/process" },
        { label: "Payroll History", path: "/finance/payroll/history" },
        { label: "Salary Components", path: "/finance/payroll/components" },
      ],
    },
    {
      title: "Budget Management",
      description: "Plan, monitor and analyze organizational budgets",
      icon: <AccountBalance color="success" />,
      color: "#2e7d32",
      shortcuts: [
        { label: "Budget Overview", path: "/finance/budgets" },
        { label: "Budget Planning", path: "/finance/budgets/planning" },
        { label: "Budget Monitoring", path: "/finance/budgets/monitoring" },
        { label: "Variance Analysis", path: "/finance/budgets/variance" },
      ],
    },
    {
      title: "Asset Management",
      description: "Track and manage organizational assets",
      icon: <Inventory color="warning" />,
      color: "#ed6c02",
      shortcuts: [
        { label: "Assets Overview", path: "/finance/assets" },
        { label: "Asset Register", path: "/finance/assets/register" },
        { label: "Depreciation", path: "/finance/assets/depreciation" },
        { label: "Maintenance", path: "/finance/assets/maintenance" },
      ],
    },
    {
      title: "Travel & Advances",
      description: "Manage travel requests, advances and expenses",
      icon: <FlightTakeoff color="info" />,
      color: "#0288d1",
      shortcuts: [
        { label: "Travel Requests", path: "/finance/travel/requests" },
        { label: "Travel Advances", path: "/finance/travel/advances" },
        { label: "Expense Reports", path: "/finance/travel/expenses" },
      ],
    },
    {
      title: "Petty Cash Management",
      description: "Handle petty cash expenses and replenishments",
      icon: <LocalAtm color="secondary" />,
      color: "#9c27b0",
      shortcuts: [
        { label: "Petty Cash Overview", path: "/finance/petty-cash" },
        { label: "Cash Expenses", path: "/finance/petty-cash/expenses" },
        { label: "Replenishment", path: "/finance/petty-cash/replenishment" },
      ],
    },
    {
      title: "Requisitions",
      description: "Handle purchase requests and approvals",
      icon: <RequestQuote color="error" />,
      color: "#d32f2f",
      shortcuts: [
        { label: "View Requisitions", path: "/finance/requisitions" },
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Finance Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive financial management system for GH Foundation
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f3e5f5", borderLeft: "4px solid #9c27b0" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" color="#9c27b0">
                6
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Finance Modules
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#e3f2fd", borderLeft: "4px solid #1976d2" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" color="#1976d2">
                17
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Finance Features
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#e8f5e8", borderLeft: "4px solid #2e7d32" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" color="#2e7d32">
                Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System Status
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#fff3e0", borderLeft: "4px solid #ed6c02" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" color="#ed6c02">
                Live
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time Data
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Finance Modules */}
      <Grid container spacing={3}>
        {financeModules.map((module, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card
              sx={{
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
                borderTop: `4px solid ${module.color}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Module Header */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {module.icon}
                  <Typography
                    variant="h6"
                    sx={{ ml: 1, fontWeight: 600, color: module.color }}
                  >
                    {module.title}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {module.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Shortcuts */}
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Quick Access:
                </Typography>
                <Stack spacing={1}>
                  {module.shortcuts.map((shortcut, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => navigate(shortcut.path)}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        borderColor: module.color,
                        color: module.color,
                        "&:hover": {
                          backgroundColor: `${module.color}10`,
                          borderColor: module.color,
                        },
                      }}
                    >
                      {shortcut.label}
                    </Button>
                  ))}
                </Stack>

                {/* Module Count Badge */}
                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Chip
                    label={`${module.shortcuts.length} features`}
                    size="small"
                    sx={{
                      backgroundColor: `${module.color}20`,
                      color: module.color,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer Actions */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => navigate("/reports")}
            sx={{ flex: 1 }}
          >
            View Financial Reports
          </Button>
          <Button
            variant="outlined"
            startIcon={<TrendingUp />}
            onClick={() => navigate("/finance/budgets/monitoring")}
            sx={{ flex: 1 }}
          >
            Budget Performance
          </Button>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={() => navigate("/finance/payroll/process")}
            sx={{ flex: 1 }}
          >
            Process Payroll
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default FinancePage;
