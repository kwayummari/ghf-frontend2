import { GlobalStyles as MuiGlobalStyles } from "@mui/material";

const GlobalStyles = () => (
  <MuiGlobalStyles
    styles={(theme) => ({
      "*": {
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      },
      html: {
        height: "100%",
        width: "100%",
      },
      body: {
        height: "100%",
        width: "100%",
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        scrollbarWidth: "thin",
        scrollbarColor: `${theme.palette.grey[400]} ${theme.palette.grey[200]}`,
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: theme.palette.grey[200],
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.grey[400],
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: theme.palette.grey[600],
        },
      },
      "#root": {
        height: "100%",
        width: "100%",
      },
      ".light-theme": {
        colorScheme: "light",
      },
      ".dark-theme": {
        colorScheme: "dark",
      },
      // Custom scrollbar for dark theme
      ".dark-theme body": {
        scrollbarColor: `${theme.palette.grey[600]} ${theme.palette.grey[800]}`,
        "&::-webkit-scrollbar-track": {
          backgroundColor: theme.palette.grey[800],
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.grey[600],
        },
      },
      // Print styles
      "@media print": {
        body: {
          backgroundColor: "white !important",
          color: "black !important",
        },
        ".no-print": {
          display: "none !important",
        },
      },
    })}
  />
);

export default GlobalStyles;
