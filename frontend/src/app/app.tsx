import { Route, Routes, Link } from 'react-router-dom';
import { Login } from '../app/auth/login';
import { Register } from '../app/auth/register';
import { ForgotPassword } from '../app/auth/forgot-password';
import { VerifyEmail } from '../app/auth/verify-email';
import { DashboardLayout } from '../app/dashboard/layout';
import { DashboardHome } from '../app/dashboard/pages/DashboardHome';
import './auth/auth.css';
import './dashboard/dashboard.css';

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="recipes" element={<div>Recipes Page - Coming Soon</div>} />
          <Route path="products" element={<div>Product Management - Coming Soon</div>} />
          <Route path="users" element={<div>User Management - Coming Soon</div>} />
          <Route path="reports" element={<div>Reports - Coming Soon</div>} />
        </Route>
        
        <Route
          path="/"
          element={
            <div className="auth-container">
              <div className="auth-card">
                <div className="auth-header">
                  <h1>Welcome to SynProd</h1>
                  <p>Production Management System</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                  <Link to="/login" className="auth-button">
                    LOGIN
                  </Link>
                  <Link to="/register" className="auth-button">
                    REGISTER
                  </Link>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
