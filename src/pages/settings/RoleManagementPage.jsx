import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Divider,
  Stack,
  InputAdornment,
  Badge,
  Avatar,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  VpnKey as PermissionIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AccountBalance as FinanceIcon,
  Receipt as ProcurementIcon,
  EventNote as LeaveIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";

// Import your existing API service
import rolesAPI from "../../services/api/roles.api";

const RoleManagementPage = () => {
  // State management
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
    useState(null);

  // Form states
  const [roleForm, setRoleForm] = useState({
    role_name: "",
    description: "",
    is_active: true,
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [availableSearchTerm, setAvailableSearchTerm] = useState("");
  const [selectedSearchTerm, setSelectedSearchTerm] = useState("");

  // Menu and notification states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        rolesAPI.getAllRoles(),
        rolesAPI.getAllPermissions(),
      ]);

      if (rolesResponse.success) {
        const rolesData = Array.isArray(rolesResponse.data)
          ? rolesResponse.data
          : [];
        setRoles(rolesData);
      } else {
        setRoles([]);
      }

      if (permissionsResponse.success) {
        // Handle different response structures
        let permissionsData = [];
        if (Array.isArray(permissionsResponse.data)) {
          permissionsData = permissionsResponse.data;
        } else if (
          permissionsResponse.data &&
          typeof permissionsResponse.data === "object"
        ) {
          // If data is an object, try to extract permissions from common property names
          permissionsData =
            permissionsResponse.data.permissions ||
            permissionsResponse.data.data ||
            Object.values(permissionsResponse.data)
              .flat()
              .filter((item) => item && item.id);
        }
        setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error("Load data error:", error);
      showNotification("Error loading data: " + error.message, "error");
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Role CRUD operations
  const handleCreateRole = async () => {
    try {
      const response = await rolesAPI.createRole(roleForm);
      if (response.success) {
        showNotification("Role created successfully");
        setRoleDialogOpen(false);
        setRoleForm({ role_name: "", description: "", is_active: true });
        loadData();
      }
    } catch (error) {
      showNotification("Error creating role: " + error.message, "error");
    }
  };

  const handleUpdateRole = async () => {
    try {
      const response = await rolesAPI.updateRole(editingRole.id, roleForm);
      if (response.success) {
        showNotification("Role updated successfully");
        setRoleDialogOpen(false);
        setEditingRole(null);
        setRoleForm({ role_name: "", description: "", is_active: true });
        loadData();
      }
    } catch (error) {
      showNotification("Error updating role: " + error.message, "error");
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        const response = await rolesAPI.deleteRole(roleId);
        if (response.success) {
          showNotification("Role deleted successfully");
          loadData();
        }
      } catch (error) {
        showNotification("Error deleting role: " + error.message, "error");
      }
    }
  };

  // Permission management
  const handleManagePermissions = async (role) => {
    setSelectedRoleForPermissions(role);
    try {
      // Check if role already has permissions in the roles data
      const roleWithPermissions = roles.find((r) => r.id === role.id);
      let rolePermissionIds = [];

      if (
        roleWithPermissions &&
        roleWithPermissions.permissions &&
        Array.isArray(roleWithPermissions.permissions)
      ) {
        rolePermissionIds = roleWithPermissions.permissions.map((p) => p.id);
      }

      // Also try to get from menu permissions API
      try {
        const response = await rolesAPI.getRoleMenuPermissions(role.id);

        if (response.success && response.data) {
          if (
            response.data.permissions &&
            Array.isArray(response.data.permissions)
          ) {
            const apiPermissionIds = response.data.permissions.map((p) => p.id);
            // Merge both sources of permissions
            rolePermissionIds = [
              ...new Set([...rolePermissionIds, ...apiPermissionIds]),
            ];
          }
        }
      } catch (apiError) {
        console.log(
          "API call failed, using role data permissions only:",
          apiError
        );
      }

      setSelectedPermissions(rolePermissionIds);
      setPermissionDialogOpen(true);
    } catch (error) {
      console.error("Error loading role permissions:", error);
      // Still open the dialog with empty permissions
      setSelectedPermissions([]);
      setPermissionDialogOpen(true);
      showNotification("Could not load existing permissions", "warning");
    }
  };

  const handleUpdatePermissions = async () => {
    try {
      const response = await rolesAPI.updateRoleMenuPermissions(
        selectedRoleForPermissions.id,
        { permission_ids: selectedPermissions }
      );
      if (response.success) {
        showNotification("Permissions updated successfully");
        setPermissionDialogOpen(false);
        setSelectedRoleForPermissions(null);
        setSelectedPermissions([]);
      }
    } catch (error) {
      showNotification("Error updating permissions: " + error.message, "error");
    }
  };

  // UI event handlers
  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      role_name: role.role_name,
      description: role.description || "",
      is_active: role.is_active !== false,
    });
    setRoleDialogOpen(true);
    handleMenuClose();
  };

  const handleAddNewRole = () => {
    setEditingRole(null);
    setRoleForm({ role_name: "", description: "", is_active: true });
    setRoleDialogOpen(true);
  };

  // Filter roles based on search term - ensure roles is an array
  const filteredRoles = (roles || []).filter(
    (role) =>
      role.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group permissions by module - ensure permissions is an array
  const groupedPermissions = (permissions || []).reduce((acc, permission) => {
    const module = permission.module || "General";
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {});

  const getModuleIcon = (module) => {
    const icons = {
      Dashboard: <DashboardIcon />,
      Employees: <PeopleIcon />,
      Departments: <BusinessIcon />,
      Finance: <FinanceIcon />,
      Procurement: <ProcurementIcon />,
      Leave: <LeaveIcon />,
      Reports: <ReportsIcon />,
      Settings: <SettingsIcon />,
    };
    return icons[module] || <SecurityIcon />;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Role Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system roles and their permissions
        </Typography>
      </Box>

      {/* Action Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <TextField
              placeholder="Search roles..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadData}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNewRole}
              >
                Add New Role
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <Grid container spacing={3}>
        {filteredRoles.map((role) => (
          <Grid item xs={12} sm={6} md={4} key={role.id}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: role.is_default
                        ? "primary.main"
                        : "secondary.main",
                    }}
                  >
                    <GroupIcon />
                  </Avatar>
                }
                action={
                  <IconButton onClick={(e) => handleMenuOpen(e, role)}>
                    <MoreVertIcon />
                  </IconButton>
                }
                title={role.role_name}
                subheader={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={role.is_default ? "System" : "Custom"}
                      color={role.is_default ? "primary" : "default"}
                    />
                    {role.user_count && (
                      <Chip
                        size="small"
                        label={`${role.user_count} users`}
                        variant="outlined"
                      />
                    )}
                  </Stack>
                }
              />
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {role.description || "No description provided"}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" color="text.secondary">
                    Created:{" "}
                    {role.created_at
                      ? new Date(role.created_at).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PermissionIcon />}
                    onClick={() => handleManagePermissions(role)}
                  >
                    Permissions
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredRoles.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No roles found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Create your first role to get started"}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNewRole}
            >
              Add New Role
            </Button>
          )}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditRole(selectedRole)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Role</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleManagePermissions(selectedRole)}>
          <ListItemIcon>
            <PermissionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Permissions</ListItemText>
        </MenuItem>
        {selectedRole && !selectedRole.is_default && (
          <MenuItem
            onClick={() => handleDeleteRole(selectedRole.id)}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Role</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Create/Edit Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingRole ? "Edit Role" : "Create New Role"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={roleForm.role_name}
              onChange={(e) =>
                setRoleForm({ ...roleForm, role_name: e.target.value })
              }
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={roleForm.description}
              onChange={(e) =>
                setRoleForm({ ...roleForm, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={roleForm.is_active}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, is_active: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={editingRole ? handleUpdateRole : handleCreateRole}
            disabled={!roleForm.role_name.trim()}
          >
            {editingRole ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: "90vh", maxHeight: "800px" },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" component="div" color="primary">
            Assign Permissions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Role: {selectedRoleForPermissions?.role_name}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "calc(100% - 140px)" }}>
          <Grid container sx={{ height: "100%" }}>
            {/* Available Permissions */}
            <Grid item xs={5.5}>
              <Box
                sx={{
                  p: 2,
                  height: "100%",
                  borderRight: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Available
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Search by name"
                  variant="outlined"
                  size="small"
                  value={availableSearchTerm}
                  onChange={(e) => setAvailableSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Paper
                  variant="outlined"
                  sx={{
                    height: "calc(100% - 100px)",
                    overflow: "auto",
                    p: 1,
                  }}
                >
                  {permissions
                    .filter((p) => !selectedPermissions.includes(p.id))
                    .filter((p) =>
                      p.name
                        ?.toLowerCase()
                        .includes(availableSearchTerm.toLowerCase())
                    )
                    .map((permission) => (
                      <Box
                        key={permission.id}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          border: 1,
                          borderColor: "grey.300",
                          borderRadius: 1,
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                        onClick={() => {
                          setSelectedPermissions([
                            ...selectedPermissions,
                            permission.id,
                          ]);
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {permission.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {permission.module} • {permission.action}
                        </Typography>
                      </Box>
                    ))}
                  {permissions
                    .filter((p) => !selectedPermissions.includes(p.id))
                    .filter((p) =>
                      p.name
                        ?.toLowerCase()
                        .includes(availableSearchTerm.toLowerCase())
                    ).length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {availableSearchTerm
                          ? "No permissions found matching search"
                          : "All permissions are assigned"}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Grid>

            {/* Transfer Buttons */}
            <Grid item xs={1}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  height: "100%",
                  gap: 1,
                  pt: 10, // Push buttons down from the top
                }}
              >
                <Tooltip title="Move all to assigned">
                  <IconButton
                    color="primary"
                    size="small"
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      width: 32,
                      height: 32,
                    }}
                    onClick={() => {
                      const allIds = permissions.map((p) => p.id);
                      setSelectedPermissions(allIds);
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: "bold" }}>
                      ≫
                    </Typography>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Move selected to assigned">
                  <IconButton
                    color="primary"
                    size="small"
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Remove selected from assigned">
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: "grey.300",
                      color: "grey.700",
                      "&:hover": { bgcolor: "grey.400" },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Remove all from assigned">
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: "grey.300",
                      color: "grey.700",
                      "&:hover": { bgcolor: "grey.400" },
                      width: 32,
                      height: 32,
                    }}
                    onClick={() => {
                      setSelectedPermissions([]);
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: "bold" }}>
                      ≪
                    </Typography>
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Selected Permissions */}
            <Grid item xs={5.5}>
              <Box sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Selected ({selectedPermissions.length})
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Search by name"
                  variant="outlined"
                  size="small"
                  value={selectedSearchTerm}
                  onChange={(e) => setSelectedSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Paper
                  variant="outlined"
                  sx={{
                    height: "calc(100% - 100px)",
                    overflow: "auto",
                    p: 1,
                  }}
                >
                  {permissions
                    .filter((p) => selectedPermissions.includes(p.id))
                    .filter((p) =>
                      p.name
                        ?.toLowerCase()
                        .includes(selectedSearchTerm.toLowerCase())
                    )
                    .map((permission) => (
                      <Box
                        key={permission.id}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          border: 1,
                          borderColor: "primary.main",
                          borderRadius: 1,
                          bgcolor: "primary.50",
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "primary.100",
                          },
                        }}
                        onClick={() => {
                          setSelectedPermissions(
                            selectedPermissions.filter(
                              (id) => id !== permission.id
                            )
                          );
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {permission.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {permission.module} • {permission.action}
                        </Typography>
                      </Box>
                    ))}
                  {selectedPermissions.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No permissions assigned
                      </Typography>
                    </Box>
                  )}
                  {selectedPermissions.length > 0 &&
                    permissions
                      .filter((p) => selectedPermissions.includes(p.id))
                      .filter((p) =>
                        p.name
                          ?.toLowerCase()
                          .includes(selectedSearchTerm.toLowerCase())
                      ).length === 0 && (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No permissions found matching search
                        </Typography>
                      </Box>
                    )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            onClick={() => setPermissionDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdatePermissions}
            startIcon={<SaveIcon />}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoleManagementPage;