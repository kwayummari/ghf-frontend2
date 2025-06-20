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
  Event as HolidayIcon,
  EventAvailable as WorkdayIcon,
  EventBusy as NonWorkdayIcon,
  DateRange as DateIcon,
  CalendarToday as CalendarIcon,
  Public as PublicIcon,
  Business as CompanyIcon,
  CheckCircle as ApprovedIcon,
  Cancel as CancelledIcon,
  Schedule as PendingIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Restore as ResetIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Sync as SyncIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfYear, endOfYear, addYears, isWeekend, differenceInDays } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { holidayAPI } from '../../../services/api/holiday.api';

const HolidaySettingsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    date: null,
    type: "public",
    description: "",
    is_recurring: false,
    recurrence_pattern: "yearly",
    is_optional: false,
    applies_to: "all_employees",
    department_ids: [],
    location_ids: [],
    notes: "",
    is_active: true,
  });

  // Mock data for development
  const mockHolidays = [
    {
      id: 1,
      name: "New Year's Day",
      date: "2024-01-01",
      type: "public",
      description: "New Year celebration",
      is_recurring: true,
      recurrence_pattern: "yearly",
      is_optional: false,
      applies_to: "all_employees",
      is_active: true,
      created_at: "2024-01-01",
      day_of_week: "Monday",
      days_until: 180,
      affected_employees: 150,
    },
    {
      id: 2,
      name: "Tanzania Union Day",
      date: "2024-04-26",
      type: "public",
      description: "Commemoration of the union between Tanganyika and Zanzibar",
      is_recurring: true,
      recurrence_pattern: "yearly",
      is_optional: false,
      applies_to: "all_employees",
      is_active: true,
      created_at: "2024-01-01",
      day_of_week: "Friday",
      days_until: 65,
      affected_employees: 150,
    },
    {
      id: 3,
      name: "Labour Day",
      date: "2024-05-01",
      type: "public",
      description: "International Workers' Day",
      is_recurring: true,
      recurrence_pattern: "yearly",
      is_optional: false,
      applies_to: "all_employees",
      is_active: true,
      created_at: "2024-01-01",
      day_of_week: "Wednesday",
      days_until: 70,
      affected_employees: 150,
    },
    {
      id: 4,
      name: "Eid al-Fitr",
      date: "2024-04-10",
      type: "religious",
      description: "Islamic festival marking the end of Ramadan",
      is_recurring: false,
      recurrence_pattern: "none",
      is_optional: true,
      applies_to: "specific_groups",
      is_active: true,
      created_at: "2024-01-01",
      day_of_week: "Wednesday",
      days_until: 49,
      affected_employees: 45,
    },
    {
      id: 5,
      name: "Christmas Day",
      date: "2024-12-25",
      type: "public",
      description: "Christian celebration of the birth of Jesus Christ",
      is_recurring: true,
      recurrence_pattern: "yearly",
      is_optional: false,
      applies_to: "all_employees",
      is_active: true,
      created_at: "2024-01-01",
      day_of_week: "Wednesday",
      days_until: 243,
      affected_employees: 150,
    },
    {
      id: 6,
      name: "Company Foundation Day",
      date: "2024-08-15",
      type: "company",
      description: "Anniversary of company establishment",
      is_recurring: true,
      recurrence_pattern: "yearly",
      is_optional: false,
      applies_to: "all_employees",
      is_active: true,
      created_at: "2024-01-01",
      day_of_week: "Thursday",
      days_until: 111,
      affected_employees: 150,
    },
  ];

  // Holiday types
  const holidayTypes = [
    {
      value: "public",
      label: "Public Holiday",
      color: "primary",
      icon: <PublicIcon />,
    },
    {
      value: "religious",
      label: "Religious Holiday",
      color: "secondary",
      icon: <HolidayIcon />,
    },
    {
      value: "company",
      label: "Company Holiday",
      color: "success",
      icon: <CompanyIcon />,
    },
    {
      value: "regional",
      label: "Regional Holiday",
      color: "warning",
      icon: <DateIcon />,
    },
    {
      value: "optional",
      label: "Optional Holiday",
      color: "info",
      icon: <EventAvailable />,
    },
  ];

  // Recurrence patterns
  const recurrencePatterns = [
    { value: "none", label: "One-time only" },
    { value: "yearly", label: "Every year" },
    { value: "custom", label: "Custom pattern" },
  ];

  // Employee applicability
  const employeeApplicability = [
    { value: "all_employees", label: "All Employees" },
    { value: "specific_departments", label: "Specific Departments" },
    { value: "specific_locations", label: "Specific Locations" },
    { value: "specific_groups", label: "Specific Employee Groups" },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Holidays",
      value: mockHolidays
        .filter((h) => h.date.startsWith(yearFilter))
        .length.toString(),
      subtitle: `In ${yearFilter}`,
      icon: <HolidayIcon />,
      color: "primary",
    },
    {
      title: "Public Holidays",
      value: mockHolidays
        .filter((h) => h.type === "public" && h.date.startsWith(yearFilter))
        .length.toString(),
      subtitle: "Government declared",
      icon: <PublicIcon />,
      color: "success",
    },
    {
      title: "Working Days",
      value: (
        365 -
        mockHolidays.filter(
          (h) => h.date.startsWith(yearFilter) && !h.is_optional
        ).length -
        104
      ).toString(),
      subtitle: "Excluding weekends",
      icon: <WorkdayIcon />,
      color: "info",
    },
    {
      title: "Upcoming Holidays",
      value: mockHolidays
        .filter((h) => h.days_until > 0 && h.days_until <= 30)
        .length.toString(),
      subtitle: "Next 30 days",
      icon: <CalendarIcon />,
      color: "warning",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "name",
      headerName: "Holiday Name",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(params.row.date), "EEEE")}
          </Typography>
        </Box>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), "dd/MM/yyyy")}
        </Typography>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      width: 130,
      renderCell: (params) => {
        const type = holidayTypes.find((t) => t.value === params.value);
        return (
          <Chip
            label={type?.label}
            size="small"
            color={type?.color}
            variant="outlined"
            icon={type?.icon}
          />
        );
      },
    },
    {
      field: "days_until",
      headerName: "Days Until",
      width: 100,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color={
            params.value <= 7
              ? "error.main"
              : params.value <= 30
                ? "warning.main"
                : "text.primary"
          }
        >
          {params.value > 0 ? `${params.value} days` : "Past"}
        </Typography>
      ),
    },
    {
      field: "is_recurring",
      headerName: "Recurring",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Yes" : "No"}
          size="small"
          color={params.value ? "success" : "default"}
          variant="filled"
        />
      ),
    },
    {
      field: "is_optional",
      headerName: "Optional",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Optional" : "Mandatory"}
          size="small"
          color={params.value ? "info" : "primary"}
          variant="outlined"
        />
      ),
    },
    {
      field: "affected_employees",
      headerName: "Affected Employees",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2">{params.value} employees</Typography>
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
            setSelectedHoliday(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load holidays data
  useEffect(() => {
    fetchHolidays();
  }, [yearFilter]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await holidayAPI.getHolidays({ year: yearFilter });
      // setHolidays(response.data || []);
      setHolidays(mockHolidays);
    } catch (error) {
      showError("Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingHoliday) {
        // await holidayAPI.updateHoliday(editingHoliday.id, formData);
        showSuccess("Holiday updated successfully");
      } else {
        // await holidayAPI.createHoliday(formData);
        showSuccess("Holiday created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchHolidays();
    } catch (error) {
      showError("Failed to save holiday");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date: null,
      type: "public",
      description: "",
      is_recurring: false,
      recurrence_pattern: "yearly",
      is_optional: false,
      applies_to: "all_employees",
      department_ids: [],
      location_ids: [],
      notes: "",
      is_active: true,
    });
    setEditingHoliday(null);
  };

  // Handle edit
  const handleEdit = (holiday) => {
    setFormData({ ...holiday, date: new Date(holiday.date) });
    setEditingHoliday(holiday);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete
  const handleDelete = (holiday) => {
    openDialog({
      title: "Delete Holiday",
      message: `Are you sure you want to delete holiday "${holiday.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // await holidayAPI.deleteHoliday(holiday.id);
          showSuccess("Holiday deleted successfully");
          fetchHolidays();
        } catch (error) {
          showError("Failed to delete holiday");
        }
      },
    });
    setAnchorEl(null);
  };

  // Handle bulk import
  const handleBulkImport = async (countryCode) => {
    try {
      // await holidayAPI.importPublicHolidays({ country: countryCode, year: selectedYear });
      showSuccess(`Public holidays for ${selectedYear} imported successfully`);
      fetchHolidays();
      setBulkImportOpen(false);
    } catch (error) {
      showError("Failed to import holidays");
    }
  };

  // Filter holidays
  const filteredHolidays = holidays.filter((holiday) => {
    const matchesSearch =
      holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holiday.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || holiday.type === typeFilter;
    const matchesYear = holiday.date.startsWith(yearFilter);

    return matchesSearch && matchesType && matchesYear;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Holiday Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure and manage public holidays, company holidays, and special
            occasions
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
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search holidays..."
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
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {holidayTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      label="Year"
                    >
                      <MenuItem value="2023">2023</MenuItem>
                      <MenuItem value="2024">2024</MenuItem>
                      <MenuItem value="2025">2025</MenuItem>
                      <MenuItem value="2026">2026</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                  >
                    {hasPermission(PERMISSIONS.MANAGE_HOLIDAYS) && (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setDialogOpen(true)}
                        >
                          Add Holiday
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<SyncIcon />}
                          onClick={() => setBulkImportOpen(true)}
                        >
                          Import
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      onClick={() => setActiveTab(1)}
                    >
                      Calendar
                    </Button>
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
              <Tab label="Holiday List" />
              <Tab label="Calendar View" />
              <Tab label="Holiday Templates" />
            </Tabs>

            {/* Holiday List Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredHolidays}
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

            {/* Calendar View Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Holiday Calendar - {yearFilter}
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Interactive calendar view showing all holidays for the
                    selected year will be displayed here.
                  </Typography>
                </Alert>

                {/* Upcoming Holidays */}
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Upcoming Holidays
                    </Typography>
                    <List>
                      {filteredHolidays
                        .filter((holiday) => holiday.days_until > 0)
                        .sort((a, b) => a.days_until - b.days_until)
                        .slice(0, 5)
                        .map((holiday) => (
                          <ListItem key={holiday.id}>
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor:
                                    holidayTypes.find(
                                      (t) => t.value === holiday.type
                                    )?.color + ".main",
                                }}
                              >
                                {
                                  holidayTypes.find(
                                    (t) => t.value === holiday.type
                                  )?.icon
                                }
                              </Avatar>
                            </ListItemAvatar>
                            <MUIListItemText
                              primary={holiday.name}
                              secondary={`${format(new Date(holiday.date), "EEEE, dd MMMM yyyy")} • ${holiday.days_until} days`}
                            />
                            <Chip
                              label={holiday.type}
                              size="small"
                              color={
                                holidayTypes.find(
                                  (t) => t.value === holiday.type
                                )?.color
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Holiday Templates Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Holiday Templates by Country/Region
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Import standard public holidays for different countries and
                    regions. This will help you quickly set up your holiday
                    calendar.
                  </Typography>
                </Alert>

                <Grid container spacing={2}>
                  {[
                    {
                      country: "Tanzania",
                      code: "TZ",
                      holidays: 12,
                      description: "Official public holidays in Tanzania",
                    },
                    {
                      country: "Kenya",
                      code: "KE",
                      holidays: 11,
                      description: "Official public holidays in Kenya",
                    },
                    {
                      country: "Uganda",
                      code: "UG",
                      holidays: 9,
                      description: "Official public holidays in Uganda",
                    },
                    {
                      country: "Rwanda",
                      code: "RW",
                      holidays: 10,
                      description: "Official public holidays in Rwanda",
                    },
                    {
                      country: "International",
                      code: "INTL",
                      holidays: 6,
                      description: "Common international holidays",
                    },
                    {
                      country: "Islamic Calendar",
                      code: "ISLAMIC",
                      holidays: 4,
                      description: "Major Islamic holidays (varies by year)",
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
                                {template.country}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {template.description}
                              </Typography>
                              <Typography variant="caption">
                                {template.holidays} holidays included
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleBulkImport(template.code)}
                            >
                              Import for {yearFilter}
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
          {hasPermission(PERMISSIONS.MANAGE_HOLIDAYS) && (
            <MenuItem onClick={() => handleEdit(selectedHoliday)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Holiday</ListItemText>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              /* Duplicate holiday */
            }}
          >
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              /* Notify employees */
            }}
          >
            <ListItemIcon>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Notify Employees</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_HOLIDAYS) && (
            <MenuItem
              onClick={() => handleDelete(selectedHoliday)}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Add/Edit Holiday Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Holiday Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Independence Day"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(date) => setFormData({ ...formData, date: date })}
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Holiday Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    label="Holiday Type"
                    required
                  >
                    {holidayTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Applies To</InputLabel>
                  <Select
                    value={formData.applies_to}
                    onChange={(e) =>
                      setFormData({ ...formData, applies_to: e.target.value })
                    }
                    label="Applies To"
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
                  placeholder="Describe the holiday and its significance..."
                />
              </Grid>

              {/* Recurrence Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Recurrence Settings
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_recurring}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_recurring: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Recurring Holiday"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!formData.is_recurring}>
                  <InputLabel>Recurrence Pattern</InputLabel>
                  <Select
                    value={formData.recurrence_pattern}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurrence_pattern: e.target.value,
                      })
                    }
                    label="Recurrence Pattern"
                  >
                    {recurrencePatterns.map((pattern) => (
                      <MenuItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Options */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Holiday Options
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_optional}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_optional: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Optional Holiday"
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  multiline
                  rows={2}
                  placeholder="Any additional information or special instructions..."
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
              {editingHoliday ? "Update" : "Create"} Holiday
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Holiday Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Holiday Details - {selectedHoliday?.name}</DialogTitle>
          <DialogContent>
            {selectedHoliday && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Holiday Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Date
                            </Typography>
                            <Typography variant="h6">
                              {format(
                                new Date(selectedHoliday.date),
                                "EEEE, dd MMMM yyyy"
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Days Until
                            </Typography>
                            <Typography
                              variant="h6"
                              color={
                                selectedHoliday.days_until <= 7
                                  ? "error.main"
                                  : selectedHoliday.days_until <= 30
                                    ? "warning.main"
                                    : "text.primary"
                              }
                            >
                              {selectedHoliday.days_until > 0
                                ? `${selectedHoliday.days_until} days`
                                : "Past"}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Type
                            </Typography>
                            <Chip
                              label={
                                holidayTypes.find(
                                  (t) => t.value === selectedHoliday.type
                                )?.label
                              }
                              size="small"
                              color={
                                holidayTypes.find(
                                  (t) => t.value === selectedHoliday.type
                                )?.color
                              }
                              sx={{ mt: 0.5 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Recurrence
                            </Typography>
                            <Typography variant="body1">
                              {selectedHoliday.is_recurring
                                ? "Yearly"
                                : "One-time only"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Description
                            </Typography>
                            <Typography variant="body1">
                              {selectedHoliday.description}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Impact Summary
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Affected Employees
                          </Typography>
                          <Typography variant="h6">
                            {selectedHoliday.affected_employees}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Holiday Type
                          </Typography>
                          <Typography variant="body1">
                            {selectedHoliday.is_optional
                              ? "Optional"
                              : "Mandatory"}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Applicability
                          </Typography>
                          <Typography variant="body1">
                            {selectedHoliday.applies_to === "all_employees"
                              ? "All Employees"
                              : "Specific Groups"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={
                              selectedHoliday.is_active ? "Active" : "Inactive"
                            }
                            size="small"
                            color={
                              selectedHoliday.is_active ? "success" : "default"
                            }
                            sx={{ mt: 0.5 }}
                          />
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
            {hasPermission(PERMISSIONS.MANAGE_HOLIDAYS) && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEdit(selectedHoliday);
                }}
              >
                Edit Holiday
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Bulk Import Dialog */}
        <Dialog
          open={bulkImportOpen}
          onClose={() => setBulkImportOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Import Holiday Templates</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select a country or region to import their standard public
              holidays for the selected year.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    label="Year"
                  >
                    <MenuItem value={2024}>2024</MenuItem>
                    <MenuItem value={2025}>2025</MenuItem>
                    <MenuItem value={2026}>2026</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="body2">
                    Importing holidays will add new holidays to your calendar.
                    Existing holidays with the same date will not be duplicated.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkImportOpen(false)}>Cancel</Button>
            <Button
              onClick={() => handleBulkImport("TZ")}
              variant="contained"
              startIcon={<SyncIcon />}
            >
              Import Tanzania Holidays
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
    </LocalizationProvider>
  );
};

export default HolidaySettingsPage;