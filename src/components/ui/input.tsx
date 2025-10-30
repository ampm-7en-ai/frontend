
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

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
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
