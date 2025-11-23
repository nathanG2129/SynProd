import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ErrorIcon } from '../../../components/ValidationIcons';

export function InviteUser() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const navigate = useNavigate();

  const canInvite = user?.role === 'ADMIN';

  const validationRules = {
    email: { required: true },
    role: { required: true }
  };

  const {
    formData,
    updateField,
    handleBlur,
    handleSubmit,
    getFieldError,
    getFieldValidationState,
    resetForm
  } = useFormValidation(
    { email: '', role: 'PRODUCTION' },
    validationRules,
    { validateOnBlur: true, validateOnSubmit: true }
  );

  const onSubmit = async (data: Record<string, string>) => {
    setError('');
    setIsSuccess(false);

    try {
      setIsSubmitting(true);
      await adminAPI.inviteUser({
        email: data.email,
        role: data.role
      });
      
      setInvitedEmail(data.email);
      setIsSuccess(true);
      resetForm();
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setInvitedEmail('');
      }, 5000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canInvite) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Access Denied</h1>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Admins only</h3>
          <p style={{ color: '#64748b' }}>You need Admin privileges to invite users.</p>
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
          <h1 className="page-title">Invite User</h1>
          <p className="page-subtitle">Send an invitation to join SynProd</p>
        </div>
      </div>

      {isSuccess && (
        <div className="content-card" style={{ 
          backgroundColor: '#d1fae5', 
          border: '2px solid #10b981',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <div>
              <h3 style={{ margin: 0, color: '#065f46', fontSize: '1rem' }}>Invitation Sent!</h3>
              <p style={{ margin: '4px 0 0 0', color: '#065f46', fontSize: '0.875rem' }}>
                An invitation email has been sent to <strong>{invitedEmail}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="content-card">
          <h2 style={{ marginBottom: '24px' }}>User Details</h2>

          {error && (
            <div className="error-message" style={{ marginBottom: '24px' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={getFieldValidationState('email')}
              placeholder="user@company.com"
              disabled={isSubmitting}
              required
            />
            {getFieldError('email') && (
              <div className="validation-message error">
                <ErrorIcon />
                {getFieldError('email')}
              </div>
            )}
            <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              The user will receive an invitation link at this email address
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="role">
              Role <span className="required">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => updateField('role', e.target.value)}
              onBlur={() => handleBlur('role')}
              className={getFieldValidationState('role')}
              disabled={isSubmitting}
              required
              style={{
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                width: '100%',
                backgroundColor: '#fff'
              }}
            >
              <option value="PRODUCTION">Production User</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Administrator</option>
            </select>
            {getFieldError('role') && (
              <div className="validation-message error">
                <ErrorIcon />
                {getFieldError('role')}
              </div>
            )}
            <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              Choose the appropriate role based on user responsibilities
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#f1f6e8', 
            border: '2px solid #91b029',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '24px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#445c3c', fontSize: '0.875rem', fontWeight: '600' }}>
              What happens next?
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: '#445c3c' }}>
              <li>User receives an invitation email</li>
              <li>Link expires in 7 days</li>
              <li>User sets their name and password</li>
              <li>Account becomes active immediately</li>
            </ul>
          </div>
        </div>

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
              {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

