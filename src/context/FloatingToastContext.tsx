
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { FloatingToast, FloatingToastProps } from '@/components/ui/floating-toast'
import { initToastContext } from '@/hooks/use-toast'

interface FloatingToastContextType {
  showToast: (toast: Omit<FloatingToastProps, 'id' | 'onClose'>) => string
  hideToast: (id: string) => void
  updateToast: (id: string, updates: Partial<FloatingToastProps>) => void
}

const FloatingToastContext = createContext<FloatingToastContextType | undefined>(undefined)

interface ActiveToast extends FloatingToastProps {
  id: string
}

export const FloatingToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ActiveToast[]>([])

  const showToast = useCallback((toast: Omit<FloatingToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString()
    const newToast: ActiveToast = {
      ...toast,
      id,
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-hide after duration (default 5 seconds, but not for loading toasts)
    if (toast.variant !== 'loading') {
      const duration = toast.duration || 5000
      setTimeout(() => {
        hideToast(id)
      }, duration)
    }
    
    return id
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<FloatingToastProps>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ))
  }, [])

  // Listen for global toast events (e.g., from token expiration)
  useEffect(() => {
    const handleGlobalToast = (event: CustomEvent) => {
      const { title, description, variant, duration } = event.detail;
      showToast({ title, description, variant, duration });
    };

    window.addEventListener('show-toast', handleGlobalToast as EventListener);
    
    return () => {
      window.removeEventListener('show-toast', handleGlobalToast as EventListener);
    };
  }, [showToast]);

  // Initialize the toast context for legacy compatibility
  useEffect(() => {
    initToastContext({ showToast, hideToast, updateToast })
  }, [showToast, hideToast, updateToast])

  return (
    <FloatingToastContext.Provider value={{ showToast, hideToast, updateToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <FloatingToast
            key={toast.id}
            {...toast}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </FloatingToastContext.Provider>
  )
}

export const useFloatingToast = () => {
  const context = useContext(FloatingToastContext)
  if (context === undefined) {
    throw new Error('useFloatingToast must be used within a FloatingToastProvider')
  }
  return context
}
