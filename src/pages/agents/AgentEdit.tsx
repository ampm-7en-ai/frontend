import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Settings, Palette, FileText, Book, RefreshCw, BrainCircuit, AlertTriangle, Sliders, CpuIcon, Save, Send, Upload, UserRound, ExternalLink, Smartphone, Slack, Instagram } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogBody } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const knowledgeSources = [
  { id: 1, name: 'Product Documentation', type: 'document', size: '2.4 MB', lastUpdated: '2023-12-15' },
  { id: 2, name: 'FAQs', type: 'webpage', size: '0.8 MB', lastUpdated: '2023-12-20' },
  { id: 3, name: 'Customer Support Guidelines', type: 'document', size: '1.5 MB', lastUpdated: '2023-12-10' },
  { id: 4, name: 'Pricing Information', type: 'document', size: '0.3 MB', lastUpdated: '2023-12-25' },
];

const agentTypeSystemPrompts = {
  support: "You are a helpful customer support assistant. Your goal is to assist users with their questions and problems related to our products and services. Be friendly, patient, and informative.",
  sales: "You are a knowledgeable sales assistant. Your goal is to help potential customers understand our products, answer their questions, and guide them towards making a purchase decision. Be enthusiastic but not pushy.",
  technical: "You are a technical support specialist. Your goal is to help users troubleshoot and resolve technical issues with our products. Be precise, thorough, and explain technical concepts clearly.",
  custom: ""
};

const predefinedAvatars = [
  {
    id: 'predefined-1',
    src: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=100&h=100'
  },
  {
    id: 'predefined-2',
    src: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=100&h=100'
  },
  {
    id: 'predefined-3',
    src: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=100&h=100'
  }
];

const integrationOptions = [
  { 
    id: 'slack', 
    name: 'Slack', 
    icon: 'slack', 
    description: 'Connect your agent to Slack to provide support in channels and direct messages', 
    connected: false, 
    color: '#4A154B',
    setupInstructions: 'Add this chatbot to your Slack workspace to answer questions in channels or DMs. Your agent will use the same knowledge and settings you configure here.',
    features: ['Answer questions in channels', 'Handle direct messages', 'Access to conversation history']
  },
  { 
    id: 'whatsapp', 
    name: 'WhatsApp', 
    icon: 'whatsapp', 
    description: 'Let your agent respond to WhatsApp messages automatically', 
    connected: false, 
    color: '#25D366',
    setupInstructions: 'Connect your WhatsApp Business account to automatically respond to customer messages using this agent.',
    features: ['Auto-respond to messages', 'Trigger human handoff when needed', 'Use media messaging capabilities']
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: 'instagram', 
    description: 'Connect your agent to Instagram direct messages', 
    connected: false, 
    color: '#E1306C',
    setupInstructions: 'Link your Instagram business account to handle direct message inquiries with this agent.',
    features: ['Answer DM inquiries', 'Schedule responses', 'Tracking and analytics']
  },
  { 
    id: 'website', 
    name: 'Website Widget', 
    icon: 'globe', 
    description: 'Add this agent as a chat widget on your website', 
    connected: true, 
    color: '#0ea5e9',
    setupInstructions: 'Add a JavaScript snippet to your website to display this chatbot to your visitors.',
    features: ['Customize appearance', 'Control display conditions', 'Visitor insights']
  },
  { 
    id: 'api', 
    name: 'API Access', 
    icon: 'code', 
    description: 'Access this agent through our API for custom integrations', 
    connected: false, 
    color: '#64748b',
    setupInstructions: 'Use our API to integrate this agent with custom applications and systems.',
    features: ['RESTful API endpoints', 'Webhook support', 'Custom authentication']
  },
  { 
    id: 'email', 
    name: 'Email', 
    icon: 'mail', 
    description: 'Let your agent handle email inquiries', 
    connected: false, 
    color: '#ea580c',
    setupInstructions: 'Connect an email address that this agent will monitor and respond to automatically.',
    features: ['Auto-respond to emails', 'Smart email routing', 'Attachment handling']
  },
  { 
    id: 'sms', 
    name: 'SMS', 
    icon: 'message-square', 
    description: 'Enable SMS support with your agent', 
    connected: false, 
    color: '#16a34a',
    setupInstructions: 'Connect a phone number to automatically respond to SMS messages using this agent.',
    features: ['Two-way messaging', 'Group messaging support', 'Automated responses']
  },
  { 
    id: 'microsoft', 
    name: 'Microsoft Teams', 
    icon: 'microsoft', 
    description: 'Add your agent to Microsoft Teams channels', 
    connected: false, 
    color: '#4b5cc4',
    setupInstructions: 'Install this agent as a Teams app to provide assistance in channels and chats.',
    features: ['Channel monitoring', 'Direct messaging', 'File sharing capabilities']
  }
];

