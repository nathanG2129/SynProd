import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ErrorIcon, EyeIcon, EyeSlashIcon } from '../../components/ValidationIcons';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';
import { PasswordRequirements } from '../../components/PasswordRequirements';
import { useAuth } from '../../contexts/AuthContext';

export function AcceptInvite() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { acceptInvite } = useAuth();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. Please check your email for the correct link.');
    }
  }, [token]);

  const validationRules = {
    firstName: { required: true },
    lastName: { required: true },
    password: { required: true },
    confirmPassword: { required: true }
  };

  const {
    formData,
    updateField,
    handleBlur,
    handleSubmit,
    getFieldError,
    getFieldValidationState
  } = useFormValidation(
    { firstName: '', lastName: '', password: '', confirmPassword: '' },
    validationRules,
    { validateOnBlur: true, validateOnSubmit: true }
  );

  const onSubmit = async (data: Record<string, string>) => {
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    setIsLoading(true);
    setError('');

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await acceptInvite(token, data.firstName, data.lastName, data.password);
      navigate('/login', { 
        state: { 
          message: 'Account activated successfully! You can now log in with your credentials.' 
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Accept Invitation</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px' }}>
            Complete your account setup
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={getFieldValidationState('firstName')}
                placeholder="Enter your first name"
                disabled={isLoading || !token}
                required
              />
              {getFieldError('firstName') && (
                <div className="validation-message error">
                  <ErrorIcon />
                  {getFieldError('firstName')}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={getFieldValidationState('lastName')}
                placeholder="Enter your last name"
                disabled={isLoading || !token}
                required
              />
              {getFieldError('lastName') && (
                <div className="validation-message error">
                  <ErrorIcon />
                  {getFieldError('lastName')}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                onFocus={() => setShowPasswordRequirements(true)}
                className={getFieldValidationState('password')}
                placeholder="Create a strong password"
                disabled={isLoading || !token}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || !token}
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
            
            {showPasswordRequirements && formData.password && (
              <>
                <PasswordStrengthIndicator password={formData.password} />
                <PasswordRequirements password={formData.password} />
              </>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={getFieldValidationState('confirmPassword')}
                placeholder="Re-enter your password"
                disabled={isLoading || !token}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || !token}
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {getFieldError('confirmPassword') && (
              <div className="validation-message error">
                <ErrorIcon />
                {getFieldError('confirmPassword')}
              </div>
            )}
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="validation-message error">
                <ErrorIcon />
                Passwords do not match
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading || !token}
          >
            {isLoading ? 'Activating Account...' : 'Activate Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#91b029', textDecoration: 'none', fontWeight: '500' }}>
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

