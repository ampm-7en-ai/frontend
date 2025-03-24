import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Bot, ChevronLeft, Circle, SendHorizontal, Zap, Rocket, X, Maximize2, 
  Repeat, SplitSquareVertical, Languages, Settings, ExternalLink, Dices, User,
  ChevronDown, ChevronUp, FileCog, FileText, BookOpen, Code, FileJson, Globe, Database
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'agent' | 'agent2' | 'agent3';
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
  knowledgeSources: { id: number; name: string; type: string; icon: string; hasError: boolean; content?: string }[];
  model: string;
  isDeployed: boolean;
  systemPrompt?: string;
};

type ChatConfig = {
  model: string;
  temperature: number;
  systemPrompt: string;
  maxTokens: number
};

const MODELS = {
  'gpt4': { name: 'GPT-4', provider: 'OpenAI' },
  'gpt35': { name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  'anthropic': { name: 'Claude 3', provider: 'Anthropic' },
  'mistral': { name: 'Mistral 7B', provider: 'Mistral AI' },
  'llama': { name: 'Llama 2', provider: 'Meta AI' },
  'gemini': { name: 'Gemini Pro', provider: 'Google' },
  'mixtral': { name: 'Mixtral 8x7B', provider: 'Mistral AI' },
  'palm': { name: 'PaLM 2', provider: 'Google' }
};

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Customer Support Agent",
    description: "Helps with product questions and customer service inquiries",
    conversations: 1234,
    lastModified: new Date().toISOString(),
    averageRating: 4.8,
    knowledgeSources: [
      { id: 1, name: "Product Docs", type: "document", icon: "BookOpen", hasError: false, 
        content: "# Product Documentation\n\nOur product is a cloud-based solution that helps businesses automate customer support workflows. Key features include:\n\n- AI-powered response suggestions\n- Integration with popular CRM systems\n- Analytics dashboard\n- Multi-channel support (email, chat, social media)" },
      { id: 2, name: "FAQ", type: "webpage", icon: "Globe", hasError: false,
        content: "## Frequently Asked Questions\n\n**Q: How do I reset my password?**\nA: Click on the 'Forgot Password' link on the login page and follow the instructions sent to your email.\n\n**Q: How do I upgrade my subscription?**\nA: Go to Settings > Billing and select your desired plan.\n\n**Q: Can I integrate with Salesforce?**\nA: Yes, we offer native integration with Salesforce and other popular CRM systems." }
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
      { id: 3, name: "Pricing Guide", type: "document", icon: "DollarSign", hasError: false,
        content: "# Pricing Guide\n\n## Basic Plan - $9.99/month\n- Up to 5 users\n- Core features\n- Email support\n\n## Pro Plan - $29.99/month\n- Unlimited users\n- All core features plus advanced analytics\n- Priority email & chat support\n- API access\n\n## Enterprise Plan - Custom pricing\n- All Pro features\n- Dedicated account manager\n- Custom integrations\n- 24/7 phone support" }
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
      { id: 4, name: "Technical Manual", type: "document", icon: "FileText", hasError: false,
        content: "# Technical Manual\n\n## System Requirements\n- Operating System: Windows 10/11, macOS 10.14+, Linux\n- RAM: 8GB minimum, 16GB recommended\n- Disk Space: 250MB\n- Internet: Broadband connection\n\n## Installation Guide\n1. Download the installer from your account dashboard\n2. Run the installer and follow on-screen instructions\n3. Launch the application and sign in with your credentials" },
      { id: 5, name: "Troubleshooting Guide", type: "document", icon: "Tool", hasError: false,
        content: "# Troubleshooting Guide\n\n## Common Issues\n\n### Application Won't Start\n- Verify system requirements\n- Check for conflicting software\n- Try reinstalling the application\n\n### Connection Problems\n- Check your internet connection\n- Verify firewall settings\n- Ensure the server is not down for maintenance" }
    ],
    model: "anthropic",
    isDeployed: true,
    systemPrompt: "You are a technical support specialist. Your goal is to help users troubleshoot and resolve technical issues with our products. Be precise, thorough, and explain technical concepts clearly."
  }
];

