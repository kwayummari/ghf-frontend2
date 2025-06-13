import { createTheme } from '@mui/material/styles';

// GHF Theme Configuration
const baseTheme = {
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 500,
            lineHeight: 1.3,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.6,
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5,
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5,
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.43,
        },
        button: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.75,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 8,
    },
    spacing: 8,
};

// Light Theme
export const lightTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#dc004e',
            light: '#ff5983',
            dark: '#9a0036',
            contrastText: '#ffffff',
        },
        success: {
            main: '#2e7d32',
            light: '#4caf50',
            dark: '#1b5e20',
            contrastText: '#ffffff',
        },
        error: {
            main: '#d32f2f',
            light: '#f44336',
            dark: '#c62828',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#ed6c02',
            light: '#ff9800',
            dark: '#e65100',
            contrastText: '#ffffff',
        },
        info: {
            main: '#0288d1',
            light: '#03a9f4',
            dark: '#01579b',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
        grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#a8a8a8',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
                    '&:hover': {
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
        },
        MuiFormControl: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
        },
        MuiSelect: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    margin: '2px 8px',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.12)',
                        },
                    },
                },
            },
        },
    },
});

// Dark Theme
export const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        secondary: {
            main: '#f48fb1',
            light: '#fce4ec',
            dark: '#e91e63',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        success: {
            main: '#66bb6a',
            light: '#81c784',
            dark: '#388e3c',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#ffa726',
            light: '#ffb74d',
            dark: '#f57c00',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        info: {
            main: '#29b6f6',
            light: '#4fc3f7',
            dark: '#0288d1',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
    },
    components: {
        ...lightTheme.components,
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#2e2e2e',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#555',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#777',
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#2e2e2e',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(144, 202, 249, 0.08)',
                    },
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    margin: '2px 8px',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(144, 202, 249, 0.12)',
                        '&:hover': {
                            backgroundColor: 'rgba(144, 202, 249, 0.16)',
                        },
                    },
                },
            },
        },
    },
});

// Status Colors for Leave, Attendance, etc.
export const statusColors = {
    // Leave Status Colors
    draft: '#9e9e9e',
    pending: '#ff9800',
    'approved by supervisor': '#2196f3',
    'approved by hr': '#4caf50',
    approved: '#4caf50',
    rejected: '#f44336',

    // Attendance Status Colors
    present: '#4caf50',
    absent: '#f44336',
    'on leave': '#2196f3',
    'half day': '#ff9800',

    // General Status Colors
    active: '#4caf50',
    inactive: '#9e9e9e',
    enabled: '#4caf50',
    disabled: '#f44336',
};

// Helper function to get status color
export const getStatusColor = (status, theme = 'light') => {
    const color = statusColors[status?.toLowerCase()] || statusColors.inactive;
    return color;
};

export default lightTheme;