import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Button,
  Divider,
} from "@mui/material";
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { pettyCashAPI } from "../../../services/api/pettyCash.api";
import useNotification from "../../../hooks/common/useNotification";
import { useAuth } from "../../features/auth/AuthGuard";
import { PERMISSIONS } from "../../../constants";

const PendingApprovalsWidget = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();
  const { hasPermission, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const canViewApprovals =
    hasAnyRole(["Admin"]) || hasPermission(PERMISSIONS.APPROVE_REPLENISHMENT);

  useEffect(() => {
    if (canViewApprovals) {
      fetchPendingApprovals();
    }
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await pettyCashAPI.getAllReplenishments({
        status: "submitted",
        limit: 5,
      });
      setPendingApprovals(response.data.replenishments || []);
    } catch (error) {
      showError("Failed to fetch pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (request) => {
    try {
      await pettyCashAPI.approveReplenishment(request.id, {
        approved_amount: request.amount,
        notes: "Quick approved from dashboard",
      });
      showSuccess("Request approved successfully");
      fetchPendingApprovals();
    } catch (error) {
      showError("Failed to approve request");
    }
  };

  const handleQuickReject = async (request) => {
    try {
      await pettyCashAPI.rejectReplenishment(request.id, {
        rejection_reason: "Rejected from dashboard",
      });
      showSuccess("Request rejected");
      fetchPendingApprovals();
    } catch (error) {
      showError("Failed to reject request");
    }
  };

  if (!canViewApprovals) {
    return null;
  }

  return (
    <Card sx={{ height: "100%", marginTop: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "#4F78AE" }}>
            Pending Approvals
          </Typography>
          <Chip
            label={pendingApprovals.length}
            sx={{ backgroundColor: "#C2895A", color: "#ffffff" }}
          />
        </Box>

        {loading ? (
          <Typography sx={{ color: "#4F78AE" }}>Loading...</Typography>
        ) : pendingApprovals.length === 0 ? (
          <Typography sx={{ color: "#4F78AE", textAlign: "center", py: 2 }}>
            No pending approvals
          </Typography>
        ) : (
          <>
            <List dense>
              {pendingApprovals.map((request, index) => (
                <React.Fragment key={request.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          TZS {request.amount?.toLocaleString()}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "#4F78AE" }}
                          >
                            {request.pettyCashBook?.book_number || "N/A"}
                          </Typography>
                          <br />
                          <Typography
                            variant="caption"
                            sx={{ color: "#000000" }}
                          >
                            {request.description?.substring(0, 30)}...
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(
                              `/finance/petty-cash/replenishment?id=${request.id}`
                            )
                          }
                          sx={{ color: "#4F78AE" }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleQuickApprove(request)}
                          sx={{ color: "#4F78AE" }}
                        >
                          <ApproveIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleQuickReject(request)}
                          sx={{ color: "#C2895A" }}
                        >
                          <RejectIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < pendingApprovals.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                mt: 2,
                borderColor: "#4F78AE",
                color: "#4F78AE",
                "&:hover": { backgroundColor: "rgba(79, 120, 174, 0.1)" },
              }}
              onClick={() => navigate("/finance/petty-cash/replenishment")}
            >
              View All Requests
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsWidget;
