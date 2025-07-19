import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Avatar,
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
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as EnabledIcon,
  Cancel as InactiveIcon,
  Warning as WarningIcon,
  Business as DepartmentIcon,
  Badge as BadgeIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useAuth } from "../auth/AuthGuard";
import { useNotification, useConfirmDialog } from "../../../hooks/common";
import { employeesAPI, departmentsAPI } from "../../../services/api";
import { ROUTES, ROLES } from "../../../constants";
import { ErrorMessage } from "../../common/Error";
import { LoadingSpinner } from "../../common/Loading";

const EmployeeList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { openDialog } = useConfirmDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: employeesResponse,
    isLoading: employeesLoading,
    error: employeesError,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: [
      "employees",
      page,
      pageSize,
      searchTerm,
      departmentFilter,
      statusFilter,
    ],
    queryFn: () =>
      employeesAPI.getAll({
        page: page + 1,
        limit: pageSize,
        search: searchTerm || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const { data: departmentsResponse, isLoading: departmentsLoading } = useQuery(
    {
      queryKey: ["departments"],
      queryFn: () => departmentsAPI.getAll(),
      staleTime: 10 * 60 * 1000,
    }
  );

  const deleteEmployeeMutation = useMutation({
    mutationFn: (employeeId) => employeesAPI.delete(employeeId),
    onSuccess: () => {
      showSuccess("Employee deleted successfully");
      queryClient.invalidateQueries(["employees"]);
      handleMenuClose();
    },
    onError: (error) => {
      showError(error.userMessage || "Failed to delete employee");
    },
  });

  const employees = Array.isArray(employeesResponse?.data?.data)
    ? employeesResponse.data.data.map((emp) => ({
        ...emp,
        id: emp.id,
        full_name: `${emp.first_name || ""} ${emp.sur_name || ""}`.trim(),
      }))
    : [];
  
  const totalEmployees =
    employeesResponse?.data?.total || employees.length || 0;
  const departments = Array.isArray(departmentsResponse?.data)
    ? departmentsResponse.data
    : [];

  const employeeStatuses = [
    {
      value: "active",
      label: "active",
      color: "success",
    },
    {
      value: "inactive",
      label: "inactive",
      color: "default",
    },
    {
      value: "onLeave",
      label: "onLeave",
      color: "warning",
    },
    {
      value: "suspended",
      label: "suspended",
      color: "error",
    },
  ];

  const summaryCards = [
    {
      title: "Total Employees",
      value: totalEmployees.toString(),
      subtitle: "All employees",
      icon: <PersonIcon />,
      color: "primary",
    },
    {
      title: "Active Employees",
      value: employees
        .filter((emp) => emp.status === "Active")
        .length.toString(),
      subtitle: "Currently active",
      icon: <EnabledIcon />,
      color: "success",
    },
    {
      title: "On Leave",
      value: employees
        .filter((emp) => emp.status === "On Leave")
        .length.toString(),
      subtitle: "Currently on leave",
      icon: <WarningIcon />,
      color: "warning",
    },
    {
      title: "Departments",
      value: departments.length.toString(),
      subtitle: "Active departments",
      icon: <DepartmentIcon />,
      color: "info",
    },
  ];

  const handleMenuOpen = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleViewEmployee = () => {
    if (selectedEmployee) {
      navigate(`${ROUTES.EMPLOYEES}/${selectedEmployee.id}`);
    }
    handleMenuClose();
  };

  const handleEditEmployee = () => {
    if (selectedEmployee) {
      navigate(`${ROUTES.EMPLOYEES}/${selectedEmployee.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;

    openDialog({
      title: "Delete Employee",
      message: `Are you sure you want to delete ${selectedEmployee.full_name}? This action cannot be undone.`,
      variant: "error",
      confirmText: "Delete",
      onConfirm: () => {
        deleteEmployeeMutation.mutate(selectedEmployee.id);
      },
    });

    handleMenuClose();
  };

  const handleStatusChange = async (employee, newStatus) => {
    try {
      showSuccess(`Employee status updated to ${newStatus}`);
      refetchEmployees();
    } catch (error) {
      showError("Failed to update employee status");
    }
    handleMenuClose();
  };

  const handleExportEmployees = async () => {
    try {
      const allEmployees = await employeesAPI.getAll({
        limit: 1000,
        search: searchTerm || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
      });

      const csvContent = convertToCSV(
        allEmployees.data?.data || allEmployees.data || []
      );
      downloadCSV(csvContent, "employees.csv");

      showSuccess("Employees exported successfully");
    } catch (error) {
      showError("Failed to export employees");
    }
  };

  const convertToCSV = (data) => {
    const headers = [
      "Name",
      "Email",
      "Department",
      "Position",
      "Status",
      "Hire Date",
      "Phone",
    ];
    const csvRows = [
      headers.join(","),
      ...data.map((emp) =>
        [
          `"${emp.first_name || ""} ${emp.sur_name || ""}"`,
          emp.email || "",
          emp.department || "",
          emp.position || "",
          emp.status || "",
          emp.date_joined || "",
          emp.phone_number || "",
        ].join(",")
      ),
    ];
    return csvRows.join("\n");
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getInitials = (firstName, surname) => {
    return `${firstName?.charAt(0) || ""}${surname?.charAt(0) || ""}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    const statusConfig = employeeStatuses.find((s) => s.value === status);
    return statusConfig?.color || "default";
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.sur_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || employee.status === statusFilter;
    const matchesDepartment =
      !departmentFilter || employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const columns = [
    {
      field: "employee_info",
      headerName: "Employee",
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "#C2895A", fontSize: "1rem" }}>
            {getInitials(params.row.first_name, params.row.sur_name)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email} <br /> {params.row.phone_number || "No Phone"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "id",
      headerName: "Employee ID",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={`EMP-${params.value.toString().padStart(3, "0")}`}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value || "Not Assigned"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.designation || "No Position"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "roleNames",
      headerName: "Roles",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {params.value?.slice(0, 2).map((role, index) => (
            <Chip
              key={index}
              label={role}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: "0.75rem" }}
            />
          ))}
          {params.value?.length > 2 && (
            <Tooltip
              title={`Additional roles: ${params.value.slice(2).join(", ")}`}
            >
              <Chip
                label={`+${params.value.length - 2}`}
                size="small"
                variant="outlined"
                color="secondary"
              />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: "date_joined",
      headerName: "Hire Date",
      width: 120,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value
              ? format(new Date(params.value), "dd/MM/yyyy")
              : "N/A"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value
              ? `${Math.floor(
                  (new Date() - new Date(params.value)) /
                    (365 * 24 * 60 * 60 * 1000)
                )} years`
              : ""}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const status = employeeStatuses.find((s) => s.value === params.value);
        return (
          <Chip
            label={status?.label || params.value || "Unknown"}
            size="small"
            color={status?.color || "default"}
            variant="filled"
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
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  if (employeesLoading && employees.length === 0) {
    return <LoadingSpinner message="Loading employees..." />;
  }

  if (employeesError) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorMessage
          error={employeesError}
          title="Failed to load employees"
          showRefresh
          onRefresh={refetchEmployees}
        />
      </Box>
    );
  }

  return (
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
          <Typography variant="h4">Employee Management</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={refetchEmployees} disabled={employeesLoading}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportEmployees}
              disabled={employees.length === 0}
            >
              Export
            </Button>
            {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate(ROUTES.EMPLOYEE_CREATE)}
              >
                Add Employee
              </Button>
            )}
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your organization's employees ({totalEmployees} total)
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
                  <Box>
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
          {/* Filters and Actions */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search employees..."
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
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    label="Department"
                    disabled={departmentsLoading}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem
                        key={dept.id}
                        value={dept.name || dept.department_name}
                      >
                        {dept.name || dept.department_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    {employeeStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm("");
                      setDepartmentFilter("");
                      setStatusFilter("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Employees Table */}
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={filteredEmployees}
              columns={columns}
              loading={employeesLoading}
              rowCount={totalEmployees}
              page={page}
              pageSize={pageSize}
              paginationMode="server"
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[5, 10, 25, 50]}
              disableSelectionOnClick
              checkboxSelection={hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER])}
              getRowHeight={() => "auto"}
              sx={{
                border: "none",
                "& .MuiDataGrid-cell": {
                  py: 1,
                },
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
              }}
              components={{
                NoRowsOverlay: () => (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No employees found
                    </Typography>
                  </Box>
                ),
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleViewEmployee}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
          <MenuItem onClick={handleEditEmployee}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Employee</ListItemText>
          </MenuItem>
        )}

        <Divider />

        {selectedEmployee?.status === "Active" ? (
          <MenuItem
            onClick={() => handleStatusChange(selectedEmployee, "Inactive")}
          >
            <ListItemIcon>
              <BlockIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Deactivate Employee</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => handleStatusChange(selectedEmployee, "Active")}
          >
            <ListItemIcon>
              <EnabledIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Activate Employee</ListItemText>
          </MenuItem>
        )}

        {hasRole(ROLES.ADMIN) && (
          <MenuItem
            onClick={handleDeleteEmployee}
            sx={{ color: "error.main" }}
            disabled={deleteEmployeeMutation.isLoading}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Employee</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* View Employee Details Dialog */}
      {/* View Employee Details Dialog - FIXED VERSION */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedEmployee(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Employee Details -{" "}
          {selectedEmployee
            ? `${selectedEmployee.first_name || ""} ${selectedEmployee.sur_name || ""}`.trim()
            : "Loading..."}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {" "}
          {/* Add padding top */}
          {selectedEmployee ? (
            <Box>
              {/* Debug info - Remove this after fixing */}
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="caption">
                  Employee ID: {selectedEmployee.id} | Email:{" "}
                  {selectedEmployee.email}
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center" }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: "auto",
                          mb: 2,
                          bgcolor: "primary.main",
                        }}
                      >
                        {getInitials(
                          selectedEmployee.first_name,
                          selectedEmployee.sur_name
                        )}
                      </Avatar>
                      <Typography variant="h6">
                        {`${selectedEmployee.first_name || ""} ${selectedEmployee.sur_name || ""}`.trim()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Employee ID: EMP-
                        {selectedEmployee.id.toString().padStart(3, "0")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedEmployee.department || "No Department"}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={selectedEmployee.status || "Unknown"}
                          color={getStatusColor(selectedEmployee.status)}
                          variant="filled"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  {/* Personal Information */}
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main" }}
                  >
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          First Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedEmployee.first_name || "Not provided"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Last Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedEmployee.sur_name || "Not provided"}
                        </Typography>
                      </Box>
                    </Grid>
                    {selectedEmployee.middle_name && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 600 }}
                          >
                            Middle Name
                          </Typography>
                          <Typography variant="body1">
                            {selectedEmployee.middle_name}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Gender
                        </Typography>
                        <Typography variant="body1">
                          {selectedEmployee.gender || "Not specified"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Contact Information */}
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main" }}
                  >
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Email Address
                        </Typography>
                        <Typography variant="body1">
                          {selectedEmployee.email || "Not provided"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Phone Number
                        </Typography>
                        <Typography variant="body1">
                          {selectedEmployee.phone_number || "Not provided"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Employment Information */}
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main" }}
                  >
                    Employment Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Department
                        </Typography>
                        <Typography variant="body1">
                          {selectedEmployee.department || "Not assigned"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Department ID
                        </Typography>
                        <Typography variant="body1">
                          {selectedEmployee.department_id || "Not assigned"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Roles & Permissions */}
                  {selectedEmployee.roleNames &&
                    selectedEmployee.roleNames.length > 0 && (
                      <>
                        <Typography
                          variant="h6"
                          sx={{ mb: 2, color: "primary.main" }}
                        >
                          Roles & Permissions
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontWeight: 600 }}
                              >
                                Assigned Roles
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                  mt: 1,
                                }}
                              >
                                {selectedEmployee.roleNames.map(
                                  (role, index) => (
                                    <Chip
                                      key={index}
                                      label={role}
                                      color="primary"
                                      variant="outlined"
                                      size="small"
                                    />
                                  )
                                )}
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontWeight: 600 }}
                              >
                                Primary Role
                              </Typography>
                              <Typography variant="body1">
                                {selectedEmployee.roleNames[0] ||
                                  "Not assigned"}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontWeight: 600 }}
                              >
                                Total Roles
                              </Typography>
                              <Typography variant="body1">
                                {selectedEmployee.roleNames.length} role(s)
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                      </>
                    )}

                  {/* Account Information */}
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main" }}
                  >
                    Account Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Created Date
                        </Typography>
                        <Typography variant="body1">
                          {selectedEmployee.created_at
                            ? format(
                                new Date(selectedEmployee.created_at),
                                "dd/MM/yyyy"
                              )
                            : "Not available"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Last Login
                        </Typography>
                        <Typography variant="body1">
                          {selectedEmployee.last_login
                            ? format(
                                new Date(selectedEmployee.last_login),
                                "dd/MM/yyyy HH:mm"
                              )
                            : "Never logged in"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Loading employee details...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && selectedEmployee && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                handleEditEmployee();
              }}
            >
              Edit Employee
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
