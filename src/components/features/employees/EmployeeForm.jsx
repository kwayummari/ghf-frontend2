import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { departmentsAPI } from "../../../services/api/departments.api";
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
  IconButton,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";
import {
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
} from "@mui/icons-material";
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
      sx={{ position: "relative", ...sx }}
      {...props}
    >
      {children}
    </Button>
  );
};

// Format salary with comma separators
const formatSalary = (value) => {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Parse salary removing commas
const parseSalary = (value) => {
  if (!value) return "";
  return value.replace(/,/g, "");
};

// Format NIDA with proper separators
const formatNIDA = (value) => {
  if (!value) return "";
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");

  // Tanzania NIDA format: 20000424-15112-0000-123
  if (digits.length <= 8) {
    return digits;
  } else if (digits.length <= 13) {
    return `${digits.slice(0, 8)}-${digits.slice(8)}`;
  } else if (digits.length <= 17) {
    return `${digits.slice(0, 8)}-${digits.slice(8, 13)}-${digits.slice(13)}`;
  } else {
    return `${digits.slice(0, 8)}-${digits.slice(8, 13)}-${digits.slice(13, 17)}-${digits.slice(17, 20)}`;
  }
};

// Validate NIDA format
const validateNIDA = (value) => {
  if (!value) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length === 20;
};

// Required field label component
const RequiredLabel = ({ children }) => (
  <span>
    {children} <span style={{ color: "red" }}>*</span>
  </span>
);

const steps = [
  {
    label: "Personal Information",
    icon: <PersonIcon />,
  },
  {
    label: "Contact & Personal Data",
    icon: <ContactIcon />,
  },
  {
    label: "Employment & Roles",
    icon: <WorkIcon />,
  },
];


const contactPersonalDataSchema = Yup.object({
  personalEmployeeData: Yup.object({
    location: Yup.string().required("Location is required"),
    education_level: Yup.string().required("Education level is required"),
  }),
  address: Yup.string().required("Address is required"),
  emergency_contacts: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().required("Emergency contact name is required"),
        phone_number: Yup.string().required(
          "Emergency contact phone is required"
        ),
        relationship: Yup.string().required("Relationship is required"),
      })
    )
    .min(1, "At least one emergency contact is required"),
});

const employmentRolesSchema = Yup.object({
  basicEmployeeData: Yup.object({
    department_id: Yup.number().required("Department is required"),
    designation: Yup.string().required("Designation is required"),
    salary: Yup.number()
      .positive("Salary must be positive")
      .required("Salary is required"),
    date_joined: Yup.date().required("Date joined is required"),
    employment_type: Yup.string().required("Employment type is required"),
    nida: Yup.string()
      .test(
        "nida-format",
        "Invalid NIDA format. Must be 20 digits",
        validateNIDA
      )
      .required("NIDA number is required"),
    bank_name: Yup.string().required("Bank name is required"),
    account_number: Yup.string().required("Account number is required"),
  }),
  role_ids: Yup.array()
    .of(Yup.number())
    .min(1, "At least one role must be assigned")
    .required("Role assignment is required"),
});

