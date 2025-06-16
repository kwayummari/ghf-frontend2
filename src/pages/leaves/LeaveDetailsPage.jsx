import React from "react";
import { useLocation } from "react-router-dom";
import LeaveApproval from "../../components/features/leaves/LeaveApproval";

const LeaveDetailsPage = () => {
  const location = useLocation();

  // Check if this is an approval route
  const isApprovalRoute = location.pathname.includes("/approvals/");

  if (isApprovalRoute) {
    return <LeaveApproval />;
  }

  // For regular leave details, you could create a separate component
  // For now, we'll use the approval component as it shows all details
  return <LeaveApproval />;
};

export default LeaveDetailsPage;
