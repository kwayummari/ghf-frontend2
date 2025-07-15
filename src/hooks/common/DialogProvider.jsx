// src/components/common/DialogProvider.jsx
import React, { createContext, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  CircularProgress,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import { useDialog } from "../../hooks/useDialog";

// Create context for dialog
const DialogContext = createContext(null);

// Dialog Provider Component
export const DialogProvider = ({ children }) => {
  const {
    dialogState,
    closeDialog,
    handleConfirm,
    handleCancel,
    openDialog,
    confirm,
    alert,
    danger,
    warning,
  } = useDialog();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Get variant styles
  const getVariantConfig = (variant) => {
    switch (variant) {
      case "danger":
        return {
          color: "error.main",
          icon: <ErrorIcon color="error" />,
          confirmColor: "error",
        };
      case "warning":
        return {
          color: "warning.main",
          icon: <WarningIcon color="warning" />,
          confirmColor: "warning",
        };
      case "info":
        return {
          color: "info.main",
          icon: <InfoIcon color="info" />,
          confirmColor: "info",
        };
      case "success":
        return {
          color: "success.main",
          icon: <SuccessIcon color="success" />,
          confirmColor: "success",
        };
      default:
        return {
          color: "primary.main",
          icon: null,
          confirmColor: "primary",
        };
    }
  };

  const variantConfig = getVariantConfig(dialogState.variant);

  const contextValue = {
    openDialog,
    closeDialog,
    confirm,
    alert,
    danger,
    warning,
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}

      {/* Global Dialog Component */}
      <Dialog
        open={dialogState.open}
        onClose={dialogState.showCancel ? handleCancel : undefined}
        fullScreen={fullScreen}
        fullWidth={dialogState.fullWidth}
        maxWidth={dialogState.maxWidth}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        disableEscapeKeyDown={dialogState.loading}
      >
        <DialogTitle id="dialog-title">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {variantConfig.icon}
            <Typography variant="h6" component="span">
              {dialogState.title}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="dialog-description">
            {dialogState.message}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          {dialogState.showCancel && (
            <Button
              onClick={handleCancel}
              disabled={dialogState.loading}
              color="inherit"
            >
              {dialogState.cancelLabel}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={dialogState.loading}
            variant="contained"
            color={variantConfig.confirmColor}
            startIcon={
              dialogState.loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            {dialogState.loading ? "Processing..." : dialogState.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
};

// Hook to use dialog context
export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext must be used within a DialogProvider");
  }
  return context;
};

// Export the hook for backward compatibility
export { useDialog };
