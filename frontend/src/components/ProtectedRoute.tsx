import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = requires authentication, false = requires no auth (auth pages)
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  fallbackPath 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Loading...</h1>
            <p>Checking authentication status</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #91b029',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  // For routes that require authentication (dashboard, etc.)
  if (requireAuth && !isAuthenticated) {
    // Redirect to login and save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For routes that require NO authentication (login, register, etc.)
  if (!requireAuth && isAuthenticated) {
    // If user is already authenticated, redirect to dashboard or specified path
    const redirectPath = fallbackPath || '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Render the protected content
  return <>{children}</>;
}
