import React from "react";
import { Grid, TextField, MenuItem, Typography, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const BasicInfoForm = ({ formik }) => {
  const genderOptions = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
  ];

  const maritalStatusOptions = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
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
            value={formik.values.first_name}
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
            value={formik.values.middle_name}
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
            value={formik.values.sur_name}
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
            value={formik.values.email}
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
            name="phone"
            label="Phone Number"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
            placeholder="+255 XXX XXX XXX"
            required
          />
        </Grid>

        {/* Personal Details */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            name="gender"
            label="Gender"
            value={formik.values.gender}
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

        <Grid item xs={12} md={4}>
          <DatePicker
            label="Date of Birth"
            value={formik.values.date_of_birth}
            onChange={(value) => formik.setFieldValue("date_of_birth", value)}
            slotProps={{
              textField: {
                fullWidth: true,
                name: "date_of_birth",
                onBlur: formik.handleBlur,
                error:
                  formik.touched.date_of_birth &&
                  Boolean(formik.errors.date_of_birth),
                helperText:
                  formik.touched.date_of_birth && formik.errors.date_of_birth,
                required: true,
              },
            }}
            maxDate={new Date()}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            name="marital_status"
            label="Marital Status"
            value={formik.values.marital_status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.marital_status &&
              Boolean(formik.errors.marital_status)
            }
            helperText={
              formik.touched.marital_status && formik.errors.marital_status
            }
          >
            {maritalStatusOptions.map((option) => (
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
