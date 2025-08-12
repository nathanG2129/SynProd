import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import './dashboard.css';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="dashboard-layout">
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
        />
        
        <main className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
