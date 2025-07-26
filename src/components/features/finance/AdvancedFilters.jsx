import React, { useState } from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Collapse,
    Grid,
    Typography
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandIcon,
    ExpandLess as CollapseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const AdvancedFilters = ({
    searchTerm,
    onSearchChange,
    filters = {},
    onFilterChange,
    filterOptions = {}
}) => {
    const [expanded, setExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setLocalFilters({});
        onFilterChange({});
        onSearchChange('');
    };

    const activeFiltersCount = Object.values(localFilters).filter(v => v && v !== '').length;

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: '#4F78AE', mr: 1 }} />,
                        endAdornment: searchTerm && (
                            <IconButton size="small" onClick={() => onSearchChange('')}>
                                <ClearIcon sx={{ color: '#C2895A' }} />
                            </IconButton>
                        )
                    }}
                    sx={{
                        flexGrow: 1,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#C2895A' },
                            '&:hover fieldset': { borderColor: '#4F78AE' },
                            '&.Mui-focused fieldset': { borderColor: '#4F78AE' }
                        }
                    }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        onClick={() => setExpanded(!expanded)}
                        sx={{ color: '#4F78AE' }}
                    >
                        <FilterIcon />
                        {expanded ? <CollapseIcon /> : <ExpandIcon />}
                    </IconButton>

                    {activeFiltersCount > 0 && (
                        <Chip
                            label={`${activeFiltersCount} filters`}
                            size="small"
                            onDelete={clearFilters}
                            sx={{
                                backgroundColor: '#4F78AE',
                                color: '#ffffff',
                                '& .MuiChip-deleteIcon': { color: '#ffffff' }
                            }}
                        />
                    )}
                </Box>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{
                    p: 2,
                    border: '1px solid #C2895A',
                    borderRadius: 1,
                    backgroundColor: 'rgba(79, 120, 174, 0.02)'
                }}>
                    <Typography variant="h6" sx={{ color: '#4F78AE', mb: 2 }}>
                        Advanced Filters
                    </Typography>

                    <Grid container spacing={2}>
                        {filterOptions.status && (
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ color: '#4F78AE' }}>Status</InputLabel>
                                    <Select
                                        value={localFilters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        label="Status"
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#C2895A' }
                                        }}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {filterOptions.status.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {filterOptions.dateRange && (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    <DatePicker
                                        label="Start Date"
                                        value={localFilters.startDate || null}
                                        onChange={(date) => handleFilterChange('startDate', date)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': { borderColor: '#C2895A' }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <DatePicker
                                        label="End Date"
                                        value={localFilters.endDate || null}
                                        onChange={(date) => handleFilterChange('endDate', date)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': { borderColor: '#C2895A' }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </Grid>
                            </>
                        )}

                        {filterOptions.amount && (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Min Amount"
                                        type="number"
                                        value={localFilters.minAmount || ''}
                                        onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#C2895A' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Max Amount"
                                        type="number"
                                        value={localFilters.maxAmount || ''}
                                        onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#C2895A' }
                                            }
                                        }}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>
            </Collapse>
        </Box>
    );
};

export default AdvancedFilters;