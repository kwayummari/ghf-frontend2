import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Flight as TravelIcon,
  Business as BusinessIcon,
  Hotel as AccommodationIcon,
  DirectionsCar as TransportIcon,
  Restaurant as MealsIcon,
  AttachMoney as AdvanceIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Person as PersonIcon,
  DateRange as DateIcon,
  LocationOn as LocationIcon,
  Assignment as ReportIcon,
  Send as SubmitIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  AttachFile as AttachIcon,
  MonetizationOn as CostIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, differenceInDays, addDays } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../../constants";
import useNotification from "../../../hooks/common/useNotification";
import useConfirmDialog from "../../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../../components/common/Loading";
// import { travelAPI } from '../../../services/api/travel.api';

const TravelRequestsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [travelRequests, setTravelRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    request_type: "business",
    title: "",
    purpose: "",
    destination: "",
    departure_date: null,
    return_date: null,
    traveler_name: user?.full_name || "",
    department: user?.department || "",
    employee_id: user?.employee_id || "",
    estimated_cost: "",
    accommodation_required: true,
    transport_required: true,
    meals_required: true,
    advance_required: false,
    advance_amount: "",
    justification: "",
    urgency: "normal",
    budget_code: "",
    notes: "",
  });

  const [travelExpenses, setTravelExpenses] = useState([
    {
      category: "accommodation",
      description: "",
      estimated_amount: "",
      duration: 1,
      notes: "",
    },
  ]);

  // Mock data for development
  const mockTravelRequests = [
    {
      id: 1,
      request_number: "TR-2024-001",
      title: "Client Meeting in Nairobi",
      purpose: "Business development meeting with key client",
      request_type: "business",
      traveler_name: "John Doe",
      employee_id: "EMP001",
      department: "Sales",
      destination: "Nairobi, Kenya",
      departure_date: "2024-07-15",
      return_date: "2024-07-17",
      duration_days: 3,
      estimated_cost: 450000,
      actual_cost: null,
      status: "approved",
      urgency: "high",
      advance_required: true,
      advance_amount: 300000,
      advance_status: "approved",
      accommodation_required: true,
      transport_required: true,
      meals_required: true,
      created_date: "2024-06-20",
      approved_date: "2024-06-22",
      approved_by: "Jane Smith",
      budget_code: "SALES-2024-TRV",
    },
    {
      id: 2,
      request_number: "TR-2024-002",
      title: "Training Workshop in Mwanza",
      purpose: "Attend project management certification workshop",
      request_type: "training",
      traveler_name: "Sarah Wilson",
      employee_id: "EMP002",
      department: "IT Department",
      destination: "Mwanza, Tanzania",
      departure_date: "2024-07-20",
      return_date: "2024-07-22",
      duration_days: 3,
      estimated_cost: 320000,
      actual_cost: null,
      status: "pending",
      urgency: "normal",
      advance_required: true,
      advance_amount: 200000,
      advance_status: "pending",
      accommodation_required: true,
      transport_required: true,
      meals_required: true,
      created_date: "2024-06-25",
      approved_date: null,
      approved_by: null,
      budget_code: "IT-2024-TRN",
    },
    {
      id: 3,
      request_number: "TR-2024-003",
      title: "Field Assessment in Dodoma",
      purpose: "Project site assessment and community engagement",
      request_type: "field_work",
      traveler_name: "Mike Johnson",
      employee_id: "EMP003",
      department: "Field Operations",
      destination: "Dodoma, Tanzania",
      departure_date: "2024-07-25",
      return_date: "2024-07-28",
      duration_days: 4,
      estimated_cost: 280000,
      actual_cost: null,
      status: "draft",
      urgency: "normal",
      advance_required: false,
      advance_amount: 0,
      advance_status: null,
      accommodation_required: true,
      transport_required: true,
      meals_required: true,
      created_date: "2024-06-28",
      approved_date: null,
      approved_by: null,
      budget_code: "OPS-2024-FLD",
    },
  ];

  // Travel request types
  const requestTypes = [
    { value: "business", label: "Business Travel", icon: <BusinessIcon /> },
    { value: "training", label: "Training/Conference", icon: <ReportIcon /> },
    { value: "field_work", label: "Field Work", icon: <LocationIcon /> },
    { value: "emergency", label: "Emergency Travel", icon: <MoreVertIcon /> },
  ];

  // Request statuses
  const requestStatuses = [
    { value: "draft", label: "Draft", color: "default" },
    { value: "submitted", label: "Submitted", color: "info" },
    { value: "pending", label: "Pending Approval", color: "warning" },
    { value: "approved", label: "Approved", color: "success" },
    { value: "rejected", label: "Rejected", color: "error" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "default" },
  ];

  // Urgency levels
  const urgencyLevels = [
    { value: "low", label: "Low", color: "default" },
    { value: "normal", label: "Normal", color: "primary" },
    { value: "high", label: "High", color: "warning" },
    { value: "urgent", label: "Urgent", color: "error" },
  ];

  // Travel form steps
  const formSteps = [
    "Basic Information",
    "Travel Details",
    "Expenses & Advance",
    "Review & Submit",
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Requests",
      value: mockTravelRequests.length.toString(),
      icon: <TravelIcon />,
      color: "primary",
    },
    {
      title: "Pending Approval",
      value: mockTravelRequests
        .filter((req) => req.status === "pending")
        .length.toString(),
      icon: <PendingIcon />,
      color: "warning",
    },
    {
      title: "This Month Cost",
      value: `TZS ${mockTravelRequests.reduce((sum, req) => sum + (req.actual_cost || req.estimated_cost), 0).toLocaleString()}`,
      icon: <CostIcon />,
      color: "success",
    },
    {
      title: "Advance Requests",
      value: mockTravelRequests
        .filter((req) => req.advance_required)
        .length.toString(),
      icon: <AdvanceIcon />,
      color: "info",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "request_number",
      headerName: "Request #",
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TravelIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "traveler_info",
      headerName: "Traveler",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.traveler_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.department} • {params.row.employee_id}
          </Typography>
        </Box>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Chip
            label={
              requestTypes.find(
                (type) => type.value === params.row.request_type
              )?.label
            }
            size="small"
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
      ),
    },
    {
      field: "destination",
      headerName: "Destination",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocationIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "travel_dates",
      headerName: "Travel Dates",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {format(new Date(params.row.departure_date), "dd/MM/yyyy")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            to {format(new Date(params.row.return_date), "dd/MM/yyyy")}
          </Typography>
        </Box>
      ),
    },
    {
      field: "duration_days",
      headerName: "Duration",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value} day{params.value > 1 ? "s" : ""}
        </Typography>
      ),
    },
    {
      field: "estimated_cost",
      headerName: "Est. Cost",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "urgency",
      headerName: "Urgency",
      width: 100,
      renderCell: (params) => {
        const urgency = urgencyLevels.find((u) => u.value === params.value);
        return (
          <Chip
            label={urgency?.label}
            size="small"
            color={urgency?.color}
            variant="filled"
          />
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = requestStatuses.find((s) => s.value === params.value);
        return (
          <Chip
            label={status?.label}
            size="small"
            color={status?.color}
            variant="filled"
          />
        );
      },
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
            setSelectedRequest(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load travel requests data
  useEffect(() => {
    fetchTravelRequests();
  }, []);

  const fetchTravelRequests = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await travelAPI.getTravelRequests();
      // setTravelRequests(response.data || []);
      setTravelRequests(mockTravelRequests);
    } catch (error) {
      showError("Failed to fetch travel requests");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const requestData = {
        ...formData,
        expenses: travelExpenses,
        duration_days:
          formData.return_date && formData.departure_date
            ? differenceInDays(
                new Date(formData.return_date),
                new Date(formData.departure_date)
              ) + 1
            : 1,
      };

      if (editingRequest) {
        // await travelAPI.updateTravelRequest(editingRequest.id, requestData);
        showSuccess("Travel request updated successfully");
      } else {
        // await travelAPI.createTravelRequest(requestData);
        showSuccess("Travel request created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchTravelRequests();
    } catch (error) {
      showError("Failed to save travel request");
    }
  };

  const resetForm = () => {
    setFormData({
      request_type: "business",
      title: "",
      purpose: "",
      destination: "",
      departure_date: null,
      return_date: null,
      traveler_name: user?.full_name || "",
      department: user?.department || "",
      employee_id: user?.employee_id || "",
      estimated_cost: "",
      accommodation_required: true,
      transport_required: true,
      meals_required: true,
      advance_required: false,
      advance_amount: "",
      justification: "",
      urgency: "normal",
      budget_code: "",
      notes: "",
    });
    setTravelExpenses([
      {
        category: "accommodation",
        description: "",
        estimated_amount: "",
        duration: 1,
        notes: "",
      },
    ]);
    setEditingRequest(null);
    setActiveStep(0);
  };

  // Handle edit
  const handleEdit = (request) => {
    setFormData({ ...request });
    setEditingRequest(request);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete
  const handleDelete = (request) => {
    openDialog({
      title: "Delete Travel Request",
      message: `Are you sure you want to delete travel request "${request.title}"?`,
      onConfirm: async () => {
        try {
          // await travelAPI.deleteTravelRequest(request.id);
          showSuccess("Travel request deleted successfully");
          fetchTravelRequests();
        } catch (error) {
          showError("Failed to delete travel request");
        }
      },
    });
    setAnchorEl(null);
  };

  // Handle approval actions
  const handleApprove = async (request) => {
    try {
      // await travelAPI.approveTravelRequest(request.id);
      showSuccess("Travel request approved successfully");
      fetchTravelRequests();
    } catch (error) {
      showError("Failed to approve travel request");
    }
    setAnchorEl(null);
  };

  const handleReject = async (request) => {
    try {
      // await travelAPI.rejectTravelRequest(request.id);
      showSuccess("Travel request rejected");
      fetchTravelRequests();
    } catch (error) {
      showError("Failed to reject travel request");
    }
    setAnchorEl(null);
  };

  // Add/Remove expense items
  const addExpenseItem = () => {
    setTravelExpenses([
      ...travelExpenses,
      {
        category: "transport",
        description: "",
        estimated_amount: "",
        duration: 1,
        notes: "",
      },
    ]);
  };

  const removeExpenseItem = (index) => {
    setTravelExpenses(travelExpenses.filter((_, i) => i !== index));
  };

  const updateExpenseItem = (index, field, value) => {
    const updatedExpenses = [...travelExpenses];
    updatedExpenses[index][field] = value;
    setTravelExpenses(updatedExpenses);

    // Update estimated cost
    const totalCost = updatedExpenses.reduce(
      (sum, expense) => sum + (parseFloat(expense.estimated_amount) || 0),
      0
    );
    setFormData((prev) => ({ ...prev, estimated_cost: totalCost }));
  };

  // Filter travel requests
  const filteredTravelRequests = travelRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.traveler_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesType = !typeFilter || request.request_type === typeFilter;
    const matchesDepartment =
      !departmentFilter ||
      request.department.toLowerCase().includes(departmentFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType && matchesDepartment;
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
            Travel Requests Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage employee travel requests, approvals, and expense tracking
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
                    placeholder="Search travel requests..."
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
                      <MenuItem value="">All Statuses</MenuItem>
                      {requestStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
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
                      {requestTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Department"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {hasPermission(PERMISSIONS.MANAGE_TRAVEL_REQUESTS) && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                      >
                        New Request
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<AdvanceIcon />}
                      onClick={() => navigate("/finance/travel/advances")}
                    >
                      Advances
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
              <Tab label="Travel Requests" />
              <Tab label="Approval Workflow" />
              <Tab label="Travel Reports" />
            </Tabs>

            {/* Travel Requests Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredTravelRequests}
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

            {/* Approval Workflow Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Travel request approval workflow and status tracking will be
                    displayed here.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* Travel Reports Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Travel analytics, expense reports, and compliance tracking
                    will be displayed here.
                  </Typography>
                </Alert>
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
          {hasPermission(PERMISSIONS.MANAGE_TRAVEL_REQUESTS) &&
            selectedRequest?.status === "draft" && (
              <MenuItem onClick={() => handleEdit(selectedRequest)}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Request</ListItemText>
              </MenuItem>
            )}
          {selectedRequest?.status === "pending" &&
            hasPermission(PERMISSIONS.APPROVE_TRAVEL_REQUESTS) && (
              <>
                <Divider />
                <MenuItem onClick={() => handleApprove(selectedRequest)}>
                  <ListItemIcon>
                    <ApprovedIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>Approve</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleReject(selectedRequest)}>
                  <ListItemIcon>
                    <RejectedIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Reject</ListItemText>
                </MenuItem>
              </>
            )}
          {selectedRequest?.advance_required && (
            <MenuItem
              onClick={() =>
                navigate(
                  `/finance/travel/advances?requestId=${selectedRequest?.id}`
                )
              }
            >
              <ListItemIcon>
                <AdvanceIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Manage Advance</ListItemText>
            </MenuItem>
          )}
          <Divider />
          <MenuItem
            onClick={() => {
              /* Print travel request */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Request</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_TRAVEL_REQUESTS) &&
            selectedRequest?.status === "draft" && (
              <MenuItem
                onClick={() => handleDelete(selectedRequest)}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete Request</ListItemText>
              </MenuItem>
            )}
        </Menu>

        {/* Add/Edit Travel Request Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            {editingRequest ? "Edit Travel Request" : "Create Travel Request"}
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {formSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Request Type</InputLabel>
                    <Select
                      value={formData.request_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          request_type: e.target.value,
                        })
                      }
                      label="Request Type"
                      required
                    >
                      {requestTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {type.icon}
                            {type.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Urgency</InputLabel>
                    <Select
                      value={formData.urgency}
                      onChange={(e) =>
                        setFormData({ ...formData, urgency: e.target.value })
                      }
                      label="Urgency"
                    >
                      {urgencyLevels.map((urgency) => (
                        <MenuItem key={urgency.value} value={urgency.value}>
                          {urgency.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Travel Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="e.g., Client Meeting in Nairobi"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Purpose of Travel"
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                    multiline
                    rows={3}
                    required
                    placeholder="Describe the purpose and objectives of this travel..."
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Traveler Name"
                    value={formData.traveler_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        traveler_name: e.target.value,
                      })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    required
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 2: Travel Details */}
            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Destination"
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    required
                    placeholder="e.g., Nairobi, Kenya"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Departure Date"
                    value={formData.departure_date}
                    onChange={(date) =>
                      setFormData({ ...formData, departure_date: date })
                    }
                    slotProps={{
                      textField: { fullWidth: true, required: true },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Return Date"
                    value={formData.return_date}
                    onChange={(date) =>
                      setFormData({ ...formData, return_date: date })
                    }
                    slotProps={{
                      textField: { fullWidth: true, required: true },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Required Services
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <FormControl component="fieldset">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <AccommodationIcon />
                          <Typography variant="body2">Accommodation</Typography>
                          <input
                            type="checkbox"
                            checked={formData.accommodation_required}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                accommodation_required: e.target.checked,
                              })
                            }
                          />
                        </Box>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl component="fieldset">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <TransportIcon />
                          <Typography variant="body2">Transport</Typography>
                          <input
                            type="checkbox"
                            checked={formData.transport_required}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                transport_required: e.target.checked,
                              })
                            }
                          />
                        </Box>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl component="fieldset">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <MealsIcon />
                          <Typography variant="body2">Meals</Typography>
                          <input
                            type="checkbox"
                            checked={formData.meals_required}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                meals_required: e.target.checked,
                              })
                            }
                          />
                        </Box>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Budget Code"
                    value={formData.budget_code}
                    onChange={(e) =>
                      setFormData({ ...formData, budget_code: e.target.value })
                    }
                    placeholder="e.g., SALES-2024-TRV"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={formData.employee_id}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_id: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 3: Expenses & Advance */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Travel Expenses Breakdown
                </Typography>

                {travelExpenses.map((expense, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1">
                        Expense Item {index + 1}
                      </Typography>
                      {travelExpenses.length > 1 && (
                        <Button
                          color="error"
                          onClick={() => removeExpenseItem(index)}
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={expense.category}
                            onChange={(e) =>
                              updateExpenseItem(
                                index,
                                "category",
                                e.target.value
                              )
                            }
                            label="Category"
                          >
                            <MenuItem value="accommodation">
                              Accommodation
                            </MenuItem>
                            <MenuItem value="transport">Transport</MenuItem>
                            <MenuItem value="meals">Meals</MenuItem>
                            <MenuItem value="conference_fees">
                              Conference/Training Fees
                            </MenuItem>
                            <MenuItem value="incidentals">Incidentals</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={expense.description}
                          onChange={(e) =>
                            updateExpenseItem(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Brief description of expense"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Estimated Amount (TZS)"
                          type="number"
                          value={expense.estimated_amount}
                          onChange={(e) =>
                            updateExpenseItem(
                              index,
                              "estimated_amount",
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Duration (days)"
                          type="number"
                          value={expense.duration}
                          onChange={(e) =>
                            updateExpenseItem(index, "duration", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                          }}
                        >
                          <Typography variant="h6" color="primary">
                            TZS{" "}
                            {(expense.estimated_amount || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Notes"
                          value={expense.notes}
                          onChange={(e) =>
                            updateExpenseItem(index, "notes", e.target.value)
                          }
                          placeholder="Additional notes for this expense"
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addExpenseItem}
                  sx={{ mb: 3 }}
                >
                  Add Expense Item
                </Button>

                {/* Travel Advance Section */}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Travel Advance Request
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.advance_required}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              advance_required: e.target.checked,
                            })
                          }
                        />
                        <Typography variant="body2">
                          I request a travel advance for this trip
                        </Typography>
                      </Box>
                    </FormControl>
                  </Grid>
                  {formData.advance_required && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Advance Amount (TZS)"
                          type="number"
                          value={formData.advance_amount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              advance_amount: e.target.value,
                            })
                          }
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 2 }}
                        >
                          Recommended: 70% of estimated total cost
                          <br />
                          Est. Total: TZS{" "}
                          {formData.estimated_cost?.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Advance Justification"
                          value={formData.justification}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              justification: e.target.value,
                            })
                          }
                          multiline
                          rows={2}
                          placeholder="Justify why you need this advance amount..."
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}

            {/* Step 4: Review & Submit */}
            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Review Travel Request
                </Typography>

                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Travel Summary
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Title
                        </Typography>
                        <Typography variant="body1">
                          {formData.title}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Destination
                        </Typography>
                        <Typography variant="body1">
                          {formData.destination}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Traveler
                        </Typography>
                        <Typography variant="body1">
                          {formData.traveler_name} ({formData.department})
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Travel Dates
                        </Typography>
                        <Typography variant="body1">
                          {formData.departure_date
                            ? format(
                                new Date(formData.departure_date),
                                "dd/MM/yyyy"
                              )
                            : "Not set"}{" "}
                          -
                          {formData.return_date
                            ? format(
                                new Date(formData.return_date),
                                "dd/MM/yyyy"
                              )
                            : "Not set"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Financial Summary
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Estimated Cost
                        </Typography>
                        <Typography variant="h6" color="primary">
                          TZS {(formData.estimated_cost || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Advance Requested
                        </Typography>
                        <Typography
                          variant="h6"
                          color={
                            formData.advance_required
                              ? "warning.main"
                              : "text.secondary"
                          }
                        >
                          {formData.advance_required
                            ? `TZS ${(formData.advance_amount || 0).toLocaleString()}`
                            : "No advance requested"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    multiline
                    rows={3}
                    placeholder="Any additional information or special requirements..."
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            {activeStep > 0 && (
              <Button onClick={() => setActiveStep(activeStep - 1)}>
                Back
              </Button>
            )}
            {activeStep < formSteps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setFormData({ ...formData, status: "draft" });
                    handleSubmit();
                  }}
                  variant="outlined"
                  startIcon={<SaveIcon />}
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() => {
                    setFormData({ ...formData, status: "submitted" });
                    handleSubmit();
                  }}
                  variant="contained"
                  startIcon={<SubmitIcon />}
                >
                  Submit Request
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* View Travel Request Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Travel Request Details - {selectedRequest?.request_number}
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Travel Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Title
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedRequest.title}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Type
                            </Typography>
                            <Chip
                              label={
                                requestTypes.find(
                                  (type) =>
                                    type.value === selectedRequest.request_type
                                )?.label
                              }
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Purpose
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedRequest.purpose}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Destination
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedRequest.destination}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Duration
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {selectedRequest.duration_days} days
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Departure Date
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {format(
                                new Date(selectedRequest.departure_date),
                                "dd/MM/yyyy"
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Return Date
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {format(
                                new Date(selectedRequest.return_date),
                                "dd/MM/yyyy"
                              )}
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
                          Traveler Details
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Name
                          </Typography>
                          <Typography variant="body1">
                            {selectedRequest.traveler_name}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Employee ID
                          </Typography>
                          <Typography variant="body1">
                            {selectedRequest.employee_id}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Department
                          </Typography>
                          <Typography variant="body1">
                            {selectedRequest.department}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={
                              requestStatuses.find(
                                (s) => s.value === selectedRequest.status
                              )?.label
                            }
                            size="small"
                            color={
                              requestStatuses.find(
                                (s) => s.value === selectedRequest.status
                              )?.color
                            }
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Financial Details
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Estimated Cost
                          </Typography>
                          <Typography variant="h6" color="primary">
                            TZS{" "}
                            {selectedRequest.estimated_cost?.toLocaleString()}
                          </Typography>
                        </Box>
                        {selectedRequest.advance_required && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Advance Amount
                            </Typography>
                            <Typography variant="h6" color="warning.main">
                              TZS{" "}
                              {selectedRequest.advance_amount?.toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Budget Code
                          </Typography>
                          <Typography variant="body1">
                            {selectedRequest.budget_code}
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
                /* Print travel request */
              }}
            >
              Print Request
            </Button>
            {hasPermission(PERMISSIONS.MANAGE_TRAVEL_REQUESTS) &&
              selectedRequest?.status === "draft" && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(selectedRequest);
                  }}
                >
                  Edit Request
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
    </LocalizationProvider>
  );
};

export default TravelRequestsPage;
