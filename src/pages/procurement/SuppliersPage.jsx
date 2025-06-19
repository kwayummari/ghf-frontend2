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
  Avatar,
  Divider,
  Rating,
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
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  RequestQuote as QuoteIcon,
  ShoppingCart as OrderIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, ROLES, PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'cards'

  // Sample supplier data
  const sampleSuppliers = [
    {
      id: 1,
      supplier_id: "SUP001",
      company_name: "Tech Solutions Ltd",
      contact_person: "John Manager",
      email: "john@techsolutions.co.tz",
      phone: "+255 713 456 789",
      address: "123 Business Street, Dar es Salaam",
      category: "IT Equipment",
      status: "active",
      rating: 4.5,
      total_orders: 15,
      total_value: 25000000,
      tax_id: "TIN123456789",
      registration_number: "REG2023001",
      bank_account: "1234567890",
      bank_name: "CRDB Bank",
      payment_terms: "30 days",
      created_at: "2023-01-15",
      verified: true,
    },
    {
      id: 2,
      supplier_id: "SUP002",
      company_name: "Office Supplies Co.",
      contact_person: "Jane Supplier",
      email: "jane@officesupplies.co.tz",
      phone: "+255 754 987 321",
      address: "456 Supply Avenue, Dar es Salaam",
      category: "Office Supplies",
      status: "active",
      rating: 4.2,
      total_orders: 8,
      total_value: 5500000,
      tax_id: "TIN987654321",
      registration_number: "REG2023002",
      bank_account: "0987654321",
      bank_name: "NMB Bank",
      payment_terms: "15 days",
      created_at: "2023-02-20",
      verified: true,
    },
    {
      id: 3,
      supplier_id: "SUP003",
      company_name: "Construction Materials Ltd",
      contact_person: "Mike Builder",
      email: "mike@construction.co.tz",
      phone: "+255 765 432 198",
      address: "789 Industry Road, Dar es Salaam",
      category: "Construction",
      status: "pending",
      rating: 0,
      total_orders: 0,
      total_value: 0,
      tax_id: "TIN456789123",
      registration_number: "REG2024001",
      bank_account: "1122334455",
      bank_name: "CRDB Bank",
      payment_terms: "45 days",
      created_at: "2024-01-10",
      verified: false,
    },
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuppliers(sampleSuppliers);
    } catch (error) {
      showError("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = () => {
    navigate("/procurement/suppliers/create");
  };

  const handleEditSupplier = (supplierId) => {
    navigate(`/procurement/suppliers/${supplierId}/edit`);
  };

  const handleViewSupplier = (supplierId) => {
    navigate(`/procurement/suppliers/${supplierId}`);
  };

  const handleDeleteSupplier = async (supplierId) => {
    openDialog({
      title: "Delete Supplier",
      message:
        "Are you sure you want to delete this supplier? This action cannot be undone.",
      onConfirm: async () => {
        try {
          // API call to delete supplier
          showSuccess("Supplier deleted successfully");
          fetchSuppliers();
        } catch (error) {
          showError("Failed to delete supplier");
        }
      },
    });
  };

  const handleVerifySupplier = async (supplierId) => {
    try {
      // API call to verify supplier
      showSuccess("Supplier verified successfully");
      fetchSuppliers();
    } catch (error) {
      showError("Failed to verify supplier");
    }
  };

  const handleRequestQuote = (supplierId) => {
    navigate(`/procurement/quotations/create?supplier=${supplierId}`);
  };

  const handleCreateOrder = (supplierId) => {
    navigate(`/procurement/orders/create?supplier=${supplierId}`);
  };

  const handleMenuClick = (event, supplier) => {
    setAnchorEl(event.currentTarget);
    setSelectedSupplier(supplier);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSupplier(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "pending":
        return "warning";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      field: "supplier_id",
      headerName: "Supplier ID",
      width: 120,
    },
    {
      field: "company_name",
      headerName: "Company Name",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
            <BusinessIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.company_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.contact_person}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 130,
    },
    {
      field: "contact_info",
      headerName: "Contact",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <PhoneIcon fontSize="small" />
            {params.row.phone}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <EmailIcon fontSize="small" />
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Rating value={params.value} size="small" readOnly />
          <Typography variant="caption">({params.value})</Typography>
        </Box>
      ),
    },
    {
      field: "total_orders",
      headerName: "Orders",
      width: 100,
      align: "center",
    },
    {
      field: "total_value",
      headerName: "Total Value",
      width: 130,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Chip
            label={params.value}
            color={getStatusColor(params.value)}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
          {params.row.verified && (
            <Tooltip title="Verified Supplier">
              <VerifiedIcon color="primary" fontSize="small" />
            </Tooltip>
          )}
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
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const filteredSuppliers = suppliers
    .filter(
      (supplier) =>
        supplier.company_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supplier.supplier_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (supplier) => statusFilter === "" || supplier.status === statusFilter
    )
    .filter(
      (supplier) =>
        categoryFilter === "" || supplier.category === categoryFilter
    );

  const supplierCategories = [...new Set(suppliers.map((s) => s.category))];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Supplier Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track supplier information and performance
          </Typography>
        </Box>
        {hasPermission(PERMISSIONS.MANAGE_SUPPLIERS) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSupplier}
          >
            Add Supplier
          </Button>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                    {suppliers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Suppliers
                  </Typography>
                </Box>
                <BusinessIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
                    {suppliers.filter((s) => s.status === "active").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Suppliers
                  </Typography>
                </Box>
                <VerifiedIcon color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
                    {suppliers.filter((s) => s.verified).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Suppliers
                  </Typography>
                </Box>
                <StarIcon color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
                    {formatCurrency(
                      suppliers.reduce((sum, s) => sum + s.total_value, 0)
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </Box>
                <ShoppingCart color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
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
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {supplierCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Data Grid */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <DataGrid
              rows={filteredSuppliers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              autoHeight
              sx={{
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
              }}
            />
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
            handleViewSupplier(selectedSupplier?.id);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {hasPermission(PERMISSIONS.MANAGE_SUPPLIERS) && (
          <MenuItem
            onClick={() => {
              handleEditSupplier(selectedSupplier?.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Supplier</ListItemText>
          </MenuItem>
        )}

        <Divider />

        <MenuItem
          onClick={() => {
            handleRequestQuote(selectedSupplier?.id);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <QuoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Request Quote</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCreateOrder(selectedSupplier?.id);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <OrderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create Order</ListItemText>
        </MenuItem>

        <Divider />

        {!selectedSupplier?.verified &&
          hasPermission(PERMISSIONS.MANAGE_SUPPLIERS) && (
            <MenuItem
              onClick={() => {
                handleVerifySupplier(selectedSupplier?.id);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <VerifiedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Verify Supplier</ListItemText>
            </MenuItem>
          )}

        {hasPermission(PERMISSIONS.MANAGE_SUPPLIERS) && (
          <MenuItem
            onClick={() => {
              handleDeleteSupplier(selectedSupplier?.id);
              handleMenuClose();
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Supplier</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default SuppliersPage;
