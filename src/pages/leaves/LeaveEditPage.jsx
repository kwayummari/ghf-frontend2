import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  Paper,
  Stack,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { ROUTES } from "../../constants";
import { leavesAPI } from "../../services/api/leaves.api";
import useNotification from "../../hooks/common/useNotification";

// Validation schema
const leaveValidationSchema = Yup.object({
  type_id: Yup.number().required("Leave type is required"),
  starting_date: Yup.date()
    .min(new Date(), "Start date cannot be in the past")
    .required("Start date is required"),
  end_date: Yup.date()
    .min(Yup.ref("starting_date"), "End date must be after start date")
    .required("End date is required"),
  comment: Yup.string().max(500, "Comment cannot exceed 500 characters"),
});

const LeaveEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { showSuccess, showError } = useNotification();

  // State management
  const [leave, setLeave] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch leave details and leave types in parallel
      const [leaveResponse, typesResponse] = await Promise.all([
        leavesAPI.getById(id),
        leavesAPI.getTypes(),
      ]);

      if (leaveResponse && leaveResponse.success) {
        const leaveData = leaveResponse.data;

        // Check if user can edit this leave
        if (leaveData.user_id !== user?.id) {
          showError("You can only edit your own leave applications");
          navigate(ROUTES.LEAVES);
          return;
        }

        // Check if leave is in draft status
        const editableStatuses = ["draft", "rejected"];
        if (!editableStatuses.includes(leaveData.approval_status)) {
          showError("You can only edit draft or rejected leave applications");
          navigate(`${ROUTES.LEAVES}/${id}`);
          return;
        }

        setLeave(leaveData);
      } else {
        throw new Error(
          leaveResponse?.message || "Failed to fetch leave details"
        );
      }

      if (typesResponse && typesResponse.success) {
        setLeaveTypes(typesResponse.data || []);
      } else {
        throw new Error(
          typesResponse?.message || "Failed to fetch leave types"
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showError(error.message || "Failed to load leave data");
      navigate(ROUTES.LEAVES);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      type_id: leave?.type_id || "",
      starting_date: leave?.starting_date || "",
      end_date: leave?.end_date || "",
      comment: leave?.comment || "",
      attachment_id: leave?.attachment_id || null,
    },
    enableReinitialize: true,
    validationSchema: leaveValidationSchema,
    onSubmit: async (values, { setSubmitting: setFormSubmitting }) => {
      // This will be called by handleSave or handleSubmit
      setFormSubmitting(false);
    },
  });

  const handleSave = async () => {
    try {
      setSaving(true);

      const isValid = await formik.validateForm();
      if (Object.keys(isValid).length > 0) {
        formik.setTouched({
          type_id: true,
          starting_date: true,
          end_date: true,
          comment: true,
        });
        showError("Please fix the validation errors");
        return;
      }

      const updateData = {
        ...formik.values,
        submit: false, // Keep as draft
      };

      const response = await leavesAPI.update(id, updateData);

      if (response && response.success) {
        showSuccess("Leave application saved successfully");
        navigate(`${ROUTES.LEAVES}/${id}`);
      } else {
        throw new Error(response?.message || "Failed to save leave");
      }
    } catch (error) {
      console.error("Error saving leave:", error);

      // Handle validation errors specifically
      if (
        error.response?.status === 400 &&
        error.response?.data?.validationErrors
      ) {
        const validationErrors = error.response.data.validationErrors;
        const errorMessage = validationErrors
          .map((err) => err.message)
          .join(", ");
        showError(`Validation failed: ${errorMessage}`);
      } else {
        showError(error.message || "Failed to save leave application");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const isValid = await formik.validateForm();
      if (Object.keys(isValid).length > 0) {
        formik.setTouched({
          type_id: true,
          starting_date: true,
          end_date: true,
          comment: true,
        });
        showError("Please fix the validation errors");
        return;
      }

      const updateData = {
        ...formik.values,
        submit: true, // Submit for approval
      };

      const response = await leavesAPI.update(id, updateData);

      if (response && response.success) {
        showSuccess("Leave application submitted successfully");
        navigate(`${ROUTES.LEAVES}/${id}`);
      } else {
        throw new Error(response?.message || "Failed to submit leave");
      }
    } catch (error) {
      console.error("Error submitting leave:", error);

      // Handle validation errors specifically
      if (
        error.response?.status === 400 &&
        error.response?.data?.validationErrors
      ) {
        const validationErrors = error.response.data.validationErrors;
        const errorMessage = validationErrors
          .map((err) => err.message)
          .join(", ");
        showError(`Validation failed: ${errorMessage}`);
      } else {
        showError(error.message || "Failed to submit leave application");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDays = () => {
    const { starting_date, end_date } = formik.values;
    if (starting_date && end_date) {
      const start = new Date(starting_date);
      const end = new Date(end_date);
      const timeDiff = Math.abs(end - start);
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const getSelectedLeaveType = () => {
    return leaveTypes.find((type) => type.id === formik.values.type_id);
  };

  const validateDuration = () => {
    const selectedType = getSelectedLeaveType();
    const days = calculateDays();

    if (selectedType && days > 0) {
      if (days < selectedType.minimum_days) {
        return `Minimum ${selectedType.minimum_days} days required for ${selectedType.name}`;
      }
      if (days > selectedType.maximum_days) {
        return `Maximum ${selectedType.maximum_days} days allowed for ${selectedType.name}`;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!leave) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Leave application not found or cannot be edited
        </Alert>
      </Box>
    );
  }

  const durationError = validateDuration();
  const calculatedDays = calculateDays();

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate(`${ROUTES.LEAVES}/${id}`)}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Edit Leave Application
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Application #{leave.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || submitting}
          >
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            variant="contained"
            startIcon={
              submitting ? <CircularProgress size={16} /> : <SendIcon />
            }
            onClick={handleSubmit}
            disabled={saving || submitting || !!durationError}
          >
            {submitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </Box>
      </Box>

      {/* Form */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* Leave Type */}
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    required
                    error={
                      formik.touched.type_id && Boolean(formik.errors.type_id)
                    }
                  >
                    <InputLabel>Leave Type</InputLabel>
                    <Select
                      name="type_id"
                      value={formik.values.type_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Leave Type"
                    >
                      <MenuItem value="">Select Leave Type</MenuItem>
                      {leaveTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.type_id && formik.errors.type_id && (
                      <FormHelperText>{formik.errors.type_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Duration Display */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duration"
                    value={
                      calculatedDays > 0
                        ? `${calculatedDays} day${calculatedDays > 1 ? "s" : ""}`
                        : ""
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    helperText={
                      durationError ||
                      (getSelectedLeaveType()
                        ? `Min: ${getSelectedLeaveType().minimum_days}, Max: ${getSelectedLeaveType().maximum_days} days`
                        : "")
                    }
                    error={!!durationError}
                  />
                </Grid>

                {/* Start Date */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Start Date"
                    name="starting_date"
                    type="date"
                    value={formik.values.starting_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.starting_date &&
                      Boolean(formik.errors.starting_date)
                    }
                    helperText={
                      formik.touched.starting_date &&
                      formik.errors.starting_date
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* End Date */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="End Date"
                    name="end_date"
                    type="date"
                    value={formik.values.end_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.end_date && Boolean(formik.errors.end_date)
                    }
                    helperText={
                      formik.touched.end_date && formik.errors.end_date
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* Comment */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Comment/Reason (Optional)"
                    name="comment"
                    multiline
                    rows={4}
                    value={formik.values.comment}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.comment && Boolean(formik.errors.comment)
                    }
                    helperText={formik.touched.comment && formik.errors.comment}
                    placeholder="Please provide a reason for your leave request..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Info & Attachment */}
        <Grid item xs={12} md={4}>
          {/* Leave Type Info */}
          {getSelectedLeaveType() && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leave Type Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">
                      {getSelectedLeaveType().name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Duration Limits
                    </Typography>
                    <Typography variant="body1">
                      {getSelectedLeaveType().minimum_days} -{" "}
                      {getSelectedLeaveType().maximum_days} days
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
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Current Attachment */}
          {leave.attachment && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Attachment
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Paper
                  sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <AttachFileIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {leave.attachment.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {leave.attachment.file_type || "Document"}
                    </Typography>
                  </Box>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              </CardContent>
            </Card>
          )}

          {/* Validation Errors */}
          {durationError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {durationError}
            </Alert>
          )}

          {/* Help Text */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Need Help?
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2" color="text.secondary">
                • Select the appropriate leave type for your request • Ensure
                your dates fall within the allowed duration • Provide a clear
                reason for your leave request • Save as draft to continue
                editing later • Submit for approval when ready
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeaveEditPage;
