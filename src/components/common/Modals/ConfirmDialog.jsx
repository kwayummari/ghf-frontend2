import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning", // 'warning', 'error', 'info', 'success'
  loading = false,
}) => {
  const getIcon = () => {
    const iconProps = { sx: { fontSize: 48, mb: 2 } };

    switch (variant) {
      case "error":
        return <ErrorIcon color="error" {...iconProps} />;
      case "success":
        return <SuccessIcon color="success" {...iconProps} />;
      case "info":
        return <InfoIcon color="info" {...iconProps} />;
      case "warning":
      default:
        return <WarningIcon color="warning" {...iconProps} />;
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case "error":
        return "error";
      case "success":
        return "success";
      case "info":
        return "info";
      case "warning":
      default:
        return "warning";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {getIcon()}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", pt: 0 }}>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          {cancelText}
        </Button>
        <LoadingButton
          onClick={onConfirm}
          variant="contained"
          color={getButtonColor()}
          loading={loading}
        >
          {confirmText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
