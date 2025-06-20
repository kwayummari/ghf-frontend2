import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Switch,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Badge,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  VpnKey as PermissionIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  SupervisedUserCircle as RoleIcon,
  Assignment as AssignIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
import rolesAPI from "../../services/api/roles.api";
// import usersAPI from "../../services/api/users.api"; // Import when available

const RoleManagementPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [roles, setRoles] = useState([]);
  const [menuSelectedItem, setMenuSelectedItem] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState({
    role_name: "",
    description: "",
    is_default: false,
  });
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRoles(),
        fetchPermissions(),
        fetchUsers(),
      ]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showError("Failed to load roles and permissions data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesResponse = await rolesAPI.getAllRoles();
      console.log("Roles response:", rolesResponse);
      
      const rolesData = rolesResponse.data || rolesResponse;
      setRoles(rolesData);

      // Fetch permissions for each role
      await fetchAllRolePermissions(rolesData);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      throw error;
    }
  };

  const fetchPermissions = async () => {
    try {
      const permissionsResponse = await rolesAPI.getAllPermissions();
      console.log("Permissions response:", permissionsResponse);
      
      // Handle different response structures
      const permissionsData = 
        permissionsResponse.data?.all || 
        permissionsResponse.data?.data || 
        permissionsResponse.data || 
        permissionsResponse;
      
      setPermissions(permissionsData);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      // TODO: Replace with actual users API when available
      // const usersResponse = await usersAPI.getAllUsers();
      // const usersData = usersResponse.data || usersResponse;
      
      // For now, keep sample users data
      const sampleUsers = [
        { 
          id: 1, 
          name: "John Admin", 
          email: "admin@ghf.org", 
          roles: ["Admin"],
          role_ids: [1] 
        },
        { 
          id: 2, 
          name: "Jane HR", 
          email: "hr@ghf.org", 
          roles: ["HR Manager"],
          role_ids: [2] 
        },
        {
          id: 3,
          name: "Mike Finance",
          email: "finance@ghf.org",
          roles: ["Finance Manager"],
          role_ids: [3]
        },
        {
          id: 4,
          name: "Sarah Employee",
          email: "sarah@ghf.org",
          roles: ["Employee"],
          role_ids: [4]
        },
      ];
      setUsers(sampleUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Don't throw for users since it's mock data
    }
  };

  const fetchAllRolePermissions = async (rolesData) => {
    try {
      const rolePermsPromises = rolesData.map(async (role) => {
        try {
          const roleMenuPerms = await rolesAPI.getRoleMenuPermissions(role.id);
          console.log(`Permissions for role ${role.id}:`, roleMenuPerms);
          
          // Extract permission IDs from the response
          const permissionIds = extractPermissionIds(roleMenuPerms.data || roleMenuPerms);
          
          return {
            roleId: role.id,
            permissions: permissionIds,
          };
        } catch (error) {
          console.warn(`Failed to fetch permissions for role ${role.id}:`, error);
          return { roleId: role.id, permissions: [] };
        }
      });

      const rolePermsResults = await Promise.all(rolePermsPromises);
      const rolePermsMapping = rolePermsResults.reduce(
        (acc, { roleId, permissions }) => {
          acc[roleId] = permissions;
          return acc;
        },
        {}
      );

      setRolePermissions(rolePermsMapping);
      
      // Update roles with permissions count
      setRoles(prevRoles => 
        prevRoles.map(role => ({
          ...role,
          permissions_count: rolePermsMapping[role.id]?.length || 0
        }))
      );
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
    }
  };

  const extractPermissionIds = (permissionsData) => {
    if (!permissionsData) return [];
    
    // Handle different response structures
    if (Array.isArray(permissionsData)) {
      return permissionsData.map(p => p.permission_id || p.id);
    }
    
    if (permissionsData.permissions) {
      return permissionsData.permissions.map(p => p.permission_id || p.id);
    }
    
    if (permissionsData.menu_permissions) {
      return permissionsData.menu_permissions.map(p => p.permission_id || p.id);
    }
    
    return [];
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
      showSuccess("Data refreshed successfully");
    } catch (error) {
      showError("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.role_name.trim()) {
      showError("Role name is required");
      return;
    }

    setSaving(true);
    try {
      let response;
      if (editMode && selectedItem) {
        // Update existing role
        response = await rolesAPI.updateRole(selectedItem.id, newRole);
        setRoles((prev) =>
          prev.map((role) =>
            role.id === selectedItem.id
              ? { ...role, ...newRole, ...response.data }
              : role
          )
        );
        showSuccess("Role updated successfully");
      } else {
        // Create new role
        response = await rolesAPI.createRole(newRole);
        const createdRole = response.data || response;
        setRoles((prev) => [...prev, { ...createdRole, permissions_count: 0 }]);
        showSuccess("Role created successfully");
      }

      resetRoleDialog();
    } catch (error) {
      console.error("Role operation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        (editMode ? "Failed to update role" : "Failed to create role");
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleManagePermissions = (role) => {
    console.log("Managing permissions for role:", role); // Add for debugging
    setSelectedItem(role);
    const currentPermissions = rolePermissions[role.id] || [];
    const cleanPermissions = currentPermissions.filter(
      (id) => id !== undefined && id !== null
    );
    setSelectedRolePermissions(cleanPermissions);
    setPermissionDialogOpen(true);
  };

  const handleUpdateRolePermissions = async () => {
    console.log("handleUpdateRolePermissions called"); // Add this line
    console.log("selectedItem:", selectedItem); // Add this line

    if (!selectedItem) return;

    setSaving(true);
    try {
      const filteredPermissions = selectedRolePermissions.filter(
        (id) => id !== undefined && id !== null
      );
      const permissionsData = {
        permissions: filteredPermissions,
        menu_permissions: filteredPermissions,
        permission_ids: filteredPermissions,
      };

      console.log(
        "Updating permissions for role:",
        selectedItem.id,
        permissionsData
      );

      const response = await rolesAPI.updateRoleMenuPermissions(
        selectedItem.id,
        permissionsData
      );
      console.log("Update response:", response);

      // Update local state
      setRolePermissions((prev) => ({
        ...prev,
        [selectedItem.id]: selectedRolePermissions,
      }));

      // Update role permissions count
      setRoles((prev) =>
        prev.map((role) =>
          role.id === selectedItem.id
            ? { ...role, permissions_count: selectedRolePermissions.length }
            : role
        )
      );

      setPermissionDialogOpen(false);
      setSelectedItem(null);
      showSuccess("Role permissions updated successfully");
    } catch (error) {
      console.error("Update permissions error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update role permissions";
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const assignmentData = {
        user_id: selectedUser.id,
        role_ids: userRoles,
      };

      console.log("Assigning roles:", assignmentData);
      
      await rolesAPI.assignRole(assignmentData);

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                roles: roles
                  .filter((r) => userRoles.includes(r.id))
                  .map((r) => r.role_name),
                role_ids: userRoles,
              }
            : user
        )
      );

      setAssignRoleDialogOpen(false);
      showSuccess("Roles assigned successfully");
    } catch (error) {
      console.error("Assign role error:", error);
      const errorMessage =
        error.response?.data?.message || 
        error.message ||
        "Failed to assign roles";
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEditRole = (role) => {
    setNewRole({
      role_name: role.role_name,
      description: role.description,
      is_default: role.is_default,
    });
    setSelectedItem(role);
    setEditMode(true);
    setRoleDialogOpen(true);
  };

  const handleDeleteRole = async (roleId) => {
    const roleToDelete = roles.find((r) => r.id === roleId);
    if (roleToDelete?.is_default) {
      showError("Cannot delete default roles");
      return;
    }

    openDialog({
      title: "Delete Role",
      message: `Are you sure you want to delete the role "${roleToDelete?.role_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await rolesAPI.deleteRole(roleId);
          setRoles((prev) => prev.filter((r) => r.id !== roleId));
          // Clean up role permissions
          setRolePermissions((prev) => {
            const newPerms = { ...prev };
            delete newPerms[roleId];
            return newPerms;
          });
          showSuccess("Role deleted successfully");
        } catch (error) {
          console.error("Delete role error:", error);
          const errorMessage =
            error.response?.data?.message || 
            error.message ||
            "Failed to delete role";
          showError(errorMessage);
        }
      },
    });
  };

  const handleMenuClick = (event, item, type) => {
    setAnchorEl(event.currentTarget);
    setMenuSelectedItem({ ...item, type });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuSelectedItem(null);
  };

  const resetRoleDialog = () => {
    setNewRole({ role_name: "", description: "", is_default: false });
    setEditMode(false);
    setSelectedItem(null);
    setRoleDialogOpen(false);
  };

  const handlePermissionChange = (permissionId, checked) => {
    console.log("Permission change:", permissionId, checked); // Debug log
    if (checked) {
      setSelectedRolePermissions((prev) => {
        const filtered = prev.filter((id) => id !== undefined && id !== null);
        return [...filtered, permissionId];
      });
    } else {
      setSelectedRolePermissions((prev) =>
        prev.filter(
          (id) => id !== permissionId && id !== undefined && id !== null
        )
      );
    }
  };

  const handleSelectAllPermissions = (modulePermissions, checked) => {
    const modulePermissionIds = modulePermissions
      .map((p) => p.id)
      .filter((id) => id !== undefined);

    if (checked) {
      setSelectedRolePermissions((prev) => {
        const filtered = prev.filter(
          (id) =>
            id !== undefined && id !== null && !modulePermissionIds.includes(id)
        );
        return [...filtered, ...modulePermissionIds];
      });
    } else {
      setSelectedRolePermissions((prev) =>
        prev.filter(
          (id) =>
            id !== undefined && id !== null && !modulePermissionIds.includes(id)
        )
      );
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const module = permission.module || 'General';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {});

  const rolesColumns = [
    {
      field: "role_name",
      headerName: "Role Name",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          {params.row.is_default && (
            <Chip label="Default" size="small" color="info" />
          )}
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || 'No description'}
        </Typography>
      ),
    },
    {
      field: "users_count",
      headerName: "Users",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{params.value || 0}</Typography>
      ),
    },
    {
      field: "permissions_count",
      headerName: "Permissions",
      width: 120,
      renderCell: (params) => (
        <Badge badgeContent={params.value || 0} color="primary">
          <PermissionIcon color="action" />
        </Badge>
      ),
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : '-'}
        </Typography>
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
          onClick={(e) => handleMenuClick(e, params.row, "role")}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const usersColumns = [
    {
      field: "name",
      headerName: "User Name",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "roles",
      headerName: "Assigned Roles",
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {params.value?.map((role, index) => (
            <Chip key={index} label={role} size="small" color="primary" />
          )) || <Typography variant="body2" color="text.secondary">No roles assigned</Typography>}
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
          onClick={(e) => handleMenuClick(e, params.row, "user")}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const filteredRoles = roles.filter(
    (role) =>
      role.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Role & Permission Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system roles, permissions, and user access control
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={
              refreshing ? <CircularProgress size={16} /> : <RefreshIcon />
            }
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setRoleDialogOpen(true)}
            disabled={loading}
          >
            Create Role
          </Button>
        </Box>
      </Box>

      {/* Progress indicator for background operations */}
      {(refreshing || saving) && <LinearProgress sx={{ mb: 2 }} />}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                    {roles.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Roles
                  </Typography>
                </Box>
                <GroupIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
                    {permissions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Permissions
                  </Typography>
                </Box>
                <PermissionIcon color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
                    {users.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <AssignIcon color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
                    {Object.keys(groupedPermissions).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Permission Modules
                  </Typography>
                </Box>
                <SecurityIcon color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Roles" />
          <Tab label="Permissions" />
          <Tab label="User Assignments" />
        </Tabs>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent>
          {activeTab === 0 && (
            // Roles Tab
            <>
              <Box
                sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}
              >
                <TextField
                  size="small"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
                />
              </Box>

              <DataGrid
                rows={filteredRoles}
                columns={rolesColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                autoHeight
                loading={loading}
                sx={{
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                }}
              />
            </>
          )}

          {activeTab === 1 && (
            // Permissions Tab
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                System Permissions by Module
              </Typography>
              {Object.entries(groupedPermissions).map(
                ([module, modulePermissions]) => (
                  <Accordion key={module} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <SecurityIcon color="primary" />
                        <Typography variant="h6">{module}</Typography>
                        <Chip
                          label={`${modulePermissions.length} permissions`}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Permission Name</TableCell>
                              <TableCell>Action</TableCell>
                              <TableCell>Description</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {modulePermissions.map((permission) => (
                              <TableRow key={permission.id}>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {permission.permission_name ||
                                      permission.name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={permission.action || "read"}
                                    size="small"
                                    color={
                                      permission.action === "create"
                                        ? "success"
                                        : permission.action === "update"
                                          ? "warning"
                                          : permission.action === "delete"
                                            ? "error"
                                            : "info"
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {permission.description ||
                                      "No description available"}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )
              )}
            </Box>
          )}

          {activeTab === 2 && (
            // User Assignments Tab
            <>
              <Box
                sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}
              >
                <TextField
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
                  sx={{ width: 300 }}
                />
              </Box>

              <DataGrid
                rows={filteredUsers}
                columns={usersColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                autoHeight
                loading={loading}
                sx={{
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuSelectedItem?.type === "role" && (
          <>
            <MenuItem
              onClick={() => {
                handleManagePermissions(menuSelectedItem);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <PermissionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Manage Permissions</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleEditRole(menuSelectedItem);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Role</ListItemText>
            </MenuItem>
            {!menuSelectedItem.is_default && (
              <MenuItem
                onClick={() => {
                  handleDeleteRole(menuSelectedItem.id);
                  handleMenuClose();
                }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete Role</ListItemText>
              </MenuItem>
            )}
          </>
        )}
        {menuSelectedItem?.type === "user" && (
          <MenuItem
            onClick={() => {
              setSelectedUser(menuSelectedItem);
              setUserRoles(menuSelectedItem.role_ids || []);
              setAssignRoleDialogOpen(true);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <AssignIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Assign Roles</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Create/Edit Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={resetRoleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editMode ? "Edit Role" : "Create New Role"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={newRole.role_name}
              onChange={(e) =>
                setNewRole((prev) => ({ ...prev, role_name: e.target.value }))
              }
              sx={{ mb: 2 }}
              required
              error={!newRole.role_name.trim()}
              helperText={
                !newRole.role_name.trim() ? "Role name is required" : ""
              }
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newRole.description}
              onChange={(e) =>
                setNewRole((prev) => ({ ...prev, description: e.target.value }))
              }
              sx={{ mb: 2 }}
              placeholder="Enter role description..."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newRole.is_default}
                  onChange={(e) =>
                    setNewRole((prev) => ({
                      ...prev,
                      is_default: e.target.checked,
                    }))
                  }
                />
              }
              label="Default Role (assigned to new users automatically)"
            />
            {newRole.is_default && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Default roles are automatically assigned to new users when they
                register.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetRoleDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRole}
            variant="contained"
            disabled={saving || !newRole.role_name.trim()}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? "Saving..." : editMode ? "Update Role" : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => {
          if (!saving) {
            setPermissionDialogOpen(false);
            // Don't clear selectedItem here
          }
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: "80vh" },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              Manage Permissions for "
              {selectedItem?.role_name || selectedItem?.name}"
            </Typography>
            <Chip
              label={`${selectedRolePermissions.length} selected`}
              color="primary"
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {saving && <LinearProgress sx={{ mb: 2 }} />}

            {Object.keys(groupedPermissions).length === 0 ? (
              <Alert severity="warning">
                No permissions available. Please ensure permissions are properly
                loaded.
              </Alert>
            ) : (
              Object.entries(groupedPermissions).map(
                ([module, modulePermissions]) => {
                  const modulePermissionIds = modulePermissions.map(
                    (p) => p.id
                  );
                  const selectedModulePerms = selectedRolePermissions.filter(
                    (id) => modulePermissionIds.includes(id)
                  );
                  const isAllSelected =
                    selectedModulePerms.length === modulePermissions.length;
                  const isPartiallySelected =
                    selectedModulePerms.length > 0 && !isAllSelected;

                  return (
                    <Accordion key={module} sx={{ mb: 1 }} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isAllSelected}
                                indeterminate={isPartiallySelected}
                                onChange={(e) =>
                                  handleSelectAllPermissions(
                                    modulePermissions,
                                    e.target.checked
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            }
                            label=""
                            sx={{ margin: 0 }}
                          />
                          <SecurityIcon color="primary" />
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {module} Permissions
                          </Typography>
                          <Chip
                            label={`${selectedModulePerms.length}/${modulePermissions.length}`}
                            size="small"
                            color={
                              isAllSelected
                                ? "success"
                                : isPartiallySelected
                                  ? "warning"
                                  : "default"
                            }
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <FormGroup>
                          {modulePermissions.map((permission) => (
                            <FormControlLabel
                              key={permission.id}
                              control={
                                <Checkbox
                                  checked={selectedRolePermissions.includes(
                                    permission.id
                                  )}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      permission.id,
                                      e.target.checked
                                    )
                                  }
                                />
                              }
                              label={
                                <Box sx={{ ml: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {permission.permission_name ||
                                        permission.name}
                                    </Typography>
                                    <Chip
                                      label={permission.action || "read"}
                                      size="small"
                                      variant="outlined"
                                      color={
                                        permission.action === "create"
                                          ? "success"
                                          : permission.action === "update"
                                            ? "warning"
                                            : permission.action === "delete"
                                              ? "error"
                                              : "info"
                                      }
                                    />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    {permission.description ||
                                      "No description available"}
                                  </Typography>
                                </Box>
                              }
                              sx={{
                                display: "block",
                                mb: 1,
                                "& .MuiFormControlLabel-label": {
                                  width: "100%",
                                },
                              }}
                            />
                          ))}
                        </FormGroup>
                      </AccordionDetails>
                    </Accordion>
                  );
                }
              )
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setPermissionDialogOpen(false);
              setSelectedItem(null); // Clear only when canceling
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Reset to original permissions
              setSelectedRolePermissions(
                rolePermissions[selectedItem?.id] || []
              );
            }}
            disabled={saving}
          >
            Reset
          </Button>
          <Button
            onClick={handleUpdateRolePermissions}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Roles Dialog */}
      <Dialog
        open={assignRoleDialogOpen}
        onClose={() => !saving && setAssignRoleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonAddIcon />
            Assign Roles to {selectedUser?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {saving && <LinearProgress sx={{ mb: 2 }} />}

            <Alert severity="info" sx={{ mb: 2 }}>
              Select the roles you want to assign to this user. Changes will be
              applied immediately.
            </Alert>

            <FormGroup>
              {roles.map((role) => (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      checked={userRoles.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUserRoles((prev) => [...prev, role.id]);
                        } else {
                          setUserRoles((prev) =>
                            prev.filter((id) => id !== role.id)
                          );
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {role.role_name}
                        </Typography>
                        {role.is_default && (
                          <Chip label="Default" size="small" color="info" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {role.description || "No description available"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {role.permissions_count || 0} permissions
                      </Typography>
                    </Box>
                  }
                  sx={{
                    display: "block",
                    mb: 2,
                    p: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                />
              ))}
            </FormGroup>

            {userRoles.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No roles selected. User will have minimal access permissions.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAssignRoleDialogOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignRole}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <AssignIcon />}
          >
            {saving ? "Assigning..." : "Assign Roles"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
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
  );
};

export default RoleManagementPage;