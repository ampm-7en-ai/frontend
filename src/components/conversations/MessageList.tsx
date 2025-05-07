
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, RefreshCw, User, Info, Copy, Edit, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface MessageProps {
  message: any;
  selectedAgent: string | null;
  messageContainerRef: React.RefObject<HTMLDivElement>;
}

const MessageList = ({ 
  message, 
  selectedAgent,
  messageContainerRef 
}: MessageProps) => {
  const isHighlighted = selectedAgent && message.sender === 'bot' && message.agent === selectedAgent;
  const [showControls, setShowControls] = useState(false);

  // Handle message actions
  const handleCopy = () => {
    if (typeof message.content === 'string') {
      navigator.clipboard.writeText(message.content);
      toast.success("Message copied to clipboard");
    }
  };

  // Handle system messages
  if (message.sender === 'system') {
    return (
      <div 
        key={message.id} 
        id={`message-${message.id}`}
        className="flex justify-center my-3"
      >
        <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 max-w-[80%] flex items-center gap-1.5 shadow-sm">
          <Info className="h-3.5 w-3.5 text-slate-500" />
          <div>{message.content}</div>
        </div>
      </div>
    );
  }

  // Handle transfer messages
  if (message.type === 'transfer') {
    const isTransferHighlighted = selectedAgent && 
      (message.from === selectedAgent || message.to === selectedAgent);
    
    return (
      <div 
        key={message.id} 
        id={`transfer-${message.id}`}
        className="flex justify-center my-4"
      >
        <div className={cn(
          "bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 max-w-[80%] transition-all duration-300 shadow-sm",
          isTransferHighlighted && "bg-amber-100 border-amber-300 shadow-md"
        )}>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <div>
              <span className="font-medium">{message.from}</span>
              <span className="mx-1">→</span>
              <span className="font-medium">{message.to}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine message style based on sender
  const userMessageStyle = "bg-primary text-primary-foreground dark:bg-blue-600";
  const botMessageStyle = isHighlighted 
    ? "border-slate-200 dark:border-slate-700" 
    : "border-slate-200 dark:border-slate-700";
  
  return (
    <div 
      key={message.id} 
      id={`message-${message.id}`}
      className={`mb-6 ${message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'} px-1`}
      onMouseEnter={() => message.sender === 'bot' && setShowControls(true)}
      onMouseLeave={() => message.sender === 'bot' && setShowControls(false)}
    >
      {message.sender === 'bot' && (
        <Avatar className={cn(
          "h-8 w-8 mr-3 mt-0.5",
          isHighlighted ? "bg-primary ring-2 ring-primary/30" : "bg-slate-700"
        )}>
          <AvatarFallback>
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[75%]",
        message.sender === 'user' ? "items-end" : "items-start"
      )}>
        {message.sender === 'bot' && message.agent && (
          <div className={cn(
            "text-xs font-medium mb-1 ml-1",
            isHighlighted ? "text-primary" : "text-muted-foreground"
          )}>
            {message.agent}
          </div>
        )}
        
        {message.sender === 'user' ? (
          <div 
            className={cn(
              "p-4 transition-all shadow-sm",
              "rounded-2xl rounded-tr-sm",
              userMessageStyle
            )}
          >
            <div className="prose-sm max-w-none break-words text-white">
              {typeof message.content === 'string' && (
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
            <div className="text-xs mt-2 opacity-70 text-right">
              {message.timestamp}
            </div>
          </div>
        ) : (
          <ContextMenu>
            <ContextMenuTrigger>
              <div 
                className={cn(
                  "p-4 transition-all",
                  "rounded-2xl rounded-tl-sm bg-transparent",
                  botMessageStyle,
                  "border prose dark:prose-invert"
                )}
              >
                <div className="prose-sm max-w-none break-words text-slate-800 dark:text-slate-200">
                  {typeof message.content === 'string' && (
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs mt-2 text-slate-500">
                    {message.timestamp}
                  </div>
                  
                  {showControls && (
                    <div className="flex gap-2 mt-2 text-slate-400">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={handleCopy} className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                              <Copy className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Revise message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="hover:text-green-500 transition-colors">
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark as helpful</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="hover:text-red-500 transition-colors">
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark as unhelpful</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="min-w-[160px]">
              <ContextMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy message</span>
              </ContextMenuItem>
              <ContextMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Revise</span>
              </ContextMenuItem>
              <ContextMenuItem>
                <ThumbsUp className="mr-2 h-4 w-4" />
                <span>Mark as helpful</span>
              </ContextMenuItem>
              <ContextMenuItem>
                <ThumbsDown className="mr-2 h-4 w-4" />
                <span>Mark as unhelpful</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
      
      {message.sender === 'user' && (
        <Avatar className="h-8 w-8 ml-3 mt-0.5 bg-purple-500">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageList;
