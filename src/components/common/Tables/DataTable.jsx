import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Paper } from "@mui/material";

const DataTable = ({
  rows = [],
  columns = [],
  loading = false,
  pageSize = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  checkboxSelection = false,
  disableSelectionOnClick = true,
  onSelectionModelChange,
  selectionModel = [],
  ...props
}) => {
  return (
    <Paper elevation={0}>
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={pageSize}
          rowsPerPageOptions={rowsPerPageOptions}
          checkboxSelection={checkboxSelection}
          disableSelectionOnClick={disableSelectionOnClick}
          onSelectionModelChange={onSelectionModelChange}
          selectionModel={selectionModel}
          sx={{
            border: "none",
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
            },
          }}
          {...props}
        />
      </Box>
    </Paper>
  );
};

export default DataTable;
