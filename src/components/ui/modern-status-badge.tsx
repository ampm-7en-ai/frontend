
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, Clock, X } from "lucide-react"

const modernStatusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        connected: "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
        disconnected: "text-gray-600 border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400",
        error: "text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
        loading: "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400",
        default: "text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ModernStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernStatusBadgeVariants> {
  status: 'connected' | 'disconnected' | 'error' | 'loading' | 'default'
  showIcon?: boolean
}

const statusIcons = {
  connected: CheckCircle,
  disconnected: AlertCircle,
  error: X,
  loading: Clock,
  default: AlertCircle
}

const ModernStatusBadge = React.forwardRef<HTMLDivElement, ModernStatusBadgeProps>(
  ({ className, variant, status, showIcon = true, children, ...props }, ref) => {
    const Icon = statusIcons[status]
    
    return (
      <div
        ref={ref}
        className={cn(modernStatusBadgeVariants({ variant: variant || status }), className)}
        {...props}
      >
        {showIcon && <Icon className="h-3 w-3" />}
        {children}
      </div>
    )
  }
)
ModernStatusBadge.displayName = "ModernStatusBadge"

export { ModernStatusBadge }
