
import * as React from "react"
import { useFloatingToast } from "@/context/FloatingToastContext"

// Legacy compatibility interface
interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning"
  duration?: number
}

// Map legacy variants to floating toast variants
const mapVariant = (variant?: string) => {
  switch (variant) {
    case "destructive":
      return "error"
    case "success":
      return "success"
    case "warning":
      return "default"
    default:
      return "default"
  }
}

// Create a context for the toast function to access hooks
let toastContext: any = null

// Initialize the context
export const initToastContext = (context: any) => {
  toastContext = context
}

// Legacy toast function for backward compatibility
function toast(props: ToastProps) {
  if (!toastContext) {
    console.warn('Toast context not initialized. Using fallback.')
    return {
      id: Date.now().toString(),
      dismiss: () => {},
      update: () => {},
    }
  }
  
  const id = toastContext.showToast({
    title: props.title,
    description: props.description,
    variant: mapVariant(props.variant) as any,
    duration: props.duration,
  })

  return {
    id,
    dismiss: () => toastContext.hideToast(id),
    update: () => {},
  }
}

// Legacy useToast hook for backward compatibility
function useToast() {
  const { showToast, hideToast } = useFloatingToast()

  const toastFn = React.useCallback((props: ToastProps) => {
    const id = showToast({
      title: props.title,
      description: props.description,
      variant: mapVariant(props.variant) as any,
      duration: props.duration,
    })

    return {
      id,
      dismiss: () => hideToast(id),
      update: () => {},
    }
  }, [showToast, hideToast])

  return {
    toasts: [],
    toast: toastFn,
    dismiss: hideToast,
  }
}

export { useToast, toast }
