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
        title: 'Recipe Library',
        description: 'Browse and view production recipes',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            <path d="M8 7h8"/>
            <path d="M8 11h8"/>
            <path d="M8 15h6"/>
          </svg>
        ),
        path: '/dashboard/recipes',
        roles: ['PRODUCTION', 'MANAGER', 'ADMIN']
      },
      {
        title: 'Product Management',
        description: 'Create, edit, and manage product recipes',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            <path d="M8 12h8"/>
            <path d="M12 8v8"/>
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
    </div>
  );
}
