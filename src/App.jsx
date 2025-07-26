import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Box, CircularProgress, Typography } from "@mui/material";
import ThemeProvider from "./components/ui/theme/ThemeProvider";
import store from "./store/store";
import AppRoutes from "./routes/AppRoutes";
import {
  initializeAuth,
  selectAuthInitialized,
  selectAuthLoading,
} from "./store/slices/authSlice";
import { customTheme } from "./theme/customTheme";

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});

// Loading component for app initialization
const AppLoading = () => (
  <Box
    sx={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      bgcolor: "background.default",
    }}
  >
    <CircularProgress size={50} thickness={4} />
    <Typography variant="h6" color="text.secondary">
      Initializing GHF Office System...
    </Typography>
    <Typography variant="body2" color="text.disabled">
      Please wait while we set up your session
    </Typography>
  </Box>
);

// App Content Component - handles auth initialization
const AppContent = () => {
  const dispatch = useDispatch();
  const initialized = useSelector(selectAuthInitialized);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    // Initialize authentication on app startup
    const initAuth = async () => {
      try {
        await dispatch(initializeAuth()).unwrap();
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Continue anyway - user will be redirected to login if needed
      }
    };

    initAuth();
  }, [dispatch]);

  // Show loading while initializing authentication
  if (!initialized || loading) {
    return <AppLoading />;
  }

  return <AppRoutes />;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We're sorry, but something unexpected happened. Please refresh the
            page and try again.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Refresh Page
            </button>
          </Box>
          {process.env.NODE_ENV === "development" && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography
                variant="caption"
                component="pre"
                sx={{ whiteSpace: "pre-wrap" }}
              >
                {this.state.error?.toString()}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={customTheme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                dense
                preventDuplicate
                autoHideDuration={6000}
                variant="default"
              >
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </SnackbarProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
