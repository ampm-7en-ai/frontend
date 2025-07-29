import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bot, ArrowLeft, User, SendHorizontal, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchAgentDetails } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';

type Message = {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  type?: 'ui';
  ui_type?: 'email';
};

const AgentPlayground = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  
  const [agent, setAgent] = useState<any>({
    id: agentId,
    name: "Customer Support Agent",
    description: "Handles customer inquiries and support tickets",
    status: "active",
    role: "support",
    appearance: {
      primaryColor: '#9b87f5',
      secondaryColor: '#ffffff',
      avatar: { src: '', type: 'default' },
      welcomeMessage: "Hello! I'm an AI assistant. How can I help you today?"
    },
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);

  // Email collection state
  const [userEmail, setUserEmail] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    // Fetch agent details when component mounts
    const getAgentDetails = async () => {
      try {
        setLoading(true);
        if (agentId) {
          const agentData = await fetchAgentDetails(agentId);
          setAgent(agentData);
        }
      } catch (error) {
        console.error('Failed to fetch agent details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load agent details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    getAgentDetails();
  }, [agentId, toast]);

  useEffect(() => {
    // Initialize chat service when component mounts and agentId is available
    if (agentId) {
      console.log(`Initializing ChatWebSocketService with agent ID: ${agentId}`);
      chatServiceRef.current = new ChatWebSocketService(agentId, "playground");
      
      chatServiceRef.current.on({
        onMessage: (message) => {
          console.log("Received message:", message);
          
          // Handle UI messages (like email collection)
          if (message.type === 'ui' && message.ui_type === 'email') {
            setMessages(prev => [
              ...prev, 
              {
                id: Date.now().toString(),
                sender: 'agent',
                text: message.content || '',
                timestamp: new Date(message.timestamp),
                type: 'ui',
                ui_type: 'email'
              }
            ]);
            setIsTyping(false);
            return;
          }
          
          // Handle regular messages
          setMessages(prev => [
            ...prev, 
            {
              id: Date.now().toString(),
              sender: 'agent',
              text: message.content,
              timestamp: new Date(message.timestamp)
            }
          ]);
          setIsTyping(false);
        },
        onTypingStart: () => {
          console.log("Typing indicator started");
          setIsTyping(true);
        },
        onTypingEnd: () => {
          console.log("Typing indicator ended");
          setIsTyping(false);
        },
        onError: (error) => {
          console.error('Chat error:', error);
          toast({
            title: "Connection Error",
            description: error || "Failed to connect to chat service",
            variant: "destructive",
          });
          setIsTyping(false);
          setIsConnected(false);
        },
        onConnectionChange: (status) => {
          console.log("Connection status changed:", status);
          setIsConnected(status);
          
          if (status && !messages.length) {
            // Add welcome message when connected
            if (agent?.appearance?.welcomeMessage) {
              setMessages([{
                id: '1',
                sender: 'agent',
                text: agent.appearance.welcomeMessage,
                timestamp: new Date(),
              }]);
            }
          }
        }
      });
      
      // Connect
      chatServiceRef.current.connect();
      
      // Cleanup on unmount
      return () => {
        console.log("Cleaning up ChatWebSocketService");
        if (chatServiceRef.current) {
          chatServiceRef.current.disconnect();
        }
      };
    }
  }, [agentId, toast, agent?.appearance?.welcomeMessage, messages.length, agent]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Focus the input field when the component mounts
    inputRef.current?.focus();
  }, []);

  // Email submission handlers
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim() || isEmailSubmitting) return;
    
    setIsEmailSubmitting(true);
    
    try {
      if (chatServiceRef.current) {
        // Send email to the WebSocket
        chatServiceRef.current.sendMessage(`Email: ${userEmail}`);
        
        // Remove the email UI message and mark as submitted
        setMessages(prev => prev.filter(msg => !(msg.type === 'ui' && msg.ui_type === 'email')));
        setEmailSubmitted(true);
        setUserEmail('');
        
        toast({
          title: "Email Submitted",
          description: "Thank you for providing your email address.",
        });
      }
    } catch (error) {
      console.error("Failed to submit email:", error);
      toast({
        title: "Error",
        description: "Failed to submit email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleSkipEmail = () => {
    // Remove the email UI message and send skip message
    setMessages(prev => prev.filter(msg => !(msg.type === 'ui' && msg.ui_type === 'email')));
    
    if (chatServiceRef.current) {
      chatServiceRef.current.sendMessage("Skip email collection");
    }
    
    toast({
      title: "Email Skipped",
      description: "You can continue the conversation without providing an email.",
    });
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;
    
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Send message via WebSocket
    try {
      if (chatServiceRef.current) {
        chatServiceRef.current.sendMessage(inputValue);
        console.log("Message sent:", inputValue);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  // Email collection UI component
  const renderEmailCollection = (message: Message) => {
    return (
      <div className="flex justify-start">
        <div className="flex gap-3 max-w-[80%]">
          <Avatar className="h-8 w-8" style={{
            backgroundColor: avatarType === 'default' ? primaryColor : 'transparent'
          }}>
            {avatarSrc && avatarType === 'custom' ? (
              <AvatarImage src={avatarSrc} alt={agent.name} className="object-cover" />
            ) : null}
            <AvatarFallback style={{
              backgroundColor: primaryColor
            }}>
              <Bot className="h-4 w-4 text-white" />
            </AvatarFallback>
          </Avatar>
          
          <div className="rounded-lg p-4 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4" style={{ color: primaryColor }} />
              <span className="font-medium text-gray-800">Email Collection</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {message.text || "Would you like to provide your email address for follow-up communication?"}
            </p>
            
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full"
                required
              />
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={!userEmail.trim() || isEmailSubmitting}
                  style={{ backgroundColor: primaryColor }}
                  className="flex-1"
                >
                  {isEmailSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Submit Email
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSkipEmail}
                  disabled={isEmailSubmitting}
                >
                  Skip
                </Button>
              </div>
            </form>
            
            <div className="text-xs text-gray-500 mt-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading agent..." />
      </div>
    );
  }

  // Get the primary color from agent appearance or use default
  const primaryColor = agent?.appearance?.primaryColor || '#9b87f5';
  const avatarSrc = agent?.appearance?.avatar?.src || '';
  const avatarType = agent?.appearance?.avatar?.type || 'default';

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
            {messages.map((message) => {
              // Handle email collection UI
              if (message.type === 'ui' && message.ui_type === 'email') {
                return (
                  <div key={message.id}>
                    {renderEmailCollection(message)}
                  </div>
                );
              }
              
              // Handle regular messages
              return (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {message.sender === 'agent' ? (
                      <Avatar className="h-8 w-8" style={{
                        backgroundColor: avatarType === 'default' ? primaryColor : 'transparent'
                      }}>
                        {avatarSrc && avatarType === 'custom' ? (
                          <AvatarImage src={avatarSrc} alt={agent.name} className="object-cover" />
                        ) : null}
                        <AvatarFallback style={{
                          backgroundColor: primaryColor
                        }}>
                          <Bot className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-8 w-8 bg-gray-200">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div 
                      className={`rounded-lg p-3 ${
                        message.sender === 'agent' 
                          ? `bg-opacity-10 text-gray-800` 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      style={{
                        backgroundColor: message.sender === 'agent' ? `${primaryColor}20` : ''
                      }}
                    >
                      <div className="text-sm">{message.text}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8" style={{
                    backgroundColor: avatarType === 'default' ? primaryColor : 'transparent'
                  }}>
                    {avatarSrc && avatarType === 'custom' ? (
                      <AvatarImage src={avatarSrc} alt={agent.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback style={{
                      backgroundColor: primaryColor
                    }}>
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3" style={{
                    backgroundColor: `${primaryColor}20`
                  }}>
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
                placeholder={isConnected ? "Type your message..." : "Connecting to agent..."}
                className="flex-1"
                disabled={!isConnected || isTyping}
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || !isConnected || isTyping}
                style={{ backgroundColor: primaryColor }}
              >
                <SendHorizontal className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
            {!isConnected && (
              <p className="text-xs text-center mt-2 text-muted-foreground">
                {loading ? "Connecting to agent..." : "Not connected to agent. Please try refreshing."}
              </p>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
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
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{agent.agentType || 'Standard'}</span>
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
            <p>
              The agent may request your email address during the conversation for follow-up purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPlayground;
