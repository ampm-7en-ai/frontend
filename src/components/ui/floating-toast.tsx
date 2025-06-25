
import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export interface FloatingToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "loading"
  duration?: number
  onClose?: () => void
}

const variantStyles = {
  default: "bg-slate-900 text-white border-slate-800",
  success: "bg-slate-900 text-white border-slate-800",
  error: "bg-slate-900 text-white border-slate-800", 
  loading: "bg-slate-900 text-white border-slate-800"
}

const variantIcons = {
  default: null,
  success: <CheckCircle className="h-4 w-4 text-green-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-400" />,
  loading: <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
}

export const FloatingToast: React.FC<FloatingToastProps> = ({
  id,
  title,
  description,
  variant = "default",
  onClose
}) => {
  const icon = variantIcons[variant]

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border p-3 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out animate-in slide-in-from-right-2",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-medium leading-tight mb-1">
              {title}
            </div>
          )}
          {description && (
            <div className="text-xs opacity-90 leading-relaxed">
              {description}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-md p-1 hover:bg-white/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
