
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
      modern: "bg-white/80 dark:!text-gray-200 dark:!bg-neutral-800 dark:!border-gray-500/40 border-slate-200 rounded-xl focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-slate-300/80 dark:hover:border-slate-500/80",
      glass: "border-border/30 bg-background/20 backdrop-blur-md focus:bg-background/40 focus:border-primary/60"
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full px-4 py-3 text-sm transition-all duration-200",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "border",
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
