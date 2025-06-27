import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Autocomplete,
  Breadcrumbs,
  Link as MUILink,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  VideoCall as VideoIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Assignment as AgendaIcon,
  Home as HomeIcon,
  Group as MeetingIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, addMinutes, differenceInMinutes } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import { LoadingSpinner } from "../../components/common/Loading";
import meetingsAPI from "../../services/api/meetings.api";

const MeetingCreatePage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Basic Information", "Attendees", "Agenda", "Review & Create"];

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    meeting_title: "",
    description: "",
    meeting_type: "team",
    meeting_date: null,
    start_time: null,
    end_time: null,
    location: "",
    is_virtual: false,
    meeting_link: "",
    chairperson:
      user?.first_name && user?.sur_name
        ? `${user.first_name} ${user.sur_name}`
        : "",
    organizer:
      user?.first_name && user?.sur_name
        ? `${user.first_name} ${user.sur_name}`
        : "",
    agenda_items: [],
    attendees: [],
    is_recurring: false,
    recurrence_pattern: "",
    max_attendees: null,
    require_confirmation: true,
    send_invitations: true,
  });

  // Dialog states
  const [attendeeDialogOpen, setAttendeeDialogOpen] = useState(false);
  const [agendaDialogOpen, setAgendaDialogOpen] = useState(false);

  // New attendee form
  const [newAttendee, setNewAttendee] = useState({
    name: "",
    email: "",
    role: "attendee",
    required: true,
  });

  // New agenda item form
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: "",
    description: "",
    duration: 15,
    presenter: "",
    order: 1,
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Meeting types and other options
  const meetingTypes = [
    { value: "board", label: "Board Meeting" },
    { value: "management", label: "Management Meeting" },
    { value: "department", label: "Department Meeting" },
    { value: "team", label: "Team Meeting" },
    { value: "project", label: "Project Meeting" },
    { value: "one_on_one", label: "One-on-One" },
    { value: "client", label: "Client Meeting" },
  ];

  const attendeeRoles = [
    { value: "organizer", label: "Organizer" },
    { value: "presenter", label: "Presenter" },
    { value: "attendee", label: "Attendee" },
    { value: "observer", label: "Observer" },
  ];

  // Form validation
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.meeting_title.trim()) {
          newErrors.meeting_title = "Meeting title is required";
        }
        if (!formData.meeting_date) {
          newErrors.meeting_date = "Meeting date is required";
        }
        if (!formData.start_time) {
          newErrors.start_time = "Start time is required";
        }
        if (!formData.end_time) {
          newErrors.end_time = "End time is required";
        }
        if (formData.start_time && formData.end_time) {
          // Compare times properly by looking at hours and minutes
          const startTime = new Date(formData.start_time);
          const endTime = new Date(formData.end_time);

          // Extract hours and minutes for comparison
          const startMinutes =
            startTime.getHours() * 60 + startTime.getMinutes();
          const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

          if (endMinutes <= startMinutes) {
            newErrors.end_time = "End time must be after start time";
          }
        }
        if (!formData.chairperson.trim()) {
          newErrors.chairperson = "Chairperson is required";
        }
        if (formData.is_virtual && !formData.meeting_link.trim()) {
          newErrors.meeting_link =
            "Meeting link is required for virtual meetings";
        }
        if (!formData.is_virtual && !formData.location.trim()) {
          newErrors.location = "Location is required for in-person meetings";
        }
        break;

      case 1: // Attendees
        if (formData.attendees.length === 0) {
          newErrors.attendees = "At least one attendee is required";
        }
        break;

      case 2: // Agenda
        // Agenda is optional, but if provided, validate items
        formData.agenda_items.forEach((item, index) => {
          if (!item.title.trim()) {
            newErrors[`agenda_${index}_title`] =
              "Agenda item title is required";
          }
        });
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      setSubmitting(true);

      // Prepare the meeting data with proper validation
      const meetingData = {
        meeting_title: formData.meeting_title.trim(),
        description: formData.description?.trim() || "",
        meeting_type: formData.meeting_type,
        meeting_date: formData.meeting_date
          ? format(formData.meeting_date, "yyyy-MM-dd")
          : null,
        // Backend expects HH:MM format, not HH:mm:ss
        start_time: formData.start_time
          ? format(formData.start_time, "HH:mm")
          : null,
        end_time: formData.end_time ? format(formData.end_time, "HH:mm") : null,
        location: formData.location?.trim() || "",
        is_virtual: Boolean(formData.is_virtual),
        meeting_link: formData.meeting_link?.trim() || "",
        chairperson: formData.chairperson.trim(),
        organizer: formData.organizer.trim(),
        // Backend expects array of strings for agenda_items, not JSON string
        agenda_items: formData.agenda_items.map((item) => item.title) || [],
        // Include attendees in the main request since backend handles them
        attendees:
          formData.attendees.map((attendee) => ({
            name: attendee.name,
            email: attendee.email,
            role: attendee.role || "attendee",
            is_required: Boolean(attendee.required),
          })) || [],
      };

      // Remove null/undefined values
      Object.keys(meetingData).forEach((key) => {
        if (
          meetingData[key] === null ||
          meetingData[key] === undefined ||
          meetingData[key] === ""
        ) {
          delete meetingData[key];
        }
      });

      console.log("Creating meeting with data:", meetingData);

      // Create the meeting with attendees - backend handles them together
      const response = await meetingsAPI.createMeeting(meetingData);
      const createdMeeting = response.data?.meeting || response.data;

      console.log("Meeting created successfully:", createdMeeting);

      showSuccess("Meeting created successfully!");

      // Navigate to the created meeting details page
      navigate(`/meetings/${createdMeeting.id}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to create meeting";

      // Better error handling
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors
            .map((err) => err.msg || err.message || err)
            .join(", ");
        } else if (typeof errors === "object") {
          errorMessage = Object.values(errors).flat().join(", ");
        }
      } else if (error.response?.status === 400) {
        errorMessage =
          "Invalid meeting data. Please check all required fields.";
      }

      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle adding attendee
  const handleAddAttendee = () => {
    if (!newAttendee.name.trim() || !newAttendee.email.trim()) {
      showError("Please provide both name and email for the attendee");
      return;
    }

    // Check for duplicate email
    if (
      formData.attendees.some(
        (attendee) => attendee.email === newAttendee.email
      )
    ) {
      showError("An attendee with this email already exists");
      return;
    }

    setFormData({
      ...formData,
      attendees: [...formData.attendees, { ...newAttendee, id: Date.now() }],
    });

    setNewAttendee({
      name: "",
      email: "",
      role: "attendee",
      required: true,
    });

    setAttendeeDialogOpen(false);
    showSuccess("Attendee added successfully");
  };

  // Handle removing attendee
  const handleRemoveAttendee = (attendeeId) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter(
        (attendee) => attendee.id !== attendeeId
      ),
    });
    showSuccess("Attendee removed");
  };

  // Handle adding agenda item
  const handleAddAgendaItem = () => {
    if (!newAgendaItem.title.trim()) {
      showError("Please provide a title for the agenda item");
      return;
    }

    setFormData({
      ...formData,
      agenda_items: [
        ...formData.agenda_items,
        {
          ...newAgendaItem,
          id: Date.now(),
          order: formData.agenda_items.length + 1,
        },
      ],
    });

    setNewAgendaItem({
      title: "",
      description: "",
      duration: 15,
      presenter: "",
      order: formData.agenda_items.length + 2,
    });

    setAgendaDialogOpen(false);
    showSuccess("Agenda item added successfully");
  };

  // Handle removing agenda item
  const handleRemoveAgendaItem = (itemId) => {
    setFormData({
      ...formData,
      agenda_items: formData.agenda_items.filter((item) => item.id !== itemId),
    });
    showSuccess("Agenda item removed");
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // Handle previous step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Auto-calculate end time when start time changes
  useEffect(() => {
    if (formData.start_time && !formData.end_time) {
      const defaultDuration = 60; // 1 hour default
      const newEndTime = new Date(formData.start_time);
      newEndTime.setMinutes(newEndTime.getMinutes() + defaultDuration);
      setFormData((prev) => ({
        ...prev,
        end_time: newEndTime,
      }));
    }
  }, [formData.start_time]);

  // Calculate meeting duration
  const getMeetingDuration = () => {
    if (formData.start_time && formData.end_time) {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);

      // Handle case where times might be on different dates
      if (endTime < startTime) {
        // Add 24 hours to end time if it's on the next day
        endTime.setDate(endTime.getDate() + 1);
      }

      return Math.abs(differenceInMinutes(endTime, startTime));
    }
    return 0;
  };

  // Get breadcrumb navigation
  const getBreadcrumbs = () => {
    return [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: "Meetings",
        href: "/meetings",
        icon: <MeetingIcon fontSize="small" />,
      },
      {
        label: "Create Meeting",
        current: true,
        icon: <AddIcon fontSize="small" />,
      },
    ];
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Basic Meeting Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Title"
                value={formData.meeting_title}
                onChange={(e) =>
                  setFormData({ ...formData, meeting_title: e.target.value })
                }
                error={!!errors.meeting_title}
                helperText={errors.meeting_title}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Meeting Type</InputLabel>
                <Select
                  value={formData.meeting_type}
                  label="Meeting Type"
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_type: e.target.value })
                  }
                >
                  {meetingTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Meeting Date & Time"
                  value={formData.meeting_date}
                  onChange={(newValue) => {
                    setFormData({
                      ...formData,
                      meeting_date: newValue,
                      start_time: newValue,
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.meeting_date,
                      helperText: errors.meeting_date,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={formData.start_time}
                  onChange={(newValue) => {
                    if (newValue && formData.meeting_date) {
                      // Set the time on the meeting date
                      const startDateTime = new Date(formData.meeting_date);
                      startDateTime.setHours(newValue.getHours());
                      startDateTime.setMinutes(newValue.getMinutes());
                      startDateTime.setSeconds(0);

                      setFormData({ ...formData, start_time: startDateTime });
                    } else {
                      setFormData({ ...formData, start_time: newValue });
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.start_time,
                      helperText: errors.start_time,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="End Time"
                  value={formData.end_time}
                  onChange={(newValue) => {
                    if (newValue && formData.meeting_date) {
                      // Set the time on the meeting date
                      const endDateTime = new Date(formData.meeting_date);
                      endDateTime.setHours(newValue.getHours());
                      endDateTime.setMinutes(newValue.getMinutes());
                      endDateTime.setSeconds(0);

                      setFormData({ ...formData, end_time: endDateTime });
                    } else {
                      setFormData({ ...formData, end_time: newValue });
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.end_time,
                      helperText: errors.end_time,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {getMeetingDuration() > 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Meeting duration: {getMeetingDuration()} minutes
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_virtual}
                    onChange={(e) =>
                      setFormData({ ...formData, is_virtual: e.target.checked })
                    }
                  />
                }
                label="Virtual Meeting"
              />
            </Grid>

            {formData.is_virtual ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Link"
                  value={formData.meeting_link}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_link: e.target.value })
                  }
                  error={!!errors.meeting_link}
                  helperText={errors.meeting_link}
                  placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
                  InputProps={{
                    startAdornment: (
                      <VideoIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  required
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  error={!!errors.location}
                  helperText={errors.location}
                  InputProps={{
                    startAdornment: (
                      <LocationIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  required
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chairperson"
                value={formData.chairperson}
                onChange={(e) =>
                  setFormData({ ...formData, chairperson: e.target.value })
                }
                error={!!errors.chairperson}
                helperText={errors.chairperson}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organizer"
                value={formData.organizer}
                onChange={(e) =>
                  setFormData({ ...formData, organizer: e.target.value })
                }
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Meeting Attendees</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAttendeeDialogOpen(true)}
                >
                  Add Attendee
                </Button>
              </Box>

              {errors.attendees && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.attendees}
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              {formData.attendees.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <PersonIcon
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No attendees added yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add attendees to invite them to this meeting
                  </Typography>
                </Box>
              ) : (
                <List>
                  {formData.attendees.map((attendee) => (
                    <ListItem key={attendee.id} divider>
                      <Avatar sx={{ mr: 2 }}>
                        {attendee.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={attendee.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {attendee.email}
                            </Typography>
                            <Chip
                              label={attendee.role}
                              size="small"
                              color={
                                attendee.role === "organizer"
                                  ? "primary"
                                  : "default"
                              }
                              sx={{ mt: 0.5 }}
                            />
                            {attendee.required && (
                              <Chip
                                label="Required"
                                size="small"
                                color="error"
                                sx={{ mt: 0.5, ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveAttendee(attendee.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Meeting Agenda</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAgendaDialogOpen(true)}
                >
                  Add Agenda Item
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              {formData.agenda_items.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <AgendaIcon
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No agenda items added
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add agenda items to structure your meeting (optional)
                  </Typography>
                </Box>
              ) : (
                <List>
                  {formData.agenda_items.map((item, index) => (
                    <ListItem key={item.id} divider>
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        {index + 1}
                      </Avatar>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <Box>
                            {item.description && (
                              <Typography variant="body2">
                                {item.description}
                              </Typography>
                            )}
                            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                              <Chip
                                label={`${item.duration} min`}
                                size="small"
                              />
                              {item.presenter && (
                                <Chip
                                  label={`Presenter: ${item.presenter}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveAgendaItem(item.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Review Meeting Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Meeting Information
                  </Typography>
                  <Typography>
                    <strong>Title:</strong> {formData.meeting_title}
                  </Typography>
                  <Typography>
                    <strong>Type:</strong>{" "}
                    {
                      meetingTypes.find(
                        (t) => t.value === formData.meeting_type
                      )?.label
                    }
                  </Typography>
                  <Typography>
                    <strong>Date:</strong>{" "}
                    {formData.meeting_date
                      ? format(formData.meeting_date, "PPP")
                      : "Not set"}
                  </Typography>
                  <Typography>
                    <strong>Time:</strong>{" "}
                    {formData.start_time && formData.end_time
                      ? `${format(formData.start_time, "p")} - ${format(formData.end_time, "p")}`
                      : "Not set"}
                  </Typography>
                  <Typography>
                    <strong>Duration:</strong> {getMeetingDuration()} minutes
                  </Typography>
                  <Typography>
                    <strong>Location:</strong>{" "}
                    {formData.is_virtual
                      ? "Virtual Meeting"
                      : formData.location}
                  </Typography>
                  {formData.is_virtual && formData.meeting_link && (
                    <Typography>
                      <strong>Link:</strong> {formData.meeting_link}
                    </Typography>
                  )}
                  <Typography>
                    <strong>Chairperson:</strong> {formData.chairperson}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendees ({formData.attendees.length})
                  </Typography>
                  {formData.attendees.slice(0, 5).map((attendee) => (
                    <Typography key={attendee.id}>
                      • {attendee.name} ({attendee.role})
                    </Typography>
                  ))}
                  {formData.attendees.length > 5 && (
                    <Typography color="text.secondary">
                      ... and {formData.attendees.length - 5} more
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {formData.agenda_items.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Agenda Items ({formData.agenda_items.length})
                    </Typography>
                    {formData.agenda_items.map((item, index) => (
                      <Typography key={item.id}>
                        {index + 1}. {item.title} ({item.duration} min)
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Alert severity="info">
                Once you create this meeting, invitations will be sent to all
                attendees (if enabled).
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          {getBreadcrumbs().map((crumb, index) =>
            crumb.current ? (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                {crumb.icon}
                <Typography color="text.primary">{crumb.label}</Typography>
              </Box>
            ) : (
              <MUILink
                key={index}
                underline="hover"
                color="inherit"
                href={crumb.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(crumb.href);
                }}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                {crumb.icon}
                {crumb.label}
              </MUILink>
            )
          )}
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate("/meetings")} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Create New Meeting
          </Typography>
        </Box>

        {/* Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </CardContent>

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>

            <Box sx={{ display: "flex", gap: 1 }}>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  startIcon={<SaveIcon />}
                >
                  {submitting ? "Creating..." : "Create Meeting"}
                </Button>
              )}
            </Box>
          </Box>
        </Card>

        {/* Add Attendee Dialog */}
        <Dialog
          open={attendeeDialogOpen}
          onClose={() => setAttendeeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Attendee</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={newAttendee.name}
                  onChange={(e) =>
                    setNewAttendee({ ...newAttendee, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newAttendee.email}
                  onChange={(e) =>
                    setNewAttendee({ ...newAttendee, email: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={newAttendee.role}
                    label="Role"
                    onChange={(e) =>
                      setNewAttendee({ ...newAttendee, role: e.target.value })
                    }
                  >
                    {attendeeRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newAttendee.required}
                      onChange={(e) =>
                        setNewAttendee({
                          ...newAttendee,
                          required: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Required Attendee"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAttendeeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAttendee} variant="contained">
              Add Attendee
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Agenda Item Dialog */}
        <Dialog
          open={agendaDialogOpen}
          onClose={() => setAgendaDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Agenda Item</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={newAgendaItem.title}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={newAgendaItem.description}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      description: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={newAgendaItem.duration}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      duration: parseInt(e.target.value) || 15,
                    })
                  }
                  inputProps={{ min: 1, max: 300 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Presenter"
                  value={newAgendaItem.presenter}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      presenter: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAgendaDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAgendaItem} variant="contained">
              Add Item
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default MeetingCreatePage;
