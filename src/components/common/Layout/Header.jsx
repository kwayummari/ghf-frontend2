import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Menu as MenuIcon,
  NotificationsOutlined,
  AccountCircleOutlined,
  SettingsOutlined,
  LogoutOutlined,
  Brightness4Outlined,
  Brightness7Outlined,
} from "@mui/icons-material";
import { selectUser, logoutUser } from "../../../store/slices/authSlice";
import { useTheme as useCustomTheme } from "../../ui/theme/ThemeProvider";
import { ROUTES } from "../../../constants";

const Header = ({ onMenuClick, drawerWidth }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { isDarkMode, toggleTheme } = useCustomTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await dispatch(logoutUser());
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate(ROUTES.PROFILE);
  };

  const handleSettingsClick = () => {
    handleProfileMenuClose();
    navigate(ROUTES.SETTINGS);
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

  const isMenuOpen = Boolean(anchorEl);
  const isNotificationOpen = Boolean(notificationAnchor);

  return (
    <Toolbar>
      {/* Menu Toggle Button */}
      <IconButton
        color="inherit"
        aria-label="toggle drawer"
        edge="start"
        onClick={onMenuClick}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>

      {/* App Title - Hidden on mobile when drawer is open */}
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{
          flexGrow: 1,
          display: { xs: "none", sm: "block" },
        }}
      >
        GHF Office System
      </Typography>

      <Box sx={{ flexGrow: 1 }} />

      {/* Right side actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Theme Toggle */}
        <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
          <IconButton color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <Brightness7Outlined /> : <Brightness4Outlined />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            aria-label="show notifications"
          >
            <Badge badgeContent={4} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Profile */}
        <Tooltip title="Account">
          <IconButton
            onClick={handleProfileMenuOpen}
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "secondary.main",
                fontSize: "0.875rem",
              }}
            >
              {getUserInitials()}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" noWrap>
            {getUserDisplayName()}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        {/* Menu Items */}
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <AccountCircleOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <Divider />

        {/* Theme Toggle in Menu */}
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                size="small"
              />
            }
            label="Dark Mode"
            sx={{ ml: 0 }}
          />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isNotificationOpen}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />

        {/* Sample notifications - replace with actual data */}
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box>
            <Typography variant="body2">
              New leave request from John Doe
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 minutes ago
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem onClick={handleNotificationMenuClose}>
          <Box>
            <Typography variant="body2">Attendance report is ready</Typography>
            <Typography variant="caption" color="text.secondary">
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem onClick={handleNotificationMenuClose}>
          <Box>
            <Typography variant="body2">Budget approval required</Typography>
            <Typography variant="caption" color="text.secondary">
              3 hours ago
            </Typography>
          </Box>
        </MenuItem>

        <Divider />
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ textAlign: "center", width: "100%" }}
          >
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Toolbar>
  );
};

export default Header;
