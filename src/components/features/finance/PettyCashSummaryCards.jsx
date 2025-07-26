import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
    Refresh as RefreshIcon,
    PendingActions as PendingIcon
} from '@mui/icons-material';
import { pettyCashAPI } from '../../../services/api/pettyCash.api';
import useNotification from '../../../hooks/common/useNotification';

const PettyCashSummaryCards = ({ onRefresh }) => {
    const [summary, setSummary] = useState({
        totalFloat: 0,
        currentBalance: 0,
        totalExpenses: 0,
        pendingReplenishment: 0,
        lowBalanceAlert: false,
        lowBalanceBooks: 0,
        activeBooks: 0
    });
    const [loading, setLoading] = useState(true);
    const { showError } = useNotification();

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await pettyCashAPI.getPettyCashSummary();
            setSummary(response.data || {});
        } catch (error) {
            showError(error.message || 'Failed to fetch summary');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchSummary();
        if (onRefresh) onRefresh();
    };

    const balancePercentage = summary.totalFloat > 0
        ? (summary.currentBalance / summary.totalFloat) * 100
        : 0;

    const cards = [
        {
            title: 'Total Float',
            value: `TZS ${summary.totalFloat.toLocaleString()}`,
            subtitle: `${summary.activeBooks} Active Books`,
            icon: AccountBalanceIcon,
            color: '#4F78AE'
        },
        {
            title: 'Current Balance',
            value: `TZS ${summary.currentBalance.toLocaleString()}`,
            subtitle: `${balancePercentage.toFixed(1)}% of total`,
            icon: TrendingUpIcon,
            color: balancePercentage < 20 ? '#C2895A' : '#4F78AE',
            progress: balancePercentage,
            warning: balancePercentage < 20
        },
        {
            title: 'Total Expenses',
            value: `TZS ${summary.totalExpenses.toLocaleString()}`,
            subtitle: 'All time expenses',
            icon: AccountBalanceIcon,
            color: '#C2895A'
        },
        {
            title: 'Pending Requests',
            value: summary.pendingReplenishment > 0 ? `TZS ${summary.pendingReplenishment.toLocaleString()}` : '0',
            subtitle: summary.lowBalanceBooks > 0 ? `${summary.lowBalanceBooks} books need attention` : 'All books healthy',
            icon: PendingIcon,
            color: summary.lowBalanceAlert ? '#C2895A' : '#4F78AE',
            warning: summary.lowBalanceAlert
        }
    ];

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ color: '#4F78AE', fontWeight: 600 }}>
                    Petty Cash Overview
                </Typography>
                <Tooltip title="Refresh Data">
                    <IconButton onClick={handleRefresh} disabled={loading}>
                        <RefreshIcon sx={{ color: '#4F78AE' }} />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={3}>
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ height: '100%', position: 'relative' }}>
                            {loading && (
                                <LinearProgress
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: card.color
                                        }
                                    }}
                                />
                            )}
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#4F78AE', mb: 1 }}>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600, mb: 1 }}>
                                            {card.value}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: card.warning ? '#C2895A' : '#4F78AE' }}>
                                            {card.subtitle}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {card.warning && (
                                            <WarningIcon sx={{ color: '#C2895A', fontSize: 16, mr: 0.5 }} />
                                        )}
                                        <card.icon sx={{ color: card.color, fontSize: 24 }} />
                                    </Box>
                                </Box>
                                {card.progress !== undefined && (
                                    <Box sx={{ mt: 2 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={card.progress}
                                            sx={{
                                                height: 4,
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(79, 120, 174, 0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: card.color,
                                                    borderRadius: 2
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PettyCashSummaryCards;