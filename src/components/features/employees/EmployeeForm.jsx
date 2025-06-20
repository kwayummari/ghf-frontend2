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
} from "@mui/icons-material";
import BasicInfoForm from "./forms/BasicInfoForm";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import BioDataForm from "./forms/BioDataForm";
import EmploymentDataForm from "./forms/EmploymentDataForm";
import { ROUTES } from "../../../constants";
import { employeesAPI } from "../../../services/api/employees.api";
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
];

// FIXED: Updated validation schemas to match your form structure
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

// FIXED: Updated personal data schema to match the actual form fields
const personalDataSchema = Yup.object({
  personalEmployeeData: Yup.object({
    location: Yup.string().required("Location is required"),
    education_level: Yup.string().required("Education level is required"),
  }),
  // FIXED: Updated field names to match PersonalInfoForm structure
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
  // Made next of kin optional since it's marked as optional in the form
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

const EmployeeForm = ({ editMode = false, initialData = null, onSuccess }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

        // FIXED: Added address field that PersonalInfoForm expects
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

      // FIXED: Added address field
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
      console.log("Form errors:", formik.errors);
      console.log("Form touched:", formik.touched);
      console.log("Form isValid:", formik.isValid);

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

  // Update validation schema when step changes by recreating formik
  useEffect(() => {
    // Reset validation errors when step changes
    formik.setErrors({});
    formik.setTouched({});
  }, [activeStep]);

  // Validate current step only - FIXED: Support nested validation paths
  const validateCurrentStep = async () => {
    const currentSchema = getValidationSchema();
    try {
      await currentSchema.validate(formik.values, { abortEarly: false });
      return true;
    } catch (validationErrors) {
      const errors = {};
      const touched = {};

      validationErrors.inner.forEach((error) => {
        // Handle nested error paths properly
        const path = error.path;
        if (path.includes(".")) {
          // Nested path like "personalEmployeeData.location"
          const pathParts = path.split(".");
          let errorRef = errors;
          let touchedRef = touched;

          // Build nested error structure
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
          // Simple path
          errors[path] = error.message;
          touched[path] = true;
        }
      });

      console.log("Validation errors:", errors);
      console.log("Touched fields:", touched);

      formik.setErrors(errors);
      formik.setTouched(touched);

      return false;
    }
  };

  const handleSubmit = async (finalData) => {
    setLoading(true);
    setError(null);

    try {
      // Transform data to match API expectations
      const apiData = {
        // Basic info (root level)
        first_name: finalData.first_name,
        middle_name: finalData.middle_name,
        sur_name: finalData.sur_name,
        email: finalData.email,
        phone_number: finalData.phone_number,
        gender: finalData.gender,
        status: finalData.status,

        // FIXED: Added address field
        address: finalData.address,

        // Emergency contacts (root level)
        emergency_contact_name: finalData.emergency_contact_name,
        emergency_contact_phone: finalData.emergency_contact_phone,
        emergency_contact_relationship:
          finalData.emergency_contact_relationship,
        next_of_kin_name: finalData.next_of_kin_name,
        next_of_kin_phone: finalData.next_of_kin_phone,
        next_of_kin_relationship: finalData.next_of_kin_relationship,

        // Nested data
        bioData: finalData.bioData,
        personalEmployeeData: finalData.personalEmployeeData,
        basicEmployeeData: finalData.basicEmployeeData,
      };

      let response;
      if (editMode && initialData?.id) {
        response = await employeesAPI.update(initialData.id, apiData);
        showSuccess("Employee updated successfully");
      } else {
        response = await employeesAPI.create(apiData);
        showSuccess("Employee created successfully");
      }

      // Call onSuccess callback if provided
      if (onSuccess && response.data) {
        onSuccess(response.data.data);
      } else {
        navigate(ROUTES.EMPLOYEES);
      }
    } catch (err) {
      console.error("Error saving employee:", err);
      const errorMessage =
        err.userMessage || err.message || "Failed to save employee data";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    console.log("Next button clicked for step:", activeStep);
    console.log("Current form values:", formik.values);

    // Validate current step
    const isStepValid = await validateCurrentStep();
    console.log("Step validation result:", isStepValid);

    if (isStepValid) {
      if (activeStep === steps.length - 1) {
        // Final submission
        await handleSubmit(formik.values);
      } else {
        // Move to next step
        setFormData(formik.values);
        setActiveStep((prev) => prev + 1);
      }
    } else {
      console.log("Form has validation errors, not proceeding");
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
            ? "Update employee information"
            : "Register a new employee in the system"}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ADDED: Debug information (remove this in production) */}
      {/* {process.env.NODE_ENV === "development" && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Debug Info - Step {activeStep}:</strong>
            <br />
            Form Valid: {formik.isValid ? "Yes" : "No"}
            <br />
            Errors:{" "}
            {Object.keys(formik.errors).length > 0
              ? JSON.stringify(formik.errors, null, 2)
              : "None"}
            <br />
            Values:{" "}
            {JSON.stringify(formik.values.personalEmployeeData, null, 2)}
          </Typography>
        </Alert>
      )} */}

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
              disabled={loading}
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
