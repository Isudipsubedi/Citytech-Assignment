import React, { useEffect } from 'react';
import './Notification.css';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose: () => void;
}

/**
 * Simple notification component for success/error messages
 */
export const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`notification notification-${type}`} onClick={onClose}>
      <span className="notification-message">{message}</span>
      <button className="notification-close" aria-label="Close">×</button>
    </div>
  );
};

