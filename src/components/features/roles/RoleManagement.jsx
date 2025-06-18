import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LoadingButton } from '@mui/lab';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Security as SecurityIcon,
  Search as SearchIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import rolesAPI from '../../../services/api/roles.api';

const roleSchema = Yup.object({
  role_name: Yup.string().required('Role name is required'),
  description: Yup.string(),
});

const RoleManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Fetch roles and permissions
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesAPI.getAllRoles({ include_permissions: true });
      setRoles(response.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch roles', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await rolesAPI.getAllPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch permissions', { variant: 'error' });
    }
  };

  const formik = useFormik({
    initialValues: {
      role_name: '',
      description: '',
      is_default: false,
    },
    validationSchema: roleSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const roleData = {
          ...values,
          permission_ids: selectedPermissions,
        };

        if (editingRole) {
          await rolesAPI.updateRole(editingRole.id, roleData);
          enqueueSnackbar('Role updated successfully', { variant: 'success' });
        } else {
          await rolesAPI.createRole(roleData);
          enqueueSnackbar('Role created successfully', { variant: 'success' });
        }

        resetForm();
        setSelectedPermissions([]);
        setDialogOpen(false);
        setEditingRole(null);
        fetchRoles();
      } catch (error) {
        enqueueSnackbar(error.userMessage || 'Failed to save role', { variant: 'error' });
      }
    },
  });

  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleEdit = () => {
    if (selectedRole) {
      setEditingRole(selectedRole);
      formik.setValues({
        role_name: selectedRole.role_name,
        description: selectedRole.description || '',
        is_default: selectedRole.is_default || false,
      });
      
      // Set selected permissions
      const rolePermissionIds = selectedRole.permissions?.map(p => p.id) || [];
      setSelectedPermissions(rolePermissionIds);
      
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedRole) {
      try {
        await rolesAPI.deleteRole(selectedRole.id);
        enqueueSnackbar('Role deleted successfully', { variant: 'success' });
        fetchRoles();
      } catch (error) {
        enqueueSnackbar(error.userMessage || 'Failed to delete role', { variant: 'error' });
      }
    }
    handleMenuClose();
  };

  const handleManagePermissions = () => {
    if (selectedRole) {
      const rolePermissionIds = selectedRole.permissions?.map(p => p.id) || [];
      setSelectedPermissions(rolePermissionIds);
      setPermissionDialogOpen(true);
    }
    handleMenuClose();
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const savePermissions = async () => {
    try {
      await rolesAPI.updateRole(selectedRole.id, {
        permission_ids: selectedPermissions,
      });
      enqueueSnackbar('Permissions updated successfully', { variant: 'success' });
      setPermissionDialogOpen(false);
      fetchRoles();
    } catch (error) {
      enqueueSnackbar(error.userMessage || 'Failed to update permissions', { variant: 'error' });
    }
  };

  const columns = [
    {
      field: 'role_name',
      headerName: 'Role Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
            {params.value}
          </Typography>
          {params.row.is_default && (
            <Chip label="Default" size="small" color="primary" variant="outlined" />
          )}
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || 'No description'}
        </Typography>
      ),
    },
    {
      field: 'permissions',
      headerName: 'Permissions',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={`${params.value?.length || 0} permissions`}
          size="small"
          color="info"
          variant="outlined"
        />
      ),
    },
    {
      field: 'users',
      headerName: 'Users',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {params.value?.length || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => 
        new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
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

  const filteredRoles = roles.filter(role =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const module = permission.module || 'General';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {});

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Role Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system roles and permissions
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingRole(null);
            formik.resetForm();
            setSelectedPermissions([]);
            setDialogOpen(true);
          }}
        >
          Create Role
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
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
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredRoles}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </Box>
      </Card>

      {/* Role Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="role_name"
                  label="Role Name"
                  value={formik.values.role_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.role_name && Boolean(formik.errors.role_name)}
                  helperText={formik.touched.role_name && formik.errors.role_name}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_default"
                      checked={formik.values.is_default}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Default Role"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              {/* Permissions Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  Permissions
                </Typography>
                
                {Object.keys(groupedPermissions).map(module => (
                  <Box key={module} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                      {module}
                    </Typography>
                    <Grid container spacing={1}>
                      {groupedPermissions[module].map(permission => (
                        <Grid item xs={12} sm={6} md={4} key={permission.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => handlePermissionChange(permission.id)}
                                size="small"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  {permission.name}
                                </Typography>
                                {permission.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {permission.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            onClick={savePermissions}
          >
            Save Permissions
          </LoadingButton>
        </DialogActions>
      </Dialog>

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
          <ListItemText>Edit Role</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleManagePermissions}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Permissions</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Role</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default RoleManagement;
            <Button onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={formik.isSubmitting}
            >
              {editingRole ? 'Update' : 'Create'}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Permissions - {selectedRole?.role_name}
        </DialogTitle>
        
        <DialogContent>
          {Object.keys(groupedPermissions).map(module => (
            <Box key={module} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                {module}
              </Typography>
              <Grid container spacing={1}>
                {groupedPermissions[module].map(permission => (
                  <Grid item xs={12} sm={6} key={permission.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">
                            {permission.name}
                          </Typography>
                          {permission.description && (
                            <Typography variant="caption" color="text.secondary">
                              {permission.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </DialogContent>
        
        <DialogActions></DialogActions>