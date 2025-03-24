import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Bot, ChevronLeft, Circle, SendHorizontal, Zap, Rocket, X, Maximize2, 
  Repeat, SplitSquareVertical, Languages, Settings, ExternalLink, Dices
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import DeploymentDialog from '@/components/agents/DeploymentDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'agent' | 'agent2';
  model?: string;
  timestamp: Date;
};

type Agent = {
  id: string;
  name: string;
  description: string;
  conversations: number;
  lastModified: string;
  averageRating: number;
  knowledgeSources: { id: number; name: string; type: string; icon: string; hasError: boolean }[];
  model: string;
  isDeployed: boolean;
  systemPrompt?: string;
};

const MODELS = {
  'gpt4': { name: 'GPT-4', provider: 'OpenAI' },
  'gpt35': { name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  'anthropic': { name: 'Claude 3', provider: 'Anthropic' },
  'mistral': { name: 'Mistral 7B', provider: 'Mistral AI' },
  'llama': { name: 'Llama 2', provider: 'Meta AI' },
  'gemini': { name: 'Gemini Pro', provider: 'Google' }
};

// Mock agent data - would come from API in a real app
const mockAgents: Agent[] = [
  {
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
    model: "gpt4",
    isDeployed: false,
    systemPrompt: "You are a helpful customer support assistant. Your goal is to assist users with their questions and problems related to our products and services. Be friendly, patient, and informative."
  },
  {
    id: "2",
    name: "Sales Agent",
    description: "Helps with product sales and pricing",
    conversations: 856,
    lastModified: new Date().toISOString(),
    averageRating: 4.6,
    knowledgeSources: [
      { id: 3, name: "Pricing Guide", type: "document", icon: "DollarSign", hasError: false }
    ],
    model: "gpt35",
    isDeployed: true,
    systemPrompt: "You are a knowledgeable sales assistant. Your goal is to help potential customers understand our products, answer their questions, and guide them towards making a purchase decision. Be enthusiastic but not pushy."
  },
  {
    id: "3",
    name: "Technical Support",
    description: "Provides technical troubleshooting",
    conversations: 2105,
    lastModified: new Date().toISOString(),
    averageRating: 4.9,
    knowledgeSources: [
      { id: 4, name: "Technical Manual", type: "document", icon: "FileText", hasError: false },
      { id: 5, name: "Troubleshooting Guide", type: "document", icon: "Tool", hasError: false }
    ],
    model: "anthropic",
    isDeployed: true,
    systemPrompt: "You are a technical support specialist. Your goal is to help users troubleshoot and resolve technical issues with our products. Be precise, thorough, and explain technical concepts clearly."
  }
];

const AgentTest = () => {
  const { agentId } = useParams();
  const { toast } = useToast();
  
  // State for agent selection and details
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agentId || "1");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  
  // State for model comparison
  const [compareMode, setCompareMode] = useState(false);
  const [primaryModel, setPrimaryModel] = useState<string>("gpt4");
  const [secondaryModel, setSecondaryModel] = useState<string>("gemini");
  
  // State for chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // State for system prompt
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  
  // Chat appearance settings
  const chatAppearance = {
    primaryColor: '#9b87f5',
    chatBubbleUserColor: '#9b87f5',
    chatBubbleAgentColor: '#F1F0FB',
    chatBubbleAgent2Color: '#E6F7FF',
    chatFontSize: 'medium',
    agentNameDisplay: true,
    timestampDisplay: true,
    roundedBubbles: true,
    headerColor: '#9b87f5',
  };

  // Load agent data
  useEffect(() => {
    // In a real app, this would be an API call
    const foundAgent = mockAgents.find(a => a.id === selectedAgentId);
    if (foundAgent) {
      setAgent(foundAgent);
      setSystemPrompt(foundAgent.systemPrompt || "");
      
      // Initialize chat with welcome message
      setMessages([{
        id: 1,
        content: `Hello! I'm the ${foundAgent.name}. How can I help you today?`,
        sender: 'agent',
        model: foundAgent.model,
        timestamp: new Date(),
      }]);
    }
  }, [selectedAgentId]);

  const handleAgentChange = (newAgentId: string) => {
    setSelectedAgentId(newAgentId);
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
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    
    // Simulate agent response(s) after a short delay
    setTimeout(() => {
      let responseContent = "I understand your question. Based on our product documentation, the feature you're looking for can be found in the Settings menu under 'Advanced Options'. Would you like me to guide you through the setup process?";
      
      if (inputMessage.toLowerCase().includes('pricing')) {
        responseContent = "Our pricing plans start at $9.99/month for the Basic plan, which includes up to 5 users. The Pro plan is $29.99/month with unlimited users and premium features. Would you like me to send you a detailed comparison?";
      } else if (inputMessage.toLowerCase().includes('refund') || inputMessage.toLowerCase().includes('return')) {
        responseContent = "Our refund policy allows returns within 30 days of purchase. To process a refund, please provide your order number and reason for the return. I'd be happy to help you with the process.";
      }
      
      // Primary model response
      const agentMessage: Message = {
        id: messages.length + 2,
        content: responseContent,
        sender: 'agent',
        model: primaryModel,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // If compare mode is on, add second model response
      if (compareMode) {
        setTimeout(() => {
          // Simulate a slightly different response from the second model
          let secondResponseContent = responseContent;
          
          if (secondaryModel === 'gemini' && primaryModel !== 'gemini') {
            secondResponseContent = "Based on my analysis, the feature you're looking for is in the Settings section under 'Advanced Options'. I can walk you through how to set it up if you'd like more assistance.";
            
            if (inputMessage.toLowerCase().includes('pricing')) {
              secondResponseContent = "We offer two main pricing tiers: Basic at $9.99/month (supports 5 users) and Pro at $29.99/month (unlimited users with premium features). Would you like to see a detailed breakdown of what's included in each plan?";
            } else if (inputMessage.toLowerCase().includes('refund') || inputMessage.toLowerCase().includes('return')) {
              secondResponseContent = "According to our return policy, you can request a refund within 30 days of your purchase. To initiate the process, I'll need your order number and the reason for your return. I'm here to help make this as smooth as possible.";
            }
          }
          
          const secondAgentMessage: Message = {
            id: messages.length + 3,
            content: secondResponseContent,
            sender: 'agent2',
            model: secondaryModel,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, secondAgentMessage]);
        }, 1000);
      }
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    // Keep just the welcome message
    if (agent) {
      setMessages([{
        id: 1,
        content: `Hello! I'm the ${agent.name}. How can I help you today?`,
        sender: 'agent',
        model: primaryModel,
        timestamp: new Date(),
      }]);

      if (compareMode) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 2,
            content: `Hi there! I'm the ${agent.name} powered by ${MODELS[secondaryModel as keyof typeof MODELS]?.name}. How may I assist you today?`,
            sender: 'agent2',
            model: secondaryModel,
            timestamp: new Date(),
          }]);
        }, 500);
      }
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    
    // Reset chat when toggling compare mode
    handleClearChat();
  };

  const handleUpdateSystemPrompt = () => {
    toast({
      title: "System prompt updated",
      description: "The AI will use this prompt for future messages.",
    });
  };

  if (!agent) {
    return <div className="p-8 text-center">Loading agent information...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/agents">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Test Agent</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleCompareMode}
            className={cn(
              "flex items-center gap-1",
              compareMode && "bg-primary/10"
            )}
          >
            <SplitSquareVertical className="h-4 w-4 mr-1" />
            {compareMode ? "Disable Comparison" : "Compare Models"}
          </Button>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Agent Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-select">Select Agent</Label>
                <Select 
                  value={selectedAgentId} 
                  onValueChange={handleAgentChange}
                >
                  <SelectTrigger id="agent-select">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <Badge className="bg-green-100 text-green-800 mt-1">Active</Badge>
                  </div>
                </div>
                
                <div className="mt-3 space-y-2 text-sm">
                  <div className="space-y-1">
                    {compareMode ? (
                      <>
                        <Label htmlFor="primary-model">Primary Model</Label>
                        <Select 
                          value={primaryModel} 
                          onValueChange={setPrimaryModel}
                        >
                          <SelectTrigger id="primary-model">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(MODELS).map(([key, model]) => (
                              <SelectItem key={key} value={key}>
                                {model.name} ({model.provider})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="mt-2">
                          <Label htmlFor="secondary-model">Secondary Model</Label>
                          <Select 
                            value={secondaryModel} 
                            onValueChange={setSecondaryModel}
                          >
                            <SelectTrigger id="secondary-model">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(MODELS).map(([key, model]) => (
                                <SelectItem key={key} value={key}>
                                  {model.name} ({model.provider})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Current Model:</p>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {MODELS[primaryModel as keyof typeof MODELS]?.name || agent.model}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 mt-3">
                    <p className="text-muted-foreground">Knowledge Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.knowledgeSources.map(source => (
                        <Badge key={source.id} variant="outline">{source.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-prompt-toggle">System Prompt</Label>
                  <Switch 
                    id="system-prompt-toggle" 
                    checked={showSystemPrompt}
                    onCheckedChange={setShowSystemPrompt}
                  />
                </div>
                
                {showSystemPrompt && (
                  <div className="mt-2 space-y-2">
                    <Textarea 
                      value={systemPrompt} 
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Enter system prompt..."
                      className="h-32 text-sm font-mono"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleUpdateSystemPrompt}
                      className="w-full"
                    >
                      Update System Prompt
                    </Button>
                  </div>
                )}
              </div>
              
              <Separator />
              
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
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <span className="mr-2">🎮</span> Custom Scenario
                </Button>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleClearChat}
              >
                <Repeat className="h-4 w-4 mr-2" />
                Reset Conversation
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="flex flex-col h-[600px] overflow-hidden border-0 shadow-lg">
            {/* Chat Header */}
            <div 
              className="p-4 flex items-center justify-between" 
              style={{ backgroundColor: chatAppearance.headerColor }}
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{agent.name}</h3>
                  {compareMode && (
                    <div className="flex items-center mt-0.5">
                      <Badge variant="secondary" className="text-xs bg-white/20 text-white border-none">
                        Comparison Mode
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                  <Dices className="h-4 w-4" />
                </Button>
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
              {messages.map((message) => {
                // Different styling based on sender and model
                let backgroundColor;
                let textColor = 'text-gray-800';
                let borderRadius;
                
                if (message.sender === 'user') {
                  backgroundColor = chatAppearance.chatBubbleUserColor;
                  textColor = 'text-white';
                  borderRadius = chatAppearance.roundedBubbles ? '1rem 1rem 0 1rem' : '0.25rem';
                } else if (message.sender === 'agent') {
                  backgroundColor = 'white';
                  borderRadius = chatAppearance.roundedBubbles ? '1rem 1rem 1rem 0' : '0.25rem';
                } else if (message.sender === 'agent2') {
                  backgroundColor = chatAppearance.chatBubbleAgent2Color;
                  borderRadius = chatAppearance.roundedBubbles ? '1rem 1rem 1rem 0' : '0.25rem';
                }
                
                return (
                  <div 
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender !== 'user' && (
                      <div className="h-8 w-8 rounded-full mr-2 flex-shrink-0 bg-purple-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div 
                      className={cn(
                        "max-w-[80%] p-3 border border-gray-200",
                        message.sender === 'user' ? "rounded-t-lg rounded-bl-lg" : "rounded-t-lg rounded-br-lg"
                      )}
                      style={{
                        backgroundColor,
                        borderRadius,
                        fontSize: chatAppearance.chatFontSize === 'small' ? '0.875rem' : 
                                 chatAppearance.chatFontSize === 'large' ? '1.125rem' : '1rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      {compareMode && message.sender !== 'user' && (
                        <div className="flex items-center mb-1 pb-1 border-b border-gray-200">
                          <Badge variant="outline" className="text-xs">
                            {MODELS[message.model as keyof typeof MODELS]?.name || 'AI Model'}
                          </Badge>
                        </div>
                      )}
                      <p className={textColor}>
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
                    {message.sender === 'user' && (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center ml-2 text-xs font-medium flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #e6e9f0, #eef1f5)',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                      >
                        <User size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
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
              <div className="text-center mt-2 text-xs text-gray-400">
                powered by 7en.ai
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
