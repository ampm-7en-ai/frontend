
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationToastProps {
  message: string;
  variant?: 'default' | 'success' | 'error' | 'loading';
  onClose?: () => void;
  className?: string;
}

const variantStyles = {
  default: "bg-slate-900 text-white border-slate-700",
  success: "bg-emerald-600 text-white border-emerald-500",
  error: "bg-red-600 text-white border-red-500",
  loading: "bg-slate-900 text-white border-slate-700"
};

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  variant = 'default',
  onClose,
  className
}) => {
  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-300",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-center gap-3">
        {variant === 'loading' && (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationToast;
