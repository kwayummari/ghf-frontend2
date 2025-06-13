import React from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  Divider,
} from "@mui/material";

const PersonalInfoForm = ({ formik }) => {
  const relationshipOptions = [
    { value: "Parent", label: "Parent" },
    { value: "Spouse", label: "Spouse" },
    { value: "Sibling", label: "Sibling" },
    { value: "Child", label: "Child" },
    { value: "Friend", label: "Friend" },
    { value: "Relative", label: "Relative" },
    { value: "Other", label: "Other" },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: "medium" }}>
        Personal Information
      </Typography>

      {/* Address Information */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Address Information
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="address"
            label="Residential Address"
            multiline
            rows={3}
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
            placeholder="Enter full address including street, ward, district, and region"
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Emergency Contact */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Emergency Contact
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="emergency_contact_name"
            label="Emergency Contact Name"
            value={formik.values.emergency_contact_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.emergency_contact_name &&
              Boolean(formik.errors.emergency_contact_name)
            }
            helperText={
              formik.touched.emergency_contact_name &&
              formik.errors.emergency_contact_name
            }
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="emergency_contact_phone"
            label="Emergency Contact Phone"
            value={formik.values.emergency_contact_phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.emergency_contact_phone &&
              Boolean(formik.errors.emergency_contact_phone)
            }
            helperText={
              formik.touched.emergency_contact_phone &&
              formik.errors.emergency_contact_phone
            }
            placeholder="+255 XXX XXX XXX"
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            name="emergency_contact_relationship"
            label="Relationship"
            value={formik.values.emergency_contact_relationship}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.emergency_contact_relationship &&
              Boolean(formik.errors.emergency_contact_relationship)
            }
            helperText={
              formik.touched.emergency_contact_relationship &&
              formik.errors.emergency_contact_relationship
            }
            required
          >
            {relationshipOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Next of Kin */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Next of Kin (Optional)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="next_of_kin_name"
            label="Next of Kin Name"
            value={formik.values.next_of_kin_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.next_of_kin_name &&
              Boolean(formik.errors.next_of_kin_name)
            }
            helperText={
              formik.touched.next_of_kin_name && formik.errors.next_of_kin_name
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="next_of_kin_phone"
            label="Next of Kin Phone"
            value={formik.values.next_of_kin_phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.next_of_kin_phone &&
              Boolean(formik.errors.next_of_kin_phone)
            }
            helperText={
              formik.touched.next_of_kin_phone &&
              formik.errors.next_of_kin_phone
            }
            placeholder="+255 XXX XXX XXX"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            name="next_of_kin_relationship"
            label="Relationship"
            value={formik.values.next_of_kin_relationship}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.next_of_kin_relationship &&
              Boolean(formik.errors.next_of_kin_relationship)
            }
            helperText={
              formik.touched.next_of_kin_relationship &&
              formik.errors.next_of_kin_relationship
            }
          >
            {relationshipOptions.map((option) => (
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

export default PersonalInfoForm;
