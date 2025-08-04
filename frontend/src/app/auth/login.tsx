import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ErrorIcon, EyeIcon, EyeSlashIcon } from '../../components/ValidationIcons';
import './auth.css';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validationRules = {
    email: { required: true },
    password: { required: true, strict: false }
  };

  const {
    formData,
    updateField,
    handleBlur,
    handleSubmit,
    getFieldError,
    getFieldValidationState
  } = useFormValidation(
    { email: '', password: '' },
    validationRules,
    { validateOnBlur: true, validateOnSubmit: true }
  );

  const onSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        localStorage.setItem('token', responseData.token);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Login</h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={getFieldValidationState('email')}
              required
            />
            {getFieldError('email') && (
              <div className="validation-message error">
                <ErrorIcon />
                {getFieldError('email')}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={getFieldValidationState('password')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: '0'
                }}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {getFieldError('password') && (
              <div className="validation-message error">
                <ErrorIcon />
                {getFieldError('password')}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.875rem' }}>
              Forgot your password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'SIGN IN'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/register" className="auth-link">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
