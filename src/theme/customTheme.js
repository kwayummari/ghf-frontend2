import { createTheme } from '@mui/material/styles';

export const customTheme = createTheme({
    palette: {
        primary: {
            main: '#4F78AE',
            light: '#7A9BC7',
            dark: '#3A5B89',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#C2895A',
            light: '#D4A474',
            dark: '#A36D3F',
            contrastText: '#ffffff'
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff'
        },
        text: {
            primary: '#000000',
            secondary: '#4F78AE'
        },
        divider: '#C2895A',
        success: {
            main: '#4F78AE',
            contrastText: '#ffffff'
        },
        warning: {
            main: '#C2895A',
            contrastText: '#ffffff'
        },
        error: {
            main: '#C2895A',
            contrastText: '#ffffff'
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
            color: '#000000'
        },
        h5: {
            fontWeight: 600,
            color: '#4F78AE'
        },
        h6: {
            fontWeight: 500,
            color: '#4F78AE'
        }
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(79, 120, 174, 0.1)',
                    border: '1px solid rgba(194, 137, 90, 0.2)',
                    borderRadius: 8
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 6
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500
                }
            }
        }
    }
});