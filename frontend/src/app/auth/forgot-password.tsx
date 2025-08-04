import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ErrorIcon } from '../../components/ValidationIcons';
import './auth.css';

export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validationRules = {
    email: { required: true }
  };

  const {
    formData,
    updateField,
    handleBlur,
    handleSubmit,
    getFieldError,
    getFieldValidationState
  } = useFormValidation(
    { email: '' },
    validationRules,
    { validateOnBlur: true, validateOnSubmit: true }
  );

  const onSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>We've sent a password reset link to {formData.email}</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/login" className="auth-button">
              BACK TO LOGIN
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
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link</p>
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

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'SEND RESET LINK'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 