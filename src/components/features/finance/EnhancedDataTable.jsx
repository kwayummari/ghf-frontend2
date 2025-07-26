import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Checkbox,
    Paper,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box
} from '@mui/material';
import {
    MoreVert as MoreIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const EnhancedDataTable = ({
    data = [],
    columns = [],
    loading = false,
    selectable = false,
    selectedItems = [],
    onSelectionChange,
    onRowClick,
    onEdit,
    onView,
    onDelete,
    pagination = true,
    pageSize = 10
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(pageSize);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allIds = data.map(item => item.id);
            onSelectionChange(allIds);
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectRow = (id) => {
        const selectedIndex = selectedItems.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedItems, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedItems.slice(1));
        } else if (selectedIndex === selectedItems.length - 1) {
            newSelected = newSelected.concat(selectedItems.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedItems.slice(0, selectedIndex),
                selectedItems.slice(selectedIndex + 1)
            );
        }

        onSelectionChange(newSelected);
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            pending: { color: '#C2895A', label: 'Pending' },
            submitted: { color: '#C2895A', label: 'Submitted' },
            approved: { color: '#4F78AE', label: 'Approved' },
            rejected: { color: '#C2895A', label: 'Rejected' },
            active: { color: '#4F78AE', label: 'Active' },
            closed: { color: '#C2895A', label: 'Closed' }
        };

        const config = statusConfig[status] || { color: '#C2895A', label: status };

        return (
            <Chip
                label={config.label}
                size="small"
                sx={{
                    backgroundColor: config.color,
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 500
                }}
            />
        );
    };

    const formatCellValue = (value, column) => {
        if (value === null || value === undefined) return '-';

        switch (column.type) {
            case 'currency':
                return `TZS ${parseFloat(value).toLocaleString()}`;
            case 'date':
                return format(new Date(value), 'MMM dd, yyyy');
            case 'datetime':
                return format(new Date(value), 'MMM dd, yyyy HH:mm');
            case 'status':
                return getStatusChip(value);
            case 'boolean':
                return value ? 'Yes' : 'No';
            default:
                return value;
        }
    };

    const handleMenuOpen = (event, row) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
        setSelectedRow(row);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedRow(null);
    };

    const paginatedData = pagination
        ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : data;

    return (
        <Paper sx={{ border: '1px solid rgba(194, 137, 90, 0.2)' }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(79, 120, 174, 0.05)' }}>
                            {selectable && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedItems.length > 0 && selectedItems.length < data.length}
                                        checked={data.length > 0 && selectedItems.length === data.length}
                                        onChange={handleSelectAll}
                                        sx={{
                                            color: '#4F78AE',
                                            '&.Mui-checked': { color: '#4F78AE' }
                                        }}
                                    />
                                </TableCell>
                            )}
                            {columns.map((column) => (
                                <TableCell key={column.field} sx={{ fontWeight: 600, color: '#4F78AE' }}>
                                    {column.headerName}
                                </TableCell>
                            ))}
                            <TableCell sx={{ fontWeight: 600, color: '#4F78AE' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (selectable ? 2 : 1)} align="center">
                                    <Typography sx={{ color: '#4F78AE', py: 4 }}>Loading...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (selectable ? 2 : 1)} align="center">
                                    <Typography sx={{ color: '#4F78AE', py: 4 }}>No data available</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row, index) => (
                                <TableRow
                                    key={row.id || index}
                                    sx={{
                                        '&:hover': { backgroundColor: 'rgba(79, 120, 174, 0.02)' },
                                        cursor: onRowClick ? 'pointer' : 'default'
                                    }}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {selectable && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedItems.indexOf(row.id) !== -1}
                                                onChange={() => handleSelectRow(row.id)}
                                                sx={{
                                                    color: '#4F78AE',
                                                    '&.Mui-checked': { color: '#4F78AE' }
                                                }}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => (
                                        <TableCell key={column.field}>
                                            {formatCellValue(row[column.field], column)}
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, row)}
                                            sx={{ color: '#4F78AE' }}
                                        >
                                            <MoreIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {pagination && (
                <TablePagination
                    component="div"
                    count={data.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    sx={{
                        borderTop: '1px solid rgba(194, 137, 90, 0.2)',
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            color: '#4F78AE'
                        }
                    }}
                />
            )}

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                {onView && (
                    <MenuItem onClick={() => { onView(selectedRow); handleMenuClose(); }}>
                        <ViewIcon sx={{ mr: 1, color: '#4F78AE' }} /> View
                    </MenuItem>
                )}
                {onEdit && (
                    <MenuItem onClick={() => { onEdit(selectedRow); handleMenuClose(); }}>
                        <EditIcon sx={{ mr: 1, color: '#4F78AE' }} /> Edit
                    </MenuItem>
                )}
                {onDelete && (
                    <MenuItem onClick={() => { onDelete(selectedRow); handleMenuClose(); }}>
                        <DeleteIcon sx={{ mr: 1, color: '#C2895A' }} /> Delete
                    </MenuItem>
                )}
            </Menu>
        </Paper>
    );
};

export default EnhancedDataTable;