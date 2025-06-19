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
  Badge,
  Tooltip,
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
  ShoppingCart as RequisitionIcon,
  RequestQuote as QuoteIcon,
  Assignment as OrderIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Person as PersonIcon,
  Business as SupplierIcon,
  MonetizationOn as MoneyIcon,
  DateRange as DateIcon,
  Category as CategoryIcon,
  Priority as PriorityIcon,
  Inventory as ItemIcon,
  Send as SubmitIcon,
  Save as SaveIcon,
  AttachFile as AttachIcon,
  Notifications as NotificationIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, differenceInDays } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../../constants";
import useNotification from "../../../hooks/common/useNotification";
import useConfirmDialog from "../../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../../components/common/Loading";
// import { procurementAPI } from '../../../services/api/procurement.api';

const RequisitionManagementPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingRequisition, setEditingRequisition] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    requisition_number: "",
    title: "",
    description: "",
    department_id: "",
    requested_by: user?.id || "",
    priority: "medium",
    required_date: null,
    budget_id: "",
    estimated_cost: "",
    justification: "",
    status: "draft",
    notes: "",
  });

  const [requisitionItems, setRequisitionItems] = useState([
    {
      item_name: "",
      description: "",
      quantity: 1,
      unit_price: "",
      total_price: "",
      specifications: "",
    },
  ]);

  // Mock data for development
  const mockRequisitions = [
    {
      id: 1,
      requisition_number: "REQ-2024-001",
      title: "Office Laptops Purchase",
      description: "Purchase of 10 laptops for new employees",
      department: "IT Department",
      requested_by: "John Doe",
      priority: "high",
      required_date: "2024-08-15",
      created_date: "2024-06-15",
      estimated_cost: 12000000,
      actual_cost: 11500000,
      status: "approved",
      approval_stage: 3,
      total_stages: 3,
      items_count: 3,
      budget_code: "IT-2024-CAP",
      approved_by: "Jane Smith",
      approved_date: "2024-06-20",
    },
    {
      id: 2,
      requisition_number: "REQ-2024-002",
      title: "Office Supplies Replenishment",
      description: "Monthly office supplies for HR department",
      department: "HR Department",
      requested_by: "Sarah Wilson",
      priority: "medium",
      required_date: "2024-07-30",
      created_date: "2024-06-18",
      estimated_cost: 850000,
      actual_cost: null,
      status: "pending",
      approval_stage: 1,
      total_stages: 2,
      items_count: 8,
      budget_code: "HR-2024-OPS",
      approved_by: null,
      approved_date: null,
    },
    {
      id: 3,
      requisition_number: "REQ-2024-003",
      title: "Vehicle Maintenance",
      description: "Quarterly maintenance for field vehicles",
      department: "Operations",
      requested_by: "Mike Johnson",
      priority: "urgent",
      required_date: "2024-07-10",
      created_date: "2024-06-20",
      estimated_cost: 2500000,
      actual_cost: null,
      status: "draft",
      approval_stage: 0,
      total_stages: 3,
      items_count: 5,
      budget_code: "OPS-2024-MAINT",
      approved_by: null,
      approved_date: null,
    },
  ];

  // Requisition priorities
  const priorities = [
    { value: "low", label: "Low", color: "default" },
    { value: "medium", label: "Medium", color: "primary" },
    { value: "high", label: "High", color: "warning" },
    { value: "urgent", label: "Urgent", color: "error" },
  ];

  // Requisition statuses
  const statuses = [
    { value: "draft", label: "Draft", color: "default" },
    { value: "submitted", label: "Submitted", color: "info" },
    { value: "pending", label: "Pending Approval", color: "warning" },
    { value: "approved", label: "Approved", color: "success" },
    { value: "rejected", label: "Rejected", color: "error" },
    { value: "processing", label: "Processing", color: "primary" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "default" },
  ];

  // Approval stages
  const approvalStages = [
    "Department Head",
    "Finance Review",
    "Final Approval",
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Requisitions",
      value: mockRequisitions.length.toString(),
      icon: <RequisitionIcon />,
      color: "primary",
    },
    {
      title: "Pending Approval",
      value: mockRequisitions
        .filter((req) => req.status === "pending")
        .length.toString(),
      icon: <PendingIcon />,
      color: "warning",
    },
    {
      title: "This Month Value",
      value: `TZS ${mockRequisitions.reduce((sum, req) => sum + req.estimated_cost, 0).toLocaleString()}`,
      icon: <MoneyIcon />,
      color: "success",
    },
    {
      title: "Urgent Requests",
      value: mockRequisitions
        .filter((req) => req.priority === "urgent")
        .length.toString(),
      icon: <PriorityIcon />,
      color: "error",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "requisition_number",
      headerName: "Requisition #",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RequisitionIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.department}
          </Typography>
        </Box>
      ),
    },
    {
      field: "requested_by",
      headerName: "Requested By",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => {
        const priority = priorities.find((p) => p.value === params.value);
        return (
          <Chip
            label={priority?.label}
            size="small"
            color={priority?.color}
            variant="filled"
          />
        );
      },
    },
    {
      field: "estimated_cost",
      headerName: "Estimated Cost",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "required_date",
      headerName: "Required Date",
      width: 120,
      renderCell: (params) => {
        const daysUntilRequired = differenceInDays(
          new Date(params.value),
          new Date()
        );
        const isOverdue = daysUntilRequired < 0;
        return (
          <Box>
            <Typography
              variant="body2"
              color={isOverdue ? "error.main" : "text.primary"}
            >
              {format(new Date(params.value), "dd/MM/yyyy")}
            </Typography>
            {isOverdue && <Chip label="Overdue" size="small" color="error" />}
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = statuses.find((s) => s.value === params.value);
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
      field: "approval_progress",
      headerName: "Approval Progress",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">
            {params.row.approval_stage}/{params.row.total_stages}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[...Array(params.row.total_stages)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor:
                    index < params.row.approval_stage
                      ? "success.main"
                      : "grey.300",
                }}
              />
            ))}
          </Box>
        </Box>
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
            setSelectedRequisition(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load requisitions data
  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await procurementAPI.getPurchaseRequests();
      // setRequisitions(response.data || []);
      setRequisitions(mockRequisitions);
    } catch (error) {
      showError("Failed to fetch requisitions");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const requisitionData = {
        ...formData,
        items: requisitionItems,
      };

      if (editingRequisition) {
        // await procurementAPI.updatePurchaseRequest(editingRequisition.id, requisitionData);
        showSuccess("Requisition updated successfully");
      } else {
        // await procurementAPI.createPurchaseRequest(requisitionData);
        showSuccess("Requisition created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchRequisitions();
    } catch (error) {
      showError("Failed to save requisition");
    }
  };

  const resetForm = () => {
    setFormData({
      requisition_number: "",
      title: "",
      description: "",
      department_id: "",
      requested_by: user?.id || "",
      priority: "medium",
      required_date: null,
      budget_id: "",
      estimated_cost: "",
      justification: "",
      status: "draft",
      notes: "",
    });
    setRequisitionItems([
      {
        item_name: "",
        description: "",
        quantity: 1,
        unit_price: "",
        total_price: "",
        specifications: "",
      },
    ]);
    setEditingRequisition(null);
  };

  // Handle edit
  const handleEdit = (requisition) => {
    setFormData({ ...requisition });
    setEditingRequisition(requisition);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete
  const handleDelete = (requisition) => {
    openDialog({
      title: "Delete Requisition",
      message: `Are you sure you want to delete requisition "${requisition.title}"?`,
      onConfirm: async () => {
        try {
          // await procurementAPI.deletePurchaseRequest(requisition.id);
          showSuccess("Requisition deleted successfully");
          fetchRequisitions();
        } catch (error) {
          showError("Failed to delete requisition");
        }
      },
    });
    setAnchorEl(null);
  };

  // Handle approval actions
  const handleApprove = async (requisition) => {
    try {
      // await procurementAPI.approvePurchaseRequest(requisition.id);
      showSuccess("Requisition approved successfully");
      fetchRequisitions();
    } catch (error) {
      showError("Failed to approve requisition");
    }
    setAnchorEl(null);
  };

  const handleReject = async (requisition) => {
    try {
      // await procurementAPI.rejectPurchaseRequest(requisition.id);
      showSuccess("Requisition rejected");
      fetchRequisitions();
    } catch (error) {
      showError("Failed to reject requisition");
    }
    setAnchorEl(null);
  };

  // Add/Remove requisition items
  const addRequisitionItem = () => {
    setRequisitionItems([
      ...requisitionItems,
      {
        item_name: "",
        description: "",
        quantity: 1,
        unit_price: "",
        total_price: "",
        specifications: "",
      },
    ]);
  };

  const removeRequisitionItem = (index) => {
    setRequisitionItems(requisitionItems.filter((_, i) => i !== index));
  };

  const updateRequisitionItem = (index, field, value) => {
    const updatedItems = [...requisitionItems];
    updatedItems[index][field] = value;

    // Calculate total price
    if (field === "quantity" || field === "unit_price") {
      const quantity = updatedItems[index].quantity || 0;
      const unitPrice = updatedItems[index].unit_price || 0;
      updatedItems[index].total_price = quantity * unitPrice;
    }

    setRequisitionItems(updatedItems);

    // Update estimated cost
    const totalCost = updatedItems.reduce(
      (sum, item) => sum + (item.total_price || 0),
      0
    );
    setFormData((prev) => ({ ...prev, estimated_cost: totalCost }));
  };

  // Filter requisitions
  const filteredRequisitions = requisitions.filter((requisition) => {
    const matchesSearch =
      requisition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requisition.requisition_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      requisition.requested_by.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || requisition.status === statusFilter;
    const matchesPriority =
      !priorityFilter || requisition.priority === priorityFilter;
    const matchesDepartment =
      !departmentFilter ||
      requisition.department
        .toLowerCase()
        .includes(departmentFilter.toLowerCase());

    return (
      matchesSearch && matchesStatus && matchesPriority && matchesDepartment
    );
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
            Requisition Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, manage, and track purchase requisitions through approval
            workflow
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
                    placeholder="Search requisitions..."
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
                      {statuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="">All Priorities</MenuItem>
                      {priorities.map((priority) => (
                        <MenuItem key={priority.value} value={priority.value}>
                          {priority.label}
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
                    {hasPermission(PERMISSIONS.MANAGE_PURCHASE_REQUESTS) && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                      >
                        New Requisition
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

            {/* Requisitions Table */}
            <Box sx={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={filteredRequisitions}
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
          {hasPermission(PERMISSIONS.MANAGE_PURCHASE_REQUESTS) &&
            selectedRequisition?.status === "draft" && (
              <MenuItem onClick={() => handleEdit(selectedRequisition)}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Requisition</ListItemText>
              </MenuItem>
            )}
          {selectedRequisition?.status === "pending" &&
            hasPermission(PERMISSIONS.APPROVE_PURCHASE_REQUESTS) && (
              <>
                <Divider />
                <MenuItem onClick={() => handleApprove(selectedRequisition)}>
                  <ListItemIcon>
                    <ApprovedIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>Approve</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleReject(selectedRequisition)}>
                  <ListItemIcon>
                    <RejectedIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Reject</ListItemText>
                </MenuItem>
              </>
            )}
          {selectedRequisition?.status === "approved" && (
            <MenuItem onClick={() => navigate("/procurement/quotations")}>
              <ListItemIcon>
                <QuoteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Get Quotations</ListItemText>
            </MenuItem>
          )}
          <Divider />
          <MenuItem
            onClick={() => {
              /* Print requisition */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_PURCHASE_REQUESTS) &&
            selectedRequisition?.status === "draft" && (
              <MenuItem
                onClick={() => handleDelete(selectedRequisition)}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
        </Menu>

        {/* Add/Edit Requisition Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            {editingRequisition ? "Edit Requisition" : "Create New Requisition"}
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
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    label="Priority"
                    required
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {priority.label}
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department_id}
                  onChange={(e) =>
                    setFormData({ ...formData, department_id: e.target.value })
                  }
                  select
                  required
                >
                  <MenuItem value="1">IT Department</MenuItem>
                  <MenuItem value="2">HR Department</MenuItem>
                  <MenuItem value="3">Finance Department</MenuItem>
                  <MenuItem value="4">Operations</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Required Date"
                  value={formData.required_date}
                  onChange={(date) =>
                    setFormData({ ...formData, required_date: date })
                  }
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Budget Code"
                  value={formData.budget_id}
                  onChange={(e) =>
                    setFormData({ ...formData, budget_id: e.target.value })
                  }
                  placeholder="e.g., IT-2024-CAP"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Cost (TZS)"
                  type="number"
                  value={formData.estimated_cost}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_cost: e.target.value })
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              {/* Requisition Items */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 3,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Requisition Items</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addRequisitionItem}
                    size="small"
                  >
                    Add Item
                  </Button>
                </Box>
              </Grid>

              {requisitionItems.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1">
                        Item {index + 1}
                      </Typography>
                      {requisitionItems.length > 1 && (
                        <Button
                          color="error"
                          onClick={() => removeRequisitionItem(index)}
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Item Name"
                          value={item.item_name}
                          onChange={(e) =>
                            updateRequisitionItem(
                              index,
                              "item_name",
                              e.target.value
                            )
                          }
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={item.description}
                          onChange={(e) =>
                            updateRequisitionItem(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateRequisitionItem(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Unit Price (TZS)"
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateRequisitionItem(
                              index,
                              "unit_price",
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Total Price (TZS)"
                          type="number"
                          value={item.total_price}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                          }}
                        >
                          <Typography variant="h6" color="primary">
                            TZS {(item.total_price || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Specifications"
                          value={item.specifications}
                          onChange={(e) =>
                            updateRequisitionItem(
                              index,
                              "specifications",
                              e.target.value
                            )
                          }
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}

              {/* Justification */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Justification & Notes
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Justification"
                  value={formData.justification}
                  onChange={(e) =>
                    setFormData({ ...formData, justification: e.target.value })
                  }
                  multiline
                  rows={3}
                  placeholder="Provide justification for this requisition..."
                  required
                />
              </Grid>
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
                  placeholder="Any additional notes or requirements..."
                />
              </Grid>

              {/* Summary */}
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{ p: 2, mt: 2, bgcolor: "grey.50" }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Requisition Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Items
                      </Typography>
                      <Typography variant="h6">
                        {requisitionItems.length}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Estimated Cost
                      </Typography>
                      <Typography variant="h6" color="primary">
                        TZS {(formData.estimated_cost || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
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
              Submit for Approval
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Requisition Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Requisition Details - {selectedRequisition?.requisition_number}
          </DialogTitle>
          <DialogContent>
            {selectedRequisition && (
              <Box>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                >
                  <Tab label="Overview" />
                  <Tab label="Items" />
                  <Tab label="Approval History" />
                  <Tab label="Documents" />
                </Tabs>

                {/* Overview Tab */}
                {activeTab === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Requisition Information
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Title
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {selectedRequisition.title}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Department
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {selectedRequisition.department}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Requested By
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 2,
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {selectedRequisition.requested_by?.charAt(
                                      0
                                    )}
                                  </Avatar>
                                  <Typography variant="body1">
                                    {selectedRequisition.requested_by}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Priority
                                </Typography>
                                <Chip
                                  label={
                                    priorities.find(
                                      (p) =>
                                        p.value === selectedRequisition.priority
                                    )?.label
                                  }
                                  size="small"
                                  color={
                                    priorities.find(
                                      (p) =>
                                        p.value === selectedRequisition.priority
                                    )?.color
                                  }
                                  sx={{ mb: 2 }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Required Date
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {format(
                                    new Date(selectedRequisition.required_date),
                                    "dd/MM/yyyy"
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Created Date
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {format(
                                    new Date(selectedRequisition.created_date),
                                    "dd/MM/yyyy"
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Description
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {selectedRequisition.description}
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
                              Financial Summary
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Budget Code
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 1 }}>
                                {selectedRequisition.budget_code}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Estimated Cost
                              </Typography>
                              <Typography variant="h6" color="primary">
                                TZS{" "}
                                {selectedRequisition.estimated_cost?.toLocaleString()}
                              </Typography>
                            </Box>
                            {selectedRequisition.actual_cost && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Actual Cost
                                </Typography>
                                <Typography variant="h6" color="success.main">
                                  TZS{" "}
                                  {selectedRequisition.actual_cost?.toLocaleString()}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Status
                              </Typography>
                              <Chip
                                label={
                                  statuses.find(
                                    (s) =>
                                      s.value === selectedRequisition.status
                                  )?.label
                                }
                                size="small"
                                color={
                                  statuses.find(
                                    (s) =>
                                      s.value === selectedRequisition.status
                                  )?.color
                                }
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </CardContent>
                        </Card>

                        {/* Approval Progress */}
                        <Card variant="outlined" sx={{ mt: 2 }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Approval Progress
                            </Typography>
                            <Stepper
                              activeStep={selectedRequisition.approval_stage}
                              orientation="vertical"
                            >
                              {approvalStages.map((stage, index) => (
                                <Step key={index}>
                                  <StepLabel>{stage}</StepLabel>
                                </Step>
                              ))}
                            </Stepper>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Items Tab */}
                {activeTab === 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Requisition Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="center">Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* Mock items data */}
                          <TableRow>
                            <TableCell>Dell Latitude 5520</TableCell>
                            <TableCell>
                              Business laptop with i7 processor
                            </TableCell>
                            <TableCell align="center">10</TableCell>
                            <TableCell align="right">TZS 1,200,000</TableCell>
                            <TableCell align="right">TZS 12,000,000</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} sx={{ fontWeight: "bold" }}>
                              Total
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: "bold" }}
                            >
                              TZS{" "}
                              {selectedRequisition.estimated_cost?.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Approval History Tab */}
                {activeTab === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Approval History
                    </Typography>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Approval history will be displayed here showing each
                        approval stage, approver, and timestamp.
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Documents Tab */}
                {activeTab === 3 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Related Documents
                    </Typography>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Uploaded documents and attachments related to this
                        requisition will be displayed here.
                      </Typography>
                    </Alert>
                  </Box>
                )}
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
            {hasPermission(PERMISSIONS.MANAGE_PURCHASE_REQUESTS) &&
              selectedRequisition?.status === "draft" && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(selectedRequisition);
                  }}
                >
                  Edit Requisition
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

export default RequisitionManagementPage;
