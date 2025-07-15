import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Alert,
  Divider,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import BasicInfoForm from "./forms/BasicInfoForm";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import BioDataForm from "./forms/BioDataForm";
import EmploymentDataForm from "./forms/EmploymentDataForm";
import { ROUTES } from "../../../constants";
import { employeesAPI } from "../../../services/api/employees.api";
import rolesAPI from "../../../services/api/roles.api";
import useNotification from "../../../hooks/common/useNotification";

// Custom LoadingButton component
const LoadingButton = ({
  loading,
  children,
  startIcon,
  disabled,
  onClick,
  variant = "contained",
  size = "medium",
  fullWidth = false,
  sx = {},
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? <CircularProgress size={16} /> : startIcon}
      sx={{
        position: "relative",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

const steps = [
  {
    label: "Basic Information",
    icon: <PersonIcon />,
    description: "Names, Gender, Contact Details",
  },
  {
    label: "Bio Data",
    icon: <ContactIcon />,
    description: "Personal Details, DOB, Marital Status",
  },
  {
    label: "Personal Data",
    icon: <ContactIcon />,
    description: "Location, Education, Emergency Contacts",
  },
  {
    label: "Employment Data",
    icon: <WorkIcon />,
    description: "Job Details, Salary, Banking, Government IDs",
  },
  {
    label: "Role Assignment",
    icon: <SecurityIcon />,
    description: "System Access & Permissions",
  },
];

// Updated validation schemas
const basicInfoSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  middle_name: Yup.string(),
  sur_name: Yup.string().required("Surname is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  gender: Yup.string().required("Gender is required"),
  status: Yup.string().required("Status is required"),
});

const bioDataSchema = Yup.object({
  bioData: Yup.object({
    dob: Yup.date().required("Date of birth is required"),
    marital_status: Yup.string(),
    blood_group: Yup.string(),
    national_id: Yup.string(),
    fingerprint_id: Yup.string(),
    signature: Yup.string(),
  }),
});

const personalDataSchema = Yup.object({
  personalEmployeeData: Yup.object({
    location: Yup.string().required("Location is required"),
    education_level: Yup.string().required("Education level is required"),
  }),
  address: Yup.string().required("Address is required"),
  emergency_contact_name: Yup.string().required(
    "Emergency contact name is required"
  ),
  emergency_contact_phone: Yup.string().required(
    "Emergency contact phone is required"
  ),
  emergency_contact_relationship: Yup.string().required(
    "Relationship is required"
  ),
  next_of_kin_name: Yup.string(),
  next_of_kin_phone: Yup.string(),
  next_of_kin_relationship: Yup.string(),
});

const employmentDataSchema = Yup.object({
  basicEmployeeData: Yup.object({
    department_id: Yup.number().required("Department is required"),
    designation: Yup.string().required("Designation is required"),
    salary: Yup.number()
      .positive("Salary must be positive")
      .required("Salary is required"),
    date_joined: Yup.date().required("Date joined is required"),
    employment_type: Yup.string().required("Employment type is required"),
    registration_number: Yup.string(),
    supervisor_id: Yup.number(),
    status: Yup.string().required("Employment status is required"),
    nida: Yup.string().required("NIDA number is required"),
    nssf: Yup.string(),
    bima: Yup.string(),
    helsb: Yup.string(),
    bank_name: Yup.string().required("Bank name is required"),
    account_number: Yup.string().required("Account number is required"),
  }),
});

const roleAssignmentSchema = Yup.object({
  role_ids: Yup.array()
    .of(Yup.number())
    .min(1, "At least one role must be assigned")
    .required("Role assignment is required"),
});

// Role Assignment Form Component
const RoleAssignmentForm = ({ formik, availableRoles }) => {
  const handleRoleChange = (event) => {
    const value = event.target.value;
    formik.setFieldValue("role_ids", value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Role Assignment
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Assign system roles to define the employee's access permissions.
        Multiple roles can be assigned.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Select Roles"
            name="role_ids"
            value={formik.values.role_ids || []}
            onChange={handleRoleChange}
            error={formik.touched.role_ids && Boolean(formik.errors.role_ids)}
            helperText={formik.touched.role_ids && formik.errors.role_ids}
            SelectProps={{
              multiple: true,
              displayEmpty: true,
            }}
            required
          >
            <MenuItem value="" disabled>
              Select roles for this employee
            </MenuItem>
            {availableRoles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.role_name}
                {role.description && ` - ${role.description}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {formik.values.role_ids && formik.values.role_ids.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Selected Roles:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {formik.values.role_ids.map((roleId) => {
                const role = availableRoles.find((r) => r.id === roleId);
                return role ? (
                  <Box key={role.id} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{role.role_name}</strong>
                      {role.description && ` - ${role.description}`}
                    </Typography>
                  </Box>
                ) : null;
              })}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

const EmployeeForm = ({ editMode = false, initialData = null, onSuccess }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedSteps, setSavedSteps] = useState(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // State for roles
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);

  // Fetch available roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await rolesAPI.getAllRoles();
        const roles = response.data || response;
        setAvailableRoles(Array.isArray(roles) ? roles : []);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        showError("Failed to load available roles");
        setAvailableRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Fetch user roles if in edit mode
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (editMode && initialData?.id) {
        try {
          const roleIds = initialData.roles?.map((role) => role.id) || [];
          setUserRoles(roleIds);
        } catch (error) {
          console.error("Failed to fetch user roles:", error);
          setUserRoles([]);
        }
      }
    };

    if (editMode && initialData && availableRoles.length > 0) {
      fetchUserRoles();
    }
  }, [editMode, initialData, availableRoles]);

  // Initialize form data
  const getInitialFormData = () => {
    if (editMode && initialData) {
      return {
        // Basic Info
        first_name: initialData.first_name || "",
        middle_name: initialData.middle_name || "",
        sur_name: initialData.sur_name || "",
        email: initialData.email || "",
        phone_number: initialData.phone_number || "",
        gender: initialData.gender || "",
        status: initialData.status || "active",

        // Bio Data
        bioData: {
          dob: initialData.bioData?.dob || "",
          marital_status: initialData.bioData?.marital_status || "",
          blood_group: initialData.bioData?.blood_group || "",
          national_id: initialData.bioData?.national_id || "",
          fingerprint_id: initialData.bioData?.fingerprint_id || "",
          signature: initialData.bioData?.signature || "",
        },

        // Personal Data
        personalEmployeeData: {
          location: initialData.personalEmployeeData?.location || "",
          education_level:
            initialData.personalEmployeeData?.education_level || "",
        },
        address: initialData.address || "",
        emergency_contact_name: initialData.emergency_contact_name || "",
        emergency_contact_phone: initialData.emergency_contact_phone || "",
        emergency_contact_relationship:
          initialData.emergency_contact_relationship || "",
        next_of_kin_name: initialData.next_of_kin_name || "",
        next_of_kin_phone: initialData.next_of_kin_phone || "",
        next_of_kin_relationship: initialData.next_of_kin_relationship || "",

        // Employment Data
        basicEmployeeData: {
          department_id: initialData.basicEmployeeData?.department_id || "",
          designation: initialData.basicEmployeeData?.designation || "",
          salary: initialData.basicEmployeeData?.salary || "",
          date_joined: initialData.basicEmployeeData?.date_joined || "",
          employment_type: initialData.basicEmployeeData?.employment_type || "",
          registration_number:
            initialData.basicEmployeeData?.registration_number || "",
          supervisor_id: initialData.basicEmployeeData?.supervisor_id || "",
          status: initialData.basicEmployeeData?.status || "active",
          nida: initialData.basicEmployeeData?.nida || "",
          nssf: initialData.basicEmployeeData?.nssf || "",
          bima: initialData.basicEmployeeData?.bima || "",
          helsb: initialData.basicEmployeeData?.helsb || "",
          bank_name: initialData.basicEmployeeData?.bank_name || "",
          account_number: initialData.basicEmployeeData?.account_number || "",
        },

        // Role Assignment
        role_ids: userRoles || [],
      };
    }

    return {
      // Basic Info
      first_name: "",
      middle_name: "",
      sur_name: "",
      email: "",
      phone_number: "",
      gender: "",
      status: "active",

      // Bio Data
      bioData: {
        dob: "",
        marital_status: "",
        blood_group: "",
        national_id: "",
        fingerprint_id: "",
        signature: "",
      },

      // Personal Data
      personalEmployeeData: {
        location: "",
        education_level: "",
      },
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      next_of_kin_name: "",
      next_of_kin_phone: "",
      next_of_kin_relationship: "",

      // Employment Data
      basicEmployeeData: {
        department_id: "",
        designation: "",
        salary: "",
        date_joined: "",
        employment_type: "",
        registration_number: "",
        supervisor_id: "",
        status: "active",
        nida: "",
        nssf: "",
        bima: "",
        helsb: "",
        bank_name: "",
        account_number: "",
      },

      // Role Assignment
      role_ids: [],
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Get validation schema for current step
  const getValidationSchema = () => {
    switch (activeStep) {
      case 0:
        return basicInfoSchema;
      case 1:
        return bioDataSchema;
      case 2:
        return personalDataSchema;
      case 3:
        return employmentDataSchema;
      case 4:
        return roleAssignmentSchema;
      default:
        return Yup.object({});
    }
  };

  const formik = useFormik({
    initialValues: formData,
    validationSchema: getValidationSchema(),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (activeStep === steps.length - 1) {
        await handleSubmit(values);
      } else {
        setFormData(values);
        setActiveStep((prev) => prev + 1);
      }
    },
  });

  // Track unsaved changes
  useEffect(() => {
    if (editMode && !savedSteps.has(activeStep)) {
      setHasUnsavedChanges(true);
    }
  }, [formik.values, activeStep, editMode, savedSteps]);

  // Update validation schema when step changes
  useEffect(() => {
    formik.setErrors({});
    formik.setTouched({});
  }, [activeStep]);

  // Update formData when userRoles are loaded in edit mode
  useEffect(() => {
    if (
      editMode &&
      userRoles.length > 0 &&
      formik.values.role_ids.length === 0
    ) {
      formik.setFieldValue("role_ids", userRoles);
    }
  }, [userRoles, editMode]);

  // Validate current step
  const validateCurrentStep = async () => {
    const currentSchema = getValidationSchema();
    try {
      await currentSchema.validate(formik.values, { abortEarly: false });
      return true;
    } catch (validationErrors) {
      const errors = {};
      const touched = {};

      validationErrors.inner.forEach((error) => {
        const path = error.path;
        if (path.includes(".")) {
          const pathParts = path.split(".");
          if (!errors[pathParts[0]]) {
            errors[pathParts[0]] = {};
          }
          errors[pathParts[0]][pathParts[1]] = error.message;

          if (!touched[pathParts[0]]) {
            touched[pathParts[0]] = {};
          }
          touched[pathParts[0]][pathParts[1]] = true;
        } else {
          errors[path] = error.message;
          touched[path] = true;
        }
      });

      formik.setErrors(errors);
      formik.setTouched(touched);
      return false;
    }
  };

  // Save current step data
  const handleSaveStep = async () => {
    const isStepValid = await validateCurrentStep();

    if (!isStepValid) {
      showError("Please fix the errors before saving");
      return;
    }

    if (!editMode) {
      showError("Save is only available in edit mode");
      return;
    }

    setSaveLoading(true);
    setError(null);

    try {
      // Prepare data for current step
      const currentStepData = getCurrentStepData();

      // Call API to save only current step data
      await employeesAPI.updatePartial(initialData.id, currentStepData);

      // Mark step as saved
      setSavedSteps((prev) => new Set([...prev, activeStep]));
      setHasUnsavedChanges(false);

      showSuccess(`${steps[activeStep].label} saved successfully`);
    } catch (err) {
      console.error("Error saving step:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to save step data";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  // Get current step data for partial update
  const getCurrentStepData = () => {
    switch (activeStep) {
      case 0:
        return {
          first_name: formik.values.first_name,
          middle_name: formik.values.middle_name,
          sur_name: formik.values.sur_name,
          email: formik.values.email,
          phone_number: formik.values.phone_number,
          gender: formik.values.gender,
          status: formik.values.status,
        };
      case 1:
        return {
          bioData: formik.values.bioData,
        };
      case 2:
        return {
          personalEmployeeData: formik.values.personalEmployeeData,
          address: formik.values.address,
          emergency_contact_name: formik.values.emergency_contact_name,
          emergency_contact_phone: formik.values.emergency_contact_phone,
          emergency_contact_relationship:
            formik.values.emergency_contact_relationship,
          next_of_kin_name: formik.values.next_of_kin_name,
          next_of_kin_phone: formik.values.next_of_kin_phone,
          next_of_kin_relationship: formik.values.next_of_kin_relationship,
        };
      case 3:
        return {
          basicEmployeeData: formik.values.basicEmployeeData,
        };
      case 4:
        return {
          role_ids: formik.values.role_ids,
        };
      default:
        return {};
    }
  };

  // Handle final submission
  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare API data
      const apiData = {
        first_name: values.first_name,
        middle_name: values.middle_name,
        sur_name: values.sur_name,
        email: values.email,
        phone_number: values.phone_number,
        gender: values.gender,
        status: values.status,
        address: values.address,

        basic_employee_data: values.basicEmployeeData,
        bio_data: {
          ...values.bioData,
          dob: values.bioData.dob
            ? new Date(values.bioData.dob).toISOString().split("T")[0]
            : null,
        },
        personal_employee_data: values.personalEmployeeData,
        emergency_contacts: [
          {
            name: values.emergency_contact_name,
            phone_number: values.emergency_contact_phone,
            relationship: values.emergency_contact_relationship,
          },
        ].filter((contact) => contact.name && contact.phone_number),
        next_of_kin: [
          {
            name: values.next_of_kin_name,
            phone_number: values.next_of_kin_phone,
            relationship: values.next_of_kin_relationship,
            percentage: 100,
          },
        ].filter((kin) => kin.name && kin.phone_number),
        roles: values.role_ids || [],
      };

      let response;
      if (editMode && initialData?.id) {
        response = await employeesAPI.update(initialData.id, apiData);
        showSuccess("Employee updated successfully");
      } else {
        response = await employeesAPI.create(apiData);
        showSuccess("Employee created successfully");
      }

      if (onSuccess && response.data) {
        onSuccess(response.data.data || response.data);
      } else {
        navigate(ROUTES.EMPLOYEES);
      }
    } catch (err) {
      console.error("Error saving employee:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to save employee data";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    // Check if user has unsaved changes in edit mode
    if (editMode && hasUnsavedChanges && !savedSteps.has(activeStep)) {
      showError("Please save your changes before moving to the next step");
      return;
    }

    const isStepValid = await validateCurrentStep();
    if (isStepValid) {
      if (activeStep === steps.length - 1) {
        await handleSubmit(formik.values);
      } else {
        setFormData(formik.values);
        setActiveStep((prev) => prev + 1);
        setHasUnsavedChanges(false);
      }
    }
  };

  const handleBack = () => {
    setFormData(formik.values);
    setActiveStep((prev) => prev - 1);
  };

  const handleCancel = () => {
    navigate(ROUTES.EMPLOYEES);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <BasicInfoForm formik={formik} />;
      case 1:
        return <BioDataForm formik={formik} />;
      case 2:
        return <PersonalInfoForm formik={formik} />;
      case 3:
        return <EmploymentDataForm formik={formik} />;
      case 4:
        return rolesLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading roles...</Typography>
          </Box>
        ) : (
          <RoleAssignmentForm formik={formik} availableRoles={availableRoles} />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          {editMode ? "Edit Employee" : "Add New Employee"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {editMode
            ? "Update employee information and role assignments"
            : "Register a new employee in the system with role assignments"}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Unsaved Changes Warning */}
      {editMode && hasUnsavedChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have unsaved changes. Please save before moving to the next step.
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={
                    savedSteps.has(index) && editMode ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      step.icon
                    )
                  }
                  optional={
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                      {savedSteps.has(index) && editMode && (
                        <Typography
                          variant="caption"
                          color="success.main"
                          sx={{ ml: 1 }}
                        >
                          ✓ Saved
                        </Typography>
                      )}
                    </Typography>
                  }
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ mb: 4 }}>{renderStepContent()}</Box>

          <Divider sx={{ mb: 3 }} />

          {/* Navigation Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Button variant="outlined" onClick={handleCancel} sx={{ mr: 2 }}>
                Cancel
              </Button>
              {activeStep > 0 && (
                <Button onClick={handleBack} variant="outlined">
                  Back
                </Button>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Save Button - Only show in edit mode and not on the last step */}
              {editMode && activeStep < steps.length - 1 && (
                <LoadingButton
                  variant="outlined"
                  onClick={handleSaveStep}
                  loading={saveLoading}
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{
                    color: savedSteps.has(activeStep)
                      ? "success.main"
                      : "primary.main",
                    borderColor: savedSteps.has(activeStep)
                      ? "success.main"
                      : "primary.main",
                  }}
                >
                  {savedSteps.has(activeStep) ? "Saved" : "Save"}
                </LoadingButton>
              )}

              {/* Next/Submit Button */}
              <LoadingButton
                variant="contained"
                onClick={handleNext}
                loading={loading && activeStep === steps.length - 1}
                disabled={loading || (activeStep === 4 && rolesLoading)}
              >
                {activeStep === steps.length - 1
                  ? editMode
                    ? "Update Employee"
                    : "Create Employee"
                  : "Next"}
              </LoadingButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeForm;
