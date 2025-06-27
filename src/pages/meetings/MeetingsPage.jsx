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
  Tabs,
  Tab,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Alert,
  Badge,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as MeetingIcon,
  Schedule as ScheduleIcon,
  Assignment as TaskIcon,
  AttachFile as AttachIcon,
  VideoCall as VideoCallIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CheckCircle as CompleteIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  EventNote as MinutesIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isPast, isFuture, isToday } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, MEETING_PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
import meetingsAPI from "../../services/api/meetings.api";

const MeetingsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [meetings, setMeetings] = useState([]);
  const [meetingTasks, setMeetingTasks] = useState([]);
  const [statistics, setStatistics] = useState({
    total_meetings: 0,
    todays_meetings: 0,
    pending_tasks: 0,
    meetings_with_minutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  // API Integration
  useEffect(() => {
    fetchMeetingsData();
    fetchMeetingStatistics();
  }, [statusFilter, dateFilter]);

  const fetchMeetingsData = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = format(dateFilter, "yyyy-MM-dd");

      // Fetch meetings
      const meetingsResponse = await meetingsAPI.getAllMeetings(params);
      console.log("Meetings Response:", meetingsResponse);

      // FIXED: Access the nested meetings array correctly
      const meetingsData =
        meetingsResponse.data?.meetings || meetingsResponse.data || [];
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);

      // Fetch meeting tasks for the tasks tab
      if (activeTab === 1) {
        const tasksResponse = await meetingsAPI.getMeetingTasks();
        const tasksData = tasksResponse.data?.tasks || tasksResponse.data || [];
        setMeetingTasks(Array.isArray(tasksData) ? tasksData : []);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      showError(error.response?.data?.message || "Failed to fetch meetings");
      // Set empty arrays on error to prevent filter issues
      setMeetings([]);
      setMeetingTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingTasks = async () => {
    try {
      const response = await meetingsAPI.getMeetingTasks();
      const tasksData = response.data?.tasks || response.data || [];
      setMeetingTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error("Error fetching meeting tasks:", error);
      showError("Failed to fetch meeting tasks");
      setMeetingTasks([]);
    }
  };

  const fetchMeetingStatistics = async () => {
    try {
      const response = await meetingsAPI.getMeetingStatistics();
      const statsData = response.data?.statistics ||
        response.data || {
          total_meetings: 0,
          todays_meetings: 0,
          pending_tasks: 0,
          meetings_with_minutes: 0,
        };
      setStatistics(statsData);
    } catch (error) {
      console.error("Error fetching meeting statistics:", error);
      // Don't show error for statistics as it's not critical
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMeetingsData(), fetchMeetingStatistics()]);
    setRefreshing(false);
    showSuccess("Data refreshed successfully");
  };

  // Meeting actions
  const handleCreateMeeting = () => {
    navigate("/meetings/create");
  };

  const handleViewMeeting = async (meetingId) => {
    try {
      const response = await meetingsAPI.getMeetingById(meetingId);
      const meetingData = response.data?.meeting || response.data;
      setSelectedItem(meetingData);
      setViewDialogOpen(true);
    } catch (error) {
      showError("Failed to fetch meeting details");
    }
  };

  const handleEditMeeting = (meetingId) => {
    navigate(`/meetings/${meetingId}/edit`);
  };

  const handleDeleteMeeting = async (meetingId) => {
    openDialog({
      title: "Delete Meeting",
      message:
        "Are you sure you want to delete this meeting? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await meetingsAPI.deleteMeeting(meetingId);
          setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
          showSuccess("Meeting deleted successfully");
          await fetchMeetingStatistics(); // Refresh statistics
        } catch (error) {
          showError(
            error.response?.data?.message || "Failed to delete meeting"
          );
        }
      },
    });
  };

  const handleStartMeeting = async (meetingId) => {
    try {
      await meetingsAPI.updateMeetingStatus(meetingId, "in_progress");
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId ? { ...m, status: "in_progress" } : m
        )
      );
      showSuccess("Meeting started");
    } catch (error) {
      showError(error.response?.data?.message || "Failed to start meeting");
    }
  };

  const handleCompleteMeeting = async (meetingId) => {
    try {
      await meetingsAPI.updateMeetingStatus(meetingId, "completed");
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId ? { ...m, status: "completed" } : m
        )
      );
      showSuccess("Meeting completed");
      // Navigate to minutes page
      navigate(`/meetings/${meetingId}/minutes`);
    } catch (error) {
      showError(error.response?.data?.message || "Failed to complete meeting");
    }
  };

  const handleUploadMinutes = (meetingId) => {
    navigate(`/meetings/${meetingId}/upload-minutes`);
  };

  const handleViewTasks = (meetingId) => {
    navigate(`/meetings/${meetingId}/tasks`);
  };

  const handleSendNotification = async (meetingId, notificationData) => {
    try {
      await meetingsAPI.sendMeetingNotifications(meetingId, notificationData);
      showSuccess("Notification sent successfully");
      setNotificationDialogOpen(false);
    } catch (error) {
      showError(error.response?.data?.message || "Failed to send notification");
    }
  };

  // Task actions
  const handleUpdateTaskProgress = async (taskId, progress, status) => {
    try {
      await meetingsAPI.updateTaskProgress(taskId, progress, status);
      await fetchMeetingTasks(); // Refresh tasks
      showSuccess("Task progress updated");
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to update task progress"
      );
    }
  };

  // Event handlers
  const handleMenuClick = (event, item, type) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem({ ...item, itemType: type });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1 && meetingTasks.length === 0) {
      fetchMeetingTasks();
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "primary";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "scheduled":
        return <ScheduleIcon />;
      case "in_progress":
        return <PendingIcon />;
      case "completed":
        return <CompleteIcon />;
      case "cancelled":
        return <CancelIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

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

  const getTaskStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "not_started":
        return "default";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  const getMeetingStatus = (meeting) => {
    const meetingDateTime = new Date(
      `${meeting.meeting_date}T${meeting.start_time}`
    );
    const now = new Date();

    if (meeting.status === "cancelled") return "cancelled";
    if (meeting.status === "completed") return "completed";
    if (meeting.status === "in_progress") return "in_progress";
    if (meetingDateTime > now) return "scheduled";
    return "scheduled";
  };

  // DataGrid columns
  const meetingsColumns = [
    {
      field: "meeting_title",
      headerName: "Meeting Title",
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.meeting_type}
          </Typography>
        </Box>
      ),
    },
    {
      field: "meeting_date",
      headerName: "Date & Time",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {format(new Date(params.value), "dd/MM/yyyy")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.start_time} - {params.row.end_time}
          </Typography>
        </Box>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {params.row.is_virtual ? (
            <VideoCallIcon fontSize="small" />
          ) : (
            <LocationIcon fontSize="small" />
          )}
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "chairperson",
      headerName: "Chairperson",
      width: 150,
    },
    {
      field: "attendees",
      headerName: "Attendees",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AvatarGroup
            max={3}
            sx={{
              "& .MuiAvatar-root": {
                width: 24,
                height: 24,
                fontSize: "0.75rem",
              },
            }}
          >
            {(params.value || []).slice(0, 3).map((attendee, index) => (
              <Avatar key={index} title={attendee.name}>
                {attendee.name?.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
          {(params.value || []).length > 3 && (
            <Typography variant="caption">
              +{(params.value || []).length - 3}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "tasks_count",
      headerName: "Tasks",
      width: 80,
      align: "center",
      renderCell: (params) =>
        params.value > 0 ? (
          <Badge badgeContent={params.value} color="primary">
            <TaskIcon fontSize="small" />
          </Badge>
        ) : (
          <Typography variant="caption" color="text.secondary">
            0
          </Typography>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = getMeetingStatus(params.row);
        return (
          <Chip
            icon={getStatusIcon(status)}
            label={status.replace("_", " ")}
            color={getStatusColor(status)}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row, "meeting")}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const tasksColumns = [
    {
      field: "task_description",
      headerName: "Task Description",
      width: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.meeting_title}
          </Typography>
        </Box>
      ),
    },
    {
      field: "assigned_to",
      headerName: "Assigned To",
      width: 150,
    },
    {
      field: "due_date",
      headerName: "Due Date",
      width: 120,
      renderCell: (params) => {
        const isOverdue =
          isPast(new Date(params.value)) && params.row.status !== "completed";
        return (
          <Typography variant="body2" color={isOverdue ? "error" : "inherit"}>
            {format(new Date(params.value), "dd/MM/yyyy")}
          </Typography>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPriorityColor(params.value)}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "progress",
      headerName: "Progress",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            color={
              params.value === 100
                ? "success"
                : params.value >= 50
                  ? "primary"
                  : "warning"
            }
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" align="center">
            {params.value}%
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.replace("_", " ")}
          color={getTaskStatusColor(params.value)}
          size="small"
          sx={{ textTransform: "capitalize" }}
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
          onClick={(e) => handleMenuClick(e, params.row, "task")}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Filter data - Added safety checks
  const filteredMeetings = Array.isArray(meetings)
    ? meetings.filter(
        (meeting) =>
          meeting.meeting_title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          meeting.meeting_type
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          meeting.chairperson?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredTasks = Array.isArray(meetingTasks)
    ? meetingTasks.filter(
        (task) =>
          task.task_description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          task.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.meeting_title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Meeting Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Schedule, manage, and track meetings and action items
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={
                refreshing ? <CircularProgress size={16} /> : <RefreshIcon />
              }
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            {hasPermission(MEETING_PERMISSIONS.CREATE_MEETINGS) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateMeeting}
              >
                Schedule Meeting
              </Button>
            )}
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
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
                    <Typography variant="h6" component="div">
                      {statistics.total_meetings}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Meetings
                    </Typography>
                  </Box>
                  <MeetingIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
                    <Typography variant="h6" component="div">
                      {statistics.todays_meetings}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Meetings
                    </Typography>
                  </Box>
                  <ScheduleIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
                    <Typography variant="h6" component="div">
                      {statistics.pending_tasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Tasks
                    </Typography>
                  </Box>
                  <TaskIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
                    <Typography variant="h6" component="div">
                      {statistics.meetings_with_minutes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      With Minutes
                    </Typography>
                  </Box>
                  <MinutesIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Meetings" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Meeting Tasks
                  {statistics.pending_tasks > 0 && (
                    <Badge
                      badgeContent={statistics.pending_tasks}
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Card>

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={
                      activeTab === 0 ? "Search meetings..." : "Search tasks..."
                    }
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
                {activeTab === 0 && (
                  <>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <DatePicker
                        label="Meeting Date"
                        value={dateFilter}
                        onChange={setDateFilter}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                          },
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            {/* Data Grid */}
            <DataGrid
              rows={activeTab === 0 ? filteredMeetings : filteredTasks}
              columns={activeTab === 0 ? meetingsColumns : tasksColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              autoHeight
              loading={loading}
              sx={{
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedItem?.itemType === "meeting" && (
            <>
              <MenuItem
                onClick={() => {
                  handleViewMeeting(selectedItem?.id);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <ViewIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Details</ListItemText>
              </MenuItem>

              {hasPermission(MEETING_PERMISSIONS.UPDATE_MEETINGS) && (
                <MenuItem
                  onClick={() => {
                    handleEditMeeting(selectedItem?.id);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit Meeting</ListItemText>
                </MenuItem>
              )}

              {selectedItem?.status === "scheduled" && (
                <MenuItem
                  onClick={() => {
                    handleStartMeeting(selectedItem?.id);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <ScheduleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Start Meeting</ListItemText>
                </MenuItem>
              )}

              {selectedItem?.status === "in_progress" && (
                <MenuItem
                  onClick={() => {
                    handleCompleteMeeting(selectedItem?.id);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <CompleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Complete Meeting</ListItemText>
                </MenuItem>
              )}

              {!selectedItem?.minutes_document_id &&
                hasPermission(MEETING_PERMISSIONS.UPLOAD_MEETING_MINUTES) && (
                  <MenuItem
                    onClick={() => {
                      handleUploadMinutes(selectedItem?.id);
                      handleMenuClose();
                    }}
                  >
                    <ListItemIcon>
                      <MinutesIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Upload Minutes</ListItemText>
                  </MenuItem>
                )}

              <MenuItem
                onClick={() => {
                  handleViewTasks(selectedItem?.id);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <TaskIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Tasks</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setNotificationDialogOpen(true);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <NotificationIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Send Notification</ListItemText>
              </MenuItem>

              {hasPermission(MEETING_PERMISSIONS.DELETE_MEETINGS) && (
                <MenuItem
                  onClick={() => {
                    handleDeleteMeeting(selectedItem?.id);
                    handleMenuClose();
                  }}
                  sx={{ color: "error.main" }}
                >
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete Meeting</ListItemText>
                </MenuItem>
              )}
            </>
          )}

          {selectedItem?.itemType === "task" && (
            <>
              <MenuItem
                onClick={() => {
                  navigate(`/meetings/tasks/${selectedItem?.id}`);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <ViewIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Task</ListItemText>
              </MenuItem>

              {hasPermission(MEETING_PERMISSIONS.UPDATE_TASK_STATUS) && (
                <MenuItem
                  onClick={() => {
                    navigate(`/meetings/tasks/${selectedItem?.id}/edit`);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Update Progress</ListItemText>
                </MenuItem>
              )}
            </>
          )}
        </Menu>

        {/* View Meeting Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Meeting Details - {selectedItem?.meeting_title}
          </DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Meeting Information
                  </Typography>
                  <Typography>
                    <strong>Type:</strong> {selectedItem.meeting_type}
                  </Typography>
                  <Typography>
                    <strong>Date:</strong>{" "}
                    {format(new Date(selectedItem.meeting_date), "dd/MM/yyyy")}
                  </Typography>
                  <Typography>
                    <strong>Time:</strong> {selectedItem.start_time} -{" "}
                    {selectedItem.end_time}
                  </Typography>
                  <Typography>
                    <strong>Location:</strong> {selectedItem.location}
                  </Typography>
                  <Typography>
                    <strong>Chairperson:</strong> {selectedItem.chairperson}
                  </Typography>
                  {selectedItem.is_virtual && selectedItem.meeting_link && (
                    <Typography>
                      <strong>Meeting Link:</strong>{" "}
                      <a
                        href={selectedItem.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join Meeting
                      </a>
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Status & Progress
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedItem.status)}
                    label={selectedItem.status?.replace("_", " ")}
                    color={getStatusColor(selectedItem.status)}
                    sx={{ textTransform: "capitalize", mb: 2 }}
                  />
                  <Typography>
                    <strong>Tasks Created:</strong>{" "}
                    {selectedItem.tasks_count || 0}
                  </Typography>
                  <Typography>
                    <strong>Minutes:</strong>{" "}
                    {selectedItem.minutes_document_id
                      ? "Available"
                      : "Not uploaded"}
                  </Typography>
                  <Typography>
                    <strong>Organizer:</strong> {selectedItem.organizer}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Agenda Items
                  </Typography>
                  {Array.isArray(selectedItem.agenda_items) ? (
                    selectedItem.agenda_items.map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        {index + 1}. {item}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No agenda items
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Attendees
                  </Typography>
                  <Grid container spacing={1}>
                    {Array.isArray(selectedItem.attendees) ? (
                      selectedItem.attendees.map((attendee, index) => (
                        <Grid item key={index}>
                          <Chip
                            avatar={<Avatar>{attendee.name?.charAt(0)}</Avatar>}
                            label={`${attendee.name} (${attendee.attendance_status})`}
                            color={
                              attendee.attendance_status === "attended" ||
                              attendee.attendance_status === "confirmed"
                                ? "success"
                                : "default"
                            }
                            variant="outlined"
                          />
                        </Grid>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No attendees
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                {selectedItem.documents &&
                  selectedItem.documents.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Documents
                      </Typography>
                      {selectedItem.documents.map((doc, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          sx={{ mb: 0.5 }}
                        >
                          • {doc.name} <em>(uploaded by {doc.uploaded_by})</em>
                        </Typography>
                      ))}
                    </Grid>
                  )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            {selectedItem &&
              hasPermission(MEETING_PERMISSIONS.UPDATE_MEETINGS) && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEditMeeting(selectedItem.id);
                  }}
                >
                  Edit Meeting
                </Button>
              )}
          </DialogActions>
        </Dialog>

        {/* Notification Dialog */}
        <Dialog
          open={notificationDialogOpen}
          onClose={() => setNotificationDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Send Meeting Notification</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Send notification about "{selectedItem?.meeting_title}" to
              attendees.
            </Typography>
            <TextField
              fullWidth
              label="Notification Type"
              select
              defaultValue="reminder"
              sx={{ mb: 2 }}
            >
              <MenuItem value="reminder">Meeting Reminder</MenuItem>
              <MenuItem value="update">Meeting Update</MenuItem>
              <MenuItem value="cancellation">Meeting Cancellation</MenuItem>
              <MenuItem value="reschedule">Meeting Reschedule</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Custom Message"
              multiline
              rows={3}
              placeholder="Enter custom message (optional)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotificationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                handleSendNotification(selectedItem?.id, { type: "reminder" })
              }
            >
              Send Notification
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

export default MeetingsPage;
