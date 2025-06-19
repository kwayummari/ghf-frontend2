import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
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
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';

const RoleManagementPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } = useConfirmDialog();

  // State management
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({ role_name: '', description: '', is_default: false });
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  // Sample data
  const sampleRoles = [
    {
      id: 1,
      role_name: 'Admin',
      description: 'System administrator with full access',
      is_default: true,
      users_count: 2,
      permissions_count: 156,
      created_at: '2024-01-01',
    },
    {
      id: 2,
      role_name: 'HR Manager',
      description: 'Human resources manager',
      is_default: false,
      users_count: 3,
      permissions_count: 45,
      created_at: '2024-01-01',
    },
    {
      id: 3,
      role_name: 'Finance Manager',
      description: 'Finance department manager',
      is_default: false,
      users_count: 2,
      permissions_count: 38,
      created_at: '2024-01-01',
    },
    {
      id: 4,
      role_name: 'Employee',
      description: 'Regular employee',
      is_default: true,
      users_count: 25,
      permissions_count: 12,
      created_at: '2024-01-01',
    },
  ];

  const samplePermissions = [
    // User Management
    { id: 1, permission_name: 'View Users', module: 'Users', action: 'read', description: 'Can view user profiles' },
    { id: 2, permission_name: 'Create Users', module: 'Users', action: 'create', description: 'Can create new users' },
    { id: 3, permission_name: 'Update Users', module: 'Users', action: 'update', description: 'Can update user information' },
    { id: 4, permission_name: 'Delete Users', module: 'Users', action: 'delete', description: 'Can delete users' },
    
    // HR Management
    { id: 5, permission_name: 'View Leaves', module: 'HR', action: 'read', description: 'Can view leave applications' },
    { id: 6, permission_name: 'Approve Leaves', module: 'HR', action: 'update', description: 'Can approve leave requests' },
    { id: 7, permission_name: 'View Attendance', module: 'HR', action: 'read', description: 'Can view attendance records' },
    { id: 8, permission_name: 'Manage Performance', module: 'HR', action: 'create', description: 'Can manage performance appraisals' },
    
    // Finance Management
    { id: 9, permission_name: 'View Payroll', module: 'Finance', action: 'read', description: 'Can view payroll information' },
    { id: 10, permission_name: 'Process Payroll', module: 'Finance', action: 'create', description: 'Can process payroll' },
    { id: 11, permission_name: 'View Budget', module: 'Finance', action: 'read', description: 'Can view budgets' },
    { id: 12, permission_name: 'Manage Budget', module: 'Finance', action: 'create', description: 'Can manage budgets' },
    
    // Procurement
    { id: 13, permission_name: 'View Suppliers', module: 'Procurement', action: 'read', description: 'Can view suppliers' },
    { id: 14, permission_name: 'Manage Suppliers', module: 'Procurement', action: 'create', description: 'Can manage suppliers' },
    { id: 15, permission_name: 'View Purchase Orders', module: 'Procurement', action: 'read', description: 'Can view purchase orders' },
    { id: 16, permission_name: 'Create Purchase Orders', module: 'Procurement', action: 'create', description: 'Can create purchase orders' },
    
    // System Settings
    { id: 17, permission_name: 'Manage Roles', module: 'Settings', action: 'create', description: 'Can manage system roles' },
    { id: 18, permission_name: 'Manage Permissions', module: 'Settings', action: 'create', description: 'Can manage permissions' },
    { id: 19, permission_name: 'System Configuration', module: 'Settings', action: 'create', description: 'Can configure system settings' },
  ];

  const sampleUsers = [
    { id: 1, name: 'John Admin', email: 'admin@ghf.org', roles: ['Admin'] },
    { id: 2, name: 'Jane HR', email: 'hr@ghf.org', roles: ['HR Manager'] },
    { id: 3, name: 'Mike Finance', email: 'finance@ghf.org', roles: ['Finance Manager'] },
    { id: 4, name: 'Sarah Employee', email: 'sarah@ghf.org', roles: ['Employee'] },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRoles(sampleRoles);
      setPermissions(samplePermissions);
      setUsers(sampleUsers);
      
      // Initialize role permissions (sample data)
      const rolePermsMapping = {
        1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // Admin - all permissions
        2: [1, 5, 6, 7, 8], // HR Manager - HR permissions
        3: [9, 10, 11, 12], // Finance Manager - Finance permissions
        4: [1, 5, 7], // Employee - basic permissions
      };
      setRolePermissions(rolePermsMapping);
    } catch (error) {
      showError('Failed to fetch roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.role_name.trim()) {
      showError('Role name is required');
      return;
    }
    
    try {
      // API call to create role
      const createdRole = {
        ...newRole,
        id: roles.length + 1,
        users_count: 0,
        permissions_count: 0,
        created_at: new Date().toISOString(),
      };
      
      setRoles([...roles, createdRole]);
      setNewRole({ role_name: '', description: '', is_default: false });
      setRoleDialogOpen(false);
      showSuccess('Role created successfully');
    } catch (error) {
      showError('Failed to create role');
    }
  };

  const handleUpdateRolePermissions = async (roleId, permissionIds) => {
    try {
      // API call to update role permissions
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: permissionIds
      }));
      
      // Update role permissions count
      setRoles(prev => prev.map(role => 
        role.id === roleId 
          ? { ...role, permissions_count: permissionIds.length }
          : role
      ));
      
      showSuccess('Role permissions updated successfully');
    } catch (error) {
      showError('Failed to update role permissions');
    }
  };

  const handleAssignRole = async (userId, roleIds) => {
    try {
      // API call to assign roles to user
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, roles: roles.filter(r => roleIds.includes(r.id)).map(r => r.role_name) }
          : user
      ));
      
      setAssignRoleDialogOpen(false);
      showSuccess('Roles assigned successfully');
    } catch (error) {
      showError('Failed to assign roles');
    }
  };

  const handleDeleteRole = async (roleId) => {
    const roleToDelete = roles.find(r => r.id === roleId);
    if (roleToDelete?.is_default) {
      showError('Cannot delete default roles');
      return;
    }
    
    openDialog({
      title: 'Delete Role',
      message: `Are you sure you want to delete the role "${roleToDelete?.role_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setRoles(prev => prev.filter(r => r.id !== roleId));
          showSuccess('Role deleted successfully');
        } catch (error) {
          showError('Failed to delete role');
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

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  const rolesColumns = [
    {
      field: 'name',
      headerName: 'User Name',
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
      field: 'roles',
      headerName: 'Assigned Roles',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value.map((role, index) => (
            <Chip key={index} label={role} size="small" color="primary" />
          ))}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row, 'user')}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const filteredRoles = roles.filter(role =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        >
          Create Role
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          sx={{ borderBottom: 1, borderColor: 'divider' }}
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
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
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
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
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
              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <Accordion key={module} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SecurityIcon color="primary" />
                      <Typography variant="h6">{module}</Typography>
                      <Chip label={`${modulePermissions.length} permissions`} size="small" />
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
                                <Typography variant="body2" fontWeight="medium">
                                  {permission.permission_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={permission.action}
                                  size="small"
                                  color={
                                    permission.action === 'create' ? 'success' :
                                    permission.action === 'update' ? 'warning' :
                                    permission.action === 'delete' ? 'error' : 'info'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
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
              ))}
            </Box>
          )}

          {activeTab === 2 && (
            // User Assignments Tab
            <>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
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
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
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
        {selectedItem?.type === 'role' && (
          <>
            <MenuItem onClick={() => {
              setPermissionDialogOpen(true);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <PermissionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Manage Permissions</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              // Edit role functionality
              handleMenuClose();
            }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Role</ListItemText>
            </MenuItem>
            {!selectedItem.is_default && (
              <MenuItem onClick={() => {
                handleDeleteRole(selectedItem.id);
                handleMenuClose();
              }} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete Role</ListItemText>
              </MenuItem>
            )}
          </>
        )}
        {selectedItem?.type === 'user' && (
          <MenuItem onClick={() => {
            setSelectedUser(selectedItem);
            setUserRoles(roles.filter(r => selectedItem.roles.includes(r.role_name)).map(r => r.id));
            setAssignRoleDialogOpen(true);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <AssignIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Assign Roles</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Create Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={newRole.role_name}
              onChange={(e) => setNewRole(prev => ({ ...prev, role_name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newRole.description}
              onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newRole.is_default}
                  onChange={(e) => setNewRole(prev => ({ ...prev, is_default: e.target.checked }))}
                />
              }
              label="Default Role (assigned to new users)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRole} variant="contained">Create Role</Button>
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
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
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
                            checked={rolePermissions[selectedItem?.id]?.includes(permission.id) || false}
                            onChange={(e) => {
                              const currentPerms = rolePermissions[selectedItem?.id] || [];
                              const newPerms = e.target.checked
                                ? [...currentPerms, permission.id]
                                : currentPerms.filter(id => id !== permission.id);
                              setRolePermissions(prev => ({
                                ...prev,
                                [selectedItem?.id]: newPerms
                              }));
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {permission.permission_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleUpdateRolePermissions(selectedItem?.id, rolePermissions[selectedItem?.id] || []);
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
        <DialogTitle>
          Assign Roles to {selectedUser?.name}
        </DialogTitle>
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
                          setUserRoles(prev => [...prev, role.id]);
                        } else {
                          setUserRoles(prev => prev.filter(id => id !== role.id));
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