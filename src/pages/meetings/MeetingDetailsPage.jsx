// Enhanced MeetingDetailsPage.jsx with Full API Integration

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Badge,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Breadcrumbs,
  Link as MUILink,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  VideoCall as VideoIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Assignment as AgendaIcon,
  Task as TaskIcon,
  Note as NotesIcon,
  AttachFile as AttachmentIcon,
  RecordVoiceOver as RecordingIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon,
  Replay as RecurringIcon,
  Notifications as ReminderIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  DateRange as DateIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  PlayArrow as StartIcon,
  Stop as EndIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Group as MeetingIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  format,
  differenceInMinutes,
  addMinutes,
  isBefore,
  isAfter,
} from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
import meetingsAPI from "../../services/api/meetings.api";

const MeetingDetailsPage = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [meeting, setMeeting] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [agendaItems, setAgendaItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [attendeeDialogOpen, setAttendeeDialogOpen] = useState(false);
  const [agendaDialogOpen, setAgendaDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    meeting_title: "",
    description: "",
    meeting_date: null,
    start_time: null,
    end_time: null,
    location: "",
    meeting_link: "",
    meeting_type: "team",
    is_virtual: false,
    chairperson: "",
    organizer: "",
    status: "scheduled",
  });

  const [newAttendee, setNewAttendee] = useState({
    email: "",
    name: "",
    role: "attendee",
    required: true,
  });

  const [newAgendaItem, setNewAgendaItem] = useState({
    title: "",
    description: "",
    duration: 15,
    presenter: "",
    order: 1,
  });

  const [newNote, setNewNote] = useState({
    content: "",
    note_type: "general",
    is_action_item: false,
  });

  // Meeting types and statuses based on your DB schema
  const meetingTypes = [
    { value: "board", label: "Board Meeting", icon: <LocationIcon /> },
    { value: "management", label: "Management", icon: <PeopleIcon /> },
    { value: "department", label: "Department", icon: <PeopleIcon /> },
    { value: "team", label: "Team", icon: <PeopleIcon /> },
    { value: "project", label: "Project", icon: <AgendaIcon /> },
    { value: "one_on_one", label: "One-on-One", icon: <PersonIcon /> },
    { value: "client", label: "Client Meeting", icon: <VideoIcon /> },
  ];

  const meetingStatuses = [
    { value: "scheduled", label: "Scheduled", color: "info" },
    { value: "in_progress", label: "In Progress", color: "warning" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "error" },
  ];

  const attendeeStatuses = [
    { value: "accepted", label: "Accepted", color: "success" },
    { value: "tentative", label: "Tentative", color: "warning" },
    { value: "declined", label: "Declined", color: "error" },
    { value: "pending", label: "Pending", color: "default" },
  ];

  // Load meeting data
  useEffect(() => {
    if (meetingId) {
      fetchMeetingDetails();
    }
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching meeting details for ID: ${meetingId}`);

      // Fetch meeting data
      const meetingResponse = await meetingsAPI.getMeetingById(meetingId);
      console.log("Meeting response:", meetingResponse);

      const meetingData = meetingResponse.data?.meeting || meetingResponse.data;
      setMeeting(meetingData);

      // Fetch related data in parallel
      await Promise.all([fetchAttendees(), fetchTasks(), fetchDocuments()]);

      // Parse agenda items from JSON if stored in DB
      if (meetingData.agenda_items) {
        try {
          const agenda =
            typeof meetingData.agenda_items === "string"
              ? JSON.parse(meetingData.agenda_items)
              : meetingData.agenda_items;
          setAgendaItems(Array.isArray(agenda) ? agenda : []);
        } catch (error) {
          console.error("Error parsing agenda items:", error);
          setAgendaItems([]);
        }
      }

      console.log("Meeting details loaded successfully");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      showError(
        `Failed to fetch meeting details: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async () => {
    try {
      console.log(`Fetching attendees for meeting ${meetingId}`);
      const response = await meetingsAPI.getMeetingAttendees(meetingId);
      const attendeesData = response.data?.attendees || response.data || [];
      setAttendees(Array.isArray(attendeesData) ? attendeesData : []);
      console.log(`Loaded ${attendeesData.length} attendees`);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      // Don't show error for attendees as it might not be implemented yet
      setAttendees([]);
    }
  };

  const fetchTasks = async () => {
    try {
      console.log(`Fetching tasks for meeting ${meetingId}`);
      const response = await meetingsAPI.getMeetingTasks(meetingId);
      const tasksData = response.data?.tasks || response.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      console.log(`Loaded ${tasksData.length} tasks`);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Don't show error for tasks as it might not be implemented yet
      setTasks([]);
    }
  };

  const fetchDocuments = async () => {
    try {
      console.log(`Fetching documents for meeting ${meetingId}`);
      const response = await meetingsAPI.getMeetingDocuments(meetingId);
      const documentsData = response.data?.documents || response.data || [];
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
      console.log(`Loaded ${documentsData.length} documents`);
    } catch (error) {
      console.error("Error fetching documents:", error);
      // Don't show error for documents as it might not be implemented yet
      setDocuments([]);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMeetingDetails();
    setRefreshing(false);
    showSuccess("Meeting data refreshed successfully");
  };

  // Handle meeting actions
  const handleEditMeeting = () => {
    if (!meeting) return;

    setEditForm({
      meeting_title: meeting.meeting_title || "",
      description: meeting.description || "",
      meeting_date: meeting.meeting_date
        ? new Date(meeting.meeting_date)
        : null,
      start_time: meeting.start_time
        ? new Date(`${meeting.meeting_date}T${meeting.start_time}`)
        : null,
      end_time: meeting.end_time
        ? new Date(`${meeting.meeting_date}T${meeting.end_time}`)
        : null,
      location: meeting.location || "",
      meeting_link: meeting.meeting_link || "",
      meeting_type: meeting.meeting_type || "team",
      is_virtual: meeting.is_virtual || false,
      chairperson: meeting.chairperson || "",
      organizer: meeting.organizer || "",
      status: meeting.status || "scheduled",
    });
    setEditDialogOpen(true);
  };

  const handleSaveMeeting = async () => {
    try {
      console.log("Updating meeting:", editForm);

      // Format the data according to your DB schema
      const updateData = {
        meeting_title: editForm.meeting_title,
        description: editForm.description,
        meeting_date: editForm.meeting_date
          ? format(editForm.meeting_date, "yyyy-MM-dd")
          : null,
        start_time: editForm.start_time
          ? format(editForm.start_time, "HH:mm:ss")
          : null,
        end_time: editForm.end_time
          ? format(editForm.end_time, "HH:mm:ss")
          : null,
        location: editForm.location,
        meeting_link: editForm.meeting_link,
        meeting_type: editForm.meeting_type,
        is_virtual: editForm.is_virtual,
        chairperson: editForm.chairperson,
        organizer: editForm.organizer,
        status: editForm.status,
      };

      await meetingsAPI.updateMeeting(meetingId, updateData);
      showSuccess("Meeting updated successfully");
      setEditDialogOpen(false);
      await fetchMeetingDetails();
    } catch (error) {
      console.error("Error updating meeting:", error);
      showError(
        `Failed to update meeting: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleDeleteMeeting = () => {
    openDialog({
      title: "Delete Meeting",
      message:
        "Are you sure you want to delete this meeting? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await meetingsAPI.deleteMeeting(meetingId);
          showSuccess("Meeting deleted successfully");
          navigate("/meetings");
        } catch (error) {
          console.error("Error deleting meeting:", error);
          showError(
            `Failed to delete meeting: ${error.response?.data?.message || error.message}`
          );
        }
      },
    });
  };

  const handleStartMeeting = async () => {
    try {
      await meetingsAPI.updateMeetingStatus(meetingId, "in_progress");
      showSuccess("Meeting started");
      await fetchMeetingDetails();
    } catch (error) {
      console.error("Error starting meeting:", error);
      showError(
        `Failed to start meeting: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleEndMeeting = async () => {
    try {
      await meetingsAPI.updateMeetingStatus(meetingId, "completed");
      showSuccess("Meeting ended");
      await fetchMeetingDetails();
    } catch (error) {
      console.error("Error ending meeting:", error);
      showError(
        `Failed to end meeting: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Handle attendee management
  const handleAddAttendee = async () => {
    try {
      console.log("Adding attendee:", newAttendee);
      await meetingsAPI.addMeetingAttendee(meetingId, newAttendee);
      showSuccess("Attendee added successfully");
      setAttendeeDialogOpen(false);
      setNewAttendee({ email: "", name: "", role: "attendee", required: true });
      await fetchAttendees();
    } catch (error) {
      console.error("Error adding attendee:", error);
      showError(
        `Failed to add attendee: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Handle agenda management
  const handleAddAgendaItem = async () => {
    try {
      console.log("Adding agenda item:", newAgendaItem);

      // For now, we'll update the agenda_items JSON field
      const currentAgenda = meeting.agenda_items
        ? typeof meeting.agenda_items === "string"
          ? JSON.parse(meeting.agenda_items)
          : meeting.agenda_items
        : [];

      const newAgenda = [
        ...currentAgenda,
        { ...newAgendaItem, id: Date.now() },
      ];

      await meetingsAPI.updateMeeting(meetingId, {
        agenda_items: JSON.stringify(newAgenda),
      });
      showSuccess("Agenda item added successfully");
      setAgendaDialogOpen(false);
      setNewAgendaItem({
        title: "",
        description: "",
        duration: 15,
        presenter: "",
        order: 1,
      });
      await fetchMeetingDetails();
    } catch (error) {
      console.error("Error adding agenda item:", error);
      showError(
        `Failed to add agenda item: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Handle notes management
  const handleAddNote = async () => {
    try {
      console.log("Adding note:", newNote);
      // This would require a separate notes API endpoint
      // For now, we'll show a message that this feature needs backend implementation
      showError("Notes feature requires backend implementation");
      setNotesDialogOpen(false);
      setNewNote({ content: "", note_type: "general", is_action_item: false });
    } catch (error) {
      console.error("Error adding note:", error);
      showError(
        `Failed to add note: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Calculate meeting metrics
  const getMeetingDuration = () => {
    if (!meeting || !meeting.start_time || !meeting.end_time) return 0;

    const startTime = new Date(`${meeting.meeting_date}T${meeting.start_time}`);
    const endTime = new Date(`${meeting.meeting_date}T${meeting.end_time}`);

    return differenceInMinutes(endTime, startTime);
  };

  const getAttendanceRate = () => {
    const acceptedAttendees = attendees.filter(
      (a) => a.status === "accepted"
    ).length;
    return attendees.length > 0
      ? (acceptedAttendees / attendees.length) * 100
      : 0;
  };

  const getAgendaProgress = () => {
    const completedItems = agendaItems.filter(
      (item) => item.status === "completed"
    ).length;
    return agendaItems.length > 0
      ? (completedItems / agendaItems.length) * 100
      : 0;
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
        label: meeting?.meeting_title || `Meeting ${meetingId}`,
        current: true,
        icon: <AgendaIcon fontSize="small" />,
      },
    ];
  };

  // Format date/time for display
  const formatMeetingDateTime = (date, startTime, endTime) => {
    if (!date) return "Not specified";

    const meetingDate = format(new Date(date), "dd/MM/yyyy");
    const start = startTime
      ? format(new Date(`${date}T${startTime}`), "HH:mm")
      : "";
    const end = endTime ? format(new Date(`${date}T${endTime}`), "HH:mm") : "";

    return `${meetingDate} ${start}${end ? ` - ${end}` : ""}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!meeting) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Meeting not found</Alert>
      </Box>
    );
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
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <IconButton onClick={() => navigate("/meetings")}>
              <BackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {meeting.meeting_title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              {meeting.status === "scheduled" &&
                hasPermission(PERMISSIONS.UPDATE_MEETINGS) && (
                  <Button
                    variant="contained"
                    startIcon={<StartIcon />}
                    onClick={handleStartMeeting}
                    color="success"
                  >
                    Start Meeting
                  </Button>
                )}
              {meeting.status === "in_progress" &&
                hasPermission(PERMISSIONS.UPDATE_MEETINGS) && (
                  <Button
                    variant="contained"
                    startIcon={<EndIcon />}
                    onClick={handleEndMeeting}
                    color="error"
                  >
                    End Meeting
                  </Button>
                )}
              {hasPermission(PERMISSIONS.UPDATE_MEETINGS) && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditMeeting}
                >
                  Edit
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showSuccess("Meeting link copied to clipboard");
                }}
              >
                Share
              </Button>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Meeting Status and Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={
                meetingStatuses.find((s) => s.value === meeting.status)
                  ?.label || meeting.status
              }
              color={
                meetingStatuses.find((s) => s.value === meeting.status)
                  ?.color || "default"
              }
              variant="filled"
            />
            <Chip
              label={
                meetingTypes.find((t) => t.value === meeting.meeting_type)
                  ?.label || meeting.meeting_type
              }
              icon={
                meetingTypes.find((t) => t.value === meeting.meeting_type)?.icon
              }
              variant="outlined"
            />
            {meeting.is_virtual && (
              <Chip
                label="Virtual Meeting"
                icon={<VideoIcon />}
                color="info"
                variant="outlined"
              />
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {formatMeetingDateTime(
                  meeting.meeting_date,
                  meeting.start_time,
                  meeting.end_time
                )}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {getMeetingDuration()} minutes
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Meeting Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h6">{attendees.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendees
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getAttendanceRate().toFixed(0)}% confirmed
                    </Typography>
                  </Box>
                  <PeopleIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h6">{agendaItems.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Agenda Items
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getAgendaProgress().toFixed(0)}% completed
                    </Typography>
                  </Box>
                  <AgendaIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h6">{tasks.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Action Items
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tasks.filter((t) => t.status === "completed").length}{" "}
                      completed
                    </Typography>
                  </Box>
                  <TaskIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h6">{documents.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Documents
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Attachments & files
                    </Typography>
                  </Box>
                  <AttachmentIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Meeting Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Tab label="Overview" />
                  <Tab label="Agenda" />
                  <Tab label="Attendees" />
                  <Tab label="Tasks" />
                  <Tab label="Documents" />
                </Tabs>

                {/* Overview Tab */}
                {activeTab === 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Meeting Description
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                          {meeting.description || "No description provided."}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Meeting Details
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: "primary.main" }}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <MUIListItemText
                              primary="Chairperson"
                              secondary={meeting.chairperson || "Not specified"}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: "info.main" }}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <MUIListItemText
                              primary="Organizer"
                              secondary={meeting.organizer || "Not specified"}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: "success.main" }}>
                                <LocationIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <MUIListItemText
                              primary="Location"
                              secondary={meeting.location || "Not specified"}
                            />
                          </ListItem>
                          {meeting.meeting_link && (
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "warning.main" }}>
                                  <LinkIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <MUIListItemText
                                primary="Meeting Link"
                                secondary={
                                  <Button
                                    href={meeting.meeting_link}
                                    target="_blank"
                                    size="small"
                                    startIcon={<VideoIcon />}
                                  >
                                    Join Meeting
                                  </Button>
                                }
                              />
                            </ListItem>
                          )}
                        </List>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Meeting Progress
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Agenda Progress
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getAgendaProgress()}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {
                              agendaItems.filter(
                                (item) => item.status === "completed"
                              ).length
                            }{" "}
                            of {agendaItems.length} items completed
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Attendance Rate
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getAttendanceRate()}
                            sx={{ height: 8, borderRadius: 4 }}
                            color="success"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {
                              attendees.filter((a) => a.status === "accepted")
                                .length
                            }{" "}
                            of {attendees.length} attendees confirmed
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Agenda Tab */}
                {activeTab === 1 && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">Meeting Agenda</Typography>
                      {hasPermission(PERMISSIONS.UPDATE_MEETINGS) && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setAgendaDialogOpen(true)}
                        >
                          Add Item
                        </Button>
                      )}
                    </Box>

                    {agendaItems.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <AgendaIcon
                          sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          No agenda items
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add agenda items to structure your meeting
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {agendaItems.map((item, index) => (
                          <React.Fragment key={item.id || index}>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    bgcolor:
                                      item.status === "completed"
                                        ? "success.main"
                                        : item.status === "in_progress"
                                          ? "warning.main"
                                          : "grey.400",
                                  }}
                                >
                                  {index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <MUIListItemText
                                primary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography variant="subtitle1">
                                      {item.title}
                                    </Typography>
                                    <Chip
                                      label={`${item.duration || 15} min`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    {item.status && (
                                      <Chip
                                        label={item.status}
                                        size="small"
                                        color={
                                          item.status === "completed"
                                            ? "success"
                                            : item.status === "in_progress"
                                              ? "warning"
                                              : "default"
                                        }
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2">
                                      {item.description}
                                    </Typography>
                                    {item.presenter && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Presenter: {item.presenter}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < agendaItems.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Box>
                )}

                {/* Attendees Tab */}
                {activeTab === 2 && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">Meeting Attendees</Typography>
                      {hasPermission(PERMISSIONS.UPDATE_MEETINGS) && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setAttendeeDialogOpen(true)}
                        >
                          Add Attendee
                        </Button>
                      )}
                    </Box>

                    {attendees.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <PeopleIcon
                          sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          No attendees added
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add attendees to invite them to the meeting
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Role</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Required</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {attendees.map((attendee) => (
                              <TableRow key={attendee.id}>
                                <TableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        fontSize: "0.875rem",
                                      }}
                                    >
                                      {attendee.name
                                        ? attendee.name.charAt(0)
                                        : "U"}
                                    </Avatar>
                                    <Typography variant="body2">
                                      {attendee.name || "Unknown"}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{attendee.email}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={attendee.role || "attendee"}
                                    size="small"
                                    variant="outlined"
                                    color={
                                      attendee.role === "organizer"
                                        ? "primary"
                                        : "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      attendeeStatuses.find(
                                        (s) => s.value === attendee.status
                                      )?.label ||
                                      attendee.status ||
                                      "pending"
                                    }
                                    size="small"
                                    color={
                                      attendeeStatuses.find(
                                        (s) => s.value === attendee.status
                                      )?.color || "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {attendee.required ? (
                                    <Chip
                                      label="Required"
                                      size="small"
                                      color="error"
                                    />
                                  ) : (
                                    <Chip
                                      label="Optional"
                                      size="small"
                                      color="default"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {/* Tasks Tab */}
                {activeTab === 3 && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">Action Items & Tasks</Typography>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/meetings/${meetingId}/tasks`)}
                      >
                        View All Tasks
                      </Button>
                    </Box>

                    {tasks.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <TaskIcon
                          sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          No tasks created
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tasks and action items will appear here
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<TaskIcon />}
                          onClick={() =>
                            navigate(`/meetings/${meetingId}/tasks`)
                          }
                          sx={{ mt: 2 }}
                        >
                          Create Tasks
                        </Button>
                      </Box>
                    ) : (
                      <List>
                        {tasks.slice(0, 5).map((task) => (
                          <React.Fragment key={task.id}>
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    bgcolor:
                                      task.status === "completed"
                                        ? "success.main"
                                        : task.priority === "high"
                                          ? "error.main"
                                          : "warning.main",
                                  }}
                                >
                                  <TaskIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <MUIListItemText
                                primary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography variant="subtitle1">
                                      {task.title}
                                    </Typography>
                                    <Chip
                                      label={task.priority || "medium"}
                                      size="small"
                                      color={
                                        task.priority === "high"
                                          ? "error"
                                          : task.priority === "medium"
                                            ? "warning"
                                            : "default"
                                      }
                                    />
                                    <Chip
                                      label={task.status || "pending"}
                                      size="small"
                                      color={
                                        task.status === "completed"
                                          ? "success"
                                          : "default"
                                      }
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                      {task.description}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Assigned to:{" "}
                                      {task.assigned_to || "Unassigned"}
                                      {task.due_date &&
                                        ` • Due: ${format(new Date(task.due_date), "dd/MM/yyyy")}`}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                        {tasks.length > 5 && (
                          <ListItem>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() =>
                                navigate(`/meetings/${meetingId}/tasks`)
                              }
                            >
                              View All {tasks.length} Tasks
                            </Button>
                          </ListItem>
                        )}
                      </List>
                    )}
                  </Box>
                )}

                {/* Documents Tab */}
                {activeTab === 4 && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">Meeting Documents</Typography>
                      {hasPermission(PERMISSIONS.UPDATE_MEETINGS) && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            // TODO: Implement file upload
                            showError(
                              "Document upload feature requires implementation"
                            );
                          }}
                        >
                          Upload Document
                        </Button>
                      )}
                    </Box>

                    {documents.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <AttachmentIcon
                          sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          No documents uploaded
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Upload meeting materials, agendas, and minutes
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {documents.map((doc) => (
                          <ListItem key={doc.id}>
                            <ListItemAvatar>
                              <Avatar>
                                <AttachmentIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <MUIListItemText
                              primary={doc.name || doc.filename}
                              secondary={`Uploaded: ${doc.created_at ? format(new Date(doc.created_at), "dd/MM/yyyy") : "Unknown"}`}
                            />
                            <Button
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => {
                                // TODO: Implement document download
                                showError(
                                  "Document download requires implementation"
                                );
                              }}
                            >
                              Download
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} md={4}>
            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={1}>
                  {meeting.meeting_link && (
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<VideoIcon />}
                        href={meeting.meeting_link}
                        target="_blank"
                      >
                        Join Meeting
                      </Button>
                    </Grid>
                  )}
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showSuccess("Link copied to clipboard");
                      }}
                    >
                      Share
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={() => window.print()}
                    >
                      Print
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<TaskIcon />}
                      onClick={() => navigate(`/meetings/${meetingId}/tasks`)}
                    >
                      Manage Tasks
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Meeting Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Meeting Timeline
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 32, height: 32 }}
                      >
                        <ScheduleIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <MUIListItemText
                      primary="Meeting Scheduled"
                      secondary={format(
                        new Date(meeting.created_at || new Date()),
                        "dd/MM/yyyy HH:mm"
                      )}
                    />
                  </ListItem>
                  {meeting.status === "completed" && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: "success.main",
                            width: 32,
                            height: 32,
                          }}
                        >
                          <CompletedIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <MUIListItemText
                        primary="Meeting Completed"
                        secondary={format(
                          new Date(meeting.updated_at || new Date()),
                          "dd/MM/yyyy HH:mm"
                        )}
                      />
                    </ListItem>
                  )}
                  {meeting.status === "in_progress" && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: "warning.main",
                            width: 32,
                            height: 32,
                          }}
                        >
                          <StartIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <MUIListItemText
                        primary="Meeting In Progress"
                        secondary="Currently ongoing"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showSuccess("Meeting link copied");
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <LinkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy Link</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              // TODO: Implement calendar export
              showError("Calendar export requires implementation");
            }}
          >
            <ListItemIcon>
              <DateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export to Calendar</ListItemText>
          </MenuItem>
          <Divider />
          {hasPermission(PERMISSIONS.DELETE_MEETINGS) && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                handleDeleteMeeting();
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Meeting</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Edit Meeting Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Meeting</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Title"
                  value={editForm.meeting_title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, meeting_title: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Meeting Date & Start Time"
                  value={editForm.start_time}
                  onChange={(date) => {
                    setEditForm({
                      ...editForm,
                      start_time: date,
                      meeting_date: date,
                    });
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Time"
                  value={editForm.end_time}
                  onChange={(date) =>
                    setEditForm({ ...editForm, end_time: date })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Meeting Link"
                  value={editForm.meeting_link}
                  onChange={(e) =>
                    setEditForm({ ...editForm, meeting_link: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Meeting Type</InputLabel>
                  <Select
                    value={editForm.meeting_type}
                    onChange={(e) =>
                      setEditForm({ ...editForm, meeting_type: e.target.value })
                    }
                    label="Meeting Type"
                  >
                    {meetingTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Chairperson"
                  value={editForm.chairperson}
                  onChange={(e) =>
                    setEditForm({ ...editForm, chairperson: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    label="Status"
                  >
                    {meetingStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMeeting} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

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
                  label="Email"
                  type="email"
                  value={newAttendee.email}
                  onChange={(e) =>
                    setNewAttendee({ ...newAttendee, email: e.target.value })
                  }
                  required
                />
              </Grid>
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
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={newAttendee.role}
                    onChange={(e) =>
                      setNewAttendee({ ...newAttendee, role: e.target.value })
                    }
                    label="Role"
                  >
                    <MenuItem value="attendee">Attendee</MenuItem>
                    <MenuItem value="presenter">Presenter</MenuItem>
                    <MenuItem value="organizer">Organizer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Required</InputLabel>
                  <Select
                    value={newAttendee.required}
                    onChange={(e) =>
                      setNewAttendee({
                        ...newAttendee,
                        required: e.target.value,
                      })
                    }
                    label="Required"
                  >
                    <MenuItem value={true}>Required</MenuItem>
                    <MenuItem value={false}>Optional</MenuItem>
                  </Select>
                </FormControl>
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
                  value={newAgendaItem.description}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      description: e.target.value,
                    })
                  }
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={newAgendaItem.duration}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      duration: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Order"
                  type="number"
                  value={newAgendaItem.order}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      order: parseInt(e.target.value),
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

        {/* Confirm Dialog */}
        {isOpen && (
          <Dialog open={isOpen} onClose={closeDialog}>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogContent>
              <Typography>{config.message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleConfirm} color="error" variant="contained">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default MeetingDetailsPage;
