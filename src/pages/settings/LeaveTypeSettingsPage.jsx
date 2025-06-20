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
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
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
  EventAvailable as LeaveIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApprovedIcon,
  Cancel as DisabledIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Policy as PolicyIcon,
  Category as CategoryIcon,
  DateRange as DateIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Business as CompanyIcon,
  Save as SaveIcon,
  Restore as ResetIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Assignment as RuleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { leaveAPI } from '../../../services/api/leave.api';

const LeaveTypeSettingsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Mock data for development
  const mockLeaveTypes = [
    {
      id: 1,
      name: "Annual Leave",
      code: "AL",
      description: "Annual vacation leave for all employees",
      category: "annual",
      max_days_per_year: 21,
      max_days_per_request: 14,
      min_days_notice: 7,
      max_consecutive_days: 21,
      is_paid: true,
      is_active: true,
      requires_approval: true,
      requires_medical_certificate: false,
      can_be_carried_forward: true,
      max_carry_forward_days: 5,
      accrual_rate: 1.75,
      accrual_frequency: "monthly",
      gender_restriction: "all",
      min_service_months: 6,
      applicable_to: "all_employees",
      created_at: "2024-01-15",
      usage_count: 45,
      total_days_taken: 892,
    },
    {
      id: 2,
      name: "Sick Leave",
      code: "SL",
      description: "Medical leave for illness or medical appointments",
      category: "sick",
      max_days_per_year: 14,
      max_days_per_request: 7,
      min_days_notice: 0,
      max_consecutive_days: 14,
      is_paid: true,
      is_active: true,
      requires_approval: false,
      requires_medical_certificate: true,
      can_be_carried_forward: false,
      max_carry_forward_days: 0,
      accrual_rate: 1.17,
      accrual_frequency: "monthly",
      gender_restriction: "all",
      min_service_months: 3,
      applicable_to: "all_employees",
      created_at: "2024-01-15",
      usage_count: 23,
      total_days_taken: 156,
    },
    {
      id: 3,
      name: "Maternity Leave",
      code: "ML",
      description: "Maternity leave for female employees",
      category: "maternity",
      max_days_per_year: 120,
      max_days_per_request: 120,
      min_days_notice: 30,
      max_consecutive_days: 120,
      is_paid: true,
      is_active: true,
      requires_approval: true,
      requires_medical_certificate: true,
      can_be_carried_forward: false,
      max_carry_forward_days: 0,
      accrual_rate: 0,
      accrual_frequency: "none",
      gender_restriction: "female",
      min_service_months: 12,
      applicable_to: "all_employees",
      created_at: "2024-01-15",
      usage_count: 3,
      total_days_taken: 240,
    },
    {
      id: 4,
      name: "Paternity Leave",
      code: "PL",
      description: "Paternity leave for male employees",
      category: "paternity",
      max_days_per_year: 7,
      max_days_per_request: 7,
      min_days_notice: 14,
      max_consecutive_days: 7,
      is_paid: true,
      is_active: true,
      requires_approval: true,
      requires_medical_certificate: false,
      can_be_carried_forward: false,
      max_carry_forward_days: 0,
      accrual_rate: 0,
      accrual_frequency: "none",
      gender_restriction: "male",
      min_service_months: 12,
      applicable_to: "all_employees",
      created_at: "2024-01-15",
      usage_count: 2,
      total_days_taken: 14,
    },
    {
      id: 5,
      name: "Study Leave",
      code: "STL",
      description: "Educational leave for training and development",
      category: "study",
      max_days_per_year: 10,
      max_days_per_request: 5,
      min_days_notice: 21,
      max_consecutive_days: 5,
      is_paid: false,
      is_active: true,
      requires_approval: true,
      requires_medical_certificate: false,
      can_be_carried_forward: false,
      max_carry_forward_days: 0,
      accrual_rate: 0,
      accrual_frequency: "none",
      gender_restriction: "all",
      min_service_months: 24,
      applicable_to: "permanent_only",
      created_at: "2024-01-15",
      usage_count: 8,
      total_days_taken: 32,
    },
  ];

  // Leave categories
  const leaveCategories = [
    {
      value: "annual",
      label: "Annual Leave",
      color: "primary",
      icon: <LeaveIcon />,
    },
    {
      value: "sick",
      label: "Sick Leave",
      color: "error",
      icon: <WarningIcon />,
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
      value: "study",
      label: "Study Leave",
      color: "success",
      icon: <SettingsIcon />,
    },
    {
      value: "emergency",
      label: "Emergency Leave",
      color: "warning",
      icon: <WarningIcon />,
    },
    {
      value: "compassionate",
      label: "Compassionate Leave",
      color: "default",
      icon: <PersonIcon />,
    },
    {
      value: "other",
      label: "Other",
      color: "default",
      icon: <CategoryIcon />,
    },
  ];

  // Accrual frequencies
  const accrualFrequencies = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annually", label: "Annually" },
    { value: "none", label: "No Accrual" },
  ];

  // Gender restrictions
  const genderRestrictions = [
    { value: "all", label: "All Employees" },
    { value: "male", label: "Male Only" },
    { value: "female", label: "Female Only" },
  ];

  // Employee applicability
  const employeeApplicability = [
    { value: "all_employees", label: "All Employees" },
    { value: "permanent_only", label: "Permanent Employees Only" },
    { value: "contract_only", label: "Contract Employees Only" },
    { value: "specific_departments", label: "Specific Departments" },
    { value: "specific_roles", label: "Specific Roles" },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Leave Types",
      value: mockLeaveTypes.length.toString(),
      subtitle: "Configured leave types",
      icon: <CategoryIcon />,
      color: "primary",
    },
    {
      title: "Active Leave Types",
      value: mockLeaveTypes.filter((lt) => lt.is_active).length.toString(),
      subtitle: "Currently active",
      icon: <ApprovedIcon />,
      color: "success",
    },
    {
      title: "Total Usage",
      value: mockLeaveTypes
        .reduce((sum, lt) => sum + lt.usage_count, 0)
        .toString(),
      subtitle: "Applications this year",
      icon: <ScheduleIcon />,
      color: "info",
    },
    {
      title: "Days Allocated",
      value: mockLeaveTypes
        .reduce((sum, lt) => sum + lt.total_days_taken, 0)
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
            label={category?.label}
            size="small"
            color={category?.color}
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
          {params.value}
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
      // Replace with actual API call
      // const response = await leaveAPI.getLeaveTypes();
      // setLeaveTypes(response.data || []);
      setLeaveTypes(mockLeaveTypes);
    } catch (error) {
      showError("Failed to fetch leave types");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingLeaveType) {
        // await leaveAPI.updateLeaveType(editingLeaveType.id, formData);
        showSuccess("Leave type updated successfully");
      } else {
        // await leaveAPI.createLeaveType(formData);
        showSuccess("Leave type created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchLeaveTypes();
    } catch (error) {
      showError("Failed to save leave type");
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
      message: `Are you sure you want to delete leave type "${leaveType.name}"? This action cannot be undone and may affect existing leave applications.`,
      onConfirm: async () => {
        try {
          // await leaveAPI.deleteLeaveType(leaveType.id);
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
  const handleToggleStatus = async (leaveType) => {
    try {
      // await leaveAPI.updateLeaveType(leaveType.id, { is_active: !leaveType.is_active });
      showSuccess(
        `Leave type ${!leaveType.is_active ? "activated" : "deactivated"} successfully`
      );
      fetchLeaveTypes();
    } catch (error) {
      showError("Failed to update leave type status");
    }
    setAnchorEl(null);
  };

  // Filter leave types
  const filteredLeaveTypes = leaveTypes.filter((leaveType) => {
    const matchesSearch =
      leaveType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leaveType.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leaveType.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || leaveType.category === categoryFilter;
    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "active" && leaveType.is_active) ||
      (statusFilter === "inactive" && !leaveType.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Leave Type Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure and manage different types of leave available to employees
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
                  <Box sx={{ flexGrow: 1 }}>
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search leave types..."
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
                  {hasPermission(PERMISSIONS.MANAGE_LEAVE_TYPES) && (
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
            <Tab label="Usage Analytics" />
            <Tab label="Policy Templates" />
          </Tabs>

          {/* Leave Types Tab */}
          {activeTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ height: 600, width: "100%" }}>
                <DataGrid
                  rows={filteredLeaveTypes}
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

          {/* Usage Analytics Tab */}
          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Leave Type Usage Analytics
              </Typography>
              <Grid container spacing={3}>
                {filteredLeaveTypes.map((leaveType) => {
                  const utilizationRate =
                    (leaveType.total_days_taken /
                      (leaveType.max_days_per_year * leaveType.usage_count)) *
                    100;
                  return (
                    <Grid item xs={12} md={6} key={leaveType.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
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
                {[
                  {
                    name: "Standard Corporate Policy",
                    types: 5,
                    description: "Basic leave types for corporate environment",
                  },
                  {
                    name: "Government Sector Policy",
                    types: 8,
                    description:
                      "Comprehensive leave policy for government organizations",
                  },
                  {
                    name: "NGO/Non-Profit Policy",
                    types: 6,
                    description:
                      "Flexible leave policy for non-profit organizations",
                  },
                  {
                    name: "Healthcare Sector Policy",
                    types: 9,
                    description:
                      "Specialized leave types for healthcare workers",
                  },
                ].map((template, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="h6">
                              {template.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {template.description}
                            </Typography>
                            <Typography variant="caption">
                              {template.types} leave types included
                            </Typography>
                          </Box>
                          <Button size="small" variant="outlined">
                            Apply Template
                          </Button>
                        </Box>
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
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {hasPermission(PERMISSIONS.MANAGE_LEAVE_TYPES) && (
          <MenuItem onClick={() => handleEdit(selectedLeaveType)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Leave Type</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleToggleStatus(selectedLeaveType)}>
          <ListItemIcon>
            {selectedLeaveType?.is_active ? (
              <DisabledIcon fontSize="small" />
            ) : (
              <ApprovedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedLeaveType?.is_active ? "Deactivate" : "Activate"}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            /* Duplicate leave type */
          }}
        >
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        {hasPermission(PERMISSIONS.MANAGE_LEAVE_TYPES) && (
          <MenuItem
            onClick={() => handleDelete(selectedLeaveType)}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
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
              <Typography variant="h6" sx={{ mb: 2 }}>
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
                placeholder="e.g., Annual Leave"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                required
                placeholder="e.g., AL"
                inputProps={{ maxLength: 5 }}
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
                placeholder="Describe the purpose and usage of this leave type..."
              />
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
                  required
                >
                  {leaveCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Leave Limits */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Leave Limits & Rules
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Max Days per Year"
                type="number"
                value={formData.max_days_per_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_days_per_year: e.target.value,
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Max Days per Request"
                type="number"
                value={formData.max_days_per_request}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_days_per_request: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Min Notice (Days)"
                type="number"
                value={formData.min_days_notice}
                onChange={(e) =>
                  setFormData({ ...formData, min_days_notice: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Max Consecutive Days"
                type="number"
                value={formData.max_consecutive_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_consecutive_days: e.target.value,
                  })
                }
              />
            </Grid>

            {/* Leave Policies */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Leave Policies
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
                label="Can be Carried Forward"
              />
            </Grid>

            {/* Accrual Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Accrual Settings
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Accrual Rate (Days/Period)"
                type="number"
                step="0.1"
                value={formData.accrual_rate}
                onChange={(e) =>
                  setFormData({ ...formData, accrual_rate: e.target.value })
                }
                helperText="Leave days earned per accrual period"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Accrual Frequency</InputLabel>
                <Select
                  value={formData.accrual_frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accrual_frequency: e.target.value,
                    })
                  }
                  label="Accrual Frequency"
                >
                  {accrualFrequencies.map((freq) => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Carry Forward Days"
                type="number"
                value={formData.max_carry_forward_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_carry_forward_days: e.target.value,
                  })
                }
                disabled={!formData.can_be_carried_forward}
              />
            </Grid>

            {/* Eligibility Criteria */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Eligibility Criteria
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Min Service (Months)"
                type="number"
                value={formData.min_service_months}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_service_months: e.target.value,
                  })
                }
                helperText="Minimum employment duration"
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
                  {genderRestrictions.map((restriction) => (
                    <MenuItem key={restriction.value} value={restriction.value}>
                      {restriction.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Applicable To</InputLabel>
                <Select
                  value={formData.applicable_to}
                  onChange={(e) =>
                    setFormData({ ...formData, applicable_to: e.target.value })
                  }
                  label="Applicable To"
                >
                  {employeeApplicability.map((applicability) => (
                    <MenuItem
                      key={applicability.value}
                      value={applicability.value}
                    >
                      {applicability.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Additional Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                multiline
                rows={3}
                placeholder="Any additional rules or notes for this leave type..."
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                }
                label="Active (Available for use)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={resetForm} startIcon={<ResetIcon />}>
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            {editingLeaveType ? "Update" : "Create"} Leave Type
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Leave Type Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Leave Type Details - {selectedLeaveType?.name}
        </DialogTitle>
        <DialogContent>
          {selectedLeaveType && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Basic Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Name
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedLeaveType.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Code
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedLeaveType.code}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Description
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedLeaveType.description}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Category
                          </Typography>
                          <Chip
                            label={
                              leaveCategories.find(
                                (c) => c.value === selectedLeaveType.category
                              )?.label
                            }
                            size="small"
                            color={
                              leaveCategories.find(
                                (c) => c.value === selectedLeaveType.category
                              )?.color
                            }
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={
                              selectedLeaveType.is_active
                                ? "Active"
                                : "Inactive"
                            }
                            size="small"
                            color={
                              selectedLeaveType.is_active
                                ? "success"
                                : "default"
                            }
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Leave Rules */}
                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Leave Rules & Limits
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell>Max Days per Year</TableCell>
                              <TableCell>
                                {selectedLeaveType.max_days_per_year} days
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Max Days per Request</TableCell>
                              <TableCell>
                                {selectedLeaveType.max_days_per_request} days
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Minimum Notice</TableCell>
                              <TableCell>
                                {selectedLeaveType.min_days_notice} days
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Max Consecutive Days</TableCell>
                              <TableCell>
                                {selectedLeaveType.max_consecutive_days} days
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Accrual Rate</TableCell>
                              <TableCell>
                                {selectedLeaveType.accrual_rate > 0
                                  ? `${selectedLeaveType.accrual_rate} days/${selectedLeaveType.accrual_frequency}`
                                  : "No accrual"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Minimum Service</TableCell>
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
                              <RuleIcon />
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
                                bgcolor:
                                  selectedLeaveType.can_be_carried_forward
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
                                ? `Carry Forward: ${selectedLeaveType.max_carry_forward_days} days`
                                : "No Carry Forward"
                            }
                            secondary="Year-end policy"
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
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Applications
                        </Typography>
                        <Typography variant="h6">
                          {selectedLeaveType.usage_count}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Days Taken
                        </Typography>
                        <Typography variant="h6">
                          {selectedLeaveType.total_days_taken} days
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Average per Application
                        </Typography>
                        <Typography variant="h6">
                          {selectedLeaveType.usage_count > 0
                            ? (
                                selectedLeaveType.total_days_taken /
                                selectedLeaveType.usage_count
                              ).toFixed(1)
                            : 0}{" "}
                          days
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => {
              /* Print function */
            }}
          >
            Print
          </Button>
          {hasPermission(PERMISSIONS.MANAGE_LEAVE_TYPES) && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                handleEdit(selectedLeaveType);
              }}
            >
              Edit Leave Type
            </Button>
          )}
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

export default LeaveTypeSettingsPage;