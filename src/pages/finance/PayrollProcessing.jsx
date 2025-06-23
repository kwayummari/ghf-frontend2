import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Calculate as CalculateIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
} from "@mui/icons-material";

const PayrollProcessing = () => {
  const [approvedTimesheets, setApprovedTimesheets] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchApprovedTimesheets();
  }, [currentMonth]);

  const fetchApprovedTimesheets = async () => {
    try {
      // Simulate API call to get approved timesheets for payroll
      const sampleApprovedTimesheets = [
        {
          id: 1,
          employee: {
            id: 2,
            name: "John Doe",
            employee_id: "EMP001",
            department: "IT Department",
            position: "Software Developer",
            salary: 1500000, // Monthly salary in TZS
            bank_name: "CRDB Bank",
            account_number: "0150123456789",
          },
          month: 1,
          year: 2024,
          total_hours: 168.5,
          working_days: 21,
          approved_date: "2024-01-26T09:15:00",
          approved_by: "Jane Manager",
          overtime_hours: 8.5,
          status: "approved",
        },
        {
          id: 2,
          employee: {
            id: 3,
            name: "Alice Johnson",
            employee_id: "EMP002",
            department: "HR Department",
            position: "HR Assistant",
            salary: 1200000,
            bank_name: "NMB Bank",
            account_number: "2040987654321",
          },
          month: 1,
          year: 2024,
          total_hours: 160.0,
          working_days: 20,
          approved_date: "2024-01-26T14:30:00",
          approved_by: "HR Director",
          overtime_hours: 0,
          status: "approved",
        },
        {
          id: 3,
          employee: {
            id: 4,
            name: "Bob Wilson",
            employee_id: "EMP003",
            department: "Finance",
            position: "Accountant",
            salary: 1350000,
            bank_name: "CRDB Bank",
            account_number: "0150555777888",
          },
          month: 1,
          year: 2024,
          total_hours: 172.0,
          working_days: 22,
          approved_date: "2024-01-26T16:45:00",
          approved_by: "Finance Manager",
          overtime_hours: 12.0,
          status: "approved",
        },
      ];

      setApprovedTimesheets(sampleApprovedTimesheets);
      calculatePayroll(sampleApprovedTimesheets);
    } catch (error) {
      console.error("Failed to fetch approved timesheets:", error);
    }
  };

  const calculatePayroll = (timesheets) => {
    const payroll = timesheets.map((timesheet) => {
      const employee = timesheet.employee;
      const standardHours = 160; // Standard monthly hours (8h × 20 days)
      const hourlyRate = employee.salary / standardHours;

      // Basic salary calculation
      const basicSalary = employee.salary;

      // Overtime calculation (1.5x rate for hours above standard)
      const overtimeRate = hourlyRate * 1.5;
      const overtimePay = timesheet.overtime_hours * overtimeRate;

      // Allowances (sample calculation)
      const transportAllowance = 50000; // Fixed transport allowance
      const lunchAllowance = timesheet.working_days * 5000; // 5000 per working day

      // Deductions
      const tax = (basicSalary + overtimePay) * 0.15; // 15% tax
      const nssf = Math.min(basicSalary * 0.1, 20000); // 10% NSSF, max 20,000
      const nhif = 30000; // Fixed NHIF contribution

      const grossPay =
        basicSalary + overtimePay + transportAllowance + lunchAllowance;
      const totalDeductions = tax + nssf + nhif;
      const netPay = grossPay - totalDeductions;

      return {
        ...timesheet,
        payroll: {
          basic_salary: basicSalary,
          overtime_pay: overtimePay,
          transport_allowance: transportAllowance,
          lunch_allowance: lunchAllowance,
          gross_pay: grossPay,
          tax: tax,
          nssf: nssf,
          nhif: nhif,
          total_deductions: totalDeductions,
          net_pay: netPay,
          hourly_rate: hourlyRate,
          overtime_rate: overtimeRate,
        },
      };
    });

    setPayrollData(payroll);
  };

  const handleProcessPayroll = async () => {
    setLoading(true);

    try {
      const payrollSubmission = {
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear(),
        processed_date: new Date().toISOString(),
        employees: payrollData.map((item) => ({
          employee_id: item.employee.id,
          employee_code: item.employee.employee_id,
          timesheet_id: item.id,
          total_hours: item.total_hours,
          overtime_hours: item.overtime_hours,
          payroll_details: item.payroll,
          bank_details: {
            bank_name: item.employee.bank_name,
            account_number: item.employee.account_number,
          },
        })),
        total_gross_pay: payrollData.reduce(
          (sum, item) => sum + item.payroll.gross_pay,
          0
        ),
        total_net_pay: payrollData.reduce(
          (sum, item) => sum + item.payroll.net_pay,
          0
        ),
        total_deductions: payrollData.reduce(
          (sum, item) => sum + item.payroll.total_deductions,
          0
        ),
      };

      console.log("Processing payroll:", payrollSubmission);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      alert(
        "Payroll processed successfully! Bank transfer files generated and salary slips created."
      );

      // Update status to processed
      setApprovedTimesheets((prev) =>
        prev.map((ts) => ({ ...ts, status: "payroll_processed" }))
      );
    } catch (error) {
      console.error("Failed to process payroll:", error);
      alert("Failed to process payroll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getTotalSummary = () => {
    return payrollData.reduce(
      (summary, item) => ({
        total_employees: summary.total_employees + 1,
        total_hours: summary.total_hours + item.total_hours,
        total_gross: summary.total_gross + item.payroll.gross_pay,
        total_deductions:
          summary.total_deductions + item.payroll.total_deductions,
        total_net: summary.total_net + item.payroll.net_pay,
      }),
      {
        total_employees: 0,
        total_hours: 0,
        total_gross: 0,
        total_deductions: 0,
        total_net: 0,
      }
    );
  };

  const summary = getTotalSummary();

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
            Payroll Processing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Process salaries for employees with approved timesheets
          </Typography>
        </Box>

        <Chip
          label={`${currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
          color="primary"
          size="large"
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {summary.total_employees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employees to Process
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "success.main" }}
              >
                {formatCurrency(summary.total_gross)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Gross Pay
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "error.main" }}
              >
                {formatCurrency(summary.total_deductions)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Deductions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "info.main" }}
              >
                {formatCurrency(summary.total_net)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Net Pay
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Only employees with supervisor-approved
          timesheets are included in payroll processing. Rejected or pending
          timesheets are excluded automatically.
        </Typography>
      </Alert>

      {/* Payroll Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Employee</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Hours</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Basic Salary</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Overtime</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Allowances</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Gross Pay</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Deductions</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Net Pay</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {item.employee.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.employee.employee_id} • {item.employee.position}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {item.total_hours}h
                        </Typography>
                        {item.overtime_hours > 0 && (
                          <Typography variant="caption" color="warning.main">
                            +{item.overtime_hours}h OT
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.payroll.basic_salary)}
                    </TableCell>
                    <TableCell>
                      {item.overtime_hours > 0
                        ? formatCurrency(item.payroll.overtime_pay)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(
                        item.payroll.transport_allowance +
                          item.payroll.lunch_allowance
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", color: "success.main" }}
                      >
                        {formatCurrency(item.payroll.gross_pay)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error.main">
                        {formatCurrency(item.payroll.total_deductions)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        {formatCurrency(item.payroll.net_pay)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          item.status === "payroll_processed"
                            ? "Processed"
                            : "Ready"
                        }
                        color={
                          item.status === "payroll_processed"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Slip">
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Process Actions */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Process Payroll
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate bank transfer files and salary slips for all approved
                employees
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => console.log("Download payroll report")}
              >
                Download Report
              </Button>

              <LoadingButton
                variant="contained"
                size="large"
                startIcon={<SendIcon />}
                loading={loading}
                disabled={
                  payrollData.length === 0 ||
                  payrollData.every(
                    (item) => item.status === "payroll_processed"
                  )
                }
                onClick={handleProcessPayroll}
              >
                Process Payroll
              </LoadingButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PayrollProcessing;