const AgentTest = () => {
  const { agentId } = useParams();
  const { toast } = useToast();
  
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agentId || "1");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>([
    { model: "gpt4", temperature: 0.7, systemPrompt: "", maxTokens: 500 },
    { model: "gemini", temperature: 0.7, systemPrompt: "", maxTokens: 500 }
  ]);

  const [compareMode, setCompareMode] = useState(false);
  const [numChatWindows, setNumChatWindows] = useState(1);
  
  const [messages, setMessages] = useState<Message[][]>([[]]);
  const [inputMessage, setInputMessage] = useState('');
  
  const [configPanelExpanded, setConfigPanelExpanded] = useState(true);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [selectedSourceContent, setSelectedSourceContent] = useState<string>("");
  const [sourceViewMode, setSourceViewMode] = useState<'markdown' | 'text'>('markdown');

  useEffect(() => {
    const foundAgent = mockAgents.find(a => a.id === selectedAgentId);
    if (foundAgent) {
      setAgent(foundAgent);
      
      setChatConfigs(prev => prev.map(config => ({
        ...config,
        systemPrompt: foundAgent.systemPrompt || ""
      })));
      
      const initialMessages: Message[][] = Array(numChatWindows).fill(null).map(() => [{
        id: 1,
        content: `Hello! I'm the ${foundAgent.name}. How can I help you today?`,
        sender: 'agent' as const,
        model: chatConfigs[0].model,
        timestamp: new Date(),
      }]);
      
      setMessages(initialMessages);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    if (compareMode) {
      setNumChatWindows(2);
      
      if (messages.length === 1) {
        const updatedMessages = [
          [...messages[0]],
          [...messages[0]]
        ];
        setMessages(updatedMessages);
      }
    } else {
      setNumChatWindows(1);
      if (messages.length > 1) {
        setMessages([messages[0]]);
      }
    }
  }, [compareMode]);

  useEffect(() => {
    setChatConfigs(prev => {
      if (prev.length < numChatWindows) {
        return [
          ...prev,
          ...Array(numChatWindows - prev.length).fill(null).map(() => ({
            model: "gemini",
            temperature: 0.7,
            systemPrompt: agent?.systemPrompt || "",
            maxTokens: 500
          }))
        ];
      }
      if (prev.length > numChatWindows) {
        return prev.slice(0, numChatWindows);
      }
      return prev;
    });
  }, [numChatWindows, agent]);

  const handleAgentChange = (newAgentId: string) => {
    setSelectedAgentId(newAgentId);
  };

  const handleUpdateChatConfig = (index: number, field: keyof ChatConfig, value: any) => {
    setChatConfigs(prev => {
      const newConfigs = [...prev];
      newConfigs[index] = {
        ...newConfigs[index],
        [field]: value
      };
      return newConfigs;
    });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    const userMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => prev.map(msgArray => [...msgArray, userMessage]));
    setInputMessage('');
    
    for (let i = 0; i < numChatWindows; i++) {
      setTimeout(() => {
        let responseContent = "I understand your question. Based on our product documentation, the feature you're looking for can be found in the Settings menu under 'Advanced Options'. Would you like me to guide you through the setup process?";
        
        if (inputMessage.toLowerCase().includes('pricing')) {
          responseContent = "Our pricing plans start at $9.99/month for the Basic plan, which includes up to 5 users. The Pro plan is $29.99/month with unlimited users and premium features. Would you like me to send you a detailed comparison?";
        } else if (inputMessage.toLowerCase().includes('refund') || inputMessage.toLowerCase().includes('return')) {
          responseContent = "Our refund policy allows returns within 30 days of purchase. To process a refund, please provide your order number and reason for the return. I'd be happy to help you with the process.";
        }
        
        if (chatConfigs[i].model === 'gemini' || chatConfigs[i].model === 'palm') {
          responseContent = responseContent.replace("I understand", "I've analyzed");
          responseContent = responseContent.replace("Would you like me to", "I can");
        }
        
        if (chatConfigs[i].temperature > 0.8) {
          responseContent += " By the way, is there anything else you'd like to know about our services?";
        } else if (chatConfigs[i].temperature < 0.4) {
          responseContent = responseContent.split('. ').join('.\n\n');
        }
        
        const senderType: 'agent' | 'agent2' | 'agent3' = 
          i === 0 ? 'agent' : i === 1 ? 'agent2' : 'agent3';
        
        const agentMessage: Message = {
          id: Date.now() + i + 1,
          content: responseContent,
          sender: senderType,
          model: chatConfigs[i].model,
          timestamp: new Date(),
        };
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[i] = [...newMessages[i], agentMessage];
          return newMessages;
        });
      }, 1000 + (i * 500));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (agent) {
      const initialMessages: Message[][] = Array(numChatWindows).fill(null).map((_, i) => {
        const senderType: 'agent' | 'agent2' | 'agent3' = 
          i === 0 ? 'agent' : i === 1 ? 'agent2' : 'agent3';
          
        return [{
          id: Date.now() + i,
          content: `Hello! I'm the ${agent.name}. How can I help you today?`,
          sender: senderType,
          model: chatConfigs[i].model,
          timestamp: new Date(),
        }];
      });
      
      setMessages(initialMessages);
    }
  };

  const toggleCompareMode = () => {
    const newCompareMode = !compareMode;
    setCompareMode(newCompareMode);
    
    if (newCompareMode) {
      toast({
        title: "Compare Mode Enabled",
        description: "You can now test your agent with two different models side by side.",
      });
    }
  };

  const handleViewSource = (sourceId: number) => {
    const source = agent?.knowledgeSources.find(s => s.id === sourceId);
    if (source && source.content) {
      setSelectedSourceId(sourceId);
      setSelectedSourceContent(source.content);
    }
  };

  const toggleConfigPanel = () => {
    setConfigPanelExpanded(!configPanelExpanded);
  };

  const getModelDisplay = (modelKey: string) => {
    return MODELS[modelKey as keyof typeof MODELS]?.name || modelKey;
  };

  const getProviderDisplay = (modelKey: string) => {
    return MODELS[modelKey as keyof typeof MODELS]?.provider || 'Unknown';
  };

  if (!agent) {
    return <div className="p-8 text-center">Loading agent information...</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/agents">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Agent Testing Lab</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={selectedAgentId} 
            onValueChange={handleAgentChange}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {mockAgents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center">
                    <Bot className="mr-2 h-4 w-4 text-primary" />
                    {agent.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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

      <Card className="mb-4">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{agent.name}</h2>
                <p className="text-muted-foreground text-sm">{agent.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {agent.knowledgeSources.length} Knowledge Sources
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {agent.conversations} Conversations
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Collapsible 
          open={configPanelExpanded} 
          onOpenChange={setConfigPanelExpanded}
          className="lg:w-[320px] xl:w-[350px] flex-shrink-0"
        >
          <Card className="flex flex-col h-full border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Testing Configuration</CardTitle>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    {configPanelExpanded ? <ChevronLeft className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            
            <CollapsibleContent>
              <CardContent className="px-4 py-2 space-y-4">
                {compareMode && (
                  <Tabs defaultValue="model1" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="model1" className="flex-1">Model 1</TabsTrigger>
                      <TabsTrigger value="model2" className="flex-1">Model 2</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="model1" className="mt-2 space-y-4">
                      {renderModelConfig(0)}
                    </TabsContent>
                    
                    <TabsContent value="model2" className="mt-2 space-y-4">
                      {renderModelConfig(1)}
                    </TabsContent>
                  </Tabs>
                )}
                
                {!compareMode && renderModelConfig(0)}
                
                <div className="space-y-2 mt-4">
                  <Label>Knowledge Sources</Label>
                  <div className="bg-gray-50 rounded-md p-2 space-y-1 max-h-[200px] overflow-y-auto">
                    {agent.knowledgeSources.map(source => (
                      <div 
                        key={source.id}
                        className="flex items-center justify-between p-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleViewSource(source.id)}
                      >
                        <div className="flex items-center">
                          {getSourceIcon(source.type)}
                          <span className="ml-2">{source.name}</span>
                        </div>
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Quick Test Scenarios</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <span className="mr-2">🛒</span> Product Question
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <span className="mr-2">💰</span> Pricing Question
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <span className="mr-2">🔙</span> Return Policy
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <span className="mr-2">🎮</span> Custom Scenario
                    </Button>
                  </div>
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
            </CollapsibleContent>
          </Card>
        </Collapsible>
        
        <div className={`grid ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4 flex-1`}>
          {Array(numChatWindows).fill(null).map((_, index) => (
            <Card key={`chat-${index}`} className="flex flex-col h-[600px] overflow-hidden border shadow-lg">
              <div 
                className="p-3 flex items-center justify-between" 
                style={{ backgroundColor: index === 0 ? '#9b87f5' : index === 1 ? '#7bbfff' : '#f59b87' }}
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{agent.name}</h3>
                    <div className="flex items-center mt-0.5">
                      <Badge variant="secondary" className="text-xs bg-white/20 text-white border-none">
                        {getModelDisplay(chatConfigs[index].model)} ({getProviderDisplay(chatConfigs[index].model)})
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => console.log("Export chat")}>
                        Export Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleClearChat}>
                        Clear Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages[index]?.map((message) => {
                  let backgroundColor;
                  let textColor = 'text-gray-800';
                  let borderRadius = '0.75rem';
                  
                  if (message.sender === 'user') {
                    backgroundColor = '#9b87f5';
                    textColor = 'text-white';
                    borderRadius = '1rem 1rem 0 1rem';
                  } else if (message.sender === 'agent') {
                    backgroundColor = 'white';
                    borderRadius = '1rem 1rem 1rem 0';
                  } else if (message.sender === 'agent2') {
                    backgroundColor = '#F0F7FF';
                    borderRadius = '1rem 1rem 1rem 0';
                  } else if (message.sender === 'agent3') {
                    backgroundColor = '#FFF7F0';
                    borderRadius = '1rem 1rem 1rem 0';
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
                        className="max-w-[80%] p-3 border border-gray-200 shadow-sm"
                        style={{
                          backgroundColor,
                          borderRadius,
                          fontSize: '1rem',
                        }}
                      >
                        {message.model && message.sender !== 'user' && (
                          <div className="flex items-center mb-1 pb-1 border-b border-gray-200">
                            <Badge variant="outline" className="text-xs">
                              {getModelDisplay(message.model)}
                            </Badge>
                          </div>
                        )}
                        <p className={textColor} style={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </p>
                        <div className={cn(
                          "text-xs mt-1",
                          message.sender === 'user' ? "text-white/80" : "text-gray-500"
                        )}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
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
                    style={{ backgroundColor: index === 0 ? '#9b87f5' : index === 1 ? '#7bbfff' : '#f59b87' }}
                  >
                    <SendHorizontal className="h-5 w-5 text-white" />
                  </Button>
                </div>
                <div className="text-center mt-2 text-xs text-gray-400">
                  powered by 7en.ai
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={selectedSourceId !== null} onOpenChange={(open) => !open && setSelectedSourceId(null)}>
        <DialogContent className="max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                {selectedSourceId && 
                  getSourceIcon(agent.knowledgeSources.find(s => s.id === selectedSourceId)?.type || 'document')}
                <span className="ml-2">
                  {selectedSourceId && 
                    agent.knowledgeSources.find(s => s.id === selectedSourceId)?.name}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sourceViewMode === 'markdown' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceViewMode('markdown')}
                  className="h-8"
                >
                  <Code className="h-4 w-4 mr-1" />
                  Markdown
                </Button>
                <Button
                  variant={sourceViewMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceViewMode('text')}
                  className="h-8"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Text
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto mt-2 p-4 bg-gray-50 rounded-md font-mono text-sm">
            {sourceViewMode === 'markdown' ? (
              <div className="prose max-w-none dark:prose-invert">
                {selectedSourceContent.split('\n').map((line, index) => (
                  <div key={index}>
                    {line.startsWith('# ') ? (
                      <h1>{line.substring(2)}</h1>
                    ) : line.startsWith('## ') ? (
                      <h2>{line.substring(3)}</h2>
                    ) : line.startsWith('### ') ? (
                      <h3>{line.substring(4)}</h3>
                    ) : line.startsWith('- ') ? (
                      <ul className="my-1"><li>{line.substring(2)}</li></ul>
                    ) : line.trim() === '' ? (
                      <br />
                    ) : (
                      <p className="my-1">{line}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{selectedSourceContent}</pre>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeploymentDialog 
        open={deploymentDialogOpen} 
        onOpenChange={setDeploymentDialogOpen} 
        agent={agent} 
      />
    </div>
  );

  function renderModelConfig(index: number) {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor={`model-${index}`}>AI Model</Label>
          <Select 
            value={chatConfigs[index].model} 
            onValueChange={(value) => handleUpdateChatConfig(index, 'model', value)}
          >
            <SelectTrigger id={`model-${index}`}>
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
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor={`temperature-${index}`}>Temperature: {chatConfigs[index].temperature.toFixed(1)}</Label>
          </div>
          <Slider
            id={`temperature-${index}`}
            min={0}
            max={1}
            step={0.1}
            value={[chatConfigs[index].temperature]}
            onValueChange={([value]) => handleUpdateChatConfig(index, 'temperature', value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor={`max-tokens-${index}`}>Max Output Length: {chatConfigs[index].maxTokens}</Label>
          <Slider
            id={`max-tokens-${index}`}
            min={100}
            max={2000}
            step={100}
            value={[chatConfigs[index].maxTokens]}
            onValueChange={([value]) => handleUpdateChatConfig(index, 'maxTokens', value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Short</span>
            <span>Medium</span>
            <span>Long</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor={`system-prompt-${index}`}>System Prompt</Label>
          <Textarea 
            id={`system-prompt-${index}`}
            value={chatConfigs[index].systemPrompt} 
            onChange={(e) => handleUpdateChatConfig(index, 'systemPrompt', e.target.value)}
            className="h-20 text-sm font-mono"
            placeholder="Enter system instructions for the AI..."
          />
        </div>
      </div>
    );
  }

  function getSourceIcon(type: string) {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'webpage':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'database':
        return <Database className="h-4 w-4 text-purple-500" />;
      case 'api':
        return <Code className="h-4 w-4 text-orange-500" />;
      case 'json':
        return <FileJson className="h-4 w-4 text-yellow-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  }
};

export default AgentTest;


