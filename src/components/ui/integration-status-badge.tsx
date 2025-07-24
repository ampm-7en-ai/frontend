
import React from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrationStatusBadgeProps {
  isVisible: boolean;
  integrationName: string;
  status: 'success' | 'failed';
  onClose: () => void;
  className?: string;
}

export const IntegrationStatusBadge: React.FC<IntegrationStatusBadgeProps> = ({
  isVisible,
  integrationName,
  status,
  onClose,
  className
}) => {
  if (!isVisible) return null;

  const isSuccess = status === 'success';

  return (
    <div className={cn(
      "fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out",
      "animate-in slide-in-from-top-2 fade-in-0",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      className
    )}>
      <div className={cn(
        "bg-white dark:bg-slate-800 border rounded-2xl shadow-lg backdrop-blur-sm",
        isSuccess 
          ? "border-green-200 dark:border-green-800" 
          : "border-red-200 dark:border-red-800"
      )}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-xl",
            isSuccess 
              ? "bg-gradient-to-br from-green-500 to-green-600" 
              : "bg-gradient-to-br from-red-500 to-red-600"
          )}>
            {isSuccess ? (
              <CheckCircle className="h-4 w-4 text-white" />
            ) : (
              <AlertCircle className="h-4 w-4 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {isSuccess 
                ? `${integrationName} connected successfully!`
                : `${integrationName} connection failed`
              }
            </span>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {isSuccess 
                ? "Your integration is now active and ready to use"
                : "There was an error connecting your integration. Please try again."
              }
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
