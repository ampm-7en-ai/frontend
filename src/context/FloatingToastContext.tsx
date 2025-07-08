
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { FloatingToast, FloatingToastProps } from '@/components/ui/floating-toast'
import { setGlobalToast } from '@/hooks/use-toast'


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
    setToasts(prev => prev.map(toast => {
      if (toast.id === id) {
        const updatedToast = { ...toast, ...updates }
        
        // If variant changed from loading to something else, set auto-hide timer
        if (toast.variant === 'loading' && updates.variant && updates.variant !== 'loading') {
          const duration = updates.duration || 5000
          setTimeout(() => {
            hideToast(id)
          }, duration)
        }
        
        return updatedToast
      }
      return toast
    }))
  }, [hideToast])

  // Initialize global toast function
  useEffect(() => {
    const mapVariant = (variant?: "default" | "destructive" | "success" | "warning" | "loading") => {
      switch (variant) {
        case "destructive": return "error"
        case "success": return "success"
        case "loading": return "loading"
        case "warning":
        case "default":
        default:
          return "default"
      }
    }

    const globalToast = ({ title, description, variant, duration }: {
      title?: string
      description?: string
      variant?: "default" | "destructive" | "success" | "warning" | "loading"
      duration?: number
    }) => {
      const id = showToast({
        title,
        description,
        variant: mapVariant(variant),
        duration
      })

      return {
        id,
        dismiss: () => hideToast(id),
        update: (updates: {
          title?: string
          description?: string
          variant?: "default" | "destructive" | "success" | "warning" | "loading"
          duration?: number
        }) => updateToast(id, {
          ...updates,
          variant: mapVariant(updates.variant)
        })
      }
    }

    setGlobalToast(globalToast)
  }, [showToast, hideToast, updateToast])

  return (
    <FloatingToastContext.Provider value={{ showToast, hideToast, updateToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
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
