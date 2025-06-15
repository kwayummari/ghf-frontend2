import React from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const BioDataForm = ({ formik }) => {
  const maritalStatusOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
    { value: "separated", label: "Separated" },
  ];

  const bloodGroupOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  // Helper function to get nested field value
  const getFieldValue = (fieldName) => {
    return formik.values.bioData?.[fieldName] || "";
  };

  // Helper function to handle nested field changes
  const handleNestedChange = (fieldName) => (event) => {
    const value = event.target.value;
    formik.setFieldValue(`bioData.${fieldName}`, value);
  };

  // Helper function to handle date changes
  const handleDateChange = (fieldName) => (value) => {
    formik.setFieldValue(`bioData.${fieldName}`, value);
  };

  // Helper function to get nested field error
  const getFieldError = (fieldName) => {
    return (
      formik.touched.bioData?.[fieldName] &&
      Boolean(formik.errors.bioData?.[fieldName])
    );
  };

  // Helper function to get nested field helper text
  const getFieldHelperText = (fieldName) => {
    return (
      formik.touched.bioData?.[fieldName] && formik.errors.bioData?.[fieldName]
    );
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: "medium" }}>
        Bio Data Information
      </Typography>

      {/* Personal Bio Data */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Personal Details
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <DatePicker
            label="Date of Birth"
            value={getFieldValue("dob") ? new Date(getFieldValue("dob")) : null}
            onChange={handleDateChange("dob")}
            slotProps={{
              textField: {
                fullWidth: true,
                name: "bioData.dob",
                onBlur: formik.handleBlur,
                error: getFieldError("dob"),
                helperText: getFieldHelperText("dob"),
                required: true,
              },
            }}
            maxDate={new Date()}
            minDate={new Date("1940-01-01")}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            name="bioData.marital_status"
            label="Marital Status"
            value={getFieldValue("marital_status")}
            onChange={handleNestedChange("marital_status")}
            onBlur={formik.handleBlur}
            error={getFieldError("marital_status")}
            helperText={getFieldHelperText("marital_status")}
          >
            {maritalStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            name="bioData.blood_group"
            label="Blood Group"
            value={getFieldValue("blood_group")}
            onChange={handleNestedChange("blood_group")}
            onBlur={formik.handleBlur}
            error={getFieldError("blood_group")}
            helperText={getFieldHelperText("blood_group")}
          >
            {bloodGroupOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Identification Information */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Identification Information
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="bioData.national_id"
            label="National ID Number"
            value={getFieldValue("national_id")}
            onChange={handleNestedChange("national_id")}
            onBlur={formik.handleBlur}
            error={getFieldError("national_id")}
            helperText={getFieldHelperText("national_id")}
            placeholder="e.g., 19851205-12345-67890-12"
            inputProps={{ maxLength: 20 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="bioData.fingerprint_id"
            label="Fingerprint ID"
            value={getFieldValue("fingerprint_id")}
            onChange={handleNestedChange("fingerprint_id")}
            onBlur={formik.handleBlur}
            error={getFieldError("fingerprint_id")}
            helperText={getFieldHelperText("fingerprint_id")}
            placeholder="Biometric fingerprint identifier"
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Additional Information */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Additional Information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="bioData.signature"
            label="Digital Signature"
            value={getFieldValue("signature")}
            onChange={handleNestedChange("signature")}
            onBlur={formik.handleBlur}
            error={getFieldError("signature")}
            helperText={getFieldHelperText("signature")}
            placeholder="Digital signature or signature description"
            multiline
            rows={2}
          />
        </Grid>
      </Grid>

      {/* Information Note */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: "info.light",
          color: "#ffffff",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="info.white">
          <strong>Bio Data Information:</strong>
          <br />
          • Date of birth is required for age verification and employment
          eligibility
          <br />
          • National ID helps with official identification and government record
          matching
          <br />
          • Fingerprint ID is used for biometric authentication systems
          <br />• All personal information is kept confidential and secure
        </Typography>
      </Box>
    </Box>
  );
};

export default BioDataForm;
