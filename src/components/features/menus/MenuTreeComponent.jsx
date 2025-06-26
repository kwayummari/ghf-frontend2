import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Card,
  CardContent,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  Container,
  Breadcrumbs,
  Link,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Article as PageIcon,
  Link as LinkIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  AccountTree as TreeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AccountBalance as FinanceIcon,
  Assessment as ReportsIcon,
  Menu as MenuIconMui,
  Home as HomeIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ProcurementIcon,
  EventNote as EventIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
} from "@mui/icons-material";

// Import your actual API services
import menusAPI from "../../../services/api/menus.api";
import rolesAPI from "../../../services/api/roles.api";
import useNotification from "../../../hooks/common/useNotification";

const iconOptions = [
  { value: "DashboardOutlined", label: "Dashboard", icon: <DashboardIcon /> },
  { value: "PeopleOutlined", label: "People", icon: <PeopleIcon /> },
  { value: "PersonAddOutlined", label: "Person Add", icon: <PeopleIcon /> },
  {
    value: "AssignmentOutlined",
    label: "Assignment",
    icon: <AssignmentIcon />,
  },
  { value: "AccountBalanceOutlined", label: "Finance", icon: <FinanceIcon /> },
  {
    value: "AccountBalanceWalletOutlined",
    label: "Wallet",
    icon: <FinanceIcon />,
  },
  { value: "AssessmentOutlined", label: "Reports", icon: <ReportsIcon /> },
  { value: "SettingsOutlined", label: "Settings", icon: <SettingsIcon /> },
  { value: "MenuOutlined", label: "Menu", icon: <MenuIconMui /> },
  { value: "HomeOutlined", label: "Home", icon: <HomeIcon /> },
  { value: "BusinessOutlined", label: "Business", icon: <BusinessIcon /> },
  { value: "InventoryOutlined", label: "Inventory", icon: <InventoryIcon /> },
  {
    value: "ShoppingCartOutlined",
    label: "Procurement",
    icon: <ProcurementIcon />,
  },
  { value: "EventNoteOutlined", label: "Events", icon: <EventIcon /> },
  { value: "SecurityOutlined", label: "Security", icon: <SecurityIcon /> },
];

