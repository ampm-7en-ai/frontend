
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    size?: "default" | "sm" | "xs";
    orientation?: "horizontal" | "vertical";
    variant?: "default" | "github";
    sticky?: boolean;
    stickyOffset?: string;
  }
>(({ className, size = "default", orientation = "horizontal", variant = "default", sticky = false, stickyOffset = "top-16", ...props }, ref) => {
  const sizeClasses = {
    default: "h-10",
    sm: "h-8",
    xs: "h-7"
  }
  
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        orientation === "vertical" && "flex-col",
        sizeClasses[size],
        variant === "github" 
          ? "inline-flex w-full border-b border-border bg-background gap-1 px-4" 
          : "inline-flex items-center justify-center rounded-lg bg-gray-200/60 p-1 text-muted-foreground",
        sticky && `sticky ${stickyOffset} z-40 bg-background`, // Allow customizing the sticky offset
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    size?: "default" | "sm" | "xs";
    variant?: "default" | "github";
  }
>(({ className, size = "default", variant = "default", ...props }, ref) => {
  const sizeClasses = {
    default: "px-3 py-1.5 text-sm",
    sm: "px-2.5 py-1 text-xs",
    xs: "px-2 py-0.5 text-xs"
  }
  
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "github" 
          ? "border-b-2 border-transparent px-4 py-2 text-sm text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:font-semibold -mb-[2px]" 
          : "rounded-sm data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    scrollable?: boolean;
    hideScrollbar?: boolean;
  }
>(({ className, scrollable = false, hideScrollbar = false, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      scrollable ? "overflow-auto" : "",
      hideScrollbar ? "scrollbar-hide" : "",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
