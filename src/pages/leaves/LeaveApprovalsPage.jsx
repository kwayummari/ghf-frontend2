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
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as PendingIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { ROUTES, LEAVE_STATUS, ROLES } from "../../constants";

const LeaveApprovalsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasRole, hasAnyRole } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    const fetchPendingLeaves = async () => {
      setLoading(true);
      try {
        // Simulate API call based on user role
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const sampleLeaves = [
          {
            id: 1,
            user_name: "John Doe",
            user_email: "john.doe@ghf.org",
            department: "IT Department",
            type: "Annual Leave",
            starting_date: "2024-02-15",
            end_date: "2024-02-20",
            days: 6,
            approval_status: "pending",
            comment: "Family vacation",
            created_at: "2024-02-10",
            current_approver_role: "HR Manager",
            can_approve: hasRole(ROLES.HR_MANAGER),
          },
          {
            id: 2,
            user_name: "Jane Smith",
            user_email: "jane.smith@ghf.org",
            department: "Finance",
            type: "Sick Leave",
            starting_date: "2024-02-18",
            end_date: "2024-02-20",
            days: 3,
            approval_status: "approved by hr",
            comment: "Medical treatment",
            created_at: "2024-02-16",
            current_approver_role: "Admin",
            can_approve: hasRole(ROLES.ADMIN),
          },
          {
            id: 3,
            user_name: "Bob Wilson",
            user_email: "bob.wilson@ghf.org",
            department: "Operations",
            type: "Emergency Leave",
            starting_date: "2024-02-25",
            end_date: "2024-02-25",
            days: 1,
            approval_status: "pending",
            comment: "Personal emergency",
            created_at: "2024-02-22",
            current_approver_role: "HR Manager",
            can_approve: hasRole(ROLES.HR_MANAGER),
          },
          {
            id: 4,
            user_name: "Alice Johnson",
            user_email: "alice.johnson@ghf.org",
            department: "HR",
            type: "Maternity Leave",
            starting_date: "2024-03-01",
            end_date: "2024-05-24",
            days: 84,
            approval_status: "approved by hr",
            comment: "Maternity leave",
            created_at: "2024-02-20",
            current_approver_role: "Admin",
            can_approve: hasRole(ROLES.ADMIN),
          },
          {
            id: 5,
            user_name: "Michael Brown",
            user_email: "michael.brown@ghf.org",
            department: "IT Department",
            type: "Study Leave",
            starting_date: "2024-03-10",
            end_date: "2024-03-15",
            days: 6,
            approval_status: "pending",
            comment: "Professional development course",
            created_at: "2024-02-25",
            current_approver_role: "HR Manager",
            can_approve: hasRole(ROLES.HR_MANAGER),
          },
        ];

        // Filter based on user role
        let filteredLeaves = sampleLeaves;

        if (hasRole(ROLES.HR_MANAGER) && !hasRole(ROLES.ADMIN)) {
          // HR Managers see pending leaves that need HR approval
          filteredLeaves = sampleLeaves.filter(
            (leave) =>
              leave.approval_status === "pending" &&
              leave.current_approver_role === "HR Manager"
          );
        } else if (hasRole(ROLES.ADMIN)) {
          // Admins see all leaves (both HR approved and pending)
          filteredLeaves = sampleLeaves;
        }

        setLeaves(filteredLeaves);
      } catch (error) {
        console.error("Failed to fetch leaves:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingLeaves();
  }, [hasRole]);

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
      navigate(`/leaves/approvals/${selectedLeave.id}`);
    }
    handleMenuClose();
  };

  const handleQuickApprove = async () => {
    if (selectedLeave) {
      console.log("Quick approve leave:", selectedLeave.id);
      // Implement quick approve functionality
      // This would call the API to approve without going to detail page
    }
    handleMenuClose();
  };

  const handleQuickReject = () => {
    if (selectedLeave) {
      console.log("Quick reject leave:", selectedLeave.id);
      // Implement quick reject functionality
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "approved by hr":
        return "info";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  const getApprovalBadge = (leave) => {
    if (
      leave.current_approver_role === "HR Manager" &&
      hasRole(ROLES.HR_MANAGER)
    ) {
      return (
        <Chip label="Awaiting Your Approval" color="warning" size="small" />
      );
    }
    if (leave.current_approver_role === "Admin" && hasRole(ROLES.ADMIN)) {
      return <Chip label="Awaiting Your Approval" color="error" size="small" />;
    }
    return (
      <Chip
        label={`Awaiting ${leave.current_approver_role}`}
        color="default"
        size="small"
      />
    );
  };

  const columns = [
    {
      field: "user_info",
      headerName: "Employee",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
            {params.row.user_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {params.row.department}
          </Typography>
        </Box>
      ),
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
            {new Date(params.row.starting_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            to {new Date(params.row.end_date).toLocaleDateString()}
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
          label={`${params.value}d`}
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
        <Box>
          <Chip
            label={formatStatus(params.value)}
            color={getStatusColor(params.value)}
            size="small"
            sx={{ mb: 0.5 }}
          />
          <br />
          {getApprovalBadge(params.row)}
        </Box>
      ),
    },
    {
      field: "created_at",
      headerName: "Applied",
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => {
        const today = new Date();
        const startDate = new Date(params.row.starting_date);
        const daysUntilStart = Math.ceil(
          (startDate - today) / (1000 * 60 * 60 * 24)
        );

        let priority = "Normal";
        let color = "default";

        if (daysUntilStart <= 3) {
          priority = "Urgent";
          color = "error";
        } else if (daysUntilStart <= 7) {
          priority = "High";
          color = "warning";
        }

        return <Chip label={priority} color={color} size="small" />;
      },
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

  // Filter data based on active tab and filters
  const getFilteredLeaves = () => {
    let filtered = leaves;

    // Tab filtering
    switch (activeTab) {
      case 0: // My Queue - leaves that current user can approve
        filtered = leaves.filter((leave) => leave.can_approve);
        break;
      case 1: // Pending HR - pending leaves waiting for HR
        filtered = leaves.filter(
          (leave) =>
            leave.approval_status === "pending" &&
            leave.current_approver_role === "HR Manager"
        );
        break;
      case 2: // Pending Admin - HR approved leaves waiting for admin
        filtered = leaves.filter(
          (leave) =>
            leave.approval_status === "approved by hr" &&
            leave.current_approver_role === "Admin"
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
          leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.department.toLowerCase().includes(searchTerm.toLowerCase())
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

  const pendingCount = leaves.filter((leave) => leave.can_approve).length;

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
            Leave Approvals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve pending leave applications
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => navigate(ROUTES.LEAVES)}>
          View All Leaves
        </Button>
      </Box>

      {/* Alert for pending approvals */}
      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<PendingIcon />}>
          You have {pendingCount} leave application{pendingCount > 1 ? "s" : ""}{" "}
          awaiting your approval.
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={`My Queue (${leaves.filter((l) => l.can_approve).length})`}
          />
          <Tab
            label={`Pending HR (${leaves.filter((l) => l.approval_status === "pending").length})`}
          />
          {hasRole(ROLES.ADMIN) && (
            <Tab
              label={`Pending Admin (${leaves.filter((l) => l.approval_status === "approved by hr").length})`}
            />
          )}
        </Tabs>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search by employee, type, or department..."
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

      {/* Leaves Table */}
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
              "& .MuiDataGrid-row": {
                cursor: "pointer",
              },
            }}
            onRowClick={(params) => {
              navigate(`/leaves/approvals/${params.id}`);
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

        {selectedLeave?.can_approve && [
          <MenuItem key="approve" onClick={handleQuickApprove}>
            <ListItemIcon>
              <ApproveIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Quick Approve</ListItemText>
          </MenuItem>,
          <MenuItem key="reject" onClick={handleQuickReject}>
            <ListItemIcon>
              <RejectIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Quick Reject</ListItemText>
          </MenuItem>,
        ]}
      </Menu>
    </Box>
  );
};

export default LeaveApprovalsPage;
