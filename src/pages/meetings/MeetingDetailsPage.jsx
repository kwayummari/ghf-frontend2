import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInMinutes, addMinutes, isBefore, isAfter } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { meetingsAPI } from '../../services/api/meetings.api';

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [attendeeDialogOpen, setAttendeeDialogOpen] = useState(false);
  const [agendaDialogOpen, setAgendaDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    start_time: null,
    end_time: "",
    location: "",
    meeting_link: "",
    meeting_type: "in_person",
    priority: "medium",
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

  // Mock data for development
  const mockMeeting = {
    id: meetingId || 1,
    title: "Q3 Budget Review Meeting",
    description: "Quarterly review of budget performance and planning for Q4",
    start_time: "2024-07-15T14:00:00",
    end_time: "2024-07-15T16:00:00",
    duration: 120,
    location: "Conference Room A",
    meeting_link: "https://meet.google.com/abc-defg-hij",
    meeting_type: "hybrid",
    priority: "high",
    status: "completed",
    organizer: "John Doe",
    organizer_id: 1,
    created_by: "John Doe",
    created_at: "2024-07-10T10:00:00",
    updated_at: "2024-07-15T16:30:00",
    is_recurring: false,
    reminder_sent: true,
    recording_available: true,
    attendees_count: 8,
    agenda_items_count: 5,
    tasks_count: 3,
    notes_count: 12,
  };

  const mockAttendees = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@ghf.org",
      role: "organizer",
      department: "Finance",
      status: "accepted",
      required: true,
      joined_at: "2024-07-15T13:58:00",
      left_at: "2024-07-15T16:02:00",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@ghf.org",
      role: "attendee",
      department: "IT",
      status: "accepted",
      required: true,
      joined_at: "2024-07-15T14:02:00",
      left_at: "2024-07-15T16:00:00",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@ghf.org",
      role: "attendee",
      department: "HR",
      status: "tentative",
      required: false,
      joined_at: null,
      left_at: null,
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@ghf.org",
      role: "presenter",
      department: "Operations",
      status: "accepted",
      required: true,
      joined_at: "2024-07-15T14:00:00",
      left_at: "2024-07-15T15:45:00",
    },
  ];

  const mockAgendaItems = [
    {
      id: 1,
      title: "Opening & Welcome",
      description: "Welcome attendees and review agenda",
      duration: 10,
      presenter: "John Doe",
      order: 1,
      start_time: "2024-07-15T14:00:00",
      status: "completed",
    },
    {
      id: 2,
      title: "Q3 Financial Performance Review",
      description: "Review of Q3 budget performance against targets",
      duration: 30,
      presenter: "Jane Smith",
      order: 2,
      start_time: "2024-07-15T14:10:00",
      status: "completed",
    },
    {
      id: 3,
      title: "Department Budget Variances",
      description: "Analysis of significant budget variances by department",
      duration: 40,
      presenter: "Sarah Wilson",
      order: 3,
      start_time: "2024-07-15T14:40:00",
      status: "completed",
    },
    {
      id: 4,
      title: "Q4 Budget Adjustments",
      description: "Proposed adjustments for Q4 budget allocations",
      duration: 30,
      presenter: "Mike Johnson",
      order: 4,
      start_time: "2024-07-15T15:20:00",
      status: "in_progress",
    },
    {
      id: 5,
      title: "Action Items & Next Steps",
      description: "Review action items and plan follow-up meetings",
      duration: 10,
      presenter: "John Doe",
      order: 5,
      start_time: "2024-07-15T15:50:00",
      status: "pending",
    },
  ];

  const mockTasks = [
    {
      id: 1,
      title: "Prepare Q4 budget revision proposal",
      description:
        "Create detailed proposal for Q4 budget adjustments based on Q3 performance",
      assigned_to: "Jane Smith",
      due_date: "2024-07-22T17:00:00",
      priority: "high",
      status: "in_progress",
      created_from_agenda: "Q4 Budget Adjustments",
    },
    {
      id: 2,
      title: "Schedule department budget meetings",
      description: "Coordinate individual meetings with each department head",
      assigned_to: "Sarah Wilson",
      due_date: "2024-07-18T12:00:00",
      priority: "medium",
      status: "pending",
      created_from_agenda: "Department Budget Variances",
    },
    {
      id: 3,
      title: "Update budget monitoring dashboard",
      description: "Implement real-time budget tracking improvements discussed",
      assigned_to: "Mike Johnson",
      due_date: "2024-07-25T17:00:00",
      priority: "medium",
      status: "pending",
      created_from_agenda: "Q3 Financial Performance Review",
    },
  ];

  const mockNotes = [
    {
      id: 1,
      content: "Q3 performance exceeded targets by 12% across all departments",
      note_type: "key_point",
      created_by: "John Doe",
      created_at: "2024-07-15T14:15:00",
      is_action_item: false,
      agenda_item: "Q3 Financial Performance Review",
    },
    {
      id: 2,
      content:
        "IT department under-spent by 15% due to delayed hardware procurement",
      note_type: "observation",
      created_by: "Jane Smith",
      created_at: "2024-07-15T14:45:00",
      is_action_item: false,
      agenda_item: "Department Budget Variances",
    },
    {
      id: 3,
      content:
        "ACTION: Reallocate unused IT budget to Marketing for Q4 campaign",
      note_type: "action_item",
      created_by: "Sarah Wilson",
      created_at: "2024-07-15T15:30:00",
      is_action_item: true,
      agenda_item: "Q4 Budget Adjustments",
    },
  ];

  // Meeting types and statuses
  const meetingTypes = [
    { value: "in_person", label: "In Person", icon: <LocationIcon /> },
    { value: "virtual", label: "Virtual", icon: <VideoIcon /> },
    { value: "hybrid", label: "Hybrid", icon: <PeopleIcon /> },
  ];

  const meetingStatuses = [
    { value: "scheduled", label: "Scheduled", color: "info" },
    { value: "in_progress", label: "In Progress", color: "warning" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "error" },
    { value: "postponed", label: "Postponed", color: "default" },
  ];

  const attendeeStatuses = [
    { value: "accepted", label: "Accepted", color: "success" },
    { value: "tentative", label: "Tentative", color: "warning" },
    { value: "declined", label: "Declined", color: "error" },
    { value: "pending", label: "Pending", color: "default" },
  ];

  const priorityLevels = [
    { value: "low", label: "Low", color: "default" },
    { value: "medium", label: "Medium", color: "primary" },
    { value: "high", label: "High", color: "warning" },
    { value: "urgent", label: "Urgent", color: "error" },
  ];

  // Load meeting data
  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      // Replace with actual API calls
      // const meetingResponse = await meetingsAPI.getMeetingById(meetingId);
      // const attendeesResponse = await meetingsAPI.getMeetingAttendees(meetingId);
      // const agendaResponse = await meetingsAPI.getMeetingAgenda(meetingId);
      // const tasksResponse = await meetingsAPI.getMeetingTasks(meetingId);
      // const notesResponse = await meetingsAPI.getMeetingNotes(meetingId);

      setMeeting(mockMeeting);
      setAttendees(mockAttendees);
      setAgendaItems(mockAgendaItems);
      setTasks(mockTasks);
      setNotes(mockNotes);
    } catch (error) {
      showError("Failed to fetch meeting details");
    } finally {
      setLoading(false);
    }
  };

  // Handle meeting actions
  const handleEditMeeting = () => {
    setEditForm({
      title: meeting.title,
      description: meeting.description,
      start_time: new Date(meeting.start_time),
      end_time: meeting.end_time,
      location: meeting.location,
      meeting_link: meeting.meeting_link,
      meeting_type: meeting.meeting_type,
      priority: meeting.priority,
      status: meeting.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveMeeting = async () => {
    try {
      // await meetingsAPI.updateMeeting(meetingId, editForm);
      showSuccess("Meeting updated successfully");
      setEditDialogOpen(false);
      fetchMeetingDetails();
    } catch (error) {
      showError("Failed to update meeting");
    }
  };

  const handleDeleteMeeting = () => {
    openDialog({
      title: "Delete Meeting",
      message:
        "Are you sure you want to delete this meeting? This action cannot be undone.",
      onConfirm: async () => {
        try {
          // await meetingsAPI.deleteMeeting(meetingId);
          showSuccess("Meeting deleted successfully");
          navigate("/meetings");
        } catch (error) {
          showError("Failed to delete meeting");
        }
      },
    });
  };

  const handleStartMeeting = async () => {
    try {
      // await meetingsAPI.startMeeting(meetingId);
      showSuccess("Meeting started");
      fetchMeetingDetails();
    } catch (error) {
      showError("Failed to start meeting");
    }
  };

  const handleEndMeeting = async () => {
    try {
      // await meetingsAPI.endMeeting(meetingId);
      showSuccess("Meeting ended");
      fetchMeetingDetails();
    } catch (error) {
      showError("Failed to end meeting");
    }
  };

  // Handle attendee management
  const handleAddAttendee = async () => {
    try {
      // await meetingsAPI.addAttendee(meetingId, newAttendee);
      showSuccess("Attendee added successfully");
      setAttendeeDialogOpen(false);
      setNewAttendee({ email: "", name: "", role: "attendee", required: true });
      fetchMeetingDetails();
    } catch (error) {
      showError("Failed to add attendee");
    }
  };

  // Handle agenda management
  const handleAddAgendaItem = async () => {
    try {
      // await meetingsAPI.addAgendaItem(meetingId, newAgendaItem);
      showSuccess("Agenda item added successfully");
      setAgendaDialogOpen(false);
      setNewAgendaItem({
        title: "",
        description: "",
        duration: 15,
        presenter: "",
        order: 1,
      });
      fetchMeetingDetails();
    } catch (error) {
      showError("Failed to add agenda item");
    }
  };

  // Handle notes management
  const handleAddNote = async () => {
    try {
      // await meetingsAPI.addNote(meetingId, newNote);
      showSuccess("Note added successfully");
      setNotesDialogOpen(false);
      setNewNote({ content: "", note_type: "general", is_action_item: false });
      fetchMeetingDetails();
    } catch (error) {
      showError("Failed to add note");
    }
  };

  // Calculate meeting metrics
  const getMeetingDuration = () => {
    if (!meeting) return 0;
    return differenceInMinutes(
      new Date(meeting.end_time),
      new Date(meeting.start_time)
    );
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
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <IconButton onClick={() => navigate("/meetings")}>
              <BackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {meeting.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {meeting.status === "scheduled" && (
                <Button
                  variant="contained"
                  startIcon={<StartIcon />}
                  onClick={handleStartMeeting}
                  color="success"
                >
                  Start Meeting
                </Button>
              )}
              {meeting.status === "in_progress" && (
                <Button
                  variant="contained"
                  startIcon={<EndIcon />}
                  onClick={handleEndMeeting}
                  color="error"
                >
                  End Meeting
                </Button>
              )}
              {hasPermission(PERMISSIONS.MANAGE_MEETINGS) && (
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
                  /* Share meeting */
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
                meetingStatuses.find((s) => s.value === meeting.status)?.label
              }
              color={
                meetingStatuses.find((s) => s.value === meeting.status)?.color
              }
              variant="filled"
            />
            <Chip
              label={
                priorityLevels.find((p) => p.value === meeting.priority)?.label
              }
              color={
                priorityLevels.find((p) => p.value === meeting.priority)?.color
              }
              variant="outlined"
            />
            <Chip
              label={
                meetingTypes.find((t) => t.value === meeting.meeting_type)
                  ?.label
              }
              icon={
                meetingTypes.find((t) => t.value === meeting.meeting_type)?.icon
              }
              variant="outlined"
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {format(new Date(meeting.start_time), "dd/MM/yyyy HH:mm")} -{" "}
                {format(new Date(meeting.end_time), "HH:mm")}
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
                      {getAttendanceRate().toFixed(0)}% accepted
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
                    <Typography variant="h6">{notes.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notes.filter((n) => n.is_action_item).length} action
                      items
                    </Typography>
                  </Box>
                  <NotesIcon color="info" />
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
                >
                  <Tab label="Overview" />
                  <Tab label="Agenda" />
                  <Tab label="Attendees" />
                  <Tab label="Notes" />
                  <Tab label="Tasks" />
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
                          {meeting.description}
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
                              primary="Organizer"
                              secondary={meeting.organizer}
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
                              secondary={meeting.location}
                            />
                          </ListItem>
                          {meeting.meeting_link && (
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "info.main" }}>
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
                      {hasPermission(PERMISSIONS.MANAGE_MEETINGS) && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setAgendaDialogOpen(true)}
                        >
                          Add Item
                        </Button>
                      )}
                    </Box>

                    <List>
                      {agendaItems.map((item, index) => (
                        <React.Fragment key={item.id}>
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
                                    label={`${item.duration} min`}
                                    size="small"
                                    variant="outlined"
                                  />
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
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    {item.description}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Presenter: {item.presenter} | Start:{" "}
                                    {format(new Date(item.start_time), "HH:mm")}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < agendaItems.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
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
                      {hasPermission(PERMISSIONS.MANAGE_MEETINGS) && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setAttendeeDialogOpen(true)}
                        >
                          Add Attendee
                        </Button>
                      )}
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Attendance</TableCell>
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
                                    {attendee.name.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {attendee.name}
                                    {attendee.required && (
                                      <Chip
                                        label="Required"
                                        size="small"
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{attendee.email}</TableCell>
                              <TableCell>{attendee.department}</TableCell>
                              <TableCell>
                                <Chip
                                  label={attendee.role}
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
                                    )?.label
                                  }
                                  size="small"
                                  color={
                                    attendeeStatuses.find(
                                      (s) => s.value === attendee.status
                                    )?.color
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {attendee.joined_at ? (
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="success.main"
                                    >
                                      Joined:{" "}
                                      {format(
                                        new Date(attendee.joined_at),
                                        "HH:mm"
                                      )}
                                    </Typography>
                                    {attendee.left_at && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                      >
                                        Left:{" "}
                                        {format(
                                          new Date(attendee.left_at),
                                          "HH:mm"
                                        )}
                                      </Typography>
                                    )}
                                  </Box>
                                ) : (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Did not attend
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Notes Tab */}
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
                      <Typography variant="h6">Meeting Notes</Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setNotesDialogOpen(true)}
                      >
                        Add Note
                      </Button>
                    </Box>

                    <List>
                      {notes.map((note) => (
                        <React.Fragment key={note.id}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: note.is_action_item
                                    ? "error.main"
                                    : "primary.main",
                                }}
                              >
                                {note.is_action_item ? (
                                  <TaskIcon />
                                ) : (
                                  <NotesIcon />
                                )}
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
                                  <Typography variant="body1">
                                    {note.content}
                                  </Typography>
                                  {note.is_action_item && (
                                    <Chip
                                      label="Action Item"
                                      size="small"
                                      color="error"
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    By {note.created_by} •{" "}
                                    {format(
                                      new Date(note.created_at),
                                      "dd/MM/yyyy HH:mm"
                                    )}
                                  </Typography>
                                  {note.agenda_item && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      color="text.secondary"
                                    >
                                      Related to: {note.agenda_item}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Tasks Tab */}
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
                      <Typography variant="h6">Action Items & Tasks</Typography>
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/meetings/tasks")}
                      >
                        View All Tasks
                      </Button>
                    </Box>

                    <List>
                      {tasks.map((task) => (
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
                                    label={task.priority}
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
                                    label={task.status}
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
                                    Assigned to: {task.assigned_to} • Due:{" "}
                                    {format(
                                      new Date(task.due_date),
                                      "dd/MM/yyyy"
                                    )}
                                  </Typography>
                                  {task.created_from_agenda && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      color="text.secondary"
                                    >
                                      From agenda: {task.created_from_agenda}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
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
                        /* Share meeting */
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
                      onClick={() => {
                        /* Print agenda */
                      }}
                    >
                      Print
                    </Button>
                  </Grid>
                  {meeting.recording_available && (
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<RecordingIcon />}
                        onClick={() => {
                          /* View recording */
                        }}
                      >
                        View Recording
                      </Button>
                    </Grid>
                  )}
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
                        new Date(meeting.created_at),
                        "dd/MM/yyyy HH:mm"
                      )}
                    />
                  </ListItem>
                  {meeting.reminder_sent && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          sx={{ bgcolor: "info.main", width: 32, height: 32 }}
                        >
                          <ReminderIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <MUIListItemText
                        primary="Reminders Sent"
                        secondary="24 hours before meeting"
                      />
                    </ListItem>
                  )}
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
                          new Date(meeting.updated_at),
                          "dd/MM/yyyy HH:mm"
                        )}
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
              /* Duplicate meeting */
            }}
          >
            <ListItemIcon>
              <RecurringIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate Meeting</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              /* Export to calendar */
            }}
          >
            <ListItemIcon>
              <DateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export to Calendar</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              /* Download materials */
            }}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download Materials</ListItemText>
          </MenuItem>
          <Divider />
          {hasPermission(PERMISSIONS.MANAGE_MEETINGS) && (
            <MenuItem
              onClick={handleDeleteMeeting}
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
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
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
                  label="Start Time"
                  value={editForm.start_time}
                  onChange={(date) =>
                    setEditForm({ ...editForm, start_time: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Time"
                  value={editForm.end_time}
                  onChange={(date) =>
                    setEditForm({ ...editForm, end_time: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
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
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm({ ...editForm, priority: e.target.value })
                    }
                    label="Priority"
                  >
                    {priorityLevels.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                      duration: e.target.value,
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
                      order: e.target.value,
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

        {/* Add Note Dialog */}
        <Dialog
          open={notesDialogOpen}
          onClose={() => setNotesDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Meeting Note</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Note Content"
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Note Type</InputLabel>
                  <Select
                    value={newNote.note_type}
                    onChange={(e) =>
                      setNewNote({ ...newNote, note_type: e.target.value })
                    }
                    label="Note Type"
                  >
                    <MenuItem value="general">General Note</MenuItem>
                    <MenuItem value="key_point">Key Point</MenuItem>
                    <MenuItem value="observation">Observation</MenuItem>
                    <MenuItem value="action_item">Action Item</MenuItem>
                    <MenuItem value="decision">Decision</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Action Item</InputLabel>
                  <Select
                    value={newNote.is_action_item}
                    onChange={(e) =>
                      setNewNote({ ...newNote, is_action_item: e.target.value })
                    }
                    label="Action Item"
                  >
                    <MenuItem value={false}>Regular Note</MenuItem>
                    <MenuItem value={true}>Action Item</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote} variant="contained">
              Add Note
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