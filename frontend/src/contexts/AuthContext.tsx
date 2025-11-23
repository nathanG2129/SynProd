import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, userAPI } from '../services/api';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  acceptInvite: (token: string, firstName: string, lastName: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
      // Start token refresh interval
      startTokenRefreshInterval();
    } else {
      setIsLoading(false);
    }

    // Cleanup interval on unmount
    return () => {
      clearTokenRefreshInterval();
      clearSessionTimeout();
    };
  }, []);

  // Token refresh interval and session timeout
  let refreshInterval: NodeJS.Timeout | null = null;
  let sessionTimeout: NodeJS.Timeout | null = null;
  let lastActivity = Date.now();

  const startTokenRefreshInterval = () => {
    // Refresh token every 50 minutes (token expires in 1 hour)
    refreshInterval = setInterval(async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          await refreshAuthToken(refreshToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      }
    }, 50 * 60 * 1000); // 50 minutes
  };

  const clearTokenRefreshInterval = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  const startSessionTimeout = () => {
    // Session timeout after 2 hours of inactivity
    const timeoutDuration = 2 * 60 * 60 * 1000; // 2 hours
    
    sessionTimeout = setTimeout(() => {
      console.log('Session timed out due to inactivity');
      logout();
    }, timeoutDuration);
  };

  const clearSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      sessionTimeout = null;
    }
  };

  const updateActivity = () => {
    lastActivity = Date.now();
    clearSessionTimeout();
    if (isAuthenticated) {
      startSessionTimeout();
    }
  };

  // Activity detection
  useEffect(() => {
    if (isAuthenticated) {
      startSessionTimeout();
      
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      const activityHandler = () => {
        updateActivity();
      };

      // Add event listeners for user activity
      events.forEach(event => {
        document.addEventListener(event, activityHandler, true);
      });

      return () => {
        // Clean up event listeners
        events.forEach(event => {
          document.removeEventListener(event, activityHandler, true);
        });
        clearSessionTimeout();
      };
    }
  }, [isAuthenticated]);

  const refreshAuthToken = async (refreshToken: string) => {
    try {
      const response = await authAPI.refreshToken(refreshToken);
      const { token, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      throw error;
    }
  };

  const loadUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, refreshToken, user: userData } = response.data;
      
      localStorage.setItem('token', token!);
      localStorage.setItem('refreshToken', refreshToken!);
      setUser(userData!);
      
      // Start token refresh interval after successful login
      startTokenRefreshInterval();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const acceptInvite = async (token: string, firstName: string, lastName: string, password: string) => {
    try {
      const response = await authAPI.acceptInvite({ token, firstName, lastName, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    clearTokenRefreshInterval();
    clearSessionTimeout();
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    acceptInvite,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 