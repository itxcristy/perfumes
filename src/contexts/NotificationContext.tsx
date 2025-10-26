import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

// Notification types
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }, [removeNotification]);

  const showSuccess = useCallback((title: string, message: string) => {
    showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string) => {
    showNotification({ type: 'error', title, message });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string) => {
    showNotification({ type: 'warning', title, message });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    showNotification({ type: 'info', title, message });
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {createPortal(
        <NotificationContainer notifications={notifications} onRemove={removeNotification} />,
        document.body
      )}
    </NotificationContext.Provider>
  );
};

// Notification Container Component
interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <>
      {/* Desktop: Bottom-right */}
      <div
        className="hidden md:block"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '400px',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {notifications.map((notification) => (
          <Toast key={notification.id} notification={notification} onRemove={onRemove} />
        ))}
      </div>

      {/* Mobile: Bottom-center */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: 'calc(100vw - 2rem)',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {notifications.map((notification) => (
          <Toast key={notification.id} notification={notification} onRemove={onRemove} isMobile />
        ))}
      </div>
    </>
  );
};

// Individual Toast Component
interface ToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
  isMobile?: boolean;
}

const Toast: React.FC<ToastProps> = ({ notification, onRemove, isMobile = false }) => {
  const { id, type, title, message } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#f0fdf4',
          border: '#86efac',
          text: '#166534',
        };
      case 'error':
        return {
          bg: '#fef2f2',
          border: '#fca5a5',
          text: '#991b1b',
        };
      case 'warning':
        return {
          bg: '#fffbeb',
          border: '#fcd34d',
          text: '#92400e',
        };
      case 'info':
        return {
          bg: '#eff6ff',
          border: '#93c5fd',
          text: '#1e40af',
        };
      default:
        return {
          bg: '#f3f4f6',
          border: '#d1d5db',
          text: '#374151',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      style={{
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: isMobile ? '0.5rem' : '0.75rem',
        padding: isMobile ? '0.875rem' : '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        pointerEvents: 'auto',
        animation: isMobile ? 'slideUp 0.3s ease-out' : 'slideIn 0.3s ease-out',
        width: '100%',
        minHeight: isMobile ? '60px' : 'auto',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>{getIcon()}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: styles.text,
            marginBottom: '0.25rem',
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: '0.875rem',
            color: styles.text,
            opacity: 0.8,
          }}
        >
          {message}
        </p>
      </div>
      <button
        onClick={() => onRemove(id)}
        style={{
          flexShrink: 0,
          padding: isMobile ? '0.5rem' : '0.25rem',
          borderRadius: '0.375rem',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s',
          minWidth: isMobile ? '44px' : 'auto',
          minHeight: isMobile ? '44px' : 'auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Close notification"
      >
        <X className={isMobile ? "h-5 w-5" : "h-4 w-4"} style={{ color: styles.text, opacity: 0.6 }} />
      </button>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

