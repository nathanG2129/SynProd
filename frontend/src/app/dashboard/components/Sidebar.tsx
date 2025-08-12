import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../../../types/auth';

interface SidebarProps {
  user: User;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

export function Sidebar({ user, collapsed, onCollapse }: SidebarProps) {
  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      roles: ['PRODUCTION', 'MANAGER', 'ADMIN']
    },
    {
      path: '/dashboard/recipes',
      label: 'Recipes',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          <path d="M12 11h4"/>
          <path d="M12 16h4"/>
          <path d="M8 11h.01"/>
          <path d="M8 16h.01"/>
        </svg>
      ),
      roles: ['PRODUCTION', 'MANAGER', 'ADMIN']
    },
    {
      path: '/dashboard/products',
      label: 'Product Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      roles: ['MANAGER', 'ADMIN']
    },
    {
      path: '/dashboard/users',
      label: 'User Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      roles: ['ADMIN']
    },
    {
      path: '/dashboard/reports',
      label: 'Reports',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M7 12l4-4 4 4 4-4"/>
        </svg>
      ),
      roles: ['MANAGER', 'ADMIN']
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredNavItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                end={item.path === '/dashboard'}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="user-role-info">
              <span className="role-label">Role:</span>
              <span className={`role-value ${user.role.toLowerCase()}`}>
                {user.role === 'PRODUCTION' ? 'Production' : 
                 user.role === 'MANAGER' ? 'Manager' : 'Admin'}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
