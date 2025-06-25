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
} from "@mui/material";
import {
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import BasicInfoForm from "./forms/BasicInfoForm";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import BioDataForm from "./forms/BioDataForm";
import EmploymentDataForm from "./forms/EmploymentDataForm";
import { ROUTES } from "../../../constants";
import { employeesAPI } from "../../../services/api/employees.api";
import rolesAPI from "../../../services/api/roles.api";
import useNotification from "../../../hooks/common/useNotification";

// Custom LoadingButton component to replace @mui/lab
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

// Updated validation schemas to include role validation
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

// Role assignment validation schema
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

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="System Roles"
            name="role_ids"
            value={formik.values.role_ids || []}
            onChange={handleRoleChange}
            error={formik.touched.role_ids && Boolean(formik.errors.role_ids)}
            helperText={formik.touched.role_ids && formik.errors.role_ids}
            SelectProps={{
              multiple: true,
              renderValue: (selected) => {
                const selectedRoles = availableRoles.filter((role) =>
                  selected.includes(role.id)
                );
                return selectedRoles.map((role) => role.role_name).join(", ");
              },
            }}
          >
            {availableRoles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {role.role_name}
                  </Typography>
                  {role.description && (
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {formik.values.role_ids && formik.values.role_ids.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Roles:
              </Typography>
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
  const [error, setError] = useState(null);

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

  // Initialize form data with proper structure
  const getInitialFormData = () => {
    if (editMode && initialData) {
      return {
        // Basic Info (root level)
        first_name: initialData.first_name || "",
        middle_name: initialData.middle_name || "",
        sur_name: initialData.sur_name || "",
        email: initialData.email || "",
        phone_number: initialData.phone_number || "",
        gender: initialData.gender || "",
        status: initialData.status || "active",

        // Bio Data (nested)
        bioData: {
          dob: initialData.bioData?.dob || "",
          marital_status: initialData.bioData?.marital_status || "",
          blood_group: initialData.bioData?.blood_group || "",
          national_id: initialData.bioData?.national_id || "",
          fingerprint_id: initialData.bioData?.fingerprint_id || "",
          signature: initialData.bioData?.signature || "",
        },

        // Personal Employee Data (nested)
        personalEmployeeData: {
          location: initialData.personalEmployeeData?.location || "",
          education_level:
            initialData.personalEmployeeData?.education_level || "",
        },

        address: initialData.address || "",

        // Emergency contacts (root level)
        emergency_contact_name: initialData.emergency_contact_name || "",
        emergency_contact_phone: initialData.emergency_contact_phone || "",
        emergency_contact_relationship:
          initialData.emergency_contact_relationship || "",
        next_of_kin_name: initialData.next_of_kin_name || "",
        next_of_kin_phone: initialData.next_of_kin_phone || "",
        next_of_kin_relationship: initialData.next_of_kin_relationship || "",

        // Basic Employee Data (nested)
        basicEmployeeData: {
          department_id: initialData.basicEmployeeData?.department_id || "",
          designation: initialData.basicEmployeeData?.designation || "",
          employment_type: initialData.basicEmployeeData?.employment_type || "",
          registration_number:
            initialData.basicEmployeeData?.registration_number || "",
          supervisor_id: initialData.basicEmployeeData?.supervisor_id || "",
          date_joined: initialData.basicEmployeeData?.date_joined || "",
          salary: initialData.basicEmployeeData?.salary || "",
          status: initialData.basicEmployeeData?.status || "active",
          nida: initialData.basicEmployeeData?.nida || "",
          nssf: initialData.basicEmployeeData?.nssf || "",
          bima: initialData.basicEmployeeData?.bima || "",
          helsb: initialData.basicEmployeeData?.helsb || "",
          bank_name: initialData.basicEmployeeData?.bank_name || "",
          account_number: initialData.basicEmployeeData?.account_number || "",
        },

        // Role assignment
        role_ids: initialData.roles?.map((role) => role.id) || userRoles || [],
      };
    }

    // Default empty structure for new employee
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

      // Personal Employee Data
      personalEmployeeData: {
        location: "",
        education_level: "",
      },

      address: "",

      // Emergency contacts
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      next_of_kin_name: "",
      next_of_kin_phone: "",
      next_of_kin_relationship: "",

      // Basic Employee Data
      basicEmployeeData: {
        department_id: "",
        designation: "",
        employment_type: "full time",
        registration_number: "",
        supervisor_id: "",
        date_joined: "",
        salary: "",
        status: "active",
        nida: "",
        nssf: "",
        bima: "",
        helsb: "",
        bank_name: "",
        account_number: "",
      },

      // Role assignment - default to Employee role (ID: 5)
      role_ids: [5],
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

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
      console.log("Form submission triggered for step:", activeStep);
      console.log("Current form values:", values);

      if (activeStep === steps.length - 1) {
        // Final submission
        await handleSubmit(values);
      } else {
        // Move to next step
        setFormData(values);
        setActiveStep((prev) => prev + 1);
      }
    },
  });

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
          let errorRef = errors;
          let touchedRef = touched;

          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!errorRef[part]) errorRef[part] = {};
            if (!touchedRef[part]) touchedRef[part] = {};
            errorRef = errorRef[part];
            touchedRef = touchedRef[part];
          }

          errorRef[pathParts[pathParts.length - 1]] = error.message;
          touchedRef[pathParts[pathParts.length - 1]] = true;
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

  const handleSubmit = async (finalData) => {
    setLoading(true);
    setError(null);

    try {
      // Extract role_ids for separate handling
      const { role_ids, ...employeeData } = finalData;

      // FIXED: Transform data to match backend API expectations
      const apiData = {
        // Basic info (root level) - matches backend structure
        first_name: employeeData.first_name,
        middle_name: employeeData.middle_name,
        sur_name: employeeData.sur_name,
        email: employeeData.email,
        phone_number: employeeData.phone_number,
        gender: employeeData.gender,
        status: employeeData.status,

        // FIXED: Transform nested objects to backend format
        basic_employee_data: {
          department_id: employeeData.basicEmployeeData.department_id || null,
          designation: employeeData.basicEmployeeData.designation,
          employment_type: employeeData.basicEmployeeData.employment_type,
          registration_number:
            employeeData.basicEmployeeData.registration_number,
          supervisor_id: employeeData.basicEmployeeData.supervisor_id || null,
          date_joined: employeeData.basicEmployeeData.date_joined,
          salary: employeeData.basicEmployeeData.salary,
          status: employeeData.basicEmployeeData.status,
          nida: employeeData.basicEmployeeData.nida,
          nssf: employeeData.basicEmployeeData.nssf,
          bima: employeeData.basicEmployeeData.bima,
          helsb: employeeData.basicEmployeeData.helsb,
          bank_name: employeeData.basicEmployeeData.bank_name,
          account_number: employeeData.basicEmployeeData.account_number,
        },

        bio_data: {
          dob: employeeData.bioData.dob,
          marital_status: employeeData.bioData.marital_status,
          blood_group: employeeData.bioData.blood_group,
          national_id: employeeData.bioData.national_id,
          fingerprint_id: employeeData.bioData.fingerprint_id,
          signature: employeeData.bioData.signature,
        },

        personal_employee_data: {
          location: employeeData.personalEmployeeData.location,
          education_level: employeeData.personalEmployeeData.education_level,
        },

        // FIXED: Transform emergency contacts to array format expected by backend
        emergency_contacts: [
          {
            name: employeeData.emergency_contact_name,
            phone_number: employeeData.emergency_contact_phone,
            relationship: employeeData.emergency_contact_relationship,
          },
        ].filter((contact) => contact.name && contact.phone_number), // Only include if data exists

        // FIXED: Transform next of kin to array format expected by backend
        next_of_kin: [
          {
            name: employeeData.next_of_kin_name,
            phone_number: employeeData.next_of_kin_phone,
            relationship: employeeData.next_of_kin_relationship,
            percentage: 100, // Default to 100% for single next of kin
          },
        ].filter((kin) => kin.name && kin.phone_number), // Only include if data exists

        // FIXED: Include roles in the main payload for backend processing
        roles: role_ids || [],
      };

      console.log("API Data being sent:", apiData);

      let response;
      if (editMode && initialData?.id) {
        // Update employee - backend handles role assignment internally
        response = await employeesAPI.update(initialData.id, apiData);
        showSuccess("Employee updated successfully");
      } else {
        // Create employee - backend handles role assignment internally
        response = await employeesAPI.create(apiData);
        showSuccess("Employee created successfully");
      }

      // Call onSuccess callback if provided
      if (onSuccess && response.data) {
        onSuccess(response.data.data || response.data);
      } else {
        navigate(ROUTES.EMPLOYEES);
      }
    } catch (err) {
      console.error("Error saving employee:", err);
      console.error("Error details:", err.response?.data);

      // Better error handling
      let errorMessage = "Failed to save employee data";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = err.response.data.errors;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          errorMessage = validationErrors
            .map((e) => e.message || e.msg)
            .join(", ");
        }
      } else if (err.userMessage) {
        errorMessage = err.userMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    console.log("Next button clicked for step:", activeStep);

    const isStepValid = await validateCurrentStep();
    console.log("Step validation result:", isStepValid);

    if (isStepValid) {
      if (activeStep === steps.length - 1) {
        await handleSubmit(formik.values);
      } else {
        setFormData(formik.values);
        setActiveStep((prev) => prev + 1);
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

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={step.icon}
                  optional={
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
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
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeForm;
