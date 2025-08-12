import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SessionWarningProps {
  warningTime?: number; // Time in minutes before session expires to show warning
}

export function SessionWarning({ warningTime = 15 }: SessionWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    // Check session status every minute
    const interval = setInterval(() => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours
        const warningThreshold = warningTime * 60 * 1000; // Convert to milliseconds
        const remainingTime = sessionDuration - timeSinceActivity;

        if (remainingTime <= warningThreshold && remainingTime > 0) {
          setShowWarning(true);
          setTimeLeft(Math.ceil(remainingTime / (60 * 1000))); // Convert to minutes
        } else {
          setShowWarning(false);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, warningTime]);

  const extendSession = () => {
    // Update last activity
    localStorage.setItem('lastActivity', Date.now().toString());
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 9999,
      maxWidth: '350px',
      animation: 'slideInFromRight 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '20px',
          height: '20px',
          background: '#f59e0b',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px'
        }}>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>!</span>
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '14px', fontWeight: '600' }}>
            Session Expiring Soon
          </h4>
          <p style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: '13px', lineHeight: '1.4' }}>
            Your session will expire in {timeLeft} minute{timeLeft !== 1 ? 's' : ''}. 
            Would you like to extend it?
          </p>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={extendSession}
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#d97706'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f59e0b'}
            >
              Extend Session
            </button>
            
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                color: '#92400e',
                border: '1px solid #92400e',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#92400e';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#92400e';
              }}
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
