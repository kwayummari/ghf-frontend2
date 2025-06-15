import React from "react";
import { Grid, TextField, MenuItem, Typography, Box } from "@mui/material";

const BasicInfoForm = ({ formik }) => {
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on leave", label: "On Leave" },
    { value: "terminated", label: "Terminated" },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: "medium" }}>
        Basic Information
      </Typography>

      <Grid container spacing={3}>
        {/* Names */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="first_name"
            label="First Name"
            value={formik.values.first_name || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.first_name && Boolean(formik.errors.first_name)
            }
            helperText={formik.touched.first_name && formik.errors.first_name}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="middle_name"
            label="Middle Name"
            value={formik.values.middle_name || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.middle_name && Boolean(formik.errors.middle_name)
            }
            helperText={formik.touched.middle_name && formik.errors.middle_name}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="sur_name"
            label="Surname"
            value={formik.values.sur_name || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.sur_name && Boolean(formik.errors.sur_name)}
            helperText={formik.touched.sur_name && formik.errors.sur_name}
            required
          />
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="email"
            label="Email Address"
            type="email"
            value={formik.values.email || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="phone_number"
            label="Phone Number"
            value={formik.values.phone_number || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.phone_number && Boolean(formik.errors.phone_number)
            }
            helperText={
              formik.touched.phone_number && formik.errors.phone_number
            }
            placeholder="+255 XXX XXX XXX"
            required
          />
        </Grid>

        {/* Personal Details */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="gender"
            label="Gender"
            value={formik.values.gender || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.gender && Boolean(formik.errors.gender)}
            helperText={formik.touched.gender && formik.errors.gender}
            required
          >
            {genderOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="status"
            label="Account Status"
            value={formik.values.status || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.status && Boolean(formik.errors.status)}
            helperText={formik.touched.status && formik.errors.status}
            required
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BasicInfoForm;
