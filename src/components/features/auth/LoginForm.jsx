import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Box,
  Alert,
  Chip,
  FormGroup,
  Autocomplete,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useFormik } from "formik";
import * as Yup from "yup";
import rolesAPI from "../../../services/api/roles.api";
import useNotification  from "../../../hooks/common/useNotification";

// Validation schema for user form
const validationSchema = Yup.object({
  first_name: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  last_name: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone_number: Yup.string()
    .matches(/^\+?[\d\s-()]+$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  employee_id: Yup.string().required("Employee ID is required"),
  department_id: Yup.number().required("Department is required"),
  position: Yup.string().required("Position is required"),
  primary_role_id: Yup.number().required("Primary role is required"),
  hire_date: Yup.date().required("Hire date is required"),
});

const LoginForm = ({
  open,
  onClose,
  onSubmit,
  editingUser = null,
  departments = [],
  users = [], // For manager selection
}) => {
  const { showError } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // User creation steps
  const userCreationSteps = [
    "Basic Information",
    "Department & Role",
    "Additional Roles & Permissions",
    "Account Settings",
  ];

  // Formik form management
  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      middle_name: "",
      email: "",
      phone_number: "",
      employee_id: "",
      department_id: "",
      position: "",
      manager_id: "",
      hire_date: null,
      primary_role_id: "", // Primary role (required)
      additional_role_ids: [], // Additional roles (optional)
      custom_permissions: [], // Custom permissions beyond role
      status: "active",
      is_active: true,
      account_locked: false,
      email_verified: false,
      send_invite: true,
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Combine primary role with additional roles
        const allRoleIds = [
          values.primary_role_id,
          ...values.additional_role_ids,
        ].filter(Boolean);

        const userData = {
          ...values,
          role_ids: allRoleIds,
          permissions: values.custom_permissions,
        };

        await onSubmit(userData);
        handleClose();
      } catch (error) {
        showError("Failed to save user");
      }
    },
  });

  // Load roles and permissions on mount
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Set form values when editing user
  useEffect(() => {
    if (editingUser && open) {
      const userRoles = editingUser.roles || [];
      const primaryRole = userRoles[0];
      const additionalRoles = userRoles.slice(1);

      formik.setValues({
        first_name: editingUser.first_name || "",
        last_name: editingUser.last_name || "",
        middle_name: editingUser.middle_name || "",
        email: editingUser.email || "",
        phone_number: editingUser.phone_number || "",
        employee_id: editingUser.employee_id || "",
        department_id: editingUser.department_id || "",
        position: editingUser.position || "",
        manager_id: editingUser.manager_id || "",
        hire_date: editingUser.hire_date
          ? new Date(editingUser.hire_date)
          : null,
        primary_role_id: primaryRole?.id || primaryRole || "",
        additional_role_ids: additionalRoles.map((role) =>
          typeof role === "object" ? role.id : role
        ),
        custom_permissions: editingUser.custom_permissions || [],
        status: editingUser.status || "active",
        is_active: editingUser.is_active ?? true,
        account_locked: editingUser.account_locked || false,
        email_verified: editingUser.email_verified || false,
        send_invite: false, // Don't send invite when editing
        notes: editingUser.notes || "",
      });

      // Set selected roles and permissions for UI
      setSelectedRoles(
        additionalRoles.map((role) =>
          typeof role === "object" ? role.id : role
        )
      );
      setSelectedPermissions(editingUser.custom_permissions || []);
    }
  }, [editingUser, open]);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await rolesAPI.getAllRoles();
      setRoles(response.data || response || []);
    } catch (error) {
      showError("Failed to fetch roles");
      console.error("Fetch roles error:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await rolesAPI.getAllPermissions();
      const permissionsData =
        response.data?.all || response.data || response || [];
      setPermissions(permissionsData);
    } catch (error) {
      showError("Failed to fetch permissions");
      console.error("Fetch permissions error:", error);
    }
  };

  const handleClose = () => {
    formik.resetForm();
    setActiveStep(0);
    setSelectedRoles([]);
    setSelectedPermissions([]);
    onClose();
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles((prev) => {
      const newRoles = prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId];

      formik.setFieldValue("additional_role_ids", newRoles);
      return newRoles;
    });
  };

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions((prev) => {
      const newPermissions = prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission];

      formik.setFieldValue("custom_permissions", newPermissions);
      return newPermissions;
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
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
                helperText={
                  formik.touched.first_name && formik.errors.first_name
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="last_name"
                label="Last Name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.last_name && Boolean(formik.errors.last_name)
                }
                helperText={formik.touched.last_name && formik.errors.last_name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="middle_name"
                label="Middle Name"
                value={formik.values.middle_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="employee_id"
                label="Employee ID"
                value={formik.values.employee_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.employee_id &&
                  Boolean(formik.errors.employee_id)
                }
                helperText={
                  formik.touched.employee_id && formik.errors.employee_id
                }
                required
              />
            </Grid>
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
                name="phone_number"
                label="Phone Number"
                value={formik.values.phone_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.phone_number &&
                  Boolean(formik.errors.phone_number)
                }
                helperText={
                  formik.touched.phone_number && formik.errors.phone_number
                }
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department_id"
                  value={formik.values.department_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.department_id &&
                    Boolean(formik.errors.department_id)
                  }
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="position"
                label="Position/Job Title"
                value={formik.values.position}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.position && Boolean(formik.errors.position)
                }
                helperText={formik.touched.position && formik.errors.position}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Manager/Supervisor</InputLabel>
                <Select
                  name="manager_id"
                  value={formik.values.manager_id}
                  onChange={formik.handleChange}
                  label="Manager/Supervisor"
                >
                  <MenuItem value="">
                    <em>No Manager</em>
                  </MenuItem>
                  {users
                    .filter((user) => user.id !== editingUser?.id)
                    .map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Hire Date"
                value={formik.values.hire_date}
                onChange={(date) => formik.setFieldValue("hire_date", date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={
                      formik.touched.hire_date &&
                      Boolean(formik.errors.hire_date)
                    }
                    helperText={
                      formik.touched.hire_date && formik.errors.hire_date
                    }
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Primary Role</InputLabel>
                <Select
                  name="primary_role_id"
                  value={formik.values.primary_role_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.primary_role_id &&
                    Boolean(formik.errors.primary_role_id)
                  }
                  label="Primary Role"
                  disabled={loadingRoles}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {role.role_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formik.touched.primary_role_id &&
                formik.errors.primary_role_id && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {formik.errors.primary_role_id}
                  </Typography>
                )}
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Additional Roles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select additional roles for this user. The primary role will grant
              core permissions, while additional roles provide extra
              capabilities.
            </Typography>

            <FormGroup sx={{ mb: 4 }}>
              {roles
                .filter((role) => role.id !== formik.values.primary_role_id)
                .map((role) => (
                  <FormControlLabel
                    key={role.id}
                    control={
                      <Checkbox
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {role.role_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
            </FormGroup>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Custom Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Grant specific permissions beyond what roles provide.
            </Typography>

            {permissions.length > 0 && (
              <FormGroup>
                {permissions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => handlePermissionToggle(permission)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {permission.replace(/_/g, " ").toUpperCase()}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            )}

            {selectedRoles.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Selected Additional Roles:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedRoles.map((roleId) => {
                    const role = roles.find((r) => r.id === roleId);
                    return (
                      <Chip
                        key={roleId}
                        label={role?.role_name}
                        size="small"
                        color="primary"
                        onDelete={() => handleRoleToggle(roleId)}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="locked">Locked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ pt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_active"
                      checked={formik.values.is_active}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Account Active"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="account_locked"
                    checked={formik.values.account_locked}
                    onChange={formik.handleChange}
                  />
                }
                label="Account Locked"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="email_verified"
                    checked={formik.values.email_verified}
                    onChange={formik.handleChange}
                  />
                }
                label="Email Verified"
              />
            </Grid>
            {!editingUser && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="send_invite"
                      checked={formik.values.send_invite}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Send invitation email to user"
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="notes"
                label="Notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                placeholder="Additional notes about this user..."
              />
            </Grid>
          </Grid>
        );

      default:
        return "Unknown step";
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {userCreationSteps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Box sx={{ mt: 2, mb: 2 }}>{getStepContent(index)}</Box>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={
                        index === userCreationSteps.length - 1
                          ? formik.handleSubmit
                          : handleNext
                      }
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === userCreationSteps.length - 1
                        ? editingUser
                          ? "Update User"
                          : "Create User"
                        : "Next"}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginForm;
