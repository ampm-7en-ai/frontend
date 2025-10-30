
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'modern' | 'glass'
  showNumberControls?: boolean
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, variant = 'modern', showNumberControls, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    
    React.useImperativeHandle(ref, () => inputRef.current!)

    const variants = {
      default: "border-input bg-background",
      modern: "bg-white/80 dark:!text-gray-200 dark:!bg-neutral-800 dark:!border-gray-500/40 border-slate-200 rounded-xl focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-slate-300/80 dark:hover:border-slate-500/80",
      glass: "border-border/30 bg-background/20 backdrop-blur-md focus:bg-background/40 focus:border-primary/60"
    }

    const handleIncrement = () => {
      if (inputRef.current && type === 'number') {
        const step = Number(inputRef.current.step) || 1
        const currentValue = Number(inputRef.current.value) || 0
        const max = inputRef.current.max ? Number(inputRef.current.max) : Infinity
        const newValue = Math.min(currentValue + step, max)
        inputRef.current.value = String(newValue)
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }

    const handleDecrement = () => {
      if (inputRef.current && type === 'number') {
        const step = Number(inputRef.current.step) || 1
        const currentValue = Number(inputRef.current.value) || 0
        const min = inputRef.current.min ? Number(inputRef.current.min) : -Infinity
        const newValue = Math.max(currentValue - step, min)
        inputRef.current.value = String(newValue)
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }

    if (type === 'number' && showNumberControls) {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-11 w-full px-4 py-3 text-sm transition-all duration-200",
              "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              "pr-8",
              variants[variant],
              className
            )}
            ref={inputRef}
            {...props}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={handleIncrement}
              className="h-4 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors"
              tabIndex={-1}
            >
              <ChevronUp className="h-3 w-3 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="h-4 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors"
              tabIndex={-1}
            >
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full px-4 py-3 text-sm transition-all duration-200",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          variants[variant],
          className
        )}
        ref={inputRef}
        {...props}
      />
    )
  }
)
ModernInput.displayName = "ModernInput"

export { ModernInput }
