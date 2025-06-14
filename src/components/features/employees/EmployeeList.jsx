import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Avatar,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Alert,
  Skeleton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
} from "@mui/material";
import { useAuth } from "../auth/AuthGuard";
import { useNotification, useConfirmDialog } from "../../../hooks/common";
import { employeesAPI, departmentsAPI } from "../../../services/api";
import { ROUTES, ROLES } from "../../../constants";
import { LoadingSpinner, ErrorMessage } from "../../common/Error";

const EmployeeList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { openDialog } = useConfirmDialog();

  // Local state for filters and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch employees with React Query
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
        page: page + 1, // API uses 1-based pagination
        limit: pageSize,
        search: searchTerm || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch departments for filter dropdown
  const { data: departmentsResponse, isLoading: departmentsLoading } = useQuery(
    {
      queryKey: ["departments"],
      queryFn: () => departmentsAPI.getAll(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Delete employee mutation
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

  // Extract data from API responses
  const employees =
    employeesResponse?.data?.employees || employeesResponse?.data || [];
  const totalEmployees =
    employeesResponse?.data?.total || employeesResponse?.total || 0;
  const departments =
    departmentsResponse?.data?.departments || departmentsResponse?.data || [];

  // Available status options (you can also fetch these from API)
  const availableStatuses = ["Active", "Inactive", "On Leave", "Suspended"];

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
      message: `Are you sure you want to delete ${selectedEmployee.first_name} ${selectedEmployee.sur_name}? This action cannot be undone.`,
      variant: "error",
      confirmText: "Delete",
      onConfirm: () => {
        deleteEmployeeMutation.mutate(selectedEmployee.id);
      },
    });

    handleMenuClose();
  };

  const handleExportEmployees = async () => {
    try {
      // You can implement export functionality here
      // For example, fetch all employees and convert to CSV
      const allEmployees = await employeesAPI.getAll({
        limit: 1000, // Get all employees
        search: searchTerm || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
      });

      // Convert to CSV and download
      const csvContent = convertToCSV(
        allEmployees.data.employees || allEmployees.data
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
          `"${emp.first_name} ${emp.sur_name}"`,
          emp.email,
          emp.department,
          emp.position,
          emp.status,
          emp.hire_date,
          emp.phone,
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
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "error";
      case "On Leave":
        return "warning";
      case "Suspended":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      field: "employee",
      headerName: "Employee",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
            {getInitials(params.row.first_name, params.row.sur_name)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
              {`${params.row.first_name || ""} ${params.row.sur_name || ""}`.trim()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 130,
      valueGetter: (params) => params.row.department || "Not Assigned",
    },
    {
      field: "position",
      headerName: "Position",
      width: 180,
      valueGetter: (params) => params.row.position || "Not Assigned",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || "Unknown"}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "hire_date",
      headerName: "Hire Date",
      width: 120,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : "N/A",
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      valueGetter: (params) => params.row.phone || "Not Provided",
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

  // Loading state
  if (employeesLoading && employees.length === 0) {
    return <LoadingSpinner message="Loading employees..." />;
  }

  // Error state
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
            Employees
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your organization's employees ({totalEmployees} total)
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <IconButton onClick={refetchEmployees} disabled={employeesLoading}>
            <RefreshIcon />
          </IconButton>

          {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(ROUTES.EMPLOYEE_CREATE)}
            >
              Add Employee
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
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
              sx={{ minWidth: 250 }}
              size="small"
            />

            <TextField
              select
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
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
            </TextField>

            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 120 }}
              size="small"
            >
              <MenuItem value="">All Status</MenuItem>
              {availableStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExportEmployees}
              disabled={employees.length === 0}
            >
              Export
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={employees}
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
            sx={{
              border: "none",
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
    </Box>
  );
};

export default EmployeeList;
