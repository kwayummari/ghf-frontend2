import React, { useState, useEffect } from "react";
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
  MenuItem,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Checkbox,
  TreeView,
  TreeItem,
  Alert,
  InputAdornment,
  Switch,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import menusAPI from "../../../services/api/menus.api";
import rolesAPI from "../../../services/api/roles.api";
import { MENU_ICONS } from "../../../constants";

const menuSchema = Yup.object({
  menu_name: Yup.string().required("Menu name is required"),
  menu_label: Yup.string().required("Menu label is required"),
  menu_url: Yup.string(),
  menu_icon: Yup.string(),
  menu_order: Yup.number().min(0, "Order must be non-negative"),
});

const MenuManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    fetchMenus();
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await menusAPI.getAllMenus({
        include_permissions: true,
        include_roles: true,
      });
      setMenus(response.data?.hierarchy || []);
    } catch (error) {
      enqueueSnackbar("Failed to fetch menus", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAllRoles();
      setRoles(response.data || []);
    } catch (error) {
      enqueueSnackbar("Failed to fetch roles", { variant: "error" });
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await rolesAPI.getAllPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      enqueueSnackbar("Failed to fetch permissions", { variant: "error" });
    }
  };

  const formik = useFormik({
    initialValues: {
      menu_name: "",
      menu_label: "",
      menu_icon: "",
      menu_url: "",
      parent_id: "",
      menu_order: 0,
      is_active: true,
    },
    validationSchema: menuSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const menuData = {
          ...values,
          parent_id: values.parent_id || null,
          role_ids: selectedRoles,
          permission_ids: selectedPermissions,
        };

        if (editingMenu) {
          await menusAPI.updateMenu(editingMenu.id, menuData);
          enqueueSnackbar("Menu updated successfully", { variant: "success" });
        } else {
          await menusAPI.createMenu(menuData);
          enqueueSnackbar("Menu created successfully", { variant: "success" });
        }

        resetForm();
        setSelectedRoles([]);
        setSelectedPermissions([]);
        setDialogOpen(false);
        setEditingMenu(null);
        fetchMenus();
      } catch (error) {
        enqueueSnackbar(error.userMessage || "Failed to save menu", {
          variant: "error",
        });
      }
    },
  });

  const handleMenuOpen = (event, menu) => {
    setAnchorEl(event.currentTarget);
    setSelectedMenu(menu);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMenu(null);
  };

  const handleEdit = () => {
    if (selectedMenu) {
      setEditingMenu(selectedMenu);
      formik.setValues({
        menu_name: selectedMenu.menu_name,
        menu_label: selectedMenu.menu_label,
        menu_icon: selectedMenu.menu_icon || "",
        menu_url: selectedMenu.menu_url || "",
        parent_id: selectedMenu.parent_id || "",
        menu_order: selectedMenu.menu_order || 0,
        is_active: selectedMenu.is_active !== false,
      });

      setSelectedRoles(selectedMenu.roles?.map((r) => r.id) || []);
      setSelectedPermissions(selectedMenu.permissions?.map((p) => p.id) || []);

      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedMenu) {
      try {
        await menusAPI.deleteMenu(selectedMenu.id);
        enqueueSnackbar("Menu deleted successfully", { variant: "success" });
        fetchMenus();
      } catch (error) {
        enqueueSnackbar(error.userMessage || "Failed to delete menu", {
          variant: "error",
        });
      }
    }
    handleMenuClose();
  };

  const handleManageAccess = () => {
    if (selectedMenu) {
      setSelectedRoles(selectedMenu.roles?.map((r) => r.id) || []);
      setSelectedPermissions(selectedMenu.permissions?.map((p) => p.id) || []);
      setAccessDialogOpen(true);
    }
    handleMenuClose();
  };

  const saveAccess = async () => {
    try {
      await menusAPI.updateMenu(selectedMenu.id, {
        role_ids: selectedRoles,
        permission_ids: selectedPermissions,
      });
      enqueueSnackbar("Menu access updated successfully", {
        variant: "success",
      });
      setAccessDialogOpen(false);
      fetchMenus();
    } catch (error) {
      enqueueSnackbar(error.userMessage || "Failed to update access", {
        variant: "error",
      });
    }
  };

  const renderTreeItems = (menuItems) => {
    return menuItems
      .filter(
        (menu) =>
          menu.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          menu.menu_label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((menu) => (
        <TreeItem
          key={menu.id}
          nodeId={menu.id.toString()}
          label={
            <Box sx={{ display: "flex", alignItems: "center", py: 1 }}>
              <MenuIcon sx={{ mr: 2, color: "primary.main" }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
                  {menu.menu_label}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {menu.menu_name}
                  </Typography>
                  {menu.menu_url && (
                    <Chip
                      label={menu.menu_url}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {!menu.is_active && (
                    <Chip label="Inactive" size="small" color="error" />
                  )}
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`${menu.roles?.length || 0} roles`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, menu);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>
          }
        >
          {menu.children &&
            menu.children.length > 0 &&
            renderTreeItems(menu.children)}
        </TreeItem>
      ));
  };

  const getAllMenusFlat = (menuItems, result = []) => {
    menuItems.forEach((menu) => {
      result.push(menu);
      if (menu.children && menu.children.length > 0) {
        getAllMenusFlat(menu.children, result);
      }
    });
    return result;
  };

  const flatMenus = getAllMenusFlat(menus);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Menu Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure navigation menus and access control
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingMenu(null);
            formik.resetForm();
            setSelectedRoles([]);
            setSelectedPermissions([]);
            setDialogOpen(true);
          }}
        >
          Create Menu
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            placeholder="Search menus..."
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

      {/* Menu Tree */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
            Menu Structure
          </Typography>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : menus.length === 0 ? (
            <Alert severity="info">
              No menus found. Create your first menu to get started.
            </Alert>
          ) : (
            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              sx={{ flexGrow: 1, overflowY: "auto" }}
            >
              {renderTreeItems(menus)}
            </TreeView>
          )}
        </CardContent>
      </Card>

      {/* Menu Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingMenu ? "Edit Menu" : "Create New Menu"}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="menu_name"
                  label="Menu Name (System)"
                  value={formik.values.menu_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.menu_name && Boolean(formik.errors.menu_name)
                  }
                  helperText={
                    formik.touched.menu_name && formik.errors.menu_name
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="menu_label"
                  label="Menu Label (Display)"
                  value={formik.values.menu_label}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.menu_label &&
                    Boolean(formik.errors.menu_label)
                  }
                  helperText={
                    formik.touched.menu_label && formik.errors.menu_label
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="menu_icon"
                  label="Icon"
                  value={formik.values.menu_icon}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">No Icon</MenuItem>
                  {Object.entries(MENU_ICONS).map(([key, iconName]) => (
                    <MenuItem key={key} value={iconName}>
                      {key} ({iconName})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="menu_url"
                  label="URL/Route"
                  value={formik.values.menu_url}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="/example-route"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="parent_id"
                  label="Parent Menu"
                  value={formik.values.parent_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">No Parent (Root Menu)</MenuItem>
                  {flatMenus.map((menu) => (
                    <MenuItem
                      key={menu.id}
                      value={menu.id}
                      disabled={editingMenu && menu.id === editingMenu.id}
                    >
                      {menu.menu_label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="menu_order"
                  label="Display Order"
                  value={formik.values.menu_order}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.menu_order &&
                    Boolean(formik.errors.menu_order)
                  }
                  helperText={
                    formik.touched.menu_order && formik.errors.menu_order
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_active"
                      checked={formik.values.is_active}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Active"
                />
              </Grid>

              {/* Role Access */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Role Access
                </Typography>
                <Grid container spacing={1}>
                  {roles.map((role) => (
                    <Grid item xs={12} sm={6} md={4} key={role.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedRoles.includes(role.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoles([...selectedRoles, role.id]);
                              } else {
                                setSelectedRoles(
                                  selectedRoles.filter((id) => id !== role.id)
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={role.role_name}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Permission Requirements */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Required Permissions
                </Typography>
                <Grid container spacing={1}>
                  {permissions.map((permission) => (
                    <Grid item xs={12} sm={6} md={4} key={permission.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedPermissions.includes(
                              permission.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPermissions([
                                  ...selectedPermissions,
                                  permission.id,
                                ]);
                              } else {
                                setSelectedPermissions(
                                  selectedPermissions.filter(
                                    (id) => id !== permission.id
                                  )
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={permission.name}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={formik.isSubmitting}
            >
              {editingMenu ? "Update" : "Create"}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Access Management Dialog */}
      <Dialog
        open={accessDialogOpen}
        onClose={() => setAccessDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Access - {selectedMenu?.menu_label}</DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Roles
              </Typography>
              {roles.map((role) => (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      checked={selectedRoles.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, role.id]);
                        } else {
                          setSelectedRoles(
                            selectedRoles.filter((id) => id !== role.id)
                          );
                        }
                      }}
                    />
                  }
                  label={role.role_name}
                  sx={{ display: "block" }}
                />
              ))}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Permissions
              </Typography>
              {permissions.map((permission) => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPermissions([
                            ...selectedPermissions,
                            permission.id,
                          ]);
                        } else {
                          setSelectedPermissions(
                            selectedPermissions.filter(
                              (id) => id !== permission.id
                            )
                          );
                        }
                      }}
                    />
                  }
                  label={permission.name}
                  sx={{ display: "block" }}
                />
              ))}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAccessDialogOpen(false)}>Cancel</Button>
          <LoadingButton variant="contained" onClick={saveAccess}>
            Save Access
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
          <ListItemText>Edit Menu</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleManageAccess}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Access</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Menu</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MenuManagement;
