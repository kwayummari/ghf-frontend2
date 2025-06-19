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
  LinearProgress,
  Avatar,
  Rating,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AppraisalIcon,
  TrendingUp as PerformanceIcon,
  Star as RatingIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  Feedback as FeedbackIcon,
  Flag as GoalIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, differenceInDays } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";

const PerformanceAppraisalsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Sample appraisal data
  const sampleAppraisals = [
    {
      id: 1,
      employee_id: 1,
      employee_name: "John Doe",
      employee_number: "GHF001",
      department: "IT Department",
      position: "Software Developer",
      supervisor_name: "Tech Lead",
      appraisal_period: "Q2 2024",
      review_period_start: "2024-04-01",
      review_period_end: "2024-06-30",
      due_date: "2024-07-15",
      status: "in_progress",
      overall_rating: 4.2,
      self_assessment_complete: true,
      supervisor_review_complete: false,
      hr_review_complete: false,
      created_at: "2024-07-01",
      competencies: [
        {
          name: "Technical Skills",
          self_rating: 4,
          supervisor_rating: null,
          weight: 30,
        },
        {
          name: "Communication",
          self_rating: 4,
          supervisor_rating: null,
          weight: 20,
        },
        {
          name: "Teamwork",
          self_rating: 5,
          supervisor_rating: null,
          weight: 20,
        },
        {
          name: "Problem Solving",
          self_rating: 4,
          supervisor_rating: null,
          weight: 20,
        },
        {
          name: "Initiative",
          self_rating: 3,
          supervisor_rating: null,
          weight: 10,
        },
      ],
      objectives: [
        {
          description: "Complete system upgrade project",
          achievement: 85,
          status: "completed",
        },
        {
          description: "Mentor junior developers",
          achievement: 70,
          status: "in_progress",
        },
        {
          description: "Obtain certification",
          achievement: 100,
          status: "completed",
        },
      ],
      achievements: [
        "Successfully led the migration to new database system",
        "Reduced system downtime by 40%",
        "Completed advanced programming certification",
      ],
      development_areas: [
        "Project management skills",
        "Public speaking confidence",
      ],
      goals_next_period: [
        "Lead a cross-functional team project",
        "Complete leadership training program",
      ],
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: "Jane Manager",
      employee_number: "GHF002",
      department: "Human Resources",
      position: "HR Manager",
      supervisor_name: "Director HR",
      appraisal_period: "Q2 2024",
      review_period_start: "2024-04-01",
      review_period_end: "2024-06-30",
      due_date: "2024-07-15",
      status: "completed",
      overall_rating: 4.7,
      self_assessment_complete: true,
      supervisor_review_complete: true,
      hr_review_complete: true,
      created_at: "2024-07-01",
      competencies: [
        {
          name: "Leadership",
          self_rating: 5,
          supervisor_rating: 5,
          weight: 25,
        },
        {
          name: "Strategic Thinking",
          self_rating: 4,
          supervisor_rating: 5,
          weight: 25,
        },
        {
          name: "Employee Relations",
          self_rating: 5,
          supervisor_rating: 4,
          weight: 25,
        },
        {
          name: "Policy Development",
          self_rating: 4,
          supervisor_rating: 4,
          weight: 25,
        },
      ],
      objectives: [
        {
          description: "Implement new HRIS system",
          achievement: 95,
          status: "completed",
        },
        {
          description: "Reduce employee turnover",
          achievement: 80,
          status: "completed",
        },
        {
          description: "Develop training programs",
          achievement: 90,
          status: "completed",
        },
      ],
      achievements: [
        "Successfully implemented new HR management system",
        "Reduced employee turnover by 25%",
        "Developed comprehensive onboarding program",
      ],
      development_areas: ["Data analytics skills", "Change management"],
      goals_next_period: [
        "Implement performance management system",
        "Enhance employee engagement initiatives",
      ],
    },
    {
      id: 3,
      employee_id: 3,
      employee_name: "Mike Program",
      employee_number: "GHF003",
      department: "Programs",
      position: "Program Officer",
      supervisor_name: "Program Manager",
      appraisal_period: "Q2 2024",
      review_period_start: "2024-04-01",
      review_period_end: "2024-06-30",
      due_date: "2024-07-15",
      status: "pending",
      overall_rating: null,
      self_assessment_complete: false,
      supervisor_review_complete: false,
      hr_review_complete: false,
      created_at: "2024-07-01",
      competencies: [
        {
          name: "Program Management",
          self_rating: null,
          supervisor_rating: null,
          weight: 30,
        },
        {
          name: "Community Engagement",
          self_rating: null,
          supervisor_rating: null,
          weight: 25,
        },
        {
          name: "Report Writing",
          self_rating: null,
          supervisor_rating: null,
          weight: 20,
        },
        {
          name: "Data Collection",
          self_rating: null,
          supervisor_rating: null,
          weight: 15,
        },
        {
          name: "Partnership Building",
          self_rating: null,
          supervisor_rating: null,
          weight: 10,
        },
      ],
      objectives: [
        {
          description: "Conduct community outreach programs",
          achievement: null,
          status: "not_started",
        },
        {
          description: "Prepare quarterly reports",
          achievement: null,
          status: "not_started",
        },
        {
          description: "Build partnerships with local NGOs",
          achievement: null,
          status: "not_started",
        },
      ],
      achievements: [],
      development_areas: [],
      goals_next_period: [],
    },
  ];

  useEffect(() => {
    fetchAppraisals();
  }, [statusFilter, departmentFilter, periodFilter]);

  const fetchAppraisals = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let filteredData = sampleAppraisals;
      if (statusFilter) {
        filteredData = filteredData.filter((a) => a.status === statusFilter);
      }
      if (departmentFilter) {
        filteredData = filteredData.filter(
          (a) => a.department === departmentFilter
        );
      }
      if (periodFilter) {
        filteredData = filteredData.filter(
          (a) => a.appraisal_period === periodFilter
        );
      }

      setAppraisals(filteredData);
    } catch (error) {
      showError("Failed to fetch appraisals");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppraisal = () => {
    navigate("/performance/appraisals/create");
  };

  const handleViewAppraisal = (appraisalId) => {
    const appraisal = appraisals.find((a) => a.id === appraisalId);
    setSelectedAppraisal(appraisal);
    setViewDialogOpen(true);
  };

  const handleEditAppraisal = (appraisalId) => {
    navigate(`/performance/appraisals/${appraisalId}/edit`);
  };

  const handleStartSelfAssessment = (appraisalId) => {
    navigate(`/performance/appraisals/${appraisalId}/self-assessment`);
  };

  const handleSupervisorReview = (appraisalId) => {
    navigate(`/performance/appraisals/${appraisalId}/supervisor-review`);
  };

  const handleCompleteAppraisal = async (appraisalId) => {
    openDialog({
      title: "Complete Appraisal",
      message:
        "Are you sure you want to complete this appraisal? This action cannot be undone.",
      onConfirm: async () => {
        try {
          // API call to complete appraisal
          setAppraisals((prev) =>
            prev.map((a) =>
              a.id === appraisalId ? { ...a, status: "completed" } : a
            )
          );
          showSuccess("Appraisal completed successfully");
        } catch (error) {
          showError("Failed to complete appraisal");
        }
      },
    });
  };

  const handleMenuClick = (event, appraisal) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppraisal(appraisal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppraisal(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "completed":
        return "success";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ScheduleIcon />;
      case "in_progress":
        return <TimelineIcon />;
      case "completed":
        return <CompleteIcon />;
      case "overdue":
        return <CancelIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getProgressPercentage = (appraisal) => {
    let progress = 0;
    if (appraisal.self_assessment_complete) progress += 33;
    if (appraisal.supervisor_review_complete) progress += 33;
    if (appraisal.hr_review_complete) progress += 34;
    return progress;
  };

  const columns = [
    {
      field: "employee_name",
      headerName: "Employee",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.employee_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.employee_number} • {params.row.position}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 150,
    },
    {
      field: "appraisal_period",
      headerName: "Period",
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="primary" />
      ),
    },
    {
      field: "due_date",
      headerName: "Due Date",
      width: 120,
      renderCell: (params) => {
        const daysLeft = differenceInDays(new Date(params.value), new Date());
        return (
          <Box>
            <Typography variant="body2">
              {format(new Date(params.value), "dd/MM/yyyy")}
            </Typography>
            <Typography
              variant="caption"
              color={
                daysLeft <= 3
                  ? "error"
                  : daysLeft <= 7
                    ? "warning"
                    : "text.secondary"
              }
            >
              {daysLeft > 0
                ? `${daysLeft} days left`
                : `${Math.abs(daysLeft)} days overdue`}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "progress",
      headerName: "Progress",
      width: 150,
      renderCell: (params) => {
        const progress = getProgressPercentage(params.row);
        return (
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="caption">Progress</Typography>
              <Typography variant="caption">{progress}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={
                progress === 100
                  ? "success"
                  : progress >= 50
                    ? "primary"
                    : "warning"
              }
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        );
      },
    },
    {
      field: "overall_rating",
      headerName: "Rating",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Rating
              value={params.value}
              size="small"
              readOnly
              precision={0.1}
            />
            <Typography variant="caption">({params.value})</Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Not rated
          </Typography>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={params.value.replace("_", " ")}
          color={getStatusColor(params.value)}
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
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const filteredAppraisals = appraisals.filter(
    (appraisal) =>
      appraisal.employee_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appraisal.employee_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appraisal.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = [...new Set(appraisals.map((a) => a.department))];
  const periods = [...new Set(appraisals.map((a) => a.appraisal_period))];

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
              Performance Appraisals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage employee performance evaluations and reviews
            </Typography>
          </Box>
          {hasPermission(PERMISSIONS.CREATE_PERFORMANCE_APPRAISALS) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateAppraisal}
            >
              Create Appraisal
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
                      {appraisals.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Appraisals
                    </Typography>
                  </Box>
                  <AppraisalIcon color="primary" />
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
                        appraisals.filter((a) => a.status === "in_progress")
                          .length
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                  <TimelineIcon color="info" />
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
                        appraisals.filter((a) => a.status === "completed")
                          .length
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                  <CompleteIcon color="success" />
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
                        appraisals.filter(
                          (a) =>
                            new Date(a.due_date) < new Date() &&
                            a.status !== "completed"
                        ).length
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue
                    </Typography>
                  </Box>
                  <CancelIcon color="error" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                    placeholder="Search appraisals..."
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
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Department"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Period"
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                  >
                    <MenuItem value="">All Periods</MenuItem>
                    {periods.map((period) => (
                      <MenuItem key={period} value={period}>
                        {period}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            {/* Data Grid */}
            {loading ? (
              <LoadingSpinner />
            ) : (
              <DataGrid
                rows={filteredAppraisals}
                columns={columns}
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
          <MenuItem
            onClick={() => {
              handleViewAppraisal(selectedAppraisal?.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>

          {selectedAppraisal?.status === "pending" && (
            <MenuItem
              onClick={() => {
                handleStartSelfAssessment(selectedAppraisal?.id);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <AssignmentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Start Self Assessment</ListItemText>
            </MenuItem>
          )}

          {hasPermission(PERMISSIONS.UPDATE_PERFORMANCE_APPRAISALS) &&
            selectedAppraisal?.self_assessment_complete &&
            !selectedAppraisal?.supervisor_review_complete && (
              <MenuItem
                onClick={() => {
                  handleSupervisorReview(selectedAppraisal?.id);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <FeedbackIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Supervisor Review</ListItemText>
              </MenuItem>
            )}

          {hasPermission(PERMISSIONS.UPDATE_PERFORMANCE_APPRAISALS) &&
            selectedAppraisal?.status !== "completed" && (
              <MenuItem
                onClick={() => {
                  handleEditAppraisal(selectedAppraisal?.id);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Appraisal</ListItemText>
              </MenuItem>
            )}

          {hasPermission(PERMISSIONS.APPROVE_PERFORMANCE_APPRAISALS) &&
            selectedAppraisal?.supervisor_review_complete &&
            selectedAppraisal?.status !== "completed" && (
              <MenuItem
                onClick={() => {
                  handleCompleteAppraisal(selectedAppraisal?.id);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <CompleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Complete Appraisal</ListItemText>
              </MenuItem>
            )}

          {hasPermission(PERMISSIONS.DELETE_PERFORMANCE_APPRAISALS) && (
            <MenuItem
              onClick={() => {
                // Delete appraisal
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* View Appraisal Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Performance Appraisal - {selectedAppraisal?.employee_name}
          </DialogTitle>
          <DialogContent>
            {selectedAppraisal && (
              <Box sx={{ mt: 2 }}>
                {/* Appraisal Progress */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Appraisal Progress
                    </Typography>
                    <Stepper
                      activeStep={
                        selectedAppraisal.hr_review_complete
                          ? 3
                          : selectedAppraisal.supervisor_review_complete
                            ? 2
                            : selectedAppraisal.self_assessment_complete
                              ? 1
                              : 0
                      }
                      alternativeLabel
                    >
                      <Step>
                        <StepLabel>Self Assessment</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>Supervisor Review</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>HR Review</StepLabel>
                      </Step>
                    </Stepper>
                  </CardContent>
                </Card>

                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Employee Information
                        </Typography>
                        <Typography>
                          <strong>Name:</strong>{" "}
                          {selectedAppraisal.employee_name}
                        </Typography>
                        <Typography>
                          <strong>Position:</strong>{" "}
                          {selectedAppraisal.position}
                        </Typography>
                        <Typography>
                          <strong>Department:</strong>{" "}
                          {selectedAppraisal.department}
                        </Typography>
                        <Typography>
                          <strong>Supervisor:</strong>{" "}
                          {selectedAppraisal.supervisor_name}
                        </Typography>
                        <Typography>
                          <strong>Period:</strong>{" "}
                          {selectedAppraisal.appraisal_period}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Overall Rating */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Overall Performance
                        </Typography>
                        {selectedAppraisal.overall_rating ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 2,
                            }}
                          >
                            <Rating
                              value={selectedAppraisal.overall_rating}
                              readOnly
                              precision={0.1}
                            />
                            <Typography variant="h6">
                              {selectedAppraisal.overall_rating}/5.0
                            </Typography>
                          </Box>
                        ) : (
                          <Typography color="text.secondary">
                            Not yet rated
                          </Typography>
                        )}
                        <LinearProgress
                          variant="determinate"
                          value={getProgressPercentage(selectedAppraisal)}
                          color="primary"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {getProgressPercentage(selectedAppraisal)}% Complete
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Competencies */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Competency Ratings
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Competency</TableCell>
                                <TableCell align="center">Weight (%)</TableCell>
                                <TableCell align="center">
                                  Self Rating
                                </TableCell>
                                <TableCell align="center">
                                  Supervisor Rating
                                </TableCell>
                                <TableCell align="center">Average</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedAppraisal.competencies.map(
                                (comp, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{comp.name}</TableCell>
                                    <TableCell align="center">
                                      {comp.weight}%
                                    </TableCell>
                                    <TableCell align="center">
                                      {comp.self_rating ? (
                                        <Rating
                                          value={comp.self_rating}
                                          size="small"
                                          readOnly
                                        />
                                      ) : (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Not rated
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      {comp.supervisor_rating ? (
                                        <Rating
                                          value={comp.supervisor_rating}
                                          size="small"
                                          readOnly
                                        />
                                      ) : (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Not rated
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      {comp.self_rating &&
                                      comp.supervisor_rating ? (
                                        <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                        >
                                          {(
                                            (comp.self_rating +
                                              comp.supervisor_rating) /
                                            2
                                          ).toFixed(1)}
                                        </Typography>
                                      ) : (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          N/A
                                        </Typography>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Objectives */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Objectives Achievement
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Objective</TableCell>
                                <TableCell align="center">
                                  Achievement %
                                </TableCell>
                                <TableCell align="center">Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedAppraisal.objectives.map(
                                (obj, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{obj.description}</TableCell>
                                    <TableCell align="center">
                                      {obj.achievement !== null
                                        ? `${obj.achievement}%`
                                        : "Not assessed"}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={obj.status.replace("_", " ")}
                                        color={
                                          obj.status === "completed"
                                            ? "success"
                                            : obj.status === "in_progress"
                                              ? "warning"
                                              : "default"
                                        }
                                        size="small"
                                        sx={{ textTransform: "capitalize" }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
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

export default PerformanceAppraisalsPage;
