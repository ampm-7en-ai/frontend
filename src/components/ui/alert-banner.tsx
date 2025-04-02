
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
    success: 'bg-green-50 border-green-100 text-green-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    error: 'bg-red-50 border-red-100 text-red-700'
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