const MenuTreeComponent = ({
  menus = [],
  onMenuAction,
  searchTerm = "",
  onSearchChange,
}) => {
  const { showSuccess, showError, showWarning } = useNotification();

  // State management
  const [expandedNodes, setExpandedNodes] = useState(new Set(["root"]));
  const [showInactive, setShowInactive] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [parentMenus, setParentMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    menu_name: "",
    menu_label: "",
    menu_icon: "",
    menu_url: "",
    parent_id: null,
    menu_order: 0,
    is_active: true,
    description: "",
    menu_type: "page",
    external_url: false,
    target: "_self",
    css_class: "",
    requires_auth: true,
  });

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Build hierarchical tree structure from flat menu array
  const buildMenuTree = useMemo(() => {
    console.log("Building tree from menus:", menus.length);

    if (!Array.isArray(menus) || menus.length === 0) {
      return [];
    }

    // Create a map for quick lookup
    const menuMap = new Map();
    menus.forEach((menu) => {
      menuMap.set(menu.id, {
        ...menu,
        children: [],
        level: 0,
      });
    });

    // Build the tree structure
    const rootMenus = [];

    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id);

      if (menu.parent_id === null || menu.parent_id === undefined) {
        menuNode.level = 0;
        rootMenus.push(menuNode);
      } else {
        const parent = menuMap.get(menu.parent_id);
        if (parent) {
          menuNode.level = parent.level + 1;
          parent.children.push(menuNode);
        } else {
          console.warn(
            `Menu "${menu.menu_label}" has parent_id ${menu.parent_id} but parent not found`
          );
          menuNode.level = 0;
          rootMenus.push(menuNode);
        }
      }
    });

    // Sort menus by menu_order at each level
    const sortMenus = (menuList) => {
      return menuList
        .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0))
        .map((menu) => ({
          ...menu,
          children: sortMenus(menu.children),
        }));
    };

    const sortedTree = sortMenus(rootMenus);
    console.log("Built tree structure:", sortedTree.length, "root menus");
    return sortedTree;
  }, [menus]);

  // Filter tree based on search and active status
  const filteredTree = useMemo(() => {
    if (!searchTerm && showInactive) {
      return buildMenuTree;
    }

    const filterNode = (node) => {
      const matchesSearch =
        !searchTerm ||
        node.menu_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.menu_url &&
          node.menu_url.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = showInactive || node.is_active;

      const filteredChildren = node.children
        .map((child) => filterNode(child))
        .filter((child) => child !== null);

      if ((matchesSearch && matchesStatus) || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    };

    return buildMenuTree
      .map((node) => filterNode(node))
      .filter((node) => node !== null);
  }, [buildMenuTree, searchTerm, showInactive]);

  // Fetch parent menus for dropdown
  const fetchParentMenus = async () => {
    try {
      setLoading(true);
      console.log("Fetching parent menus...");

      const response = await menusAPI.getAllMenus({
        include_permissions: false,
        include_roles: false,
      });

      if (response.success) {
        let allMenus = [];

        // Handle different response formats
        if (response.data?.flat) {
          allMenus = response.data.flat;
        } else if (response.data?.hierarchy) {
          // Flatten the hierarchy
          const flattenHierarchy = (hierarchicalMenus) => {
            const flattened = [];
            hierarchicalMenus.forEach((menu) => {
              flattened.push(menu);
              if (menu.children && menu.children.length > 0) {
                flattened.push(...flattenHierarchy(menu.children));
              }
            });
            return flattened;
          };
          allMenus = flattenHierarchy(response.data.hierarchy);
        } else if (Array.isArray(response.data)) {
          allMenus = response.data;
        }

        // Filter to only show parent-eligible menus
        const eligibleParents = allMenus.filter((menu) => {
          // Don't show the current editing menu as a potential parent
          if (editingMenu && menu.id === editingMenu.id) return false;

          // Don't show deep nested menus as parents (optional business rule)
          const menuLevel = getMenuLevel(menu.id, allMenus);
          return menuLevel < 2; // Allow only 2 levels deep
        });

        console.log("Eligible parent menus:", eligibleParents.length);
        setParentMenus(eligibleParents);
      } else {
        throw new Error(response.message || "Failed to fetch parent menus");
      }
    } catch (error) {
      console.error("Error fetching parent menus:", error);
      showError("Failed to fetch parent menus");
      setParentMenus([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles and permissions
  const fetchRolesAndPermissions = async () => {
    try {
      console.log("Fetching roles and permissions...");

      const [rolesResponse, permissionsResponse] = await Promise.all([
        rolesAPI.getAllRoles(),
        rolesAPI.getAllPermissions(),
      ]);

      if (rolesResponse.success) {
        setRoles(rolesResponse.data || []);
        console.log("Roles loaded:", rolesResponse.data?.length || 0);
      }

      if (permissionsResponse.success) {
        setPermissions(
          Array.isArray(permissionsResponse.data)
            ? permissionsResponse.data
            : []
        );
        console.log(
          "Permissions loaded:",
          permissionsResponse.data?.length || 0
        );
      }
    } catch (error) {
      console.error("Error fetching roles and permissions:", error);
      showError("Failed to fetch roles and permissions");
    }
  };

  // Helper function to get menu level
  const getMenuLevel = (menuId, menuList) => {
    const menu = menuList.find((m) => m.id === menuId);
    if (!menu || !menu.parent_id) return 0;
    return 1 + getMenuLevel(menu.parent_id, menuList);
  };

  // Load data when form opens
  useEffect(() => {
    if (showCreateForm) {
      fetchParentMenus();
      fetchRolesAndPermissions();
    }
  }, [showCreateForm, editingMenu]);

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Expand all nodes
  const expandAll = () => {
    const allNodeIds = new Set(["root"]);
    const addNodeIds = (nodes) => {
      nodes.forEach((node) => {
        allNodeIds.add(node.id.toString());
        if (node.children.length > 0) {
          addNodeIds(node.children);
        }
      });
    };
    addNodeIds(filteredTree);
    setExpandedNodes(allNodeIds);
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedNodes(new Set(["root"]));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.menu_name.trim()) {
      showWarning("Menu name is required");
      return;
    }
    if (!formData.menu_label.trim()) {
      showWarning("Menu label is required");
      return;
    }

    try {
      setSaving(true);

      const menuData = {
        ...formData,
        parent_id: formData.parent_id || null,
        menu_order: parseInt(formData.menu_order) || 0,
        role_ids: selectedRoles,
        permission_ids: selectedPermissions,
      };

      console.log("Submitting menu data:", menuData);

      let response;
      if (editingMenu) {
        // Update existing menu
        response = await menusAPI.updateMenu(editingMenu.id, menuData);
        console.log("Update response:", response);
      } else {
        // Create new menu
        response = await menusAPI.createMenu(menuData);
        console.log("Create response:", response);
      }

      if (response.success) {
        showSuccess(
          editingMenu
            ? "Menu updated successfully"
            : "Menu created successfully"
        );

        // Reset form and close
        handleCancel();

        // Notify parent component to refresh
        onMenuAction?.(
          editingMenu,
          editingMenu ? "updated" : "created",
          response.data
        );
      } else {
        throw new Error(response.message || "Failed to save menu");
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      showError(error.userMessage || error.message || "Failed to save menu");
    } finally {
      setSaving(false);
    }
  };

  // Handle form cancel
  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingMenu(null);
    setFormData({
      menu_name: "",
      menu_label: "",
      menu_icon: "",
      menu_url: "",
      parent_id: null,
      menu_order: 0,
      is_active: true,
      description: "",
      menu_type: "page",
      external_url: false,
      target: "_self",
      css_class: "",
      requires_auth: true,
    });
    setSelectedRoles([]);
    setSelectedPermissions([]);
  };

  // Handle menu actions
  const handleMenuActionInternal = (menu, action, event) => {
    switch (action) {
      case "create":
        console.log("Creating new menu");
        setEditingMenu(null);
        setFormData({
          menu_name: "",
          menu_label: "",
          menu_icon: "",
          menu_url: "",
          parent_id: null,
          menu_order: 0,
          is_active: true,
          description: "",
          menu_type: "page",
          external_url: false,
          target: "_self",
          css_class: "",
          requires_auth: true,
        });
        setSelectedRoles([]);
        setSelectedPermissions([]);
        setShowCreateForm(true);
        break;
      case "edit":
        console.log("Editing menu:", menu);
        setEditingMenu(menu);
        setFormData({
          menu_name: menu.menu_name,
          menu_label: menu.menu_label,
          menu_icon: menu.menu_icon || "",
          menu_url: menu.menu_url || "",
          parent_id: menu.parent_id,
          menu_order: menu.menu_order || 0,
          is_active: menu.is_active,
          description: menu.description || "",
          menu_type: menu.menu_type || "page",
          external_url: menu.external_url || false,
          target: menu.target || "_self",
          css_class: menu.css_class || "",
          requires_auth: menu.requires_auth !== false,
        });
        // Set selected roles and permissions
        setSelectedRoles(menu.roles?.map((role) => role.id) || []);
        setSelectedPermissions(
          menu.permissions?.map((permission) => permission.id) || []
        );
        setShowCreateForm(true);
        break;
      case "toggle-status":
        handleToggleStatus(menu);
        break;
      default:
        onMenuAction?.(menu, action, event);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (menu) => {
    try {
      console.log("Toggling menu status:", menu.id, !menu.is_active);

      const response = await menusAPI.updateMenu(menu.id, {
        is_active: !menu.is_active,
      });

      if (response.success) {
        showSuccess(
          `Menu ${!menu.is_active ? "activated" : "deactivated"} successfully`
        );

        // Notify parent component to refresh
        onMenuAction?.(menu, "status-toggled", response.data);
      } else {
        throw new Error(response.message || "Failed to update menu status");
      }
    } catch (error) {
      console.error("Error updating menu status:", error);
      showError(
        error.userMessage || error.message || "Failed to update menu status"
      );
    }
  };

  // Get menu statistics
  const getStats = () => {
    const flatMenus = [];
    const flatten = (nodes) => {
      nodes.forEach((node) => {
        flatMenus.push(node);
        flatten(node.children);
      });
    };
    flatten(buildMenuTree);

    return {
      total: flatMenus.length,
      active: flatMenus.filter((m) => m.is_active).length,
      parents: flatMenus.filter((m) => m.children.length > 0).length,
      pages: flatMenus.filter((m) => m.children.length === 0).length,
    };
  };

  const stats = getStats();

  // Render individual menu node
  const renderMenuNode = (node, depth = 0) => {
    const nodeId = node.id.toString();
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;

    const getMenuIcon = () => {
      if (hasChildren) {
        return isExpanded ? <FolderOpenIcon /> : <FolderIcon />;
      }
      if (node.menu_url) {
        return node.menu_url.startsWith("http") ? <LinkIcon /> : <PageIcon />;
      }
      return <PageIcon />;
    };

    const getColorScheme = () => {
      if (!node.is_active)
        return { color: "text.disabled", bgcolor: "action.disabledBackground" };
      if (hasChildren) return { color: "primary.light", bgcolor: "#ffffff" };
      return { color: "text.primary", bgcolor: "background.paper" };
    };

    const colorScheme = getColorScheme();

    return (
      <Box key={node.id}>
        <ListItem
          sx={{
            pl: 2 + depth * 3,
            py: 0.5,
            borderRadius: 1,
            mb: 0.5,
            bgcolor: colorScheme.bgcolor,
            "&:hover": {
              bgcolor: "action.hover",
              transform: "translateX(4px)",
              transition: "all 0.2s ease-in-out",
            },
            border: 1,
            borderColor: "divider",
            opacity: node.is_active ? 1 : 0.6,
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={() => toggleNode(nodeId)}
                sx={{ p: 0.5 }}
              >
                {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </IconButton>
            ) : (
              <Box
                sx={{ width: 24, display: "flex", justifyContent: "center" }}
              >
                <DragIcon sx={{ fontSize: 16, color: "text.disabled" }} />
              </Box>
            )}
          </ListItemIcon>

          <ListItemIcon sx={{ minWidth: 40, color: colorScheme.color }}>
            {getMenuIcon()}
          </ListItemIcon>

          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: hasChildren ? "bold" : "medium",
                    color: colorScheme.color,
                  }}
                >
                  {node.menu_label}
                </Typography>

                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {!node.is_active && (
                    <Chip
                      label="Inactive"
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ height: 16, fontSize: "0.6rem" }}
                    />
                  )}

                  {hasChildren && (
                    <Badge badgeContent={node.children.length} color="primary">
                      <Chip
                        label="Folder"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 16, fontSize: "0.6rem" }}
                      />
                    </Badge>
                  )}

                  <Chip
                    label={`#${node.menu_order || 0}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 16, fontSize: "0.6rem" }}
                  />
                </Box>
              </Box>
            }
            secondary={
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {node.menu_name}
                </Typography>
                {node.menu_url && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {" "}
                      •{" "}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="primary.main"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {node.menu_url}
                    </Typography>
                  </>
                )}
                {hasChildren && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {" "}
                      •{" "}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {node.children.length} submenu
                      {node.children.length !== 1 ? "s" : ""}
                    </Typography>
                  </>
                )}
              </Box>
            }
          />

          <ListItemSecondaryAction>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title={node.is_active ? "Deactivate" : "Activate"}>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleMenuActionInternal(node, "toggle-status")
                  }
                  sx={{
                    color: node.is_active ? "success.main" : "text.disabled",
                  }}
                >
                  {node.is_active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Edit Menu">
                <IconButton
                  size="small"
                  onClick={() => handleMenuActionInternal(node, "edit")}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="More Actions">
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuActionInternal(node, "menu", e)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {node.children.map((child) => renderMenuNode(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  // If showing create form, render full page form
  if (showCreateForm) {
    return (
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton edge="start" onClick={handleCancel} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {editingMenu
                ? `Edit Menu: ${editingMenu.menu_label}`
                : "Create New Menu"}
            </Typography>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSubmit}
              disabled={saving}
              sx={{ mr: 1 }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          </Toolbar>
        </AppBar>

        {/* Breadcrumbs */}
        <Box
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Container maxWidth="lg">
            <Breadcrumbs>
              <Link
                color="inherit"
                onClick={handleCancel}
                sx={{ cursor: "pointer" }}
              >
                Menu Management
              </Link>
              <Typography color="text.primary">
                {editingMenu ? "Edit Menu" : "Create Menu"}
              </Typography>
            </Breadcrumbs>
          </Container>
        </Box>

        {/* Form Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 3,
            bgcolor: "background.default",
          }}
        >
          <Container maxWidth="lg">
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
                {editingMenu
                  ? `Edit Menu: ${editingMenu.menu_label}`
                  : "Create New Menu"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                {editingMenu
                  ? "Update the menu details below."
                  : "Fill in the details to create a new menu item."}
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Menu Name *"
                      value={formData.menu_name}
                      onChange={(e) =>
                        setFormData({ ...formData, menu_name: e.target.value })
                      }
                      required
                      helperText="Unique identifier (e.g., dashboard, employees_list)"
                      error={!formData.menu_name.trim()}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Menu Label *"
                      value={formData.menu_label}
                      onChange={(e) =>
                        setFormData({ ...formData, menu_label: e.target.value })
                      }
                      required
                      helperText="Display name shown in navigation"
                      error={!formData.menu_label.trim()}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Menu Icon</InputLabel>
                      <Select
                        value={formData.menu_icon}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            menu_icon: e.target.value,
                          })
                        }
                        label="Menu Icon"
                      >
                        <MenuItem value="">
                          <em>No Icon</em>
                        </MenuItem>
                        {iconOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {option.icon}
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Menu URL"
                      value={formData.menu_url}
                      onChange={(e) =>
                        setFormData({ ...formData, menu_url: e.target.value })
                      }
                      helperText="Route path (e.g., /dashboard, /employees)"
                      placeholder="/dashboard"
                    />
                  </Grid>

                  {/* Hierarchy */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Menu Hierarchy
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Parent Menu</InputLabel>
                      <Select
                        value={formData.parent_id || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parent_id: e.target.value || null,
                          })
                        }
                        label="Parent Menu"
                        disabled={loading}
                      >
                        <MenuItem value="">
                          <em>None (Top Level)</em>
                        </MenuItem>
                        {parentMenus.map((menu) => (
                          <MenuItem key={menu.id} value={menu.id}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <FolderIcon fontSize="small" />
                              {menu.menu_label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {loading && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <CircularProgress size={16} />
                          <Typography variant="caption" color="text.secondary">
                            Loading parent menus...
                          </Typography>
                        </Box>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Menu Order"
                      type="number"
                      value={formData.menu_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          menu_order: parseInt(e.target.value) || 0,
                        })
                      }
                      helperText="Display order (lower numbers appear first)"
                    />
                  </Grid>

                  {/* Menu Type */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Menu Type</InputLabel>
                      <Select
                        value={formData.menu_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            menu_type: e.target.value,
                          })
                        }
                        label="Menu Type"
                      >
                        <MenuItem value="page">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <PageIcon />
                            Page
                          </Box>
                        </MenuItem>
                        <MenuItem value="folder">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <FolderIcon />
                            Folder
                          </Box>
                        </MenuItem>
                        <MenuItem value="external">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LinkIcon />
                            External Link
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Target</InputLabel>
                      <Select
                        value={formData.target}
                        onChange={(e) =>
                          setFormData({ ...formData, target: e.target.value })
                        }
                        label="Target"
                      >
                        <MenuItem value="_self">Same Window</MenuItem>
                        <MenuItem value="_blank">New Window</MenuItem>
                        <MenuItem value="_parent">Parent Frame</MenuItem>
                        <MenuItem value="_top">Top Frame</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Additional Fields */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Additional Settings
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CSS Class"
                      value={formData.css_class}
                      onChange={(e) =>
                        setFormData({ ...formData, css_class: e.target.value })
                      }
                      helperText="Optional CSS class for styling"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
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
                        label="Active"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.requires_auth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                requires_auth: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Requires Authentication"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.external_url}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                external_url: e.target.checked,
                              })
                            }
                          />
                        }
                        label="External URL"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      multiline
                      rows={3}
                      helperText="Optional description of this menu item"
                    />
                  </Grid>

                  {/* Role and Permission Assignment */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Access Control
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Assign Roles
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 300,
                        overflow: "auto",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      {roles.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Loading roles...
                        </Typography>
                      ) : (
                        roles.map((role) => (
                          <FormControlLabel
                            key={role.id}
                            control={
                              <Switch
                                checked={selectedRoles.includes(role.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRoles([
                                      ...selectedRoles,
                                      role.id,
                                    ]);
                                  } else {
                                    setSelectedRoles(
                                      selectedRoles.filter(
                                        (id) => id !== role.id
                                      )
                                    );
                                  }
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  {role.role_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {role.description}
                                </Typography>
                              </Box>
                            }
                            sx={{ display: "block", mb: 1 }}
                          />
                        ))
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Assign Permissions
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 300,
                        overflow: "auto",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      {permissions.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Loading permissions...
                        </Typography>
                      ) : (
                        permissions.map((permission) => (
                          <FormControlLabel
                            key={permission.id}
                            control={
                              <Switch
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
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  {permission.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {permission.category}
                                </Typography>
                              </Box>
                            }
                            sx={{ display: "block", mb: 1 }}
                          />
                        ))
                      )}
                    </Box>
                  </Grid>

                  {/* Summary */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Summary
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Menu:</strong>{" "}
                            {formData.menu_label || "Untitled"} (
                            {formData.menu_name || "unnamed"})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>URL:</strong>{" "}
                            {formData.menu_url || "No URL"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Type:</strong> {formData.menu_type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Parent:</strong>{" "}
                            {formData.parent_id
                              ? parentMenus.find(
                                  (m) => m.id === formData.parent_id
                                )?.menu_label || "Unknown"
                              : "Top Level"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Status:</strong>{" "}
                            {formData.is_active ? "Active" : "Inactive"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Order:</strong> {formData.menu_order}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Roles:</strong> {selectedRoles.length}{" "}
                            selected
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Permissions:</strong>{" "}
                            {selectedPermissions.length} selected
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Container>
        </Box>
      </Box>
    );
  }

  // Default tree view
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TreeIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Navigation Structure
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              onClick={expandAll}
              startIcon={<ExpandMoreIcon />}
            >
              Expand All
            </Button>
            <Button
              size="small"
              onClick={collapseAll}
              startIcon={<ChevronRightIcon />}
            >
              Collapse All
            </Button>
          </Box>
        </Box>

        {/* Controls */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />

          {/* Show inactive toggle */}
          <Button
            size="small"
            variant={showInactive ? "contained" : "outlined"}
            onClick={() => setShowInactive(!showInactive)}
            startIcon={
              showInactive ? <VisibilityIcon /> : <VisibilityOffIcon />
            }
          >
            {showInactive ? "Hide" : "Show"} Inactive
          </Button>

          {/* Add Menu button - beside Hide Inactive button */}
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleMenuActionInternal(null, "create")}
          >
            Add Menu
          </Button>
        </Box>

        {/* Statistics */}
        <Box
          sx={{ mb: 2, p: 1.5, bgcolor: "background.default", borderRadius: 1 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Tree Statistics
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Typography variant="caption">
              <strong>{stats.total}</strong> Total Menus
            </Typography>
            <Typography variant="caption">
              <strong>{stats.active}</strong> Active
            </Typography>
            <Typography variant="caption">
              <strong>{stats.parents}</strong> Parent Menus
            </Typography>
            <Typography variant="caption">
              <strong>{stats.pages}</strong> Pages/Links
            </Typography>
          </Box>
        </Box>

        {/* Tree Content */}
        <Box sx={{ maxHeight: 600, overflow: "auto" }}>
          {filteredTree.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {searchTerm
                ? `No menus found matching "${searchTerm}"`
                : "No menus available. Create your first menu to get started."}
            </Alert>
          ) : (
            <List disablePadding>
              {filteredTree.map((node) => renderMenuNode(node, 0))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MenuTreeComponent;
