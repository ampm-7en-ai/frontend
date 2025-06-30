
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, EyeOff, Settings, MessageSquare, Book, Zap, ChevronRight, ChevronLeft, Palette, Cog } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AgentKnowledgeContainer from '@/components/agents/knowledge/AgentKnowledgeContainer';
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
}

const AgentEdit = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  
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
    }
  });
  
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch agent data
  const { data: agent, isLoading, error } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async (): Promise<Agent> => {
      const token = getAccessToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/`), {
        headers: getAuthHeaders(token)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agent: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    },
    enabled: !!agentId
  });

  // Update form data when agent data is loaded
  useEffect(() => {
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
        }
      });
    }
  }, [agent]);

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

  const handleGuidelinesChange = (guidelines: { dos: string[]; donts: string[] }) => {
    setFormData(prev => ({
      ...prev,
      guidelines
    }));
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading agent...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Header */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={ArrowLeft}
                  onClick={() => navigate('/agents')}
                >
                  Back
                </ModernButton>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
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
                  className="ml-2"
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
                >
                  {previewCollapsed ? 'Show Preview' : 'Hide Preview'}
                </ModernButton>
                <ModernButton
                  variant="gradient"
                  icon={Save}
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
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
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <CardTitle className="text-lg">Agent Configuration</CardTitle>
                  </div>
                  <CardDescription>
                    Configure your agent's behavior, knowledge, and settings
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-slate-100/70 dark:bg-slate-700/70">
                      <TabsTrigger value="general" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        General
                      </TabsTrigger>
                      <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Appearance
                      </TabsTrigger>
                      <TabsTrigger value="advanced" className="flex items-center gap-2">
                        <Cog className="h-4 w-4" />
                        Advanced Settings
                      </TabsTrigger>
                      <TabsTrigger value="knowledge" className="flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        Knowledge
                      </TabsTrigger>
                      <TabsTrigger value="guidelines" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Guidelines & Behavior
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6 mt-6">
                      <div className="grid gap-6">
                        <div className="grid gap-2">
                          <Label htmlFor="name" className="text-sm font-medium">Agent Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter agent name"
                            className="bg-white/50 dark:bg-slate-800/50"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe what this agent does"
                            className="bg-white/50 dark:bg-slate-800/50 min-h-[100px]"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="systemPrompt" className="text-sm font-medium">System Prompt</Label>
                          <Textarea
                            id="systemPrompt"
                            value={formData.systemPrompt}
                            onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                            placeholder="Enter the system prompt for your agent"
                            className="bg-white/50 dark:bg-slate-800/50 min-h-[200px]"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-6 mt-6">
                      <div className="grid gap-6">
                        <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                          <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Customize how your agent appears to users. This section will contain appearance customization options.
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-6 mt-6">
                      <div className="grid gap-6">
                        <div className="grid gap-2">
                          <Label className="text-sm font-medium">Model Settings</Label>
                          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="grid gap-4">
                              <div>
                                <Label className="text-xs text-slate-600 dark:text-slate-400">Selected Model</Label>
                                <p className="font-mono text-sm">{formData.model.selectedModel}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-600 dark:text-slate-400">Temperature</Label>
                                <p className="font-mono text-sm">{formData.model.temperature}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-600 dark:text-slate-400">Max Tokens</Label>
                                <p className="font-mono text-sm">{formData.model.maxTokens}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="knowledge" className="mt-6">
                      <AgentKnowledgeContainer agentId={agentId!} />
                    </TabsContent>

                    <TabsContent value="guidelines" className="mt-6">
                      <GuidelinesSection
                        initialGuidelines={formData.guidelines}
                        onChange={handleGuidelinesChange}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Collapsible Preview Panel */}
            {!previewCollapsed && (
              <div className="col-span-4">
                <div className="sticky top-24">
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <CardTitle className="text-lg">Live Preview</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewCollapsed(true)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        See how your agent will appear to users
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="h-[600px] overflow-hidden rounded-b-lg">
                        <ChatboxPreview
                          agentId={agentId!}
                          primaryColor="#3b82f6"
                          secondaryColor="#f8fafc"
                          fontFamily="Inter"
                          chatbotName={formData.name || 'AI Assistant'}
                          welcomeMessage="Hello! How can I help you today?"
                          buttonText="Chat with us"
                          position="bottom-right"
                          suggestions={[]}
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
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-200"
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
