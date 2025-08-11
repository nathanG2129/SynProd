import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './auth.css';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('No verification token provided');
      setIsLoading(false);
      return;
    }

    const handleVerification = async () => {
      try {
        await verifyEmail(token);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Verification failed');
      } finally {
        setIsLoading(false);
      }
    };

    handleVerification();
  }, [searchParams, verifyEmail]);

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Verifying Email</h1>
            <p>Please wait while we verify your email address...</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #91b029',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Email Verified!</h1>
            <p>Your email has been successfully verified. You can now log in to your account.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            <Link to="/login" className="auth-button">
              GO TO LOGIN
            </Link>
            <Link to="/" className="auth-button" style={{ background: '#718096' }}>
              BACK TO HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verification Failed</h1>
          <p>We couldn't verify your email address.</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          <Link to="/register" className="auth-button">
            CREATE NEW ACCOUNT
          </Link>
          <Link to="/" className="auth-button" style={{ background: '#718096' }}>
            BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}