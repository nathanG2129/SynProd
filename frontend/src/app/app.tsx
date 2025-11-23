import { Route, Routes, Link, Navigate } from 'react-router-dom';
import { Login } from '../app/auth/login';
import { AcceptInvite } from '../app/auth/accept-invite';
import { ForgotPassword } from '../app/auth/forgot-password';
import { ResetPassword } from '../app/auth/reset-password';
import { DashboardLayout } from '../app/dashboard/layout';
import { DashboardHome } from '../app/dashboard/pages/DashboardHome';
import { RecipeList } from '../app/dashboard/pages/RecipeList';
import { ProductList } from '../app/dashboard/pages/ProductList';
import { ProductDetail } from '../app/dashboard/pages/ProductDetail';
import { ProductForm } from '../app/dashboard/pages/ProductForm';
import { RecipeDetail } from '../app/dashboard/pages/RecipeDetail';
import { UserList } from '../app/dashboard/pages/UserList';
import { UserForm } from '../app/dashboard/pages/UserForm';
import { InviteUser } from '../app/dashboard/pages/InviteUser';
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
          path="/accept-invite" 
          element={
            <ProtectedRoute requireAuth={false}>
              <AcceptInvite />
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
          path="/reset-password" 
          element={
            <ProtectedRoute requireAuth={false}>
              <ResetPassword />
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
          <Route path="recipes/:id" element={<RecipeDetail />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/invite" element={<InviteUser />} />
          <Route path="users/:id/edit" element={<UserForm />} />
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
