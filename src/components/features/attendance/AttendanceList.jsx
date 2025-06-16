import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Grid,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSnackbar } from "notistack";
import {
  getMyAttendance,
  getEmployeeAttendance,
  updateAttendance,
  selectMyAttendanceRecords,
  selectEmployeeAttendanceRecords,
  selectAttendanceLoading,
  selectAttendanceError,
  selectAttendancePagination,
  clearError,
} from "../../../store/slices/attendanceSlice";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../auth/AuthGuard";
import { ROUTES, ATTENDANCE_STATUS, ROLES } from "../../../constants";
import attendanceAPI from "../../../services/api/attendance.api";

const AttendanceList = ({ viewMode = "personal" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector(selectUser);
  const { hasAnyRole } = useAuth();

  const myAttendanceRecords = useSelector(selectMyAttendanceRecords);
  const employeeAttendanceRecords = useSelector(
    selectEmployeeAttendanceRecords
  );
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);
  const pagination = useSelector(selectAttendancePagination);

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const isManager = hasAnyRole([
    ROLES.ADMIN,
    ROLES.HR_MANAGER,
    ROLES.DEPARTMENT_HEAD,
  ]);

  useEffect(() => {
    loadAttendanceData();
  }, [dispatch, activeTab, monthFilter, yearFilter, selectedEmployee]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      dispatch(clearError());
    }
  }, [error, enqueueSnackbar, dispatch]);

  const loadAttendanceData = () => {
    const params = {
      month: monthFilter,
      year: yearFilter,
      status: statusFilter || undefined,
      page: 1,
      limit: 25,
    };

    if (activeTab === 0 || !isManager) {
      // Personal attendance
      dispatch(getMyAttendance(params));
    } else if (activeTab === 1 && selectedEmployee) {
      // Specific employee attendance
      dispatch(getEmployeeAttendance({ employeeId: selectedEmployee, params }));
    }
  };

  const handleRefresh = () => {
    loadAttendanceData();
    enqueueSnackbar("Attendance data refreshed", { variant: "success" });
  };

  const handleMenuOpen = (event, record) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecord(record);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecord(null);
  };

  const handleViewRecord = () => {
    if (selectedRecord) {
      // Navigate to detailed view or open modal
      console.log("View record:", selectedRecord);
    }
    handleMenuClose();
  };

  const handleEditRecord = () => {
    if (selectedRecord) {
      // Open edit modal or navigate to edit page
      console.log("Edit record:", selectedRecord);
    }
    handleMenuClose();
  };

  const handleExportData = async () => {
    try {
      const params = {
        month: monthFilter,
        year: yearFilter,
        status: statusFilter || undefined,
        employee_id: activeTab === 1 ? selectedEmployee : undefined,
      };

      const blob = await attendanceAPI.exportAttendanceReport(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_report_${yearFilter}_${monthFilter}.xlsx`;
      link.click();

      window.URL.revokeObjectURL(url);
      enqueueSnackbar("Report exported successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to export report", { variant: "error" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return "success";
      case ATTENDANCE_STATUS.ABSENT:
        return "error";
      case ATTENDANCE_STATUS.ON_LEAVE:
        return "info";
      case ATTENDANCE_STATUS.HALF_DAY:
        return "warning";
      default:
        return "default";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    return timeString.slice(0, 5);
  };

  const calculateWorkingHours = (arrivalTime, departureTime) => {
    if (!arrivalTime || !departureTime) return "--";

    const arrival = new Date(`2000-01-01T${arrivalTime}`);
    const departure = new Date(`2000-01-01T${departureTime}`);
    const diffMs = departure - arrival;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const columns = [
    {
      field: "date",
      headerName: "Date",
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "arrival_time",
      headerName: "Clock In",
      width: 100,
      renderCell: (params) => formatTime(params.value),
    },
    {
      field: "departure_time",
      headerName: "Clock Out",
      width: 100,
      renderCell: (params) => formatTime(params.value),
    },
    {
      field: "working_hours",
      headerName: "Hours",
      width: 100,
      renderCell: (params) =>
        calculateWorkingHours(
          params.row.arrival_time,
          params.row.departure_time
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "activity",
      headerName: "Activity",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(event) => handleMenuOpen(event, params.row)}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Add employee name column for manager view
  if (activeTab === 1 && isManager) {
    columns.unshift({
      field: "employee_name",
      headerName: "Employee",
      width: 150,
      renderCell: (params) =>
        params.row.user?.first_name + " " + params.row.user?.sur_name,
    });
  }

  const attendanceData =
    activeTab === 0 ? myAttendanceRecords : employeeAttendanceRecords;

  const filteredData = attendanceData.filter((record) => {
    const matchesSearch =
      searchTerm === "" ||
      record.activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const statusOptions = [
    { value: ATTENDANCE_STATUS.PRESENT, label: "Present" },
    { value: ATTENDANCE_STATUS.ABSENT, label: "Absent" },
    { value: ATTENDANCE_STATUS.ON_LEAVE, label: "On Leave" },
    { value: ATTENDANCE_STATUS.HALF_DAY, label: "Half Day" },
  ];

  const tabLabels = isManager
    ? ["My Attendance", "Employee Records"]
    : ["My Attendance"];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Attendance Records
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isManager
              ? "View and manage attendance records"
              : "View your attendance history"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TimelineIcon />}
            onClick={() => navigate(ROUTES.ATTENDANCE)}
          >
            Clock In/Out
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={handleExportData}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      {isManager && (
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search records..."
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
                select
                label="Month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                {monthOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={yearFilter}
                onChange={(e) => setYearFilter(parseInt(e.target.value))}
                inputProps={{ min: 2020, max: new Date().getFullYear() + 1 }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {activeTab === 1 && isManager && (
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Employee"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <MenuItem value="">Select Employee</MenuItem>
                  {/* This would be populated from employee API */}
                  <MenuItem value="1">John Doe</MenuItem>
                  <MenuItem value="2">Jane Smith</MenuItem>
                  <MenuItem value="3">Bob Wilson</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            loading={loading}
            pageSize={25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            disableSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />
        </Box>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewRecord}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {isManager && (
          <MenuItem onClick={handleEditRecord}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Record</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* No Data Message */}
      {!loading && filteredData.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No attendance records found for the selected filters.
        </Alert>
      )}
    </Box>
  );
};

export default AttendanceList;
