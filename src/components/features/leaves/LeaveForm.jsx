import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Chip,
  InputAdornment,
  CircularProgress,
  Skeleton,
  Paper,
  FormHelperText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  CalendarToday as CalendarIcon,
  AttachFile as AttachIcon,
  Save as SaveIcon,
  Send as SendIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { ROUTES, LEAVE_STATUS } from "../../../constants";
import { leavesAPI } from "../../../services/api/leaves.api";
import { documentsAPI } from "../../../services/api/documents.api";
import useNotification from "../../../hooks/common/useNotification";
import LeaveBalanceWidget from "./LeaveBalanceWidget";

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================
const validationSchema = Yup.object({
  type_id: Yup.number().required("Leave type is required"),
  starting_date: Yup.date()
    .required("Start date is required")
    .min(new Date(), "Start date cannot be in the past"),
  end_date: Yup.date()
    .required("End date is required")
    .min(Yup.ref("starting_date"), "End date must be after start date"),
  comment: Yup.string().max(500, "Comment must be less than 500 characters"),
  // Conditional validation for sick leave attachments
  attachment: Yup.mixed().when("type_id", {
    is: (type_id) => {
      // Will be checked in component logic based on leave type name
      return false; // Default case, will be handled in component
    },
    then: () =>
      Yup.mixed().required("Supporting document is required for sick leave"),
    otherwise: () => Yup.mixed().nullable(),
  }),
  balance: Yup.string(),
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const LeaveForm = ({ editMode = false }) => {
  // ---------------------------------------------------------------------------
  // HOOKS & STATE
  // ---------------------------------------------------------------------------
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector(selectUser);
  const { showSuccess, showError, showWarning } = useNotification();

  // Component state
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveData, setLeaveData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fileUploading, setFileUploading] = useState(false);

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);

  // Form state
  const [submitType, setSubmitType] = useState("submit");

  // ---------------------------------------------------------------------------
  // FORMIK SETUP
  // ---------------------------------------------------------------------------
  const formik = useFormik({
    initialValues: {
      type_id: "",
      starting_date: null,
      end_date: null,
      comment: "",
      attachment: null,
      attachment_id: null,
    },
    validationSchema,
    onSubmit: handleSubmit,
    validate: (values) => {
      const errors = {};

      // Custom validation for sick leave attachment
      const selectedLeaveType = leaveTypes.find(
        (type) => type.id === parseInt(values.type_id)
      );
      if (
        selectedLeaveType &&
        selectedLeaveType.name.toLowerCase().includes("sick")
      ) {
        if (!values.attachment && !values.attachment_id) {
          errors.attachment = "Supporting document is required for sick leave";
        }
      }

      return errors;
    },
  });

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setInitialLoading(true);
        await Promise.all([
          fetchLeaveTypes(),
          editMode && id ? fetchLeaveData() : Promise.resolve(),
          fetchLeaveBalance(),
        ]);
      } catch (error) {
        showError("Failed to initialize form");
      } finally {
        setInitialLoading(false);
      }
    };

    initializeForm();
  }, [editMode, id]);

  // ---------------------------------------------------------------------------
  // DATA FETCHING FUNCTIONS
  // ---------------------------------------------------------------------------
  const fetchLeaveTypes = async () => {
    try {
      const response = await leavesAPI.getTypes();
      if (response && response.success) {
        setLeaveTypes(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
      showError("Failed to load leave types");
    }
  };
  

  const fetchLeaveData = async () => {
    if (!id) return;

    try {
      const response = await leavesAPI.getById(id);
      if (response && response.success) {
        const leave = response.data;
        setLeaveData(leave);

        // Set form values
        formik.setValues({
          type_id: leave.type_id,
          starting_date: new Date(leave.starting_date),
          end_date: new Date(leave.end_date),
          comment: leave.comment || "",
          attachment: null,
          attachment_id: leave.attachment_id,
        });

        // Set uploaded file info if exists
        if (leave.attachment) {
          setUploadedFile({
            name: leave.attachment.name,
            existing: true,
            id: leave.attachment.id,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
      showError("Failed to load leave application");
      navigate(ROUTES.LEAVES);
    }
  };

  const fetchLeaveBalance = async (leaveTypeId) => {
    if (!leaveTypeId) {
      setLeaveBalance(null);
      return;
    }

    try {
      setBalanceLoading(true);
      setBalanceError(null);

      const response = await leavesAPI.getBalance();
      if (response && response.success) {
        const balances = response.data?.balances;

        if (Array.isArray(balances)) {
          const typeBalance = balances.find(
            (balance) => balance.leaveTypeId === parseInt(leaveTypeId)
          );
          setLeaveBalance(typeBalance || null);
        } else {
          console.warn("balances is not an array:", balances);
          setLeaveBalance(null);
        }
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      setBalanceError(error.message);
    } finally {
      setBalanceLoading(false);
    }
    
  };

  const checkLeaveBalance = async (typeId, startDate, endDate) => {
    if (!typeId || !startDate || !endDate) return;

    try {
      const response = await leavesAPI.checkBalance({
        type_id: parseInt(typeId),
        starting_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        exclude_application_id: editMode ? id : null,
      });

      if (response && !response.data.isValid) {
        // Set form error if balance insufficient
        formik.setFieldError("balance", response.data.message);
      } else {
        // Clear balance error if valid
        if (formik.errors.balance) {
          const { balance, ...otherErrors } = formik.errors;
          formik.setErrors(otherErrors);
        }
      }
    } catch (error) {
      console.error("Error checking balance:", error);
      formik.setFieldError("balance", "Could not verify leave balance");
    }
  };

  // ---------------------------------------------------------------------------
  // FILE HANDLING FUNCTIONS
  // ---------------------------------------------------------------------------
  const handleFileUpload = async (file) => {
    try {
      setFileUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "leave_attachment");

      const response = await documentsAPI.upload(formData);
      if (response && response.success) {
        return response.data.id;
      } else {
        throw new Error(response?.message || "Failed to upload file");
      }
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to upload supporting document");
    } finally {
      setFileUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError("File size must be less than 10MB");
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
        showError("Only PDF, Word documents, and images are allowed");
        return;
      }

      formik.setFieldValue("attachment", file);
      setUploadedFile({
        name: file.name,
        existing: false,
      });
    }
  };

  const handleFileRemove = () => {
    formik.setFieldValue("attachment", null);
    formik.setFieldValue("attachment_id", null);
    setUploadedFile(null);
    // Clear the file input
    const fileInput = document.getElementById("attachment-upload");
    if (fileInput) fileInput.value = "";
  };

  useEffect(() => {
    if (formik.values.type_id) {
      fetchLeaveBalance(formik.values.type_id);
    }
  }, [formik.values.type_id]);

  // 6. Add effect to check balance when dates change
  useEffect(() => {
    if (
      formik.values.type_id &&
      formik.values.starting_date &&
      formik.values.end_date
    ) {
      const timer = setTimeout(() => {
        checkLeaveBalance(
          formik.values.type_id,
          formik.values.starting_date,
          formik.values.end_date
        );
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timer);
    }
  }, [
    formik.values.type_id,
    formik.values.starting_date,
    formik.values.end_date,
  ]);

  // ---------------------------------------------------------------------------
  // FORM HANDLING FUNCTIONS
  // ---------------------------------------------------------------------------
  async function handleSubmit(values) {
    setLoading(true);

    try {
      // Upload file if selected and not already uploaded
      let attachmentId = values.attachment_id;
      if (values.attachment && !uploadedFile?.existing) {
        attachmentId = await handleFileUpload(values.attachment);
      }

      const submissionData = {
        type_id: parseInt(values.type_id),
        starting_date: values.starting_date.toISOString().split("T")[0],
        end_date: values.end_date.toISOString().split("T")[0],
        comment: values.comment,
        attachment_id: attachmentId,
        save_as_draft: submitType === "draft",
        submit: submitType === "submit",
      };

      let response;
      if (editMode && id) {
        response = await leavesAPI.update(id, {
          ...submissionData,
          submit: submitType === "submit",
        });
      } else {
        response = await leavesAPI.create(submissionData);
      }

      if (response && response.success) {
        const message = editMode
          ? submitType === "submit"
            ? "Leave application updated and submitted successfully"
            : "Leave application updated successfully"
          : submitType === "submit"
            ? "Leave application submitted successfully"
            : "Leave application saved as draft";

        showSuccess(message);
        navigate(ROUTES.LEAVES);
      } else {
        throw new Error(
          response?.message || "Failed to save leave application"
        );
      }
    } catch (error) {
      console.error("Failed to submit leave application:", error);
      showError(error.message || "Failed to save leave application");
    } finally {
      setLoading(false);
    }
  }

  const handleDraftSave = () => {
    setSubmitType("draft");
    formik.handleSubmit();
  };

  const handleFinalSubmit = () => {
    setSubmitType("submit");
    formik.handleSubmit();
  };

  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------
  const calculateLeaveDays = () => {
    const { starting_date, end_date } = formik.values;
    if (starting_date && end_date) {
      const start = new Date(starting_date);
      const end = new Date(end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const getSelectedLeaveType = () => {
    return leaveTypes.find(
      (type) => type.id === parseInt(formik.values.type_id)
    );
  };

  const shouldShowAttachment = () => {
    const selectedType = getSelectedLeaveType();
    return selectedType && selectedType.name.toLowerCase().includes("sick");
  };

  const canSubmit = () => {
    return (
      formik.isValid &&
      formik.dirty &&
      !loading &&
      !fileUploading &&
      !formik.errors.balance && // Add balance check
      !balanceLoading
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER LOADING STATE
  // ---------------------------------------------------------------------------
  if (initialLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={400}
          sx={{ mt: 2 }}
        />
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {editMode ? "Edit Leave Application" : "Apply for Leave"}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} md={getSelectedLeaveType() ? 8 : 12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leave Details
                </Typography>

                <Grid container spacing={3}>
                  {/* Leave Type */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Leave Type"
                      name="type_id"
                      value={formik.values.type_id}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.type_id && Boolean(formik.errors.type_id)
                      }
                      helperText={
                        formik.touched.type_id && formik.errors.type_id
                      }
                      required
                    >
                      {leaveTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          <Box>
                            <Typography variant="body1">{type.name}</Typography>
                            {type.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {type.description}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {formik.values.type_id && (
                    <Grid item xs={12}>
                      <LeaveBalanceWidget
                        balance={leaveBalance}
                        requestedDays={calculateLeaveDays()}
                        loading={balanceLoading}
                        showRequested={
                          formik.values.starting_date && formik.values.end_date
                        }
                      />
                      {balanceError && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          Error loading balance: {balanceError}
                        </Alert>
                      )}
                      {formik.errors.balance && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {formik.errors.balance}
                        </Alert>
                      )}
                    </Grid>
                  )}

                  {/* Date Range */}
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={formik.values.starting_date}
                      onChange={(date) =>
                        formik.setFieldValue("starting_date", date)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.starting_date &&
                            Boolean(formik.errors.starting_date),
                          helperText:
                            formik.touched.starting_date &&
                            formik.errors.starting_date,
                          required: true,
                        },
                      }}
                      minDate={new Date()}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={formik.values.end_date}
                      onChange={(date) =>
                        formik.setFieldValue("end_date", date)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.end_date &&
                            Boolean(formik.errors.end_date),
                          helperText:
                            formik.touched.end_date && formik.errors.end_date,
                          required: true,
                        },
                      }}
                      minDate={formik.values.starting_date || new Date()}
                    />
                  </Grid>

                  {/* Leave Duration Display */}
                  {formik.values.starting_date && formik.values.end_date && (
                    <Grid item xs={12}>
                      <Alert severity="info" icon={<CalendarIcon />}>
                        <Typography variant="body2">
                          <strong>Duration:</strong> {calculateLeaveDays()} day
                          {calculateLeaveDays() !== 1 ? "s" : ""}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}

                  {/* Supporting Document - Only for Sick Leave */}
                  {shouldShowAttachment() && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Supporting Document
                        <Chip
                          label="Required"
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>

                      {!uploadedFile ? (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 3,
                            textAlign: "center",
                            border:
                              formik.touched.attachment &&
                              formik.errors.attachment
                                ? "1px solid #f44336"
                                : "1px dashed #ccc",
                            borderColor:
                              formik.touched.attachment &&
                              formik.errors.attachment
                                ? "error.main"
                                : "divider",
                          }}
                        >
                          <input
                            id="attachment-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            style={{ display: "none" }}
                          />
                          <label htmlFor="attachment-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<UploadIcon />}
                              disabled={fileUploading}
                            >
                              {fileUploading
                                ? "Uploading..."
                                : "Upload Document"}
                            </Button>
                          </label>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Medical certificate or other supporting document
                            (PDF, DOC, Image)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Max file size: 10MB
                          </Typography>
                        </Paper>
                      ) : (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <AttachIcon color="primary" />
                              <Typography variant="body2">
                                {uploadedFile.name}
                              </Typography>
                              {uploadedFile.existing && (
                                <Chip
                                  label="Existing"
                                  size="small"
                                  color="success"
                                />
                              )}
                            </Box>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={handleFileRemove}
                            >
                              Remove
                            </Button>
                          </Box>
                        </Paper>
                      )}

                      {formik.touched.attachment &&
                        formik.errors.attachment && (
                          <FormHelperText error>
                            {formik.errors.attachment}
                          </FormHelperText>
                        )}
                    </Grid>
                  )}

                  {/* Comment */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Comment (Optional)"
                      name="comment"
                      value={formik.values.comment}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.comment && Boolean(formik.errors.comment)
                      }
                      helperText={
                        formik.touched.comment && formik.errors.comment
                          ? formik.errors.comment
                          : `${formik.values.comment.length}/500 characters`
                      }
                      placeholder="Add any additional information about your leave request..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          width: getSelectedLeaveType() ? "100%" : "50%",
                          gap: 2,
                        }}
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          size="large"
                          onClick={() => navigate(ROUTES.LEAVES)}
                          sx={{
                            color: "red",
                            borderColor: "red",
                            "&:hover": {
                              borderColor: "darkred",
                              backgroundColor: "lightcoral",
                              color: "white",
                            },
                          }}
                        >
                          Cancel
                        </Button>

                        <LoadingButton
                          fullWidth
                          variant="outlined"
                          size="large"
                          startIcon={<SaveIcon />}
                          onClick={handleDraftSave}
                          loading={loading && submitType === "draft"}
                          disabled={!formik.dirty || fileUploading}
                        >
                          Save as Draft
                        </LoadingButton>

                        <LoadingButton
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<SendIcon />}
                          onClick={handleFinalSubmit}
                          loading={loading && submitType === "submit"}
                          disabled={!canSubmit()}
                        >
                          Submit Application
                        </LoadingButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Leave Type Info */}
            {getSelectedLeaveType() && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Leave Type Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getSelectedLeaveType().name}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Minimum Days
                    </Typography>
                    <Typography variant="body1">
                      {getSelectedLeaveType().minimum_days}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Maximum Days
                    </Typography>
                    <Typography variant="body1">
                      {getSelectedLeaveType().maximum_days}
                    </Typography>
                  </Box>

                  {getSelectedLeaveType().description && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {getSelectedLeaveType().description}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Validation Warnings */}
            {!canSubmit() && formik.dirty && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Alert severity="warning" icon={<WarningIcon />}>
                    <Typography variant="body2">
                      Please fix the following issues before submitting:
                    </Typography>
                    <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                      {Object.entries(formik.errors).map(([field, error]) => (
                        <li key={field}>
                          <Typography variant="caption">{error}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default LeaveForm;
