
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface ModernModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  className?: string;
  fixedFooter?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
};

export const ModernModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'lg',
  className,
  fixedFooter = false,
}: ModernModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-2xl',
          sizeClasses[size],
          fixedFooter && 'flex flex-col max-h-[85vh]',
          className
        )}
        fixedFooter={fixedFooter}
      >
        {/* Custom Close Button */}
        <DialogClose className="absolute right-6 top-6 rounded-full p-2 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-50">
          <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {(title || description) && (
          <DialogHeader className="space-y-3 pb-6">
            {title && (
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 pr-12">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className={cn(
          'flex-1',
          fixedFooter && 'overflow-auto'
        )}>
          {children}
        </div>

        {footer && (
          <DialogFooter className={cn(
            'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0 pt-6',
            fixedFooter && 'border-t border-white/20 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 mt-auto -mx-8 -mb-8 rounded-b-2xl'
          )}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
