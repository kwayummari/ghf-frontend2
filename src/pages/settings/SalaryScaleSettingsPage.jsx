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
  List,
  ListItem,
  ListItemText as MUIListItemText,
  ListItemAvatar,
  Avatar,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  MonetizationOn as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Settings as SettingsIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as ReportIcon,
  Update as UpdateIcon,
  Timeline as TimelineIcon,
  AccountBalance as BankIcon,
  Category as CategoryIcon,
  Grade as GradeIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  WorkOutline as JobIcon,
  School as EducationIcon,
  Experience as ExperienceIcon,
  Star as BenefitIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { useAuth } from '../../../components/features/auth/AuthGuard';
import { ROUTES, ROLES, PERMISSIONS } from '../../../constants';
import useNotification from '../../../hooks/common/useNotification';
import useConfirmDialog from '../../../hooks/common/useConfirmDialog';
import { LoadingSpinner } from '../../../components/common/Loading';
// import { settingsAPI } from '../../../services/api/settings.api';

const SalaryScaleSettingsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [salaryScales, setSalaryScales] = useState([]);
  const [jobGrades, setJobGrades] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedScale, setSelectedScale] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [benefitDialogOpen, setBenefitDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [editingScale, setEditingScale] = useState(null);
  const [editingGrade, setEditingGrade] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Form state for salary scale
  const [scaleFormData, setScaleFormData] = useState({
    scale_name: "",
    description: "",
    category: "",
    currency: "TZS",
    min_salary: "",
    max_salary: "",
    increment_percentage: 5,
    effective_date: null,
    status: "active",
    auto_increment: false,
    review_cycle_months: 12,
  });

  // Form state for job grade
  const [gradeFormData, setGradeFormData] = useState({
    grade_name: "",
    grade_level: "",
    description: "",
    salary_scale_id: "",
    min_salary: "",
    max_salary: "",
    mid_point: "",
    job_titles: "",
    required_education: "",
    required_experience: "",
    benefits_eligible: [],
    status: "active",
  });

  // Form state for benefits
  const [benefitFormData, setBenefitFormData] = useState({
    benefit_name: "",
    benefit_type: "allowance",
    description: "",
    calculation_method: "fixed",
    amount: "",
    percentage: "",
    eligibility_criteria: "",
    tax_treatment: "taxable",
    status: "active",
  });

  // Mock data for development
  const mockSalaryScales = [
    {
      id: 1,
      scale_name: "Management Scale",
      description: "Salary scale for management positions",
      category: "Management",
      currency: "TZS",
      min_salary: 2000000,
      max_salary: 8000000,
      increment_percentage: 10,
      effective_date: "2024-01-01",
      status: "active",
      auto_increment: true,
      review_cycle_months: 12,
      job_grades_count: 5,
      employees_count: 12,
      created_by: "HR Manager",
      last_reviewed: "2024-01-01",
    },
    {
      id: 2,
      scale_name: "Technical Scale",
      description: "Salary scale for technical staff",
      category: "Technical",
      currency: "TZS",
      min_salary: 800000,
      max_salary: 5000000,
      increment_percentage: 8,
      effective_date: "2024-01-01",
      status: "active",
      auto_increment: false,
      review_cycle_months: 12,
      job_grades_count: 6,
      employees_count: 28,
      created_by: "HR Manager",
      last_reviewed: "2024-01-01",
    },
    {
      id: 3,
      scale_name: "Administrative Scale",
      description: "Salary scale for administrative positions",
      category: "Administrative",
      currency: "TZS",
      min_salary: 500000,
      max_salary: 2500000,
      increment_percentage: 5,
      effective_date: "2024-01-01",
      status: "active",
      auto_increment: true,
      review_cycle_months: 12,
      job_grades_count: 4,
      employees_count: 18,
      created_by: "HR Manager",
      last_reviewed: "2024-01-01",
    },
  ];

  const mockJobGrades = [
    {
      id: 1,
      grade_name: "Executive Director",
      grade_level: "M5",
      description: "Highest management level",
      salary_scale_id: 1,
      salary_scale_name: "Management Scale",
      min_salary: 6000000,
      max_salary: 8000000,
      mid_point: 7000000,
      job_titles: "CEO, Executive Director",
      required_education: "Masters Degree",
      required_experience: "15+ years",
      benefits_eligible: [1, 2, 3],
      status: "active",
      employees_count: 2,
    },
    {
      id: 2,
      grade_name: "Senior Manager",
      grade_level: "M4",
      description: "Senior management positions",
      salary_scale_id: 1,
      salary_scale_name: "Management Scale",
      min_salary: 4000000,
      max_salary: 6000000,
      mid_point: 5000000,
      job_titles: "Department Head, Senior Manager",
      required_education: "Bachelors Degree",
      required_experience: "10+ years",
      benefits_eligible: [1, 2],
      status: "active",
      employees_count: 5,
    },
    {
      id: 3,
      grade_name: "Senior Developer",
      grade_level: "T6",
      description: "Senior technical positions",
      salary_scale_id: 2,
      salary_scale_name: "Technical Scale",
      min_salary: 3500000,
      max_salary: 5000000,
      mid_point: 4250000,
      job_titles: "Senior Developer, Tech Lead",
      required_education: "Bachelors Degree",
      required_experience: "8+ years",
      benefits_eligible: [1, 3],
      status: "active",
      employees_count: 8,
    },
  ];

  const mockBenefits = [
    {
      id: 1,
      benefit_name: "Housing Allowance",
      benefit_type: "allowance",
      description: "Monthly housing allowance",
      calculation_method: "percentage",
      amount: 0,
      percentage: 30,
      eligibility_criteria: "All permanent employees",
      tax_treatment: "taxable",
      status: "active",
    },
    {
      id: 2,
      benefit_name: "Transport Allowance",
      benefit_type: "allowance",
      description: "Monthly transport allowance",
      calculation_method: "fixed",
      amount: 150000,
      percentage: 0,
      eligibility_criteria: "All employees",
      tax_treatment: "tax_free",
      status: "active",
    },
    {
      id: 3,
      benefit_name: "Medical Insurance",
      benefit_type: "insurance",
      description: "Comprehensive medical coverage",
      calculation_method: "fixed",
      amount: 200000,
      percentage: 0,
      eligibility_criteria: "Permanent employees after probation",
      tax_treatment: "tax_free",
      status: "active",
    },
  ];

  // Salary scale categories
  const scaleCategories = [
    "Management",
    "Technical",
    "Administrative",
    "Sales",
    "Operations",
    "Finance",
    "Human Resources",
    "Customer Service",
  ];

  // Benefit types
  const benefitTypes = [
    { value: "allowance", label: "Allowance" },
    { value: "insurance", label: "Insurance" },
    { value: "bonus", label: "Bonus" },
    { value: "leave", label: "Leave" },
    { value: "pension", label: "Pension" },
    { value: "other", label: "Other" },
  ];

  // Calculation methods
  const calculationMethods = [
    { value: "fixed", label: "Fixed Amount" },
    { value: "percentage", label: "Percentage of Basic Salary" },
    { value: "formula", label: "Custom Formula" },
  ];

  // Tax treatments
  const taxTreatments = [
    { value: "taxable", label: "Taxable" },
    { value: "tax_free", label: "Tax Free" },
    { value: "partially_taxable", label: "Partially Taxable" },
  ];

  // Education levels
  const educationLevels = [
    "Certificate",
    "Diploma",
    "Bachelors Degree",
    "Masters Degree",
    "PhD",
    "Professional Certification",
  ];

  // Experience levels
  const experienceLevels = [
    "0-2 years",
    "3-5 years",
    "6-8 years",
    "9-12 years",
    "13-15 years",
    "15+ years",
  ];

  // Setup steps
  const setupSteps = [
    "Scale Information",
    "Salary Configuration",
    "Job Grades",
    "Benefits & Review",
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Salary Scales",
      value: mockSalaryScales.length.toString(),
      subtitle: `${mockSalaryScales.filter((s) => s.status === "active").length} active`,
      icon: <GradeIcon />,
      color: "primary",
    },
    {
      title: "Job Grades",
      value: mockJobGrades.length.toString(),
      subtitle: "Across all scales",
      icon: <BusinessIcon />,
      color: "info",
    },
    {
      title: "Total Employees",
      value: mockSalaryScales
        .reduce((sum, scale) => sum + scale.employees_count, 0)
        .toString(),
      subtitle: "On salary scales",
      icon: <PeopleIcon />,
      color: "success",
    },
    {
      title: "Salary Range",
      value: `TZS ${Math.min(...mockSalaryScales.map((s) => s.min_salary)).toLocaleString()} - ${Math.max(...mockSalaryScales.map((s) => s.max_salary)).toLocaleString()}`,
      subtitle: "Min - Max across scales",
      icon: <MoneyIcon />,
      color: "warning",
    },
  ];

  // DataGrid columns for salary scales
  const scaleColumns = [
    {
      field: "scale_name",
      headerName: "Scale Name",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GradeIcon fontSize="small" color="primary" />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.category}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "salary_range",
      headerName: "Salary Range",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            TZS {params.row.min_salary?.toLocaleString()} -{" "}
            {params.row.max_salary?.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.increment_percentage}% increment
          </Typography>
        </Box>
      ),
    },
    {
      field: "job_grades_count",
      headerName: "Job Grades",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "employees_count",
      headerName: "Employees",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === "active" ? "Active" : "Inactive"}
          size="small"
          color={params.value === "active" ? "success" : "default"}
          variant="filled"
        />
      ),
    },
    {
      field: "last_reviewed",
      headerName: "Last Reviewed",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), "dd/MM/yyyy")}
        </Typography>
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
            setSelectedScale(params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // DataGrid columns for job grades
  const gradeColumns = [
    {
      field: "grade_info",
      headerName: "Grade",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.grade_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Level: {params.row.grade_level}
          </Typography>
        </Box>
      ),
    },
    {
      field: "salary_scale_name",
      headerName: "Salary Scale",
      width: 150,
    },
    {
      field: "salary_range",
      headerName: "Salary Range",
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            TZS {params.row.min_salary?.toLocaleString()} -{" "}
            {params.row.max_salary?.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="success.main">
            Mid: TZS {params.row.mid_point?.toLocaleString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: "job_titles",
      headerName: "Job Titles",
      width: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "employees_count",
      headerName: "Employees",
      width: 100,
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === "active" ? "Active" : "Inactive"}
          size="small"
          color={params.value === "active" ? "success" : "default"}
          variant="filled"
        />
      ),
    },
  ];

  // Load salary scale data
  useEffect(() => {
    fetchSalaryScales();
    fetchJobGrades();
    fetchBenefits();
  }, []);

  const fetchSalaryScales = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await settingsAPI.getSalaryScales();
      // setSalaryScales(response.data || []);
      setSalaryScales(mockSalaryScales);
    } catch (error) {
      showError("Failed to fetch salary scales");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobGrades = async () => {
    try {
      // Replace with actual API call
      // const response = await settingsAPI.getJobGrades();
      // setJobGrades(response.data || []);
      setJobGrades(mockJobGrades);
    } catch (error) {
      showError("Failed to fetch job grades");
    }
  };

  const fetchBenefits = async () => {
    try {
      // Replace with actual API call
      // const response = await settingsAPI.getBenefits();
      // setBenefits(response.data || []);
      setBenefits(mockBenefits);
    } catch (error) {
      showError("Failed to fetch benefits");
    }
  };

  // Handle form submissions
  const handleScaleSubmit = async () => {
    try {
      if (editingScale) {
        // await settingsAPI.updateSalaryScale(editingScale.id, scaleFormData);
        showSuccess("Salary scale updated successfully");
      } else {
        // await settingsAPI.createSalaryScale(scaleFormData);
        showSuccess("Salary scale created successfully");
      }
      setDialogOpen(false);
      setSetupDialogOpen(false);
      resetScaleForm();
      fetchSalaryScales();
    } catch (error) {
      showError("Failed to save salary scale");
    }
  };

  const handleGradeSubmit = async () => {
    try {
      if (editingGrade) {
        // await settingsAPI.updateJobGrade(editingGrade.id, gradeFormData);
        showSuccess("Job grade updated successfully");
      } else {
        // await settingsAPI.createJobGrade(gradeFormData);
        showSuccess("Job grade created successfully");
      }
      setGradeDialogOpen(false);
      resetGradeForm();
      fetchJobGrades();
    } catch (error) {
      showError("Failed to save job grade");
    }
  };

  const handleBenefitSubmit = async () => {
    try {
      // await settingsAPI.createBenefit(benefitFormData);
      showSuccess("Benefit created successfully");
      setBenefitDialogOpen(false);
      resetBenefitForm();
      fetchBenefits();
    } catch (error) {
      showError("Failed to save benefit");
    }
  };

  // Reset form functions
  const resetScaleForm = () => {
    setScaleFormData({
      scale_name: "",
      description: "",
      category: "",
      currency: "TZS",
      min_salary: "",
      max_salary: "",
      increment_percentage: 5,
      effective_date: null,
      status: "active",
      auto_increment: false,
      review_cycle_months: 12,
    });
    setEditingScale(null);
    setActiveStep(0);
  };

  const resetGradeForm = () => {
    setGradeFormData({
      grade_name: "",
      grade_level: "",
      description: "",
      salary_scale_id: "",
      min_salary: "",
      max_salary: "",
      mid_point: "",
      job_titles: "",
      required_education: "",
      required_experience: "",
      benefits_eligible: [],
      status: "active",
    });
    setEditingGrade(null);
  };

  const resetBenefitForm = () => {
    setBenefitFormData({
      benefit_name: "",
      benefit_type: "allowance",
      description: "",
      calculation_method: "fixed",
      amount: "",
      percentage: "",
      eligibility_criteria: "",
      tax_treatment: "taxable",
      status: "active",
    });
  };

  // Handle edit functions
  const handleEditScale = (scale) => {
    setScaleFormData({ ...scale });
    setEditingScale(scale);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleEditGrade = (grade) => {
    setGradeFormData({ ...grade });
    setEditingGrade(grade);
    setGradeDialogOpen(true);
  };

  // Auto-calculate mid-point when min/max salary changes
  useEffect(() => {
    if (gradeFormData.min_salary && gradeFormData.max_salary) {
      const min = parseFloat(gradeFormData.min_salary);
      const max = parseFloat(gradeFormData.max_salary);
      const midPoint = Math.round((min + max) / 2);
      setGradeFormData((prev) => ({ ...prev, mid_point: midPoint.toString() }));
    }
  }, [gradeFormData.min_salary, gradeFormData.max_salary]);

  // Filter data
  const filteredSalaryScales = salaryScales.filter((scale) => {
    const matchesSearch = scale.scale_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || scale.category === categoryFilter;
    const matchesStatus = !statusFilter || scale.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredJobGrades = jobGrades.filter((grade) => {
    if (selectedScale) {
      return grade.salary_scale_id === selectedScale.id;
    }
    return true;
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
            Salary Scale Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure salary scales, job grades, and employee benefits
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
                    placeholder="Search salary scales..."
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
                      {scaleCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
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
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                  >
                    {hasPermission(PERMISSIONS.MANAGE_SALARY_SCALE) && (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setSetupDialogOpen(true)}
                        >
                          New Scale
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<GradeIcon />}
                          onClick={() => setGradeDialogOpen(true)}
                        >
                          Add Grade
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<BenefitIcon />}
                          onClick={() => setBenefitDialogOpen(true)}
                        >
                          Add Benefit
                        </Button>
                      </>
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
              <Tab label="Salary Scales" />
              <Tab label="Job Grades" />
              <Tab label="Benefits" />
              <Tab label="Reports" />
            </Tabs>

            {/* Salary Scales Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ height: 500, width: "100%" }}>
                  <DataGrid
                    rows={filteredSalaryScales}
                    columns={scaleColumns}
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

            {/* Job Grades Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Salary Scale</InputLabel>
                    <Select
                      value={selectedScale?.id || ""}
                      onChange={(e) => {
                        const scale = salaryScales.find(
                          (s) => s.id === e.target.value
                        );
                        setSelectedScale(scale);
                      }}
                      label="Filter by Salary Scale"
                    >
                      <MenuItem value="">All Scales</MenuItem>
                      {salaryScales.map((scale) => (
                        <MenuItem key={scale.id} value={scale.id}>
                          {scale.scale_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ height: 500, width: "100%" }}>
                  <DataGrid
                    rows={filteredJobGrades}
                    columns={gradeColumns}
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

            {/* Benefits Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  {benefits.map((benefit) => (
                    <Grid item xs={12} md={6} lg={4} key={benefit.id}>
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
                            <BenefitIcon color="primary" />
                            <Typography variant="h6">
                              {benefit.benefit_name}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {benefit.description}
                          </Typography>
                          <Box sx={{ mb: 1 }}>
                            <Chip
                              label={
                                benefitTypes.find(
                                  (t) => t.value === benefit.benefit_type
                                )?.label
                              }
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Amount:</strong>{" "}
                            {benefit.calculation_method === "fixed"
                              ? `TZS ${benefit.amount?.toLocaleString()}`
                              : `${benefit.percentage}% of basic salary`}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Tax Treatment:</strong>{" "}
                            {benefit.tax_treatment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {benefit.eligibility_criteria}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Reports Tab */}
            {activeTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Salary Distribution
                        </Typography>
                        <Alert severity="info">
                          <Typography variant="body2">
                            Salary distribution chart across scales and grades
                            will be displayed here.
                          </Typography>
                        </Alert>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Benefits Cost Analysis
                        </Typography>
                        <Alert severity="info">
                          <Typography variant="body2">
                            Total benefits cost and breakdown by type will be
                            displayed here.
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
          {hasPermission(PERMISSIONS.MANAGE_SALARY_SCALE) && (
            <MenuItem onClick={() => handleEditScale(selectedScale)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Scale</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => setGradeDialogOpen(true)}>
            <ListItemIcon>
              <GradeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Job Grade</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              /* Generate salary report */
            }}
          >
            <ListItemIcon>
              <ReportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Generate Report</ListItemText>
          </MenuItem>
        </Menu>

        {/* The dialog components would continue here... */}
        {/* I'll provide the dialog components in the next part to keep this manageable */}
      </Box>
    </LocalizationProvider>
  );
};

export default SalaryScaleSettingsPage;