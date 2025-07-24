
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'modern' | 'glass'
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, variant = 'modern', ...props }, ref) => {
    const [isValid, setIsValid] = React.useState<boolean | null>(null);

    // Email validation function
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Handle validation for email type
    const handleValidation = (value: string) => {
      if (type === 'email' && value.length > 0) {
        setIsValid(isValidEmail(value));
      } else if (type === 'email' && value.length === 0) {
        setIsValid(null);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleValidation(e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const variants = {
      default: "border-input bg-background",
      modern: cn(
        "bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-slate-300/80 dark:hover:border-slate-500/80",
        // Email validation styling
        type === 'email' && isValid === false && "border-red-500 focus-visible:ring-red-500/50",
        type === 'email' && isValid === true && "border-green-500 focus-visible:ring-green-500/50"
      ),
      glass: "border-border/30 bg-background/20 backdrop-blur-md focus:bg-background/40 focus:border-primary/60"
    }

    return (
      <div className="relative">
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
          onChange={handleChange}
          {...props}
        />
        {/* Email validation indicator */}
        {type === 'email' && isValid !== null && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
        )}
      </div>
    )
  }
)
ModernInput.displayName = "ModernInput"

export { ModernInput }
