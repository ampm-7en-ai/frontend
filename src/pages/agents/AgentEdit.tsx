
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams  } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Settings, MessageSquare, Palette, FileText, Book, RefreshCw, BrainCircuit, AlertTriangle, Sliders, CpuIcon, Save, Send, Upload, UserRound, ExternalLink, Smartphone, Slack, Instagram } from 'lucide-react';
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
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, updateAgent } from '@/utils/api-config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { dottedBackgroundStyle } from '@/components/layout/TestPageLayout';
import GuidelinesSection from '@/components/agents/edit/GuidelinesSection';

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
  custom: "Your custom prompt"
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
  { id: 'messenger', name: 'Messenger', icon: 'messenger', description: 'Connect with Facebook Messenger', connected: false, color: '#0084FF' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', description: 'Connect your WhatsApp Business account', connected: false, color: '#25D366' },
  { id: 'slack', name: 'Slack', icon: 'slack', description: 'Link your Slack workspace', connected: true, color: '#4A154B' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', description: 'Connect to Instagram direct messages', connected: false, color: '#E1306C' },
];

const AgentEdit = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");
  const queryClient = useQueryClient();
  
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
    selectedModel: 'gpt-4-turbo',
    temperature: 0.7,
    maxResponseLength: '4000',
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
    systemPrompt: agentTypeSystemPrompts.custom,
    guidelines: { dos: [] as string[], donts: [] as string[] },
  });

  const [isRetraining, setIsRetraining] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [activeIntegrations, setActiveIntegrations] = useState(integrationOptions);
  const [selectedIntegration, setSelectedIntegration] = useState<null | typeof integrationOptions[0]>(null);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [integrationFormData, setIntegrationFormData] = useState({ apiKey: '', webhookUrl: '', accountId: '' });
  const [agentKnowledgeSources, setAgentKnowledgeSources] = useState([]);
  const [isLoadingAgentData, setIsLoadingAgentData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: agentData, isLoading, isError, error } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId || '1'}`, {
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agent data: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    },
    staleTime: 30 * 1000, // 30 seconds stale time to reduce frequent refetches
  });



  React.useEffect(() => {
    if (agentData) {
      if (agentData.knowledge_bases && Array.isArray(agentData.knowledge_bases)) {
        setAgentKnowledgeSources(agentData.knowledge_bases);
      }
      
      const knowledgeSourceIds = [];
      if (agentData.settings && agentData.settings.selected_knowledge_sources) {
        knowledgeSourceIds.push(...agentData.settings.selected_knowledge_sources);
      }
      
      setAgent({
        ...agent,
        name: agentData.name || agent.name,
        description: agentData.description || agent.description,
        
        primaryColor: agentData.appearance?.primaryColor || agent.primaryColor,
        secondaryColor: agentData.appearance?.secondaryColor || agent.secondaryColor,
        fontFamily: agentData.appearance?.fontFamily || agent.fontFamily,
        chatbotName: agentData.appearance?.chatbotName || agent.chatbotName,
        welcomeMessage: agentData.appearance?.welcomeMessage || agent.welcomeMessage,
        buttonText: agentData.appearance?.buttonText || agent.buttonText,
        position: agentData.appearance?.position || agent.position,
        avatar: agentData.appearance?.avatar || agent.avatar,
        
        showOnMobile: agentData.behavior?.showOnMobile ?? agent.showOnMobile,
        collectVisitorData: agentData.behavior?.collectVisitorData ?? agent.collectVisitorData,
        autoShowAfter: agentData.behavior?.autoShowAfter ?? agent.autoShowAfter,
        suggestions: agentData.behavior?.suggestions || agent.suggestions,
        
        selectedModel: agentData.settings?.response_model || agentData.model?.selectedModel || agent.selectedModel,
        temperature: agentData.settings?.temperature ?? agentData.model?.temperature ?? agent.temperature,
        maxResponseLength: agentData.settings?.token_length?.toString() || agentData.model?.maxResponseLength || agent.maxResponseLength,
        
        agentType: agentData.agentType || agent.agentType,
        systemPrompt: agentData.systemPrompt || agent.systemPrompt,
        
        knowledgeSources: knowledgeSourceIds.length > 0 
          ? knowledgeSourceIds 
          : agentData.selected_knowledge_sources || 
            agentData.knowledge_bases?.map(kb => kb.id) || 
            agent.knowledgeSources,
        
        guidelines: agentData.behavior?.guidelines || { dos: [], donts: [] },
      });
      
      console.log('Agent data loaded:', {
        responseModel: agentData.settings?.response_model,
        temperature: agentData.settings?.temperature,
        tokenLength: agentData.settings?.token_length
      });
    }
  }, [agentData,agentData.systemPrompt]);

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

  const handleKnowledgeBasesChanged = useCallback(() => {
    console.log("Knowledge bases changed, refreshing data...");
    
    // Use a single staggered invalidation to prevent multiple API calls
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
    }, 500);
  }, [agentId, queryClient]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      interface AgentPayloadType {
        name: string;
        description: string;
        appearance: {
          primaryColor: string;
          secondaryColor: string;
          fontFamily: string;
          chatbotName: string;
          welcomeMessage: string;
          buttonText: string;
          position: "bottom-right" | "bottom-left";
          avatar: {
            type: string;
            src: string;
          }
        };
        behavior: {
          showOnMobile: boolean;
          collectVisitorData: boolean;
          autoShowAfter: number;
          suggestions: string[];
          guidelines?: { dos: string[], donts: string[] };
        };
        model: {
          selectedModel: string;
          temperature: number;
          maxResponseLength: string;
        };
        agentType: string;
        systemPrompt: string;
        knowledge_bases: any[];
        customAvatarFile: File | null;
        settings: {
          response_model: string;
          token_length: string;
          temperature: number;
        };
      }

      const payload: AgentPayloadType = {
        name: agent.name,
        description: agent.description,
        appearance: {
          primaryColor: agent.primaryColor,
          secondaryColor: agent.secondaryColor,
          fontFamily: agent.fontFamily,
          chatbotName: agent.chatbotName,
          welcomeMessage: agent.welcomeMessage,
          buttonText: agent.buttonText,
          position: agent.position,
          avatar: agent.avatar
        },
        behavior: {
          showOnMobile: agent.showOnMobile,
          collectVisitorData: agent.collectVisitorData,
          autoShowAfter: agent.autoShowAfter,
          suggestions: agent.suggestions,
          guidelines: agent.guidelines
        },
        model: {
          selectedModel: agent.selectedModel,
          temperature: agent.temperature,
          maxResponseLength: agent.maxResponseLength
        },
        agentType: agent.agentType,
        systemPrompt: agent.systemPrompt,
        knowledge_bases: agentKnowledgeSources,
        customAvatarFile,
        settings: {
          response_model: agent.selectedModel,
          token_length: agent.maxResponseLength,
          temperature: agent.temperature
        }
      };

      await updateAgent(agentId || '', payload);
      
      toast({
        title: "Changes saved",
        description: "Your agent settings have been updated successfully.",
      });
      
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Error saving changes",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      handleChange('systemPrompt',agent.systemPrompt); 
    }
  };

  const handleGuidelinesChange = (guidelines: { dos: string[], donts: string[] }) => {
    setAgent({
      ...agent,
      guidelines
    });
    console.log("Guidelines updated:", guidelines);
  };

  const goBack = () => {
    navigate('/agents');
  };
  
  const goToTestPage = () => {
    window.open(`/agents/${agentId}/test`, '_blank');
  };

  const handleAgentTypeChange = (type: string) => {
    const systemPrompt = type === agentData.agentType ? agentData.systemPrompt : agentTypeSystemPrompts[type as keyof typeof agentTypeSystemPrompts];
    setAgent({
      ...agent,
      agentType: type,
      systemPrompt: systemPrompt
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
    
    if (type !== 'custom') {
      setCustomAvatarFile(null);
    }
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomAvatarFile(file);
    
    const objectUrl = URL.createObjectURL(file);
    handleAvatarChange('custom', objectUrl);

    toast({
      title: "Avatar uploaded",
      description: "Your custom avatar has been uploaded. Don't forget to save changes.",
    });
  };
  
  const handleIntegrationCardClick = (integration: typeof integrationOptions[0]) => {
    setSelectedIntegration(integration);
    setIsIntegrationDialogOpen(true);
    setIntegrationFormData({ apiKey: '', webhookUrl: '', accountId: '' });
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
            <Select 
              value={agent.selectedModel} 
              onValueChange={(value) => handleChange('selectedModel', value)}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo (OpenAI)</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</SelectItem>
                <SelectItem value="mistral-large-latest">Mistral Large (Mistral AI)</SelectItem>
                <SelectItem value="mistral-medium-latest">Mistral Medium (Mistral AI)</SelectItem>
                <SelectItem value="mistral-small-latest">Mistral Small (Mistral AI)</SelectItem>
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
              value={agent.maxResponseLength.toString()} 
              onValueChange={(value) => handleChange('maxResponseLength', value)}
            >
              <SelectTrigger id="max-response-length">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="4000">4,000 tokens</SelectItem>
                  <SelectItem value="8000">8,000 tokens</SelectItem>
                  <SelectItem value="16000">16,000 tokens</SelectItem>
                  <SelectItem value="32000">32,000 tokens</SelectItem>
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
      
      <GuidelinesSection
        initialGuidelines={agent.guidelines}
        onChange={handleGuidelinesChange}
      />
      
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

  const renderKnowledgeContent = () => (
    <KnowledgeTrainingStatus 
      agentId={agentId || '1'} 
      agentName={agent.name || 'agent'}
      initialSelectedSources={agent.knowledgeSources}
      onSourcesChange={handleKnowledgeSourcesChange}
      preloadedKnowledgeSources={agentKnowledgeSources}
      isLoading={isLoading}
      loadError={loadError}
      onKnowledgeBasesChanged={handleKnowledgeBasesChanged}
    />
  );

  const renderChatPreview = () => {
    return (
      <div className="dotted-background h-full w-full flex items-center justify-center p-4 rounded-lg pb-1">
        <div className="w-[420px] max-w-full h-full shadow-lg">
          <ChatboxPreview
            agentId={agentId}
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

  const renderIntegrationsContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Connect your agent with other platforms to extend its capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {integrationOptions.map(integration => (
              <div
                key={integration.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${integration.connected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                onClick={() => handleIntegrationCardClick(integration)}
              >
                <div className="flex flex-col items-center text-center gap-2 h-full">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-accent/10 mb-2">
                    {getIntegrationIconElement(integration.icon, integration.color)}
                  </div>
                  <span className="font-medium">{integration.name}</span>
                  <span className="text-xs text-muted-foreground">{integration.description}</span>
                  {integration.connected && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mt-2">Connected</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <Slack className="h-5 w-5 mr-2 text-[#4A154B]" />
            Connected Integrations
          </CardTitle>
          <CardDescription>Manage your agent's active connections</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-primary/5">
              <div className="flex-shrink-0">
                <Slack className="h-10 w-10 text-[#4A154B]" />
              </div>
              <div className="flex-grow">
                <h4 className="font-medium">Slack</h4>
                <p className="text-sm text-muted-foreground">Connected to workspace: Team Coco</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Configure</Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">Disconnect</Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="font-medium">Connect a New Platform</h4>
              <p className="text-sm text-muted-foreground mb-2">Select an integration above to connect with more platforms.</p>
              
              <div className="border rounded-lg p-4 bg-muted/30">
                <h5 className="font-medium text-sm mb-2">Integration Benefits</h5>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-5">
                  <li>Allow your AI agent to communicate through multiple channels</li>
                  <li>Maintain consistent conversations across platforms</li>
                  <li>Automate workflows with integrations</li>
                  <li>Notify your team when the agent needs human support</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getIntegrationIconElement = (iconName: string, color: string) => {
    switch (iconName) {
      case 'slack':
        return <Slack className="h-6 w-6" style={{ color }} />;
      case 'whatsapp':
        return <Smartphone className="h-6 w-6" style={{ color }} />;
      case 'instagram':
        return <Instagram className="h-6 w-6" style={{ color }} />;
      case 'messenger':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.36 2 2 6.13 2 11.7C2 14.6 3.19 17.13 5.14 18.87V23L9.14 20.87C10.03 21.13 11 21.28 12 21.28C17.64 21.28 22 17.15 22 11.58C22 6.13 17.64 2 12 2ZM13.33 15.25L10.5 12.25L5 15.25L11 8.75L13.83 11.75L19.33 8.75L13.33 15.25Z" fill={color} />
          </svg>
        );
      default:
        return <div className="h-6 w-6 bg-primary/10 rounded-full" />;
    }
  };

  const toggleIntegration = (id: string) => {
    setActiveIntegrations(
      activeIntegrations.map(integration => 
        integration.id === id 
          ? {...integration, connected: !integration.connected} 
          : integration
      )
    );
  };

  const handleIntegrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setIntegrationFormData({ ...integrationFormData, [id.split('-')[1]]: value });
  };

  const handleSaveIntegration = () => {
    if (selectedIntegration) {
      toggleIntegration(selectedIntegration.id);
      setIsIntegrationDialogOpen(false);
      
      toast({
        title: `${selectedIntegration.name} ${selectedIntegration.connected ? 'updated' : 'connected'}`,
        description: `Your agent has been successfully ${selectedIntegration.connected ? 'updated with' : 'connected to'} ${selectedIntegration.name}.`,
      });
    }
  };

  const renderTabContentSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[180px]" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderChatPreviewSkeleton = () => (
    <div className="flex flex-col h-full items-center justify-center rounded-lg border-2 border-dashed p-10">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-[180px] mt-4" />
      <Skeleton className="h-20 w-full mt-6" />
    </div>
  );

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Agent</h2>
        <p className="text-muted-foreground mb-6">
          {error instanceof Error ? error.message : "Failed to load agent data"}
        </p>
        <Button onClick={goBack} variant="outline">Go Back to Agents</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full relative">
      {/* Fixed header group that contains both title header and tab navigation */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-background flex flex-col">
        {/* Title header */}
        <div className="flex items-center justify-between w-full h-[70px] border-b border-t pb-3 pt-3 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-[200px] mb-1" />
                  <Skeleton className="h-4 w-[300px]" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold tracking-tight">{agent.name}</h2>
                </>
              )}
            </div>
          </div>
          <Button onClick={handleSaveChanges} disabled={isLoading || isSaving}>
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
        
        {/* Tab navigation - only show when not loading and for medium screens and up */}
        {!isLoading && (
          <div className="hidden md:block border-b bg-background">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList variant="github" className="w-full mb-0 pl-6" stickyOffset="top-[70px]">
                <TabsTrigger value="general" variant="github">
                  <Bot className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="appearance" variant="github">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="advanced" variant="github">
                  <Sliders className="h-4 w-4 mr-2" />
                  Advanced Settings
                </TabsTrigger>
                <TabsTrigger value="knowledge" variant="github">
                  <FileText className="h-4 w-4 mr-2" />
                  Knowledge
                </TabsTrigger>
                <TabsTrigger value="integrations" variant="github">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Integrations
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-[0px] flex-1 max-w-[1440px] mx-auto px-4">
          <div className="h-[calc(100vh-200px)] sticky top-[111px]">
            {renderChatPreviewSkeleton()}
          </div>
          
          <div className="col-span-2 h-full ">
            <div className="flex justify-start mb-6">
              <div className="bg-muted rounded-lg p-1 flex items-center">
                {["general", "appearance", "advanced", "knowledge", "integrations"].map((tab) => (
                  <Skeleton key={tab} className="h-8 w-24 mx-1 rounded-md" />
                ))}
              </div>
            </div>
            
            {renderTabContentSkeleton()}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-[0px] flex-1 max-w-[1440px] mx-auto px-4">
          <div className="sticky top-[111px] h-[calc(100vh-200px)]">
            {renderChatPreview()}
          </div>
          
          <div className="col-span-2 h-full flex flex-col w-800">
            <Tabs 
              defaultValue="general" 
              className="w-full flex flex-col h-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              {/* Mobile tab list - only show on smaller screens */}
              <div className="block md:hidden">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="appearance">Style</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {/* Tab content area - no changes to the content, just the outer container */}
                <TabsContent 
                  value="general" 
                  className="mt-4 pb-6 h-full" 
                  scrollable={true} 
                  hideScrollbar={true}
                >
                  <ScrollArea className="h-full" hideScrollbar={true}>
                    {renderGeneralContent()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent 
                  value="appearance" 
                  className="mt-4 pb-6 h-full" 
                  scrollable={true} 
                  hideScrollbar={true}
                >
                  <ScrollArea className="h-full" hideScrollbar={true}>
                    {renderAppearanceContent()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent 
                  value="advanced" 
                  className="mt-4 pb-6 h-full" 
                  scrollable={true} 
                  hideScrollbar={true}
                >
                  <ScrollArea className="h-full" hideScrollbar={true}>
                    {renderAdvancedContent()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent 
                  value="knowledge" 
                  className="mt-4 pb-6 h-full" 
                  scrollable={true}
                  hideScrollbar={true}
                >
                  <ScrollArea className="h-full" hideScrollbar={true}>
                    {renderKnowledgeContent()}
                  </ScrollArea>
                </TabsContent>

                <TabsContent 
                  value="integrations" 
                  className="mt-4 pb-6 h-full" 
                  scrollable={true}
                  hideScrollbar={true}
                >
                  <ScrollArea className="h-full" hideScrollbar={true}>
                    {renderIntegrationsContent()}
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: dottedBackgroundStyle }} />

      <Dialog open={isIntegrationDialogOpen} onOpenChange={setIsIntegrationDialogOpen}>
        {selectedIntegration && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {selectedIntegration.name}</DialogTitle>
              <DialogDescription>
                Enter your credentials to connect with {selectedIntegration.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {selectedIntegration.id === 'messenger' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="messenger-pageid">Facebook Page ID</Label>
                    <Input 
                      id="messenger-pageid" 
                      placeholder="Enter your Facebook Page ID"
                      onChange={e => setIntegrationFormData({...integrationFormData, accountId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messenger-token">Page Access Token</Label>
                    <Input 
                      id="messenger-token" 
                      type="password"
                      placeholder="Enter your Page Access Token"
                      onChange={e => setIntegrationFormData({...integrationFormData, apiKey: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      You can find this in your Facebook Developer account.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messenger-callback">Webhook Callback URL</Label>
                    <Input 
                      id="messenger-callback"
                      value="https://api.coco.ai/webhooks/messenger"
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use this URL in your Facebook app's webhook settings.
                    </p>
                  </div>
                </div>
              )}
              
              {selectedIntegration.id === 'slack' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slack-workspace">Slack Workspace Name</Label>
                    <Input 
                      id="slack-workspace" 
                      placeholder="Your Slack Workspace"
                      onChange={e => setIntegrationFormData({...integrationFormData, accountId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slack-token">Bot Token</Label>
                    <Input 
                      id="slack-token" 
                      type="password"
                      placeholder="xoxb-..."
                      onChange={e => setIntegrationFormData({...integrationFormData, apiKey: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      You can find this in your Slack App settings.
                    </p>
                  </div>
                </div>
              )}
              
              {(selectedIntegration.id === 'whatsapp' || selectedIntegration.id === 'instagram') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${selectedIntegration.id}-account`}>Account ID</Label>
                    <Input 
                      id={`${selectedIntegration.id}-account`}
                      placeholder="Enter your account ID"
                      onChange={e => setIntegrationFormData({...integrationFormData, accountId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${selectedIntegration.id}-token`}>API Token</Label>
                    <Input 
                      id={`${selectedIntegration.id}-token`}
                      type="password"
                      placeholder="Enter your API token"
                      onChange={e => setIntegrationFormData({...integrationFormData, apiKey: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${selectedIntegration.id}-webhook`}>Webhook URL</Label>
                    <Input 
                      id={`${selectedIntegration.id}-webhook`}
                      value="https://api.coco.ai/webhooks/incoming"
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use this URL in your {selectedIntegration.name} webhook settings.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIntegrationDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveIntegration}>
                {selectedIntegration.connected ? 'Update' : 'Connect'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AgentEdit;
