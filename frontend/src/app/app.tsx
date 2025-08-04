// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import NxWelcome from './nx-welcome';

import { Route, Routes, Link } from 'react-router-dom';
import { Login } from '../app/auth/login';
import { Register } from '../app/auth/register';

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <div>
              <NxWelcome title="frontend" />
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/login" style={{ marginRight: '1rem' }}>
                  Login
                </Link>
                <Link to="/register">Register</Link>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
