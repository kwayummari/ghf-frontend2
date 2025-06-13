import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ThemeProvider from "./components/ui/theme/ThemeProvider";
import store from "./store/store";
import AppRoutes from "./routes/AppRoutes";

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              dense
              preventDuplicate
            >
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
