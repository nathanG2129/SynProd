import React, { useState } from 'react';
import { User } from '../../../types/auth';

interface HeaderProps {
  user: User;
  onToggleSidebar: () => void;
  onLogout: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ user, onToggleSidebar, onLogout, sidebarCollapsed }: HeaderProps) {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'PRODUCTION':
        return 'Production';
      case 'MANAGER':
        return 'Manager';
      case 'ADMIN':
        return 'Admin';
      default:
        return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'PRODUCTION':
        return 'role-badge production';
      case 'MANAGER':
        return 'role-badge manager';
      case 'ADMIN':
        return 'role-badge admin';
      default:
        return 'role-badge';
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        
        <div className="header-brand">
          <h1>SynProd</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="user-info-display">
          <div className="user-avatar">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div className="user-details">
            <div className="user-name">{user.firstName} {user.lastName}</div>
            <div className="user-name">
              {getRoleDisplayName(user.role)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
