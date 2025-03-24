
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  expandable?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, expandable = false, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    React.useEffect(() => {
      if (expandable && textareaRef.current) {
        const adjustHeight = () => {
          const textarea = textareaRef.current;
          if (!textarea) return;
          
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        };
        
        adjustHeight();
        textareaRef.current.addEventListener('input', adjustHeight);
        
        return () => {
          if (textareaRef.current) {
            textareaRef.current.removeEventListener('input', adjustHeight);
          }
        };
      }
    }, [expandable]);
    
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
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          expandable && "resize-none overflow-hidden",
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
