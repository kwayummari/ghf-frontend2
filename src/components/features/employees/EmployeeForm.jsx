import React, { useState } from "react";
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
import { ROUTES } from "../../../constants";

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
    label: "Personal Information",
    icon: <ContactIcon />,
    description: "Address, Emergency Contacts",
  },
  {
    label: "Bio Data & Employment",
    icon: <WorkIcon />,
    description: "Education, Employment Details, Documents",
  },
];

// Validation schemas for each step
const basicInfoSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  middle_name: Yup.string(),
  sur_name: Yup.string().required("Surname is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  gender: Yup.string().required("Gender is required"),
  date_of_birth: Yup.date().required("Date of birth is required"),
});

const personalInfoSchema = Yup.object({
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
});

const bioDataSchema = Yup.object({
  department_id: Yup.number().required("Department is required"),
  position: Yup.string().required("Position is required"),
  salary: Yup.number()
    .positive("Salary must be positive")
    .required("Salary is required"),
  hire_date: Yup.date().required("Hire date is required"),
  education_level: Yup.string().required("Education level is required"),
  nida: Yup.string().required("NIDA number is required"),
  bank_name: Yup.string().required("Bank name is required"),
  account_number: Yup.string().required("Account number is required"),
});

const EmployeeForm = ({ editMode = false, initialData = null }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Combined form data
  const [formData, setFormData] = useState({
    // Basic Info
    first_name: "",
    middle_name: "",
    sur_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: null,
    marital_status: "",

    // Personal Info
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
    next_of_kin_relationship: "",

    // Bio Data
    department_id: "",
    position: "",
    salary: "",
    hire_date: null,
    supervisor_id: "",
    education_level: "",
    institution: "",
    graduation_year: "",
    nida: "",
    bima: "",
    nssf: "",
    helsb: "",
    bank_name: "",
    account_number: "",

    ...initialData,
  });

  const getValidationSchema = () => {
    switch (activeStep) {
      case 0:
        return basicInfoSchema;
      case 1:
        return personalInfoSchema;
      case 2:
        return bioDataSchema;
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
        // Final submission
        await handleSubmit(values);
      } else {
        // Move to next step
        setFormData(values);
        setActiveStep((prev) => prev + 1);
      }
    },
  });

  const handleSubmit = async (finalData) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      console.log("Submitting employee data:", finalData);

      // Here you would make the actual API call
      // const response = await employeeAPI.create(finalData);

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay

      // Success
      navigate(ROUTES.EMPLOYEES);
    } catch (err) {
      setError(err.message || "Failed to save employee data");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    formik.handleSubmit();
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
        return <PersonalInfoForm formik={formik} />;
      case 2:
        return <BioDataForm formik={formik} />;
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
              disabled={!formik.isValid}
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
