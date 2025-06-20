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
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Collapse,
  FormControlLabel,
  Checkbox,
  Switch,
} from '@mui/material';
import { TreeView, TreeItem } from "@mui/lab";
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
  Menu as MenuIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Article as PageIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Assessment as ReportIcon,
  AccountBalance as FinanceIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ProcurementIcon,
  EventNote as EventIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  DragIndicator as DragIcon,
  Sort as SortIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Star as StarIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { menusAPI } from '../../../services/api/menus.api';
// import { rolesAPI } from '../../../services/api/roles.api';

const MenusPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

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

  // Mock data for development
  const mockMenus = [
    {
      id: 1,
      menu_name: "dashboard",
      menu_label: "Dashboard",
      menu_icon: "DashboardOutlined",
      menu_url: "/dashboard",
      parent_id: null,
      menu_order: 1,
      is_active: true,
      menu_type: "page",
      level: 0,
      has_children: false,
      roles_count: 5,
      permissions_count: 2,
      created_at: "2024-01-15",
      updated_at: "2024-06-20",
    },
    {
      id: 2,
      menu_name: "employees",
      menu_label: "Employees",
      menu_icon: "PeopleOutlined",
      menu_url: null,
      parent_id: null,
      menu_order: 2,
      is_active: true,
      menu_type: "folder",
      level: 0,
      has_children: true,
      roles_count: 3,
      permissions_count: 4,
      created_at: "2024-01-15",
      updated_at: "2024-06-20",
    },
    {
      id: 3,
      menu_name: "employees_list",
      menu_label: "Employee List",
      menu_icon: "PeopleOutlined",
      menu_url: "/employees",
      parent_id: 2,
      menu_order: 1,
      is_active: true,
      menu_type: "page",
      level: 1,
      has_children: false,
      roles_count: 3,
      permissions_count: 2,
      created_at: "2024-01-15",
      updated_at: "2024-06-20",
    },
    {
      id: 4,
      menu_name: "employees_create",
      menu_label: "Add Employee",
      menu_icon: "PersonAddOutlined",
      menu_url: "/employees/create",
      parent_id: 2,
      menu_order: 2,
      is_active: true,
      menu_type: "page",
      level: 1,
      has_children: false,
      roles_count: 2,
      permissions_count: 1,
      created_at: "2024-01-15",
      updated_at: "2024-06-20",
    },
    {
      id: 16,
      menu_name: "finance",
      menu_label: "Finance",
      menu_icon: "AccountBalanceOutlined",
      menu_url: null,
      parent_id: null,
      menu_order: 5,
      is_active: true,
      menu_type: "folder",
      level: 0,
      has_children: true,
      roles_count: 4,
      permissions_count: 8,
      created_at: "2024-01-15",
      updated_at: "2024-06-20",
    },
    {
      id: 50,
      menu_name: "budget_planning",
      menu_label: "Budget Planning",
      menu_icon: "AssessmentOutlined",
      menu_url: "/finance/budgets/planning",
      parent_id: 16,
      menu_order: 1,
      is_active: true,
      menu_type: "page",
      level: 1,
      has_children: false,
      roles_count: 2,
      permissions_count: 3,
      created_at: "2024-06-18",
      updated_at: "2024-06-20",
    },
    {
      id: 51,
      menu_name: "budget_monitoring",
      menu_label: "Budget Monitoring",
      menu_icon: "MonitorOutlined",
      menu_url: "/finance/budgets/monitoring",
      parent_id: 16,
      menu_order: 2,
      is_active: true,
      menu_type: "page",
      level: 1,
      has_children: false,
      roles_count: 3,
      permissions_count: 2,
      created_at: "2024-06-18",
      updated_at: "2024-06-20",
    },
  ];

  const mockRoles = [
    { id: 1, role_name: "Super Admin", description: "Full system access" },
    {
      id: 2,
      role_name: "HR Manager",
      description: "Human resources management",
    },
    {
      id: 3,
      role_name: "Finance Manager",
      description: "Financial operations",
    },
    { id: 4, role_name: "Employee", description: "Basic employee access" },
    {
      id: 5,
      role_name: "Department Head",
      description: "Department management",
    },
  ];

  const mockPermissions = [
    { id: 1, name: "View Dashboard", category: "Dashboard" },
    { id: 2, name: "View Employees", category: "HR" },
    { id: 3, name: "Manage Employees", category: "HR" },
    { id: 4, name: "View Budget", category: "Finance" },
    { id: 5, name: "Manage Budget", category: "Finance" },
    { id: 6, name: "View Reports", category: "Reports" },
  ];

  // Menu types
  const menuTypes = [
    {
      value: "page",
      label: "Page",
      icon: <PageIcon />,
      description: "Regular page menu item",
    },
    {
      value: "folder",
      label: "Folder",
      icon: <FolderIcon />,
      description: "Parent menu with children",
    },
    {
      value: "divider",
      label: "Divider",
      icon: <DragIcon />,
      description: "Visual separator",
    },
    {
      value: "external",
      label: "External Link",
      icon: <LinkIcon />,
      description: "External website link",
    },
  ];

  // Available icons
  const availableIcons = [
    "DashboardOutlined",
    "PeopleOutlined",
    "PersonAddOutlined",
    "AccountBalanceOutlined",
    "AssessmentOutlined",
    "MonitorOutlined",
    "InventoryOutlined",
    "ShoppingCartOutlined",
    "EventNoteOutlined",
    "SettingsOutlined",
    "SecurityOutlined",
    "ReportOutlined",
    "BusinessOutlined",
    "WorkOutlined",
    "GroupOutlined",
    "AdminPanelSettingsOutlined",
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Menus",
      value: mockMenus.length.toString(),
      subtitle: "Active menu items",
      icon: <MenuIcon />,
      color: "primary",
    },
    {
      title: "Parent Menus",
      value: mockMenus
        .filter((menu) => menu.parent_id === null)
        .length.toString(),
      subtitle: "Top-level navigation",
      icon: <FolderIcon />,
      color: "success",
    },
    {
      title: "Active Pages",
      value: mockMenus
        .filter((menu) => menu.is_active && menu.menu_type === "page")
        .length.toString(),
      subtitle: "Accessible pages",
      icon: <PageIcon />,
      color: "info",
    },
    {
      title: "Total Roles",
      value: mockRoles.length.toString(),
      subtitle: "System roles",
      icon: <SecurityIcon />,
      color: "warning",
    },
  ];

  // Build hierarchical menu tree
  const buildMenuTree = (menus, parentId = null) => {
    return menus
      .filter((menu) => menu.parent_id === parentId)
      .sort((a, b) => a.menu_order - b.menu_order)
      .map((menu) => ({
        ...menu,
        children: buildMenuTree(menus, menu.id),
      }));
  };

  const menuTree = buildMenuTree(mockMenus);

  // DataGrid columns
  const columns = [
    {
      field: "menu_info",
      headerName: "Menu",
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: params.row.level * 20 }} />
          {params.row.menu_type === "folder" ? (
            <FolderIcon color="primary" />
          ) : params.row.menu_type === "page" ? (
            <PageIcon color="action" />
          ) : (
            <LinkIcon color="secondary" />
          )}
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.menu_label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.menu_name} • Order: {params.row.menu_order}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "menu_url",
      headerName: "URL/Path",
      width: 200,
      renderCell: (params) =>
        params.value ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinkIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontFamily="monospace">
              {params.value}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            No URL (Folder)
          </Typography>
        ),
    },
    {
      field: "menu_type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => {
        const type = menuTypes.find((t) => t.value === params.value);
        return (
          <Chip
            label={type?.label || params.value}
            size="small"
            variant="outlined"
            icon={type?.icon}
          />
        );
      },
    },
    {
      field: "access_control",
      headerName: "Access Control",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="caption" display="block">
            {params.row.roles_count} Roles
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            {params.row.permissions_count} Permissions
          </Typography>
        </Box>
      ),
    },
    {
      field: "is_active",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          size="small"
          color={params.value ? "success" : "default"}
          variant="filled"
          icon={params.value ? <VisibilityIcon /> : <VisibilityOffIcon />}
        />
      ),
    },
    {
      field: "updated_at",
      headerName: "Last Updated",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
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
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            setSelectedMenu(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load menus data
  useEffect(() => {
    fetchMenus();
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await menusAPI.getAllMenus({ include_hierarchy: true });
      // setMenus(response.data || []);
      setMenus(mockMenus);
    } catch (error) {
      showError("Failed to fetch menus");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // const response = await rolesAPI.getAllRoles();
      // setRoles(response.data || []);
      setRoles(mockRoles);
    } catch (error) {
      showError("Failed to fetch roles");
    }
  };

  const fetchPermissions = async () => {
    try {
      // const response = await rolesAPI.getAllPermissions();
      // setPermissions(response.data || []);
      setPermissions(mockPermissions);
    } catch (error) {
      showError("Failed to fetch permissions");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const menuData = {
        ...formData,
        role_ids: selectedRoles,
        permission_ids: selectedPermissions,
      };

      if (editingMenu) {
        // await menusAPI.updateMenu(editingMenu.id, menuData);
        showSuccess("Menu updated successfully");
      } else {
        // await menusAPI.createMenu(menuData);
        showSuccess("Menu created successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchMenus();
    } catch (error) {
      showError("Failed to save menu");
    }
  };

  const resetForm = () => {
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
    setEditingMenu(null);
  };

  // Handle edit
  const handleEdit = (menu) => {
    setFormData({ ...menu });
    setEditingMenu(menu);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete
  const handleDelete = (menu) => {
    openDialog({
      title: "Delete Menu",
      message: `Are you sure you want to delete menu "${menu.menu_label}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // await menusAPI.deleteMenu(menu.id);
          showSuccess("Menu deleted successfully");
          fetchMenus();
        } catch (error) {
          showError("Failed to delete menu");
        }
      },
    });
    setAnchorEl(null);
  };

  // Handle permissions management
  const handleManagePermissions = (menu) => {
    setSelectedMenu(menu);
    setPermissionDialogOpen(true);
    setAnchorEl(null);
  };

  // Toggle menu status
  const handleToggleStatus = async (menu) => {
    try {
      // await menusAPI.updateMenu(menu.id, { is_active: !menu.is_active });
      showSuccess(
        `Menu ${!menu.is_active ? "activated" : "deactivated"} successfully`
      );
      fetchMenus();
    } catch (error) {
      showError("Failed to update menu status");
    }
    setAnchorEl(null);
  };

  // Filter menus
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch =
      menu.menu_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (menu.menu_url &&
        menu.menu_url.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && menu.is_active) ||
      (statusFilter === "inactive" && !menu.is_active);
    const matchesType = !typeFilter || menu.menu_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Render menu tree
  const renderTreeItem = (node) => (
    <TreeItem
      key={node.id}
      nodeId={node.id.toString()}
      label={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
          {node.menu_type === "folder" ? (
            <FolderIcon color="primary" />
          ) : (
            <PageIcon color="action" />
          )}
          <Typography variant="body2" fontWeight="medium">
            {node.menu_label}
          </Typography>
          <Chip
            label={node.menu_type}
            size="small"
            variant="outlined"
            sx={{ ml: 1 }}
          />
          {!node.is_active && (
            <Chip
              label="Inactive"
              size="small"
              color="default"
              variant="filled"
            />
          )}
        </Box>
      }
    >
      {node.children && node.children.map((child) => renderTreeItem(child))}
    </TreeItem>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Menu Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage navigation menus, permissions, and access control
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
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {menuTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  {hasPermission(PERMISSIONS.MANAGE_MENUS) && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setDialogOpen(true)}
                    >
                      Add Menu
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<SortIcon />}
                    onClick={() => {
                      /* Sort menus */
                    }}
                  >
                    Reorder
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      /* Export menus */
                    }}
                  >
                    Export
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Content Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            <Tab label="Menu List" />
            <Tab label="Menu Tree" />
            <Tab label="Permission Matrix" />
          </Tabs>

          {/* Menu List Tab */}
          {activeTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ height: 600, width: "100%" }}>
                <DataGrid
                  rows={filteredMenus}
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
            </Box>
          )}

          {/* Menu Tree Tab */}
          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Navigation Structure
              </Typography>
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                expanded={expandedNodes}
                onNodeToggle={(event, nodeIds) => setExpandedNodes(nodeIds)}
              >
                {menuTree.map((node) => renderTreeItem(node))}
              </TreeView>
            </Box>
          )}

          {/* Permission Matrix Tab */}
          {activeTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Menu-Role Permission Matrix
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Menu</TableCell>
                      {mockRoles.map((role) => (
                        <TableCell key={role.id} align="center">
                          {role.role_name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMenus.slice(0, 10).map((menu) => (
                      <TableRow key={menu.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {menu.menu_type === "folder" ? (
                              <FolderIcon fontSize="small" />
                            ) : (
                              <PageIcon fontSize="small" />
                            )}
                            <Typography variant="body2">
                              {menu.menu_label}
                            </Typography>
                          </Box>
                        </TableCell>
                        {mockRoles.map((role) => (
                          <TableCell key={role.id} align="center">
                            <Checkbox
                              size="small"
                              defaultChecked={Math.random() > 0.5} // Mock permissions
                              onChange={() => {
                                /* Handle permission change */
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
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
        {hasPermission(PERMISSIONS.MANAGE_MENUS) && (
          <MenuItem onClick={() => handleEdit(selectedMenu)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Menu</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleManagePermissions(selectedMenu)}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Permissions</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleToggleStatus(selectedMenu)}>
          <ListItemIcon>
            {selectedMenu?.is_active ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedMenu?.is_active ? "Deactivate" : "Activate"}
          </ListItemText>
        </MenuItem>
        <Divider />
        {hasPermission(PERMISSIONS.MANAGE_MENUS) && (
          <MenuItem
            onClick={() => handleDelete(selectedMenu)}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Menu</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Add/Edit Menu Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingMenu ? "Edit Menu" : "Add New Menu"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "bold" }}
              >
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Menu Name *"
                value={formData.menu_name}
                onChange={(e) =>
                  setFormData({ ...formData, menu_name: e.target.value })
                }
                placeholder="e.g., dashboard, employees_list"
                helperText="Unique identifier for the menu (lowercase, underscore separated)"
                required
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
                placeholder="e.g., Dashboard, Employee List"
                helperText="Display name shown in navigation"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Menu Type *</InputLabel>
                <Select
                  value={formData.menu_type}
                  onChange={(e) =>
                    setFormData({ ...formData, menu_type: e.target.value })
                  }
                  label="Menu Type *"
                  required
                >
                  {menuTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {type.icon}
                        <Box>
                          <Typography variant="body2">{type.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                >
                  <MenuItem value="">
                    <em>None (Top Level)</em>
                  </MenuItem>
                  {menus
                    .filter(
                      (menu) =>
                        menu.menu_type === "folder" &&
                        menu.id !== editingMenu?.id
                    )
                    .map((menu) => (
                      <MenuItem key={menu.id} value={menu.id}>
                        {menu.menu_label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            {/* URL and Navigation */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, mt: 2, fontWeight: "bold" }}
              >
                URL and Navigation
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Menu URL"
                value={formData.menu_url}
                onChange={(e) =>
                  setFormData({ ...formData, menu_url: e.target.value })
                }
                placeholder="/dashboard, /employees, /finance/budgets"
                helperText="Route path (leave empty for folders)"
                disabled={formData.menu_type === "folder"}
                InputProps={{
                  startAdornment: formData.menu_url && (
                    <InputAdornment position="start">
                      <LinkIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
                helperText="Display order"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select
                  value={formData.menu_icon}
                  onChange={(e) =>
                    setFormData({ ...formData, menu_icon: e.target.value })
                  }
                  label="Icon"
                >
                  <MenuItem value="">
                    <em>No Icon</em>
                  </MenuItem>
                  {availableIcons.map((icon) => (
                    <MenuItem key={icon} value={icon}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CodeIcon fontSize="small" />
                        <Typography variant="body2">{icon}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
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

            {/* Settings */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, mt: 2, fontWeight: "bold" }}
              >
                Settings
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="CSS Class"
                value={formData.css_class}
                onChange={(e) =>
                  setFormData({ ...formData, css_class: e.target.value })
                }
                placeholder="custom-menu-class"
                helperText="Optional CSS class for styling"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
                placeholder="Brief description of this menu item..."
              />
            </Grid>

            {/* Role and Permission Assignment */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, mt: 2, fontWeight: "bold" }}
              >
                Access Control
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Assign Roles
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                }}
              >
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
                    label={
                      <Box>
                        <Typography variant="body2">
                          {role.role_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ display: "block", mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Assign Permissions
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                }}
              >
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
                    label={
                      <Box>
                        <Typography variant="body2">
                          {permission.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {permission.category}
                        </Typography>
                      </Box>
                    }
                    sx={{ display: "block", mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMenu ? "Update Menu" : "Create Menu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Menu Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Menu Details - {selectedMenu?.menu_label}</DialogTitle>
        <DialogContent>
          {selectedMenu && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Menu Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMenu.menu_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Menu Type
                  </Typography>
                  <Chip
                    label={
                      menuTypes.find((t) => t.value === selectedMenu.menu_type)
                        ?.label
                    }
                    size="small"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    URL
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mb: 2 }}
                    fontFamily="monospace"
                  >
                    {selectedMenu.menu_url || "No URL (Folder)"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedMenu.is_active ? "Active" : "Inactive"}
                    size="small"
                    color={selectedMenu.is_active ? "success" : "default"}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Order
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMenu.menu_order}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Level
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMenu.level}{" "}
                    {selectedMenu.level === 0 ? "(Top Level)" : "(Sub Menu)"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Access Control
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Chip
                      label={`${selectedMenu.roles_count} Roles`}
                      size="small"
                      icon={<SecurityIcon />}
                      variant="outlined"
                    />
                    <Chip
                      label={`${selectedMenu.permissions_count} Permissions`}
                      size="small"
                      icon={<LockIcon />}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {hasPermission(PERMISSIONS.MANAGE_MENUS) && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                handleEdit(selectedMenu);
              }}
            >
              Edit Menu
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Manage Permissions - {selectedMenu?.menu_label}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure which roles and permissions can access this menu item.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Role Access
              </Typography>
              <List>
                {roles.map((role) => (
                  <ListItem key={role.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <SecurityIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <MUIListItemText
                      primary={role.role_name}
                      secondary={role.description}
                    />
                    <Switch
                      defaultChecked={Math.random() > 0.5} // Mock data
                      onChange={() => {
                        /* Handle role permission change */
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Permission Requirements
              </Typography>
              <List>
                {permissions.map((permission) => (
                  <ListItem key={permission.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "secondary.main" }}>
                        <LockIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <MUIListItemText
                      primary={permission.name}
                      secondary={permission.category}
                    />
                    <Switch
                      defaultChecked={Math.random() > 0.5} // Mock data
                      onChange={() => {
                        /* Handle permission requirement change */
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setPermissionDialogOpen(false);
              showSuccess("Menu permissions updated successfully");
            }}
          >
            Save Permissions
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
  );
};

export default MenusPage;