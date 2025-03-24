import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Bot, ChevronLeft, SendHorizontal, X, 
  Settings, BookOpen, Code, Globe, Database, Sliders,
  FileText, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AgentKnowledgeSection from '@/components/agents/knowledge/AgentKnowledgeSection';
import { mockKnowledgeSources } from '@/data/mockKnowledgeSources';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'agent1' | 'agent2' | 'agent3';
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
  knowledgeSources: { id: number; name: string; type: string; icon?: string; hasError: boolean; content?: string }[];
  model: string;
  isDeployed: boolean;
  systemPrompt?: string;
};

type ChatConfig = {
  model: string;
  temperature: number;
  systemPrompt: string;
  maxLength: number;
};

const MODELS = {
  'gpt4': { name: 'GPT-4', provider: 'OpenAI' },
  'gpt35': { name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  'anthropic': { name: 'Claude 3', provider: 'Anthropic' },
  'mistral': { name: 'Mistral 7B', provider: 'Mistral AI' },
  'llama': { name: 'Llama-3.1-70B-Instruct', provider: 'Meta AI' },
  'gemini': { name: 'Gemini Pro', provider: 'Google' },
  'mixtral': { name: 'Mixtral 8x7B', provider: 'Mistral AI' },
  'deepseek': { name: 'DeepSeek-R1', provider: 'DeepSeek' }
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
  
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>([
    { model: "llama", temperature: 0.6, systemPrompt: "", maxLength: 512 },
    { model: "deepseek", temperature: 0.7, systemPrompt: "", maxLength: 512 },
    { model: "anthropic", temperature: 0.7, systemPrompt: "", maxLength: 512 }
  ]);

  const [numModels, setNumModels] = useState(3);
  
  const [messages, setMessages] = useState<Message[][]>([[], [], []]);
  const [inputMessage, setInputMessage] = useState('');
  
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [selectedSourceContent, setSelectedSourceContent] = useState<string>("");
  const [sourceViewMode, setSourceViewMode] = useState<'markdown' | 'text'>('markdown');
  const [showKnowledgeFlyout, setShowKnowledgeFlyout] = useState(false);
  const [isKnowledgePopoverOpen, setIsKnowledgePopoverOpen] = useState(false);

  const messageContainerRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    const foundAgent = mockAgents.find(a => a.id === selectedAgentId);
    if (foundAgent) {
      setAgent(foundAgent);
      
      setChatConfigs(prev => prev.map(config => ({
        ...config,
        systemPrompt: foundAgent.systemPrompt || ""
      })));
      
      // Clear message history when changing agent
      setMessages(Array(numModels).fill(null).map(() => []));
    }
  }, [selectedAgentId]);

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
    
    // Add user message to all model message arrays
    setMessages(prev => prev.map(msgArray => [...msgArray, userMessage]));
    setInputMessage('');
    
    // Generate AI response for each model
    for (let i = 0; i < numModels; i++) {
      setTimeout(() => {
        let responseContent = "";
        
        // Generate different responses based on the model
        if (chatConfigs[i].model === "llama") {
          responseContent = "It seems like you might have entered 'CV,' which can refer to a few things, such as 'Curriculum Vitae,' a document detailing your education, work experience, and skills.\n\nIf you're looking for information on how to create a CV, I'd be happy to provide guidance. Alternatively, if 'CV' stands for something else in your context, please provide more details so I can offer a more relevant response.";
        } else if (chatConfigs[i].model === "deepseek") {
          responseContent = "Hello! It looks like you're referring to \"CV,\" which can have multiple meanings depending on the context. Here are a few common interpretations:\n\n1. Curriculum Vitae (CV):\n   • A detailed document highlighting your academic and professional history\n   • Need help crafting or reviewing a CV? Let me know!\n\n2. Computer Vision (CV):\n   • A field of artificial intelligence (AI) focused on enabling machines to interpret and analyze visual data (images, videos). Applications include facial recognition, object detection, and autonomous vehicles.\n   • Are you working on a computer vision project?\n\n3. Coefficient of Variation (CV):\n   • A statistical measure of data dispersion, calculated as the ratio of the standard deviation to the mean. It's often used to compare variability across datasets.\n   • Need help with statistics or data analysis?\n\n4. Cyclonic Vortex (CV):\n   • A meteorological term related to weather systems.";
        } else {
          responseContent = "CV could refer to:\n\n- Curriculum Vitae: A comprehensive document outlining your professional and academic history\n- Computer Vision: A field of AI that enables computers to derive meaningful information from digital images\n- Coefficient of Variation: A statistical measure\n\nCould you please specify which meaning of CV you're referring to so I can better assist you?";
        }
        
        // Modify response based on temperature
        if (chatConfigs[i].temperature > 0.8) {
          responseContent += " By the way, is there anything else you'd like to know about these topics?";
        } else if (chatConfigs[i].temperature < 0.4) {
          responseContent = responseContent.split('. ').join('.\n\n');
        }
        
        // Adjust length based on maxLength
        if (chatConfigs[i].maxLength < 400 && responseContent.length > chatConfigs[i].maxLength) {
          responseContent = responseContent.substring(0, chatConfigs[i].maxLength) + "...";
        }
        
        const senderType = `agent${i+1}` as 'agent1' | 'agent2' | 'agent3';
        
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
        
        // Scroll to bottom after new message
        setTimeout(() => {
          if (messageContainerRefs[i]?.current) {
            messageContainerRefs[i].current!.scrollTop = messageContainerRefs[i].current!.scrollHeight;
          }
        }, 100);
      }, 1000 + (i * 500)); // Staggered responses
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages(Array(numModels).fill(null).map(() => []));
    toast({
      title: "Chat cleared",
      description: "All messages have been cleared.",
    });
  };

  const handleViewSource = (sourceId: number) => {
    const source = agent?.knowledgeSources.find(s => s.id === sourceId);
    if (source && source.content) {
      setSelectedSourceId(sourceId);
      setSelectedSourceContent(source.content);
    }
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
          <h1 className="text-2xl font-bold">Model Comparison Lab</h1>
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
          
          <Popover open={isKnowledgePopoverOpen} onOpenChange={setIsKnowledgePopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="link" 
                size="sm" 
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => setIsKnowledgePopoverOpen(true)}
              >
                Knowledge
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <AgentKnowledgeSection 
                agentId={agentId || '1'} 
                knowledgeSources={mockKnowledgeSources} 
                asFlyout={true} 
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearChat}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(numModels).fill(null).map((_, index) => (
          <Card key={`model-${index}`} className="flex flex-col h-[650px] overflow-hidden">
            <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Select 
                  value={chatConfigs[index].model} 
                  onValueChange={(value) => handleUpdateChatConfig(index, 'model', value)}
                >
                  <SelectTrigger className="w-[190px] h-8">
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
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Sliders className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Parameters</h3>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label>Temperature</Label>
                          <span className="text-sm text-muted-foreground">{chatConfigs[index].temperature.toFixed(1)}</span>
                        </div>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={[chatConfigs[index].temperature]}
                          onValueChange={([value]) => handleUpdateChatConfig(index, 'temperature', value)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Precise</span>
                          <span>Creative</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label>Output length</Label>
                          <span className="text-sm text-muted-foreground">{chatConfigs[index].maxLength}</span>
                        </div>
                        <Slider
                          min={128}
                          max={2048}
                          step={128}
                          value={[chatConfigs[index].maxLength]}
                          onValueChange={([value]) => handleUpdateChatConfig(index, 'maxLength', value)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Short</span>
                          <span>Long</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label>System Prompt</Label>
                        <Textarea 
                          value={chatConfigs[index].systemPrompt} 
                          onChange={(e) => handleUpdateChatConfig(index, 'systemPrompt', e.target.value)}
                          className="min-h-[100px] resize-none text-sm"
                          placeholder="Enter system instructions for the AI..."
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
                        
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" ref={messageContainerRefs[index]}>
              {messages[index].map((message) => {
                if (message.sender === 'user') {
                  return (
                    <div key={message.id} className="flex justify-end mb-4">
                      <div className="bg-primary text-primary-foreground rounded-lg py-2 px-3 max-w-[90%]">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={message.id} className="flex mb-4">
                      <div className="bg-muted rounded-lg py-2 px-3 max-w-[90%]">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  );
                }
              })}
              {messages[index].length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500 p-4">
                    <Bot className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">Send a message to see responses from this model</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-0 w-full mt-2">
        <div className="flex items-center">
          <Input
            placeholder="Enter a message to compare AI responses..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            className="ml-2"
          >
            <SendHorizontal className="h-4 w-4 mr-2" />
            Submit
          </Button>
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
    </div>
  );

  function getSourceIcon(type: string) {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'webpage':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'database':
        return <Database className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  }
};

export default AgentTest;
