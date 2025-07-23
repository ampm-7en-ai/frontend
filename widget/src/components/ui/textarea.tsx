
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  expandable?: boolean;
  maxExpandedHeight?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, expandable = false, maxExpandedHeight = "200px", ...props }, ref) => {
    const [height, setHeight] = useState<string>('auto');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (expandable && textareaRef.current) {
        const textarea = textareaRef.current;
        const adjustHeight = () => {
          textarea.style.height = 'auto';
          const scrollHeight = textarea.scrollHeight;
          const maxHeight = parseInt(maxExpandedHeight);
          
          if (scrollHeight > maxHeight) {
            textarea.style.height = maxExpandedHeight;
            textarea.style.overflowY = 'auto';
          } else {
            textarea.style.height = `${scrollHeight}px`;
            textarea.style.overflowY = 'hidden';
          }
        };

        adjustHeight();
        textarea.addEventListener('input', adjustHeight);
        return () => textarea.removeEventListener('input', adjustHeight);
      }
    }, [expandable, maxExpandedHeight, props.value]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref || textareaRef}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
