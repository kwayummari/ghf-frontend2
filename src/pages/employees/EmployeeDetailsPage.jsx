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
  ListItemButton,
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
  EventNote as EventNoteIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES } from "../../constants";
import EmployeeForm from "../../components/features/employees/EmployeeForm";

const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAnyRole, hasRole } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const isEditMode = location.pathname.includes("/edit");

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sample employee data
      const sampleEmployee = {
        id: parseInt(id),
        first_name: "John",
        middle_name: "Michael",
        sur_name: "Doe",
        email: "john.doe@ghf.org",
        phone: "+255 123 456 789",
        gender: "M",
        date_of_birth: "1990-05-15",
        marital_status: "Married",
        address: "123 Msimbazi Street, Ilala, Dar es Salaam",
        department: "IT Department",
        position: "Software Developer",
        salary: 1500000,
        hire_date: "2023-01-15",
        status: "Active",
        supervisor: "Jane Manager",
        education_level: "Degree",
        institution: "University of Dar es Salaam",
        graduation_year: 2015,
        nida: "19900515-12345-67890-12",
        bima: "BIMA123456789",
        nssf: "NSSF987654321",
        helsb: "HESLB456789123",
        bank_name: "CRDB Bank",
        account_number: "0150123456789",
        emergency_contact_name: "Jane Doe",
        emergency_contact_phone: "+255 987 654 321",
        emergency_contact_relationship: "Spouse",
        next_of_kin_name: "Robert Doe",
        next_of_kin_phone: "+255 555 123 456",
        next_of_kin_relationship: "Parent",
      };

      setEmployee(sampleEmployee);
      setLoading(false);
    };

    fetchEmployee();
  }, [id]);

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
    console.log("Delete employee:", id);
    // Implement delete functionality
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6">Employee not found</Typography>
        <Button onClick={() => navigate(ROUTES.EMPLOYEES)} sx={{ mt: 2 }}>
          Back to Employees
        </Button>
      </Box>
    );
  }

  if (isEditMode) {
    return <EmployeeForm editMode={true} initialData={employee} />;
  }

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
                <ListItemText primary="Email" secondary={employee.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText primary="Phone" secondary={employee.phone} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText primary="Address" secondary={employee.address} />
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
                  secondary={employee.gender === "M" ? "Male" : "Female"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Marital Status"
                  secondary={employee.marital_status}
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
                  secondary={employee.department}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Position"
                  secondary={employee.position}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Supervisor"
                  secondary={employee.supervisor}
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
                      label={employee.status}
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
                  secondary={employee.education_level}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Institution"
                  secondary={employee.institution}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Graduation Year"
                  secondary={employee.graduation_year}
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
                <ListItemText primary="NIDA" secondary={employee.nida} />
              </ListItem>
              <ListItem>
                <ListItemText primary="BIMA" secondary={employee.bima} />
              </ListItem>
              <ListItem>
                <ListItemText primary="NSSF" secondary={employee.nssf} />
              </ListItem>
              <ListItem>
                <ListItemText primary="HESLB" secondary={employee.helsb} />
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
                  secondary={employee.emergency_contact_name}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary={employee.emergency_contact_phone}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Relationship"
                  secondary={employee.emergency_contact_relationship}
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
                      secondary={employee.next_of_kin_phone}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Relationship"
                      secondary={employee.next_of_kin_relationship}
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
                <ListItemText primary="Bank" secondary={employee.bank_name} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Account Number"
                  secondary={employee.account_number}
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
              {`${employee.first_name} ${employee.middle_name || ""} ${employee.sur_name}`.trim()}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {employee.position}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                label={employee.department}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={employee.status}
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
            >
              Edit
            </Button>

            <IconButton onClick={handleMenuOpen}>
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
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete Employee
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default EmployeeDetailsPage;
