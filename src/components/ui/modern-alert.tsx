
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modernAlertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background text-gray-500 dark:text-gray-200 border-border",
        success: "bg-success/10 text-gray-500 dark:text-gray-200 border-success/20",
        warning: "bg-warning/10 text-gray-500 dark:text-gray-200 border-warning/20", 
        destructive: "bg-destructive/10 text-gray-500 dark:text-gray-200 border-destructive/20",
        info: "bg-info/10 text-gray-500 dark:text-gray-200 border-info/20"
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
    className={"flex items-center gap-2 "+cn(modernAlertVariants({ variant }), className)}
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
