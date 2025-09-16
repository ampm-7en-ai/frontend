
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  expandable?: boolean;
  maxExpandedHeight?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, expandable = false, maxExpandedHeight = "300px", ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    React.useEffect(() => {
      if (expandable && textareaRef.current) {
        const adjustHeight = () => {
          const textarea = textareaRef.current;
          if (!textarea) return;
          
          // Reset height to auto to calculate the new height
          textarea.style.height = 'auto';
          
          // Calculate new height based on scrollHeight, but limit it
          const maxHeightPx = maxExpandedHeight;
          const newHeight = `${Math.min(textarea.scrollHeight, parseInt(maxHeightPx) || 300)}px`;
          textarea.style.height = newHeight;
          
          // If content exceeds the max height, enable scrolling
          if (textarea.scrollHeight > parseInt(maxHeightPx) || 300) {
            textarea.style.overflowY = 'auto';
          } else {
            textarea.style.overflowY = 'hidden';
          }
        };
        
        adjustHeight();
        textareaRef.current.addEventListener('input', adjustHeight);
        
        return () => {
          if (textareaRef.current) {
            textareaRef.current.removeEventListener('input', adjustHeight);
          }
        };
      }
    }, [expandable, maxExpandedHeight]);
    
    const combinedRef = React.useCallback(
      (textarea: HTMLTextAreaElement) => {
        if (typeof ref === 'function') ref(textarea);
        else if (ref) ref.current = textarea;
        textareaRef.current = textarea;
      },
      [ref]
    );
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:bg-neutral-800 dark:!border-neutral-500/40",
          expandable && "resize-none",
          className
        )}
        ref={combinedRef}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
