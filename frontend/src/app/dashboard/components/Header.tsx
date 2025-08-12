import React, { useState } from 'react';
import { User } from '../../../types/auth';

interface HeaderProps {
  user: User;
  onToggleSidebar: () => void;
  onLogout: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ user, onToggleSidebar, onLogout, sidebarCollapsed }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

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
          <span className="brand-subtitle">Production Management</span>
        </div>
      </div>

      <div className="header-right">
        <div className="user-menu-container">
          <button 
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className="user-info">
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <div className={getRoleBadgeClass(user.role)}>
                {getRoleDisplayName(user.role)}
              </div>
            </div>
            <svg 
              className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-menu-header">
                <div className="user-details">
                  <div className="user-full-name">{user.firstName} {user.lastName}</div>
                  <div className="user-email">{user.email}</div>
                  <div className={getRoleBadgeClass(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </div>
                </div>
              </div>
              
              <div className="user-menu-divider"></div>
              
              <div className="user-menu-actions">
                <button className="user-menu-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Profile Settings
                </button>
                
                <button className="user-menu-item logout" onClick={onLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close user menu when clicking outside */}
      {showUserMenu && (
        <div 
          className="menu-overlay"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
