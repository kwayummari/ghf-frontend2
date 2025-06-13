import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get theme preference from localStorage or default to light
    const savedTheme = localStorage.getItem("ghf_theme_mode");
    return savedTheme === "dark";
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("ghf_theme_mode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  // Update body class for theme-specific styles
  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.add("dark-theme");
      body.classList.remove("light-theme");
    } else {
      body.classList.add("light-theme");
      body.classList.remove("dark-theme");
    }
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
