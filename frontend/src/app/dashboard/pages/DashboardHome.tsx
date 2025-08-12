import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

export function DashboardHome() {
  const { user } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'PRODUCTION':
        return 'Production User';
      case 'MANAGER':
        return 'Manager';
      case 'ADMIN':
        return 'Administrator';
      default:
        return role;
    }
  };

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'PRODUCTION':
        return 'Access product recipes and production guidelines.';
      case 'MANAGER':
        return 'Manage products, recipes, and view production reports.';
      case 'ADMIN':
        return 'Full system administration and user management access.';
      default:
        return 'Welcome to the SynProd production management system.';
    }
  };

  const getQuickActions = (role: string) => {
    const baseActions = [
      {
        title: 'View Recipes',
        description: 'Browse and search product recipes',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        ),
        path: '/dashboard/recipes',
        roles: ['PRODUCTION', 'MANAGER', 'ADMIN']
      },
      {
        title: 'Manage Products',
        description: 'Add, edit, and organize products',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        ),
        path: '/dashboard/products',
        roles: ['MANAGER', 'ADMIN']
      },
      {
        title: 'User Management',
        description: 'Manage system users and permissions',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
        ),
        path: '/dashboard/users',
        roles: ['ADMIN']
      },
      {
        title: 'Reports',
        description: 'View production and system reports',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"/>
            <path d="M7 12l4-4 4 4 4-4"/>
          </svg>
        ),
        path: '/dashboard/reports',
        roles: ['MANAGER', 'ADMIN']
      }
    ];

    return baseActions.filter(action => action.roles.includes(role));
  };

  if (!user) {
    return null;
  }

  const quickActions = getQuickActions(user.role);

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user.firstName}!</h1>
        <p className="page-subtitle">{getWelcomeMessage(user.role)}</p>
      </div>

      <div className="dashboard-grid">
        <div className="content-card">
          <h2>Your Profile</h2>
          <div className="profile-summary">
            <div className="profile-item">
              <span className="profile-label">Name:</span>
              <span className="profile-value">{user.firstName} {user.lastName}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user.email}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Role:</span>
              <span className={`role-badge ${user.role.toLowerCase()}`}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Email Verified:</span>
              <span className={`verification-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                {user.emailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Member Since:</span>
              <span className="profile-value">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="quick-action-card"
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h2>System Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-indicator success"></div>
              <div className="status-content">
                <span className="status-label">System Status</span>
                <span className="status-value">Operational</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator success"></div>
              <div className="status-content">
                <span className="status-label">Database</span>
                <span className="status-value">Connected</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator success"></div>
              <div className="status-content">
                <span className="status-label">API</span>
                <span className="status-value">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
