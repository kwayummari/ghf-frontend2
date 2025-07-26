import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { pettyCashAPI } from '../../../services/api/pettyCash.api';
import useNotification from '../../../hooks/common/useNotification';

const PettyCashAnalytics = () => {
    const [expenseData, setExpenseData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('6months');
    const [loading, setLoading] = useState(true);
    const { showError } = useNotification();

    const colors = ['#4F78AE', '#C2895A', '#7A9BC7', '#D4A474', '#3A5B89', '#A36D3F'];

    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedPeriod]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);

            // Fetch expense categories
            const categoriesResponse = await pettyCashAPI.getExpenseCategories();

            // Fetch expenses by category
            const categoryExpensesResponse = await pettyCashAPI.getExpensesByCategory({
                period: selectedPeriod
            });

            // Process data for charts
            const processedCategoryData = categoryExpensesResponse.data?.map((item, index) => ({
                name: item.category || 'Miscellaneous',
                value: parseFloat(item.total_amount || 0),
                color: colors[index % colors.length]
            })) || [];

            setCategoryData(processedCategoryData);

            // Mock trend data based on period (you can replace with real API call)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            const mockTrendData = months.map(month => ({
                month,
                expenses: Math.floor(Math.random() * 500000) + 100000,
                replenishments: Math.floor(Math.random() * 300000) + 50000
            }));

            setTrendData(mockTrendData);

        } catch (error) {
            showError(error.message || 'Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #C2895A',
                    borderRadius: 1,
                    p: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <Typography variant="body2" sx={{ color: '#4F78AE', fontWeight: 500 }}>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: TZS {entry.value?.toLocaleString()}
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#4F78AE', fontWeight: 600 }}>
                    Analytics & Reports
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: '#4F78AE' }}>Period</InputLabel>
                    <Select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        label="Period"
                        sx={{
                            color: '#4F78AE',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#C2895A'
                            }
                        }}
                    >
                        <MenuItem value="3months">Last 3 Months</MenuItem>
                        <MenuItem value="6months">Last 6 Months</MenuItem>
                        <MenuItem value="12months">Last 12 Months</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {/* Expense Trends */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: '#4F78AE', mb: 2 }}>
                                Expense Trends
                            </Typography>
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                                    <Typography sx={{ color: '#4F78AE' }}>Loading chart...</Typography>
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(194, 137, 90, 0.2)" />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#4F78AE"
                                            fontSize={12}
                                        />
                                        <YAxis
                                            stroke="#4F78AE"
                                            fontSize={12}
                                            tickFormatter={(value) => `${(value / 1000)}K`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="expenses"
                                            stroke="#C2895A"
                                            strokeWidth={3}
                                            name="Expenses"
                                            dot={{ fill: '#C2895A', strokeWidth: 2, r: 4 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="replenishments"
                                            stroke="#4F78AE"
                                            strokeWidth={3}
                                            name="Replenishments"
                                            dot={{ fill: '#4F78AE', strokeWidth: 2, r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Category Distribution */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: '#4F78AE', mb: 2 }}>
                                Expense Categories
                            </Typography>
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                                    <Typography sx={{ color: '#4F78AE' }}>Loading chart...</Typography>
                                </Box>
                            ) : categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`TZS ${value.toLocaleString()}`, 'Amount']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                                    <Typography sx={{ color: '#4F78AE' }}>No category data available</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monthly Comparison */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: '#4F78AE', mb: 2 }}>
                                Monthly Comparison
                            </Typography>
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
                                    <Typography sx={{ color: '#4F78AE' }}>Loading chart...</Typography>
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(194, 137, 90, 0.2)" />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#4F78AE"
                                            fontSize={12}
                                        />
                                        <YAxis
                                            stroke="#4F78AE"
                                            fontSize={12}
                                            tickFormatter={(value) => `${(value / 1000)}K`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="expenses"
                                            fill="#C2895A"
                                            name="Expenses"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="replenishments"
                                            fill="#4F78AE"
                                            name="Replenishments"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PettyCashAnalytics;