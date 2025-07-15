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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES } from "../../constants";
import { employeesAPI } from "../../services/api/employees.api";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
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

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const isEditMode = location.pathname.includes("/edit");

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        setError("Employee ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await employeesAPI.getById(id);
        setEmployee(response.data.data || response.data);
      } catch (err) {
        setError(err.userMessage || "Failed to fetch employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleEdit = () => {
    navigate(`${ROUTES.EMPLOYEES}/${id}/edit`);
    setAnchorEl(null);
  };

  const handleDelete = () => {
    setAnchorEl(null);
    openDialog({
      title: "Delete Employee",
      message: `Are you sure you want to delete ${employee?.first_name} ${employee?.sur_name}?`,
      variant: "error",
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          await employeesAPI.delete(id);
          showSuccess("Employee deleted successfully");
          navigate(ROUTES.EMPLOYEES);
        } catch (err) {
          showError("Failed to delete employee");
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Not provided";
    return new Intl.NumberFormat().format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

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

  const tabs = [
    {
      label: "Basic Info",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={employee.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Phone"
                  secondary={employee.phone_number}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Gender" secondary={employee.gender} />
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
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip
                      label={employee.status}
                      color={getStatusColor(employee.status)}
                      size="small"
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Roles"
                  secondary={
                    employee.roles?.map((role) => role.role_name).join(", ") ||
                    "No roles"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Created"
                  secondary={formatDate(employee.created_at)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Last Login"
                  secondary={formatDate(employee.last_login)}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Personal Info",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Personal Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Date of Birth"
                  secondary={formatDate(employee.bioData?.dob)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Marital Status"
                  secondary={employee.bioData?.marital_status || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Blood Group"
                  secondary={employee.bioData?.blood_group || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="National ID"
                  secondary={employee.bioData?.national_id || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Location"
                  secondary={
                    employee.personalEmployeeData?.location || "Not provided"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Education"
                  secondary={
                    employee.personalEmployeeData?.education_level ||
                    "Not provided"
                  }
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Emergency Contacts
            </Typography>
            {employee.emergencyContacts?.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Relationship</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employee.emergencyContacts.map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.phone_number}</TableCell>
                        <TableCell>{contact.relationship}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">
                No emergency contacts
              </Typography>
            )}
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Employment",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Job Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Department"
                  secondary={
                    employee.basicEmployeeData?.department?.department_name ||
                    "Not assigned"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Designation"
                  secondary={
                    employee.basicEmployeeData?.designation || "Not assigned"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Employment Type"
                  secondary={
                    employee.basicEmployeeData?.employment_type ||
                    "Not provided"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Date Joined"
                  secondary={formatDate(
                    employee.basicEmployeeData?.date_joined
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Salary"
                  secondary={`TZS ${formatCurrency(employee.basicEmployeeData?.salary)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Supervisor"
                  secondary={
                    employee.basicEmployeeData?.supervisor
                      ? `${employee.basicEmployeeData.supervisor.first_name} ${employee.basicEmployeeData.supervisor.sur_name}`
                      : "Not assigned"
                  }
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              IDs & Banking
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="NIDA"
                  secondary={employee.basicEmployeeData?.nida || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="NSSF"
                  secondary={employee.basicEmployeeData?.nssf || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="BIMA"
                  secondary={employee.basicEmployeeData?.bima || "Not provided"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="HELSB"
                  secondary={
                    employee.basicEmployeeData?.helsb || "Not provided"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Bank"
                  secondary={
                    employee.basicEmployeeData?.bank_name || "Not provided"
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Account Number"
                  secondary={
                    employee.basicEmployeeData?.account_number || "Not provided"
                  }
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Next of Kin",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Next of Kin
            </Typography>
            {employee.nextOfKin?.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Relationship</TableCell>
                      <TableCell>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employee.nextOfKin.map((kin, index) => (
                      <TableRow key={index}>
                        <TableCell>{kin.name}</TableCell>
                        <TableCell>{kin.phone_number}</TableCell>
                        <TableCell>{kin.relationship}</TableCell>
                        <TableCell>{kin.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">
                No next of kin information
              </Typography>
            )}
          </Grid>
        </Grid>
      ),
    },
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(ROUTES.EMPLOYEES)}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4">Employee Details</Typography>
        </Box>
        {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Employee Summary */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3} mb={3}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: "primary.main" }}>
              {employee.first_name?.charAt(0)}
              {employee.sur_name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {employee.first_name} {employee.middle_name} {employee.sur_name}
              </Typography>
              <Typography color="text.secondary">
                {employee.basicEmployeeData?.designation} •{" "}
                {employee.basicEmployeeData?.department?.department_name}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip
                  label={employee.status}
                  color={getStatusColor(employee.status)}
                  size="small"
                />
                <Chip label={employee.email} variant="outlined" size="small" />
                <Chip
                  label={employee.phone_number}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
          <Divider />
          <Box mt={3}>{tabs[activeTab]?.content}</Box>
        </CardContent>
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" />
          &nbsp;Edit
        </MenuItem>
        {hasRole(ROLES.ADMIN) && (
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" />
            &nbsp;Delete
          </MenuItem>
        )}
      </Menu>

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
