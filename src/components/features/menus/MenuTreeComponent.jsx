import React, { useState, useMemo } from "react";
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
} from "@mui/icons-material";

const MenuTreeComponent = ({
  menus = [],
  onMenuAction,
  searchTerm = "",
  onSearchChange,
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(["root"]));
  const [showInactive, setShowInactive] = useState(true);

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
        level: 0, // Will be calculated
      });
    });

    // Build the tree structure
    const rootMenus = [];

    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id);

      if (menu.parent_id === null || menu.parent_id === undefined) {
        // This is a root menu
        menuNode.level = 0;
        rootMenus.push(menuNode);
      } else {
        // This is a child menu
        const parent = menuMap.get(menu.parent_id);
        if (parent) {
          menuNode.level = parent.level + 1;
          parent.children.push(menuNode);
        } else {
          // Orphaned menu (parent not found) - treat as root
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
      // Check if current node matches search
      const matchesSearch =
        !searchTerm ||
        node.menu_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.menu_url &&
          node.menu_url.toLowerCase().includes(searchTerm.toLowerCase()));

      // Check if node should be shown based on active status
      const matchesStatus = showInactive || node.is_active;

      // Filter children recursively
      const filteredChildren = node.children
        .map((child) => filterNode(child))
        .filter((child) => child !== null);

      // Include node if it matches criteria OR has matching children
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

    // Determine icon
    const getMenuIcon = () => {
      if (hasChildren) {
        return isExpanded ? <FolderOpenIcon /> : <FolderIcon />;
      }
      if (node.menu_url) {
        return node.menu_url.startsWith("http") ? <LinkIcon /> : <PageIcon />;
      }
      return <PageIcon />;
    };

    // Determine color scheme
    const getColorScheme = () => {
      if (!node.is_active)
        return { color: "text.disabled", bgcolor: "action.disabledBackground" };
      if (hasChildren)
        return { color: "primary.light", bgcolor: "#ffffff" };
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
          {/* Expansion toggle */}
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

          {/* Menu icon */}
          <ListItemIcon sx={{ minWidth: 40, color: colorScheme.color }}>
            {getMenuIcon()}
          </ListItemIcon>

          {/* Menu details */}
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

                {/* Status chips */}
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

          {/* Actions */}
          <ListItemSecondaryAction>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {/* Quick status toggle */}
              <Tooltip title={node.is_active ? "Deactivate" : "Activate"}>
                <IconButton
                  size="small"
                  onClick={() => onMenuAction?.(node, "toggle-status")}
                  sx={{
                    color: node.is_active ? "success.main" : "text.disabled",
                  }}
                >
                  {node.is_active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </Tooltip>

              {/* More actions */}
              <IconButton
                size="small"
                onClick={(e) => onMenuAction?.(node, "menu", e)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>

        {/* Render children */}
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

        {/* Add menu button */}
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => onMenuAction?.(null, "create")}
            fullWidth
          >
            Add New Menu
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MenuTreeComponent;
