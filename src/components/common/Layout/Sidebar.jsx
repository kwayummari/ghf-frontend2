import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  Tooltip,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  DashboardOutlined,
  PeopleOutlined,
  EventNoteOutlined,
  AccessTimeOutlined,
  CorporateFareOutlined,
  AccountBalanceOutlined,
  FolderOutlined,
  AssessmentOutlined,
  SettingsOutlined,
  PersonOutlined,
  AccountBalanceWalletOutlined,
  InventoryOutlined,
  RequestQuoteOutlined,
  SupervisedUserCircleOutlined,
  SecurityOutlined,
  MenuOutlined,
} from "@mui/icons-material";
import {
  selectUserMenus,
  selectUser,
  selectMenuLoading,
  selectIsAuthenticated,
  getUserMenus,
} from "../../../store/slices/authSlice";

// Icon mapping for menu items
const iconMap = {
  DashboardOutlined,
  PeopleOutlined,
  EventNoteOutlined,
  AccessTimeOutlined,
  CorporateFareOutlined,
  AccountBalanceOutlined,
  FolderOutlined,
  AssessmentOutlined,
  SettingsOutlined,
  PersonOutlined,
  AccountBalanceWalletOutlined,
  InventoryOutlined,
  RequestQuoteOutlined,
  SupervisedUserCircleOutlined,
  SecurityOutlined,
  MenuOutlined,
};

const Sidebar = ({ collapsed, onItemClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenus = useSelector(selectUserMenus);
  const user = useSelector(selectUser);
  const menuLoading = useSelector(selectMenuLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Fetch menus if user is authenticated but no menus are loaded
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      (!userMenus || userMenus.length === 0) &&
      !menuLoading
    ) {
      console.log("Sidebar: User authenticated but no menus, fetching...");
      dispatch(getUserMenus());
    }
  }, [dispatch, isAuthenticated, user, userMenus, menuLoading]);

  const handleMenuClick = (menu) => {
    if (menu.children && menu.children.length > 0) {
      // Toggle submenu
      setExpandedMenus((prev) => ({
        ...prev,
        [menu.id]: !prev[menu.id],
      }));
    } else if (menu.menu_url) {
      // Navigate to route
      navigate(menu.menu_url);
      if (onItemClick) {
        onItemClick();
      }
    }
  };

  const isMenuActive = (menu) => {
    if (menu.menu_url === location.pathname) {
      return true;
    }

    // Check if any child menu is active
    if (menu.children) {
      return menu.children.some((child) => isMenuActive(child));
    }

    return false;
  };

  const getMenuIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || MenuOutlined;
    return <IconComponent />;
  };

  const renderMenuItem = (menu, level = 0) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus[menu.id];
    const isActive = isMenuActive(menu);

    return (
      <React.Fragment key={menu.id}>
        <Tooltip
          title={collapsed ? menu.menu_label : ""}
          placement="right"
          disableHoverListener={!collapsed}
        >
          <ListItemButton
            onClick={() => handleMenuClick(menu)}
            selected={isActive}
            sx={{
              minHeight: 48,
              pl: level * 2 + 2,
              pr: 2,
              ...(collapsed &&
                level === 0 && {
                  justifyContent: "center",
                  px: 2,
                }),
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
                color: isActive ? "primary.main" : "inherit",
              }}
            >
              {getMenuIcon(menu.menu_icon)}
            </ListItemIcon>

            {!collapsed && (
              <>
                <ListItemText
                  primary={menu.menu_label}
                  sx={{
                    color: isActive ? "primary.main" : "inherit",
                    "& .MuiListItemText-primary": {
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
                {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {menu.children.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const getUserDisplayName = () => {
    if (!user) return "User";

    const firstName = user.first_name || "";
    const surname = user.sur_name || "";

    if (firstName && surname) {
      return `${firstName} ${surname}`;
    }

    return user.email || "User";
  };

  const getUserInitials = () => {
    if (!user) return "U";

    const firstName = user.first_name || "";
    const surname = user.sur_name || "";

    if (firstName && surname) {
      return `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  const getUserRole = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      return "Employee";
    }

    // Get the first role name
    const role = user.roles[0];
    return typeof role === "string" ? role : role.role_name || "Employee";
  };

  // Default menu items if userMenus is empty (fallback)
  const defaultMenus = [
    {
      id: 1,
      menu_name: "dashboard",
      menu_label: "Dashboard",
      menu_icon: "DashboardOutlined",
      menu_url: "/dashboard",
      menu_order: 1,
      children: [],
    },
    {
      id: 2,
      menu_name: "employees",
      menu_label: "Employees",
      menu_icon: "PeopleOutlined",
      menu_url: "/employees",
      menu_order: 2,
      children: [],
    },
    {
      id: 3,
      menu_name: "leaves",
      menu_label: "Leaves",
      menu_icon: "EventNoteOutlined",
      menu_url: "/leaves",
      menu_order: 3,
      children: [],
    },
    {
      id: 4,
      menu_name: "attendance",
      menu_label: "Attendance",
      menu_icon: "AccessTimeOutlined",
      menu_url: "/attendance",
      menu_order: 4,
      children: [],
    },
    {
      id: 5,
      menu_name: "profile",
      menu_label: "Profile",
      menu_icon: "PersonOutlined",
      menu_url: "/profile",
      menu_order: 5,
      children: [],
    },
  ];

  // Show loading state while menus are being fetched
  const renderMenuSection = () => {
    if (menuLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 3,
          }}
        >
          <CircularProgress size={24} />
          {!collapsed && (
            <Typography variant="body2" sx={{ ml: 2 }} color="text.secondary">
              Loading menus...
            </Typography>
          )}
        </Box>
      );
    }

    const menusToRender =
      userMenus && userMenus.length > 0 ? userMenus : defaultMenus;

    return menusToRender.map((menu) => renderMenuItem(menu));
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Logo and Branding */}
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          minHeight: 64,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: collapsed ? 40 : 48,
            height: collapsed ? 40 : 48,
            fontSize: collapsed ? "1rem" : "1.25rem",
            fontWeight: "bold",
          }}
        >
          GHF
        </Avatar>

        {!collapsed && (
          <Box sx={{ ml: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              GH Foundation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Office System
            </Typography>
          </Box>
        )}
      </Box>

      {/* User Profile Section */}
      {!collapsed && user && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 40,
                height: 40,
              }}
            >
              {getUserInitials()}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {getUserDisplayName()}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {getUserRole()}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List
          component="nav"
          sx={{
            py: 1,
            "& .MuiListItemButton-root": {
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
            },
          }}
        >
          {renderMenuSection()}
        </List>
      </Box>

      {/* Footer Section */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center">
            © 2024 GH Foundation
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
