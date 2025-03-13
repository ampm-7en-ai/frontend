
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, ChevronLeft, Circle, SendHorizontal, Zap, Rocket, X, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import DeploymentDialog from '@/components/agents/DeploymentDialog';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
};

const AgentTest = () => {
  // Mock agent data - in a real application, this would come from an API or props
  const agent = {
    id: "1",
    name: "Customer Support Agent",
    description: "Helps with product questions and customer service inquiries",
    conversations: 1234,
    lastModified: new Date().toISOString(),
    averageRating: 4.8,
    knowledgeSources: [
      { id: 1, name: "Product Docs", type: "document", icon: "BookOpen", hasError: false },
      { id: 2, name: "FAQ", type: "webpage", icon: "Globe", hasError: false }
    ],
    model: "gpt-4",
    isDeployed: false
  };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: `Hello! How can I help you today?`,
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);

  // Chat appearance settings (in a real app, these would come from the agent configuration)
  const chatAppearance = {
    primaryColor: '#9b87f5', // Vivid purple from the reference image
    chatBubbleUserColor: '#9b87f5',
    chatBubbleAgentColor: '#F1F0FB',
    chatFontSize: 'medium',
    agentNameDisplay: true,
    timestampDisplay: true,
    roundedBubbles: true,
    headerColor: '#9b87f5', // Header color from the reference image
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/agents">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Test Agent</h1>
        </div>
        <Button 
          variant={agent.isDeployed ? "secondary" : "default"} 
          size="sm"
          onClick={() => setDeploymentDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Rocket className="h-4 w-4 mr-1" />
          {agent.isDeployed ? "Manage Deployment" : "Deploy Agent"}
        </Button>
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
                  <h3 className="font-semibold">{agent.name}</h3>
                  <Badge className="bg-green-100 text-green-800 mt-1">Active</Badge>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Model:</p>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {agent.model}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-muted-foreground">Knowledge Sources:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.knowledgeSources.map(source => (
                      <Badge key={source.id} variant="outline">{source.name}</Badge>
                    ))}
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
          <Card className="flex flex-col h-[600px] overflow-hidden border-0 shadow-lg">
            {/* Redesigned Chat Header */}
            <div 
              className="p-4 flex items-center justify-between" 
              style={{ backgroundColor: chatAppearance.headerColor }}
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-white">{agent.name}</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.sender === 'agent' && (
                    <div className="h-8 w-8 rounded-full mr-2 flex-shrink-0 bg-purple-500 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div 
                    className={cn(
                      "max-w-[80%] p-3",
                      message.sender === 'user' 
                        ? `rounded-t-lg rounded-bl-lg bg-[${chatAppearance.chatBubbleUserColor}] text-white`
                        : `rounded-t-lg rounded-br-lg bg-white border border-gray-200`
                    )}
                    style={{
                      backgroundColor: message.sender === 'user' ? chatAppearance.chatBubbleUserColor : 'white',
                      borderRadius: chatAppearance.roundedBubbles ? (
                        message.sender === 'user' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0'
                      ) : '0.25rem',
                      fontSize: chatAppearance.chatFontSize === 'small' ? '0.875rem' : 
                               chatAppearance.chatFontSize === 'large' ? '1.125rem' : '1rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <p className={message.sender === 'user' ? 'text-white' : 'text-gray-800'}>
                      {message.content}
                    </p>
                    {chatAppearance.timestampDisplay && (
                      <div className={cn(
                        "text-xs mt-1",
                        message.sender === 'user' ? "text-white/80" : "text-gray-500"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
            
            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center">
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon" 
                  className="ml-2 rounded-full h-10 w-10"
                  style={{ backgroundColor: chatAppearance.primaryColor }}
                >
                  <SendHorizontal className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Deployment Dialog */}
      <DeploymentDialog 
        open={deploymentDialogOpen} 
        onOpenChange={setDeploymentDialogOpen} 
        agent={agent} 
      />
    </div>
  );
};

export default AgentTest;
