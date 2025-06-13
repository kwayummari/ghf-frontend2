import React from "react";
import { Alert, AlertTitle, Box, Button } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

const ErrorMessage = ({
  error,
  title = "Error",
  message,
  showRefresh = false,
  onRefresh,
  variant = "error",
  ...props
}) => {
  const getErrorMessage = () => {
    if (message) return message;
    if (error?.message) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred";
  };

  return (
    <Box sx={{ my: 2 }}>
      <Alert severity={variant} {...props}>
        <AlertTitle>{title}</AlertTitle>
        {getErrorMessage()}
        {showRefresh && onRefresh && (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              variant="outlined"
              color={variant}
            >
              Try Again
            </Button>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
