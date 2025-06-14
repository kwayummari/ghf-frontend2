import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  AccountBalance as BankIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES } from "../../constants";
import { employeesAPI } from "../../services/api/employees.api";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
import { ErrorMessage } from "../../components/common/Error";
import { ConfirmDialog } from "../../components/common/Modals";
import EmployeeForm from "../../components/features/employees/EmployeeForm";

const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAnyRole, hasRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const isEditMode = location.pathname.includes("/edit");

  // Fetch employee data on component mount
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        setError("Employee ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await employeesAPI.getById(id);

        console.log('this is response', response.status);

        if (response.status = 200 && response.data) {
          setEmployee(response.data);
        } else {
          setError("Employee not found");
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError(err.userMessage || "Failed to fetch employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  // Handle menu actions
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`${ROUTES.EMPLOYEES}/${id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    handleMenuClose();

    openDialog({
      title: "Delete Employee",
      message: `Are you sure you want to delete ${employee?.first_name} ${employee?.sur_name}? This action cannot be undone.`,
      variant: "error",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        setDeleteLoading(true);

        try {
          await employeesAPI.delete(id);
          showSuccess("Employee deleted successfully");
          navigate(ROUTES.EMPLOYEES);
        } catch (err) {
          console.error("Error deleting employee:", err);
          showError(err.userMessage || "Failed to delete employee");
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  // Utility functions
  const getInitials = (firstName, surname) => {
    return `${firstName?.charAt(0) || ""}${surname?.charAt(0) || ""}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "on leave":
        return "warning";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Not provided";
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString("en-GB");
    } catch {
      return "Invalid date";
    }
  };

  const getFullName = () => {
    if (!employee) return "";
    const { first_name, middle_name, sur_name } = employee;
    return `${first_name || ""} ${middle_name || ""} ${sur_name || ""}`.trim();
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Box>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={150} height={30} />
                <Skeleton variant="text" width={100} height={20} />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorMessage
          error={error}
          title="Failed to load employee"
          showRefresh
          onRefresh={() => window.location.reload()}
        />
        <Button
          onClick={() => navigate(ROUTES.EMPLOYEES)}
          sx={{ mt: 2 }}
          variant="outlined"
        >
          Back to Employees
        </Button>
      </Box>
    );
  }

  // Employee not found
  if (!employee) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Employee not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The employee you're looking for doesn't exist or has been removed.
        </Typography>
        <Button onClick={() => navigate(ROUTES.EMPLOYEES)} variant="contained">
          Back to Employees
        </Button>
      </Box>
    );
  }

  // Edit mode
  if (isEditMode) {
    return (
      <EmployeeForm
        editMode={true}
        initialData={employee}
        onSuccess={(updatedEmployee) => {
          setEmployee(updatedEmployee);
          showSuccess("Employee updated successfully");
          navigate(`${ROUTES.EMPLOYEES}/${id}`);
        }}
      />
    );
  }

  // Tab panels configuration
  const tabPanels = [
    {
      label: "Personal Info",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={employee.email || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Phone"
                  secondary={employee.phone || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Address"
                  secondary={employee.address || "Not provided"}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Date of Birth"
                  secondary={formatDate(employee.date_of_birth)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Gender"
                  secondary={
                    employee.gender === "M"
                      ? "Male"
                      : employee.gender === "F"
                        ? "Female"
                        : "Not specified"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Marital Status"
                  secondary={employee.marital_status || "Not provided"}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Employment",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <WorkIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Department"
                  secondary={
                    employee.department?.name ||
                    employee.department ||
                    "Not assigned"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Position"
                  secondary={employee.position || "Not assigned"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Supervisor"
                  secondary={
                    employee.supervisor?.name ||
                    employee.supervisor ||
                    "Not assigned"
                  }
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Hire Date"
                  secondary={formatDate(employee.hire_date)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Salary"
                  secondary={formatCurrency(employee.salary)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip
                      label={employee.status || "Active"}
                      color={getStatusColor(employee.status)}
                      size="small"
                    />
                  }
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Education & IDs",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Education
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Education Level"
                  secondary={employee.education_level || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Institution"
                  secondary={employee.institution || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Graduation Year"
                  secondary={employee.graduation_year || "Not provided"}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Government IDs
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="NIDA"
                  secondary={employee.nida || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="BIMA"
                  secondary={employee.bima || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="NSSF"
                  secondary={employee.nssf || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="HESLB"
                  secondary={employee.helsb || "Not provided"}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Contacts & Banking",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Emergency Contact
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Name"
                  secondary={employee.emergency_contact_name || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary={employee.emergency_contact_phone || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Relationship"
                  secondary={
                    employee.emergency_contact_relationship || "Not provided"
                  }
                />
              </ListItem>
            </List>

            {employee.next_of_kin_name && (
              <>
                <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                  Next of Kin
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Name"
                      secondary={employee.next_of_kin_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Phone"
                      secondary={employee.next_of_kin_phone || "Not provided"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Relationship"
                      secondary={
                        employee.next_of_kin_relationship || "Not provided"
                      }
                    />
                  </ListItem>
                </List>
              </>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Banking Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <BankIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Bank"
                  secondary={employee.bank_name || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Account Number"
                  secondary={employee.account_number || "Not provided"}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      ),
    },
  ];

  return (
    <Box>
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
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: "2rem",
            }}
          >
            {getInitials(employee.first_name, employee.sur_name)}
          </Avatar>

          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              {getFullName()}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {employee.position || "No position assigned"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                label={
                  employee.department?.name ||
                  employee.department ||
                  "No department"
                }
                color="primary"
                variant="outlined"
              />
              <Chip
                label={employee.status || "Active"}
                color={getStatusColor(employee.status)}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={deleteLoading}
            >
              Edit
            </Button>

            <IconButton onClick={handleMenuOpen} disabled={deleteLoading}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Employee Details */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {tabPanels.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>

          <Box sx={{ p: 3 }}>{tabPanels[activeTab]?.content}</Box>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Employee
        </MenuItem>

        {hasRole(ROLES.ADMIN) && (
          <MenuItem
            onClick={handleDelete}
            sx={{ color: "error.main" }}
            disabled={deleteLoading}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete Employee
          </MenuItem>
        )}
      </Menu>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        loading={deleteLoading}
        {...config}
      />
    </Box>
  );
};

export default EmployeeDetailsPage;
