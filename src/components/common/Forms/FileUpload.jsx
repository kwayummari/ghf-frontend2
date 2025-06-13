import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";

const FileUpload = ({
  files = [],
  onFilesChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = {
    "image/*": [".jpeg", ".jpg", ".png"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  },
  error,
  helperText,
}) => {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        console.warn("Some files were rejected:", rejectedFiles);
      }

      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      onFilesChange(newFiles);
    },
    [files, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    maxFiles: maxFiles - files.length,
  });

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed",
          borderColor: error
            ? "error.main"
            : isDragActive
              ? "primary.main"
              : "grey.300",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: isDragActive ? "action.hover" : "background.default",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "action.hover",
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: "grey.500", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or
        </Typography>
        <Button variant="outlined" component="span">
          Browse Files
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Max {maxFiles} files, {formatFileSize(maxSize)} each
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {helperText}
        </Alert>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Files ({files.length}/{maxFiles})
          </Typography>
          <List dense>
            {files.map((file, index) => (
              <ListItem key={index} divider>
                <FileIcon sx={{ mr: 2, color: "primary.main" }} />
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeFile(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
