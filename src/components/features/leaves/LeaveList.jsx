import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { useAuth } from "../auth/AuthGuard";
import { ROUTES, LEAVE_STATUS, ROLES } from "../../../constants";
import { getStatusColor } from "../../ui/theme/theme";

const LeaveList = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasAnyRole, hasRole } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Sample data - replace with API call
  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const sampleLeaves = [
        {
          id: 1,
          user_name: "John Doe",
          type: "Annual Leave",
          starting_date: "2024-01-15",
          end_date: "2024-01-20",
          days: 6,
          approval_status: "pending",
          comment: "Family vacation",
          created_at: "2024-01-10",
          user_id: user.id, // Make it owned by current user
        },
        {
          id: 2,
          user_name: "Jane Smith",
          type: "Sick Leave",
          starting_date: "2024-01-12",
          end_date: "2024-01-14",
          days: 3,
          approval_status: "approved",
          comment: "Medical treatment",
          created_at: "2024-01-11",
          user_id: 2,
        },
        {
          id: 3,
          user_name: "Bob Wilson",
          type: "Emergency Leave",
          starting_date: "2024-01-08",
          end_date: "2024-01-08",
          days: 1,
          approval_status: "rejected",
          comment: "Personal emergency",
          created_at: "2024-01-07",
          user_id: 3,
        },
        {
          id: 4,
          user_name: "Alice Johnson",
          type: "Maternity Leave",
          starting_date: "2024-02-01",
          end_date: "2024-04-25",
          days: 84,
          approval_status: "approved by supervisor",
          comment: "Maternity leave",
          created_at: "2024-01-05",
          user_id: 4,
        },
        {
          id: 5,
          user_name: "John Doe",
          type: "Study Leave",
          starting_date: "2024-03-01",
          end_date: "2024-03-05",
          days: 5,
          approval_status: "draft",
          comment: "Professional development course",
          created_at: "2024-01-12",
          user_id: user.id, // Make it owned by current user
        },
      ];

      setLeaves(sampleLeaves);
      setLoading(false);
    };

    fetchLeaves();
  }, [user.id]);

  const handleMenuOpen = (event, leave) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeave(leave);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLeave(null);
  };

  const handleViewLeave = () => {
    if (selectedLeave) {
      navigate(`${ROUTES.LEAVES}/${selectedLeave.id}`);
    }
    handleMenuClose();
  };

  const handleEditLeave = () => {
    if (selectedLeave) {
      navigate(`${ROUTES.LEAVES}/${selectedLeave.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteLeave = () => {
    if (selectedLeave) {
      console.log("Delete leave:", selectedLeave.id);
      // Implement delete functionality
    }
    handleMenuClose();
  };

  const handleApproveLeave = () => {
    if (selectedLeave) {
      console.log("Approve leave:", selectedLeave.id);
      // Implement approve functionality
    }
    handleMenuClose();
  };

  const handleRejectLeave = () => {
    if (selectedLeave) {
      console.log("Reject leave:", selectedLeave.id);
      // Implement reject functionality
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
      case "approved by supervisor":
      case "approved by hr":
        return "warning";
      case "rejected":
        return "error";
      case "draft":
        return "default";
      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  const canEdit = (leave) => {
    const isOwner = leave.user_id === user.id;
    const isDraft = leave.approval_status === "draft";
    const isPending = leave.approval_status === "pending";

    return isOwner && (isDraft || isPending);
  };

  const canApprove = (leave) => {
    const isManager = hasAnyRole([
      ROLES.ADMIN,
      ROLES.HR_MANAGER,
      ROLES.DEPARTMENT_HEAD,
    ]);
    const isPending =
      leave.approval_status === "pending" ||
      leave.approval_status === "approved by supervisor";

    return isManager && isPending && leave.user_id !== user.id;
  };

  const columns = [
    {
      field: "user_name",
      headerName: "Employee",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "type",
      headerName: "Leave Type",
      width: 130,
    },
    {
      field: "date_range",
      headerName: "Date Range",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {new Date(params.row.starting_date).toLocaleDateString()} -
          </Typography>
          <Typography variant="body2">
            {new Date(params.row.end_date).toLocaleDateString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: "days",
      headerName: "Days",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={`${params.value} days`}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: "approval_status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={formatStatus(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Applied",
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(event) => handleMenuOpen(event, params.row)}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Filter data based on active tab
  const getFilteredLeaves = () => {
    let filtered = leaves;

    // Tab filtering
    switch (activeTab) {
      case 0: // All leaves (or My Leaves for employees)
        if (
          !hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_HEAD])
        ) {
          filtered = leaves.filter((leave) => leave.user_id === user.id);
        }
        break;
      case 1: // Pending Approvals (managers) or Pending (employees)
        if (
          hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_HEAD])
        ) {
          filtered = leaves.filter(
            (leave) =>
              leave.approval_status === "pending" ||
              leave.approval_status === "approved by supervisor"
          );
        } else {
          filtered = leaves.filter(
            (leave) =>
              leave.user_id === user.id &&
              (leave.approval_status === "pending" ||
                leave.approval_status === "draft")
          );
        }
        break;
      case 2: // Approved (all users)
        filtered = leaves.filter(
          (leave) => leave.approval_status === "approved"
        );
        break;
      default:
        break;
    }

    // Additional filters
    if (searchTerm) {
      filtered = filtered.filter(
        (leave) =>
          leave.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (leave) => leave.approval_status === statusFilter
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((leave) => leave.type === typeFilter);
    }

    return filtered;
  };

  const filteredLeaves = getFilteredLeaves();
  const leaveTypes = [...new Set(leaves.map((leave) => leave.type))];
  const statuses = [...new Set(leaves.map((leave) => leave.approval_status))];

  const tabLabels = hasAnyRole([
    ROLES.ADMIN,
    ROLES.HR_MANAGER,
    ROLES.DEPARTMENT_HEAD,
  ])
    ? ["All Leaves", "Pending Approvals", "Approved"]
    : ["My Leaves", "Pending", "Approved"];

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
            Leave Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {hasAnyRole([ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_HEAD])
              ? "Manage leave applications and approvals"
              : "View and manage your leave requests"}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(ROUTES.LEAVE_CREATE)}
        >
          Apply for Leave
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search leaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <TextField
              select
              label="Leave Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Types</MenuItem>
              {leaveTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Status</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatStatus(status)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Leave Table */}
      <Card>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredLeaves}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />
        </Box>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewLeave}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {selectedLeave && canEdit(selectedLeave) && (
          <MenuItem onClick={handleEditLeave}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Application</ListItemText>
          </MenuItem>
        )}

        {selectedLeave &&
          canApprove(selectedLeave) && [
            <MenuItem key="approve" onClick={handleApproveLeave}>
              <ListItemIcon>
                <ApproveIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Approve</ListItemText>
            </MenuItem>,
            <MenuItem key="reject" onClick={handleRejectLeave}>
              <ListItemIcon>
                <RejectIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Reject</ListItemText>
            </MenuItem>,
          ]}

        {selectedLeave &&
          selectedLeave.user_id === user.id &&
          selectedLeave.approval_status === "draft" && (
            <MenuItem onClick={handleDeleteLeave} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Draft</ListItemText>
            </MenuItem>
          )}
      </Menu>
    </Box>
  );
};

export default LeaveList;
