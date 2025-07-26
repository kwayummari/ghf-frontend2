import React, { useState } from 'react';
import {
    Box,
    Button,
    ButtonGroup,
    Menu,
    MenuItem,
    Divider,
    Typography,
    Tooltip
} from '@mui/material';
import {
    Check as ApproveIcon,
    Close as RejectIcon,
    GetApp as ExportIcon,
    Print as PrintIcon,
    Add as AddIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';

const QuickActionsToolbar = ({
    selectedItems = [],
    onBulkApprove,
    onBulkReject,
    onExport,
    onPrint,
    onAddNew,
    onFilterChange,
    showBulkActions = true,
    showExport = true,
    showAdd = true
}) => {
    const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
    const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

    const handleBulkApprove = () => {
        if (selectedItems.length > 0 && onBulkApprove) {
            onBulkApprove(selectedItems);
        }
    };

    const handleBulkReject = () => {
        if (selectedItems.length > 0 && onBulkReject) {
            onBulkReject(selectedItems);
        }
    };

    const handleExport = (format) => {
        setExportMenuAnchor(null);
        if (onExport) {
            onExport(format);
        }
    };

    const exportOptions = [
        { label: 'Export as CSV', value: 'csv' },
        { label: 'Export as PDF', value: 'pdf' },
        { label: 'Export as Excel', value: 'xlsx' }
    ];

    const filterOptions = [
        { label: 'All Items', value: 'all' },
        { label: 'Pending Only', value: 'pending' },
        { label: 'Approved Only', value: 'approved' },
        { label: 'Rejected Only', value: 'rejected' }
    ];

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            p: 2,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(194, 137, 90, 0.2)',
            borderRadius: 1
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {showBulkActions && selectedItems.length > 0 && (
                    <>
                        <Typography variant="body2" sx={{ color: '#4F78AE', fontWeight: 500 }}>
                            {selectedItems.length} selected
                        </Typography>
                        <ButtonGroup size="small">
                            <Tooltip title="Approve Selected">
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#4F78AE',
                                        '&:hover': { backgroundColor: '#3A5B89' },
                                        color: '#ffffff'
                                    }}
                                    startIcon={<ApproveIcon />}
                                    onClick={handleBulkApprove}
                                >
                                    Approve
                                </Button>
                            </Tooltip>
                            <Tooltip title="Reject Selected">
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: '#C2895A',
                                        color: '#C2895A',
                                        '&:hover': {
                                            borderColor: '#A36D3F',
                                            backgroundColor: 'rgba(194, 137, 90, 0.1)'
                                        }
                                    }}
                                    startIcon={<RejectIcon />}
                                    onClick={handleBulkReject}
                                >
                                    Reject
                                </Button>
                            </Tooltip>
                        </ButtonGroup>
                        <Divider orientation="vertical" flexItem />
                    </>
                )}

                <Button
                    variant="outlined"
                    size="small"
                    sx={{
                        borderColor: '#4F78AE',
                        color: '#4F78AE',
                        '&:hover': {
                            borderColor: '#3A5B89',
                            backgroundColor: 'rgba(79, 120, 174, 0.1)'
                        }
                    }}
                    startIcon={<FilterIcon />}
                    onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                >
                    Filter
                </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {showExport && (
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            borderColor: '#C2895A',
                            color: '#C2895A',
                            '&:hover': {
                                borderColor: '#A36D3F',
                                backgroundColor: 'rgba(194, 137, 90, 0.1)'
                            }
                        }}
                        startIcon={<ExportIcon />}
                        onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                    >
                        Export
                    </Button>
                )}

                <Button
                    variant="outlined"
                    size="small"
                    sx={{
                        borderColor: '#4F78AE',
                        color: '#4F78AE',
                        '&:hover': {
                            borderColor: '#3A5B89',
                            backgroundColor: 'rgba(79, 120, 174, 0.1)'
                        }
                    }}
                    startIcon={<PrintIcon />}
                    onClick={onPrint}
                >
                    Print
                </Button>

                {showAdd && (
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            backgroundColor: '#4F78AE',
                            '&:hover': { backgroundColor: '#3A5B89' },
                            color: '#ffffff'
                        }}
                        startIcon={<AddIcon />}
                        onClick={onAddNew}
                    >
                        Add New
                    </Button>
                )}
            </Box>

            {/* Export Menu */}
            <Menu
                anchorEl={exportMenuAnchor}
                open={Boolean(exportMenuAnchor)}
                onClose={() => setExportMenuAnchor(null)}
            >
                {exportOptions.map((option) => (
                    <MenuItem key={option.value} onClick={() => handleExport(option.value)}>
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>

            {/* Filter Menu */}
            <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={() => setFilterMenuAnchor(null)}
            >
                {filterOptions.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => {
                            setFilterMenuAnchor(null);
                            if (onFilterChange) onFilterChange(option.value);
                        }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default QuickActionsToolbar;