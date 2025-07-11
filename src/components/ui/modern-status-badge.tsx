
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, Clock, X } from "lucide-react"

const modernStatusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        connected: "bg-success/10 text-success-foreground border border-success/20",
        disconnected: "bg-muted/50 text-muted-foreground border border-border/50",
        error: "bg-destructive/10 text-destructive-foreground border border-destructive/20",
        loading: "bg-warning/10 text-warning-foreground border border-warning/20",
        default: "bg-primary/10 text-primary-foreground border border-primary/20"
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
