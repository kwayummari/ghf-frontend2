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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  Divider,
  Badge,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RequestQuote as QuoteIcon,
  CompareArrows as CompareIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as PendingIcon,
  TrendingDown as LowestIcon,
  Business as SupplierIcon,
  AttachMoney as PriceIcon,
  DateRange as DateIcon,
  Assignment as OrderIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInDays } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import useConfirmDialog from '../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../components/common/Loading';

const QuotationsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [quotationsByRequest, setQuotationsByRequest] = useState({});

  // Sample quotations data
  const sampleQuotations = [
    {
      id: 1,
      quotation_number: "QT-2024-001",
      request_title: "Office Furniture Purchase",
      supplier_name: "Furniture Plus Ltd",
      supplier_id: 1,
      total_amount: 2500000,
      currency: "TZS",
      validity_period: 30,
      submission_date: "2024-06-15",
      expiry_date: "2024-07-15",
      status: "submitted",
      payment_terms: "30 days",
      delivery_terms: "14 days",
      submitted_by: "Procurement Officer",
      document_attached: true,
      is_lowest: false,
      rank: 2,
      items: [
        {
          description: "Executive Desk",
          quantity: 5,
          unit_price: 300000,
          total: 1500000,
        },
        {
          description: "Office Chairs",
          quantity: 10,
          unit_price: 100000,
          total: 1000000,
        },
      ],
    },
    {
      id: 2,
      quotation_number: "QT-2024-002",
      request_title: "Office Furniture Purchase",
      supplier_name: "Modern Office Solutions",
      supplier_id: 2,
      total_amount: 2200000,
      currency: "TZS",
      validity_period: 45,
      submission_date: "2024-06-16",
      expiry_date: "2024-07-31",
      status: "submitted",
      payment_terms: "15 days",
      delivery_terms: "10 days",
      submitted_by: "Procurement Officer",
      document_attached: true,
      is_lowest: true,
      rank: 1,
      items: [
        {
          description: "Executive Desk",
          quantity: 5,
          unit_price: 280000,
          total: 1400000,
        },
        {
          description: "Office Chairs",
          quantity: 10,
          unit_price: 80000,
          total: 800000,
        },
      ],
    },
    {
      id: 3,
      quotation_number: "QT-2024-003",
      request_title: "IT Equipment Purchase",
      supplier_name: "Tech Solutions Ltd",
      supplier_id: 3,
      total_amount: 15000000,
      currency: "TZS",
      validity_period: 60,
      submission_date: "2024-06-18",
      expiry_date: "2024-08-17",
      status: "under_review",
      payment_terms: "45 days",
      delivery_terms: "21 days",
      submitted_by: "IT Manager",
      document_attached: true,
      is_lowest: false,
      rank: 1,
      items: [
        {
          description: "Laptops",
          quantity: 10,
          unit_price: 1200000,
          total: 12000000,
        },
        {
          description: "Printers",
          quantity: 3,
          unit_price: 1000000,
          total: 3000000,
        },
      ],
    },
    {
      id: 4,
      quotation_number: "QT-2024-004",
      request_title: "Office Furniture Purchase",
      supplier_name: "Quality Furniture Co.",
      supplier_id: 4,
      total_amount: 2800000,
      currency: "TZS",
      validity_period: 30,
      submission_date: "2024-06-17",
      expiry_date: "2024-07-17",
      status: "approved",
      payment_terms: "30 days",
      delivery_terms: "20 days",
      submitted_by: "Procurement Officer",
      document_attached: true,
      is_lowest: false,
      rank: 3,
      items: [
        {
          description: "Executive Desk",
          quantity: 5,
          unit_price: 320000,
          total: 1600000,
        },
        {
          description: "Office Chairs",
          quantity: 10,
          unit_price: 120000,
          total: 1200000,
        },
      ],
    },
  ];

  useEffect(() => {
    fetchQuotations();
    groupQuotationsByRequest();
  }, [statusFilter, supplierFilter]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let filteredData = sampleQuotations;
      if (statusFilter) {
        filteredData = filteredData.filter((q) => q.status === statusFilter);
      }
      if (supplierFilter) {
        filteredData = filteredData.filter(
          (q) => q.supplier_name === supplierFilter
        );
      }

      setQuotations(filteredData);
    } catch (error) {
      showError("Failed to fetch quotations");
    } finally {
      setLoading(false);
    }
  };

  const groupQuotationsByRequest = () => {
    const grouped = quotations.reduce((acc, quotation) => {
      if (!acc[quotation.request_title]) {
        acc[quotation.request_title] = [];
      }
      acc[quotation.request_title].push(quotation);
      return acc;
    }, {});

    // Sort quotations within each group by total amount
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.total_amount - b.total_amount);
      grouped[key].forEach((quotation, index) => {
        quotation.rank = index + 1;
        quotation.is_lowest = index === 0;
      });
    });

    setQuotationsByRequest(grouped);
  };

  const handleCreateQuotation = () => {
    navigate("/procurement/quotations/create");
  };

  const handleViewQuotation = (quotationId) => {
    navigate(`/procurement/quotations/${quotationId}`);
  };

  const handleEditQuotation = (quotationId) => {
    navigate(`/procurement/quotations/${quotationId}/edit`);
  };

  const handleApproveQuotation = async (quotationId) => {
    openDialog({
      title: "Approve Quotation",
      message: "Are you sure you want to approve this quotation?",
      onConfirm: async () => {
        try {
          // API call to approve quotation
          setQuotations((prev) =>
            prev.map((q) =>
              q.id === quotationId ? { ...q, status: "approved" } : q
            )
          );
          showSuccess("Quotation approved successfully");
        } catch (error) {
          showError("Failed to approve quotation");
        }
      },
    });
  };

  const handleRejectQuotation = async (quotationId) => {
    openDialog({
      title: "Reject Quotation",
      message: "Are you sure you want to reject this quotation?",
      onConfirm: async () => {
        try {
          // API call to reject quotation
          setQuotations((prev) =>
            prev.map((q) =>
              q.id === quotationId ? { ...q, status: "rejected" } : q
            )
          );
          showSuccess("Quotation rejected");
        } catch (error) {
          showError("Failed to reject quotation");
        }
      },
    });
  };

  const handleCompareQuotations = (requestTitle) => {
    setSelectedQuotation(quotationsByRequest[requestTitle]);
    setCompareDialogOpen(true);
  };

  const handleCreatePurchaseOrder = (quotationId) => {
    navigate(`/procurement/orders/create?quotation=${quotationId}`);
  };

  const handleMenuClick = (event, quotation) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuotation(quotation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuotation(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "primary";
      case "under_review":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "expired":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return <QuoteIcon />;
      case "under_review":
        return <PendingIcon />;
      case "approved":
        return <ApproveIcon />;
      case "rejected":
        return <RejectIcon />;
      default:
        return <QuoteIcon />;
    }
  };

  const columns = [
    {
      field: "quotation_number",
      headerName: "Quotation #",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "request_title",
      headerName: "Request Title",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.supplier_name}
          </Typography>
        </Box>
      ),
    },
    {
      field: "total_amount",
      headerName: "Amount",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(params.value)}
          </Typography>
          {params.row.is_lowest && (
            <Chip
              label="Lowest"
              size="small"
              color="success"
              variant="outlined"
              icon={<LowestIcon />}
            />
          )}
        </Box>
      ),
    },
    {
      field: "submission_date",
      headerName: "Submitted",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), "dd/MM/yyyy")}
        </Typography>
      ),
    },
    {
      field: "expiry_date",
      headerName: "Expires",
      width: 120,
      renderCell: (params) => {
        const daysLeft = differenceInDays(new Date(params.value), new Date());
        const isExpired = daysLeft < 0;
        const isExpiringSoon = daysLeft <= 7 && daysLeft >= 0;

        return (
          <Box>
            <Typography
              variant="body2"
              color={
                isExpired
                  ? "error.main"
                  : isExpiringSoon
                    ? "warning.main"
                    : "text.primary"
              }
            >
              {format(new Date(params.value), "dd/MM/yyyy")}
            </Typography>
            {isExpired && (
              <Typography variant="caption" color="error">
                Expired
              </Typography>
            )}
            {isExpiringSoon && (
              <Typography variant="caption" color="warning.main">
                {daysLeft} days left
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value.replace("_", " ").toUpperCase()}
          size="small"
          color={getStatusColor(params.value)}
          variant="filled"
          icon={getStatusIcon(params.value)}
        />
      ),
    },
    {
      field: "rank",
      headerName: "Rank",
      width: 80,
      renderCell: (params) => (
        <Badge
          badgeContent={params.value}
          color={
            params.value === 1
              ? "success"
              : params.value === 2
                ? "warning"
                : "default"
          }
        >
          <Box sx={{ width: 20, height: 20 }} />
        </Badge>
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
          onClick={(event) => handleMenuClick(event, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const filteredQuotations = quotations.filter(
    (quotation) =>
      quotation.quotation_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.request_title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1">
              Quotations Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage supplier quotations and compare pricing
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                /* Handle export */
              }}
            >
              Export
            </Button>
            {hasPermission(PERMISSIONS.MANAGE_QUOTATIONS) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateQuotation}
              >
                Request Quotation
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search quotations..."
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
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Supplier"
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                >
                  <MenuItem value="">All Suppliers</MenuItem>
                  <MenuItem value="Furniture Plus Ltd">
                    Furniture Plus Ltd
                  </MenuItem>
                  <MenuItem value="Modern Office Solutions">
                    Modern Office Solutions
                  </MenuItem>
                  <MenuItem value="Tech Solutions Ltd">
                    Tech Solutions Ltd
                  </MenuItem>
                  <MenuItem value="Quality Furniture Co.">
                    Quality Furniture Co.
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  onClick={() => setCompareDialogOpen(true)}
                >
                  Compare
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardContent>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
            >
              <Tab label="All Quotations" />
              <Tab label="By Request" />
              <Tab label="Comparison" />
            </Tabs>

            {/* All Quotations Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={filteredQuotations}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    checkboxSelection
                  />
                </Box>
              </Box>
            )}

            {/* By Request Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                {Object.entries(quotationsByRequest).map(
                  ([requestTitle, quotations]) => (
                    <Card key={requestTitle} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6">{requestTitle}</Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CompareIcon />}
                            onClick={() =>
                              handleCompareQuotations(requestTitle)
                            }
                          >
                            Compare ({quotations.length})
                          </Button>
                        </Box>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Supplier</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell>Payment Terms</TableCell>
                                <TableCell>Delivery</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Rank</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {quotations.map((quotation) => (
                                <TableRow key={quotation.id}>
                                  <TableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <SupplierIcon fontSize="small" />
                                      <Typography variant="body2">
                                        {quotation.supplier_name}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        gap: 0.5,
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {formatCurrency(quotation.total_amount)}
                                      </Typography>
                                      {quotation.is_lowest && (
                                        <Chip
                                          label="Lowest"
                                          size="small"
                                          color="success"
                                          variant="outlined"
                                        />
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    {quotation.payment_terms}
                                  </TableCell>
                                  <TableCell>
                                    {quotation.delivery_terms}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={quotation.status
                                        .replace("_", " ")
                                        .toUpperCase()}
                                      size="small"
                                      color={getStatusColor(quotation.status)}
                                      variant="filled"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      badgeContent={quotation.rank}
                                      color={
                                        quotation.rank === 1
                                          ? "success"
                                          : quotation.rank === 2
                                            ? "warning"
                                            : "default"
                                      }
                                    >
                                      <Box sx={{ width: 20, height: 20 }} />
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <IconButton
                                      size="small"
                                      onClick={(event) =>
                                        handleMenuClick(event, quotation)
                                      }
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  )
                )}
              </Box>
            )}

            {/* Comparison Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Select quotations from the same request to compare pricing,
                  terms, and delivery options.
                </Alert>
                {/* Comparison interface would go here */}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleViewQuotation(selectedQuotation?.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>

          {hasPermission(PERMISSIONS.MANAGE_QUOTATIONS) && (
            <MenuItem
              onClick={() => {
                handleEditQuotation(selectedQuotation?.id);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Quotation</ListItemText>
            </MenuItem>
          )}

          <Divider />

          {selectedQuotation?.status === "submitted" &&
            hasPermission(PERMISSIONS.APPROVE_QUOTATIONS) && (
              <>
                <MenuItem
                  onClick={() => {
                    handleApproveQuotation(selectedQuotation?.id);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <ApproveIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>Approve</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleRejectQuotation(selectedQuotation?.id);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <RejectIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Reject</ListItemText>
                </MenuItem>
              </>
            )}

          {selectedQuotation?.status === "approved" && (
            <MenuItem
              onClick={() => {
                handleCreatePurchaseOrder(selectedQuotation?.id);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <OrderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Create Purchase Order</ListItemText>
            </MenuItem>
          )}

          <Divider />

          <MenuItem
            onClick={() => {
              // Handle download quotation
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        </Menu>

        {/* Compare Quotations Dialog */}
        <Dialog
          open={compareDialogOpen}
          onClose={() => setCompareDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Compare Quotations</DialogTitle>
          <DialogContent>
            {selectedQuotation && Array.isArray(selectedQuotation) ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Criteria</TableCell>
                      {selectedQuotation.map((quotation) => (
                        <TableCell key={quotation.id} align="center">
                          {quotation.supplier_name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell fontWeight="medium">Total Amount</TableCell>
                      {selectedQuotation.map((quotation) => (
                        <TableCell key={quotation.id} align="center">
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color={
                              quotation.is_lowest
                                ? "success.main"
                                : "text.primary"
                            }
                          >
                            {formatCurrency(quotation.total_amount)}
                            {quotation.is_lowest && (
                              <Chip
                                label="Lowest"
                                size="small"
                                color="success"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell fontWeight="medium">Payment Terms</TableCell>
                      {selectedQuotation.map((quotation) => (
                        <TableCell key={quotation.id} align="center">
                          {quotation.payment_terms}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell fontWeight="medium">Delivery Terms</TableCell>
                      {selectedQuotation.map((quotation) => (
                        <TableCell key={quotation.id} align="center">
                          {quotation.delivery_terms}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell fontWeight="medium">Validity Period</TableCell>
                      {selectedQuotation.map((quotation) => (
                        <TableCell key={quotation.id} align="center">
                          {quotation.validity_period} days
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell fontWeight="medium">Status</TableCell>
                      {selectedQuotation.map((quotation) => (
                        <TableCell key={quotation.id} align="center">
                          <Chip
                            label={quotation.status
                              .replace("_", " ")
                              .toUpperCase()}
                            size="small"
                            color={getStatusColor(quotation.status)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>Please select quotations to compare</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => setCompareDialogOpen(false)}
            >
              Select Best Quote
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
              <Button
                onClick={handleConfirm}
                color="primary"
                variant="contained"
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default QuotationsPage;