import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import ClockInOut from "../../components/features/attendance/ClockInOut";
import AttendanceList from "../../components/features/attendance/AttendanceList";

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Clock In/Out" />
        <Tab label="My Records" />
      </Tabs>

      {activeTab === 0 && <ClockInOut />}
      {activeTab === 1 && <AttendanceList viewMode="personal" />}
    </Box>
  );
};

export default AttendancePage;
