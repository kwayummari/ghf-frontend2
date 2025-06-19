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
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isPast, isFuture, isToday } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Sample meeting data
  const sampleMeetings = [
    {
      id: 1,
      meeting_title: "Monthly Management Review",
      meeting_type: "Management Meeting",
      meeting_date: "2024-07-15",
      start_time: "09:00",
      end_time: "11:00",
      location: "Conference Room A",
      is_virtual: false,
      meeting_link: null,
      chairperson: "Executive Director",
      chairperson_id: 1,
      organizer: "Admin Assistant",
      organizer_id: 2,
      status: "scheduled",
      agenda_items: [
        "Review of Q2 performance",
        "Budget discussion for Q3",
        "Staff updates",
        "New project proposals",
      ],
      attendees: [
        {
          id: 1,
          name: "John Director",
          role: "Executive Director",
          attendance_status: "confirmed",
        },
        {
          id: 2,
          name: "Jane HR",
          role: "HR Manager",
          attendance_status: "confirmed",
        },
        {
          id: 3,
          name: "Mike Finance",
          role: "Finance Manager",
          attendance_status: "pending",
        },
        {
          id: 4,
          name: "Sarah Program",
          role: "Program Manager",
          attendance_status: "confirmed",
        },
      ],
      documents: [
        {
          id: 1,
          name: "Q2 Performance Report.pdf",
          uploaded_by: "Finance Manager",
        },
        {
          id: 2,
          name: "Q3 Budget Proposal.xlsx",
          uploaded_by: "Finance Manager",
        },
      ],
      minutes_document_id: null,
      tasks_count: 0,
      created_at: "2024-07-01",
    },
    {
      id: 2,
      meeting_title: "GBV Program Planning Session",
      meeting_type: "Program Meeting",
      meeting_date: "2024-07-18",
      start_time: "14:00",
      end_time: "16:30",
      location: "Virtual Meeting",
      is_virtual: true,
      meeting_link: "https://zoom.us/j/123456789",
      chairperson: "Program Manager",
      chairperson_id: 3,
      organizer: "Program Officer",
      organizer_id: 4,
      status: "completed",
      agenda_items: [
        "Review of current GBV interventions",
        "Community feedback analysis",
        "Planning for next quarter activities",
        "Resource allocation discussion",
      ],
      attendees: [
        {
          id: 3,
          name: "Sarah Program",
          role: "Program Manager",
          attendance_status: "attended",
        },
        {
          id: 4,
          name: "Mike Officer",
          role: "Program Officer",
          attendance_status: "attended",
        },
        {
          id: 5,
          name: "Lisa Field",
          role: "Field Coordinator",
          attendance_status: "attended",
        },
        {
          id: 6,
          name: "David Community",
          role: "Community Liaison",
          attendance_status: "absent",
        },
      ],
      documents: [
        {
          id: 3,
          name: "GBV Program Status Report.pdf",
          uploaded_by: "Program Manager",
        },
        {
          id: 4,
          name: "Community Feedback Summary.docx",
          uploaded_by: "Field Coordinator",
        },
      ],
      minutes_document_id: 1,
      tasks_count: 5,
      created_at: "2024-07-10",
    },
    {
      id: 3,
      meeting_title: "IT Infrastructure Review",
      meeting_type: "Technical Meeting",
      meeting_date: "2024-07-20",
      start_time: "10:00",
      end_time: "12:00",
      location: "IT Department",
      is_virtual: false,
      meeting_link: null,
      chairperson: "IT Manager",
      chairperson_id: 5,
      organizer: "IT Manager",
      organizer_id: 5,
      status: "in_progress",
      agenda_items: [
        "Server performance review",
        "Network security assessment",
        "Software license renewals",
        "Hardware upgrade proposals",
      ],
      attendees: [
        {
          id: 5,
          name: "Tech Manager",
          role: "IT Manager",
          attendance_status: "confirmed",
        },
        {
          id: 6,
          name: "Dev John",
          role: "Software Developer",
          attendance_status: "confirmed",
        },
        {
          id: 7,
          name: "Net Admin",
          role: "Network Administrator",
          attendance_status: "confirmed",
        },
      ],
      documents: [
        {
          id: 5,
          name: "IT Infrastructure Report.pdf",
          uploaded_by: "IT Manager",
        },
        {
          id: 6,
          name: "Security Assessment.pdf",
          uploaded_by: "Network Administrator",
        },
      ],
      minutes_document_id: null,
      tasks_count: 0,
      created_at: "2024-07-15",
    },
  ];

  const sampleMeetingTasks = [
    {
      id: 1,
      meeting_id: 2,
      meeting_title: "GBV Program Planning Session",
      task_description: "Prepare detailed budget for Q3 GBV activities",
      assigned_to: "Program Manager",
      assigned_to_id: 3,
      raised_by: "Program Officer",
      raised_by_id: 4,
      due_date: "2024-07-25",
      status: "in_progress",
      priority: "high",
      follow_up_person: "Program Director",
      follow_up_person_id: 1,
      progress: 60,
      comments: "Initial draft completed, awaiting review",
      created_at: "2024-07-18",
    },
    {
      id: 2,
      meeting_id: 2,
      meeting_title: "GBV Program Planning Session",
      task_description: "Coordinate with community leaders for next phase",
      assigned_to: "Field Coordinator",
      assigned_to_id: 5,
      raised_by: "Program Manager",
      raised_by_id: 3,
      due_date: "2024-07-30",
      status: "not_started",
      priority: "medium",
      follow_up_person: "Program Manager",
      follow_up_person_id: 3,
      progress: 0,
      comments: null,
      created_at: "2024-07-18",
    },
    {
      id: 3,
      meeting_id: 2,
      meeting_title: "GBV Program Planning Session",
      task_description: "Update training materials based on feedback",
      assigned_to: "Program Officer",
      assigned_to_id: 4,
      raised_by: "Field Coordinator",
      raised_by_id: 5,
      due_date: "2024-07-22",
      status: "completed",
      priority: "medium",
      follow_up_person: "Program Manager",
      follow_up_person_id: 3,
      progress: 100,
      comments: "Materials updated and reviewed",
      created_at: "2024-07-18",
    },
  ];

  useEffect(() => {
    fetchMeetings();
    fetchMeetingTasks();
  }, [statusFilter, dateFilter]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let filteredData = sampleMeetings;
      if (statusFilter) {
        filteredData = filteredData.filter((m) => m.status === statusFilter);
      }
      if (dateFilter) {
        const filterDate = format(dateFilter, "yyyy-MM-dd");
        filteredData = filteredData.filter(
          (m) => m.meeting_date === filterDate
        );
      }

      setMeetings(filteredData);
    } catch (error) {
      showError("Failed to fetch meetings");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingTasks = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMeetingTasks(sampleMeetingTasks);
    } catch (error) {
      showError("Failed to fetch meeting tasks");
    }
  };

  const handleCreateMeeting = () => {
    navigate("/meetings/create");
  };

  const handleViewMeeting = (meetingId) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    setSelectedItem(meeting);
    setViewDialogOpen(true);
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
          // API call to delete meeting
          setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
          showSuccess("Meeting deleted successfully");
        } catch (error) {
          showError("Failed to delete meeting");
        }
      },
    });
  };

  const handleStartMeeting = (meetingId) => {
    // Update meeting status to in_progress
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId ? { ...m, status: "in_progress" } : m
      )
    );
    showSuccess("Meeting started");
  };

  const handleCompleteMeeting = (meetingId) => {
    navigate(`/meetings/${meetingId}/minutes`);
  };

  const handleUploadMinutes = (meetingId) => {
    navigate(`/meetings/${meetingId}/upload-minutes`);
  };

  const handleViewTasks = (meetingId) => {
    navigate(`/meetings/${meetingId}/tasks`);
  };

  const handleMenuClick = (event, item, type) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem({ ...item, itemType: type });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

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
            {params.value.slice(0, 3).map((attendee, index) => (
              <Avatar key={index} title={attendee.name}>
                {attendee.name.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
          {params.value.length > 3 && (
            <Typography variant="caption">
              +{params.value.length - 3}
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

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.meeting_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.meeting_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.chairperson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = meetingTasks.filter(
    (task) =>
      task.task_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.meeting_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {hasPermission(PERMISSIONS.CREATE_MEETINGS) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateMeeting}
            >
              Schedule Meeting
            </Button>
          )}
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
                      {meetings.length}
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
                      {
                        meetings.filter((m) =>
                          isToday(new Date(m.meeting_date))
                        ).length
                      }
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
                      {
                        meetingTasks.filter((t) => t.status !== "completed")
                          .length
                      }
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
                      {meetings.filter((m) => m.minutes_document_id).length}
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
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Meetings" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Meeting Tasks
                  {meetingTasks.filter((t) => t.status !== "completed").length >
                    0 && (
                    <Badge
                      badgeContent={
                        meetingTasks.filter((t) => t.status !== "completed")
                          .length
                      }
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
            {loading ? (
              <LoadingSpinner />
            ) : (
              <DataGrid
                rows={activeTab === 0 ? filteredMeetings : filteredTasks}
                columns={activeTab === 0 ? meetingsColumns : tasksColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                autoHeight
                sx={{
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                }}
              />
            )}
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

              {hasPermission(PERMISSIONS.UPDATE_MEETINGS) && (
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

              {!selectedItem?.minutes_document_id && (
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

              {hasPermission(PERMISSIONS.DELETE_MEETINGS) && (
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

              {hasPermission(PERMISSIONS.UPDATE_TASK_STATUS) && (
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Status & Progress
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedItem.status)}
                    label={selectedItem.status.replace("_", " ")}
                    color={getStatusColor(selectedItem.status)}
                    sx={{ textTransform: "capitalize", mb: 2 }}
                  />
                  <Typography>
                    <strong>Tasks Created:</strong> {selectedItem.tasks_count}
                  </Typography>
                  <Typography>
                    <strong>Minutes:</strong>{" "}
                    {selectedItem.minutes_document_id
                      ? "Available"
                      : "Not uploaded"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Agenda Items
                  </Typography>
                  {selectedItem.agenda_items?.map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {index + 1}. {item}
                    </Typography>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Attendees
                  </Typography>
                  <Grid container spacing={1}>
                    {selectedItem.attendees?.map((attendee, index) => (
                      <Grid item key={index}>
                        <Chip
                          avatar={<Avatar>{attendee.name.charAt(0)}</Avatar>}
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
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default MeetingsPage;