const AgentEdit = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  const [agent, setAgent] = useState({
    id: agentId,
    name: "Customer Support Agent",
    description: "This agent helps customers with their inquiries and provides support.",
    primaryColor: '#9b87f5',
    secondaryColor: '#ffffff',
    fontFamily: 'Inter',
    chatbotName: 'Business Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    buttonText: 'Chat with us',
    position: 'bottom-right' as 'bottom-right' | 'bottom-left',
    showOnMobile: true,
    collectVisitorData: true,
    autoShowAfter: 30,
    knowledgeSources: [1, 3],
    selectedModel: 'gpt4',
    temperature: 0.7,
    maxResponseLength: 'medium',
    suggestions: [
      'How can I get started?',
      'What features do you offer?',
      'Tell me about your pricing'
    ],
    avatar: {
      type: 'default',
      src: ''
    },
    agentType: 'support',
    systemPrompt: agentTypeSystemPrompts.support
  });
  
  const [isRetraining, setIsRetraining] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [activeIntegrations, setActiveIntegrations] = useState(integrationOptions);
  const [selectedIntegration, setSelectedIntegration] = useState<null | typeof integrationOptions[0]>(null);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [integrationFormData, setIntegrationFormData] = useState({ 
    apiKey: '', 
    webhookUrl: '', 
    accountId: '',
    phoneNumber: '', 
    email: '',
    botUsername: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleChange = (name: string, value: any) => {
    setAgent({
      ...agent,
      [name]: value
    });
  };

  const handleSuggestionChange = (index: number, value: string) => {
    const updatedSuggestions = [...agent.suggestions];
    updatedSuggestions[index] = value;
    handleChange('suggestions', updatedSuggestions);
  };

  const toggleKnowledgeSource = (id: number) => {
    const currentSources = [...agent.knowledgeSources];
    if (currentSources.includes(id)) {
      handleChange('knowledgeSources', currentSources.filter(sourceId => sourceId !== id));
    } else {
      handleChange('knowledgeSources', [...currentSources, id]);
    }
  };
  
  const handleRetrainAI = () => {
    setIsRetraining(true);
    
    setTimeout(() => {
      setIsRetraining(false);
      toast({
        title: "AI retrained successfully",
        description: "Your agent has been updated with the selected knowledge sources.",
      });
    }, 2000);
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes saved",
      description: "Your agent settings have been updated successfully.",
    });
  };

  const goBack = () => {
    navigate('/agents');
  };
  
  const goToTestPage = () => {
    window.open(`/agents/${agentId}/test`, '_blank');
  };

  const handleAgentTypeChange = (type: string) => {
    const systemPrompt = type === 'custom' ? agent.systemPrompt : agentTypeSystemPrompts[type as keyof typeof agentTypeSystemPrompts];
    setAgent({
      ...agent,
      agentType: type,
      systemPrompt
    });
  };

  const handleKnowledgeSourcesChange = (selectedSourceIds: number[]) => {
    handleChange('knowledgeSources', selectedSourceIds);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setNewMessage('');
    
    toast({
      title: "Message sent",
      description: "Your message has been sent.",
    });
  };

  const handleAvatarChange = (type: 'default' | 'predefined' | 'custom', src: string = '') => {
    setAgent({
      ...agent,
      avatar: { type, src }
    });
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setCustomAvatarFile(file);
    handleAvatarChange('custom', objectUrl);

    toast({
      title: "Avatar uploaded",
      description: "Your custom avatar has been uploaded.",
    });
  };

  const renderGeneralContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>Agent Information</CardTitle>
        <CardDescription>Basic information about your agent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="agent-name">Agent Name</Label>
          <Input 
            id="agent-name" 
            value={agent.name} 
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Customer Support Agent" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="agent-description">Description</Label>
          <Textarea 
            id="agent-description" 
            value={agent.description} 
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what this agent does" 
            className="min-h-[120px]"
          />
        </div>
        
        <div className="space-y-4">
          <Label>Suggested Questions</Label>
          <p className="text-sm text-muted-foreground">
            Add up to 3 suggested questions for your users to click on
          </p>
          
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`suggestion-${index + 1}`}>Suggestion {index + 1}</Label>
              <Input 
                id={`suggestion-${index + 1}`} 
                value={agent.suggestions[index] || ''}
                onChange={(e) => handleSuggestionChange(index, e.target.value)}
                placeholder={`e.g. Suggestion ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAppearanceContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>Visual Settings</CardTitle>
        <CardDescription>Customize the look and feel of your chatbot</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chat-avatar">Chat Avatar</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
              <div 
                className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-all ${agent.avatar.type === 'default' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/10 border'}`}
                onClick={() => handleAvatarChange('default')}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Bot size={28} className="text-primary" />
                </div>
                <span className="text-xs font-medium">Default</span>
              </div>

              {predefinedAvatars.map((avatar) => (
                <div 
                  key={avatar.id}
                  className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-all ${agent.avatar.type === 'predefined' && agent.avatar.src === avatar.src ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/10 border'}`}
                  onClick={() => handleAvatarChange('predefined', avatar.src)}
                >
                  <Avatar className="w-14 h-14 mb-2 border">
                    <AvatarImage src={avatar.src} alt="Predefined avatar" />
                    <AvatarFallback>
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">Avatar {predefinedAvatars.indexOf(avatar) + 1}</span>
                </div>
              ))}

              <div 
                className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-all relative ${agent.avatar.type === 'custom' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/10 border'}`}
              >
                <label htmlFor="custom-avatar-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2 overflow-hidden border">
                    {agent.avatar.type === 'custom' && agent.avatar.src ? (
                      <Avatar className="w-full h-full">
                        <AvatarImage src={agent.avatar.src} alt="Custom avatar" />
                        <AvatarFallback>
                          <Upload size={20} />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Upload size={20} className="text-primary" />
                    )}
                  </div>
                  <span className="text-xs font-medium">Upload</span>
                </label>
                <input 
                  id="custom-avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleCustomAvatarUpload}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input 
                  id="primary-color-input" 
                  type="color" 
                  value={agent.primaryColor} 
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input 
                  id="primary-color-value" 
                  value={agent.primaryColor} 
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Text Color</Label>
              <div className="flex gap-2">
                <Input 
                  id="secondary-color-input" 
                  type="color" 
                  value={agent.secondaryColor} 
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input 
                  id="secondary-color-value" 
                  value={agent.secondaryColor} 
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select 
              value={agent.fontFamily} 
              onValueChange={(value) => handleChange('fontFamily', value)}
            >
              <SelectTrigger id="font-family">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="chatbot-name">Chatbot Name</Label>
            <Input 
              id="chatbot-name" 
              value={agent.chatbotName} 
              onChange={(e) => handleChange('chatbotName', e.target.value)}
              placeholder="e.g. Customer Support"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Input 
              id="welcome-message" 
              value={agent.welcomeMessage} 
              onChange={(e) => handleChange('welcomeMessage', e.target.value)}
              placeholder="Hello! How can I help you today?"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="button-text">Button Text</Label>
            <Input 
              id="button-text" 
              value={agent.buttonText} 
              onChange={(e) => handleChange('buttonText', e.target.value)}
              placeholder="Chat with us"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Position</Label>
            <RadioGroup 
              value={agent.position} 
              onValueChange={(value) => handleChange('position', value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom-right" id="position-right" />
                <Label htmlFor="position-right">Bottom Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom-left" id="position-left" />
                <Label htmlFor="position-left">Bottom Left</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAdvancedContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CpuIcon className="mr-2 h-5 w-5" />
            AI Model Configuration
          </CardTitle>
          <CardDescription>Configure the underlying AI model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select defaultValue="gpt4">
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt4">GPT-4 (OpenAI)</SelectItem>
                <SelectItem value="gpt35">GPT-3.5 Turbo (OpenAI)</SelectItem>
                <SelectItem value="claude">Claude 3 (Anthropic)</SelectItem>
                <SelectItem value="gemini">Gemini Pro (Google)</SelectItem>
                <SelectItem value="mistral">Mistral Large (Mistral AI)</SelectItem>
                <SelectItem value="llama">Llama 2 (Meta AI)</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="link" 
              className="text-xs text-muted-foreground mt-1 pl-0"
              onClick={() => window.open(`/agents/${agentId}/test`, '_blank')}
            >
              Test this model in a new tab →
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="temperature" 
                type="number" 
                value={agent.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                min="0" 
                max="1" 
                step="0.1"
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">
                Higher values make responses more creative but less predictable
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-response-length">Maximum Response Length</Label>
            <Select 
              value={agent.maxResponseLength} 
              onValueChange={(value) => handleChange('maxResponseLength', value)}
            >
              <SelectTrigger id="max-response-length">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                <SelectItem value="medium">Medium (3-5 sentences)</SelectItem>
                <SelectItem value="long">Long (6+ sentences)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Controls the typical length of responses from your agent.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BrainCircuit className="mr-2 h-5 w-5" />
            Agent Type & System Prompt
          </CardTitle>
          <CardDescription>Define the agent's role and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Agent Type</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                  className="text-xs"
                >
                  {showSystemPrompt ? "Hide System Prompt" : "Show System Prompt"}
                </Button>
              </div>
              <RadioGroup 
                value={agent.agentType} 
                onValueChange={handleAgentTypeChange}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                  <RadioGroupItem value="support" id="support" />
                  <Label htmlFor="support" className="flex flex-col cursor-pointer">
                    <span className="font-medium">Customer Support</span>
                    <span className="text-xs text-muted-foreground">Assists with user questions and problems</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                  <RadioGroupItem value="sales" id="sales" />
                  <Label htmlFor="sales" className="flex flex-col cursor-pointer">
                    <span className="font-medium">Sales Assistant</span>
                    <span className="text-xs text-muted-foreground">Helps convert leads and answer product questions</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                  <RadioGroupItem value="technical" id="technical" />
                  <Label htmlFor="technical" className="flex flex-col cursor-pointer">
                    <span className="font-medium">Technical Support</span>
                    <span className="text-xs text-muted-foreground">Helps with technical problems and troubleshooting</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex flex-col cursor-pointer">
                    <span className="font-medium">Custom</span>
                    <span className="text-xs text-muted-foreground">Create a custom agent type</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {showSystemPrompt && (
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={agent.systemPrompt}
                  onChange={(e) => handleChange('systemPrompt', e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                  placeholder="Enter instructions for how your AI agent should behave..."
                />
                <p className="text-xs text-muted-foreground">
                  This is the instruction set that guides how your AI agent behaves. It's sent with every conversation to define the agent's role and constraints.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sliders className="mr-2 h-5 w-5" />
            Behavior Settings
          </CardTitle>
          <CardDescription>Configure how the agent works and learns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="memory">Conversation Memory</Label>
              <Switch id="memory" defaultChecked />
            </div>
            <p className="text-xs text-muted-foreground">
              Enable conversation history so the agent remembers previous interactions
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="learning">Continuous Learning</Label>
              <Switch id="learning" />
            </div>
            <p className="text-xs text-muted-foreground">
              Allow the agent to improve from interactions over time
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="handoff">Expert Handoff</Label>
              <Switch id="handoff" />
            </div>
            <p className="text-xs text-muted-foreground">
              Allow the agent to escalate to human domain experts when needed
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="multilingual">Multilingual Support</Label>
              <Switch id="multilingual" />
            </div>
            <p className="text-xs text-muted-foreground">
              Enable automatic translation for non-primary languages
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderChatPreview = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1">
          <ChatboxPreview
            primaryColor={agent.primaryColor}
            secondaryColor={agent.secondaryColor}
            fontFamily={agent.fontFamily}
            chatbotName={agent.chatbotName}
            welcomeMessage={agent.welcomeMessage}
            buttonText={agent.buttonText}
            position={agent.position}
            className="w-full h-full"
            suggestions={agent.suggestions}
            avatarSrc={agent.avatar.type !== 'default' ? agent.avatar.src : undefined}
          />
        </div>
      </div>
    );
  };

  const getIntegrationIconElement = (iconName: string, color: string) => {
    switch (iconName) {
      case 'slack':
        return <Slack className="h-6 w-6" style={{ color }} />;
      case 'whatsapp':
        return <Smartphone className="h-6 w-6" style={{ color }} />;
      case 'instagram':
        return <Instagram className="h-6 w-6" style={{ color }} />;
      case 'globe':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        );
      case 'code':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        );
      case 'mail':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        );
      case 'message-square':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        );
      case 'microsoft':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="8" height="8" rx="1"/>
            <rect x="13" y="3" width="8" height="8" rx="1"/>
            <rect x="3" y="13" width="8" height="8" rx="1"/>
            <rect x="13" y="13" width="8" height="8" rx="1"/>
          </svg>
        );
      default:
        return <Bot className="h-6 w-6" style={{ color }} />;
    }
  };

  const renderIntegrationsContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle>Integration Channels</CardTitle>
              <CardDescription>Connect this agent to other platforms</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-muted' : ''}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode('grid')} 
                className={viewMode === 'grid' ? 'bg-muted' : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Connected Channels</h3>
            {activeIntegrations.filter(i => i.connected).length === 0 ? (
              <div className="text-sm text-muted-foreground">No channels connected yet</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeIntegrations.filter(i => i.connected).map(integration => (
                  <Badge 
                    key={integration.id} 
                    variant="outline"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {getIntegrationIconElement(integration.icon, integration.color)}
                    <span>{integration.name}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <h3 className="text-sm font-medium mb-4">Available Channels</h3>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeIntegrations.map(integration => (
                <Card key={integration.id} className={`border overflow-hidden ${integration.connected ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: `${integration.color}20` }}>
                        {getIntegrationIconElement(integration.icon, integration.color)}
                      </div>
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        {integration.connected && <Badge variant="outline" className="text-xs">Connected</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                    <Button 
                      size="sm" 
                      variant={integration.connected ? "outline" : "default"}
                      className="w-full"
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setIsIntegrationDialogOpen(true);
                      }}
                    >
                      {integration.connected ? 'Configure' : 'Connect'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-md">
              {activeIntegrations.map((integration, index) => (
                <div key={integration.id} className={`flex items-center justify-between p-4 ${index !== activeIntegrations.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: `${integration.color}20` }}>
                      {getIntegrationIconElement(integration.icon, integration.color)}
                    </div>
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.connected && (
                      <Badge variant="outline" className="mr-2">Connected</Badge>
                    )}
                    <Button 
                      size="sm" 
                      variant={integration.connected ? "outline" : "default"}
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setIsIntegrationDialogOpen(true);
                      }}
                    >
                      {integration.connected ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isIntegrationDialogOpen} onOpenChange={setIsIntegrationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {selectedIntegration && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: `${selectedIntegration.color}20` }}>
                    {getIntegrationIconElement(selectedIntegration.icon, selectedIntegration.color)}
                  </div>
                  <DialogTitle>{selectedIntegration.name} Integration</DialogTitle>
                </div>
                <DialogDescription>
                  {selectedIntegration.setupInstructions}
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Features</h4>
                <ul className="grid gap-2">
                  {selectedIntegration.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-primary">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Configuration</h4>
                
                {selectedIntegration.id === 'slack' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="slack-api-key">API Key</Label>
                      <Input 
                        id="slack-api-key" 
                        value={integrationFormData.apiKey} 
                        onChange={(e) => setIntegrationFormData({...integrationFormData, apiKey: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slack-bot-username">Bot Username</Label>
                      <Input 
                        id="slack-bot-username" 
                        value={integrationFormData.botUsername} 
                        onChange={(e) => setIntegrationFormData({...integrationFormData, botUsername: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="channel-mentions">Listen to Channel Mentions</Label>
                        <Switch id="channel-mentions" defaultChecked />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Respond when the bot is mentioned in channels
                      </p>
                    </div>
                  </>
                )}
                
                {selectedIntegration.id === 'whatsapp' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-phone">WhatsApp Phone Number</Label>
                      <Input 
                        id="whatsapp-phone" 
                        value={integrationFormData.phoneNumber} 
                        onChange={(e) => setIntegrationFormData({...integrationFormData, phoneNumber: e.target.value})}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-api-key">API Key</Label>
                      <Input 
                        id="whatsapp-api-key" 
                        value={integrationFormData.apiKey} 
                        onChange={(e) => setIntegrationFormData({...integrationFormData, apiKey: e.target.value})}
                        type="password"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-reply">Auto-Reply to Messages</Label>
                        <Switch id="auto-reply" defaultChecked />
                      </div>
                    </div>
                  </>
                )}
                
                {selectedIntegration.id === 'website' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="website-code">Embed Code</Label>
                      <div className="relative">
                        <Textarea 
                          id="website-code" 
                          className="font-mono text-xs h-24"
                          value={`<script src="https://ai-service.example.com/widget/${agentId}"></script>`}
                          readOnly
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="absolute top-1 right-1"
                          onClick={() => {
                            navigator.clipboard.writeText(`<script src="https://ai-service.example.com/widget/${agentId}"></script>`);
                            toast({
                              title: "Code copied",
                              description: "The widget code has been copied to your clipboard."
                            });
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add this script to your website to enable the chat widget
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="website-domains">Allowed Domains</Label>
                        <Button variant="outline" size="sm">Add Domain</Button>
                      </div>
                      <div className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">example.com</span>
                          <Button variant="ghost" size="sm">Remove</Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {selectedIntegration.id === 'email' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email-address">Email Address</Label>
                      <Input 
                        id="email-address" 
                        value={integrationFormData.email} 
                        onChange={(e) => setIntegrationFormData({...integrationFormData, email: e.target.value})}
                        placeholder="support@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-auto-reply">Auto-Reply to Emails</Label>
                        <Switch id="email-auto-reply" defaultChecked />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signature">Email Signature</Label>
                      <Textarea 
                        id="email-signature" 
                        placeholder="Best regards,&#10;AI Support Team"
                      />
                    </div>
                  </>
                )}
                
                {(selectedIntegration.id !== 'slack' && 
                  selectedIntegration.id !== 'whatsapp' && 
                  selectedIntegration.id !== 'website' && 
                  selectedIntegration.id !== 'email') && (
                  <div className="text-sm">
                    To connect this integration, please provide the required credentials and settings.
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIntegrationDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedIntegration) {
                  const updatedIntegrations = activeIntegrations.map(i => 
                    i.id === selectedIntegration.id ? {...i, connected: !i.connected} : i
                  );
                  setActiveIntegrations(updatedIntegrations);
                  
                  setIsIntegrationDialogOpen(false);
                  
                  toast({
                    title: selectedIntegration.connected 
                      ? `${selectedIntegration.name} settings updated` 
                      : `${selectedIntegration.name} connected`,
                    description: selectedIntegration.connected 
                      ? "Your integration settings have been updated." 
                      : "Your agent is now connected to this platform."
                  });
                }
              }}
            >
              {selectedIntegration?.connected ? 'Save Changes' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={goBack} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToTestPage}>
            Test Agent <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Palette className="mr-2 h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center">
            <BrainCircuit className="mr-2 h-4 w-4" /> Advanced
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Integrations
          </TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <TabsContent value="general">
              {renderGeneralContent()}
            </TabsContent>
            
            <TabsContent value="appearance">
              {renderAppearanceContent()}
            </TabsContent>
            
            <TabsContent value="advanced">
              {renderAdvancedContent()}
            </TabsContent>
            
            <TabsContent value="integrations">
              {renderIntegrationsContent()}
            </TabsContent>
          </div>
          
          <div className="md:col-span-1 h-[600px]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your agent will look to users</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-5rem)]">
                {renderChatPreview()}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default AgentEdit;
