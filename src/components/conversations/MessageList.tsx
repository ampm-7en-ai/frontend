
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, RefreshCw, User, Info, Copy, RotateCcw, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import MessageRevisionModal from './MessageRevisionModal';

interface MessageProps {
  message: any;
  selectedAgent: string | null;
  messageContainerRef: React.RefObject<HTMLDivElement>;
  isTyping?: boolean;
  allMessages: any[];
}

const MessageList = ({ 
  message, 
  selectedAgent,
  messageContainerRef,
  isTyping,
  allMessages 
}: MessageProps) => {
  const isHighlighted = selectedAgent && message.sender === 'bot' && message.agent === selectedAgent;
  const [showControls, setShowControls] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);

  const handleCopy = () => {
    if (typeof message.content === 'string') {
      navigator.clipboard.writeText(message.content);
      toast.success("Message copied to clipboard");
    }
  };

  const handleRevise = () => {
    setRevisionModalOpen(true);
  };

  const handleRevisionSave = (revisedAnswer: string) => {
    // Here you would typically send the revised answer to your backend
    console.log('Revised answer:', revisedAnswer);
    toast.success("Answer revised successfully");
  };

  const getPreviousUserMessage = () => {
    if (!allMessages) return "No previous question found";
    
    const currentMessageIndex = allMessages.findIndex(msg => msg.id === message.id);
    
    // Look for the previous user message
    for (let i = currentMessageIndex - 1; i >= 0; i--) {
      if (allMessages[i].sender === 'user') {
        return allMessages[i].content;
      }
    }
    
    return "No previous question found";
  };

  // Handle system messages
  if (message.sender === 'system') {
    return (
      <div 
        key={message.id} 
        id={`message-${message.id}`}
        className="flex justify-center my-3"
      >
        <div className="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 max-w-[80%] flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
          <Info className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
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
          "bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/60 rounded-lg px-3 py-2 text-xs text-amber-800 dark:text-amber-200 max-w-[80%] transition-all duration-300 shadow-sm backdrop-blur-sm",
          isTransferHighlighted && "bg-amber-100/80 dark:bg-amber-900/40 border-amber-300/60 dark:border-amber-700/60 shadow-md"
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

  const userMessageStyle = "bg-primary text-primary-foreground dark:bg-blue-600 dark:text-white";
  
  return (
    <>
      <div 
        key={message.id} 
        id={`message-${message.id}`}
        className={`mb-4 ${message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'} px-1`}
      >
        {message.sender === 'bot' && (
          <Avatar className={cn(
            "h-8 w-8 mr-3 mt-0.5 flex-shrink-0",
            isHighlighted ? "bg-primary ring-2 ring-primary/30" : "bg-slate-700 dark:bg-slate-600"
          )}>
            <AvatarFallback>
              <Bot className="h-4 w-4 text-white" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "flex flex-col max-w-[75%] min-w-0",
          message.sender === 'user' ? "items-end" : "items-start"
        )}>
          {message.sender === 'bot' && message.agent && (
            <div className={cn(
              "text-xs font-medium mb-1 ml-1",
              isHighlighted ? "text-primary dark:text-primary-foreground" : "text-muted-foreground"
            )}>
              {message.agent}
            </div>
          )}
          
          {message.sender === 'user' ? (
            <div 
              className={cn(
                "p-3 transition-all shadow-sm max-w-full",
                "rounded-2xl rounded-tr-sm",
                userMessageStyle
              )}
            >
              <div className="prose-sm max-w-none break-words text-white dark:text-white">
                {typeof message.content === 'string' && (
                  <ReactMarkdown 
                    components={{
                      p: ({ children }) => <p className="m-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="m-0 mt-2 pl-4">{children}</ul>,
                      ol: ({ children }) => <ol className="m-0 mt-2 pl-4">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
              <div className="text-xs mt-2 opacity-70 text-right">
                {message.timestamp}
              </div>
            </div>
          ) : (
            <div 
              className="flex flex-col group relative max-w-full"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              <div 
                className={cn(
                  "p-3 transition-all max-w-full",
                  "rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800/90 backdrop-blur-sm",
                  "border border-slate-200/60 dark:border-slate-700/60 shadow-none"
                )}
              >
                <div className="prose-sm max-w-none break-words text-slate-800 dark:text-slate-200">
                  {typeof message.content === 'string' && (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="m-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="m-0 mt-2 pl-4">{children}</ul>,
                        ol: ({ children }) => <ol className="m-0 mt-2 pl-4">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                <div className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                  {message.timestamp}
                </div>
              </div>
              
              {/* Action buttons at bottom of message - visible on hover */}
              <div 
                className={cn(
                  "flex items-center gap-1 mt-1.5 ml-1",
                  showControls ? "opacity-100" : "opacity-0",
                  "transition-opacity duration-150"
                )}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleCopy} 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm">
                        <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy response</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleRevise}
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm">
                        <RotateCcw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Revise</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm">
                        <ThumbsUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark as helpful</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm">
                        <ThumbsDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark as unhelpful</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
        
        {message.sender === 'user' && (
          <Avatar className="h-8 w-8 ml-3 mt-0.5 bg-purple-500 dark:bg-purple-600 p-[1px] flex-shrink-0">
            <AvatarFallback>
              <User className="h-4 w-4 text-white" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message Revision Modal */}
      <MessageRevisionModal
        open={revisionModalOpen}
        onOpenChange={setRevisionModalOpen}
        question={getPreviousUserMessage()}
        answer={message.content}
        onRevise={handleRevisionSave}
      />
    </>
  );
};

export default MessageList;
