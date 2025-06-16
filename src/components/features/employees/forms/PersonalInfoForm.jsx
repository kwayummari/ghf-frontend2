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

  // ADDED: Education level options
  const educationLevels = [
    { value: "Primary", label: "Primary Education" },
    { value: "Secondary", label: "Secondary Education" },
    { value: "Certificate", label: "Certificate" },
    { value: "Diploma", label: "Diploma" },
    { value: "Degree", label: "Bachelor's Degree" },
    { value: "Masters", label: "Master's Degree" },
    { value: "PhD", label: "PhD/Doctorate" },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: "medium" }}>
        Personal Information
      </Typography>

      {/* Location & Education */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Location & Education
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            name="personalEmployeeData.location"
            label="Location/City"
            value={formik.values.personalEmployeeData?.location || ""}
            onChange={(e) =>
              formik.setFieldValue(
                "personalEmployeeData.location",
                e.target.value
              )
            }
            onBlur={formik.handleBlur}
            error={
              formik.touched.personalEmployeeData?.location &&
              Boolean(formik.errors.personalEmployeeData?.location)
            }
            helperText={
              formik.touched.personalEmployeeData?.location &&
              formik.errors.personalEmployeeData?.location
            }
            placeholder="e.g., Dar es Salaam, Dodoma"
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            select
            name="personalEmployeeData.education_level"
            label="Education Level"
            value={formik.values.personalEmployeeData?.education_level || ""}
            onChange={(e) =>
              formik.setFieldValue(
                "personalEmployeeData.education_level",
                e.target.value
              )
            }
            onBlur={formik.handleBlur}
            error={
              formik.touched.personalEmployeeData?.education_level &&
              Boolean(formik.errors.personalEmployeeData?.education_level)
            }
            helperText={
              formik.touched.personalEmployeeData?.education_level &&
              formik.errors.personalEmployeeData?.education_level
            }
            required
          >
            {educationLevels.map((level) => (
              <MenuItem key={level.value} value={level.value}>
                {level.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

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
            value={formik.values.address || ""}
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
            value={formik.values.emergency_contact_name || ""}
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
            placeholder="Full name of emergency contact"
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="emergency_contact_phone"
            label="Emergency Contact Phone"
            value={formik.values.emergency_contact_phone || ""}
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
            value={formik.values.emergency_contact_relationship || ""}
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
            value={formik.values.next_of_kin_name || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.next_of_kin_name &&
              Boolean(formik.errors.next_of_kin_name)
            }
            helperText={
              formik.touched.next_of_kin_name && formik.errors.next_of_kin_name
            }
            placeholder="Full name (optional)"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="next_of_kin_phone"
            label="Next of Kin Phone"
            value={formik.values.next_of_kin_phone || ""}
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
            value={formik.values.next_of_kin_relationship || ""}
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
            <MenuItem value="">
              <em>Select relationship</em>
            </MenuItem>
            {relationshipOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
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
        <Typography variant="body2" color="#ffffff">
          <strong>Information Guidelines:</strong>
          <br />
          • Location should be the city/region where the employee resides
          <br />
          • Education level helps determine job qualifications and training
          needs
          <br />
          • Emergency contact information is critical for workplace safety
          <br />• Next of kin information is optional but recommended
        </Typography>
      </Box>
    </Box>
  );
};

export default PersonalInfoForm;
