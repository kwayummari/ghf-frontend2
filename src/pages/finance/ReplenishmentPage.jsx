import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  AttachFile as AttachIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { selectUser } from "../../store/slices/authSlice";
import { useAuth } from "../../components/features/auth/AuthGuard";
import { PERMISSIONS } from "../../constants";
import useNotification from "../../hooks/common/useNotification";
import useConfirmDialog from "../../hooks/common/useConfirmDialog";
import { LoadingSpinner } from "../../components/common/Loading";

// Enhanced Components
import PettyCashSummaryCards from "../../components/features/finance/PettyCashSummaryCards";
import EnhancedDataTable from "../../components/features/finance/EnhancedDataTable";
import QuickActionsToolbar from "../../components/features/finance/QuickActionsToolbar";
import WorkflowTracker from "../../components/features/finance/WorkflowTracker";
import AdvancedFilters from "../../components/features/finance/AdvancedFilters";
import { exportToPDF, exportToCSV } from "../../utils/printExport";
import { pettyCashAPI } from "../../services/api/pettyCash.api";

const ReplenishmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cashBookId = searchParams.get("cashBookId");
  const requestId = searchParams.get("id");
  const user = useSelector(selectUser);
  const { hasPermission, hasAnyRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { isOpen, config, openDialog, closeDialog, handleConfirm } =
    useConfirmDialog();

  // State management
  const [replenishments, setReplenishments] = useState([]);
  const [cashBooks, setCashBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("current_month");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedReplenishment, setSelectedReplenishment] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [editingReplenishment, setEditingReplenishment] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    petty_cash_book_id: cashBookId || "",
    request_amount: "",
    justification: "",
    urgency: "normal",
    expected_usage_period: 30,
    supporting_documents: [],
    notes: "",
  });

  // Filter state
  const [filters, setFilters] = useState({});

  // Table columns configuration
  const replenishmentColumns = [
    { field: "date", headerName: "Date", type: "date" },
    { field: "amount", headerName: "Amount", type: "currency" },
    {
      field: "book_name",
      headerName: "Book",
      type: "text",
      valueGetter: (row) => row.pettyCashBook?.book_number || "-",
    },
    {
      field: "requested_by_name",
      headerName: "Requested By",
      type: "text",
      valueGetter: (row) =>
        `${row.requester?.first_name || ""} ${row.requester?.sur_name || ""}`,
    },
    { field: "status", headerName: "Status", type: "status" },
    { field: "urgency", headerName: "Priority", type: "status" },
  ];

  // Replenishment statuses
  const replenishmentStatuses = [
    { value: "pending", label: "Pending Approval", color: "#C2895A" },
    { value: "submitted", label: "Submitted", color: "#C2895A" },
    { value: "approved", label: "Approved", color: "#4F78AE" },
    { value: "rejected", label: "Rejected", color: "#C2895A" },
    { value: "disbursed", label: "Disbursed", color: "#4F78AE" },
  ];

  // Urgency levels
  const urgencyLevels = [
    { value: "low", label: "Low", color: "#4F78AE" },
    { value: "normal", label: "Normal", color: "#4F78AE" },
    { value: "high", label: "High", color: "#C2895A" },
    { value: "urgent", label: "Urgent", color: "#C2895A" },
  ];

  // Request steps
  const requestSteps = [
    "Request Information",
    "Justification & Documents",
    "Review & Submit",
  ];

  // Filter options
  const filterOptions = {
    status: replenishmentStatuses.map((s) => ({
      value: s.value,
      label: s.label,
    })),
    dateRange: true,
    amount: true,
  };

  useEffect(() => {
    fetchReplenishments();
    fetchCashBooks();

    // If requestId is provided, fetch and show that specific request
    if (requestId) {
      fetchReplenishmentDetails(requestId);
    }
  }, [requestId, filters, searchTerm]);

  const fetchReplenishments = async () => {
    try {
      setLoading(true);
      const response = await pettyCashAPI.getAllReplenishments({
        page: 1,
        limit: 50,
        search: searchTerm,
        status: statusFilter,
        petty_cash_book_id: cashBookId,
        ...filters,
      });
      setReplenishments(response.data.replenishments || []);
    } catch (error) {
      showError(error.message || "Failed to fetch replenishment requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchCashBooks = async () => {
    try {
      const response = await pettyCashAPI.getAllBooks({
        status: "active",
      });
      setCashBooks(response.data.books || []);
    } catch (error) {
      showError("Failed to fetch cash books");
    }
  };

  const fetchReplenishmentDetails = async (id) => {
    try {
      const response = await pettyCashAPI.getReplenishmentById(id);
      setSelectedReplenishment(response.data);
      setViewDialogOpen(true);

      // Fetch workflow status
      await fetchWorkflowStatus(id);
    } catch (error) {
      showError("Failed to fetch replenishment details");
    }
  };

  const fetchWorkflowStatus = async (id) => {
    try {
      const response = await fetch(
        `/api/v1/petty-cash/replenishment/${id}/workflow`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setWorkflowStatus(data.data);
    } catch (error) {
      console.error("Failed to fetch workflow status:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingReplenishment) {
        await pettyCashAPI.updateReplenishment(
          editingReplenishment.id,
          formData
        );
        showSuccess("Replenishment request updated successfully");
      } else {
        await pettyCashAPI.createReplenishment(formData);
        showSuccess("Replenishment request submitted successfully");
      }
      setDialogOpen(false);
      setRequestDialogOpen(false);
      resetForm();
      fetchReplenishments();
    } catch (error) {
      showError(error.message || "Failed to save replenishment request");
    }
  };

  const resetForm = () => {
    setFormData({
      petty_cash_book_id: cashBookId || "",
      request_amount: "",
      justification: "",
      urgency: "normal",
      expected_usage_period: 30,
      supporting_documents: [],
      notes: "",
    });
    setEditingReplenishment(null);
    setActiveStep(0);
  };

  // Handle approval actions
  const handleApprove = async (replenishment) => {
    try {
      await pettyCashAPI.approveReplenishment(replenishment.id, {
        approved_amount: replenishment.amount,
        notes: "Approved via system",
      });
      showSuccess("Replenishment request approved successfully");
      fetchReplenishments();
      setViewDialogOpen(false);
    } catch (error) {
      showError(error.message || "Failed to approve replenishment request");
    }
  };

  const handleReject = async (replenishment) => {
    openDialog({
      title: "Confirm Rejection",
      message: `Are you sure you want to reject this replenishment request for TZS ${replenishment.amount?.toLocaleString()}?`,
      onConfirm: async () => {
        try {
          await pettyCashAPI.rejectReplenishment(replenishment.id, {
            rejection_reason: "Rejected via system",
          });
          showSuccess("Replenishment request rejected");
          fetchReplenishments();
          setViewDialogOpen(false);
        } catch (error) {
          showError(error.message || "Failed to reject replenishment request");
        }
      },
    });
  };

  // Bulk operations
  const handleBulkApprove = async (items) => {
    try {
      const promises = items.map((id) =>
        pettyCashAPI.approveReplenishment(id, { approved_amount: null })
      );
      await Promise.all(promises);
      showSuccess(`${items.length} requests approved successfully`);
      setSelectedItems([]);
      fetchReplenishments();
    } catch (error) {
      showError("Failed to approve requests");
    }
  };

  const handleBulkReject = async (items) => {
    openDialog({
      title: "Confirm Bulk Rejection",
      message: `Are you sure you want to reject ${items.length} replenishment requests?`,
      onConfirm: async () => {
        try {
          const promises = items.map((id) =>
            pettyCashAPI.rejectReplenishment(id, {
              rejection_reason: "Bulk rejection",
            })
          );
          await Promise.all(promises);
          showSuccess(`${items.length} requests rejected successfully`);
          setSelectedItems([]);
          fetchReplenishments();
        } catch (error) {
          showError("Failed to reject requests");
        }
      },
    });
  };

  // Export functions
  const handleExport = (format) => {
    const title = "Replenishment Requests";
    switch (format) {
      case "pdf":
        exportToPDF(replenishments, replenishmentColumns, title);
        break;
      case "csv":
        exportToCSV(
          replenishments,
          replenishmentColumns,
          title.toLowerCase().replace(/\s+/g, "-")
        );
        break;
      default:
        showError("Unsupported export format");
    }
  };

  // Filter replenishments
  const filteredReplenishments = replenishments.filter((replenishment) => {
    const matchesSearch =
      searchTerm === "" ||
      replenishment.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      replenishment.pettyCashBook?.book_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      replenishment.requester?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      replenishment.requester?.sur_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      !statusFilter || replenishment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading && replenishments.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Summary Cards */}
      <PettyCashSummaryCards onRefresh={fetchReplenishments} />

      {/* Main Content */}
      <Card sx={{ mt: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h5"
            sx={{ color: "#4F78AE", fontWeight: 600, mb: 3 }}
          >
            Replenishment Requests
          </Typography>

          {/* Advanced Filters */}
          <AdvancedFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={setFilters}
            filterOptions={filterOptions}
          />

          {/* Quick Actions Toolbar */}
          <QuickActionsToolbar
            selectedItems={selectedItems}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            onExport={handleExport}
            onAddNew={() => setRequestDialogOpen(true)}
            onFilterChange={(filter) => setStatusFilter(filter)}
            showBulkActions={hasPermission(PERMISSIONS.APPROVE_REPLENISHMENT)}
          />

          {/* Data Table */}
          <EnhancedDataTable
            data={filteredReplenishments}
            columns={replenishmentColumns}
            loading={loading}
            selectable={hasPermission(PERMISSIONS.APPROVE_REPLENISHMENT)}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onView={(request) => {
              setSelectedReplenishment(request);
              setViewDialogOpen(true);
              fetchWorkflowStatus(request.id);
            }}
            onEdit={(request) => {
              setEditingReplenishment(request);
              setFormData({
                petty_cash_book_id: request.petty_cash_book_id,
                request_amount: request.amount,
                justification: request.description,
                urgency: request.urgency || "normal",
                expected_usage_period: 30,
                supporting_documents: [],
                notes: request.notes || "",
              });
              setDialogOpen(true);
            }}
          />
        </Box>
      </Card>

      {/* Create/Edit Request Dialog */}
      <Dialog
        open={requestDialogOpen || dialogOpen}
        onClose={() => {
          setRequestDialogOpen(false);
          setDialogOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: "#4F78AE" }}>
          {editingReplenishment
            ? "Edit Replenishment Request"
            : "New Replenishment Request"}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {requestSteps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label.Mui-active": { color: "#4F78AE" },
                    "& .MuiStepLabel-label.Mui-completed": { color: "#4F78AE" },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#4F78AE" }}>
                    Petty Cash Book
                  </InputLabel>
                  <Select
                    value={formData.petty_cash_book_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        petty_cash_book_id: e.target.value,
                      })
                    }
                    label="Petty Cash Book"
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#C2895A",
                      },
                    }}
                  >
                    {cashBooks.map((book) => (
                      <MenuItem key={book.id} value={book.id}>
                        {book.book_number} - TZS{" "}
                        {book.current_balance?.toLocaleString()} available
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Request Amount (TZS)"
                  type="number"
                  value={formData.request_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, request_amount: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#C2895A" },
                      "&:hover fieldset": { borderColor: "#4F78AE" },
                      "&.Mui-focused fieldset": { borderColor: "#4F78AE" },
                    },
                    "& .MuiInputLabel-root": { color: "#4F78AE" },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#4F78AE" }}>Urgency</InputLabel>
                  <Select
                    value={formData.urgency}
                    onChange={(e) =>
                      setFormData({ ...formData, urgency: e.target.value })
                    }
                    label="Urgency"
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#C2895A",
                      },
                    }}
                  >
                    {urgencyLevels.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Justification"
                  multiline
                  rows={4}
                  value={formData.justification}
                  onChange={(e) =>
                    setFormData({ ...formData, justification: e.target.value })
                  }
                  placeholder="Explain why this replenishment is needed..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#C2895A" },
                      "&:hover fieldset": { borderColor: "#4F78AE" },
                      "&.Mui-focused fieldset": { borderColor: "#4F78AE" },
                    },
                    "& .MuiInputLabel-root": { color: "#4F78AE" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any additional information..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#C2895A" },
                      "&:hover fieldset": { borderColor: "#4F78AE" },
                      "&.Mui-focused fieldset": { borderColor: "#4F78AE" },
                    },
                    "& .MuiInputLabel-root": { color: "#4F78AE" },
                  }}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: "#4F78AE", mb: 2 }}>
                Review Request
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#4F78AE" }}>
                      Book
                    </Typography>
                    <Typography>
                      {cashBooks.find(
                        (b) => b.id == formData.petty_cash_book_id
                      )?.book_number || "Not selected"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#4F78AE" }}>
                      Amount
                    </Typography>
                    <Typography variant="h6">
                      TZS{" "}
                      {parseFloat(
                        formData.request_amount || 0
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#4F78AE" }}>
                      Urgency
                    </Typography>
                    <Chip
                      label={
                        urgencyLevels.find((u) => u.value === formData.urgency)
                          ?.label || "Normal"
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          urgencyLevels.find(
                            (u) => u.value === formData.urgency
                          )?.color || "#4F78AE",
                        color: "#ffffff",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#4F78AE" }}>
                      Justification
                    </Typography>
                    <Typography>
                      {formData.justification || "No justification provided"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRequestDialogOpen(false);
              setDialogOpen(false);
              resetForm();
            }}
            sx={{ color: "#C2895A" }}
          >
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button
              onClick={() => setActiveStep(activeStep - 1)}
              sx={{ color: "#4F78AE" }}
            >
              Back
            </Button>
          )}
          {activeStep < requestSteps.length - 1 ? (
            <Button
              onClick={() => setActiveStep(activeStep + 1)}
              variant="contained"
              sx={{
                backgroundColor: "#4F78AE",
                "&:hover": { backgroundColor: "#3A5B89" },
              }}
              disabled={
                (activeStep === 0 &&
                  (!formData.petty_cash_book_id || !formData.request_amount)) ||
                (activeStep === 1 && !formData.justification)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                backgroundColor: "#4F78AE",
                "&:hover": { backgroundColor: "#3A5B89" },
              }}
            >
              {editingReplenishment ? "Update Request" : "Submit Request"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedReplenishment(null);
          setWorkflowStatus(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: "#4F78AE" }}>
          Request Details
          {selectedReplenishment && (
            <Typography variant="body2" sx={{ color: "#000000", mt: 0.5 }}>
              Request ID: {selectedReplenishment.id} | Amount: TZS{" "}
              {selectedReplenishment.amount?.toLocaleString()}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedReplenishment && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: "#4F78AE", mb: 2 }}>
                  Request Information
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#4F78AE" }}>
                    Book
                  </Typography>
                  <Typography>
                    {selectedReplenishment.pettyCashBook?.book_number}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#4F78AE" }}>
                    Requested By
                  </Typography>
                  <Typography>
                    {selectedReplenishment.requester?.first_name}{" "}
                    {selectedReplenishment.requester?.sur_name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#4F78AE" }}>
                    Date
                  </Typography>
                  <Typography>
                    {format(new Date(selectedReplenishment.date), "PPP")}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#4F78AE" }}>
                    Status
                  </Typography>
                  <Chip
                    label={
                      replenishmentStatuses.find(
                        (s) => s.value === selectedReplenishment.status
                      )?.label || selectedReplenishment.status
                    }
                    size="small"
                    sx={{
                      backgroundColor:
                        replenishmentStatuses.find(
                          (s) => s.value === selectedReplenishment.status
                        )?.color || "#4F78AE",
                      color: "#ffffff",
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#4F78AE" }}>
                    Justification
                  </Typography>
                  <Typography>{selectedReplenishment.description}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                {workflowStatus && (
                  <WorkflowTracker
                    workflowSteps={workflowStatus.steps || []}
                    orientation="vertical"
                  />
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setSelectedReplenishment(null);
              setWorkflowStatus(null);
            }}
            sx={{ color: "#C2895A" }}
          >
            Close
          </Button>
          {hasPermission(PERMISSIONS.APPROVE_REPLENISHMENT) &&
            selectedReplenishment?.status === "submitted" && (
              <>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#4F78AE",
                    "&:hover": { backgroundColor: "#3A5B89" },
                    mr: 1,
                  }}
                  onClick={() => handleApprove(selectedReplenishment)}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "#C2895A",
                    color: "#C2895A",
                    "&:hover": {
                      borderColor: "#A36D3F",
                      backgroundColor: "rgba(194, 137, 90, 0.1)",
                    },
                  }}
                  onClick={() => handleReject(selectedReplenishment)}
                >
                  Reject
                </Button>
              </>
            )}
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={isOpen} onClose={closeDialog}>
        <DialogTitle sx={{ color: "#4F78AE" }}>{config.title}</DialogTitle>
        <DialogContent>
          <Typography>{config.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} sx={{ color: "#C2895A" }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              backgroundColor: "#4F78AE",
              "&:hover": { backgroundColor: "#3A5B89" },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReplenishmentPage;
