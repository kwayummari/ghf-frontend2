import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  CalendarToday as CalendarIcon,
  AttachFile as AttachIcon,
  Save as SaveIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { ROUTES, LEAVE_STATUS } from "../../../constants";

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

const LeaveForm = ({ editMode = false, initialData = null }) => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitType, setSubmitType] = useState("draft"); // 'draft' or 'submit'
  const [leaveBalance, setLeaveBalance] = useState({});

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      // Simulate API call for leave types
      const sampleLeaveTypes = [
        {
          id: 1,
          name: "Annual Leave",
          max_days: 21,
          description: "Annual vacation leave",
        },
        {
          id: 2,
          name: "Sick Leave",
          max_days: 14,
          description: "Medical leave",
        },
        {
          id: 3,
          name: "Maternity Leave",
          max_days: 84,
          description: "Maternity leave",
        },
        {
          id: 4,
          name: "Paternity Leave",
          max_days: 7,
          description: "Paternity leave",
        },
        {
          id: 5,
          name: "Emergency Leave",
          max_days: 3,
          description: "Emergency leave",
        },
        {
          id: 6,
          name: "Study Leave",
          max_days: 30,
          description: "Educational leave",
        },
      ];
      setLeaveTypes(sampleLeaveTypes);

      // Simulate leave balance
      setLeaveBalance({
        1: { used: 5, available: 16 }, // Annual Leave
        2: { used: 2, available: 12 }, // Sick Leave
        3: { used: 0, available: 84 }, // Maternity Leave
        4: { used: 0, available: 7 }, // Paternity Leave
        5: { used: 1, available: 2 }, // Emergency Leave
        6: { used: 0, available: 30 }, // Study Leave
      });
    };

    fetchLeaveTypes();
  }, []);

  const formik = useFormik({
    initialValues: {
      type_id: "",
      starting_date: null,
      end_date: null,
      comment: "",
      attachment: null,
      ...initialData,
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const submissionData = {
        ...values,
        approval_status:
          submitType === "draft" ? LEAVE_STATUS.DRAFT : LEAVE_STATUS.PENDING,
        user_id: user.id,
      };

      console.log("Submitting leave application:", submissionData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      navigate(ROUTES.LEAVES);
    } catch (error) {
      console.error("Failed to submit leave application:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const leaveDays = calculateLeaveDays();
  const selectedType = getSelectedLeaveType();
  const balance = getLeaveBalance();
  const exceedsBalance = leaveDays > balance.available;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          {editMode ? "Edit Leave Application" : "Apply for Leave"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {editMode
            ? "Update your leave application"
            : "Submit a new leave request"}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  {/* Leave Type */}
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
                              label={`${type.max_days} days max`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Date Range */}
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Start Date"
                      value={formik.values.starting_date}
                      onChange={(value) =>
                        formik.setFieldValue("starting_date", value)
                      }
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
                      minDate={new Date()}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="End Date"
                      value={formik.values.end_date}
                      onChange={(value) =>
                        formik.setFieldValue("end_date", value)
                      }
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

                  {/* Comment */}
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
                    />
                  </Grid>

                  {/* File Attachment */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        border: "2px dashed",
                        borderColor: "grey.300",
                        borderRadius: 1,
                        p: 3,
                        textAlign: "center",
                        cursor: "pointer",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <input
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        style={{ display: "none" }}
                        id="attachment-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          formik.setFieldValue("attachment", file);
                        }}
                      />
                      <label htmlFor="attachment-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<AttachIcon />}
                        >
                          Attach Supporting Document
                        </Button>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Optional: Medical certificate, invitation letter, etc.
                        </Typography>
                      </label>

                      {formik.values.attachment && (
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={formik.values.attachment.name}
                            onDelete={() =>
                              formik.setFieldValue("attachment", null)
                            }
                            color="success"
                          />
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
                    Cancel
                  </Button>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <LoadingButton
                      variant="outlined"
                      startIcon={<SaveIcon />}
                      loading={loading && submitType === "draft"}
                      disabled={!formik.isValid || exceedsBalance}
                      onClick={() => {
                        setSubmitType("draft");
                        formik.handleSubmit();
                      }}
                    >
                      Save as Draft
                    </LoadingButton>

                    <LoadingButton
                      variant="contained"
                      startIcon={<SendIcon />}
                      loading={loading && submitType === "submit"}
                      disabled={!formik.isValid || exceedsBalance}
                      onClick={() => {
                        setSubmitType("submit");
                        formik.handleSubmit();
                      }}
                    >
                      Submit Application
                    </LoadingButton>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar - Leave Balance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Leave Balance
              </Typography>

              {leaveTypes.map((type) => {
                const typeBalance = leaveBalance[type.id] || {
                  used: 0,
                  available: type.max_days,
                };
                const usagePercentage =
                  (typeBalance.used / type.max_days) * 100;

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
              })}
            </CardContent>
          </Card>

          {/* Leave Policy Info */}
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
