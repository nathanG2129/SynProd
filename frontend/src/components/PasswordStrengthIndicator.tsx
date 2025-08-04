import React from 'react';
import { FormValidator } from '../utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showText?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  showText = true 
}) => {
  const strength = FormValidator.getPasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className="password-strength">
      <div className="password-strength-bar">
        <div className={`password-strength-fill ${strength.strength}`} />
      </div>
      {showText && (
        <div className={`password-strength-text ${strength.strength}`}>
          Password strength: {strength.strength.charAt(0).toUpperCase() + strength.strength.slice(1)}
          {' '}
          ({strength.passedRules}/{strength.totalRules} requirements met)
        </div>
      )}
    </div>
  );
}; 