
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface ChatboxPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  position: 'bottom-right' | 'bottom-left';
  className?: string;
}

export const ChatboxPreview = ({
  primaryColor = '#3b82f6',
  secondaryColor = '#ffffff',
  fontFamily = 'Inter',
  chatbotName = 'Assistant',
  welcomeMessage = 'Hello! How can I help you today?',
  buttonText = 'Chat with us',
  position = 'bottom-right',
  className
}: ChatboxPreviewProps) => {
  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "absolute bottom-4",
          position === 'bottom-right' ? 'right-4' : 'left-4'
        )}
      >
        {/* Chat Button */}
        <button 
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md"
          style={{ 
            backgroundColor: primaryColor,
            color: secondaryColor,
            fontFamily: fontFamily 
          }}
        >
          <Bot size={16} />
          {buttonText}
        </button>
        
        {/* Chat Window Preview */}
        <Card className="absolute bottom-12 mb-2 w-[300px] shadow-lg" 
          style={{ 
            fontFamily: fontFamily,
            right: position === 'bottom-right' ? '0' : 'auto',
            left: position === 'bottom-left' ? '0' : 'auto'
          }}
        >
          <div 
            className="p-3 rounded-t-lg flex items-center gap-2"
            style={{ backgroundColor: primaryColor, color: secondaryColor }}
          >
            <Bot size={18} />
            <span className="font-medium">{chatbotName}</span>
          </div>
          <CardContent className="p-3">
            <div className="flex gap-2 items-start mb-6">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center mt-1"
                style={{ backgroundColor: primaryColor, color: secondaryColor }}
              >
                <Bot size={14} />
              </div>
              <div
                className="rounded-lg p-2 max-w-[80%]"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <p className="text-sm">{welcomeMessage}</p>
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div 
                className="w-full p-2 rounded-md text-sm bg-gray-100"
                style={{ color: "gray" }}
              >
                Type your message...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Browser Frame */}
      <div className="w-full h-[400px] bg-gray-100 rounded-md flex items-center justify-center border">
        <div className="text-muted-foreground">Website content preview</div>
      </div>
    </div>
  );
};
