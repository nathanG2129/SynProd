import React, { useState, useEffect } from 'react';
import { FormValidator } from '../utils/validation';
import { ErrorIcon, CheckCircleIcon } from './ValidationIcons';

interface PasswordRequirementsProps {
  password: string;
  showRequirements?: boolean;
  onToggleRequirements?: (show: boolean) => void;
}

interface RequirementItem {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  showRequirements = false,
  onToggleRequirements
}) => {
  const [isVisible, setIsVisible] = useState(showRequirements);

  // Update visibility when prop changes
  useEffect(() => {
    setIsVisible(showRequirements);
  }, [showRequirements]);

  // Define password requirements
  const requirements: RequirementItem[] = [
    {
      id: 'length',
      label: 'At least 8 characters long',
      test: (pwd: string) => pwd.length >= 8,
      met: false
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd),
      met: false
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd),
      met: false
    },
    {
      id: 'number',
      label: 'Contains number',
      test: (pwd: string) => /\d/.test(pwd),
      met: false
    },
    {
      id: 'symbol',
      label: 'Contains special character',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      met: false
    }
  ];

  // Update requirement status based on current password
  const updatedRequirements = requirements.map(req => ({
    ...req,
    met: req.test(password)
  }));

  const metCount = updatedRequirements.filter(req => req.met).length;
  const totalCount = requirements.length;

  // Auto-show requirements when password has content
  useEffect(() => {
    if (password.length > 0 && !isVisible) {
      setIsVisible(true);
      onToggleRequirements?.(true);
    }
  }, [password, isVisible, onToggleRequirements]);

  // Hide requirements when password is empty
  useEffect(() => {
    if (password.length === 0 && isVisible) {
      setIsVisible(false);
      onToggleRequirements?.(false);
    }
  }, [password, isVisible, onToggleRequirements]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="password-requirements" style={{
      maxHeight: isVisible ? '200px' : '0',
      padding: isVisible ? '12px 16px' : '0',
      marginTop: isVisible ? '8px' : '0',
      opacity: isVisible ? '1' : '0',
      visibility: isVisible ? 'visible' : 'hidden',
      background: 'linear-gradient(135deg, #f9fcf4, #f1f6e8)',
      border: '1px solid rgba(145, 176, 41, 0.2)',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h4 style={{
          margin: '0',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#445c3c'
        }}>
          Password Requirements
        </h4>
        <span style={{
          fontSize: '0.75rem',
          color: '#6b7a42',
          fontWeight: '500'
        }}>
          {metCount}/{totalCount} met
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {updatedRequirements.map((requirement) => (
          <div
            key={requirement.id}
            className={`requirement-item ${requirement.met ? 'met' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 0',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {requirement.met ? (
                <CheckCircleIcon className="validation-icon" />
              ) : (
                <ErrorIcon className="validation-icon error" />
              )}
            </div>
            <span style={{
              fontSize: '0.8rem',
              color: requirement.met ? '#445c3c' : '#64748b',
              fontWeight: requirement.met ? '500' : '400',
              textDecoration: requirement.met ? 'none' : 'none'
            }}>
              {requirement.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div style={{
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(145, 176, 41, 0.1)'
      }}>
        <div style={{
          width: '100%',
          height: '4px',
          background: '#e2e8f0',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(metCount / totalCount) * 100}%`,
            height: '100%',
            background: metCount === totalCount 
              ? 'linear-gradient(135deg, #91b029, #7a9a1f)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    </div>
  );
};
