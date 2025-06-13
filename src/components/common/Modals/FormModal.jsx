import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Close as CloseIcon } from "@mui/icons-material";

const FormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  disabled = false,
  maxWidth = "md",
  fullWidth = true,
  showActions = true,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
      {...props}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="span">
            {title}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} id="form-modal">
          {children}
        </Box>
      </DialogContent>

      {showActions && (
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            {cancelText}
          </Button>
          <LoadingButton
            type="submit"
            form="form-modal"
            variant="contained"
            loading={loading}
            disabled={disabled}
          >
            {submitText}
          </LoadingButton>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default FormModal;
