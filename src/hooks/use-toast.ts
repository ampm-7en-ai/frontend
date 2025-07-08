import { useFloatingToast } from '@/context/FloatingToastContext'

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

export const useToast = () => {
  const { showToast, hideToast, updateToast } = useFloatingToast()

  const toast = ({ title, description, variant, duration }: {
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

  return { toast, toasts: [] }
}

// Global toast instance - will be set by the provider
let globalToastFn: ReturnType<typeof useToast>['toast'] | null = null

export const setGlobalToast = (toastFn: ReturnType<typeof useToast>['toast']) => {
  globalToastFn = toastFn
}

export const toast = (params: {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "loading"
  duration?: number
}) => {
  if (!globalToastFn) {
    console.warn('Toast called before FloatingToastProvider initialization')
    return { id: '', dismiss: () => {}, update: () => {} }
  }
  return globalToastFn(params)
}