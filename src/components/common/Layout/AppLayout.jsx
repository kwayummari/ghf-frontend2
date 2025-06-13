import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { getUserMenus } from "../../../store/slices/authSlice";
import { THEME_CONSTANTS } from "../../../constants";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const AppLayout = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get user menus on component mount
  useEffect(() => {
    dispatch(getUserMenus());
  }, [dispatch]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleMobileDrawerClose = () => {
    setMobileOpen(false);
  };

  const drawerWidth = sidebarCollapsed ? 80 : THEME_CONSTANTS.DRAWER_WIDTH;

  const drawer = (
    <Sidebar
      collapsed={sidebarCollapsed && !isMobile}
      onItemClick={isMobile ? handleMobileDrawerClose : undefined}
    />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Header onMenuClick={handleDrawerToggle} drawerWidth={drawerWidth} />
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { lg: drawerWidth },
          flexShrink: { lg: 0 },
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: THEME_CONSTANTS.DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: "hidden",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Toolbar spacer */}
        <Toolbar />

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "background.default",
            minHeight: `calc(100vh - ${THEME_CONSTANTS.HEADER_HEIGHT}px)`,
          }}
        >
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

export default AppLayout;
