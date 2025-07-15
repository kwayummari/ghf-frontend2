import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ViewIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CategoryIcon from "@mui/icons-material/Category";
import ApprovedIcon from "@mui/icons-material/CheckCircle";
import DisabledIcon from "@mui/icons-material/Cancel";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DateIcon from "@mui/icons-material/DateRange";
import MoneyIcon from "@mui/icons-material/MonetizationOnOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import HelpIcon from "@mui/icons-material/Help";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

// Hooks and Services
import  useNotification  from "../../hooks/common/useNotification";
import { usePermissions } from "../../hooks/auth/usePermissions";
import { leavesAPI } from "../../services/api/leaves.api";
// import { PERMISSIONS } from "../../constants/permission.constants";
import { useDialog } from "../../hooks/useDialog";
// import { leavesAPI } from "../../services/api/leaves.api";
import { PERMISSIONS } from "../../constants";

const LeaveTypeSettingsPage = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const { hasPermission } = usePermissions();
  const { dialogState, openDialog, closeDialog, handleConfirm, handleCancel } =
    useDialog();

  // State management
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "annual",
    max_days_per_year: "",
    max_days_per_request: "",
    min_days_notice: "",
    max_consecutive_days: "",
    is_paid: true,
    is_active: true,
    requires_approval: true,
    requires_medical_certificate: false,
    can_be_carried_forward: false,
    max_carry_forward_days: "",
    accrual_rate: "",
    accrual_frequency: "monthly",
    gender_restriction: "all",
    min_service_months: "",
    applicable_to: "all_employees",
    notes: "",
  });

  // Leave categories
  const leaveCategories = [
    {
      value: "annual",
      label: "Annual Leave",
      color: "primary",
      icon: <DateIcon />,
    },
    {
      value: "sick",
      label: "Sick Leave",
      color: "error",
      icon: <PersonIcon />,
    },
    {
      value: "maternity",
      label: "Maternity Leave",
      color: "secondary",
      icon: <PersonIcon />,
    },
    {
      value: "paternity",
      label: "Paternity Leave",
      color: "info",
      icon: <PersonIcon />,
    },
    {
      value: "emergency",
      label: "Emergency Leave",
      color: "warning",
      icon: <SecurityIcon />,
    },
    {
      value: "compassionate",
      label: "Compassionate Leave",
      color: "default",
      icon: <PersonIcon />,
    },
    {
      value: "study",
      label: "Study Leave",
      color: "success",
      icon: <BusinessIcon />,
    },
    {
      value: "unpaid",
      label: "Unpaid Leave",
      color: "default",
      icon: <MoneyIcon />,
    },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Leave Types",
      value: leaveTypes.length.toString(),
      subtitle: "Configured leave types",
      icon: <CategoryIcon />,
      color: "primary",
    },
    {
      title: "Active Leave Types",
      value: leaveTypes.filter((lt) => lt.is_active).length.toString(),
      subtitle: "Currently active",
      icon: <ApprovedIcon />,
      color: "success",
    },
    {
      title: "Total Usage",
      value: leaveTypes
        .reduce((sum, lt) => sum + (lt.usage_count || 0), 0)
        .toString(),
      subtitle: "Applications this year",
      icon: <ScheduleIcon />,
      color: "info",
    },
    {
      title: "Days Allocated",
      value: leaveTypes
        .reduce((sum, lt) => sum + (lt.total_days_taken || 0), 0)
        .toString(),
      subtitle: "Total days taken",
      icon: <DateIcon />,
      color: "warning",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "name",
      headerName: "Leave Type",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.code} •{" "}
            {
              leaveCategories.find((c) => c.value === params.row.category)
                ?.label
            }
          </Typography>
          {/* Confirmation Dialog */}
          <Dialog
            open={dialogState.open}
            onClose={closeDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>{dialogState.title}</DialogTitle>
            <DialogContent>
              <Typography>{dialogState.message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancel}>{dialogState.cancelLabel}</Button>
              <Button
                onClick={handleConfirm}
                variant="contained"
                color="error"
                disabled={dialogState.loading}
                startIcon={
                  dialogState.loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {dialogState.loading
                  ? "Processing..."
                  : dialogState.confirmLabel}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      renderCell: (params) => {
        const category = leaveCategories.find((c) => c.value === params.value);
        return (
          <Chip
            label={category?.label || "General"}
            size="small"
            color={category?.color || "default"}
            variant="outlined"
            icon={category?.icon}
          />
        );
      },
    },
    {
      field: "max_days_per_year",
      headerName: "Annual Limit",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{params.value} days</Typography>
      ),
    },
    {
      field: "is_paid",
      headerName: "Paid",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Paid" : "Unpaid"}
          size="small"
          color={params.value ? "success" : "default"}
          variant="filled"
        />
      ),
    },
    {
      field: "requires_approval",
      headerName: "Approval",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Required" : "Auto"}
          size="small"
          color={params.value ? "warning" : "success"}
          variant="outlined"
        />
      ),
    },
    {
      field: "accrual_rate",
      headerName: "Accrual Rate",
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value > 0 ? `${params.value} days/month` : "No accrual"}
        </Typography>
      ),
    },
    {
      field: "usage_count",
      headerName: "Usage",
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" textAlign="center">
          {params.value || 0}
        </Typography>
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
        />
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
            setSelectedLeaveType(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load leave types data
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await leavesAPI.getTypes();

      if (response && response.success) {
        // Transform backend data to match frontend structure
        const transformedData = (response.data || []).map((leaveType) => ({
          id: leaveType.id,
          name: leaveType.name,
          code: leaveType.name?.substring(0, 2).toUpperCase() || "LT",
          description: leaveType.description || "",
          category: "annual", // Default since backend doesn't have category
          max_days_per_year: leaveType.maximum_days || 0,
          max_days_per_request: leaveType.maximum_days || 0,
          min_days_notice: 1,
          max_consecutive_days: leaveType.maximum_days || 0,
          is_paid: true, // Default since backend doesn't have this field
          is_active: true, // Default since backend doesn't have this field
          requires_approval: true,
          requires_medical_certificate: false,
          can_be_carried_forward: false,
          max_carry_forward_days: 0,
          accrual_rate: 0,
          accrual_frequency: "monthly",
          gender_restriction: "all",
          min_service_months: leaveType.minimum_days || 0,
          applicable_to: "all_employees",
          created_at: leaveType.created_at,
          usage_count: 0, // Will need to be calculated separately
          total_days_taken: 0, // Will need to be calculated separately
        }));

        setLeaveTypes(transformedData);
      } else {
        setLeaveTypes([]);
      }
    } catch (error) {
      console.error("Failed to fetch leave types:", error);
      showError("Failed to fetch leave types");
      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Transform frontend data to backend format
      const backendData = {
        name: formData.name,
        minimum_days: parseInt(formData.min_days_notice) || 1,
        maximum_days: parseInt(formData.max_days_per_year) || 1,
        description: formData.description,
      };

      if (editingLeaveType) {
        await leavesAPI.updateLeaveType(editingLeaveType.id, backendData);
        showSuccess("Leave type updated successfully");
      } else {
        await leavesAPI.createLeaveType(backendData);
        showSuccess("Leave type created successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchLeaveTypes();
    } catch (error) {
      console.error("Save error:", error);
      showError(error.message || "Failed to save leave type");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      category: "annual",
      max_days_per_year: "",
      max_days_per_request: "",
      min_days_notice: "",
      max_consecutive_days: "",
      is_paid: true,
      is_active: true,
      requires_approval: true,
      requires_medical_certificate: false,
      can_be_carried_forward: false,
      max_carry_forward_days: "",
      accrual_rate: "",
      accrual_frequency: "monthly",
      gender_restriction: "all",
      min_service_months: "",
      applicable_to: "all_employees",
      notes: "",
    });
    setEditingLeaveType(null);
  };

  // Handle edit
  const handleEdit = (leaveType) => {
    setFormData({ ...leaveType });
    setEditingLeaveType(leaveType);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete
  const handleDelete = (leaveType) => {
    openDialog({
      title: "Delete Leave Type",
      message: `Are you sure you want to delete leave type "${leaveType.name}"?`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await leavesAPI.deleteLeaveType(leaveType.id);
          showSuccess("Leave type deleted successfully");
          fetchLeaveTypes();
        } catch (error) {
          showError("Failed to delete leave type");
        }
      },
    });
    setAnchorEl(null);
  };

  // Handle toggle status
  const handleToggleStatus = (leaveType) => {
    // Implementation for toggling status
    setAnchorEl(null);
  };

  // Filter leave types
  const filteredLeaveTypes = leaveTypes.filter((leaveType) => {
    const matchesSearch = leaveType.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || leaveType.category === categoryFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" ? leaveType.is_active : !leaveType.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Leave Type Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure and manage different types of leave available to employees
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} md={3} key={index}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${
                  card.color === "primary"
                    ? "#1976d2, #42a5f5"
                    : card.color === "success"
                      ? "#2e7d32, #66bb6a"
                      : card.color === "info"
                        ? "#0288d1, #29b6f6"
                        : "#ed6c02, #ff9800"
                })`,
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box sx={{ mr: 2 }}>{card.icon}</Box>
                  <Typography variant="h4" fontWeight="bold">
                    {card.value}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* Filters */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search leave types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {leaveCategories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
              <Grid item xs={12} md={4}>
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  {hasPermission(PERMISSIONS.SETTINGS_CREATE) && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setDialogOpen(true)}
                    >
                      Add Leave Type
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      /* Export function */
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
            <Tab label="Leave Types" />
            <Tab label="Analytics" />
            <Tab label="Policy Templates" />
          </Tabs>

          {/* Leave Types Tab */}
          {activeTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <DataGrid
                rows={filteredLeaveTypes}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                autoHeight
                sx={{
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f0f0f0",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#fafafa",
                    fontWeight: "bold",
                  },
                }}
              />
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {filteredLeaveTypes.map((leaveType) => {
                  const utilizationRate =
                    leaveType.max_days_per_year > 0
                      ? (leaveType.total_days_taken /
                          leaveType.max_days_per_year) *
                        100
                      : 0;

                  return (
                    <Grid item xs={12} md={6} lg={4} key={leaveType.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            {
                              leaveCategories.find(
                                (c) => c.value === leaveType.category
                              )?.icon
                            }
                            <Typography variant="h6">
                              {leaveType.name}
                            </Typography>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Applications
                              </Typography>
                              <Typography variant="h6">
                                {leaveType.usage_count}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Days Taken
                              </Typography>
                              <Typography variant="h6">
                                {leaveType.total_days_taken}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Utilization Rate
                              </Typography>
                              <Typography
                                variant="h6"
                                color={
                                  utilizationRate > 80
                                    ? "warning.main"
                                    : "success.main"
                                }
                              >
                                {utilizationRate.toFixed(1)}%
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Policy Templates Tab */}
          {activeTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Leave Policy Templates
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Pre-configured leave type templates based on common
                  organizational policies and legal requirements.
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                {leaveCategories.map((template) => (
                  <Grid item xs={12} md={6} lg={4} key={template.value}>
                    <Card variant="outlined" sx={{ cursor: "pointer" }}>
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          {template.icon}
                          <Typography variant="h6" sx={{ ml: 1 }}>
                            {template.label}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Click to create a new leave type based on this
                          template
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {hasPermission(PERMISSIONS.SETTINGS_UPDATE) && (
          <MenuItem onClick={() => handleEdit(selectedLeaveType)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Leave Type
          </MenuItem>
        )}
        <MenuItem onClick={() => handleToggleStatus(selectedLeaveType)}>
          {selectedLeaveType?.is_active ? (
            <DisabledIcon fontSize="small" sx={{ mr: 1 }} />
          ) : (
            <ApprovedIcon fontSize="small" sx={{ mr: 1 }} />
          )}
          {selectedLeaveType?.is_active ? "Deactivate" : "Activate"}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {}}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        {hasPermission(PERMISSIONS.SETTINGS_DELETE) && (
          <MenuItem
            onClick={() => handleDelete(selectedLeaveType)}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Add/Edit Leave Type Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingLeaveType ? "Edit Leave Type" : "Add New Leave Type"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Leave Type Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g., AL, SL, ML"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>

            {/* Configuration */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 1, mt: 2 }}
              >
                Configuration
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  label="Category"
                >
                  {leaveCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Days Per Year"
                value={formData.max_days_per_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_days_per_year: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Days Per Request"
                value={formData.max_days_per_request}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_days_per_request: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Days Notice"
                value={formData.min_days_notice}
                onChange={(e) =>
                  setFormData({ ...formData, min_days_notice: e.target.value })
                }
              />
            </Grid>

            {/* Policies */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 1, mt: 2 }}
              >
                Policies
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_paid}
                    onChange={(e) =>
                      setFormData({ ...formData, is_paid: e.target.checked })
                    }
                  />
                }
                label="Paid Leave"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requires_approval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requires_approval: e.target.checked,
                      })
                    }
                  />
                }
                label="Requires Approval"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requires_medical_certificate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requires_medical_certificate: e.target.checked,
                      })
                    }
                  />
                }
                label="Requires Medical Certificate"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.can_be_carried_forward}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        can_be_carried_forward: e.target.checked,
                      })
                    }
                  />
                }
                label="Can Be Carried Forward"
              />
            </Grid>

            {/* Additional Settings */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 1, mt: 2 }}
              >
                Additional Settings
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Accrual Rate (days/month)"
                value={formData.accrual_rate}
                onChange={(e) =>
                  setFormData({ ...formData, accrual_rate: e.target.value })
                }
                helperText="Leave days earned per month"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Service (months)"
                value={formData.min_service_months}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_service_months: e.target.value,
                  })
                }
                helperText="Required service before eligible"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender Restriction</InputLabel>
                <Select
                  value={formData.gender_restriction}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender_restriction: e.target.value,
                    })
                  }
                  label="Gender Restriction"
                >
                  <MenuItem value="all">All Employees</MenuItem>
                  <MenuItem value="male">Male Only</MenuItem>
                  <MenuItem value="female">Female Only</MenuItem>
                </Select>
              </FormControl>
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

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Additional Notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional notes or policies for this leave type..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !formData.name}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {saving ? "Saving..." : editingLeaveType ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Leave Type Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              {selectedLeaveType?.name} Details
            </Typography>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLeaveType && (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Basic Information
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <strong>Name</strong>
                            </TableCell>
                            <TableCell>{selectedLeaveType.name}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Code</strong>
                            </TableCell>
                            <TableCell>{selectedLeaveType.code}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Category</strong>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  leaveCategories.find(
                                    (c) =>
                                      c.value === selectedLeaveType.category
                                  )?.label || "General"
                                }
                                size="small"
                                color={
                                  leaveCategories.find(
                                    (c) =>
                                      c.value === selectedLeaveType.category
                                  )?.color || "default"
                                }
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Description</strong>
                            </TableCell>
                            <TableCell>
                              {selectedLeaveType.description ||
                                "No description"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Max Days/Year</strong>
                            </TableCell>
                            <TableCell>
                              {selectedLeaveType.max_days_per_year} days
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Max Days/Request</strong>
                            </TableCell>
                            <TableCell>
                              {selectedLeaveType.max_days_per_request} days
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Min Notice</strong>
                            </TableCell>
                            <TableCell>
                              {selectedLeaveType.min_days_notice} days
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Accrual</strong>
                            </TableCell>
                            <TableCell>
                              {selectedLeaveType.accrual_rate > 0
                                ? `${selectedLeaveType.accrual_rate} days/${selectedLeaveType.accrual_frequency}`
                                : "No accrual"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Minimum Service</strong>
                            </TableCell>
                            <TableCell>
                              {selectedLeaveType.min_service_months} months
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Policies
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: selectedLeaveType.is_paid
                                ? "success.main"
                                : "default",
                            }}
                          >
                            <MoneyIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <MUIListItemText
                          primary={
                            selectedLeaveType.is_paid
                              ? "Paid Leave"
                              : "Unpaid Leave"
                          }
                          secondary="Payment policy"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: selectedLeaveType.requires_approval
                                ? "warning.main"
                                : "success.main",
                            }}
                          >
                            <ApprovedIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <MUIListItemText
                          primary={
                            selectedLeaveType.requires_approval
                              ? "Approval Required"
                              : "Auto Approved"
                          }
                          secondary="Approval workflow"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                selectedLeaveType.requires_medical_certificate
                                  ? "info.main"
                                  : "default",
                            }}
                          >
                            <SecurityIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <MUIListItemText
                          primary={
                            selectedLeaveType.requires_medical_certificate
                              ? "Medical Certificate Required"
                              : "No Medical Certificate"
                          }
                          secondary="Documentation requirement"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: selectedLeaveType.can_be_carried_forward
                                ? "primary.main"
                                : "default",
                            }}
                          >
                            <DateIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <MUIListItemText
                          primary={
                            selectedLeaveType.can_be_carried_forward
                              ? "Can Carry Forward"
                              : "Cannot Carry Forward"
                          }
                          secondary="Unused leave policy"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                {/* Usage Statistics */}
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Usage Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Applications
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {selectedLeaveType.usage_count || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Days Taken
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {selectedLeaveType.total_days_taken || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Utilization Rate
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color={
                            (selectedLeaveType.total_days_taken /
                              selectedLeaveType.max_days_per_year) *
                              100 >
                            80
                              ? "warning.main"
                              : "success.main"
                          }
                        >
                          {selectedLeaveType.max_days_per_year > 0
                            ? (
                                (selectedLeaveType.total_days_taken /
                                  selectedLeaveType.max_days_per_year) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Additional Information */}
              {selectedLeaveType.notes && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Additional Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedLeaveType.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LeaveTypeSettingsPage;
