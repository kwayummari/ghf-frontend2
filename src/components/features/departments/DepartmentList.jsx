import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  AccountBalance as BudgetIcon,
  Business as DepartmentIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

import {
  fetchDepartments,
  deleteDepartment,
  toggleDepartmentStatus,
  clearError,
  setFilters,
  setPagination,
  selectDepartments,
  selectDepartmentsLoading,
  selectDepartmentsError,
  selectDepartmentsPagination,
  selectDepartmentsFilters,
} from "../../../store/slices/departmentSlice";

import { ROLES } from "../../../constants";
import useNotification from "../../../hooks/common/useNotification";
import DepartmentForm from "./DepartmentForm";

const DepartmentList = () => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();

  // Simple auth check - allow all for now
  const hasAnyRole = () => true;

  // Redux state
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsLoading);
  const error = useSelector(selectDepartmentsError);
  const pagination = useSelector(selectDepartmentsPagination);
  const filters = useSelector(selectDepartmentsFilters);

  // Local state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuDepartment, setMenuDepartment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // Fetch departments on component mount and when filters change
  useEffect(() => {
    dispatch(
      fetchDepartments({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
    );
  }, [dispatch, pagination.page, pagination.limit, filters]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setFilters({ search: searchTerm }));
        dispatch(setPagination({ page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters.search, dispatch]);

  // Handle status filter change
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    dispatch(setFilters({ status: newStatus }));
    dispatch(setPagination({ page: 1 }));
  };

  // Handle pagination change
  const handlePageChange = (event, newPage) => {
    dispatch(setPagination({ page: newPage }));
  };

  // Handle menu operations
  const handleMenuOpen = (event, department) => {
    setAnchorEl(event.currentTarget);
    setMenuDepartment(department);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDepartment(null);
  };

  // Handle edit
  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setShowEditForm(true);
    handleMenuClose();
  };

  // Handle delete
  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteDepartment(departmentToDelete.id)).unwrap();
      showSuccess("Department deleted successfully");
      setDeleteDialog(false);
      setDepartmentToDelete(null);
    } catch (error) {
      showError(error || "Failed to delete department");
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (department) => {
    try {
      await dispatch(
        toggleDepartmentStatus({
          id: department.id,
          isActive: !department.is_active,
        })
      ).unwrap();
      showSuccess(
        `Department ${department.is_active ? "deactivated" : "activated"} successfully`
      );
      handleMenuClose();
    } catch (error) {
      showError(error || "Failed to update department status");
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Not set";
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive ? "success" : "default";
  };

  if (showCreateForm) {
    return (
      <DepartmentForm
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          setShowCreateForm(false);
          dispatch(
            fetchDepartments({
              page: pagination.page,
              limit: pagination.limit,
              search: filters.search,
              status: filters.status,
              sortBy: filters.sortBy,
              sortOrder: filters.sortOrder,
            })
          );
          showSuccess("Department created successfully");
        }}
      />
    );
  }

  if (showEditForm && selectedDepartment) {
    return (
      <DepartmentForm
        department={selectedDepartment}
        editMode={true}
        onClose={() => {
          setShowEditForm(false);
          setSelectedDepartment(null);
        }}
        onSuccess={() => {
          setShowEditForm(false);
          setSelectedDepartment(null);
          dispatch(
            fetchDepartments({
              page: pagination.page,
              limit: pagination.limit,
              search: filters.search,
              status: filters.status,
              sortBy: filters.sortBy,
              sortOrder: filters.sortOrder,
            })
          );
          showSuccess("Department updated successfully");
        }}
      />
    );
  }

  return (
    <Box>
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
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Departments
          </Typography>
        </Box>

        {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
            size="large"
          >
            Add Department
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearError())}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search departments..."
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
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="body2" color="text.secondary">
                {pagination.total} department{pagination.total !== 1 ? "s" : ""}{" "}
                found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell>Department Head</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Employees</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Loading skeleton rows
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(7)].map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Box
                          sx={{
                            width: "100%",
                            height: 20,
                            bgcolor: "grey.200",
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <DepartmentIcon
                        sx={{ fontSize: 48, color: "grey.400", mb: 2 }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        No departments found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "Create your first department to get started"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar sx={{ bgcolor: "#C2895A" }}>
                          <DepartmentIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {department.department_name}
                          </Typography>
                          {department.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              sx={{ maxWidth: 200 }}
                            >
                              {department.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {department.head ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {department.head.first_name?.[0]}
                            {department.head.last_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {department.head.first_name}{" "}
                              {department.head.last_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {department.head.email}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {department.location ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {department.location}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not specified
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <BudgetIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatCurrency(department.budget)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {department.employee_count || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={department.is_active ? "Active" : "Inactive"}
                        color={getStatusColor(department.is_active)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="More actions">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, department)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => handleEdit(menuDepartment)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Department
        </MenuItem>
        {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
          <MenuItem onClick={() => handleStatusToggle(menuDepartment)}>
            {menuDepartment?.is_active ? (
              <>
                <LocationIcon sx={{ mr: 1 }} fontSize="small" />
                Deactivate
              </>
            ) : (
              <>
                <LocationIcon sx={{ mr: 1 }} fontSize="small" />
                Activate
              </>
            )}
          </MenuItem>
        )}
        {hasAnyRole([ROLES.ADMIN]) && (
          <MenuItem
            onClick={() => handleDeleteClick(menuDepartment)}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the department "
            {departmentToDelete?.department_name}"? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentList;
