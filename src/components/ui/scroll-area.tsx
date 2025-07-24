
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & { 
    style?: React.CSSProperties;
    hideScrollbar?: boolean;
  }
>(({ className, children, style, hideScrollbar = false, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    style={style}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className={cn(
      "h-full w-full rounded-[inherit] overflow-scroll",
      // Beautiful scrollbar styling
      '[&::-webkit-scrollbar]:w-2',
      '[&::-webkit-scrollbar-track]:bg-slate-100/50 [&::-webkit-scrollbar-track]:dark:bg-slate-800/50',
      '[&::-webkit-scrollbar-track]:rounded-full',
      '[&::-webkit-scrollbar-thumb]:bg-slate-300/80 [&::-webkit-scrollbar-thumb]:dark:bg-slate-600/80',
      '[&::-webkit-scrollbar-thumb]:rounded-full',
      '[&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent',
      '[&::-webkit-scrollbar-thumb]:bg-clip-padding',
      '[&::-webkit-scrollbar-thumb]:hover:bg-slate-400/80 [&::-webkit-scrollbar-thumb]:dark:hover:bg-slate-500/80',
      '[&::-webkit-scrollbar-thumb]:transition-colors',
      // Firefox scrollbar styling
      'scrollbar-thin scrollbar-track-slate-100/50 scrollbar-thumb-slate-300/80',
      'dark:scrollbar-track-slate-800/50 dark:scrollbar-thumb-slate-600/80'
    )}>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar className={hideScrollbar ? "opacity-0" : ""} />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb 
      className="relative flex-1 rounded-full bg-border hover:bg-muted"
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