// Emergency Contact Component
const EmergencyContactSection = ({ formik }) => {
  const addEmergencyContact = () => {
    const currentContacts = formik.values.emergency_contacts || [];
    formik.setFieldValue("emergency_contacts", [
      ...currentContacts,
      { name: "", phone_number: "", relationship: "" },
    ]);
  };

  const removeEmergencyContact = (index) => {
    const currentContacts = formik.values.emergency_contacts || [];
    const updatedContacts = currentContacts.filter((_, i) => i !== index);
    formik.setFieldValue("emergency_contacts", updatedContacts);
  };

  const updateEmergencyContact = (index, field, value) => {
    const currentContacts = formik.values.emergency_contacts || [];
    const updatedContacts = [...currentContacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    formik.setFieldValue("emergency_contacts", updatedContacts);
  };

  const emergencyContacts = formik.values.emergency_contacts || [
    { name: "", phone_number: "", relationship: "" },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">
          <RequiredLabel>Emergency Contacts</RequiredLabel>
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={addEmergencyContact}
          variant="outlined"
          size="small"
        >
          Add Contact
        </Button>
      </Box>

      {emergencyContacts.map((contact, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2, border: "1px solid #e0e0e0" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle2">
              Emergency Contact {index + 1}
            </Typography>
            {emergencyContacts.length > 1 && (
              <IconButton
                onClick={() => removeEmergencyContact(index)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Full Name"
                value={contact.name || ""}
                onChange={(e) =>
                  updateEmergencyContact(index, "name", e.target.value)
                }
                error={
                  formik.touched.emergency_contacts?.[index]?.name &&
                  Boolean(formik.errors.emergency_contacts?.[index]?.name)
                }
                helperText={
                  formik.touched.emergency_contacts?.[index]?.name &&
                  formik.errors.emergency_contacts?.[index]?.name
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                value={contact.phone_number || ""}
                onChange={(e) =>
                  updateEmergencyContact(index, "phone_number", e.target.value)
                }
                error={
                  formik.touched.emergency_contacts?.[index]?.phone_number &&
                  Boolean(
                    formik.errors.emergency_contacts?.[index]?.phone_number
                  )
                }
                helperText={
                  formik.touched.emergency_contacts?.[index]?.phone_number &&
                  formik.errors.emergency_contacts?.[index]?.phone_number
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={contact.relationship || ""}
                  onChange={(e) =>
                    updateEmergencyContact(
                      index,
                      "relationship",
                      e.target.value
                    )
                  }
                  label="Relationship"
                  error={
                    formik.touched.emergency_contacts?.[index]?.relationship &&
                    Boolean(
                      formik.errors.emergency_contacts?.[index]?.relationship
                    )
                  }
                >
                  <MenuItem value="spouse">Spouse</MenuItem>
                  <MenuItem value="parent">Parent</MenuItem>
                  <MenuItem value="sibling">Sibling</MenuItem>
                  <MenuItem value="child">Child</MenuItem>
                  <MenuItem value="friend">Friend</MenuItem>
                  <MenuItem value="colleague">Colleague</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {formik.touched.emergency_contacts?.[index]?.relationship &&
                  formik.errors.emergency_contacts?.[index]?.relationship && (
                    <FormHelperText error>
                      {formik.errors.emergency_contacts?.[index]?.relationship}
                    </FormHelperText>
                  )}
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

// Next of Kin Component
const NextOfKinSection = ({ formik }) => {
  const addNextOfKin = () => {
    const currentKin = formik.values.next_of_kin || [];
    formik.setFieldValue("next_of_kin", [
      ...currentKin,
      { name: "", phone_number: "", relationship: "", percentage: 0 },
    ]);
  };

  const removeNextOfKin = (index) => {
    const currentKin = formik.values.next_of_kin || [];
    const updatedKin = currentKin.filter((_, i) => i !== index);
    formik.setFieldValue("next_of_kin", updatedKin);
  };

  const updateNextOfKin = (index, field, value) => {
    const currentKin = formik.values.next_of_kin || [];
    const updatedKin = [...currentKin];
    updatedKin[index] = { ...updatedKin[index], [field]: value };
    formik.setFieldValue("next_of_kin", updatedKin);
  };

  const nextOfKin = formik.values.next_of_kin || [
    { name: "", phone_number: "", relationship: "", percentage: 100 },
  ];
  const totalPercentage = nextOfKin.reduce(
    (sum, kin) => sum + (parseFloat(kin.percentage) || 0),
    0
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Next of Kin</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={addNextOfKin}
          variant="outlined"
          size="small"
        >
          Add Next of Kin
        </Button>
      </Box>

      {totalPercentage !== 100 && nextOfKin.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Total percentage must equal 100%. Current total: {totalPercentage}%
        </Alert>
      )}

      {nextOfKin.map((kin, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2, border: "1px solid #e0e0e0" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle2">Next of Kin {index + 1}</Typography>
            {nextOfKin.length > 1 && (
              <IconButton
                onClick={() => removeNextOfKin(index)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Full Name"
                value={kin.name || ""}
                onChange={(e) => updateNextOfKin(index, "name", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Phone Number"
                value={kin.phone_number || ""}
                onChange={(e) =>
                  updateNextOfKin(index, "phone_number", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={kin.relationship || ""}
                  onChange={(e) =>
                    updateNextOfKin(index, "relationship", e.target.value)
                  }
                  label="Relationship"
                >
                  <MenuItem value="spouse">Spouse</MenuItem>
                  <MenuItem value="parent">Parent</MenuItem>
                  <MenuItem value="sibling">Sibling</MenuItem>
                  <MenuItem value="child">Child</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Percentage (%)"
                type="number"
                value={kin.percentage || ""}
                onChange={(e) =>
                  updateNextOfKin(
                    index,
                    "percentage",
                    parseFloat(e.target.value) || 0
                  )
                }
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

// Personal Information Form (Basic Info + Bio Data combined)
const PersonalInfoForm = ({ formik, editMode }) => (
  <Box>
    {/* Basic Information Section */}
    <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
      Basic Information
    </Typography>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="First Name"
          name="first_name"
          value={formik.values.first_name}
          onChange={formik.handleChange}
          error={formik.touched.first_name && Boolean(formik.errors.first_name)}
          helperText={formik.touched.first_name && formik.errors.first_name}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Middle Name"
          name="middle_name"
          value={formik.values.middle_name}
          onChange={formik.handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Surname"
          name="sur_name"
          value={formik.values.sur_name}
          onChange={formik.handleChange}
          error={formik.touched.sur_name && Boolean(formik.errors.sur_name)}
          helperText={formik.touched.sur_name && formik.errors.sur_name}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Phone Number"
          name="phone_number"
          value={formik.values.phone_number}
          onChange={formik.handleChange}
          error={
            formik.touched.phone_number && Boolean(formik.errors.phone_number)
          }
          helperText={formik.touched.phone_number && formik.errors.phone_number}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth required>
          <InputLabel>Gender</InputLabel>
          <Select
            name="gender"
            value={formik.values.gender}
            onChange={formik.handleChange}
            error={formik.touched.gender && Boolean(formik.errors.gender)}
            label="Gender"
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
          {formik.touched.gender && formik.errors.gender && (
            <FormHelperText error>{formik.errors.gender}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} md={editMode ? 12 : 6}>
        <FormControl fullWidth required>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            label="Status"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          disabled={editMode}
          required={!editMode}
        />
      </Grid>
    </Grid>

    <Divider sx={{ my: 3 }} />

    {/* Bio Data Section */}
    <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
      Biographical Data
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          name="bioData.dob"
          type="date"
          value={formik.values.bioData?.dob || ""}
          onChange={formik.handleChange}
          error={
            formik.touched.bioData?.dob && Boolean(formik.errors.bioData?.dob)
          }
          helperText={formik.touched.bioData?.dob && formik.errors.bioData?.dob}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Marital Status</InputLabel>
          <Select
            name="bioData.marital_status"
            value={formik.values.bioData?.marital_status || ""}
            onChange={formik.handleChange}
            label="Marital Status"
          >
            <MenuItem value="single">Single</MenuItem>
            <MenuItem value="married">Married</MenuItem>
            <MenuItem value="divorced">Divorced</MenuItem>
            <MenuItem value="widowed">Widowed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Blood Group</InputLabel>
          <Select
            name="bioData.blood_group"
            value={formik.values.bioData?.blood_group || ""}
            onChange={formik.handleChange}
            label="Blood Group"
          >
            <MenuItem value="">Select Blood Group</MenuItem>
            <MenuItem value="A+">A+</MenuItem>
            <MenuItem value="A-">A-</MenuItem>
            <MenuItem value="B+">B+</MenuItem>
            <MenuItem value="B-">B-</MenuItem>
            <MenuItem value="AB+">AB+</MenuItem>
            <MenuItem value="AB-">AB-</MenuItem>
            <MenuItem value="O+">O+</MenuItem>
            <MenuItem value="O-">O-</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="National ID (NIDA)"
          name="bioData.national_id"
          value={formik.values.bioData?.national_id || ""}
          onChange={(e) => {
            const formatted = formatNIDA(e.target.value);
            formik.setFieldValue("bioData.national_id", formatted);
          }}
          error={
            formik.touched.bioData?.national_id &&
            Boolean(formik.errors.bioData?.national_id)
          }
          helperText={
            formik.touched.bioData?.national_id &&
            formik.errors.bioData?.national_id
          }
          placeholder="********-*****-****-***"
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Fingerprint ID"
          name="bioData.fingerprint_id"
          value={formik.values.bioData?.fingerprint_id || ""}
          onChange={formik.handleChange}
        />
      </Grid>
    </Grid>
  </Box>
);

// Contact & Personal Data Form
const ContactPersonalDataForm = ({ formik }) => (
  <Box>
    {/* Location and Education Section */}
    <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
      Location & Education
    </Typography>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Location"
          name="personalEmployeeData.location"
          value={formik.values.personalEmployeeData?.location || ""}
          onChange={formik.handleChange}
          error={
            formik.touched.personalEmployeeData?.location &&
            Boolean(formik.errors.personalEmployeeData?.location)
          }
          helperText={
            formik.touched.personalEmployeeData?.location &&
            formik.errors.personalEmployeeData?.location
          }
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Education Level</InputLabel>
          <Select
            name="personalEmployeeData.education_level"
            value={formik.values.personalEmployeeData?.education_level || ""}
            onChange={formik.handleChange}
            label="Education Level"
          >
            <MenuItem value="">Select Education Level</MenuItem>
            <MenuItem value="Primary">Primary</MenuItem>
            <MenuItem value="Secondary">Secondary</MenuItem>
            <MenuItem value="Certificate">Certificate</MenuItem>
            <MenuItem value="Diploma">Diploma</MenuItem>
            <MenuItem value="Bachelor">Bachelor</MenuItem>
            <MenuItem value="Master">Master</MenuItem>
            <MenuItem value="PhD">PhD</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          name="address"
          multiline
          rows={2}
          value={formik.values.address || ""}
          onChange={formik.handleChange}
          error={formik.touched.address && Boolean(formik.errors.address)}
          helperText={formik.touched.address && formik.errors.address}
          required
        />
      </Grid>
    </Grid>

    <Divider sx={{ my: 3 }} />
    <EmergencyContactSection formik={formik} />

    <Divider sx={{ my: 3 }} />
    <NextOfKinSection formik={formik} />
  </Box>
);

// Employment & Roles Form (combined without tabs)
const EmploymentRolesForm = ({
  formik,
  departments,
  departmentsLoading,
  availableRoles,
  rolesLoading,
}) => {
  const handleRoleChange = (event) => {
    const value = event.target.value;
    formik.setFieldValue("role_ids", value);
  };

  return (
    <Box>
      {/* Employment Data Section */}
      <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
        Employment Information
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Registration Number"
            name="basicEmployeeData.registration_number"
            value={formik.values.basicEmployeeData?.registration_number || ""}
            onChange={formik.handleChange}
            error={
              formik.touched.basicEmployeeData?.registration_number &&
              Boolean(formik.errors.basicEmployeeData?.registration_number)
            }
            helperText={
              formik.touched.basicEmployeeData?.registration_number &&
              formik.errors.basicEmployeeData?.registration_number
            }
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Department</InputLabel>
            <Select
              name="basicEmployeeData.department_id"
              value={formik.values.basicEmployeeData?.department_id || ""}
              onChange={formik.handleChange}
              label="Department"
              disabled={departmentsLoading}
            >
              <MenuItem value="">Select Department</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.department_name || dept.name}
                </MenuItem>
              ))}
            </Select>
            {departmentsLoading && (
              <FormHelperText>Loading departments...</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Designation"
            name="basicEmployeeData.designation"
            value={formik.values.basicEmployeeData?.designation || ""}
            onChange={formik.handleChange}
            error={
              formik.touched.basicEmployeeData?.designation &&
              Boolean(formik.errors.basicEmployeeData?.designation)
            }
            helperText={
              formik.touched.basicEmployeeData?.designation &&
              formik.errors.basicEmployeeData?.designation
            }
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Salary"
            name="basicEmployeeData.salary"
            value={formatSalary(formik.values.basicEmployeeData?.salary || "")}
            onChange={(e) => {
              const parsed = parseSalary(e.target.value);
              formik.setFieldValue("basicEmployeeData.salary", parsed);
            }}
            error={
              formik.touched.basicEmployeeData?.salary &&
              Boolean(formik.errors.basicEmployeeData?.salary)
            }
            helperText={
              formik.touched.basicEmployeeData?.salary &&
              formik.errors.basicEmployeeData?.salary
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">TZS</InputAdornment>
              ),
            }}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date Joined"
            name="basicEmployeeData.date_joined"
            type="date"
            value={formik.values.basicEmployeeData?.date_joined || ""}
            onChange={formik.handleChange}
            error={
              formik.touched.basicEmployeeData?.date_joined &&
              Boolean(formik.errors.basicEmployeeData?.date_joined)
            }
            helperText={
              formik.touched.basicEmployeeData?.date_joined &&
              formik.errors.basicEmployeeData?.date_joined
            }
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Employment Type</InputLabel>
            <Select
              name="basicEmployeeData.employment_type"
              value={formik.values.basicEmployeeData?.employment_type || ""}
              onChange={formik.handleChange}
              error={
                formik.touched.basicEmployeeData?.employment_type &&
                Boolean(formik.errors.basicEmployeeData?.employment_type)
              }
              label="Employment Type"
            >
              <MenuItem value="full time">Full Time</MenuItem>
              <MenuItem value="part time">Part Time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="intern">Intern</MenuItem>
              <MenuItem value="volunteer">Volunteer</MenuItem>
            </Select>
            {formik.touched.basicEmployeeData?.employment_type &&
              formik.errors.basicEmployeeData?.employment_type && (
                <FormHelperText error>
                  {formik.errors.basicEmployeeData?.employment_type}
                </FormHelperText>
              )}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="NIDA Number"
            name="basicEmployeeData.nida"
            value={formik.values.basicEmployeeData?.nida || ""}
            onChange={(e) => {
              const formatted = formatNIDA(e.target.value);
              formik.setFieldValue("basicEmployeeData.nida", formatted);
            }}
            error={
              formik.touched.basicEmployeeData?.nida &&
              Boolean(formik.errors.basicEmployeeData?.nida)
            }
            helperText={
              formik.touched.basicEmployeeData?.nida &&
              formik.errors.basicEmployeeData?.nida
            }
            placeholder="20000424-15112-0000-123"
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="NSSF Number"
            name="basicEmployeeData.nssf"
            value={formik.values.basicEmployeeData?.nssf || ""}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="INSURANCE Number"
            name="basicEmployeeData.bima"
            value={formik.values.basicEmployeeData?.bima || ""}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="HELSB Number"
            name="basicEmployeeData.helsb"
            value={formik.values.basicEmployeeData?.helsb || ""}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Bank Name"
            name="basicEmployeeData.bank_name"
            value={formik.values.basicEmployeeData?.bank_name || ""}
            onChange={formik.handleChange}
            error={
              formik.touched.basicEmployeeData?.bank_name &&
              Boolean(formik.errors.basicEmployeeData?.bank_name)
            }
            helperText={
              formik.touched.basicEmployeeData?.bank_name &&
              formik.errors.basicEmployeeData?.bank_name
            }
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Account Number"
            name="basicEmployeeData.account_number"
            value={formik.values.basicEmployeeData?.account_number || ""}
            onChange={formik.handleChange}
            error={
              formik.touched.basicEmployeeData?.account_number &&
              Boolean(formik.errors.basicEmployeeData?.account_number)
            }
            helperText={
              formik.touched.basicEmployeeData?.account_number &&
              formik.errors.basicEmployeeData?.account_number
            }
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Role Assignment Section */}
      <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
        <RequiredLabel>Role Assignment</RequiredLabel>
      </Typography>

      {rolesLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading roles...</Typography>
        </Box>
      ) : (
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
      )}
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

  // State for roles
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const response = await departmentsAPI.getAllDepartments();
        console.log("Fetched Departments:", response.data);
        setDepartments(response.data.departments || []);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        showError("Failed to load departments");
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

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

  const personalInfoSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    sur_name: Yup.string().required("Surname is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone_number: Yup.string().required("Phone number is required"),
    gender: Yup.string().required("Gender is required"),
    password: editMode
      ? Yup.string()
      : Yup.string().required("Password is required"),
    bioData: Yup.object({
      dob: Yup.date().required("Date of birth is required"),
      national_id: Yup.string()
        .test(
          "nida-format",
          "Invalid NIDA format. Must be 20 digits",
          validateNIDA
        )
        .required("National ID is required"),
    }),
  });

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
        password: editMode ? "" : "",

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
        emergency_contacts: initialData.emergency_contacts || [
          { name: "", phone_number: "", relationship: "" },
        ],
        next_of_kin: initialData.next_of_kin || [
          { name: "", phone_number: "", relationship: "", percentage: 100 },
        ],

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
      emergency_contacts: [{ name: "", phone_number: "", relationship: "" }],
      next_of_kin: [
        { name: "", phone_number: "", relationship: "", percentage: 100 },
      ],

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
        return personalInfoSchema;
      case 1:
        return contactPersonalDataSchema;
      case 2:
        return employmentRolesSchema;
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
      const currentStepData = getCurrentStepData();
      await employeesAPI.updatePartial(initialData.id, currentStepData);

      setSavedSteps((prev) => new Set([...prev, activeStep]));
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
          bioData: formik.values.bioData,
        };
      case 1:
        return {
          personalEmployeeData: formik.values.personalEmployeeData,
          address: formik.values.address,
          emergency_contacts: formik.values.emergency_contacts,
          next_of_kin: formik.values.next_of_kin,
        };
      case 2:
        return {
          basicEmployeeData: formik.values.basicEmployeeData,
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
      const apiData = {
        first_name: values.first_name,
        middle_name: values.middle_name,
        sur_name: values.sur_name,
        email: values.email,
        phone_number: values.phone_number,
        gender: values.gender,
        status: values.status,
        address: values.address,
        ...(formik.values.password &&
          !editMode && { password: formik.values.password }),

        basic_employee_data: values.basicEmployeeData,
        bio_data: {
          ...values.bioData,
          dob: values.bioData.dob
            ? new Date(values.bioData.dob).toISOString().split("T")[0]
            : null,
        },
        personal_employee_data: values.personalEmployeeData,
        emergency_contacts: values.emergency_contacts,
        next_of_kin: values.next_of_kin,
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

  // Allow direct navigation to any step
  const handleStepClick = (stepIndex) => {
    setActiveStep(stepIndex);
  };

  const handleNext = async () => {
    // For last step, always proceed to submit
    if (activeStep === steps.length - 1) {
      const isStepValid = await validateCurrentStep();
      if (isStepValid) {
        await handleSubmit(formik.values);
      }
      return;
    }

    // For other steps, just move to next without validation requirement
    setFormData(formik.values);
    setActiveStep((prev) => prev + 1);
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
        return <PersonalInfoForm formik={formik} editMode={editMode} />; // Add editMode prop
      case 1:
        return <ContactPersonalDataForm formik={formik} />;
      case 2:
        return (
          <EmploymentRolesForm
            formik={formik}
            departments={departments}
            departmentsLoading={departmentsLoading}
            availableRoles={availableRoles}
            rolesLoading={rolesLoading}
          />
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
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: "pointer" }}
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
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  startIcon={<NavigateBeforeIcon />}
                >
                  Back
                </Button>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Save Button - Show in edit mode for all steps */}
              {editMode && (
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
                disabled={loading || (activeStep === 2 && rolesLoading)}
                endIcon={
                  activeStep === steps.length - 1 ? null : <NavigateNextIcon />
                }
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
