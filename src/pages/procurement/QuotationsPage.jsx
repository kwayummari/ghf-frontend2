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
  const { isOpen, config, openDialog, closeDialog, handleConfirm } = useConfirmDialog();

  // State management
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [quotationsByRequest, setQuotationsByRequest] = useState({});

  // Sample quotations data
  const sampleQuotations = [
    {
      id: 1,
      quotation_number: 'QT-2024-001',
      request_title: 'Office Furniture Purchase',
      supplier_name: 'Furniture Plus Ltd',
      supplier_id: 1,
      total_amount: 2500000,
      currency: 'TZS',
      validity_period: 30,
      submission_date: '2024-06-15',
      expiry_date: '2024-07-15',
      status: 'submitted',
      payment_terms: '30 days',
      delivery_terms: '14 days',
      submitted_by: 'Procurement Officer',
      document_attached: true,
      is_lowest: false,
      rank: 2,
      items: [
        { description: 'Executive Desk', quantity: 5, unit_price: 300000, total: 1500000 },
        { description: 'Office Chairs', quantity: 10, unit_price: 100000, total: 1000000 },
      ],
    },
    {
      id: 2,
      quotation_number: 'QT-2024-002',
      request_title: 'Office Furniture Purchase',
      supplier_name: 'Modern Office Solutions',
      supplier_id: 2,
      total_amount: 2200000,
      currency: 'TZS',
      validity_period: 45,
      submission_date: '2024-06-16',
      expiry_date: '2024-07-31',
      status: 'submitted',
      payment_terms: '15 days',
      delivery_terms: '10 days',
      submitted_by: 'Procurement Officer',
      document_attached: true,
      is_lowest: true,
      rank: 1,
      items: [
        { description: 'Executive Desk', quantity: 5, unit_price: 280000, total: 1400000 },
        { description: 'Office Chairs', quantity: 10, unit_price: 80000, total: 800000 },
      ],
    },
    {
      id: 3,
      quotation_number: 'QT-2024-003',
      request_title: 'IT Equipment Purchase',
      supplier_name: 'Tech Solutions Ltd',
      supplier_id: 3,
      total_amount: 15000000,
      currency: 'TZS',
      validity_period: 60,
      submission_date: '2024-06-18',
      expiry_date: '2024-08-17',
      status: 'under_review',
      payment_terms: '45 days',
      delivery_terms: '21 days',
      submitted_by: 'IT Manager',
      document_attached: true,
      is_lowest: false,
      rank: 1,
      items: [
        { description: 'Laptops', quantity: 10, unit_price: 1200000, total: 12000000 },
        { description: 'Printers', quantity: 3, unit_price: 1000000, total: 3000000 },
      ],
    },
    {
      id: 4,
      quotation_number: 'QT-2024-004',
      request_title: 'Office Furniture Purchase',
      supplier_name: 'Quality Furniture Co.',
      supplier_id: 4,
      total_amount: 2800000,
      currency: 'TZS',
      validity_period: 30,
      submission_date: '2024-06-17',
      expiry_date: '2024-07-17',
      status: 'approved',
      payment_terms: '30 days',
      delivery_terms: '20 days',
      submitted_by: 'Procurement Officer',
      document_attached: true,
      is_lowest: false,
      rank: 3,
      items: [
        { description: 'Executive Desk', quantity: 5, unit_price: 320000, total: 1600000 },
        { description: 'Office Chairs', quantity: 10, unit_price: 120000, total: 1200000 },
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredData = sampleQuotations;
      if (statusFilter) {
        filteredData = filteredData.filter(q => q.status === statusFilter);
      }
      if (supplierFilter) {
        filteredData = filteredData.filter(q => q.supplier_name === supplierFilter);
      }
      
      setQuotations(filteredData);
    } catch (error) {
      showError('Failed to fetch quotations');
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
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.total_amount - b.total_amount);
      grouped[key].forEach((quotation, index) => {
        quotation.rank = index + 1;
        quotation.is_lowest = index === 0;
      });
    });
    
    setQuotationsByRequest(grouped);
  };

  const handleCreateQuotation = () => {
    navigate('/procurement/quotations/create');
  };

  const handleViewQuotation = (quotationId) => {
    navigate(`/procurement/quotations/${quotationId}`);
  };

  const handleEditQuotation = (quotationId) => {
    navigate(`/procurement/quotations/${quotationId}/edit`);
  };

  const handleApproveQuotation = async (quotationId) => {
    openDialog({
      title: 'Approve Quotation',
      message: 'Are you sure you want to approve this quotation?',
      onConfirm: async () => {
        try {
          // API call to approve quotation
          setQuotations(prev => prev.map(q => 
            q.id === quotationId ? { ...q, status: 'approved' } : q
          ));
          showSuccess('Quotation approved successfully');
        } catch (error) {
          showError('Failed to approve quotation');
        }
      },
    });
  };

  const handleRejectQuotation = async (quotationId) => {
    openDialog({
      title: 'Reject Quotation',
      message: 'Are you sure you want to reject this quotation?',
      onConfirm: async () => {
        try {
          // API call to reject quotation
          setQuotations(prev => prev.map(q => 
            q.id === quotationId ? { ...q, status: 'rejected' } : q
          ));
          showSuccess('Quotation rejected');
        } catch (error) {
          showError('Failed to reject quotation');
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
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'primary';
      case 'under_review': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <QuoteIcon />;
      case 'under_review': return <PendingIcon />;
      case 'approved': return <ApproveIcon />;
      case 'rejected': return <RejectIcon />;
      default: return <QuoteIcon />;
    }
  };

  const columns = [
    {
      field: 'quotation_number',
      headerName: 'Quotation #',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'request_title',
      headerName: 'Request Title',
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
      field: 'total_amount',
      headerName: 'Amount',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" fontWeight="medium">
            {