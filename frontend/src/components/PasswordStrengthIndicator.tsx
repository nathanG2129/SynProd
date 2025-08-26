import React from 'react';
import { FormValidator } from '../utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showText?: boolean;
  showDetailedScore?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  showText = true,
  showDetailedScore = false
}) => {
  const strength = FormValidator.getPasswordStrength(password);

  if (!password) {
    return null;
  }

  const getStrengthWidth = () => {
    // Use the actual score percentage instead of fixed widths
    return `${strength.score}%`;
  };

  const getStrengthColor = () => {
    switch (strength.strength) {
      case 'weak': return '#f56565';
      case 'medium': return '#ed8936';
      case 'strong': return '#48bb78';
      default: return '#e2e8f0';
    }
  };

  const getStrengthDescription = () => {
    switch (strength.strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return 'Weak';
    }
  };

  return (
    <div className="password-strength">
      <div className="password-strength-bar">
        <div 
          className={`password-strength-fill ${strength.strength}`}
          style={{ 
            width: getStrengthWidth(),
            background: getStrengthColor(),
            transition: 'all 0.4s ease'
          }}
        />
      </div>
      {showText && (
        <div className={`password-strength-text ${strength.strength}`}>
          <span style={{ fontWeight: '600', color: getStrengthColor() }}>
            Password Strength: {getStrengthDescription()}
          </span>
        </div>
      )}
    </div>
  );
}; 