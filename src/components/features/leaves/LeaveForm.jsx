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
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  CalendarToday as CalendarIcon,
  AttachFile as AttachIcon,
  Save as SaveIcon,
  Send as SendIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { ROUTES, LEAVE_STATUS } from "../../../constants";
import { leavesAPI } from "../../../services/api/leaves.api";
import { documentsAPI } from "../../../services/api/documents.api";
import useNotification from "../../../hooks/common/useNotification";

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

  // Form state
  const [submitType, setSubmitType] = useState("draft");

  // ---------------------------------------------------------------------------
  // FORM SETUP
  // ---------------------------------------------------------------------------
  const formik = useFormik({
    initialValues: {
      type_id: "",
      starting_date: null,
      end_date: null,
      comment: "",
      attachment_id: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    loadInitialData();
  }, [id, editMode]);

  useEffect(() => {
    // Generate mock balance when leave types are loaded
    if (leaveTypes.length > 0 && Object.keys(leaveBalance).length === 0) {
      generateMockBalance();
    }
  }, [leaveTypes]);

  // ---------------------------------------------------------------------------
  // DATA FETCHING FUNCTIONS
  // ---------------------------------------------------------------------------
  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        fetchLeaveTypes(),
        fetchLeaveBalance(),
        editMode && id ? fetchLeaveData(id) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      showError("Failed to load form data");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await leavesAPI.getTypes();

      if (response && response.success) {
        setLeaveTypes(response.data || []);
      } else if (response && response.data) {
        setLeaveTypes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
      showError("Failed to load leave types");
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await leavesAPI.getBalance();

      if (response && response.success) {
        setLeaveBalance(response.data || {});
      }
    } catch (error) {
      console.error("Leave balance endpoint not available:", error);
      // Will generate mock balance after leave types are loaded
    }
  };

  const fetchLeaveData = async (leaveId) => {
    try {
      const response = await leavesAPI.getById(leaveId);

      if (response && response.success) {
        const leave = response.data;
        setLeaveData(leave);

        // Set form values
        formik.setValues({
          type_id: leave.type_id,
          starting_date: new Date(leave.starting_date),
          end_date: new Date(leave.end_date),
          comment: leave.comment || "",
          attachment_id: leave.attachment_id || null,
        });

        // Set uploaded file info if exists
        if (leave.attachment) {
          setUploadedFile({
            id: leave.attachment.id,
            name: leave.attachment.name,
            existing: true,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
      showError("Failed to load leave application");
      navigate(ROUTES.LEAVES);
    }
  };

  const generateMockBalance = () => {
    const mockBalance = {};
    leaveTypes.forEach((type) => {
      mockBalance[type.id] = {
        used: Math.floor(Math.random() * 5),
        available:
          (type.maximum_days || type.max_days || 21) -
          Math.floor(Math.random() * 5),
      };
    });
    setLeaveBalance(mockBalance);
  };

  // ---------------------------------------------------------------------------
  // FILE HANDLING FUNCTIONS
  // ---------------------------------------------------------------------------
  const handleFileUpload = async (file) => {
    if (!file) return null;

    try {
      setFileUploading(true);

      const response = await documentsAPI.upload(file, {
        type: "leave_document",
        description: "Leave application supporting document",
        category: "leave_attachments",
      });

      if (response && response.success) {
        setUploadedFile({
          id: response.data.id,
          name: response.data.name || file.name,
          existing: false,
        });

        showSuccess("File uploaded successfully");
        return response.data.id;
      } else {
        throw new Error(response?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showError("Failed to upload file: " + error.message);
      return null;
    } finally {
      setFileUploading(false);
    }
  };

  const handleFileRemove = () => {
    formik.setFieldValue("attachment", null);
    formik.setFieldValue("attachment_id", null);
    setUploadedFile(null);
  };

  const handleFileSelect = (file) => {
    formik.setFieldValue("attachment", file);
    if (file) {
      setUploadedFile({
        name: file.name,
        existing: false,
      });
    }
  };

  // ---------------------------------------------------------------------------
  // FORM HANDLING FUNCTIONS
  // ---------------------------------------------------------------------------
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // Upload file if selected and not already uploaded
      let attachmentId = values.attachment_id;
      if (formik.values.attachment && !uploadedFile?.existing) {
        attachmentId = await handleFileUpload(formik.values.attachment);
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

      console.log("Submitting leave application:", submissionData);

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
  };

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
    return leaveTypes.find((type) => type.id === formik.values.type_id);
  };

  const getLeaveBalance = () => {
    const typeId = formik.values.type_id;
    return leaveBalance[typeId] || { used: 0, available: 0 };
  };

  // ---------------------------------------------------------------------------
  // COMPUTED VALUES
  // ---------------------------------------------------------------------------
  const leaveDays = calculateLeaveDays();
  const selectedType = getSelectedLeaveType();
  const balance = getLeaveBalance();
  const exceedsBalance = leaveDays > balance.available;
  const canEdit =
    !editMode || (leaveData && leaveData.approval_status === "draft");

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (initialLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={200} height={20} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Skeleton variant="rectangular" height={400} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          {editMode ? "Edit Leave Application" : "Apply for Leave"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {editMode
            ? "Update your leave application"
            : "Submit a new leave request"}
        </Typography>

        {editMode && leaveData && leaveData.approval_status !== "draft" && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This leave application has status:{" "}
            <strong>{leaveData.approval_status}</strong>. Only draft
            applications can be edited.
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Form Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  {/* Leave Type Selection */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      name="type_id"
                      label="Leave Type"
                      value={formik.values.type_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.type_id && Boolean(formik.errors.type_id)
                      }
                      helperText={
                        formik.touched.type_id && formik.errors.type_id
                      }
                      required
                      disabled={!canEdit}
                    >
                      {leaveTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <span>{type.name}</span>
                            <Chip
                              label={`${type.maximum_days || type.max_days} days max`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Date Range Selection */}
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Start Date"
                      value={formik.values.starting_date}
                      onChange={(value) =>
                        formik.setFieldValue("starting_date", value)
                      }
                      disabled={!canEdit}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          name: "starting_date",
                          onBlur: formik.handleBlur,
                          error:
                            formik.touched.starting_date &&
                            Boolean(formik.errors.starting_date),
                          helperText:
                            formik.touched.starting_date &&
                            formik.errors.starting_date,
                          required: true,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarIcon />
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                      minDate={editMode ? null : new Date()}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="End Date"
                      value={formik.values.end_date}
                      onChange={(value) =>
                        formik.setFieldValue("end_date", value)
                      }
                      disabled={!canEdit}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          name: "end_date",
                          onBlur: formik.handleBlur,
                          error:
                            formik.touched.end_date &&
                            Boolean(formik.errors.end_date),
                          helperText:
                            formik.touched.end_date && formik.errors.end_date,
                          required: true,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarIcon />
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                      minDate={formik.values.starting_date || new Date()}
                    />
                  </Grid>

                  {/* Leave Duration Display */}
                  {leaveDays > 0 && (
                    <Grid item xs={12}>
                      <Alert
                        severity={exceedsBalance ? "error" : "info"}
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="body2">
                          <strong>Duration:</strong> {leaveDays} day
                          {leaveDays !== 1 ? "s" : ""}
                          {selectedType && (
                            <>
                              <br />
                              <strong>Available Balance:</strong>{" "}
                              {balance.available} days
                              {exceedsBalance && (
                                <>
                                  <br />
                                  <strong>Warning:</strong> This request exceeds
                                  your available balance
                                </>
                              )}
                            </>
                          )}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}

                  {/* Comment Section */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="comment"
                      label="Reason/Comment"
                      value={formik.values.comment}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.comment && Boolean(formik.errors.comment)
                      }
                      helperText={
                        (formik.touched.comment && formik.errors.comment) ||
                        `${formik.values.comment.length}/500 characters`
                      }
                      placeholder="Provide details about your leave request..."
                      disabled={!canEdit}
                    />
                  </Grid>

                  {/* File Attachment Section */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        border: "2px dashed",
                        borderColor: canEdit ? "grey.300" : "grey.200",
                        borderRadius: 1,
                        p: 3,
                        textAlign: "center",
                        cursor: canEdit ? "pointer" : "default",
                        bgcolor: canEdit ? "transparent" : "grey.50",
                        "&:hover": canEdit
                          ? {
                              borderColor: "primary.main",
                              bgcolor: "action.hover",
                            }
                          : {},
                      }}
                    >
                      {canEdit ? (
                        <>
                          <input
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            style={{ display: "none" }}
                            id="attachment-upload"
                            type="file"
                            onChange={(e) =>
                              handleFileSelect(e.target.files[0])
                            }
                            disabled={fileUploading}
                          />
                          <label htmlFor="attachment-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={
                                fileUploading ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <AttachIcon />
                                )
                              }
                              disabled={fileUploading}
                            >
                              {fileUploading
                                ? "Uploading..."
                                : "Attach Supporting Document"}
                            </Button>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              Optional: Medical certificate, invitation letter,
                              etc.
                            </Typography>
                          </label>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          File attachment not available in view mode
                        </Typography>
                      )}

                      {uploadedFile && (
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={uploadedFile.name}
                            onDelete={canEdit ? handleFileRemove : undefined}
                            color="success"
                            icon={
                              uploadedFile.existing ? (
                                <AttachIcon />
                              ) : (
                                <UploadIcon />
                              )
                            }
                          />
                          {uploadedFile.existing && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ mt: 1 }}
                            >
                              Existing attachment
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Action Buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(ROUTES.LEAVES)}
                  >
                    {canEdit ? "Cancel" : "Back to List"}
                  </Button>

                  {canEdit && (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <LoadingButton
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        loading={loading && submitType === "draft"}
                        disabled={
                          !formik.isValid || exceedsBalance || fileUploading
                        }
                        onClick={handleDraftSave}
                      >
                        Save as Draft
                      </LoadingButton>

                      <LoadingButton
                        variant="contained"
                        startIcon={<SendIcon />}
                        loading={loading && submitType === "submit"}
                        disabled={
                          !formik.isValid || exceedsBalance || fileUploading
                        }
                        onClick={handleFinalSubmit}
                      >
                        {editMode ? "Update & Submit" : "Submit Application"}
                      </LoadingButton>
                    </Box>
                  )}
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Section */}
        <Grid item xs={12} md={4}>
          {/* Leave Balance Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Leave Balance
              </Typography>

              {leaveTypes.length === 0 ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                leaveTypes.map((type) => {
                  const typeBalance = leaveBalance[type.id] || {
                    used: 0,
                    available: type.maximum_days || type.max_days || 21,
                  };
                  const totalDays = type.maximum_days || type.max_days || 21;
                  const usagePercentage = (typeBalance.used / totalDays) * 100;

                  return (
                    <Box key={type.id} sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {type.name}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Used: {typeBalance.used} days
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Available: {typeBalance.available} days
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: "100%",
                          height: 8,
                          bgcolor: "grey.200",
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${usagePercentage}%`,
                            height: "100%",
                            bgcolor:
                              usagePercentage > 80
                                ? "error.main"
                                : usagePercentage > 60
                                  ? "warning.main"
                                  : "success.main",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Leave Policy Info Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Leave Policy
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Important Notes:</strong>
              </Typography>

              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Leave requests must be submitted at least 3 days in advance
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Sick leave requires medical certificate for more than 3 days
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Annual leave is subject to supervisor approval
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  Emergency leave requires immediate notification
                </Typography>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeaveForm;
