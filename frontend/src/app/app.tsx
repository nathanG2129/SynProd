// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import NxWelcome from './nx-welcome';

import { Route, Routes, Link } from 'react-router-dom';
import { Login } from '../app/auth/login';
import { Register } from '../app/auth/register';
import { ForgotPassword } from '../app/auth/forgot-password';
import './auth/auth.css';

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/"
          element={
            <div className="auth-container">
              <div className="auth-card">
                <div className="auth-header">
                  <h1>Welcome to SynProd</h1>
                  <p>Choose an option to get started</p>
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
