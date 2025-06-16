import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  CorporateFare as DepartmentIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  AccountBalance as BudgetIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthGuard";
import { ROUTES, ROLES } from "../../../constants";
import {
  fetchDepartments,
  deleteDepartment,
  setFilters,
  setPagination,
  clearError,
  selectDepartments,
  selectDepartmentsLoading,
  selectDepartmentsError,
  selectDepartmentsPagination,
  selectDepartmentsFilters,
} from "../../../store/slices/departmentSlice";
import DepartmentForm from "./DepartmentForm";

const DepartmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasAnyRole, hasRole } = useAuth();

  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsLoading);
  const error = useSelector(selectDepartmentsError);
  const pagination = useSelector(selectDepartmentsPagination);
  const filters = useSelector(selectDepartmentsFilters);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Fetch departments on component mount and filter changes
  useEffect(() => {
    dispatch(
      fetchDepartments({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
    );
  }, [dispatch, pagination.page, pagination.limit, filters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setFilters({ search: searchTerm }));
        dispatch(setPagination({ page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, dispatch]);

  const handleMenuOpen = (event, department) => {
    setAnchorEl(event.currentTarget);
    setSelectedDepartment(department);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDepartment(null);
  };

  const handleViewDepartment = () => {
    if (selectedDepartment) {
      navigate(`${ROUTES.DEPARTMENTS}/${selectedDepartment.id}`);
    }
    handleMenuClose();
  };

  const handleEditDepartment = () => {
    setShowEditForm(true);
    handleMenuClose();
  };

  const handleDeleteDepartment = async () => {
    if (
      selectedDepartment &&
      window.confirm("Are you sure you want to delete this department?")
    ) {
      try {
        await dispatch(deleteDepartment(selectedDepartment.id)).unwrap();
        // Refresh the list
        dispatch(
          fetchDepartments({
            page: pagination.page,
            limit: pagination.limit,
            search: filters.search,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          })
        );
      } catch (error) {
        console.error("Failed to delete department:", error);
      }
    }
    handleMenuClose();
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setPagination({ page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    dispatch(
      setPagination({
        limit: parseInt(event.target.value, 10),
        page: 1,
      })
    );
  };

  const getDepartmentInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatBudget = (budget) => {
    if (!budget) return "Not set";
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(budget);
  };

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "error";
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
              sortBy: filters.sortBy,
              sortOrder: filters.sortOrder,
            })
          );
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
              sortBy: filters.sortBy,
              sortOrder: filters.sortOrder,
            })
          );
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
          <Typography variant="body1" color="text.secondary">
            Manage organizational departments and structure
          </Typography>
        </Box>

        {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
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

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
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
              sx={{ minWidth: 300 }}
            />

            <Typography variant="body2" color="text.secondary">
              {pagination.total} department{pagination.total !== 1 ? "s" : ""}{" "}
              found
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Departments Grid */}
      <Grid container spacing={3}>
        {departments.map((department) => (
          <Grid item xs={12} sm={6} md={4} key={department.id}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(`${ROUTES.DEPARTMENTS}/${department.id}`)}
            >
              <CardContent>
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 56,
                      height: 56,
                    }}
                  >
                    {getDepartmentInitials(department.department_name)}
                  </Avatar>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={department.is_active ? "Active" : "Inactive"}
                      color={getStatusColor(department.is_active)}
                      size="small"
                    />

                    {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, department);
                        }}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Department Info */}
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  {department.department_name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    height: 40,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {department.description || "No description provided"}
                </Typography>

                {/* Stats */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <GroupIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {department.employee_count || 0} employees
                    </Typography>
                  </Box>

                  {department.head && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {department.head.first_name} {department.head.sur_name}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Budget */}
                {department.budget && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 1,
                    }}
                  >
                    <BudgetIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Budget: {formatBudget(department.budget)}
                    </Typography>
                  </Box>
                )}

                {/* Location */}
                {department.location && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    📍 {department.location}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {!loading && departments.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <DepartmentIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No departments found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Get started by creating your first department"}
            </Typography>
            {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && !searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateForm(true)}
              >
                Create Department
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {departments.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            showFirstButton
            showLastButton
          />
        </Card>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleViewDepartment}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER]) && (
          <MenuItem onClick={handleEditDepartment}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Department</ListItemText>
          </MenuItem>
        )}

        {hasRole(ROLES.ADMIN) && (
          <MenuItem
            onClick={handleDeleteDepartment}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Department</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default DepartmentList;
