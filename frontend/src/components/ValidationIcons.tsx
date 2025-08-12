import React from 'react';

interface IconProps {
  className?: string;
}

export const ErrorIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    className={`validation-icon error ${className}`} 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path 
      fillRule="evenodd" 
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
      clipRule="evenodd" 
    />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    className={className} 
    viewBox="0 0 20 20" 
    fill="currentColor"
    width="16"
    height="16"
  >
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path 
      fillRule="evenodd" 
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" 
      clipRule="evenodd" 
    />
  </svg>
);

export const EyeSlashIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    className={className} 
    viewBox="0 0 20 20" 
    fill="currentColor"
    width="16"
    height="16"
  >
    <path 
      fillRule="evenodd" 
      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" 
      clipRule="evenodd" 
    />
    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    className={`success-message-icon ${className}`}
    viewBox="0 0 20 20" 
    fill="currentColor"
    width="16"
    height="16"
  >
    <path 
      fillRule="evenodd" 
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
      clipRule="evenodd" 
    />
  </svg>
); 