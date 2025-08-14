import { Route, Routes, Link, Navigate } from 'react-router-dom';
import { Login } from '../app/auth/login';
import { Register } from '../app/auth/register';
import { ForgotPassword } from '../app/auth/forgot-password';
import { VerifyEmail } from '../app/auth/verify-email';
import { DashboardLayout } from '../app/dashboard/layout';
import { DashboardHome } from '../app/dashboard/pages/DashboardHome';
import { RecipeList } from '../app/dashboard/pages/RecipeList';
import { ProductList } from '../app/dashboard/pages/ProductList';
import { ProductDetail } from '../app/dashboard/pages/ProductDetail';
import { ProductForm } from '../app/dashboard/pages/ProductForm';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import './auth/auth.css';
import './dashboard/dashboard.css';

export function App() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div>
      <Routes>
        {/* Auth Routes - Redirect to dashboard if already authenticated */}
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPassword />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/verify-email" 
          element={
            <ProtectedRoute requireAuth={false}>
              <VerifyEmail />
            </ProtectedRoute>
          } 
        />
        
        {/* Dashboard Routes - Require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireAuth={true}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="recipes" element={<RecipeList />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="users" element={<div>User Management - Coming Soon</div>} />
          <Route path="reports" element={<div>Reports - Coming Soon</div>} />
        </Route>
        
        {/* Home Route - Redirect based on auth status */}
        <Route
          path="/"
          element={
            isLoading ? (
              <ProtectedRoute requireAuth={false}>
                <div>Loading...</div>
              </ProtectedRoute>
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
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
            )
          }
        />

        {/* Catch all route - redirect to appropriate page */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
