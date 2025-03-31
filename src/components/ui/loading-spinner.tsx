
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) {
  // Use a constant object outside the component to prevent recreation on each render
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
      {text && <p className="ml-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
