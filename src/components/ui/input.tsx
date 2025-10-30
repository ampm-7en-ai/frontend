
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 dark:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  {
    variants: {
      variant: {
        default: "border-input px-3 py-2 bg-white/80 dark:text-gray-200 dark:bg-neutral-800 dark:!border-neutral-500/40",
        modern: "border-slate-200/60 dark:border-neutral-600/60 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm px-4 py-3 rounded-lg focus-visible:ring-neutral-500/50 dark:focus-visible:ring-neutral-400/50 focus-visible:border-transparent hover:border-slate-300/80 dark:hover:border-slate-500/80 dark:!text-gray-200 dark:!bg-neutral-800 dark:!border-neutral-500/40",
        glass: "border-slate-200/40 dark:border-slate-600/40 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-3 rounded-lg focus-visible:ring-neutral-500/40 dark:focus-visible:ring-neutral-400/40 focus-visible:border-transparent hover:border-slate-300/60 dark:hover:border-slate-500/60"
      },
      size: {
        sm: "h-9 text-sm px-3 py-2",
        md: "h-10 px-3 py-2",
        lg: "h-11 px-4 py-3 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    },
    compoundVariants: [
      {
        variant: "modern",
        size: "sm",
        class: "h-9 px-3 py-2"
      },
      {
        variant: "modern",
        size: "md",
        class: "h-10 px-4 py-3"
      },
      {
        variant: "modern",
        size: "lg",
        class: "h-11 px-4 py-3"
      },
      {
        variant: "glass",
        size: "sm",
        class: "h-9 px-3 py-2"
      },
      {
        variant: "glass",
        size: "md",
        class: "h-10 px-4 py-3"
      },
      {
        variant: "glass",
        size: "lg",
        class: "h-11 px-4 py-3"
      }
    ]
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  showNumberControls?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, showNumberControls = true, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    
    React.useImperativeHandle(ref, () => inputRef.current!)

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

    if (type === 'number' && showNumberControls !== false) {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(inputVariants({ variant, size }), "pr-8", className)}
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
        className={cn(inputVariants({ variant, size }), className)}
        ref={inputRef}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
