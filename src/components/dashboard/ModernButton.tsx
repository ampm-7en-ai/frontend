
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'cta';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
  type = 'button',
  asChild = false
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 focus:ring-slate-500",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-300",
    outline: "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-300",
    gradient: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg focus:ring-blue-500",
    cta: "bg-slate-900 hover:bg-slate-800 text-white shadow-lg focus:ring-slate-500 font-semibold"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-xl",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-2xl"
  };

  // Check if this is an icon-only button (has p-0 in className and square dimensions)
  const isIconOnly = className.includes('p-0') && (className.includes('w-8') || className.includes('h-8'));
  const iconClasses = isIconOnly ? "w-5 h-5" : "w-4 h-4 mr-2";

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  // When using asChild, we need to clone the child and add our props to it
  if (asChild) {
    return (
      <Slot className={buttonClasses}>
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
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {Icon && <Icon className={iconClasses} />}
      {children}
    </button>
  );
};

export default ModernButton;
