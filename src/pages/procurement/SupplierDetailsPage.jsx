import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
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
  Rating,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  Assignment as ContractIcon,
  History as HistoryIcon,
  Assessment as PerformanceIcon,
  Add as AddIcon,
  Public as WebsiteIcon,
  AccountBalance as BankIcon,
  Receipt as InvoiceIcon,
  ShoppingCart as OrderIcon,
  RequestQuote as QuoteIcon,
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';
// import { supplierAPI } from '../../../services/api/supplier.api';

const SupplierDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [supplier, setSupplier] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [performanceDialogOpen, setPerformanceDialogOpen] = useState(false);

  // Mock supplier data
  const mockSupplier = {
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
    tax_id: "TIN-123456789",
    registration_number: "REG-987654321",
    category: "IT Equipment",
    supplier_type: "vendor",
    payment_terms: "30",
    currency: "TZS",
    credit_limit: 5000000,
    bank_name: "CRDB Bank",
    bank_account: "0150123456789",
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
    notes:
      "Preferred supplier for IT equipment. Excellent service and competitive pricing.",
  };

  const mockPurchaseHistory = [
    {
      id: 1,
      order_number: "PO-2024-001",
      date: "2024-06-15",
      items: "Dell Laptops (10 units)",
      amount: 12000000,
      status: "completed",
      delivery_date: "2024-06-20",
      invoice_number: "INV-001",
    },
    {
      id: 2,
      order_number: "PO-2024-002",
      date: "2024-05-20",
      items: "Software Licenses",
      amount: 3200000,
      status: "completed",
      delivery_date: "2024-05-22",
      invoice_number: "INV-002",
    },
    {
      id: 3,
      order_number: "PO-2024-003",
      date: "2024-04-10",
      items: "Network Equipment",
      amount: 8500000,
      status: "completed",
      delivery_date: "2024-04-15",
      invoice_number: "INV-003",
    },
  ];

  const mockQuotations = [
    {
      id: 1,
      quote_number: "QT-2024-001",
      date: "2024-06-25",
      items: "Server Hardware",
      amount: 15000000,
      status: "pending",
      valid_until: "2024-07-25",
    },
    {
      id: 2,
      quote_number: "QT-2024-002",
      date: "2024-06-20",
      items: "Backup Solutions",
      amount: 5500000,
      status: "approved",
      valid_until: "2024-07-20",
    },
  ];

  const mockContracts = [
    {
      id: 1,
      contract_number: "CT-2024-001",
      title: "IT Equipment Supply Agreement",
      start_date: "2024-01-15",
      end_date: "2025-01-15",
      value: 50000000,
      status: "active",
      terms: "Annual supply contract with preferred pricing",
    },
  ];

  // Performance metrics
  const performanceMetrics = [
    {
      label: "Overall Performance",
      value: mockSupplier.performance_score,
      target: 85,
      color: "primary",
    },
    {
      label: "On-time Delivery",
      value: mockSupplier.on_time_delivery,
      target: 90,
      color: "success",
    },
    {
      label: "Quality Rating",
      value: (mockSupplier.quality_rating / 5) * 100,
      target: 80,
      color: "warning",
    },
    {
      label: "Response Time",
      value: 88,
      target: 85,
      color: "info",
    },
  ];

  // Load supplier data
  useEffect(() => {
    fetchSupplierDetails();
    fetchPurchaseHistory();
    fetchQuotations();
    fetchContracts();
  }, [id]);

  const fetchSupplierDetails = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await supplierAPI.getSupplierById(id);
      // setSupplier(response.data);
      setSupplier(mockSupplier);
    } catch (error) {
      showError("Failed to fetch supplier details");
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      // Replace with actual API call
      // const response = await supplierAPI.getSupplierPurchaseHistory(id);
      // setPurchaseHistory(response.data || []);
      setPurchaseHistory(mockPurchaseHistory);
    } catch (error) {
      showError("Failed to fetch purchase history");
    }
  };

  const fetchQuotations = async () => {
    try {
      // Replace with actual API call
      // const response = await supplierAPI.getSupplierQuotations(id);
      // setQuotations(response.data || []);
      setQuotations(mockQuotations);
    } catch (error) {
      showError("Failed to fetch quotations");
    }
  };

  const fetchContracts = async () => {
    try {
      // Replace with actual API call
      // const response = await supplierAPI.getSupplierContracts(id);
      // setContracts(response.data || []);
      setContracts(mockContracts);
    } catch (error) {
      showError("Failed to fetch contracts");
    }
  };

  // Handle supplier deletion
  const handleDelete = () => {
    openDialog({
      title: "Delete Supplier",
      message: `Are you sure you want to delete supplier "${supplier?.company_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // await supplierAPI.deleteSupplier(id);
          showSuccess("Supplier deleted successfully");
          navigate("/procurement/suppliers");
        } catch (error) {
          showError("Failed to delete supplier");
        }
      },
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!supplier) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Supplier not found</Typography>
        <Button
          onClick={() => navigate("/procurement/suppliers")}
          sx={{ mt: 2 }}
        >
          Back to Suppliers
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate("/procurement/suppliers")}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4">{supplier.company_name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {supplier.supplier_id} • {supplier.category}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {hasPermission(PERMISSIONS.MANAGE_SUPPLIERS) && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditDialogOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => {
                /* Print supplier details */
              }}
            >
              Print
            </Button>
          </Box>
        </Box>

        {/* Status and Rating */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={
              supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)
            }
            color={supplier.status === "active" ? "success" : "default"}
            variant="filled"
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Rating value={supplier.rating} readOnly size="small" />
            <Typography variant="body2">
              {supplier.rating} ({supplier.total_orders} orders)
            </Typography>
          </Box>
          <Chip
            label={`Performance: ${supplier.performance_score}%`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Supplier Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <BusinessIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Contact Person"
                    secondary={supplier.contact_person}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "info.main" }}>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Email" secondary={supplier.email} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Phone" secondary={supplier.phone} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "warning.main" }}>
                      <LocationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Address"
                    secondary={`${supplier.address}, ${supplier.city}`}
                  />
                </ListItem>
                {supplier.website && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "secondary.main" }}>
                        <WebsiteIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Website"
                      secondary={supplier.website}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Business Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Tax ID
                  </Typography>
                  <Typography variant="body1">
                    {supplier.tax_id || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Registration Number
                  </Typography>
                  <Typography variant="body1">
                    {supplier.registration_number || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Terms
                  </Typography>
                  <Typography variant="body1">
                    {supplier.payment_terms} days
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Credit Limit
                  </Typography>
                  <Typography variant="body1">
                    TZS {supplier.credit_limit?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Bank Details
                  </Typography>
                  <Typography variant="body1">
                    {supplier.bank_name} - {supplier.bank_account}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<QuoteIcon />}
                  onClick={() => navigate("/procurement/quotations")}
                  fullWidth
                >
                  Request Quote
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OrderIcon />}
                  onClick={() => navigate("/procurement/purchase-orders")}
                  fullWidth
                >
                  Create Order
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PerformanceIcon />}
                  onClick={() => setPerformanceDialogOpen(true)}
                  fullWidth
                >
                  Rate Performance
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="primary">
                    {supplier.total_orders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="success.main">
                    TZS {(supplier.total_value / 1000000).toFixed(1)}M
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="warning.main">
                    {supplier.on_time_delivery}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    On-time Delivery
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="info.main">
                    {supplier.performance_score}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Performance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs Content */}
          <Card>
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
              >
                <Tab label="Purchase History" />
                <Tab label="Quotations" />
                <Tab label="Contracts" />
                <Tab label="Performance" />
              </Tabs>

              {/* Purchase History Tab */}
              {activeTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Purchase History
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order Number</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Items</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Delivery Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {purchaseHistory.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {order.order_number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {format(new Date(order.date), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>{order.items}</TableCell>
                            <TableCell align="right">
                              TZS {order.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.status}
                                size="small"
                                color={
                                  order.status === "completed"
                                    ? "success"
                                    : "warning"
                                }
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell>
                              {order.delivery_date
                                ? format(
                                    new Date(order.delivery_date),
                                    "dd/MM/yyyy"
                                  )
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Quotations Tab */}
              {activeTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Quotations</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/procurement/quotations")}
                    >
                      Request New Quote
                    </Button>
                  </Box>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Quote Number</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Items</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Valid Until</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {quotations.map((quote) => (
                          <TableRow key={quote.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {quote.quote_number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {format(new Date(quote.date), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>{quote.items}</TableCell>
                            <TableCell align="right">
                              TZS {quote.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={quote.status}
                                size="small"
                                color={
                                  quote.status === "approved"
                                    ? "success"
                                    : quote.status === "pending"
                                      ? "warning"
                                      : "default"
                                }
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(quote.valid_until),
                                "dd/MM/yyyy"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Contracts Tab */}
              {activeTab === 2 && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Contracts</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        /* Handle new contract */
                      }}
                    >
                      New Contract
                    </Button>
                  </Box>
                  {contracts.length > 0 ? (
                    <Grid container spacing={2}>
                      {contracts.map((contract) => {
                        const daysToExpiry = differenceInDays(
                          new Date(contract.end_date),
                          new Date()
                        );
                        const isExpiring = daysToExpiry <= 30;
                        const isExpired = daysToExpiry < 0;

                        return (
                          <Grid item xs={12} key={contract.id}>
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
                                      {contract.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {contract.contract_number}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={
                                      isExpired
                                        ? "Expired"
                                        : isExpiring
                                          ? "Expiring Soon"
                                          : contract.status
                                    }
                                    color={
                                      isExpired
                                        ? "error"
                                        : isExpiring
                                          ? "warning"
                                          : contract.status === "active"
                                            ? "success"
                                            : "default"
                                    }
                                    variant="filled"
                                  />
                                </Box>
                                <Grid container spacing={2}>
                                  <Grid item xs={6} md={3}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Start Date
                                    </Typography>
                                    <Typography variant="body1">
                                      {format(
                                        new Date(contract.start_date),
                                        "dd/MM/yyyy"
                                      )}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} md={3}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      End Date
                                    </Typography>
                                    <Typography variant="body1">
                                      {format(
                                        new Date(contract.end_date),
                                        "dd/MM/yyyy"
                                      )}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} md={3}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Contract Value
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      fontWeight="medium"
                                    >
                                      TZS {contract.value.toLocaleString()}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} md={3}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Days Remaining
                                    </Typography>
                                    <Typography variant="body1">
                                      {isExpired
                                        ? "Expired"
                                        : `${daysToExpiry} days`}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Terms
                                    </Typography>
                                    <Typography variant="body1">
                                      {contract.terms}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      No contracts found for this supplier.
                    </Alert>
                  )}
                </Box>
              )}

              {/* Performance Tab */}
              {activeTab === 3 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={3}>
                    {performanceMetrics.map((metric, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              {metric.label}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={metric.value}
                                  sx={{ height: 8, borderRadius: 4 }}
                                  color={metric.color}
                                />
                              </Box>
                              <Typography variant="body2" fontWeight="medium">
                                {metric.value}%
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Target: {metric.target}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Performance History */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Performance History
                    </Typography>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Performance trends and historical data charts will be
                        displayed here.
                      </Typography>
                    </Alert>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Supplier Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Supplier Information</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This will open the supplier edit form. Integration with the main
              supplier management form is required.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setEditDialogOpen(false);
              showSuccess("Supplier information updated successfully");
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Performance Rating Dialog */}
      <Dialog
        open={performanceDialogOpen}
        onClose={() => setPerformanceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rate Supplier Performance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Overall Rating
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Rating size="large" defaultValue={supplier.rating} />
              <Typography variant="body1">{supplier.rating}/5</Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Specific Ratings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2">
                  Quality of Products/Services
                </Typography>
                <Rating defaultValue={4.5} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">Delivery Performance</Typography>
                <Rating defaultValue={4.8} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">Communication</Typography>
                <Rating defaultValue={4.2} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">Pricing Competitiveness</Typography>
                <Rating defaultValue={4.0} />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Comments"
              multiline
              rows={4}
              sx={{ mt: 2 }}
              placeholder="Provide feedback about the supplier's performance..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPerformanceDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPerformanceDialogOpen(false);
              showSuccess("Performance rating submitted successfully");
            }}
          >
            Submit Rating
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
  );
};

export default SupplierDetailsPage;