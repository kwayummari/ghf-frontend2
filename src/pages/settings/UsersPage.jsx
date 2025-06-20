import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  CheckCircle as EnabledIcon,
  Cancel as InactiveIcon,
  Warning as WarningIcon,
  VpnKey as PasswordIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as DepartmentIcon,
  Assignment as RoleIcon,
  Badge as BadgeIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  Timeline as ActivityIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Send as InviteIcon,
  Refresh as ResetIcon,
  ExpandMore as ExpandMoreIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SupervisorIcon,
  PersonOutline as UserIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInDays, addDays } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { usersAPI } from '../../../services/api/users.api';

const UsersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    employee_id: "",
    department_id: "",
    position: "",
    manager_id: "",
    hire_date: null,
    status: "active",
    is_active: true,
    send_invite: true,
    role_ids: [],
    permissions: [],
  });

  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
    force_change: true,
  });

  // Mock data for development
  const mockUsers = [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@ghfoundation.org",
      phone_number: "+255 123 456 789",
      employee_id: "GHF-001",
      department: "IT Department",
      department_id: 1,
      position: "IT Manager",
      manager: "Jane Smith",
      manager_id: 2,
      hire_date: "2023-01-15",
      last_login: "2024-06-20 14:30:00",
      status: "active",
      is_active: true,
      roles: ["IT Manager", "User"],
      role_count: 2,
      permissions_count: 15,
      created_at: "2023-01-15",
      updated_at: "2024-06-20",
      avatar: null,
      login_count: 245,
      failed_login_attempts: 0,
      account_locked: false,
      password_last_changed: "2024-03-15",
      email_verified: true,
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@ghfoundation.org",
      phone_number: "+255 987 654 321",
      employee_id: "GHF-002",
      department: "Human Resources",
      department_id: 2,
      position: "HR Director",
      manager: null,
      manager_id: null,
      hire_date: "2022-08-10",
      last_login: "2024-06-19 16:45:00",
      status: "active",
      is_active: true,
      roles: ["HR Manager", "Admin"],
      role_count: 2,
      permissions_count: 25,
      created_at: "2022-08-10",
      updated_at: "2024-06-19",
      avatar: null,
      login_count: 456,
      failed_login_attempts: 0,
      account_locked: false,
      password_last_changed: "2024-05-20",
      email_verified: true,
    },
    {
      id: 3,
      first_name: "Mike",
      last_name: "Johnson",
      email: "mike.johnson@ghfoundation.org",
      phone_number: "+255 555 123 456",
      employee_id: "GHF-003",
      department: "Finance",
      department_id: 3,
      position: "Finance Officer",
      manager: "Sarah Williams",
      manager_id: 4,
      hire_date: "2023-03-20",
      last_login: "2024-06-15 09:15:00",
      status: "inactive",
      is_active: false,
      roles: ["Finance User"],
      role_count: 1,
      permissions_count: 8,
      created_at: "2023-03-20",
      updated_at: "2024-06-15",
      avatar: null,
      login_count: 89,
      failed_login_attempts: 3,
      account_locked: true,
      password_last_changed: "2023-03-20",
      email_verified: false,
    },
  ];

  const mockRoles = [
    { id: 1, role_name: "Super Admin", description: "Full system access" },
    { id: 2, role_name: "Admin", description: "Administrative access" },
    {
      id: 3,
      role_name: "HR Manager",
      description: "Human resources management",
    },
    { id: 4, role_name: "IT Manager", description: "IT department management" },
    { id: 5, role_name: "Finance Manager", description: "Finance management" },
    { id: 6, role_name: "User", description: "Basic user access" },
  ];

  const mockDepartments = [
    { id: 1, name: "IT Department" },
    { id: 2, name: "Human Resources" },
    { id: 3, name: "Finance" },
    { id: 4, name: "Operations" },
    { id: 5, name: "Administration" },
  ];

  // User statuses
  const userStatuses = [
    {
      value: "active",
      label: "Active",
      color: "success",
      icon: <EnabledIcon />,
    },
    {
      value: "inactive",
      label: "Inactive",
      color: "default",
      icon: <InactiveIcon />,
    },
    {
      value: "suspended",
      label: "Suspended",
      color: "warning",
      icon: <WarningIcon />,
    },
    { value: "locked", label: "Locked", color: "error", icon: <BlockIcon /> },
  ];

  // User creation steps
  const userCreationSteps = [
    "Basic Information",
    "Department & Role",
    "Permissions",
    "Account Settings",
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Users",
      value: mockUsers.length.toString(),
      subtitle: "All system users",
      icon: <PersonIcon />,
      color: "primary",
    },
    {
      title: "Active Users",
      value: mockUsers
        .filter((user) => user.status === "active")
        .length.toString(),
      subtitle: "Currently active",
      icon: <EnabledIcon />,
      color: "success",
    },
    {
      title: "Inactive Users",
      value: mockUsers
        .filter((user) => user.status === "inactive")
        .length.toString(),
      subtitle: "Requiring attention",
      icon: <InactiveIcon />,
      color: "warning",
    },
    {
      title: "Locked Accounts",
      value: mockUsers.filter((user) => user.account_locked).length.toString(),
      subtitle: "Security issues",
      icon: <LockIcon />,
      color: "error",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "user_info",
      headerName: "User",
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar>
            {params.row.first_name?.charAt(0)}
            {params.row.last_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.first_name} {params.row.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "employee_id",
      headerName: "Employee ID",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          icon={<BadgeIcon />}
        />
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.position}
          </Typography>
        </Box>
      ),
    },
    {
      field: "roles",
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
            />
          ))}
          {params.value?.length > 2 && (
            <Chip
              label={`+${params.value.length - 2}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      ),
    },
    {
      field: "last_login",
      headerName: "Last Login",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value
              ? format(new Date(params.value), "dd/MM/yyyy")
              : "Never"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value ? format(new Date(params.value), "HH:mm") : ""}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const status = userStatuses.find((s) => s.value === params.value);
        return (
          <Chip
            label={status?.label}
            size="small"
            color={status?.color}
            variant="filled"
            icon={status?.icon}
          />
        );
      },
    },
    {
      field: "security",
      headerName: "Security",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {params.row.email_verified && (
            <Tooltip title="Email Verified">
              <EnabledIcon fontSize="small" color="success" />
            </Tooltip>
          )}
          {params.row.account_locked && (
            <Tooltip title="Account Locked">
              <LockIcon fontSize="small" color="error" />
            </Tooltip>
          )}
          {params.row.failed_login_attempts > 0 && (
            <Tooltip
              title={`${params.row.failed_login_attempts} Failed Attempts`}
            >
              <Badge
                badgeContent={params.row.failed_login_attempts}
                color="error"
              >
                <WarningIcon fontSize="small" color="warning" />
              </Badge>
            </Tooltip>
          )}
        </Box>
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
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            setSelectedUser(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load users data
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await usersAPI.getAllUsers();
      // setUsers(response.data || []);
      setUsers(mockUsers);
    } catch (error) {
      showError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // Replace with actual API call
      // const response = await rolesAPI.getAllRoles();
      // setRoles(response.data || []);
      setRoles(mockRoles);
    } catch (error) {
      showError("Failed to fetch roles");
    }
  };

  const fetchDepartments = async () => {
    try {
      // Replace with actual API call
      // const response = await departmentsAPI.getAllDepartments();
      // setDepartments(response.data || []);
      setDepartments(mockDepartments);
    } catch (error) {
      showError("Failed to fetch departments");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // await usersAPI.updateUser(editingUser.id, formData);
        showSuccess("User updated successfully");
      } else {
        // await usersAPI.createUser(formData);
        showSuccess("User created successfully");
      }
      setDialogOpen(false);
      setInviteDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      showError("Failed to save user");
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      employee_id: "",
      department_id: "",
      position: "",
      manager_id: "",
      hire_date: null,
      status: "active",
      is_active: true,
      send_invite: true,
      role_ids: [],
      permissions: [],
    });
    setEditingUser(null);
    setActiveStep(0);
  };

  // Handle edit user
  const handleEdit = (user) => {
    setFormData({ ...user, role_ids: [1, 2] }); // Mock role IDs
    setEditingUser(user);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete user
  const handleDelete = (user) => {
    openDialog({
      title: "Delete User",
      message: `Are you sure you want to delete user "${user.first_name} ${user.last_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // await usersAPI.deleteUser(user.id);
          showSuccess("User deleted successfully");
          fetchUsers();
        } catch (error) {
          showError("Failed to delete user");
        }
      },
    });
    setAnchorEl(null);
  };

  // Handle user status change
  const handleStatusChange = async (user, newStatus) => {
    try {
      // await usersAPI.updateUserStatus(user.id, { status: newStatus });
      showSuccess(
        `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`
      );
      fetchUsers();
    } catch (error) {
      showError("Failed to update user status");
    }
    setAnchorEl(null);
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    try {
      if (passwordForm.new_password !== passwordForm.confirm_password) {
        showError("Passwords do not match");
        return;
      }
      // await usersAPI.resetPassword(selectedUser.id, passwordForm);
      showSuccess("Password reset successfully");
      setPasswordDialogOpen(false);
      setPasswordForm({
        new_password: "",
        confirm_password: "",
        force_change: true,
      });
    } catch (error) {
      showError("Failed to reset password");
    }
    setAnchorEl(null);
  };

  // Handle account unlock
  const handleAccountUnlock = async (user) => {
    try {
      // await usersAPI.unlockAccount(user.id);
      showSuccess("Account unlocked successfully");
      fetchUsers();
    } catch (error) {
      showError("Failed to unlock account");
    }
    setAnchorEl(null);
  };

  // Handle role assignment
  const handleRoleAssignment = async (userId, roleIds) => {
    try {
      // await usersAPI.assignRoles(userId, { role_ids: roleIds });
      showSuccess("Roles assigned successfully");
      fetchUsers();
      setRolesDialogOpen(false);
    } catch (error) {
      showError("Failed to assign roles");
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesRole =
      !roleFilter ||
      user.roles?.some((role) =>
        role.toLowerCase().includes(roleFilter.toLowerCase())
      );
    const matchesDepartment =
      !departmentFilter || user.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesDepartment;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            <Typography variant="h4">User Management</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<InviteIcon />}
                onClick={() => setInviteDialogOpen(true)}
              >
                Invite User
              </Button>
              {hasPermission(PERMISSIONS.MANAGE_USERS) && (
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  Add User
                </Button>
              )}
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage system users, roles, and permissions
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
                    placeholder="Search users..."
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
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {userStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      label="Role"
                    >
                      <MenuItem value="">All Roles</MenuItem>
                      {mockRoles.map((role) => (
                        <MenuItem key={role.id} value={role.role_name}>
                          {role.role_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      label="Department"
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      {mockDepartments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        /* Export users */
                      }}
                    >
                      Export
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={() => navigate("/settings/roles")}
                    >
                      Roles
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Users Table */}
            <Box sx={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={filteredUsers}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                getRowHeight={() => "auto"}
                sx={{
                  "& .MuiDataGrid-cell": {
                    py: 1,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setViewDialogOpen(true);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_USERS) && (
            <MenuItem onClick={() => handleEdit(selectedUser)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit User</ListItemText>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setRolesDialogOpen(true);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <RoleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Manage Roles</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setPasswordDialogOpen(true);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <PasswordIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Reset Password</ListItemText>
          </MenuItem>
          {selectedUser?.account_locked && (
            <MenuItem onClick={() => handleAccountUnlock(selectedUser)}>
              <ListItemIcon>
                <UnlockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Unlock Account</ListItemText>
            </MenuItem>
          )}
          <Divider />
          {selectedUser?.status === "active" ? (
            <MenuItem
              onClick={() => handleStatusChange(selectedUser, "inactive")}
            >
              <ListItemIcon>
                <BlockIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Deactivate User</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => handleStatusChange(selectedUser, "active")}
            >
              <ListItemIcon>
                <EnabledIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Activate User</ListItemText>
            </MenuItem>
          )}
          {hasPermission(PERMISSIONS.DELETE_USERS) && (
            <MenuItem
              onClick={() => handleDelete(selectedUser)}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete User</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Add/Edit User Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingUser ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Step 1: Basic Information */}
              <Step>
                <StepLabel>Basic Information</StepLabel>
                <StepContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_name: e.target.value,
                          })
                        }
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_name: e.target.value,
                          })
                        }
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone_number: e.target.value,
                          })
                        }
                        placeholder="+255 123 456 789"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Employee ID"
                        value={formData.employee_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employee_id: e.target.value,
                          })
                        }
                        placeholder="GHF-001"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Hire Date"
                        value={formData.hire_date}
                        onChange={(date) =>
                          setFormData({ ...formData, hire_date: date })
                        }
                        slotProps={{
                          textField: { fullWidth: true },
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                      sx={{ mr: 1 }}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 2: Department & Role */}
              <Step>
                <StepLabel>Department & Role</StepLabel>
                <StepContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                          value={formData.department_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              department_id: e.target.value,
                            })
                          }
                          label="Department"
                          required
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Position/Title"
                        value={formData.position}
                        onChange={(e) =>
                          setFormData({ ...formData, position: e.target.value })
                        }
                        placeholder="e.g., IT Manager"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Manager</InputLabel>
                        <Select
                          value={formData.manager_id || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              manager_id: e.target.value,
                            })
                          }
                          label="Manager"
                        >
                          <MenuItem value="">No Manager</MenuItem>
                          {users
                            .filter((u) => u.id !== editingUser?.id)
                            .map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Primary Role</InputLabel>
                        <Select
                          value={formData.role_ids[0] || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role_ids: [e.target.value],
                            })
                          }
                          label="Primary Role"
                          required
                        >
                          {roles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                              {role.role_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button onClick={() => setActiveStep(0)} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(2)}
                      sx={{ mr: 1 }}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 3: Permissions */}
              <Step>
                <StepLabel>Permissions</StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Additional roles and permissions will be configured here.
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Permissions are automatically assigned based on the
                      selected role. You can modify permissions after user
                      creation.
                    </Typography>
                  </Alert>
                  <Box sx={{ mt: 2 }}>
                    <Button onClick={() => setActiveStep(1)} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(3)}
                      sx={{ mr: 1 }}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 4: Account Settings */}
              <Step>
                <StepLabel>Account Settings</StepLabel>
                <StepContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          label="Status"
                        >
                          {userStatuses.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.is_active}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                is_active: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Account Active"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.send_invite}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                send_invite: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Send invitation email to user"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button onClick={() => setActiveStep(2)} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      sx={{ mr: 1 }}
                    >
                      {editingUser ? "Update User" : "Create User"}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* View User Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            User Details - {selectedUser?.first_name} {selectedUser?.last_name}
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: "center" }}>
                        <Avatar
                          sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
                        >
                          {selectedUser.first_name?.charAt(0)}
                          {selectedUser.last_name?.charAt(0)}
                        </Avatar>
                        <Typography variant="h6">
                          {selectedUser.first_name} {selectedUser.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedUser.position}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedUser.department}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={
                              userStatuses.find(
                                (s) => s.value === selectedUser.status
                              )?.label
                            }
                            color={
                              userStatuses.find(
                                (s) => s.value === selectedUser.status
                              )?.color
                            }
                            variant="filled"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Contact Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedUser.email}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedUser.phone_number || "Not provided"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Employee ID
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedUser.employee_id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Hire Date
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {format(
                            new Date(selectedUser.hire_date),
                            "dd/MM/yyyy"
                          )}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                      Security Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Last Login
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedUser.last_login
                            ? format(
                                new Date(selectedUser.last_login),
                                "dd/MM/yyyy HH:mm"
                              )
                            : "Never"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Login Count
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedUser.login_count}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Failed Attempts
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ mb: 2 }}
                          color={
                            selectedUser.failed_login_attempts > 0
                              ? "error.main"
                              : "text.primary"
                          }
                        >
                          {selectedUser.failed_login_attempts}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Account Status
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedUser.account_locked ? "Locked" : "Active"}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                      Roles & Permissions
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {selectedUser.roles?.map((role, index) => (
                        <Chip
                          key={index}
                          label={role}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {selectedUser.permissions_count} permissions assigned
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            {hasPermission(PERMISSIONS.MANAGE_USERS) && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEdit(selectedUser);
                }}
              >
                Edit User
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Manage Roles Dialog */}
        <Dialog
          open={rolesDialogOpen}
          onClose={() => setRolesDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Manage Roles - {selectedUser?.first_name} {selectedUser?.last_name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select roles to assign to this user. Users inherit permissions
              from their assigned roles.
            </Typography>
            <List>
              {roles.map((role) => (
                <ListItem key={role.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <RoleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <MUIListItemText
                    primary={role.role_name}
                    secondary={role.description}
                  />
                  <Checkbox
                    defaultChecked={selectedUser?.roles?.includes(
                      role.role_name
                    )}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRolesDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => handleRoleAssignment(selectedUser?.id, [1, 2])}
            >
              Save Roles
            </Button>
          </DialogActions>
        </Dialog>

        {/* Password Reset Dialog */}
        <Dialog
          open={passwordDialogOpen}
          onClose={() => setPasswordDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Reset Password - {selectedUser?.first_name}{" "}
            {selectedUser?.last_name}
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Resetting a user's password will immediately invalidate their
                current session.
              </Typography>
            </Alert>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirm_password: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={passwordForm.force_change}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          force_change: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Force user to change password on next login"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handlePasswordReset}
            >
              Reset Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Invite User Dialog */}
        <Dialog
          open={inviteDialogOpen}
          onClose={() => setInviteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Invite New User</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Send an invitation email to a new user. They will receive a link
              to complete their registration.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.department_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department_id: e.target.value,
                      })
                    }
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role_ids[0] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, role_ids: [e.target.value] })
                    }
                    label="Role"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.role_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<InviteIcon />}
              onClick={handleSubmit}
            >
              Send Invitation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Dialog */}
        {isOpen && (
          <Dialog open={isOpen} onClose={closeDialog}>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogContent>
              <Typography>{config.message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleConfirm} color="error" variant="contained">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default UsersPage;