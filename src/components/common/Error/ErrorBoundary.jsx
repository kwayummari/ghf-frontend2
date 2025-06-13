import React from 'react';
import { Box, Typography, Button, Alert, Container } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 3,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '4rem', md: '6rem' },
                fontWeight: 'bold',
                color: 'error.main',
                mb: 2,
              }}
            >
              Oops!
            </Typography>
            
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </Typography>

            <Alert severity="error" sx={{ mb: 4, maxWidth: 600, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
                size="large"
              >
                Refresh Page
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
                size="large"
              >
                Go Back
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box sx={{ mt: 4, textAlign: 'left', maxWidth: 800 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Debug Information:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.8rem',
                    maxHeight: 300,
                  }}
                >
                  {this.state.error && this.state.error.stack}
                  {this.state.errorInfo.componentStack}
                </Box>
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;