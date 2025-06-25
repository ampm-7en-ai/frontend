
import React, { createContext, useContext, useState, ReactNode } from 'react';
import NotificationToast, { NotificationToastProps } from '@/components/ui/notification-toast';

interface NotificationToast extends Omit<NotificationToastProps, 'onClose'> {
  id: string;
  duration?: number;
}

interface NotificationToastContextType {
  showToast: (toast: Omit<NotificationToast, 'id'>) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const NotificationToastContext = createContext<NotificationToastContextType | undefined>(undefined);

export const NotificationToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const showToast = (toast: Omit<NotificationToast, 'id'>): string => {
    const id = Date.now().toString();
    const newToast: NotificationToast = {
      ...toast,
      id,
      duration: toast.duration || (toast.variant === 'loading' ? 0 : 5000)
    };

    setToasts(current => [...current, newToast]);

    // Auto-hide toast after duration (unless it's loading variant)
    if (newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const hideToast = (id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  };

  const hideAllToasts = () => {
    setToasts([]);
  };

  return (
    <NotificationToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
      {children}
      {toasts.map((toast, index) => (
        <NotificationToast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          onClose={() => hideToast(toast.id)}
          className={`${index > 0 ? `bottom-${4 + (index * 16)}` : ''}`}
        />
      ))}
    </NotificationToastContext.Provider>
  );
};

export const useNotificationToast = () => {
  const context = useContext(NotificationToastContext);
  if (context === undefined) {
    throw new Error('useNotificationToast must be used within a NotificationToastProvider');
  }
  return context;
};
