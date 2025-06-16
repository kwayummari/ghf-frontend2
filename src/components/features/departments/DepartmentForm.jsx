import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DepartmentIcon from "@mui/icons-material/CorporateFare";
import PersonIcon from "@mui/icons-material/Person";
import BudgetIcon from "@mui/icons-material/AccountBalance";
import LocationIcon from "@mui/icons-material/LocationOn";

import {
  createDepartment,
  updateDepartment,
  fetchPotentialHeads,
  clearError,
  selectDepartmentsLoading,
  selectDepartmentsError,
  selectPotentialHeads,
} from "../../../store/slices/departmentSlice";

const validationSchema = Yup.object({
  department_name: Yup.string()
    .required("Department name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  description: Yup.string().max(
    500,
    "Description must be less than 500 characters"
  ),
  head_id: Yup.number()
    .nullable()
    .typeError("Please select a valid department head"),
  budget: Yup.number()
    .nullable()
    .positive("Budget must be a positive number")
    .typeError("Budget must be a valid number"),
  location: Yup.string().max(200, "Location must be less than 200 characters"),
});

const DepartmentForm = ({
  department = null,
  editMode = false,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectDepartmentsLoading);
  const error = useSelector(selectDepartmentsError);
  const potentialHeads = useSelector(selectPotentialHeads);

  // Fetch potential department heads on component mount
  useEffect(() => {
    dispatch(fetchPotentialHeads());
    // Clear any previous errors
    dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      department_name: department?.department_name || "",
      description: department?.description || "",
      head_id: department?.head_id || "",
      budget: department?.budget || "",
      location: department?.location || "",
      is_active:
        department?.is_active !== undefined ? department.is_active : true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const departmentData = {
          ...values,
          head_id: values.head_id || null,
          budget: values.budget ? parseFloat(values.budget) : null,
        };

        if (editMode && department) {
          await dispatch(
            updateDepartment({
              id: department.id,
              data: departmentData,
            })
          ).unwrap();
        } else {
          await dispatch(createDepartment(departmentData)).unwrap();
        }

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Form submission error:", error);
      }
    },
  });

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-TZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          {editMode ? "Edit Department" : "Create New Department"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {editMode
            ? "Update department information and settings"
            : "Add a new department to your organization"}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearError())}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <DepartmentIcon color="primary" />
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="department_name"
                  label="Department Name"
                  value={formik.values.department_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.department_name &&
                    Boolean(formik.errors.department_name)
                  }
                  helperText={
                    formik.touched.department_name &&
                    formik.errors.department_name
                  }
                  required
                  placeholder="e.g., Human Resources, Information Technology"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="location"
                  label="Location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.location && Boolean(formik.errors.location)
                  }
                  helperText={formik.touched.location && formik.errors.location}
                  placeholder="e.g., Building A, Floor 2"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    (formik.touched.description && formik.errors.description) ||
                    `${formik.values.description.length}/500 characters`
                  }
                  placeholder="Brief description of the department's role and responsibilities"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Management & Budget */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PersonIcon color="primary" />
                  Management & Budget
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="head_id"
                  label="Department Head"
                  value={formik.values.head_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.head_id && Boolean(formik.errors.head_id)
                  }
                  helperText={formik.touched.head_id && formik.errors.head_id}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">
                    <em>No department head assigned</em>
                  </MenuItem>
                  {potentialHeads.map((head) => (
                    <MenuItem key={head.id} value={head.id}>
                      {`${head.first_name} ${head.sur_name}`}
                      {head.email && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ({head.email})
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="budget"
                  label="Annual Budget (TZS)"
                  type="number"
                  value={formik.values.budget}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.budget && Boolean(formik.errors.budget)}
                  helperText={
                    (formik.touched.budget && formik.errors.budget) ||
                    (formik.values.budget &&
                      `Formatted: ${formatCurrency(formik.values.budget)} TZS`)
                  }
                  placeholder="0"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BudgetIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Status */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Status
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.is_active}
                      onChange={(e) =>
                        formik.setFieldValue("is_active", e.target.checked)
                      }
                      name="is_active"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {formik.values.is_active ? "Active" : "Inactive"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formik.values.is_active
                          ? "Department is active and operational"
                          : "Department is inactive and hidden from most views"}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                loading={loading}
                disabled={!formik.isValid || !formik.dirty}
              >
                {editMode ? "Update Department" : "Create Department"}
              </LoadingButton>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DepartmentForm;
