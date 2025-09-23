
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
  type?: string;
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
  type = ''
}: ModernModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-2xl rounded-2xl',
          sizeClasses[size],
          fixedFooter && 'flex flex-col max-h-[85vh]',
          className
        )}
        fixedFooter={fixedFooter}
      >
        {/* Custom Close Button */}
        <DialogClose className="absolute right-6 top-6 rounded-full p-2 bg-slate-100/80 dark:bg-neutral-700/80 backdrop-blur-sm opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-slate-200/80 dark:hover:bg-neutral-700/90 focus:outline-none z-50">
          <X className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {(title || description) && (
          <DialogHeader className={cn(type === 'alert' ? "" : "space-y-1 pb-4")}>
            {title && (
              <DialogTitle className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 pr-12">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {
          type === 'alert' ? (<></>) : (
            <div className={cn(
              'flex-1 px-0',
              fixedFooter && 'overflow-auto',
              // Beautiful scrollbar styling
              '[&::-webkit-scrollbar]:w-2',
              '[&::-webkit-scrollbar-track]:bg-neutral-100/50 [&::-webkit-scrollbar-track]:dark:bg-neutral-800/50',
              '[&::-webkit-scrollbar-track]:rounded-full',
              '[&::-webkit-scrollbar-thumb]:bg-neutral-300/80 [&::-webkit-scrollbar-thumb]:dark:bg-neutral-600/80',
              '[&::-webkit-scrollbar-thumb]:rounded-full',
              '[&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent',
              '[&::-webkit-scrollbar-thumb]:bg-clip-padding',
              '[&::-webkit-scrollbar-thumb]:hover:bg-neutral-400/80 [&::-webkit-scrollbar-thumb]:dark:hover:bg-neutral-500/80',
              '[&::-webkit-scrollbar-thumb]:transition-colors',
              // Firefox scrollbar styling
              'scrollbar-thin scrollbar-track-neutral-100/50 scrollbar-thumb-neutral-300/80',
              'dark:scrollbar-track-neutral-800/50 dark:scrollbar-thumb-neutral-600/80'
            )}>
              {children}
            </div>
          )
        }
        

        {footer && (
          <DialogFooter className={cn(
            'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0 pt-6 mt-6',
            fixedFooter && 'border-t border-border px-6 py-4 -mx-6 -mb-6 rounded-b-2xl pb-[29px] pr-[29px]',
            type === 'alert' && 'pt-0 mt-0'
          )}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
