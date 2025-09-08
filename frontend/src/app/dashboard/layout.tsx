import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, Header } from './components';
import { SessionWarning } from '../../components/SessionWarning';
import './dashboard.css';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-open'}`}>
      <Header 
        user={user}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="dashboard-body">
        <Sidebar 
          user={user}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          onLogout={handleLogout}
        />
        {/* Mobile backdrop to close sidebar */}
        {!sidebarCollapsed && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarCollapsed(true)}
            aria-hidden="true"
          />
        )}
        
        <main className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
      
      <SessionWarning />
    </div>
  );
}
