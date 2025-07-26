import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../components/features/auth/AuthGuard';
import { PERMISSIONS } from '../../constants';
import useNotification from '../../hooks/common/useNotification';
import { pettyCashAPI } from '../../services/api/pettyCash.api';

// Enhanced Components
import PettyCashSummaryCards from '../../components/features/finance/PettyCashSummaryCards';
import EnhancedDataTable from '../../components/features/finance/EnhancedDataTable';
import QuickActionsToolbar from '../../components/features/finance/QuickActionsToolbar';
import PettyCashAnalytics from '../../components/features/finance/PettyCashAnalytics';
import WorkflowTracker from "../../components/features/finance/WorkflowTracker";
import { exportToPDF, exportToCSV, printReconciliationSheet } from '../../utils/printExport';

const PettyCashPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [pettyCashBooks, setPettyCashBooks] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [replenishmentRequests, setReplenishmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createBookDialog, setCreateBookDialog] = useState(false);
  const [newBookData, setNewBookData] = useState({
    user_id: "",
    opening_balance: "",
    maximum_amount: "",
    minimum_amount: "",
    description: "",
  });

  // Table columns configuration
  const booksColumns = [
    { field: "book_number", headerName: "Book Number", type: "text" },
    {
      field: "custodian_name",
      headerName: "Custodian",
      type: "text",
      valueGetter: (row) =>
        `${row.custodian?.first_name || ""} ${row.custodian?.sur_name || ""}`,
    },
    {
      field: "opening_balance",
      headerName: "Opening Balance",
      type: "currency",
    },
    {
      field: "current_balance",
      headerName: "Current Balance",
      type: "currency",
    },
    { field: "balance_percentage", headerName: "Balance %", type: "text" },
    { field: "status", headerName: "Status", type: "status" },
    { field: "created_at", headerName: "Created", type: "date" },
  ];

  const expensesColumns = [
    { field: "date", headerName: "Date", type: "date" },
    { field: "description", headerName: "Description", type: "text" },
    { field: "amount", headerName: "Amount", type: "currency" },
    {
      field: "petty_cash_book",
      headerName: "Book",
      type: "text",
      valueGetter: (row) => row.pettyCashBook?.book_number || "-",
    },
    {
      field: "created_by_name",
      headerName: "Created By",
      type: "text",
      valueGetter: (row) =>
        `${row.creator?.first_name || ""} ${row.creator?.sur_name || ""}`,
    },
  ];

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
  ];

  useEffect(() => {
    fetchAllData();
  }, [searchTerm, statusFilter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPettyCashBooks(),
        fetchRecentExpenses(),
        fetchReplenishmentRequests(),
      ]);
    } catch (error) {
      showError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPettyCashBooks = async () => {
    try {
      const response = await pettyCashAPI.getAllBooks({
        search: searchTerm,
        status: statusFilter === "all" ? "" : statusFilter,
      });
      setPettyCashBooks(response.data.books || []);
    } catch (error) {
      showError(error.message || "Failed to fetch petty cash books");
    }
  };

  const fetchRecentExpenses = async () => {
    try {
      const response = await pettyCashAPI.getAllExpenses({
        limit: 10,
      });
      setRecentExpenses(response.data.expenses || []);
    } catch (error) {
      showError(error.message || "Failed to fetch recent expenses");
    }
  };

  const fetchReplenishmentRequests = async () => {
    try {
      const response = await pettyCashAPI.getAllReplenishments({
        limit: 10,
      });
      setReplenishmentRequests(response.data.replenishments || []);
    } catch (error) {
      showError(error.message || "Failed to fetch replenishment requests");
    }
  };

  const handleCreateBook = async () => {
    try {
      await pettyCashAPI.createBook(newBookData);
      showSuccess("Petty cash book created successfully");
      setCreateBookDialog(false);
      setNewBookData({
        user_id: "",
        opening_balance: "",
        maximum_amount: "",
        minimum_amount: "",
        description: "",
      });
      fetchPettyCashBooks();
    } catch (error) {
      showError(error.message || "Failed to create petty cash book");
    }
  };

  const handleExport = (format) => {
    const currentData = getCurrentTabData();
    const currentColumns = getCurrentTabColumns();
    const title = getTabTitle();

    switch (format) {
      case "pdf":
        exportToPDF(currentData, currentColumns, title);
        break;
      case "csv":
        exportToCSV(
          currentData,
          currentColumns,
          title.toLowerCase().replace(/\s+/g, "-")
        );
        break;
      default:
        showError("Unsupported export format");
    }
  };

  const handlePrint = () => {
    if (activeTab === 0 && selectedItems.length > 0) {
      const selectedBook = pettyCashBooks.find((book) =>
        selectedItems.includes(book.id)
      );
      if (selectedBook) {
        const bookExpenses = recentExpenses.filter(
          (exp) => exp.petty_cash_book_id === selectedBook.id
        );
        printReconciliationSheet(selectedBook, bookExpenses);
      }
    }
  };

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 0:
        return pettyCashBooks;
      case 1:
        return recentExpenses;
      case 2:
        return replenishmentRequests;
      default:
        return [];
    }
  };

  const getCurrentTabColumns = () => {
    switch (activeTab) {
      case 0:
        return booksColumns;
      case 1:
        return expensesColumns;
      case 2:
        return replenishmentColumns;
      default:
        return [];
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 0:
        return "Petty Cash Books";
      case 1:
        return "Recent Expenses";
      case 2:
        return "Replenishment Requests";
      case 3:
        return "Analytics Report";
      default:
        return "Report";
    }
  };

  const tabContents = [
    {
      label: "Cash Books",
      content: (
        <Box>
          <QuickActionsToolbar
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onExport={handleExport}
            onPrint={handlePrint}
            onAddNew={() => setCreateBookDialog(true)}
            onFilterChange={(filter) => setStatusFilter(filter)}
            showBulkActions={false}
          />
          <EnhancedDataTable
            data={pettyCashBooks}
            columns={booksColumns}
            loading={loading}
            selectable={true}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onRowClick={(book) =>
              navigate(`/finance/petty-cash/expenses?bookId=${book.id}`)
            }
          />
        </Box>
      ),
    },
    {
      label: "Recent Expenses",
      content: (
        <Box>
          <QuickActionsToolbar
            onExport={handleExport}
            onAddNew={() => navigate("/finance/petty-cash/expenses")}
            showBulkActions={false}
          />
          <EnhancedDataTable
            data={recentExpenses}
            columns={expensesColumns}
            loading={loading}
            onRowClick={(expense) =>
              navigate(`/finance/petty-cash/expenses/${expense.id}`)
            }
          />
        </Box>
      ),
    },
    {
      label: "Replenishment",
      content: (
        <Box>
          <QuickActionsToolbar
            selectedItems={selectedItems}
            onBulkApprove={(items) => handleBulkAction("approve", items)}
            onBulkReject={(items) => handleBulkAction("reject", items)}
            onExport={handleExport}
            onAddNew={() => navigate("/finance/petty-cash/replenishment")}
            onSelectionChange={setSelectedItems}
            showBulkActions={hasPermission(PERMISSIONS.APPROVE_REPLENISHMENT)}
          />
          <EnhancedDataTable
            data={replenishmentRequests}
            columns={replenishmentColumns}
            loading={loading}
            selectable={hasPermission(PERMISSIONS.APPROVE_REPLENISHMENT)}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onRowClick={(request) =>
              navigate(`/finance/petty-cash/replenishment?id=${request.id}`)
            }
          />
        </Box>
      ),
    },
    {
      label: "Analytics",
      content: <PettyCashAnalytics />,
    },
  ];

  const handleBulkAction = async (action, items) => {
    try {
      const promises = items.map((id) => {
        if (action === "approve") {
          return pettyCashAPI.approveReplenishment(id, {
            approved_amount: null,
          });
        } else {
          return pettyCashAPI.rejectReplenishment(id, {
            rejection_reason: "Bulk rejection",
          });
        }
      });

      await Promise.all(promises);
      showSuccess(`${items.length} requests ${action}d successfully`);
      setSelectedItems([]);
      fetchReplenishmentRequests();
    } catch (error) {
      showError(`Failed to ${action} requests`);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Summary Cards */}
      <PettyCashSummaryCards onRefresh={fetchAllData} />

      {/* Main Content */}
      <Card sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                color: "#4F78AE",
                fontWeight: 500,
              },
              "& .Mui-selected": {
                color: "#C2895A !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#C2895A",
              },
            }}
          >
            {tabContents.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>{tabContents[activeTab]?.content}</Box>
      </Card>

      {/* Create Book Dialog */}
      <Dialog
        open={createBookDialog}
        onClose={() => setCreateBookDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "#4F78AE" }}>
          Create New Petty Cash Book
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#4F78AE" }}>Custodian</InputLabel>
                <Select
                  value={newBookData.user_id}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, user_id: e.target.value })
                  }
                  label="Custodian"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#C2895A",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4F78AE",
                    },
                  }}
                >
                  <MenuItem value={user.id}>
                    {user.first_name} {user.sur_name}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Opening Balance"
                type="number"
                value={newBookData.opening_balance}
                onChange={(e) =>
                  setNewBookData({
                    ...newBookData,
                    opening_balance: e.target.value,
                  })
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
              <TextField
                fullWidth
                label="Maximum Amount"
                type="number"
                value={newBookData.maximum_amount}
                onChange={(e) =>
                  setNewBookData({
                    ...newBookData,
                    maximum_amount: e.target.value,
                  })
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
              <TextField
                fullWidth
                label="Minimum Amount"
                type="number"
                value={newBookData.minimum_amount}
                onChange={(e) =>
                  setNewBookData({
                    ...newBookData,
                    minimum_amount: e.target.value,
                  })
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newBookData.description}
                onChange={(e) =>
                  setNewBookData({
                    ...newBookData,
                    description: e.target.value,
                  })
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateBookDialog(false)}
            sx={{ color: "#C2895A" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBook}
            variant="contained"
            sx={{
              backgroundColor: "#4F78AE",
              "&:hover": { backgroundColor: "#3A5B89" },
            }}
          >
            Create Book
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      {hasPermission(PERMISSIONS.CREATE_PETTY_CASH_ENTRY) && (
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            backgroundColor: "#4F78AE",
            "&:hover": { backgroundColor: "#3A5B89" },
          }}
          onClick={() => navigate("/finance/petty-cash/expenses")}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default PettyCashPage;