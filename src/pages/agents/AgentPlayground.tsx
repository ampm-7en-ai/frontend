
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Bot, ArrowLeft, User, SendHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
};

const AgentPlayground = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mock data - in a real app, you would fetch this
  const [agent, setAgent] = useState({
    id: agentId,
    name: "Customer Support Agent",
    description: "Handles customer inquiries and support tickets",
    status: "active",
    role: "support",
    primaryColor: '#9b87f5', // Brand purple
    secondaryColor: '#ffffff',
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'Hello! I\'m the Customer Support Agent. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // Focus the input field when the component mounts
    inputRef.current?.focus();
  }, []);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate agent typing and response
    setTimeout(() => {
      // Mock response - in a real app, this would be an API call
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: getAgentResponse(inputValue),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Simple mock function to generate responses
  const getAgentResponse = (input: string): string => {
    const responses = [
      "Thank you for your question. I'd be happy to help with that.",
      "I understand what you're looking for. Here's what I can tell you...",
      "That's a great question. Based on the information I have...",
      "I can certainly assist with that. Here's what you need to know...",
      "Thanks for reaching out. Let me look into that for you."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
      " This is a simulated response in the test environment.";
  };
  
  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings/business/agents')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Test Agent: {agent.name}</h2>
            <div className="text-muted-foreground text-sm">
              See how this agent interacts with users in a real conversation
            </div>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Bot className="h-3.5 w-3.5" />
          Test Mode
        </Badge>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 flex flex-col border-r">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className={`h-8 w-8 ${message.sender === 'agent' ? `bg-[${agent.primaryColor}]` : 'bg-gray-200'}`}>
                    {message.sender === 'agent' ? 
                      <Bot className="h-4 w-4 text-white" /> : 
                      <User className="h-4 w-4" />
                    }
                  </Avatar>
                  <div 
                    className={`rounded-lg p-3 ${
                      message.sender === 'agent' 
                        ? `bg-[${agent.primaryColor}] bg-opacity-10 text-gray-800` 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="text-sm">{message.text}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8 bg-[#9b87f5]">
                    <Bot className="h-4 w-4 text-white" />
                  </Avatar>
                  <div className="rounded-lg p-3 bg-[#9b87f5] bg-opacity-10">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <form 
              className="flex gap-2" 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping}
                style={{ backgroundColor: '#9b87f5' }}
              >
                <SendHorizontal className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </div>
        
        <div className="w-1/3 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Agent Information</h3>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">{agent.status === 'active' ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium capitalize">{agent.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Separator className="my-6" />
          
          <h3 className="text-lg font-semibold mb-4">Testing Notes</h3>
          <div className="text-sm space-y-4">
            <p>
              This is a simulated environment to test how your agent responds to user queries. No data from 
              this conversation will be stored permanently.
            </p>
            <p>
              In this test mode, the agent is using simulated responses. In a real deployment, the agent 
              would use its configured knowledge sources and behavior settings to generate responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPlayground;
