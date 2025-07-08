import { useFloatingToast } from '@/context/FloatingToastContext'

// Simple hook that matches the old useToast interface but uses floating toast
export const useToast = () => {
  const { showToast, hideToast, updateToast } = useFloatingToast()

  const toast = ({ title, description, variant, duration }: {
    title?: string
    description?: string
    variant?: "default" | "destructive" | "success" | "warning"
    duration?: number
  }) => {
    const mappedVariant = variant === "destructive" ? "error" : 
                         variant === "warning" ? "default" :
                         variant === "success" ? "success" : "default"
    
    const id = showToast({
      title,
      description,
      variant: mappedVariant as any,
      duration
    })

    return {
      id,
      dismiss: () => hideToast(id),
      update: (updates: any) => updateToast(id, {
        ...updates,
        variant: updates.variant === "destructive" ? "error" : 
                updates.variant === "success" ? "success" : "default"
      })
    }
  }

  return { toast, showToast, updateToast, hideToast, toasts: [] }
}

export const toast = ({ title, description, variant, duration }: {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning"
  duration?: number
}) => {
  // This will be initialized by the context
  console.warn('Direct toast calls require context initialization')
}