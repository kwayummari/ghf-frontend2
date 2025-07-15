// Create new file: src/components/features/leaves/LeaveBalanceWidget.jsx

import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

const LeaveBalanceWidget = ({
  balance,
  requestedDays = 0,
  loading = false,
  showRequested = true,
}) => {
  if (loading) {
    return (
      <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" height={6} sx={{ my: 1 }} />
        <Skeleton variant="text" width="40%" />
      </Box>
    );
  }

  if (!balance) {
    return (
      <Alert severity="info">
        No balance information available for this leave type.
      </Alert>
    );
  }

  const { leaveTypeName, allocated, used, remaining } = balance;
  const usagePercentage = (used / allocated) * 100;
  const afterRequestUsed = used + requestedDays;
  const afterRequestRemaining = remaining - requestedDays;
  const afterRequestPercentage = (afterRequestUsed / allocated) * 100;

  const getStatusColor = () => {
    if (showRequested && requestedDays > remaining) return "error";
    if (afterRequestPercentage > 90) return "warning";
    if (afterRequestPercentage > 70) return "info";
    return "success";
  };

  const getStatusIcon = () => {
    if (showRequested && requestedDays > remaining) return <ErrorIcon />;
    if (afterRequestPercentage > 90) return <WarningIcon />;
    return <CheckIcon />;
  };

  const getStatusMessage = () => {
    if (showRequested && requestedDays > remaining) {
      return `Insufficient balance! You need ${requestedDays - remaining} more days.`;
    }
    if (afterRequestPercentage > 90) {
      return "This will use most of your annual allocation.";
    }
    return "Balance looks good.";
  };

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor:
          showRequested && requestedDays > remaining ? "error.main" : "divider",
        borderRadius: 1,
        bgcolor:
          showRequested && requestedDays > remaining
            ? "error.50"
            : "background.paper",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {leaveTypeName} Balance
        </Typography>
        <Chip
          label={`${remaining} days left`}
          size="small"
          color={
            remaining > 5 ? "success" : remaining > 0 ? "warning" : "error"
          }
          variant="outlined"
        />
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(usagePercentage, 100)}
          color={
            usagePercentage > 90
              ? "error"
              : usagePercentage > 70
                ? "warning"
                : "primary"
          }
          sx={{ height: 8, borderRadius: 4 }}
        />
        {showRequested && requestedDays > 0 && (
          <LinearProgress
            variant="determinate"
            value={Math.min(afterRequestPercentage, 100)}
            color={getStatusColor()}
            sx={{
              height: 4,
              borderRadius: 2,
              mt: 0.5,
              opacity: 0.7,
            }}
          />
        )}
      </Box>

      {/* Usage Stats */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Used: {used}/{allocated} days
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {usagePercentage.toFixed(0)}% used
        </Typography>
      </Box>

      {/* Requested Days Preview */}
      {showRequested && requestedDays > 0 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              After this request: {afterRequestUsed}/{allocated} days
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {afterRequestPercentage.toFixed(0)}% used
            </Typography>
          </Box>

          <Alert
            severity={
              requestedDays > remaining
                ? "error"
                : afterRequestPercentage > 90
                  ? "warning"
                  : "info"
            }
            icon={getStatusIcon()}
            sx={{ mt: 1 }}
          >
            <Typography variant="caption">{getStatusMessage()}</Typography>
          </Alert>
        </>
      )}
    </Box>
  );
};

export default LeaveBalanceWidget;
