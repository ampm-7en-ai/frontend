
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'cta' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
  iconOnly?: boolean;
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
  type = 'button',
  asChild = false,
  iconOnly = false,
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 focus:ring-slate-500",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-300",
    outline: "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-300",
    gradient: "bg-black text-white dark:bg-white dark:text-black bg-[hsla(0,0%,0%,0.95)] [background-image:radial-gradient(at_center_bottom,hsla(18,72%,65%,0.35)_0px,transparent_55%),radial-gradient(at_top_right,hsla(45,80%,55%,0.25)_0px,transparent_60%),radial-gradient(at_80%_0%,hsla(0,0%,0%,0.9)_0px,transparent_50%),radial-gradient(at_87%_5%,hsla(0,0%,0%,0.9)_0px,transparent_50%),radial-gradient(at_0%_100%,hsla(0,0%,0%,0.9)_0px,transparent_50%),radial-gradient(at_80%_100%,hsla(0,0%,0%,0.9)_0px,transparent_50%),radial-gradient(at_0%_0%,hsla(0,0%,0%,0.9)_0px,transparent_50%)] text-white shadow-lg dark:[background-image:none]",
    cta: "bg-slate-900 hover:bg-slate-800 text-white shadow-lg focus:ring-slate-500 font-semibold",
    ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-300"
  };
  
  const sizeClasses = {
    sm: iconOnly ? "p-1.5 text-sm rounded-xl" : "px-3 py-1.5 text-sm rounded-xl",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-2xl"
  };

  // Enhanced icon-only detection
  const isDetectedIconOnly = iconOnly || 
    (className.includes('p-0') && (className.includes('w-8') && className.includes('h-8') || className.includes('w-10') && className.includes('h-10'))) ||
    (!children && Icon);

  // Improved icon sizing based on button size and icon-only status
  const getIconClasses = () => {
    if (isDetectedIconOnly) {
      switch (size) {
        case 'sm':
          return "h-4 w-4"; // Better proportion for small icon-only buttons
        case 'md':
          return "h-5 w-5";
        case 'lg':
          return "h-6 w-6";
        default:
          return "h-4 w-4";
      }
    } else {
      // Icon with text - use smaller icons with margin
      return size === 'lg' ? "w-5 h-5 mr-2" : "w-4 h-4 mr-2";
    }
  };

  const iconClasses = getIconClasses();
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  // When using asChild, we need to clone the child and add our props to it
  if (asChild) {
    return (
      <Slot className={buttonClasses} ref={ref} {...props}>
        {React.cloneElement(children as React.ReactElement, {
          children: (
            <>
              {Icon && <Icon className={iconClasses} />}
              {(children as React.ReactElement).props.children}
            </>
          )
        })}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {Icon && <Icon className={iconClasses} />}
      {children}
    </button>
  );
});

ModernButton.displayName = "ModernButton";

export default ModernButton;
