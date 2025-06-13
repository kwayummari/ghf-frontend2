import React, { useState, useEffect } from "react";
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
  Avatar,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
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
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthGuard";
import { ROUTES, ROLES } from "../../../constants";

const EmployeeList = () => {
  const navigate = useNavigate();
  const { hasRole, hasAnyRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Sample data - replace with API call
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const sampleEmployees = [
        {
          id: 1,
          first_name: "John",
          sur_name: "Doe",
          email: "john.doe@ghf.org",
          department: "IT",
          position: "Software Developer",
          status: "Active",
          hire_date: "2023-01-15",
          phone: "+255 123 456 789",
        },
        {
          id: 2,
          first_name: "Jane",
          sur_name: "Smith",
          email: "jane.smith@ghf.org",
          department: "HR",
          position: "HR Manager",
          status: "Active",
          hire_date: "2022-08-20",
          phone: "+255 987 654 321",
        },
        {
          id: 3,
          first_name: "David",
          sur_name: "Wilson",
          email: "david.wilson@ghf.org",
          department: "Finance",
          position: "Accountant",
          status: "Active",
          hire_date: "2023-03-10",
          phone: "+255 555 123 456",
        },
        {
          id: 4,
          first_name: "Sarah",
          sur_name: "Johnson",
          email: "sarah.johnson@ghf.org",
          department: "Operations",
          position: "Project Manager",
          status: "On Leave",
          hire_date: "2022-11-05",
          phone: "+255 777 888 999",
        },
        {
          id: 5,
          first_name: "Michael",
          sur_name: "Brown",
          email: "michael.brown@ghf.org",
          department: "IT",
          position: "System Administrator",
          status: "Inactive",
          hire_date: "2021-06-12",
          phone: "+255 333 444 555",
        },
      ];

      setEmployees(sampleEmployees);
      setLoading(false);
    };

    fetchEmployees();
  }, []);

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
    if (selectedEmployee) {
      console.log("Delete employee:", selectedEmployee.id);
      // Implement delete functionality
    }
    handleMenuClose();
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
              {`${params.row.first_name} ${params.row.sur_name}`}
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
    },
    {
      field: "position",
      headerName: "Position",
      width: 180,
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
      field: "hire_date",
      headerName: "Hire Date",
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
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

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.sur_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      !departmentFilter || employee.department === departmentFilter;
    const matchesStatus = !statusFilter || employee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(employees.map((emp) => emp.department))];
  const statuses = [...new Set(employees.map((emp) => emp.status))];

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
            Manage your organization's employees
          </Typography>
        </Box>

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
            />

            <TextField
              select
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Status</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => console.log("Export employees")}
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
            rows={filteredEmployees}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            checkboxSelection={hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER])}
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
          <MenuItem onClick={handleDeleteEmployee} sx={{ color: "error.main" }}>
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
