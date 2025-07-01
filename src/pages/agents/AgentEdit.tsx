import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, EyeOff, Settings, MessageSquare, Book, Zap, ChevronRight, ChevronLeft, Palette, Cog, Bot, Upload } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import GuidelinesSection from '@/components/agents/edit/GuidelinesSection';
import ModernButton from '@/components/dashboard/ModernButton';
import { useAppTheme } from '@/hooks/useAppTheme';

interface Agent {
  id: string;
  name: string;
  description: string;
  model: {
    selectedModel: string;
    temperature: number;
    maxTokens: number;
  };
  systemPrompt: string;
  knowledgeBases: any[];
  status: string;
  createdAt: string;
  guidelines?: {
    dos: string[];
    donts: string[];
  };
  behaviorSettings: {
    conversationMemory: boolean;
    continuousLearning: boolean;
    expertHandoff: boolean;
    aiToAiHandoff: boolean;
    multilingualSupport: boolean;
  };
}

const AgentEdit = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  
  console.log('AgentEdit component rendered, agentId:', agentId);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    model: {
      selectedModel: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2048
    },
    guidelines: {
      dos: [] as string[],
      donts: [] as string[]
    },
    behaviorSettings: {
      conversationMemory: true,
      continuousLearning: false,
      expertHandoff: false,
      aiToAiHandoff: true,
      multilingualSupport: false
    },
    appearance: {
      primaryColor: '#1e52f1',
      secondaryColor: '#f8fafc',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      chatbotName: '',
      welcomeMessage: 'Hello! How can I help you today?',
      buttonText: 'Chat with us',
      position: 'bottom-right' as 'bottom-right' | 'bottom-left',
      suggestions: [] as string[],
      avatarType: 'default' as 'default' | 'avatar1' | 'avatar2' | 'avatar3' | 'upload',
      avatarSrc: ''
    },
    agentType: 'general-assistant' as 'general-assistant' | 'customer-support' | 'sales-agent' | 'language-tutor' | 'tech-expert' | 'life-coach' | 'travel-agent' | 'custom',
    showSystemPrompt: false
  });
  
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch agent data
  const { data: agent, isLoading, error } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async (): Promise<Agent> => {
      console.log('Fetching agent data for ID:', agentId);
      const token = getAccessToken();
      if (!token) {
        console.error('No access token found');
        throw new Error('Authentication required');
      }
      
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/`), {
        headers: getAuthHeaders(token)
      });
      
      console.log('Agent fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agent: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Agent data received:', data);
      return data.data;
    },
    enabled: !!agentId
  });

  // Update form data when agent data is loaded
  useEffect(() => {
    console.log('Agent data changed:', agent);
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description || '',
        systemPrompt: agent.systemPrompt || '',
        model: agent.model || {
          selectedModel: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 2048
        },
        guidelines: agent.guidelines || {
          dos: [],
          donts: []
        },
        behaviorSettings: agent.behaviorSettings || {
          conversationMemory: true,
          continuousLearning: false,
          expertHandoff: false,
          aiToAiHandoff: true,
          multilingualSupport: false
        },
        appearance: {
          primaryColor: '#1e52f1',
          secondaryColor: '#f8fafc',
          textColor: '#ffffff',
          fontFamily: 'Inter',
          chatbotName: agent.name,
          welcomeMessage: 'Hello! How can I help you today?',
          buttonText: 'Chat with us',
          position: 'bottom-right',
          suggestions: [],
          avatarType: 'default',
          avatarSrc: ''
        },
        agentType: 'general-assistant',
        showSystemPrompt: false
      });
    }
  }, [agent]);

  // Log loading and error states
  useEffect(() => {
    console.log('Loading state:', isLoading);
    console.log('Error state:', error);
  }, [isLoading, error]);

  // Save agent mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = getAccessToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/`), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save agent: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Agent saved",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save agent",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModelChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      model: {
        ...prev.model,
        [field]: value
      }
    }));
  };

  const handleGuidelinesChange = (guidelines: { dos: string[]; donts: string[] }) => {
    setFormData(prev => ({
      ...prev,
      guidelines
    }));
  };

  const handleAppearanceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }));
  };

  const handleBehaviorSettingChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      behaviorSettings: {
        ...prev.behaviorSettings,
        [field]: value
      }
    }));
  };

  const agentTypeOptions = [
    { value: 'general-assistant', label: 'General assistant', description: 'General Purpose AI Assistant' },
    { value: 'customer-support', label: 'Customer support agent', description: 'Helps with customer inquiries' },
    { value: 'sales-agent', label: 'Sales agent', description: 'Helps convert leads and answer product questions' },
    { value: 'language-tutor', label: 'Language tutor', description: 'Helps users learn languages' },
    { value: 'tech-expert', label: 'Tech expert', description: 'Helps with programming and development' },
    { value: 'life-coach', label: 'Life coach', description: 'Provides guidance and motivation' },
    { value: 'travel-agent', label: 'Travel Agent', description: 'Helps with travel advice and travel suggestions' },
    { value: 'custom', label: 'Custom', description: 'Create a custom agent type' }
  ];

  console.log('Rendering AgentEdit component with loading:', isLoading, 'error:', error, 'agent:', agent);

  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center backdrop-blur-sm bg-white/20 dark:bg-slate-800/20 p-8 rounded-2xl border border-white/20 dark:border-slate-700/20">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading agent...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    console.log('Rendering error state');
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 flex items-center justify-center">
          <Card className="max-w-md mx-auto backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-white/20 dark:border-slate-700/20">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                {error instanceof Error ? error.message : 'Failed to load agent'}
              </p>
              <Button onClick={() => navigate('/agents')} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Agents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  console.log('Rendering main content');

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 transition-colors duration-200">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 border-b border-white/20 dark:border-slate-700/20 sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={ArrowLeft}
                  onClick={() => navigate('/agents')}
                  className="backdrop-blur-sm bg-white/20 dark:bg-slate-800/20 hover:bg-white/30 dark:hover:bg-slate-700/30 border border-white/20 dark:border-slate-700/20"
                >
                  Back
                </ModernButton>
                <div className="h-6 w-px bg-white/20 dark:bg-slate-700/20" />
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Edit Agent
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {agent.name}
                  </p>
                </div>
                <Badge 
                  variant={agent.status === 'Live' ? 'default' : 'secondary'}
                  className="ml-2 backdrop-blur-sm bg-white/20 dark:bg-slate-800/20"
                >
                  {agent.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={previewCollapsed ? Eye : EyeOff}
                  onClick={() => setPreviewCollapsed(!previewCollapsed)}
                  className="backdrop-blur-sm bg-white/20 dark:bg-slate-800/20 hover:bg-white/30 dark:hover:bg-slate-700/30 border border-white/20 dark:border-slate-700/20"
                >
                  {previewCollapsed ? 'Show Preview' : 'Hide Preview'}
                </ModernButton>
                <ModernButton
                  variant="gradient"
                  icon={Save}
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="backdrop-blur-sm"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                </ModernButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Main Edit Panel */}
            <div className={`${previewCollapsed ? 'col-span-12' : 'col-span-8'} transition-all duration-300`}>
              <Card className="backdrop-blur-md bg-white/40 dark:bg-slate-800/40 border-white/20 dark:border-slate-700/20 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Agent Configuration</CardTitle>
                  </div>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Configure your agent's behavior, knowledge, and settings
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 backdrop-blur-sm bg-white/30 dark:bg-slate-700/30 border border-white/20 dark:border-slate-600/20">
                      <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-white/50 dark:data-[state=active]:bg-slate-800/50">
                        <MessageSquare className="h-4 w-4" />
                        General
                      </TabsTrigger>
                      <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-white/50 dark:data-[state=active]:bg-slate-800/50">
                        <Palette className="h-4 w-4" />
                        Appearance
                      </TabsTrigger>
                      <TabsTrigger value="advanced" className="flex items-center gap-2 data-[state=active]:bg-white/50 dark:data-[state=active]:bg-slate-800/50">
                        <Cog className="h-4 w-4" />
                        Advanced Settings
                      </TabsTrigger>
                      <TabsTrigger value="knowledge" className="flex items-center gap-2 data-[state=active]:bg-white/50 dark:data-[state=active]:bg-slate-800/50">
                        <Book className="h-4 w-4" />
                        Knowledge
                      </TabsTrigger>
                      <TabsTrigger value="guidelines" className="flex items-center gap-2 data-[state=active]:bg-white/50 dark:data-[state=active]:bg-slate-800/50">
                        <Zap className="h-4 w-4" />
                        Guidelines & Behavior
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6 mt-6">
                      <div className="grid gap-6">
                        <div className="grid gap-2">
                          <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Agent Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter agent name"
                            className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20 focus:bg-white/40 dark:focus:bg-slate-800/40"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe what this agent does"
                            className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20 focus:bg-white/40 dark:focus:bg-slate-800/40 min-h-[100px]"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="systemPrompt" className="text-sm font-medium text-slate-700 dark:text-slate-300">System Prompt</Label>
                          <Textarea
                            id="systemPrompt"
                            value={formData.systemPrompt}
                            onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                            placeholder="Enter the system prompt for your agent"
                            className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20 focus:bg-white/40 dark:focus:bg-slate-800/40 min-h-[200px]"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-6 mt-6">
                      <div className="grid gap-6">
                        <div className="grid gap-4">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Visual Settings</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Customize the look and feel of your chatbot</p>
                          
                          {/* Chat Avatar */}
                          <div className="grid gap-3">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Chat Avatar</Label>
                            <div className="grid grid-cols-5 gap-3">
                              <div className="text-center">
                                <div 
                                  className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all ${
                                    formData.appearance.avatarType === 'default' 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  }`}
                                  onClick={() => handleAppearanceChange('avatarType', 'default')}
                                >
                                  <Bot className="h-8 w-8 text-blue-500" />
                                </div>
                                <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">Default</p>
                              </div>
                              
                              <div className="text-center">
                                <div 
                                  className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all overflow-hidden ${
                                    formData.appearance.avatarType === 'avatar1' 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  }`}
                                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'50\' fill=\'%23f59e0b\'/%3E%3Ccircle cx=\'35\' cy=\'40\' r=\'5\' fill=\'%23000\'/%3E%3Ccircle cx=\'65\' cy=\'40\' r=\'5\' fill=\'%23000\'/%3E%3Cpath d=\'M35 65 Q50 75 65 65\' stroke=\'%23000\' stroke-width=\'3\' fill=\'none\'/%3E%3C/svg%3E")', backgroundSize: 'cover' }}
                                  onClick={() => handleAppearanceChange('avatarType', 'avatar1')}
                                >
                                </div>
                                <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">Avatar 1</p>
                              </div>
                              
                              <div className="text-center">
                                <div 
                                  className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all overflow-hidden ${
                                    formData.appearance.avatarType === 'avatar2' 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  }`}
                                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'50\' fill=\'%23ef4444\'/%3E%3Ccircle cx=\'35\' cy=\'40\' r=\'5\' fill=\'%23000\'/%3E%3Ccircle cx=\'65\' cy=\'40\' r=\'5\' fill=\'%23000\'/%3E%3Cpath d=\'M35 65 Q50 75 65 65\' stroke=\'%23000\' stroke-width=\'3\' fill=\'none\'/%3E%3C/svg%3E")', backgroundSize: 'cover' }}
                                  onClick={() => handleAppearanceChange('avatarType', 'avatar2')}
                                >
                                </div>
                                <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">Avatar 2</p>
                              </div>
                              
                              <div className="text-center">
                                <div 
                                  className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all overflow-hidden ${
                                    formData.appearance.avatarType === 'avatar3' 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  }`}
                                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'50\' fill=\'%2310b981\'/%3E%3Ccircle cx=\'35\' cy=\'40\' r=\'5\' fill=\'%23000\'/%3E%3Ccircle cx=\'65\' cy=\'40\' r=\'5\' fill=\'%23000\'/%3E%3Cpath d=\'M35 65 Q50 75 65 65\' stroke=\'%23000\' stroke-width=\'3\' fill=\'none\'/%3E%3C/svg%3E")', backgroundSize: 'cover' }}
                                  onClick={() => handleAppearanceChange('avatarType', 'avatar3')}
                                >
                                </div>
                                <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">Avatar 3</p>
                              </div>
                              
                              <div className="text-center">
                                <div 
                                  className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 border-dashed transition-all ${
                                    formData.appearance.avatarType === 'upload' 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                  onClick={() => handleAppearanceChange('avatarType', 'upload')}
                                >
                                  <Upload className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">Upload</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="primaryColor" className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Color</Label>
                              <div className="flex gap-2 items-center">
                                <Input
                                  id="primaryColor"
                                  type="color"
                                  value={formData.appearance.primaryColor}
                                  onChange={(e) => handleAppearanceChange('primaryColor', e.target.value)}
                                  className="h-10 w-16 backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20"
                                />
                                <Input
                                  value={formData.appearance.primaryColor}
                                  onChange={(e) => handleAppearanceChange('primaryColor', e.target.value)}
                                  className="flex-1 backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20"
                                />
                              </div>
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="textColor" className="text-sm font-medium text-slate-700 dark:text-slate-300">Text Color</Label>
                              <div className="flex gap-2 items-center">
                                <Input
                                  id="textColor"
                                  type="color"
                                  value={formData.appearance.textColor}
                                  onChange={(e) => handleAppearanceChange('textColor', e.target.value)}
                                  className="h-10 w-16 backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20"
                                />
                                <Input
                                  value={formData.appearance.textColor}
                                  onChange={(e) => handleAppearanceChange('textColor', e.target.value)}
                                  className="flex-1 backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Font Family</Label>
                            <Select
                              value={formData.appearance.fontFamily}
                              onValueChange={(value) => handleAppearanceChange('fontFamily', value)}
                            >
                              <SelectTrigger className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20">
                                <SelectValue placeholder="Select font family" />
                              </SelectTrigger>
                              <SelectContent className="backdrop-blur-md bg-white/90 dark:bg-slate-800/90 border-white/20 dark:border-slate-700/20">
                                <SelectItem value="Inter">Inter</SelectItem>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Helvetica">Helvetica</SelectItem>
                                <SelectItem value="Georgia">Georgia</SelectItem>
                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Open Sans">Open Sans</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Chatbot Name, Welcome Message, Button Text, Position */}
                          <div className="grid gap-2">
                            <Label htmlFor="chatbotName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Chatbot Name</Label>
                            <Input
                              id="chatbotName"
                              value={formData.appearance.chatbotName}
                              onChange={(e) => handleAppearanceChange('chatbotName', e.target.value)}
                              placeholder="AI Assistant"
                              className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20 focus:bg-white/40 dark:focus:bg-slate-800/40"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="welcomeMessage" className="text-sm font-medium text-slate-700 dark:text-slate-300">Welcome Message</Label>
                            <Textarea
                              id="welcomeMessage"
                              value={formData.appearance.welcomeMessage}
                              onChange={(e) => handleAppearanceChange('welcomeMessage', e.target.value)}
                              placeholder="Hello! How can I help you today?"
                              className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20 focus:bg-white/40 dark:focus:bg-slate-800/40"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="buttonText" className="text-sm font-medium text-slate-700 dark:text-slate-300">Button Text</Label>
                            <Input
                              id="buttonText"
                              value={formData.appearance.buttonText}
                              onChange={(e) => handleAppearanceChange('buttonText', e.target.value)}
                              placeholder="Chat with us"
                              className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20 focus:bg-white/40 dark:focus:bg-slate-800/40"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={formData.appearance.position === 'bottom-right' ? 'default' : 'outline'}
                                onClick={() => handleAppearanceChange('position', 'bottom-right')}
                                className="flex-1 backdrop-blur-sm bg-white/20 dark:bg-slate-800/20 hover:bg-white/30 dark:hover:bg-slate-700/30 border-white/20 dark:border-slate-700/20"
                              >
                                Bottom Right
                              </Button>
                              <Button
                                type="button"
                                variant={formData.appearance.position === 'bottom-left' ? 'default' : 'outline'}
                                onClick={() => handleAppearanceChange('position', 'bottom-left')}
                                className="flex-1 backdrop-blur-sm bg-white/20 dark:bg-slate-800/20 hover:bg-white/30 dark:hover:bg-slate-700/30 border-white/20 dark:border-slate-700/20"
                              >
                                Bottom Left
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-6 mt-6">
                      <div className="grid gap-6">
                        {/* AI Model Configuration */}
                        <div className="grid gap-4">
                          <div className="flex items-center gap-2">
                            <Cog className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Model Configuration</h3>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Configure the underlying AI model</p>
                          
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Model</Label>
                              <Select
                                value={formData.model.selectedModel}
                                onValueChange={(value) => handleModelChange('selectedModel', value)}
                              >
                                <SelectTrigger className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20">
                                  <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-md bg-white/90 dark:bg-slate-800/90 border-white/20 dark:border-slate-700/20">
                                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo (OpenAI)</SelectItem>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</SelectItem>
                                  <SelectItem value="gpt-4">GPT-4 (OpenAI)</SelectItem>
                                  <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="link" className="text-xs p-0 h-auto justify-start text-blue-600 dark:text-blue-400">
                                Test this model in a new tab →
                              </Button>
                            </div>
                            
                            <div className="grid gap-2">
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Temperature
                              </Label>
                              <div className="flex items-center gap-4">
                                <Input
                                  type="number"
                                  value={formData.model.temperature}
                                  onChange={(e) => handleModelChange('temperature', parseFloat(e.target.value))}
                                  step="0.1"
                                  min="0"
                                  max="2"
                                  className="w-20 backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20"
                                />
                                <div className="flex-1">
                                  <Slider
                                    value={[formData.model.temperature]}
                                    onValueChange={(value) => handleModelChange('temperature', value[0])}
                                    max={2}
                                    min={0}
                                    step={0.1}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Higher values make responses more creative but less predictable
                              </p>
                            </div>
                            
                            <div className="grid gap-2">
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Maximum Response Length</Label>
                              <Select
                                value={formData.model.maxTokens?.toString() || '2048'}
                                onValueChange={(value) => handleModelChange('maxTokens', parseInt(value))}
                              >
                                <SelectTrigger className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20">
                                  <SelectValue placeholder="Select max tokens" />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-md bg-white/90 dark:bg-slate-800/90 border-white/20 dark:border-slate-700/20">
                                  <SelectItem value="1000">1,000 tokens</SelectItem>
                                  <SelectItem value="2000">2,000 tokens</SelectItem>
                                  <SelectItem value="4000">4,000 tokens</SelectItem>
                                  <SelectItem value="8000">8,000 tokens</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Controls the typical length of responses from your agent.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Agent Type & System Prompt */}
                        <div className="grid gap-4">
                          <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Agent Type & System Prompt</h3>
                            <Button 
                              variant="link" 
                              className="text-xs p-0 h-auto ml-auto text-blue-600 dark:text-blue-400"
                              onClick={() => setFormData(prev => ({ ...prev, showSystemPrompt: !prev.showSystemPrompt }))}
                            >
                              {formData.showSystemPrompt ? 'Hide' : 'Show'} System Prompt
                            </Button>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Define the agent's role and behavior</p>
                          
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Agent Type</Label>
                            <RadioGroup
                              value={formData.agentType}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, agentType: value as any }))}
                              className="grid grid-cols-2 gap-4"
                            >
                              {agentTypeOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2 p-3 border border-white/20 dark:border-slate-700/20 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-slate-800/20">
                                  <RadioGroupItem value={option.value} id={option.value} />
                                  <div className="flex flex-col">
                                    <Label htmlFor={option.value} className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                      {option.label}
                                    </Label>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{option.description}</p>
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>

                          {formData.showSystemPrompt && (
                            <div className="grid gap-2">
                              <Label htmlFor="systemPrompt" className="text-sm font-medium text-slate-700 dark:text-slate-300">System Prompt</Label>
                              <Textarea
                                id="systemPrompt"
                                value={formData.systemPrompt}
                                onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                                placeholder="Enter the system prompt for your agent"
                                className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/20 focus:bg-white/40 dark:focus:bg-slate-800/40"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="knowledge" className="mt-6">
                      <KnowledgeTrainingStatus
                        agentId={agentId!}
                        agentName={agent.name}
                        preloadedKnowledgeSources={agent.knowledgeBases}
                      />
                    </TabsContent>

                    <TabsContent value="guidelines" className="mt-6">
                      <div className="space-y-6">
                        <GuidelinesSection
                          initialGuidelines={formData.guidelines}
                          onChange={handleGuidelinesChange}
                        />
                        
                        {/* Behavior Settings Section */}
                        <Card className="backdrop-blur-sm bg-white/20 dark:bg-slate-800/20 border-white/20 dark:border-slate-700/20">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Settings className="h-5 w-5" />
                              Behavior Settings
                            </CardTitle>
                            <CardDescription>
                              Configure how the agent works and learns
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/20">
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Conversation Memory
                                  </Label>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Enable conversation history so the agent remembers previous interactions
                                  </p>
                                </div>
                                <Switch
                                  checked={formData.behaviorSettings.conversationMemory}
                                  onCheckedChange={(checked) => handleBehaviorSettingChange('conversationMemory', checked)}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-4 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/20">
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Continuous Learning
                                  </Label>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Allow the agent to improve from interactions over time
                                  </p>
                                </div>
                                <Switch
                                  checked={formData.behaviorSettings.continuousLearning}
                                  onCheckedChange={(checked) => handleBehaviorSettingChange('continuousLearning', checked)}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-4 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/20">
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Expert Handoff
                                  </Label>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Allow the agent to escalate to human domain experts when needed
                                  </p>
                                </div>
                                <Switch
                                  checked={formData.behaviorSettings.expertHandoff}
                                  onCheckedChange={(checked) => handleBehaviorSettingChange('expertHandoff', checked)}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-4 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/20">
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    AI to AI Handoff
                                  </Label>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Allow the agent to escalate to other AI agents when needed
                                  </p>
                                </div>
                                <Switch
                                  checked={formData.behaviorSettings.aiToAiHandoff}
                                  onCheckedChange={(checked) => handleBehaviorSettingChange('aiToAiHandoff', checked)}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-4 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/20">
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Multilingual Support
                                  </Label>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Enable automatic translation for non-primary languages
                                  </p>
                                </div>
                                <Switch
                                  checked={formData.behaviorSettings.multilingualSupport}
                                  onCheckedChange={(checked) => handleBehaviorSettingChange('multilingualSupport', checked)}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Collapsible Preview Panel */}
            {!previewCollapsed && (
              <div className="col-span-4">
                <div className="sticky top-24">
                  <Card className="backdrop-blur-md bg-white/40 dark:bg-slate-800/40 border-white/20 dark:border-slate-700/20 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Live Preview</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewCollapsed(true)}
                          className="backdrop-blur-sm bg-white/20 dark:bg-slate-800/20 hover:bg-white/30 dark:hover:bg-slate-700/30 border border-white/20 dark:border-slate-700/20"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        See how your agent will appear to users
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="h-[600px] overflow-hidden rounded-b-lg">
                        <ChatboxPreview
                          agentId={agentId!}
                          primaryColor={formData.appearance.primaryColor}
                          secondaryColor={formData.appearance.secondaryColor}
                          fontFamily={formData.appearance.fontFamily}
                          chatbotName={formData.appearance.chatbotName || 'AI Assistant'}
                          welcomeMessage={formData.appearance.welcomeMessage}
                          buttonText={formData.appearance.buttonText}
                          position={formData.appearance.position}
                          suggestions={formData.appearance.suggestions}
                          className="w-full h-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Collapsed Preview Trigger */}
            {previewCollapsed && (
              <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewCollapsed(false)}
                  className="backdrop-blur-md bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white/60 dark:hover:bg-slate-700/60"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentEdit;
