import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  Alert,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const BioDataForm = ({ formik }) => {
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch departments and supervisors
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API calls - replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 500));

        setDepartments([
          { id: 1, name: "IT Department" },
          { id: 2, name: "Human Resources" },
          { id: 3, name: "Finance" },
          { id: 4, name: "Operations" },
          { id: 5, name: "Administration" },
        ]);

        setSupervisors([
          { id: 1, name: "John Manager", department: "IT Department" },
          { id: 2, name: "Jane Director", department: "Human Resources" },
          { id: 3, name: "Bob Supervisor", department: "Finance" },
          { id: 4, name: "Alice Team Lead", department: "Operations" },
          { id: 5, name: "Mike Administrator", department: "Administration" },
        ]);
      } catch (err) {
        setError("Failed to load departments and supervisors");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const educationLevels = [
    { value: "Primary", label: "Primary Education" },
    { value: "Secondary", label: "Secondary Education" },
    { value: "Certificate", label: "Certificate" },
    { value: "Diploma", label: "Diploma" },
    { value: "Degree", label: "Bachelor's Degree" },
    { value: "Masters", label: "Master's Degree" },
    { value: "PhD", label: "PhD/Doctorate" },
  ];

  const bankOptions = [
    "CRDB Bank",
    "NMB Bank",
    "NBC Bank",
    "Exim Bank",
    "FBME Bank",
    "Standard Chartered",
    "Stanbic Bank",
    "DTB Bank",
    "I&M Bank",
    "Bank of Africa",
    "Azania Bank",
    "Access Bank",
  ];

  const handleFileUpload = (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only PDF, DOC, DOCX, JPG, JPEG, or PNG files");
      return;
    }

    setUploadedFiles((prev) => [
      ...prev.filter((f) => f.type !== fileType),
      { type: fileType, file, name: file.name, size: file.size },
    ]);

    // Update formik values for file
    formik.setFieldValue(`${fileType}_file`, file);
  };

  const removeFile = (fileType) => {
    setUploadedFiles((prev) => prev.filter((f) => f.type !== fileType));
    formik.setFieldValue(`${fileType}_file`, null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const currentYear = new Date().getFullYear();

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: "medium" }}>
        Bio Data & Employment Information
      </Typography>

      {/* Employment Information */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Employment Details
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="department_id"
            label="Department"
            value={formik.values.department_id || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.department_id &&
              Boolean(formik.errors.department_id)
            }
            helperText={
              formik.touched.department_id && formik.errors.department_id
            }
            disabled={loading}
            required
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="position"
            label="Position/Job Title"
            value={formik.values.position || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.position && Boolean(formik.errors.position)}
            helperText={formik.touched.position && formik.errors.position}
            placeholder="e.g., Software Developer, HR Manager"
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="salary"
            label="Monthly Salary (TZS)"
            type="number"
            value={formik.values.salary || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.salary && Boolean(formik.errors.salary)}
            helperText={formik.touched.salary && formik.errors.salary}
            inputProps={{ min: 0, step: 1000 }}
            placeholder="e.g., 1500000"
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <DatePicker
            label="Hire Date"
            value={formik.values.hire_date}
            onChange={(value) => formik.setFieldValue("hire_date", value)}
            slotProps={{
              textField: {
                fullWidth: true,
                name: "hire_date",
                onBlur: formik.handleBlur,
                error:
                  formik.touched.hire_date && Boolean(formik.errors.hire_date),
                helperText: formik.touched.hire_date && formik.errors.hire_date,
                required: true,
              },
            }}
            maxDate={new Date()}
            minDate={new Date("2000-01-01")}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            name="supervisor_id"
            label="Direct Supervisor"
            value={formik.values.supervisor_id || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.supervisor_id &&
              Boolean(formik.errors.supervisor_id)
            }
            helperText={
              formik.touched.supervisor_id && formik.errors.supervisor_id
            }
            disabled={loading}
          >
            <MenuItem value="">
              <em>No supervisor assigned</em>
            </MenuItem>
            {supervisors.map((supervisor) => (
              <MenuItem key={supervisor.id} value={supervisor.id}>
                {supervisor.name} ({supervisor.department})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Education Information */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Education Background
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            name="education_level"
            label="Highest Education Level"
            value={formik.values.education_level || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.education_level &&
              Boolean(formik.errors.education_level)
            }
            helperText={
              formik.touched.education_level && formik.errors.education_level
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

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="institution"
            label="Institution/School Name"
            value={formik.values.institution || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.institution && Boolean(formik.errors.institution)
            }
            helperText={formik.touched.institution && formik.errors.institution}
            placeholder="e.g., University of Dar es Salaam"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="graduation_year"
            label="Graduation Year"
            type="number"
            value={formik.values.graduation_year || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.graduation_year &&
              Boolean(formik.errors.graduation_year)
            }
            helperText={
              formik.touched.graduation_year && formik.errors.graduation_year
            }
            inputProps={{ min: 1950, max: currentYear }}
            placeholder={`e.g., ${currentYear - 2}`}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Government IDs */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Government IDs & Numbers
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            name="nida"
            label="NIDA Number"
            value={formik.values.nida || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.nida && Boolean(formik.errors.nida)}
            helperText={formik.touched.nida && formik.errors.nida}
            placeholder="YYYYMMDD-XXXXX-XXXXX-XX"
            inputProps={{ maxLength: 20 }}
            required
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            name="bima"
            label="BIMA Number"
            value={formik.values.bima || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.bima && Boolean(formik.errors.bima)}
            helperText={formik.touched.bima && formik.errors.bima}
            placeholder="BIMA Number (Optional)"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            name="nssf"
            label="NSSF Number"
            value={formik.values.nssf || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.nssf && Boolean(formik.errors.nssf)}
            helperText={formik.touched.nssf && formik.errors.nssf}
            placeholder="NSSF Number (Optional)"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            name="helsb"
            label="HESLB Number"
            value={formik.values.helsb || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.helsb && Boolean(formik.errors.helsb)}
            helperText={formik.touched.helsb && formik.errors.helsb}
            placeholder="HESLB Number (Optional)"
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="bank_name"
            label="Bank Name"
            value={formik.values.bank_name || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.bank_name && Boolean(formik.errors.bank_name)}
            helperText={formik.touched.bank_name && formik.errors.bank_name}
            required
          >
            {bankOptions.map((bank) => (
              <MenuItem key={bank} value={bank}>
                {bank}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="account_number"
            label="Account Number"
            value={formik.values.account_number || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.account_number &&
              Boolean(formik.errors.account_number)
            }
            helperText={
              formik.touched.account_number && formik.errors.account_number
            }
            placeholder="e.g., 0150123456789"
            inputProps={{ maxLength: 20 }}
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Document Upload */}
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
      >
        Document Upload
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please upload the required documents. Accepted formats: PDF, DOC, DOCX,
        JPG, JPEG, PNG (Max 10MB each)
      </Typography>

      <Grid container spacing={3}>
        {[
          { key: "cv", label: "CV/Resume", required: true },
          {
            key: "certificates",
            label: "Educational Certificates",
            required: false,
          },
          { key: "id_copy", label: "ID Copy (NIDA)", required: true },
          { key: "passport_photo", label: "Passport Photo", required: true },
        ].map((docType) => {
          const uploadedFile = uploadedFiles.find(
            (f) => f.type === docType.key
          );

          return (
            <Grid item xs={12} md={6} key={docType.key}>
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: uploadedFile ? "success.main" : "grey.300",
                  borderRadius: 1,
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
              >
                <input
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  id={`upload-${docType.key}`}
                  type="file"
                  onChange={(e) => handleFileUpload(e, docType.key)}
                />
                <label htmlFor={`upload-${docType.key}`}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 1 }}
                    color={uploadedFile ? "success" : "primary"}
                  >
                    {uploadedFile ? "Change File" : `Upload ${docType.label}`}
                  </Button>
                  {docType.required && (
                    <Typography variant="caption" color="error" display="block">
                      * Required
                    </Typography>
                  )}
                </label>

                {uploadedFile && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={`${uploadedFile.name} (${formatFileSize(uploadedFile.size)})`}
                      onDelete={() => removeFile(docType.key)}
                      deleteIcon={<DeleteIcon />}
                      color="success"
                      size="small"
                      sx={{ maxWidth: "100%" }}
                    />
                  </Box>
                )}
              </Box>

              {/* Error handling for required files */}
              {docType.required &&
                formik.touched[`${docType.key}_file`] &&
                !uploadedFile && (
                  <FormHelperText error>
                    {docType.label} is required
                  </FormHelperText>
                )}
            </Grid>
          );
        })}
      </Grid>

      {/* File upload instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>File Upload Guidelines:</strong>
          <br />
          • Maximum file size: 10MB per file
          <br />
          • Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
          <br />
          • Ensure all required documents are uploaded before proceeding
          <br />• Files marked with * are mandatory for employee registration
        </Typography>
      </Alert>
    </Box>
  );
};

export default BioDataForm;
