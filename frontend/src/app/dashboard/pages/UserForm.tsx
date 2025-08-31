import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../../../services/api';
import { User } from '../../../types/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useFormValidation } from '../../../hooks/useFormValidation';

export function UserForm() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const isEditing = !!id && id !== 'new';
  const canManageUsers = currentUser?.role === 'ADMIN';

  // Form validation
  const validationRules = {
    firstName: { required: true },
    lastName: { required: true },
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
    { 
      firstName: '', 
      lastName: '', 
      email: '', 
      role: 'PRODUCTION',
      enabled: 'true'
    },
    validationRules,
    { validateOnBlur: true, validateOnSubmit: true }
  );

  useEffect(() => {
    if (!canManageUsers) {
      navigate('/dashboard/users');
      return;
    }

    if (isEditing) {
      loadUser();
    }
  }, [id, canManageUsers]);

  const loadUser = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError('');
      const response = await userAPI.getUserById(parseInt(id));
      const userData = response.data;
      
      setUser(userData);
      
      // Update form with user data
      updateField('firstName', userData.firstName);
      updateField('lastName', userData.lastName);
      updateField('email', userData.email);
      updateField('role', userData.role);
      updateField('enabled', userData.enabled ? 'true' : 'false');
      
    } catch (err: any) {
      setError('Failed to load user details');
      console.error('Error loading user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: Record<string, string>) => {
    setError('');
    setIsSuccess(false);

    const requestData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role as 'PRODUCTION' | 'MANAGER' | 'ADMIN',
      enabled: data.enabled === 'true'
    };

    try {
      setIsSubmitting(true);
      
      if (isEditing && user) {
        await userAPI.updateUser(user.id, requestData);
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/users');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManageUsers) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Loading...</h1>
        </div>
        
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #91b029',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link 
              to="/dashboard/users" 
              style={{ 
                color: '#91b029', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back to Users
            </Link>
          </div>
          <h1 className="page-title">
            {isEditing ? `Edit ${user?.firstName} ${user?.lastName}` : 'Create New User'}
          </h1>
          <p className="page-subtitle">
            {isEditing ? 'Update user information and permissions' : 'Add a new user to the system'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="user-form" noValidate>
        {error && (
          <div className="error-message" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Basic User Information */}
        <div className="content-card">
          <h2>User Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={getFieldValidationState('firstName')}
                placeholder="Enter first name"
                required
              />
              {getFieldError('firstName') && (
                <div className="validation-message error">
                  {getFieldError('firstName')}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={getFieldValidationState('lastName')}
                placeholder="Enter last name"
                required
              />
              {getFieldError('lastName') && (
                <div className="validation-message error">
                  {getFieldError('lastName')}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={getFieldValidationState('email')}
              placeholder="Enter email address"
              required
            />
            {getFieldError('email') && (
              <div className="validation-message error">
                {getFieldError('email')}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value)}
                onBlur={() => handleBlur('role')}
                className={getFieldValidationState('role')}
                required
                style={{
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  width: '100%'
                }}
              >
                <option value="PRODUCTION">Production User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="enabled">Account Status *</label>
              <select
                id="enabled"
                name="enabled"
                value={formData.enabled}
                onChange={(e) => updateField('enabled', e.target.value)}
                onBlur={() => handleBlur('enabled')}
                className={getFieldValidationState('enabled')}
                required
                style={{
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  width: '100%'
                }}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          {/* Read-only Email Verification Status */}
          {user && (
            <div className="form-group">
              <label>Email Verification Status</label>
              <div style={{
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                backgroundColor: '#f8f9fa',
                color: '#6c757d'
              }}>
                <span className={`verification-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </span>
                <span style={{ marginLeft: '8px', fontSize: '0.875rem' }}>
                  (This status cannot be modified)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="content-card">
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Link to="/dashboard/users" className="btn btn-secondary">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : isSuccess ? 'Updated!' : 'Update User'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
