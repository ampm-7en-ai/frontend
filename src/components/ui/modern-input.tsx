
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'modern' | 'glass'
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, variant = 'modern', ...props }, ref) => {
    const variants = {
      default: "border-input bg-background",
      modern: "border-border/50 bg-card/50 backdrop-blur-sm focus:bg-card focus:border-primary/50",
      glass: "border-border/30 bg-background/20 backdrop-blur-md focus:bg-background/40 focus:border-primary/60"
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
ModernInput.displayName = "ModernInput"

export { ModernInput }
