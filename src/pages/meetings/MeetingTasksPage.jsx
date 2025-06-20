import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
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
} from "@mui/icons-material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInDays, isBefore, isAfter, addDays } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { meetingsAPI } from '../../services/api/meetings.api';

const MeetingTasksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get("meetingId");
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Form state
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

  // Mock data for development
  const mockTasks = [
    {
      id: 1,
      title: "Prepare Q4 budget revision proposal",
      description:
        "Create detailed proposal for Q4 budget adjustments based on Q3 performance analysis and department feedback",
      meeting_id: 1,
      meeting_title: "Q3 Budget Review Meeting",
      meeting_date: "2024-07-15T14:00:00",
      assigned_to: "Jane Smith",
      assigned_to_email: "jane.smith@ghf.org",
      assigned_by: "John Doe",
      created_date: "2024-07-15T16:00:00",
      due_date: "2024-07-22T17:00:00",
      priority: "high",
      status: "in_progress",
      category: "Budget Planning",
      estimated_hours: 16,
      actual_hours: 8,
      progress_percentage: 50,
      notes: "Focus on IT and Marketing departments first",
      is_recurring: false,
      overdue: false,
      days_until_due: 7,
      dependencies: [],
      comments_count: 3,
      attachments_count: 2,
    },
    {
      id: 2,
      title: "Schedule department budget meetings",
      description:
        "Coordinate individual meetings with each department head to review budget variances and discuss Q4 plans",
      meeting_id: 1,
      meeting_title: "Q3 Budget Review Meeting",
      meeting_date: "2024-07-15T14:00:00",
      assigned_to: "Sarah Wilson",
      assigned_to_email: "sarah.wilson@ghf.org",
      assigned_by: "John Doe",
      created_date: "2024-07-15T16:00:00",
      due_date: "2024-07-18T12:00:00",
      priority: "medium",
      status: "completed",
      category: "Meeting Coordination",
      estimated_hours: 4,
      actual_hours: 3,
      progress_percentage: 100,
      notes: "All meetings scheduled for next week",
      is_recurring: false,
      overdue: false,
      days_until_due: 3,
      dependencies: [],
      comments_count: 1,
      attachments_count: 0,
    },
    {
      id: 3,
      title: "Update budget monitoring dashboard",
      description:
        "Implement real-time budget tracking improvements discussed in the meeting, including new variance alerts and department drill-downs",
      meeting_id: 1,
      meeting_title: "Q3 Budget Review Meeting",
      meeting_date: "2024-07-15T14:00:00",
      assigned_to: "Mike Johnson",
      assigned_to_email: "mike.johnson@ghf.org",
      assigned_by: "Jane Smith",
      created_date: "2024-07-15T16:00:00",
      due_date: "2024-07-12T17:00:00",
      priority: "medium",
      status: "overdue",
      category: "System Development",
      estimated_hours: 12,
      actual_hours: 4,
      progress_percentage: 25,
      notes: "Waiting for API specifications",
      is_recurring: false,
      overdue: true,
      days_until_due: -3,
      dependencies: [1],
      comments_count: 5,
      attachments_count: 1,
    },
    {
      id: 4,
      title: "Conduct asset inventory review",
      description:
        "Review and update asset register based on quarterly audit findings",
      meeting_id: 2,
      meeting_title: "Asset Management Review",
      meeting_date: "2024-07-10T10:00:00",
      assigned_to: "Tom Wilson",
      assigned_to_email: "tom.wilson@ghf.org",
      assigned_by: "Sarah Wilson",
      created_date: "2024-07-10T11:00:00",
      due_date: "2024-07-20T17:00:00",
      priority: "low",
      status: "pending",
      category: "Asset Management",
      estimated_hours: 8,
      actual_hours: 0,
      progress_percentage: 0,
      notes: "Start with IT equipment inventory",
      is_recurring: true,
      overdue: false,
      days_until_due: 5,
      dependencies: [],
      comments_count: 0,
      attachments_count: 0,
    },
  ];

  const mockMeetings = [
    { id: 1, title: "Q3 Budget Review Meeting", date: "2024-07-15T14:00:00" },
    { id: 2, title: "Asset Management Review", date: "2024-07-10T10:00:00" },
    { id: 3, title: "HR Policy Update", date: "2024-07-08T15:00:00" },
  ];

  // Task statuses
  const taskStatuses = [
    {
      value: "pending",
      label: "Pending",
      color: "default",
      icon: <PendingIcon />,
    },
    {
      value: "in_progress",
      label: "In Progress",
      color: "warning",
      icon: <PlayArrowIcon />,
    },
    {
      value: "completed",
      label: "Completed",
      color: "success",
      icon: <CompletedIcon />,
    },
    {
      value: "overdue",
      label: "Overdue",
      color: "error",
      icon: <OverdueIcon />,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "default",
      icon: <CancelIcon />,
    },
  ];

  // Priority levels
  const priorityLevels = [
    { value: "low", label: "Low", color: "default" },
    { value: "medium", label: "Medium", color: "primary" },
    { value: "high", label: "High", color: "warning" },
    { value: "urgent", label: "Urgent", color: "error" },
  ];

  // Task categories
  const taskCategories = [
    "Budget Planning",
    "Meeting Coordination",
    "System Development",
    "Asset Management",
    "HR Management",
    "Reporting",
    "Research",
    "Documentation",
    "Follow-up",
    "Other",
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Tasks",
      value: mockTasks.length.toString(),
      subtitle: "All meeting tasks",
      icon: <TaskIcon />,
      color: "primary",
    },
    {
      title: "Overdue Tasks",
      value: mockTasks.filter((task) => task.overdue).length.toString(),
      subtitle: "Require immediate attention",
      icon: <OverdueIcon />,
      color: "error",
    },
    {
      title: "In Progress",
      value: mockTasks
        .filter((task) => task.status === "in_progress")
        .length.toString(),
      subtitle: "Currently being worked on",
      icon: <PlayArrowIcon />,
      color: "warning",
    },
    {
      title: "Completion Rate",
      value: `${Math.round((mockTasks.filter((task) => task.status === "completed").length / mockTasks.length) * 100)}%`,
      subtitle: "Tasks completed on time",
      icon: <CompletedIcon />,
      color: "success",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "task_info",
      headerName: "Task",
      width: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            From: {params.row.meeting_title}
          </Typography>
        </Box>
      ),
    },
    {
      field: "assigned_to",
      headerName: "Assigned To",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "due_date",
      headerName: "Due Date",
      width: 130,
      renderCell: (params) => (
        <Box>
          <Typography
            variant="body2"
            color={params.row.overdue ? "error.main" : "text.primary"}
          >
            {format(new Date(params.value), "dd/MM/yyyy")}
          </Typography>
          {params.row.overdue && (
            <Typography variant="caption" color="error">
              {Math.abs(params.row.days_until_due)} days overdue
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => {
        const priority = priorityLevels.find((p) => p.value === params.value);
        return (
          <Chip
            label={priority?.label}
            size="small"
            color={priority?.color}
            variant="filled"
          />
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = taskStatuses.find((s) => s.value === params.value);
        return (
          <Chip
            label={status?.label}
            size="small"
            color={status?.color}
            variant="filled"
            icon={status?.icon}
          />
        );
      },
    },
    {
      field: "progress_percentage",
      headerName: "Progress",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="caption">
              {params.row.actual_hours || 0}h /{" "}
              {params.row.estimated_hours || 0}h
            </Typography>
            <Typography variant="caption">{params.value}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{ height: 6, borderRadius: 3 }}
            color={params.value === 100 ? "success" : "primary"}
          />
        </Box>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          icon={<CategoryIcon />}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            setSelectedTask(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load tasks data
  useEffect(() => {
    fetchTasks();
    fetchMeetings();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await meetingsAPI.getAllTasks({
      //   meeting_id: meetingId,
      //   include_details: true
      // });
      // setTasks(response.data || []);
      setTasks(mockTasks);
    } catch (error) {
      showError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      // Replace with actual API call
      // const response = await meetingsAPI.getAllMeetings({ active_only: true });
      // setMeetings(response.data || []);
      setMeetings(mockMeetings);
    } catch (error) {
      showError("Failed to fetch meetings");
    }
  };

  // Handle task actions
  const handleCreateTask = async () => {
    try {
      // await meetingsAPI.createTask(formData);
      showSuccess("Task created successfully");
      setDialogOpen(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      showError("Failed to create task");
    }
  };

  const handleUpdateTask = async () => {
    try {
      // await meetingsAPI.updateTask(editingTask.id, formData);
      showSuccess("Task updated successfully");
      setDialogOpen(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      showError("Failed to update task");
    }
  };

  const handleDeleteTask = (task) => {
    openDialog({
      title: "Delete Task",
      message: `Are you sure you want to delete the task "${task.title}"?`,
      onConfirm: async () => {
        try {
          // await meetingsAPI.deleteTask(task.id);
          showSuccess("Task deleted successfully");
          fetchTasks();
        } catch (error) {
          showError("Failed to delete task");
        }
      },
    });
    setAnchorEl(null);
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      // await meetingsAPI.updateTaskStatus(task.id, { status: newStatus });
      showSuccess(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (error) {
      showError("Failed to update task status");
    }
    setAnchorEl(null);
  };

  const resetForm = () => {
    setFormData({
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
    setEditingTask(null);
  };

  // Handle edit
  const handleEdit = (task) => {
    setFormData({ ...task });
    setEditingTask(task);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.meeting_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesAssignee =
      !assigneeFilter ||
      task.assigned_to.toLowerCase().includes(assigneeFilter.toLowerCase());
    const matchesMeeting =
      !meetingFilter || task.meeting_id.toString() === meetingFilter;

    // Due date filter
    let matchesDueDate = true;
    if (dueDateFilter) {
      const today = new Date();
      const taskDueDate = new Date(task.due_date);
      switch (dueDateFilter) {
        case "overdue":
          matchesDueDate = task.overdue;
          break;
        case "today":
          matchesDueDate =
            format(taskDueDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          break;
        case "this_week":
          matchesDueDate =
            differenceInDays(taskDueDate, today) <= 7 &&
            differenceInDays(taskDueDate, today) >= 0;
          break;
        case "next_week":
          matchesDueDate =
            differenceInDays(taskDueDate, today) <= 14 &&
            differenceInDays(taskDueDate, today) > 7;
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

  // Get task metrics
  const getTaskMetrics = () => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const overdue = filteredTasks.filter((t) => t.overdue).length;
    const inProgress = filteredTasks.filter(
      (t) => t.status === "in_progress"
    ).length;

    return { total, completed, overdue, inProgress };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h4">Meeting Tasks & Action Items</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchTasks}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                onClick={() => setActiveTab(2)}
              >
                Analytics
              </Button>
              {hasPermission(PERMISSIONS.MANAGE_MEETINGS) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  Create Task
                </Button>
              )}
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Track and manage action items and tasks created from meetings
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div">
                        {card.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.subtitle}
                      </Typography>
                    </Box>
                    <Box sx={{ color: `${card.color}.main` }}>{card.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={2.5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search tasks..."
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
                <Grid item xs={12} md={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {taskStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="">All Priorities</MenuItem>
                      {priorityLevels.map((priority) => (
                        <MenuItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Meeting</InputLabel>
                    <Select
                      value={meetingFilter}
                      onChange={(e) => setMeetingFilter(e.target.value)}
                      label="Meeting"
                    >
                      <MenuItem value="">All Meetings</MenuItem>
                      {meetings.map((meeting) => (
                        <MenuItem
                          key={meeting.id}
                          value={meeting.id.toString()}
                        >
                          {meeting.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Due Date</InputLabel>
                    <Select
                      value={dueDateFilter}
                      onChange={(e) => setDueDateFilter(e.target.value)}
                      label="Due Date"
                    >
                      <MenuItem value="">All Dates</MenuItem>
                      <MenuItem value="overdue">Overdue</MenuItem>
                      <MenuItem value="today">Due Today</MenuItem>
                      <MenuItem value="this_week">This Week</MenuItem>
                      <MenuItem value="next_week">Next Week</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Assignee"
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Content Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
            >
              <Tab label={`All Tasks (${filteredTasks.length})`} />
              <Tab
                label={`My Tasks (${filteredTasks.filter((t) => t.assigned_to_email === user?.email).length})`}
              />
              <Tab label="Analytics" />
            </Tabs>

            {/* Tasks List Tab */}
            {(activeTab === 0 || activeTab === 1) && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={
                      activeTab === 1
                        ? filteredTasks.filter(
                            (t) => t.assigned_to_email === user?.email
                          )
                        : filteredTasks
                    }
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    getRowHeight={() => "auto"}
                    sx={{
                      "& .MuiDataGrid-cell": {
                        py: 1,
                      },
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Analytics Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  {/* Task Distribution by Status */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Task Distribution by Status
                        </Typography>
                        <List>
                          {taskStatuses.map((status) => {
                            const count = filteredTasks.filter(
                              (t) => t.status === status.value
                            ).length;
                            const percentage =
                              filteredTasks.length > 0
                                ? (count / filteredTasks.length) * 100
                                : 0;

                            return count > 0 ? (
                              <ListItem key={status.value}>
                                <ListItemAvatar>
                                  <Avatar
                                    sx={{ bgcolor: `${status.color}.main` }}
                                  >
                                    {status.icon}
                                  </Avatar>
                                </ListItemAvatar>
                                <MUIListItemText
                                  primary={status.label}
                                  secondary={`${count} tasks (${percentage.toFixed(1)}%)`}
                                />
                              </ListItem>
                            ) : null;
                          })}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Task Distribution by Priority */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Task Distribution by Priority
                        </Typography>
                        <List>
                          {priorityLevels.map((priority) => {
                            const count = filteredTasks.filter(
                              (t) => t.priority === priority.value
                            ).length;
                            const percentage =
                              filteredTasks.length > 0
                                ? (count / filteredTasks.length) * 100
                                : 0;

                            return count > 0 ? (
                              <ListItem key={priority.value}>
                                <ListItemAvatar>
                                  <Avatar
                                    sx={{ bgcolor: `${priority.color}.main` }}
                                  >
                                    <PriorityIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <MUIListItemText
                                  primary={priority.label}
                                  secondary={`${count} tasks (${percentage.toFixed(1)}%)`}
                                />
                              </ListItem>
                            ) : null;
                          })}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Productivity Metrics */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Productivity Metrics
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="success.main">
                                {Math.round(
                                  (filteredTasks.filter(
                                    (t) => t.status === "completed"
                                  ).length /
                                    filteredTasks.length) *
                                    100
                                ) || 0}
                                %
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Completion Rate
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="error.main">
                                {filteredTasks.filter((t) => t.overdue).length}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Overdue Tasks
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="primary.main">
                                {Math.round(
                                  filteredTasks.reduce(
                                    (sum, t) => sum + (t.actual_hours || 0),
                                    0
                                  )
                                )}
                                h
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Total Hours Logged
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: "center", p: 2 }}>
                              <Typography variant="h4" color="warning.main">
                                {Math.round(
                                  filteredTasks.reduce(
                                    (sum, t) => sum + t.progress_percentage,
                                    0
                                  ) / filteredTasks.length
                                ) || 0}
                                %
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Average Progress
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setViewDialogOpen(true);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_MEETINGS) && (
            <MenuItem onClick={() => handleEdit(selectedTask)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Task</ListItemText>
            </MenuItem>
          )}
          {selectedTask?.status !== "completed" && (
            <MenuItem
              onClick={() => handleStatusChange(selectedTask, "completed")}
            >
              <ListItemIcon>
                <CompletedIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Mark Complete</ListItemText>
            </MenuItem>
          )}
          {selectedTask?.status === "pending" && (
            <MenuItem
              onClick={() => handleStatusChange(selectedTask, "in_progress")}
            >
              <ListItemIcon>
                <PlayArrowIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Start Task</ListItemText>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => navigate(`/meetings/${selectedTask?.meeting_id}`)}
          >
            <ListItemIcon>
              <EventIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Meeting</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              /* Add comment */
            }}
          >
            <ListItemIcon>
              <CommentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Comment</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              /* Print task */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Task</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_MEETINGS) && (
            <MenuItem
              onClick={() => handleDeleteTask(selectedTask)}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Task</ListItemText>
            </MenuItem>
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Meeting</InputLabel>
                  <Select
                    value={formData.meeting_id}
                    onChange={(e) =>
                      setFormData({ ...formData, meeting_id: e.target.value })
                    }
                    label="Meeting"
                    required
                  >
                    {meetings.map((meeting) => (
                      <MenuItem key={meeting.id} value={meeting.id}>
                        {meeting.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    label="Category"
                  >
                    {taskCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Assigned To"
                  value={formData.assigned_to}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_to: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Assignee Email"
                  type="email"
                  value={formData.assigned_to_email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assigned_to_email: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Due Date"
                  value={formData.due_date}
                  onChange={(date) =>
                    setFormData({ ...formData, due_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Hours"
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_hours: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
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
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    label="Status"
                  >
                    {taskStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_recurring}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_recurring: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Recurring Task"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={editingTask ? handleUpdateTask : handleCreateTask}
              variant="contained"
            >
              {editingTask ? "Update" : "Create"} Task
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Task Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Task Details - {selectedTask?.title}</DialogTitle>
          <DialogContent>
            {selectedTask && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Task Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Description
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedTask.description}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Category
                          </Typography>
                          <Chip
                            label={selectedTask.category}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Meeting Source
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedTask.meeting_title}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Created By
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedTask.assigned_by}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Estimated Hours
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedTask.estimated_hours || 0} hours
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Actual Hours
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedTask.actual_hours || 0} hours
                          </Typography>
                        </Grid>
                        {selectedTask.notes && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Notes
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedTask.notes}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Task Status
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Assigned To
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                          >
                            {selectedTask.assigned_to?.charAt(0)}
                          </Avatar>
                          <Typography variant="body1">
                            {selectedTask.assigned_to}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography
                          variant="body1"
                          color={
                            selectedTask.overdue ? "error.main" : "text.primary"
                          }
                        >
                          {format(
                            new Date(selectedTask.due_date),
                            "dd/MM/yyyy"
                          )}
                          {selectedTask.overdue && (
                            <Chip
                              label="Overdue"
                              size="small"
                              color="error"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Priority
                        </Typography>
                        <Chip
                          label={
                            priorityLevels.find(
                              (p) => p.value === selectedTask.priority
                            )?.label
                          }
                          size="small"
                          color={
                            priorityLevels.find(
                              (p) => p.value === selectedTask.priority
                            )?.color
                          }
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={
                            taskStatuses.find(
                              (s) => s.value === selectedTask.status
                            )?.label
                          }
                          size="small"
                          color={
                            taskStatuses.find(
                              (s) => s.value === selectedTask.status
                            )?.color
                          }
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Progress
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={selectedTask.progress_percentage}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={
                            selectedTask.progress_percentage === 100
                              ? "success"
                              : "primary"
                          }
                        />
                        <Typography
                          variant="caption"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {selectedTask.progress_percentage}% complete
                        </Typography>
                      </Box>
                      {selectedTask.dependencies?.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Dependencies
                          </Typography>
                          <Typography variant="body2">
                            {selectedTask.dependencies.length} dependent task(s)
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Activity
                        </Typography>
                        <Typography variant="body2">
                          {selectedTask.comments_count || 0} comments •{" "}
                          {selectedTask.attachments_count || 0} attachments
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                navigate(`/meetings/${selectedTask?.meeting_id}`);
              }}
            >
              View Meeting
            </Button>
            {hasPermission(PERMISSIONS.MANAGE_MEETINGS) &&
              selectedTask?.status !== "completed" && (
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

export default MeetingTasksPage;