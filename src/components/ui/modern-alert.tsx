
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modernAlertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success: "bg-success/10 text-success-foreground border-success/20",
        warning: "bg-warning/10 text-warning-foreground border-warning/20", 
        destructive: "bg-destructive/10 text-destructive-foreground border-destructive/20",
        info: "bg-info/10 text-info-foreground border-info/20"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const ModernAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof modernAlertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(modernAlertVariants({ variant }), className)}
    {...props}
  />
))
ModernAlert.displayName = "ModernAlert"

const ModernAlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
ModernAlertDescription.displayName = "ModernAlertDescription"

export { ModernAlert, ModernAlertDescription }
