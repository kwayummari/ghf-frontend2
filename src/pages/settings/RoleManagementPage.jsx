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
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
import rolesAPI from "../../services/api/roles.api"; // Import your API

const RoleManagementPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newRole, setNewRole] = useState({
    role_name: "",
    description: "",
    is_default: false,
  });
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch roles, permissions, and users simultaneously
      const [rolesResponse, permissionsResponse] = await Promise.all([
        rolesAPI.getAllRoles(),
        rolesAPI.getAllPermissions(),
        // Add users API call when available
        // usersAPI.getAllUsers()
      ]);

      console.log('roles',rolesResponse);
      console.log('permissions',permissionsResponse);
      setRoles(rolesResponse.data || rolesResponse);
      setPermissions(permissionsResponse.data || permissionsResponse);

      // For now, keep sample users data until users API is available
      const sampleUsers = [
        { id: 1, name: "John Admin", email: "admin@ghf.org", roles: ["Admin"] },
        { id: 2, name: "Jane HR", email: "hr@ghf.org", roles: ["HR Manager"] },
        {
          id: 3,
          name: "Mike Finance",
          email: "finance@ghf.org",
          roles: ["Finance Manager"],
        },
        {
          id: 4,
          name: "Sarah Employee",
          email: "sarah@ghf.org",
          roles: ["Employee"],
        },
      ];
      setUsers(sampleUsers);

      // Fetch role permissions for each role
      const rolePermsPromises = (rolesResponse.data || rolesResponse).map(
        async (role) => {
          try {
            const roleMenuPerms = await rolesAPI.getRoleMenuPermissions(
              role.id
            );
            return {
              roleId: role.id,
              permissions: roleMenuPerms.data || roleMenuPerms,
            };
          } catch (error) {
            console.warn(
              `Failed to fetch permissions for role ${role.id}:`,
              error
            );
            return { roleId: role.id, permissions: [] };
          }
        }
      );

      const rolePermsResults = await Promise.all(rolePermsPromises);
      const rolePermsMapping = rolePermsResults.reduce(
        (acc, { roleId, permissions }) => {
          acc[roleId] = permissions;
          return acc;
        },
        {}
      );

      setRolePermissions(rolePermsMapping);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showError("Failed to load roles and permissions data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.role_name.trim()) {
      showError("Role name is required");
      return;
    }

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
        setRoles((prev) => [...prev, createdRole]);
        showSuccess("Role created successfully");
      }

      setNewRole({ role_name: "", description: "", is_default: false });
      setRoleDialogOpen(false);
      setEditMode(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Role operation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        (editMode ? "Failed to update role" : "Failed to create role");
      showError(errorMessage);
    }
  };

  const handleUpdateRolePermissions = async (roleId, permissionIds) => {
    try {
      const permissionsData = {
        permissions: permissionIds,
        menu_permissions: permissionIds, // Adjust based on your API structure
      };

      await rolesAPI.updateRoleMenuPermissions(roleId, permissionsData);

      setRolePermissions((prev) => ({
        ...prev,
        [roleId]: permissionIds,
      }));

      // Update role permissions count
      setRoles((prev) =>
        prev.map((role) =>
          role.id === roleId
            ? { ...role, permissions_count: permissionIds.length }
            : role
        )
      );

      showSuccess("Role permissions updated successfully");
    } catch (error) {
      console.error("Update permissions error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update role permissions";
      showError(errorMessage);
    }
  };

  const handleAssignRole = async (userId, roleIds) => {
    try {
      const assignmentData = {
        user_id: userId,
        role_ids: roleIds,
      };

      await rolesAPI.assignRole(assignmentData);

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                roles: roles
                  .filter((r) => roleIds.includes(r.id))
                  .map((r) => r.role_name),
              }
            : user
        )
      );

      setAssignRoleDialogOpen(false);
      showSuccess("Roles assigned successfully");
    } catch (error) {
      console.error("Assign role error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to assign roles";
      showError(errorMessage);
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
          showSuccess("Role deleted successfully");
        } catch (error) {
          console.error("Delete role error:", error);
          const errorMessage =
            error.response?.data?.message || "Failed to delete role";
          showError(errorMessage);
        }
      },
    });
  };

  const handleMenuClick = (event, item, type) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem({ ...item, type });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const resetRoleDialog = () => {
    setNewRole({ role_name: "", description: "", is_default: false });
    setEditMode(false);
    setSelectedItem(null);
    setRoleDialogOpen(false);
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
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
          {params.value}
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
        <Typography variant="body2">{params.value || 0}</Typography>
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
          {params.value.map((role, index) => (
            <Chip key={index} label={role} size="small" color="primary" />
          ))}
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setRoleDialogOpen(true)}
          disabled={loading}
        >
          Create Role
        </Button>
      </Box>

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

              {loading ? (
                <LoadingSpinner />
              ) : (
                <DataGrid
                  rows={filteredRoles}
                  columns={rolesColumns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  autoHeight
                  sx={{
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                  }}
                />
              )}
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
                                    {permission.permission_name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={permission.action}
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
                                    {permission.description}
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

              {loading ? (
                <LoadingSpinner />
              ) : (
                <DataGrid
                  rows={filteredUsers}
                  columns={usersColumns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  autoHeight
                  sx={{
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                  }}
                />
              )}
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
        {selectedItem?.type === "role" && (
          <>
            <MenuItem
              onClick={() => {
                setPermissionDialogOpen(true);
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
                handleEditRole(selectedItem);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Role</ListItemText>
            </MenuItem>
            {!selectedItem.is_default && (
              <MenuItem
                onClick={() => {
                  handleDeleteRole(selectedItem.id);
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
        {selectedItem?.type === "user" && (
          <MenuItem
            onClick={() => {
              setSelectedUser(selectedItem);
              setUserRoles(
                roles
                  .filter((r) => selectedItem.roles.includes(r.role_name))
                  .map((r) => r.id)
              );
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
              label="Default Role (assigned to new users)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetRoleDialog}>Cancel</Button>
          <Button onClick={handleCreateRole} variant="contained">
            {editMode ? "Update Role" : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Permissions for {selectedItem?.role_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {Object.entries(groupedPermissions).map(
              ([module, modulePermissions]) => (
                <Accordion key={module} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">{module} Permissions</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup>
                      {modulePermissions.map((permission) => (
                        <FormControlLabel
                          key={permission.id}
                          control={
                            <Checkbox
                              checked={
                                rolePermissions[selectedItem?.id]?.includes(
                                  permission.id
                                ) || false
                              }
                              onChange={(e) => {
                                const currentPerms =
                                  rolePermissions[selectedItem?.id] || [];
                                const newPerms = e.target.checked
                                  ? [...currentPerms, permission.id]
                                  : currentPerms.filter(
                                      (id) => id !== permission.id
                                    );
                                setRolePermissions((prev) => ({
                                  ...prev,
                                  [selectedItem?.id]: newPerms,
                                }));
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {permission.permission_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {permission.description}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              )
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleUpdateRolePermissions(
                selectedItem?.id,
                rolePermissions[selectedItem?.id] || []
              );
              setPermissionDialogOpen(false);
            }}
            variant="contained"
          >
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Roles Dialog */}
      <Dialog
        open={assignRoleDialogOpen}
        onClose={() => setAssignRoleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Roles to {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
                      <Typography variant="body2" fontWeight="medium">
                        {role.role_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {role.description}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignRoleDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleAssignRole(selectedUser?.id, userRoles)}
            variant="contained"
          >
            Assign Roles
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagementPage;
