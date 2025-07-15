// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api/auth.api";
import { AUTH_CONSTANTS } from "../constants";

// Create the AuthContext
export const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      const userData = localStorage.getItem(AUTH_CONSTANTS.USER_KEY);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Optionally verify token with backend
        await fetchUserProfile();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        const updatedUser = response.data;
        setUser(updatedUser);
        localStorage.setItem(
          AUTH_CONSTANTS.USER_KEY,
          JSON.stringify(updatedUser)
        );
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Don't logout on profile fetch failure, token might still be valid
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);

      if (response.success) {
        const { token, refreshToken, user: userData } = response.data;

        // Store tokens and user data
        localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, token);
        if (refreshToken) {
          localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, refreshToken);
        }
        localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, data: userData };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "Login failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear stored data
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);

    // Reset state
    setUser(null);
    setIsAuthenticated(false);

    // Redirect to login page
    window.location.href = AUTH_CONSTANTS.LOGOUT_REDIRECT;
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(userData));
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem(
        AUTH_CONSTANTS.REFRESH_TOKEN_KEY
      );
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authAPI.refreshToken(refreshToken);

      if (response.success) {
        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, token);
        if (newRefreshToken) {
          localStorage.setItem(
            AUTH_CONSTANTS.REFRESH_TOKEN_KEY,
            newRefreshToken
          );
        }

        return token;
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
      throw error;
    }
  };

  const contextValue = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshToken,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
