import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  Divider,
  Autocomplete,
} from "@mui/material";

const EmploymentDataForm = ({ formik }) => {
  // Mock data - replace with actual API calls
  const [departments, setDepartments] = useState([
    { id: 1, department_name: "Human Resources" },
    { id: 2, department_name: "Finance" },
    { id: 3, department_name: "IT" },
    { id: 4, department_name: "Marketing" },
    { id: 5, department_name: "Operations" },
  ]);

  const [supervisors, setSupervisors] = useState([
    { id: 1, first_name: "John", middle_name: "", sur_name: "Doe" },
    { id: 2, first_name: "Jane", middle_name: "Mary", sur_name: "Smith" },
    { id: 3, first_name: "Charlie", middle_name: "", sur_name: "Brown" },
  ]);

  const employmentTypeOptions = [
    { value: "full time", label: "Full Time" },
    { value: "part time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "intern", label: "Intern" },
    { value: "consultant", label: "Consultant" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on leave", label: "On Leave" },
    { value: "terminated", label: "Terminated" },
  ];

  const bankOptions = [
    { value: "CRDB Bank", label: "CRDB Bank" },
    { value: "NMB Bank", label: "NMB Bank" },
    { value: "NBC Bank", label: "NBC Bank" },
    { value: "Stanbic Bank", label: "Stanbic Bank" },
    { value: "DTB Bank", label: "DTB Bank" },
    { value: "Equity Bank", label: "Equity Bank" },
    { value: "Exim Bank", label: "Exim Bank" },
    { value: "TPB Bank", label: "TPB Bank" },
    { value: "BOA Tanzania", label: "BOA Tanzania" },
    { value: "Other", label: "Other" },
  ];

  // Helper function to get supervisor display name
  const getSupervisorDisplayName = (supervisor) => {
    return `${supervisor.first_name} ${supervisor.middle_name || ""} ${supervisor.sur_name}`.trim();
  };

  // Helper function to get nested field value
  const getFieldValue = (fieldName) => {
    return formik.values.basicEmployeeData?.[fieldName] || "";
  };

  // Helper function to handle nested field changes
  const handleNestedChange = (fieldName) => (event) => {
    const value = event.target.value;
    formik.setFieldValue(`basicEmployeeData.${fieldName}`, value);
  };

  // Helper function to get nested field error
  const getFieldError = (fieldName) => {
    return (
      formik.touched.basicEmployeeData?.[fieldName] &&
      Boolean(formik.errors.basicEmployeeData?.[fieldName])
    );
  };

  // Helper function to get nested field helper text
  const getFieldHelperText = (fieldName) => {
    return (
      formik.touched.basicEmployeeData?.[fieldName] &&
      formik.errors.basicEmployeeData?.[fieldName]
    );
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: "medium" }}>
        Employment Information
      </Typography>

      {/* Job Details */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Job Details
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="basicEmployeeData.department_id"
            label="Department"
            value={getFieldValue("department_id")}
            onChange={handleNestedChange("department_id")}
            onBlur={formik.handleBlur}
            error={getFieldError("department_id")}
            helperText={getFieldHelperText("department_id")}
            required
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.department_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="basicEmployeeData.designation"
            label="Job Title/Designation"
            value={getFieldValue("designation")}
            onChange={handleNestedChange("designation")}
            onBlur={formik.handleBlur}
            error={getFieldError("designation")}
            helperText={getFieldHelperText("designation")}
            placeholder="e.g., Software Engineer, HR Manager"
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="basicEmployeeData.employment_type"
            label="Employment Type"
            value={getFieldValue("employment_type")}
            onChange={handleNestedChange("employment_type")}
            onBlur={formik.handleBlur}
            error={getFieldError("employment_type")}
            helperText={getFieldHelperText("employment_type")}
            required
          >
            {employmentTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="basicEmployeeData.registration_number"
            label="Employee Registration Number"
            value={getFieldValue("registration_number")}
            onChange={handleNestedChange("registration_number")}
            onBlur={formik.handleBlur}
            error={getFieldError("registration_number")}
            helperText={getFieldHelperText("registration_number")}
            placeholder="e.g., EMP001, REG2024001"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="basicEmployeeData.supervisor_id"
            label="Supervisor"
            value={getFieldValue("supervisor_id")}
            onChange={handleNestedChange("supervisor_id")}
            onBlur={formik.handleBlur}
            error={getFieldError("supervisor_id")}
            helperText={getFieldHelperText("supervisor_id")}
          >
            <MenuItem value="">
              <em>No Supervisor</em>
            </MenuItem>
            {supervisors.map((supervisor) => (
              <MenuItem key={supervisor.id} value={supervisor.id}>
                {getSupervisorDisplayName(supervisor)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="basicEmployeeData.status"
            label="Employment Status"
            value={getFieldValue("status")}
            onChange={handleNestedChange("status")}
            onBlur={formik.handleBlur}
            error={getFieldError("status")}
            helperText={getFieldHelperText("status")}
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

      <Divider sx={{ mb: 3 }} />

      {/* Employment Dates and Compensation */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Employment Dates & Compensation
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="date"
            name="basicEmployeeData.date_joined"
            label="Date Joined"
            value={getFieldValue("date_joined")}
            onChange={handleNestedChange("date_joined")}
            onBlur={formik.handleBlur}
            error={getFieldError("date_joined")}
            helperText={getFieldHelperText("date_joined")}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            name="basicEmployeeData.salary"
            label="Monthly Salary (TZS)"
            value={getFieldValue("salary")}
            onChange={handleNestedChange("salary")}
            onBlur={formik.handleBlur}
            error={getFieldError("salary")}
            helperText={getFieldHelperText("salary")}
            placeholder="e.g., 1500000"
            inputProps={{
              min: 0,
              step: 1000,
            }}
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Government IDs */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Government & Social Security IDs
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="basicEmployeeData.nida"
            label="NIDA Number"
            value={getFieldValue("nida")}
            onChange={handleNestedChange("nida")}
            onBlur={formik.handleBlur}
            error={getFieldError("nida")}
            helperText={getFieldHelperText("nida")}
            placeholder="e.g., 19851205-12345-67890-12"
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="basicEmployeeData.nssf"
            label="NSSF Number"
            value={getFieldValue("nssf")}
            onChange={handleNestedChange("nssf")}
            onBlur={formik.handleBlur}
            error={getFieldError("nssf")}
            helperText={getFieldHelperText("nssf")}
            placeholder="e.g., NSSF-123456"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="basicEmployeeData.bima"
            label="BIMA Number"
            value={getFieldValue("bima")}
            onChange={handleNestedChange("bima")}
            onBlur={formik.handleBlur}
            error={getFieldError("bima")}
            helperText={getFieldHelperText("bima")}
            placeholder="e.g., BIMA-123456"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="basicEmployeeData.helsb"
            label="HESLB Number"
            value={getFieldValue("helsb")}
            onChange={handleNestedChange("helsb")}
            onBlur={formik.handleBlur}
            error={getFieldError("helsb")}
            helperText={getFieldHelperText("helsb")}
            placeholder="e.g., HESLB-123456"
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Banking Information */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Banking Information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="basicEmployeeData.bank_name"
            label="Bank Name"
            value={getFieldValue("bank_name")}
            onChange={handleNestedChange("bank_name")}
            onBlur={formik.handleBlur}
            error={getFieldError("bank_name")}
            helperText={getFieldHelperText("bank_name")}
            required
          >
            {bankOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="basicEmployeeData.account_number"
            label="Account Number"
            value={getFieldValue("account_number")}
            onChange={handleNestedChange("account_number")}
            onBlur={formik.handleBlur}
            error={getFieldError("account_number")}
            helperText={getFieldHelperText("account_number")}
            placeholder="e.g., 0150123456789"
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmploymentDataForm;
