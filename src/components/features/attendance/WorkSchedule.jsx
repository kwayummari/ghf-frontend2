import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getWorkSchedule,
  getHolidays,
  createHoliday,
  selectWorkSchedule,
  selectHolidays,
  selectScheduleLoading,
  selectHolidaysLoading,
  selectAttendanceError,
  clearError,
} from "../../../store/slices/attendanceSlice";
import { useAuth } from "../auth/AuthGuard";
import { ROLES } from "../../../constants";
import attendanceAPI from "../../../services/api/attendance.api";

const holidaySchema = Yup.object({
  name: Yup.string().required("Holiday name is required"),
  date: Yup.date().required("Date is required"),
  is_workday: Yup.boolean(),
});

const WorkSchedule = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();

  const workSchedule = useSelector(selectWorkSchedule);
  const holidays = useSelector(selectHolidays);
  const scheduleLoading = useSelector(selectScheduleLoading);
  const holidaysLoading = useSelector(selectHolidaysLoading);
  const error = useSelector(selectAttendanceError);

  const [editingSchedule, setEditingSchedule] = useState(false);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    monday: { enabled: true, start_time: "08:00", end_time: "17:00" },
    tuesday: { enabled: true, start_time: "08:00", end_time: "17:00" },
    wednesday: { enabled: true, start_time: "08:00", end_time: "17:00" },
    thursday: { enabled: true, start_time: "08:00", end_time: "17:00" },
    friday: { enabled: true, start_time: "08:00", end_time: "17:00" },
    saturday: { enabled: false, start_time: "08:00", end_time: "13:00" },
    sunday: { enabled: false, start_time: "08:00", end_time: "13:00" },
  });

  const isAdmin = hasRole(ROLES.ADMIN);

  useEffect(() => {
    dispatch(getWorkSchedule());
    dispatch(getHolidays({ year: new Date().getFullYear() }));
  }, [dispatch]);

  useEffect(() => {
    if (workSchedule) {
      setScheduleData(workSchedule);
    }
  }, [workSchedule]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      dispatch(clearError());
    }
  }, [error, enqueueSnackbar, dispatch]);

  const holidayFormik = useFormik({
    initialValues: {
      name: "",
      date: null,
      is_workday: false,
    },
    validationSchema: holidaySchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const result = await dispatch(createHoliday(values));

        if (createHoliday.fulfilled.match(result)) {
          enqueueSnackbar("Holiday added successfully", { variant: "success" });
          setHolidayDialogOpen(false);
          resetForm();
        }
      } catch (error) {
        console.error("Failed to create holiday:", error);
      }
    },
  });

  const handleScheduleChange = (day, field, value) => {
    setScheduleData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSaveSchedule = async () => {
    try {
      await attendanceAPI.updateWorkSchedule(1, scheduleData);
      enqueueSnackbar("Work schedule updated successfully", {
        variant: "success",
      });
      setEditingSchedule(false);
    } catch (error) {
      enqueueSnackbar("Failed to update work schedule", { variant: "error" });
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      await attendanceAPI.deleteHoliday(holidayId);
      enqueueSnackbar("Holiday deleted successfully", { variant: "success" });
      dispatch(getHolidays({ year: new Date().getFullYear() }));
    } catch (error) {
      enqueueSnackbar("Failed to delete holiday", { variant: "error" });
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.slice(0, 5); // HH:MM format
  };

  const calculateWorkingHours = (startTime, endTime) => {
    if (!startTime || !endTime) return "0h";

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    const hours = diffMs / (1000 * 60 * 60);

    return `${hours}h`;
  };

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  if (!isAdmin) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Access restricted to administrators only
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Work Schedule & Holidays
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage working hours and holiday calendar
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Work Schedule */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Weekly Work Schedule
                </Typography>

                {!editingSchedule ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditingSchedule(true)}
                  >
                    Edit Schedule
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditingSchedule(false);
                        setScheduleData(workSchedule || scheduleData);
                      }}
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      variant="contained"
                      loading={scheduleLoading}
                      onClick={handleSaveSchedule}
                    >
                      Save Changes
                    </LoadingButton>
                  </Box>
                )}
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell align="center">Enabled</TableCell>
                      <TableCell align="center">Start Time</TableCell>
                      <TableCell align="center">End Time</TableCell>
                      <TableCell align="center">Hours</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {daysOfWeek.map((day) => (
                      <TableRow key={day.key}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {day.label}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={scheduleData[day.key]?.enabled || false}
                            onChange={(e) =>
                              handleScheduleChange(
                                day.key,
                                "enabled",
                                e.target.checked
                              )
                            }
                            disabled={!editingSchedule}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {editingSchedule ? (
                            <TextField
                              type="time"
                              value={
                                scheduleData[day.key]?.start_time || "08:00"
                              }
                              onChange={(e) =>
                                handleScheduleChange(
                                  day.key,
                                  "start_time",
                                  e.target.value
                                )
                              }
                              disabled={!scheduleData[day.key]?.enabled}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                              sx={{ minWidth: 120 }}
                            />
                          ) : (
                            <Typography variant="body2">
                              {formatTime(scheduleData[day.key]?.start_time)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingSchedule ? (
                            <TextField
                              type="time"
                              value={scheduleData[day.key]?.end_time || "17:00"}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day.key,
                                  "end_time",
                                  e.target.value
                                )
                              }
                              disabled={!scheduleData[day.key]?.enabled}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                              sx={{ minWidth: 120 }}
                            />
                          ) : (
                            <Typography variant="body2">
                              {formatTime(scheduleData[day.key]?.end_time)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              scheduleData[day.key]?.enabled
                                ? calculateWorkingHours(
                                    scheduleData[day.key]?.start_time,
                                    scheduleData[day.key]?.end_time
                                  )
                                : "Off"
                            }
                            color={
                              scheduleData[day.key]?.enabled
                                ? "primary"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Schedule Summary
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Working Days
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  {
                    Object.values(scheduleData).filter((day) => day.enabled)
                      .length
                  }
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Weekly Hours
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "success.main" }}
                >
                  {Object.entries(scheduleData)
                    .filter(([_, day]) => day.enabled)
                    .reduce((total, [_, day]) => {
                      const start = new Date(`2000-01-01T${day.start_time}`);
                      const end = new Date(`2000-01-01T${day.end_time}`);
                      const hours = (end - start) / (1000 * 60 * 60);
                      return total + hours;
                    }, 0)}
                  h
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Standard working week is 40 hours (8 hours × 5 days)
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Holidays Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Holiday Calendar
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setHolidayDialogOpen(true)}
                >
                  Add Holiday
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Holiday Name</TableCell>
                      <TableCell align="center">Date</TableCell>
                      <TableCell align="center">Type</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {holidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <EventIcon color="primary" />
                            <Typography variant="subtitle2">
                              {holiday.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {new Date(holiday.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              holiday.is_workday ? "Working Day" : "Non-Working"
                            }
                            color={holiday.is_workday ? "warning" : "success"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {holidays.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No holidays defined for this year
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Holiday Dialog */}
      <Dialog
        open={holidayDialogOpen}
        onClose={() => setHolidayDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={holidayFormik.handleSubmit}>
          <DialogTitle>Add New Holiday</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Holiday Name"
                  value={holidayFormik.values.name}
                  onChange={holidayFormik.handleChange}
                  onBlur={holidayFormik.handleBlur}
                  error={
                    holidayFormik.touched.name &&
                    Boolean(holidayFormik.errors.name)
                  }
                  helperText={
                    holidayFormik.touched.name && holidayFormik.errors.name
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <DatePicker
                  label="Holiday Date"
                  value={holidayFormik.values.date}
                  onChange={(value) =>
                    holidayFormik.setFieldValue("date", value)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      name: "date",
                      onBlur: holidayFormik.handleBlur,
                      error:
                        holidayFormik.touched.date &&
                        Boolean(holidayFormik.errors.date),
                      helperText:
                        holidayFormik.touched.date && holidayFormik.errors.date,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={holidayFormik.values.is_workday}
                      onChange={(e) =>
                        holidayFormik.setFieldValue(
                          "is_workday",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Working Holiday (employees work on this day)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHolidayDialogOpen(false)}>Cancel</Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={holidaysLoading}
            >
              Add Holiday
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default WorkSchedule;
