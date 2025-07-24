
import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrationStatusBadgeProps {
  isVisible: boolean;
  integrationName: string;
  integrationLogo?: string;
  onClose: () => void;
  className?: string;
}

export const IntegrationStatusBadge: React.FC<IntegrationStatusBadgeProps> = ({
  isVisible,
  integrationName,
  integrationLogo,
  onClose,
  className
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out",
      "animate-in slide-in-from-top-2 fade-in-0",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      className
    )}>
      <div className="bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          
          {integrationLogo && (
            <div className="flex-shrink-0">
              <img 
                src={integrationLogo} 
                alt={integrationName}
                className="w-6 h-6 object-contain rounded"
              />
            </div>
          )}
          
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {integrationName} connected successfully!
            </span>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Your integration is now active and ready to use
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
