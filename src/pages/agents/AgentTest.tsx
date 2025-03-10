
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, ChevronLeft, Circle, SendHorizontal, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
};

const AgentTest = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your Customer Support Agent. How can I help you today?",
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setInputMessage('');
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      let responseContent = "I understand your question. Based on our product documentation, the feature you're looking for can be found in the Settings menu under 'Advanced Options'. Would you like me to guide you through the setup process?";
      
      if (inputMessage.toLowerCase().includes('pricing')) {
        responseContent = "Our pricing plans start at $9.99/month for the Basic plan, which includes up to 5 users. The Pro plan is $29.99/month with unlimited users and premium features. Would you like me to send you a detailed comparison?";
      } else if (inputMessage.toLowerCase().includes('refund') || inputMessage.toLowerCase().includes('return')) {
        responseContent = "Our refund policy allows returns within 30 days of purchase. To process a refund, please provide your order number and reason for the return. I'd be happy to help you with the process.";
      }
      
      const agentMessage: Message = {
        id: messages.length + 2,
        content: responseContent,
        sender: 'agent',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <MainLayout 
      pageTitle="Test Agent" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Agents', href: '/agents' },
        { label: 'Test', href: '/agents/test' }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/agents">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Test Agent</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-primary/10">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Customer Support Agent</h3>
                    <Badge className="bg-green-100 text-green-800 mt-1">Active</Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Response Time:</p>
                    <p className="font-medium">1.2 seconds</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Knowledge Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline">Product Docs</Badge>
                      <Badge variant="outline">FAQ</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Test Scenarios:</p>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <span className="mr-2">🛒</span> Product Question
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <span className="mr-2">💰</span> Pricing Question
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <span className="mr-2">🔙</span> Return Policy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="flex flex-col h-[600px]">
              <CardHeader className="border-b">
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-1" />
                    <span className="text-sm text-muted-foreground">Online</span>
                  </div>
                  <Badge variant="outline" className="ml-auto flex items-center">
                    <Zap className="h-3 w-3 mr-1 text-primary" />
                    Test Mode
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[80%] rounded-lg p-3",
                        message.sender === 'user' 
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.sender === 'agent' && (
                        <div className="flex items-center mb-1">
                          <Avatar className="h-5 w-5 mr-2">
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold">Support Agent</span>
                        </div>
                      )}
                      <p>{message.content}</p>
                      <div className={cn(
                        "text-xs mt-1",
                        message.sender === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AgentTest;
