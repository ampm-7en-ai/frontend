
import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertBannerProps {
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  icon?: React.ReactNode;
}

export function AlertBanner({
  message,
  variant = 'info',
  className,
  icon = <Info className="h-4 w-4" />
}: AlertBannerProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    success: 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    error: 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-2 p-3 rounded-md border',
        variantStyles[variant],
        className
      )}
    >
      <span className={cn(
        'flex-shrink-0',
        variant === 'info' && 'text-blue-500',
        variant === 'success' && 'text-green-500',
        variant === 'warning' && 'text-amber-500',
        variant === 'error' && 'text-red-500',
      )}>
        {icon}
      </span>
      <span>{message}</span>
    </div>
  );
}
