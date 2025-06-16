import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as BackIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  AccountBalance as BudgetIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthGuard";
import { ROUTES, ROLES } from "../../../constants";
import {
  fetchDepartmentById,
  fetchDepartmentEmployees,
  deleteDepartment,
  clearCurrentDepartment,
  clearDepartmentEmployees,
  selectCurrentDepartment,
  selectDepartmentEmployees,
  selectDepartmentsLoading,
  selectDepartmentsError,
} from "../../../store/slices/departmentSlice";
import DepartmentForm from "./DepartmentForm";

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasAnyRole, hasRole } = useAuth();

  // Parse and validate department ID
  const departmentId = parseInt(id, 10);
  const isValidId = !isNaN(departmentId) && departmentId > 0;

  // Redux selectors
  const department = useSelector(selectCurrentDepartment);
  const employees = useSelector(selectDepartmentEmployees(departmentId));
  const loading = useSelector(selectDepartmentsLoading);
  const error = useSelector(selectDepartmentsError);

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Load department data
  useEffect(() => {
    if (isValidId) {
      dispatch(fetchDepartmentById(departmentId));
      dispatch(
        fetchDepartmentEmployees({ id: departmentId, params: { limit: 50 } })
      );
    }

    return () => {
      dispatch(clearCurrentDepartment());
      if (isValidId) {
        dispatch(clearDepartmentEmployees(departmentId));
      }
    };
  }, [dispatch, departmentId, isValidId]);

  // Event handlers
  const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handleEdit = () => {
    setShowEditForm(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete the "${department.department_name}" department?`
      )
    ) {
      try {
        await dispatch(deleteDepartment(departmentId)).unwrap();
        navigate(ROUTES.DEPARTMENTS);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
    handleMenuClose();
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  // Utility functions
  const formatCurrency = (amount) => {
    if (!amount) return "Not set";
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (text) => {
    if (!text) return "?";
    return text
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Employee DataGrid columns
  const employeeColumns = [
    {
      field: "name",
      headerName: "Employee",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: "0.875rem",
            }}
          >
            {getInitials(`${row.first_name} ${row.sur_name}`)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {`${row.first_name || ""} ${row.sur_name || ""}`.trim() ||
                "Unknown"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email || "No email"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "designation",
      headerName: "Position",
      width: 160,
      renderCell: ({ row }) => row.designation || "Not assigned",
    },
    {
      field: "phone_number",
      headerName: "Phone",
      width: 140,
      renderCell: ({ row }) => row.phone_number || "Not provided",
    },
    {
      field: "date_joined",
      headerName: "Join Date",
      width: 120,
      renderCell: ({ row }) =>
        row.date_joined
          ? new Date(row.date_joined).toLocaleDateString()
          : "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: ({ row }) => (
        <Chip
          label={row.status || "Active"}
          color={row.status === "active" || !row.status ? "success" : "default"}
          size="small"
        />
      ),
    },
  ];

  // Handle invalid ID
  if (!isValidId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Invalid department ID: "{id}". Please check the URL and try again.
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(ROUTES.DEPARTMENTS)}
          variant="outlined"
        >
          Back to Departments
        </Button>
      </Box>
    );
  }

  // Loading state
  if (loading && !department) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Skeleton variant="rectangular" width={100} height={36} />
          <Skeleton variant="circular" width={80} height={80} />
          <Box>
            <Skeleton variant="text" width={300} height={32} />
            <Skeleton variant="text" width={200} height={24} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  // Error state
  if (error && !department) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(ROUTES.DEPARTMENTS)}
          variant="outlined"
        >
          Back to Departments
        </Button>
      </Box>
    );
  }

  // Not found state
  if (!loading && !department) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <BusinessIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Department not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The department you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(ROUTES.DEPARTMENTS)}
          variant="contained"
        >
          Back to Departments
        </Button>
      </Box>
    );
  }

  // Edit form mode
  if (showEditForm) {
    return (
      <DepartmentForm
        department={department}
        editMode={true}
        onClose={() => setShowEditForm(false)}
        onSuccess={() => {
          setShowEditForm(false);
          dispatch(fetchDepartmentById(departmentId));
        }}
      />
    );
  }

  // Tab panels content
  const tabPanels = [
    {
      label: "Overview",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LocationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={department.location || "Not specified"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <BudgetIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Annual Budget"
                      secondary={formatCurrency(department.budget)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <GroupIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Employees"
                      secondary={`${employees?.length || 0} employees`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Head
                </Typography>
                {department.head ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {getInitials(
                        `${department.head.first_name} ${department.head.sur_name}`
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {`${department.head.first_name} ${department.head.sur_name}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {department.head.email}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No department head assigned
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {department.description && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {department.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      ),
    },
    {
      label: `Employees (${employees?.length || 0})`,
      content: (
        <Card variant="outlined">
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={employees || []}
              columns={employeeColumns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              disableSelectionOnClick
              loading={loading}
              density="comfortable"
              sx={{
                border: "none",
                "& .MuiDataGrid-cell:focus": { outline: "none" },
                "& .MuiDataGrid-row:hover": { bgcolor: "action.hover" },
              }}
              components={{
                NoRowsOverlay: () => (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <GroupIcon
                      sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      No employees assigned to this department
                    </Typography>
                  </Box>
                ),
              }}
            />
          </Box>
        </Card>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(ROUTES.DEPARTMENTS)}
            variant="outlined"
            size="small"
          >
            Back
          </Button>

          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: "1.75rem",
              fontWeight: "bold",
            }}
          >
            {getInitials(department.department_name)}
          </Avatar>

          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {department.department_name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Chip
                label={department.is_active !== false ? "Active" : "Inactive"}
                color={department.is_active !== false ? "success" : "error"}
                size="small"
              />
              {department.created_at && (
                <Typography variant="body2" color="text.secondary">
                  Created {new Date(department.created_at).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size="small"
            >
              Edit
            </Button>

            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabPanels.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>{tabPanels[activeTab]?.content}</Box>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Department
        </MenuItem>

        {hasRole(ROLES.ADMIN) && (
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete Department
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default DepartmentDetails;
