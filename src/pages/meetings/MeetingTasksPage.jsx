import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  LinearProgress,
  Checkbox,
  FormControlLabel,
  Breadcrumbs,
  Link as MUILink,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Task as TaskIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  PriorityHigh as PriorityIcon,
  Person as PersonIcon,
  DateRange as DateIcon,
  Event as EventIcon,
  Category as CategoryIcon,
  Comment as CommentIcon,
  PlayArrow as StartIcon,
  Check as CompleteIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  ArrowBack as BackIcon,
  Home as HomeIcon,
  Group as MeetingIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, differenceInDays, isBefore, isAfter, addDays } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
import meetingsAPI from "../../services/api/meetings.api";

const MeetingTasksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: meetingIdFromRoute } = useParams(); // Get meeting ID from route params

  // Determine meeting ID from either route params or search params
  const meetingId = meetingIdFromRoute || searchParams.get("meetingId");
  const isSpecificMeeting = !!meetingIdFromRoute; // True if viewing tasks for a specific meeting

  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [currentMeeting, setCurrentMeeting] = useState(null); // Store current meeting info
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [meetingFilter, setMeetingFilter] = useState(meetingId || "");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form state for creating/editing tasks
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meeting_id: meetingId || "",
    assigned_to: "",
    assigned_to_email: "",
    due_date: null,
    priority: "medium",
    status: "pending",
    category: "",
    estimated_hours: "",
    notes: "",
    is_recurring: false,
    dependencies: [],
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    total_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
  });

  useEffect(() => {
    fetchData();
  }, [meetingId, isSpecificMeeting]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // If viewing specific meeting tasks, fetch the meeting details first
      if (isSpecificMeeting && meetingId) {
        await fetchMeetingDetails();
      }

      // Fetch tasks - either for specific meeting or all tasks
      await fetchTasks();

      // Fetch all meetings for dropdown (if not viewing specific meeting)
      if (!isSpecificMeeting) {
        await fetchMeetings();
      }

      // Calculate statistics after data is loaded
      calculateStatistics();
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingDetails = async () => {
    try {
      console.log(`Fetching meeting details for ID: ${meetingId}`);
      const response = await meetingsAPI.getMeetingById(meetingId);
      const meetingData = response.data?.meeting || response.data;
      setCurrentMeeting(meetingData);
      console.log("Meeting details fetched:", meetingData);
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      showError(
        `Failed to fetch meeting details: ${error.response?.data?.message || error.message}`
      );
      // Don't throw error - continue with loading tasks
    }
  };

  const fetchTasks = async () => {
    try {
      console.log(
        `Fetching tasks for meeting ID: ${isSpecificMeeting ? meetingId : "all meetings"}`
      );

      // Call the API with the meeting ID if we're viewing specific meeting tasks
      const response = await meetingsAPI.getMeetingTasks(
        isSpecificMeeting ? meetingId : null
      );

      console.log("Tasks API response:", response);

      // Handle different response structures
      const tasksData = response.data?.tasks || response.data || [];
      const processedTasks = Array.isArray(tasksData) ? tasksData : [];

      setTasks(processedTasks);
      console.log(`Loaded ${processedTasks.length} tasks`);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showError(
        `Failed to fetch tasks: ${error.response?.data?.message || error.message}`
      );
      setTasks([]);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await meetingsAPI.getAllMeetings();
      const meetingsData = response.data?.meetings || response.data || [];
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setMeetings([]);
    }
  };

  const calculateStatistics = () => {
    const stats = {
      total_tasks: tasks.length,
      pending_tasks: tasks.filter((task) => task.status === "pending").length,
      in_progress_tasks: tasks.filter((task) => task.status === "in_progress")
        .length,
      completed_tasks: tasks.filter((task) => task.status === "completed")
        .length,
      overdue_tasks: tasks.filter((task) => {
        if (!task.due_date) return false;
        return (
          new Date(task.due_date) < new Date() && task.status !== "completed"
        );
      }).length,
    };
    setStatistics(stats);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    showSuccess("Data refreshed successfully");
  };

  // Handle back navigation for specific meeting tasks
  const handleBack = () => {
    if (isSpecificMeeting && meetingId) {
      navigate(`/meetings/${meetingId}`);
    } else {
      navigate("/meetings");
    }
  };

  // Handle creating new task
  const handleCreateTask = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.description) {
        showError("Please fill in required fields (Title and Description)");
        return;
      }

      if (!formData.assigned_to) {
        showError("Please assign the task to someone");
        return;
      }

      if (!formData.due_date) {
        showError("Please select a due date");
        return;
      }

      // Map frontend form data to backend expected format
      const taskData = {
        // Backend expects 'task_description', not 'title' or 'description'
        task_description: formData.description,

        // Required fields according to backend validation
        assigned_to: formData.assigned_to,
        due_date: formData.due_date
          ? format(formData.due_date, "yyyy-MM-dd")
          : null,

        // Optional fields
        assigned_user_id: formData.assigned_user_id || null,
        priority: formData.priority || "medium",
        notes: formData.notes || "",

        // If we're viewing specific meeting tasks, set the meeting_id
        meeting_id: isSpecificMeeting
          ? parseInt(meetingId)
          : parseInt(formData.meeting_id),
      };

      console.log("Mapped task data for backend:", taskData);

      // Validate meeting_id
      if (!taskData.meeting_id) {
        showError("Please select a meeting");
        return;
      }

      if (editingTask) {
        // Update existing task
        await meetingsAPI.updateMeetingTask(editingTask.id, taskData);
        showSuccess("Task updated successfully");
      } else {
        // Create new task
        await meetingsAPI.createMeetingTask(taskData.meeting_id, taskData);
        showSuccess("Task created successfully");
      }

      // Refresh tasks and close dialog
      await fetchTasks();
      calculateStatistics();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating/updating task:", error);

      // Better error handling for validation errors
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join("\n");
        showError(`Validation Error:\n${errorMessages}`);
      } else {
        showError(
          `Failed to ${editingTask ? "update" : "create"} task: ${error.response?.data?.message || error.message}`
        );
      }
    }
  };

  // Handle task status change
  const handleStatusChange = async (task, newStatus) => {
    try {
      await meetingsAPI.updateMeetingTask(task.id, { status: newStatus });
      showSuccess(`Task marked as ${newStatus}`);
      await fetchTasks();
      calculateStatistics();
    } catch (error) {
      console.error("Error updating task status:", error);
      showError(
        `Failed to update task status: ${error.response?.data?.message || error.message}`
      );
    }
    setAnchorEl(null);
  };

  // Handle task deletion
  const handleDeleteTask = (task) => {
    openDialog({
      title: "Delete Task",
      message: `Are you sure you want to delete the task "${task.title}"?`,
      onConfirm: async () => {
        try {
          await meetingsAPI.deleteMeetingTask(task.id);
          showSuccess("Task deleted successfully");
          await fetchTasks();
          calculateStatistics();
        } catch (error) {
          console.error("Error deleting task:", error);
          showError(
            `Failed to delete task: ${error.response?.data?.message || error.message}`
          );
        }
      },
    });
    setAnchorEl(null);
  };

  const resetForm = () => {
    setFormData({
      title: "", // Keep this for the UI
      description: "", // Keep this for the UI
      meeting_id: isSpecificMeeting ? meetingId : "",
      assigned_to: "",
      assigned_to_email: "",
      assigned_user_id: "", // Add this field
      due_date: null,
      priority: "medium",
      status: "pending",
      category: "",
      estimated_hours: "",
      notes: "",
      is_recurring: false,
      dependencies: [],
    });
    setEditingTask(null);
  };

  // Handle edit
  const handleEdit = (task) => {
    setFormData({
      title: task.task_description || task.title || "", // Map task_description to title for UI
      description: task.task_description || task.description || "", // Map task_description to description for UI
      meeting_id: task.meeting_id || "",
      assigned_to: task.assigned_to || "",
      assigned_to_email: task.assigned_to_email || "",
      assigned_user_id: task.assigned_user_id || "",
      due_date: task.due_date ? new Date(task.due_date) : null,
      priority: task.priority || "medium",
      status: task.status || "pending",
      category: task.category || "",
      estimated_hours: task.estimated_hours || "",
      notes: task.notes || "",
      is_recurring: task.is_recurring || false,
      dependencies: task.dependencies || [],
    });
    setEditingTask(task);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle view task details
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setViewDialogOpen(true);
    setAnchorEl(null);
  };

  // Update page title based on context
  const getPageTitle = () => {
    if (isSpecificMeeting && currentMeeting) {
      return `Tasks for: ${currentMeeting.meeting_title || currentMeeting.title}`;
    }
    return "Meeting Tasks";
  };

  // Get breadcrumb navigation
  const getBreadcrumbs = () => {
    const breadcrumbs = [
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
    ];

    if (isSpecificMeeting && currentMeeting) {
      breadcrumbs.push({
        label:
          currentMeeting.meeting_title ||
          currentMeeting.title ||
          `Meeting ${meetingId}`,
        href: `/meetings/${meetingId}`,
      });
      breadcrumbs.push({
        label: "Tasks",
        current: true,
        icon: <TaskIcon fontSize="small" />,
      });
    } else {
      breadcrumbs.push({
        label: "All Tasks",
        current: true,
        icon: <TaskIcon fontSize="small" />,
      });
    }

    return breadcrumbs;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesAssignee =
      !assigneeFilter ||
      task.assigned_to?.toLowerCase().includes(assigneeFilter.toLowerCase());
    const matchesMeeting =
      !meetingFilter || task.meeting_id?.toString() === meetingFilter;

    // Due date filter
    let matchesDueDate = true;
    if (dueDateFilter) {
      const today = new Date();
      const taskDueDate = task.due_date ? new Date(task.due_date) : null;
      switch (dueDateFilter) {
        case "overdue":
          matchesDueDate =
            taskDueDate && taskDueDate < today && task.status !== "completed";
          break;
        case "today":
          matchesDueDate =
            taskDueDate && taskDueDate.toDateString() === today.toDateString();
          break;
        case "this_week":
          const weekFromNow = addDays(today, 7);
          matchesDueDate =
            taskDueDate && taskDueDate >= today && taskDueDate <= weekFromNow;
          break;
        default:
          matchesDueDate = true;
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesAssignee &&
      matchesMeeting &&
      matchesDueDate
    );
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
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
        {isSpecificMeeting && (
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {getPageTitle()}
          </Typography>
          {isSpecificMeeting && currentMeeting && (
            <Typography variant="body2" color="text.secondary">
              {currentMeeting.meeting_date &&
                format(new Date(currentMeeting.meeting_date), "PPP")}{" "}
              at{" "}
              {currentMeeting.meeting_date &&
                format(new Date(currentMeeting.meeting_date), "p")}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {/* {hasPermission(PERMISSIONS.CREATE_MEETING_TASKS) && ( */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
            >
              Add Task
            </Button>
          {/* // )} */}
        </Box>
      </Box>

      {/* Meeting Info Card for Specific Meeting */}
      {isSpecificMeeting && currentMeeting && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Meeting Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Meeting Type
                </Typography>
                <Typography variant="body1">
                  {currentMeeting.meeting_type || "Regular Meeting"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={currentMeeting.status || "scheduled"}
                  color={
                    currentMeeting.status === "completed"
                      ? "success"
                      : currentMeeting.status === "in_progress"
                        ? "warning"
                        : "default"
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {currentMeeting.duration
                    ? `${currentMeeting.duration} minutes`
                    : "Not specified"}
                </Typography>
              </Grid>
              {currentMeeting.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {currentMeeting.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
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
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Tasks
                  </Typography>
                  <Typography variant="h4">{statistics.total_tasks}</Typography>
                </Box>
                <TaskIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
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
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Pending
                  </Typography>
                  <Typography variant="h4">
                    {statistics.pending_tasks}
                  </Typography>
                </Box>
                <PendingIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
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
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    In Progress
                  </Typography>
                  <Typography variant="h4">
                    {statistics.in_progress_tasks}
                  </Typography>
                </Box>
                <StartIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
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
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Completed
                  </Typography>
                  <Typography variant="h4">
                    {statistics.completed_tasks}
                  </Typography>
                </Box>
                <CompletedIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
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
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Overdue
                  </Typography>
                  <Typography variant="h4">
                    {statistics.overdue_tasks}
                  </Typography>
                </Box>
                <OverdueIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search tasks"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Due Date</InputLabel>
                <Select
                  value={dueDateFilter}
                  label="Due Date"
                  onChange={(e) => setDueDateFilter(e.target.value)}
                >
                  <MenuItem value="">All Dates</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="today">Due Today</MenuItem>
                  <MenuItem value="this_week">Due This Week</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {!isSpecificMeeting && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Meeting</InputLabel>
                  <Select
                    value={meetingFilter}
                    label="Meeting"
                    onChange={(e) => setMeetingFilter(e.target.value)}
                  >
                    <MenuItem value="">All Meetings</MenuItem>
                    {meetings.map((meeting) => (
                      <MenuItem key={meeting.id} value={meeting.id.toString()}>
                        {meeting.meeting_title || meeting.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Tasks ({filteredTasks.length})</Typography>
          </Box>

          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <TaskIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isSpecificMeeting
                  ? "This meeting doesn't have any tasks yet."
                  : "No tasks match your current filters."}
              </Typography>
              {hasPermission(PERMISSIONS.CREATE_MEETING_TASKS) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    resetForm();
                    setDialogOpen(true);
                  }}
                  sx={{ mt: 2 }}
                >
                  Create First Task
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Due Date</TableCell>
                    {!isSpecificMeeting && <TableCell>Meeting</TableCell>}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {task.title || task.task_description}
                          </Typography>
                          {task.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {task.description.length > 100
                                ? `${task.description.substring(0, 100)}...`
                                : task.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status || "pending"}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority || "medium"}
                          color={getPriorityColor(task.priority)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {task.assigned_to
                              ? task.assigned_to.charAt(0).toUpperCase()
                              : "U"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {task.assigned_to || "Unassigned"}
                            </Typography>
                            {task.assigned_to_email && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {task.assigned_to_email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {task.due_date ? (
                          <Box>
                            <Typography variant="body2">
                              {format(new Date(task.due_date), "MMM dd, yyyy")}
                            </Typography>
                            {new Date(task.due_date) < new Date() &&
                              task.status !== "completed" && (
                                <Typography variant="caption" color="error">
                                  Overdue
                                </Typography>
                              )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No due date
                          </Typography>
                        )}
                      </TableCell>
                      {!isSpecificMeeting && (
                        <TableCell>
                          <Typography variant="body2">
                            {task.meeting_title || `Meeting ${task.meeting_id}`}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setSelectedTask(task);
                            setAnchorEl(e.currentTarget);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleViewTask(selectedTask)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {hasPermission(PERMISSIONS.UPDATE_TASK_STATUS) && (
          <>
            <MenuItem onClick={() => handleEdit(selectedTask)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Task</ListItemText>
            </MenuItem>

            {selectedTask?.status !== "in_progress" && (
              <MenuItem
                onClick={() => handleStatusChange(selectedTask, "in_progress")}
              >
                <ListItemIcon>
                  <StartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Start Task</ListItemText>
              </MenuItem>
            )}

            {selectedTask?.status !== "completed" && (
              <MenuItem
                onClick={() => handleStatusChange(selectedTask, "completed")}
              >
                <ListItemIcon>
                  <CompleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mark Complete</ListItemText>
              </MenuItem>
            )}
          </>
        )}

        {hasPermission(PERMISSIONS.DELETE_MEETINGS) && (
          <>
            <Divider />
            <MenuItem
              onClick={() => handleDeleteTask(selectedTask)}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete Task</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Create/Edit Task Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
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
                required
              />
            </Grid>
            {!isSpecificMeeting && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Meeting</InputLabel>
                  <Select
                    value={formData.meeting_id}
                    label="Meeting"
                    onChange={(e) =>
                      setFormData({ ...formData, meeting_id: e.target.value })
                    }
                  >
                    {meetings.map((meeting) => (
                      <MenuItem key={meeting.id} value={meeting.id}>
                        {meeting.meeting_title || meeting.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assigned To"
                value={formData.assigned_to}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_to: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assigned To Email"
                type="email"
                value={formData.assigned_to_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assigned_to_email: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={formData.due_date ? new Date(formData.due_date) : null}
                  onChange={(newValue) =>
                    setFormData({ ...formData, due_date: newValue })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_hours: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={!formData.title || !formData.description}
          >
            {editingTask ? "Update Task" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedTask.title || selectedTask.task_description}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedTask.description}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedTask.status || "pending"}
                  color={getStatusColor(selectedTask.status)}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Priority
                </Typography>
                <Chip
                  label={selectedTask.priority || "medium"}
                  color={getPriorityColor(selectedTask.priority)}
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Assigned To
                </Typography>
                <Typography variant="body1">
                  {selectedTask.assigned_to || "Unassigned"}
                </Typography>
                {selectedTask.assigned_to_email && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedTask.assigned_to_email}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1">
                  {selectedTask.due_date
                    ? format(new Date(selectedTask.due_date), "PPP")
                    : "No due date set"}
                </Typography>
              </Grid>

              {selectedTask.category && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.category}
                  </Typography>
                </Grid>
              )}

              {selectedTask.estimated_hours && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Hours
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.estimated_hours} hours
                  </Typography>
                </Grid>
              )}

              {selectedTask.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">{selectedTask.notes}</Typography>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {selectedTask.created_at
                    ? format(new Date(selectedTask.created_at), "PPp")
                    : "Unknown"}
                </Typography>
              </Grid>

              {selectedTask.updated_at && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedTask.updated_at), "PPp")}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {!isSpecificMeeting && selectedTask && (
            <Button
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                navigate(`/meetings/${selectedTask.meeting_id}`);
              }}
            >
              View Meeting
            </Button>
          )}
          {hasPermission(PERMISSIONS.UPDATE_TASK_STATUS) && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                handleEdit(selectedTask);
              }}
            >
              Edit Task
            </Button>
          )}
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
            <Button onClick={handleConfirm} variant="contained" color="error">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default MeetingTasksPage;
