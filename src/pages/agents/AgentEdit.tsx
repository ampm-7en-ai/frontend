
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Settings, MessageSquare, Palette, FileText, Book, RefreshCw, BrainCircuit, AlertTriangle, Sliders, CpuIcon, Save, Send, Upload, UserRound, Rocket, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const knowledgeSources = [
  { id: 1, name: 'Product Documentation', type: 'document', size: '2.4 MB', lastUpdated: '2023-12-15' },
  { id: 2, name: 'FAQs', type: 'webpage', size: '0.8 MB', lastUpdated: '2023-12-20' },
  { id: 3, name: 'Customer Support Guidelines', type: 'document', size: '1.5 MB', lastUpdated: '2023-12-10' },
  { id: 4, name: 'Pricing Information', type: 'document', size: '0.3 MB', lastUpdated: '2023-12-25' },
];

// Predefined system prompts for different agent types
const agentTypeSystemPrompts = {
  support: "You are a helpful customer support assistant. Your goal is to assist users with their questions and problems related to our products and services. Be friendly, patient, and informative.",
  sales: "You are a knowledgeable sales assistant. Your goal is to help potential customers understand our products, answer their questions, and guide them towards making a purchase decision. Be enthusiastic but not pushy.",
  technical: "You are a technical support specialist. Your goal is to help users troubleshoot and resolve technical issues with our products. Be precise, thorough, and explain technical concepts clearly.",
  custom: ""
};

// Predefined avatars
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
    navigate(`/agents/${agentId}/test`);
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

    // Create URL for preview
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
            <Label>Chat Avatar</Label>
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
            <Label htmlFor="model">Language Model</Label>
            <Select 
              value={agent.selectedModel} 
              onValueChange={(value) => handleChange('selectedModel', value)}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt4">GPT-4</SelectItem>
                <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="anthropic">Claude 3</SelectItem>
                <SelectItem value="mistral">Mistral 7B</SelectItem>
                <SelectItem value="llama">Llama 2</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs"
                onClick={goToTestPage}
              >
                <Rocket className="h-3.5 w-3.5" />
                Test this model
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
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
      <div className="h-full">
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
    );
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Agent: {agent.name}</h2>
            <p className="text-muted-foreground">Customize your agent's appearance and behavior</p>
          </div>
        </div>
        <Button onClick={handleSaveChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 h-[calc(100vh-180px)] max-w-[1440px] mx-auto px-4">
        <div className="h-full">
          {renderChatPreview()}
        </div>
        
        <div className="col-span-2 h-full overflow-y-auto">
          <Tabs 
            defaultValue="general" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex justify-start mb-6">
              <TabsList size="xs" className="w-auto">
                <TabsTrigger value="general" size="xs">
                  <Bot className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="appearance" size="xs">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="advanced" size="xs">
                  <Sliders className="h-4 w-4 mr-2" />
                  Advanced Settings
                </TabsTrigger>
                <TabsTrigger value="knowledge" size="xs">
                  <FileText className="h-4 w-4 mr-2" />
                  Knowledge
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="general" className="mt-0">
              {renderGeneralContent()}
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-0">
              {renderAppearanceContent()}
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-0">
              {renderAdvancedContent()}
            </TabsContent>
            
            <TabsContent value="knowledge" className="mt-0">
              <KnowledgeTrainingStatus 
                agentId={agentId || ''} 
                initialSelectedSources={agent.knowledgeSources}
                onSourcesChange={handleKnowledgeSourcesChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AgentEdit;
