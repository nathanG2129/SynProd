import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './auth/auth.css';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Access Denied</h1>
            <p>Please log in to access the dashboard</p>
          </div>
          <button onClick={() => navigate('/login')} className="auth-button">
            GO TO LOGIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome, {user.firstName}!</h1>
          <p>You are successfully logged in to SynProd</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>User Information</h3>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
          <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={handleLogout} className="auth-button" style={{ background: '#f56565' }}>
            LOGOUT
          </button>
          <button onClick={() => navigate('/')} className="auth-button" style={{ background: '#718096' }}>
            BACK TO HOME
          </button>
        </div>
      </div>
    </div>
  );
} 