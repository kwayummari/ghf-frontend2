import React from "react";
import { TextField, FormControl, FormHelperText } from "@mui/material";

const FormField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  type = "text",
  multiline = false,
  rows = 1,
  disabled = false,
  ...props
}) => {
  return (
    <FormControl fullWidth error={error}>
      <TextField
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        type={type}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        disabled={disabled}
        required={required}
        error={error}
        helperText={helperText}
        variant="outlined"
        size="small"
        {...props}
      />
    </FormControl>
  );
};

export default FormField;
