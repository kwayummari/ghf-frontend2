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
  Badge,
  Tooltip,
  Rating,
  LinearProgress,
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
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as WarningIcon,
  Assignment as ContractIcon,
  MonetizationOn as MoneyIcon,
  Category as CategoryIcon,
  Assessment as PerformanceIcon,
  History as HistoryIcon,
  ContactPhone as ContactIcon,
  AttachFile as AttachFileIcon,
  Public as WebsiteIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, differenceInDays } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";
// import { supplierAPI } from '../../../services/api/supplier.api';

const SuppliersPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    supplier_id: "",
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    website: "",
    tax_id: "",
    registration_number: "",
    category: "",
    supplier_type: "vendor",
    payment_terms: "30",
    currency: "TZS",
    credit_limit: "",
    bank_name: "",
    bank_account: "",
    status: "active",
    notes: "",
  });

  // Mock data for development
  const mockSuppliers = [
    {
      id: 1,
      supplier_id: "SUP-001",
      company_name: "Tech Solutions Ltd",
      contact_person: "John Mwangi",
      email: "john@techsolutions.co.tz",
      phone: "+255 123 456 789",
      address: "123 Business Street, Msimbazi",
      city: "Dar es Salaam",
      country: "Tanzania",
      postal_code: "12345",
      website: "www.techsolutions.co.tz",
      category: "IT Equipment",
      supplier_type: "vendor",
      payment_terms: "30",
      currency: "TZS",
      credit_limit: 5000000,
      status: "active",
      rating: 4.5,
      total_orders: 25,
      total_value: 45000000,
      last_order_date: "2024-06-15",
      performance_score: 92,
      on_time_delivery: 95,
      quality_rating: 4.6,
      created_at: "2023-01-15",
      contract_expiry: "2025-01-15",
    },
    {
      id: 2,
      supplier_id: "SUP-002",
      company_name: "Office Supplies Co",
      contact_person: "Sarah Johnson",
      email: "sarah@officesupplies.co.tz",
      phone: "+255 987 654 321",
      address: "456 Supply Avenue, Kinondoni",
      city: "Dar es Salaam",
      country: "Tanzania",
      postal_code: "67890",
      website: "www.officesupplies.co.tz",
      category: "Office Supplies",
      supplier_type: "vendor",
      payment_terms: "15",
      currency: "TZS",
      credit_limit: 2000000,
      status: "active",
      rating: 4.2,
      total_orders: 18,
      total_value: 12000000,
      last_order_date: "2024-06-10",
      performance_score: 88,
      on_time_delivery: 89,
      quality_rating: 4.3,
      created_at: "2023-03-20",
      contract_expiry: "2024-12-31",
    },
    {
      id: 3,
      supplier_id: "SUP-003",
      company_name: "Auto Garage Ltd",
      contact_person: "Michael Kiwanga",
      email: "mike@autogarage.co.tz",
      phone: "+255 555 123 456",
      address: "789 Mechanic Road, Temeke",
      city: "Dar es Salaam",
      country: "Tanzania",
      postal_code: "54321",
      website: "www.autogarage.co.tz",
      category: "Vehicle Services",
      supplier_type: "service_provider",
      payment_terms: "7",
      currency: "TZS",
      credit_limit: 1500000,
      status: "active",
      rating: 4.8,
      total_orders: 12,
      total_value: 8500000,
      last_order_date: "2024-06-18",
      performance_score: 96,
      on_time_delivery: 98,
      quality_rating: 4.9,
      created_at: "2023-05-10",
      contract_expiry: "2025-05-10",
    },
    {
      id: 4,
      supplier_id: "SUP-004",
      company_name: "Stationery Plus",
      contact_person: "Grace Mwalimu",
      email: "grace@stationeryplus.co.tz",
      phone: "+255 777 888 999",
      address: "321 Paper Street, Ilala",
      city: "Dar es Salaam",
      country: "Tanzania",
      postal_code: "98765",
      website: "www.stationeryplus.co.tz",
      category: "Office Supplies",
      supplier_type: "vendor",
      payment_terms: "30",
      currency: "TZS",
      credit_limit: 1000000,
      status: "inactive",
      rating: 3.8,
      total_orders: 8,
      total_value: 3200000,
      last_order_date: "2024-03-22",
      performance_score: 76,
      on_time_delivery: 78,
      quality_rating: 3.9,
      created_at: "2023-08-15",
      contract_expiry: "2024-08-15",
    },
  ];

  // Supplier categories
  const supplierCategories = [
    "IT Equipment",
    "Office Supplies",
    "Vehicle Services",
    "Construction Materials",
    "Professional Services",
    "Utilities",
    "Catering Services",
    "Cleaning Services",
    "Security Services",
    "Maintenance Services",
    "Medical Supplies",
    "Educational Materials",
  ];

  // Supplier types
  const supplierTypes = [
    { value: "vendor", label: "Vendor" },
    { value: "service_provider", label: "Service Provider" },
    { value: "contractor", label: "Contractor" },
    { value: "consultant", label: "Consultant" },
  ];

  // Supplier statuses
  const supplierStatuses = [
    { value: "active", label: "Active", color: "success" },
    { value: "inactive", label: "Inactive", color: "default" },
    { value: "pending", label: "Pending Approval", color: "warning" },
    { value: "suspended", label: "Suspended", color: "error" },
    { value: "blacklisted", label: "Blacklisted", color: "error" },
  ];

  // Payment terms
  const paymentTerms = [
    { value: "0", label: "Cash on Delivery" },
    { value: "7", label: "7 Days" },
    { value: "15", label: "15 Days" },
    { value: "30", label: "30 Days" },
    { value: "45", label: "45 Days" },
    { value: "60", label: "60 Days" },
    { value: "90", label: "90 Days" },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Suppliers",
      value: mockSuppliers.length.toString(),
      subtitle: `${mockSuppliers.filter((s) => s.status === "active").length} active`,
      icon: <BusinessIcon />,
      color: "primary",
    },
    {
      title: "Total Value",
      value: `TZS ${mockSuppliers.reduce((sum, supplier) => sum + supplier.total_value, 0).toLocaleString()}`,
      subtitle: "All time purchases",
      icon: <MoneyIcon />,
      color: "success",
    },
    {
      title: "Average Rating",
      value: (
        mockSuppliers.reduce((sum, supplier) => sum + supplier.rating, 0) /
        mockSuppliers.length
      ).toFixed(1),
      subtitle: "Supplier performance",
      icon: <StarIcon />,
      color: "warning",
    },
    {
      title: "Active Contracts",
      value: mockSuppliers
        .filter(
          (s) => s.contract_expiry && new Date(s.contract_expiry) > new Date()
        )
        .length.toString(),
      subtitle: "Valid contracts",
      icon: <ContractIcon />,
      color: "info",
    },
  ];

  // DataGrid columns
  const columns = [
    {
      field: "supplier_info",
      headerName: "Supplier",
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.company_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.supplier_id} • {params.row.contact_person}
          </Typography>
        </Box>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          icon={<CategoryIcon />}
        />
      ),
    },
    {
      field: "contact_info",
      headerName: "Contact",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
          >
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="caption">{params.row.email}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="caption">{params.row.phone}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "performance",
      headerName: "Performance",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ textAlign: "center" }}>
          <Rating
            value={params.row.rating}
            readOnly
            size="small"
            precision={0.1}
          />
          <Typography variant="caption" display="block">
            {params.row.performance_score}% Score
          </Typography>
        </Box>
      ),
    },
    {
      field: "total_value",
      headerName: "Total Value",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          TZS {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "total_orders",
      headerName: "Orders",
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" textAlign="center">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "last_order_date",
      headerName: "Last Order",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? format(new Date(params.value), "dd/MM/yyyy") : "-"}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const status = supplierStatuses.find((s) => s.value === params.value);
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
      field: "contract_status",
      headerName: "Contract",
      width: 120,
      renderCell: (params) => {
        if (!params.row.contract_expiry)
          return <Typography variant="caption">No Contract</Typography>;

        const daysToExpiry = differenceInDays(
          new Date(params.row.contract_expiry),
          new Date()
        );
        const isExpiring = daysToExpiry <= 30;
        const isExpired = daysToExpiry < 0;

        return (
          <Chip
            label={isExpired ? "Expired" : isExpiring ? "Expiring" : "Valid"}
            size="small"
            color={isExpired ? "error" : isExpiring ? "warning" : "success"}
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
            setSelectedSupplier(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Load suppliers data
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await supplierAPI.getAllSuppliers();
      // setSuppliers(response.data || []);
      setSuppliers(mockSuppliers);
    } catch (error) {
      showError("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingSupplier) {
        // await supplierAPI.updateSupplier(editingSupplier.id, formData);
        showSuccess("Supplier updated successfully");
      } else {
        // await supplierAPI.createSupplier(formData);
        showSuccess("Supplier created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      showError("Failed to save supplier");
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: "",
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
      website: "",
      tax_id: "",
      registration_number: "",
      category: "",
      supplier_type: "vendor",
      payment_terms: "30",
      currency: "TZS",
      credit_limit: "",
      bank_name: "",
      bank_account: "",
      status: "active",
      notes: "",
    });
    setEditingSupplier(null);
  };

  // Handle edit
  const handleEdit = (supplier) => {
    setFormData({ ...supplier });
    setEditingSupplier(supplier);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  // Handle delete
  const handleDelete = (supplier) => {
    openDialog({
      title: "Delete Supplier",
      message: `Are you sure you want to delete supplier "${supplier.company_name}"?`,
      onConfirm: async () => {
        try {
          // await supplierAPI.deleteSupplier(supplier.id);
          showSuccess("Supplier deleted successfully");
          fetchSuppliers();
        } catch (error) {
          showError("Failed to delete supplier");
        }
      },
    });
    setAnchorEl(null);
  };

  // Handle view details
  const handleViewDetails = (supplier) => {
    navigate(`/procurement/suppliers/${supplier.id}`);
    setAnchorEl(null);
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplier_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || supplier.status === statusFilter;
    const matchesCategory =
      !categoryFilter || supplier.category === categoryFilter;
    const matchesRating =
      !ratingFilter || supplier.rating >= parseFloat(ratingFilter);

    return matchesSearch && matchesStatus && matchesCategory && matchesRating;
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
            Supplier Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage supplier relationships, contracts, and performance tracking
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
                    placeholder="Search suppliers..."
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
                      {supplierStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                      {supplierCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Min Rating</InputLabel>
                    <Select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      label="Min Rating"
                    >
                      <MenuItem value="">All Ratings</MenuItem>
                      <MenuItem value="4.5">4.5+ Stars</MenuItem>
                      <MenuItem value="4.0">4.0+ Stars</MenuItem>
                      <MenuItem value="3.5">3.5+ Stars</MenuItem>
                      <MenuItem value="3.0">3.0+ Stars</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {hasPermission(PERMISSIONS.MANAGE_SUPPLIERS) && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                      >
                        Add Supplier
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
              <Tab label="All Suppliers" />
              <Tab label="Top Performers" />
              <Tab label="Contract Expiring" />
              <Tab label="Performance Analytics" />
            </Tabs>

            {/* All Suppliers Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredSuppliers}
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

            {/* Top Performers Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top Performing Suppliers
                </Typography>
                <Grid container spacing={3}>
                  {filteredSuppliers
                    .filter((supplier) => supplier.rating >= 4.0)
                    .sort((a, b) => b.performance_score - a.performance_score)
                    .slice(0, 6)
                    .map((supplier) => (
                      <Grid item xs={12} md={6} key={supplier.id}>
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
                              <Avatar sx={{ bgcolor: "success.main" }}>
                                <StarIcon />
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6">
                                  {supplier.company_name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {supplier.category}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${supplier.performance_score}%`}
                                color="success"
                                size="small"
                              />
                            </Box>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Rating
                                </Typography>
                                <Rating
                                  value={supplier.rating}
                                  readOnly
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  On-time Delivery
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={supplier.on_time_delivery}
                                  sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                                  color="success"
                                />
                                <Typography variant="caption">
                                  {supplier.on_time_delivery}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Total Orders
                                </Typography>
                                <Typography variant="h6">
                                  {supplier.total_orders}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Total Value
                                </Typography>
                                <Typography variant="h6">
                                  TZS {supplier.total_value.toLocaleString()}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            )}

            {/* Contract Expiring Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Contracts Expiring Soon
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Supplier</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Contract Expiry</TableCell>
                        <TableCell>Days Remaining</TableCell>
                        <TableCell>Total Value</TableCell>
                        <TableCell>Action Required</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSuppliers.filter((supplier) => {
                        if (!supplier.contract_expiry) return false;
                        const daysToExpiry = differenceInDays(
                          new Date(supplier.contract_expiry),
                          new Date()
                        );
                        return (
                          <TableRow key={supplier.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {supplier.company_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {supplier.contact_person}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{supplier.category}</TableCell>
                            <TableCell>
                              {format(
                                new Date(supplier.contract_expiry),
                                "dd/MM/yyyy"
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${daysToExpiry} days`}
                                size="small"
                                color={
                                  daysToExpiry <= 30
                                    ? "error"
                                    : daysToExpiry <= 60
                                      ? "warning"
                                      : "info"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              TZS {supplier.total_value.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  /* Handle contract renewal */
                                }}
                              >
                                Renew Contract
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Performance Analytics Tab */}
            {activeTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Performance by Category
                        </Typography>
                        <Alert severity="info">
                          <Typography variant="body2">
                            Performance analytics charts will be displayed here.
                          </Typography>
                        </Alert>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Delivery Performance Trends
                        </Typography>
                        <Alert severity="info">
                          <Typography variant="body2">
                            Delivery performance trends will be displayed here.
                          </Typography>
                        </Alert>
                      </CardContent>
                    </Card>
                  </Grid>
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
          <MenuItem onClick={() => handleViewDetails(selectedSupplier)}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_SUPPLIERS) && (
            <MenuItem onClick={() => handleEdit(selectedSupplier)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Supplier</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => navigate("/procurement/quotations")}>
            <ListItemIcon>
              <AssignmentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Request Quote</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              /* View purchase history */
            }}
          >
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Purchase History</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              /* Print supplier info */
            }}
          >
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Details</ListItemText>
          </MenuItem>
          {hasPermission(PERMISSIONS.MANAGE_SUPPLIERS) && (
            <MenuItem
              onClick={() => handleDelete(selectedSupplier)}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Supplier</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Add/Edit Supplier Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Company Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Company Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Supplier ID"
                  value={formData.supplier_id}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier_id: e.target.value })
                  }
                  placeholder="SUP-001"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={formData.contact_person}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_person: e.target.value })
                  }
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
                    {supplierCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Supplier Type</InputLabel>
                  <Select
                    value={formData.supplier_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supplier_type: e.target.value,
                      })
                    }
                    label="Supplier Type"
                  >
                    {supplierTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    label="Status"
                  >
                    {supplierStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Contact Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="www.company.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  defaultValue="Tanzania"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                />
              </Grid>

              {/* Business Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Business Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax ID"
                  value={formData.tax_id}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_id: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  value={formData.registration_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_number: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Payment Terms</InputLabel>
                  <Select
                    value={formData.payment_terms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_terms: e.target.value,
                      })
                    }
                    label="Payment Terms"
                  >
                    {paymentTerms.map((term) => (
                      <MenuItem key={term.value} value={term.value}>
                        {term.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  select
                >
                  <MenuItem value="TZS">TZS</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Credit Limit"
                  type="number"
                  value={formData.credit_limit}
                  onChange={(e) =>
                    setFormData({ ...formData, credit_limit: e.target.value })
                  }
                />
              </Grid>

              {/* Banking Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Banking Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  value={formData.bank_name}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Account Number"
                  value={formData.bank_account}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_account: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  multiline
                  rows={3}
                  placeholder="Additional notes about the supplier..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingSupplier ? "Update" : "Create"} Supplier
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

export default SuppliersPage;
