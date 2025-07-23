
import React from 'react';
import { cn } from '../../utils/cn';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  iconOnly?: boolean;
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant = 'default', size = 'md', icon: Icon, iconOnly = false, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground"
    };

    const sizeClasses = {
      sm: iconOnly ? "h-8 w-8 p-0" : "h-8 px-3 text-sm",
      md: iconOnly ? "h-10 w-10 p-0" : "h-10 px-4 py-2",
      lg: iconOnly ? "h-12 w-12 p-0" : "h-12 px-6 py-3 text-lg"
    };

    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 18
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {Icon && (
          <Icon 
            size={iconSizes[size]} 
            className={!iconOnly && children ? "mr-2" : ""} 
          />
        )}
        {!iconOnly && children}
      </button>
    );
  }
);
ModernButton.displayName = "ModernButton";

export { ModernButton };
