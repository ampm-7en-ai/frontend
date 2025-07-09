import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Settings, MessageSquare, BookOpen, Play, MoreVertical, Brain, Bot, Zap, Users, Globe, Lock, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { TestPageLayout } from '@/components/layout/TestPageLayout';
import AgentKnowledgeContainer from '@/components/agents/knowledge/AgentKnowledgeContainer';
import { KnowledgeTrainingStatus } from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import { GuidelinesSection } from '@/components/agents/edit/GuidelinesSection';
import { EnhancedKnowledgeSourceList } from '@/components/agents/builder/EnhancedKnowledgeSourceList';

// Mock data for demonstration
const mockAgent = {
  id: '1',
  name: 'Sales Agent',
  description: 'An AI agent for handling sales inquiries.',
  type: 'Sales',
  model: 'GPT-3.5',
  status: 'active',
  settings: {
    temperature: 0.7,
    maxTokens: 200,
  },
  knowledge: [
    { id: 'k1', name: 'Product Catalog', type: 'file' },
    { id: 'k2', name: 'FAQ', type: 'url' },
  ],
  guidelines: 'Always be polite and professional.',
  privacy: 'public',
  visibility: 'visible',
};

// Mock function to simulate saving agent data
const saveAgentData = async (agentData: any) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log('Agent data saved:', agentData);
  return { success: true, message: 'Agent saved successfully!' };
};

// Define types for agent properties
interface AgentSettings {
  temperature: number;
  maxTokens: number;
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  model: string;
  status: string;
  settings: AgentSettings;
  knowledge: KnowledgeSource[];
  guidelines: string;
  privacy: string;
  visibility: string;
}

const AgentEdit = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [agent, setAgent] = useState<Agent>(mockAgent);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  useEffect(() => {
    // Fetch agent data based on agentId (replace with actual API call)
    // For now, using mockAgent
    setAgent(mockAgent);
  }, [agentId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAgent(prevAgent => ({
      ...prevAgent,
      [name]: value,
    }));
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) : value;

    setAgent(prevAgent => ({
      ...prevAgent,
      settings: {
        ...prevAgent.settings,
        [name]: parsedValue,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate saving the agent data
      const result = await saveAgentData(agent);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        // Redirect to the agents list page after successful save
        navigate('/agents');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save agent.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the agent.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrivacyChange = (privacySetting: string) => {
    setAgent(prevAgent => ({
      ...prevAgent,
      privacy: privacySetting,
    }));
  };

  const handleVisibilityChange = (visibilitySetting: string) => {
    setAgent(prevAgent => ({
      ...prevAgent,
      visibility: visibilitySetting,
    }));
  };

  const isTestPage = location.pathname.includes('/test');

  if (!agent) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isTestPage ? (
        <TestPageLayout agent={agent}>
          <Outlet />
        </TestPageLayout>
      ) : (
        <div>
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/agents')}
            className="absolute top-4 left-4 md:top-6 md:left-6 z-10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="container relative pb-20">
            <div className="flex items-center justify-between pt-12">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6" />
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <Badge variant="secondary">{agent.status}</Badge>
              </div>

              <div className="space-x-2">
                <Button variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Test Agent
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2 !mb-0" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="test" onClick={() => navigate(`/agents/${agentId}/test`)}>
                  Test
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          value={agent.name}
                          onChange={handleInputChange}
                          placeholder="Agent Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={agent.type} onValueChange={(value) => setAgent(prevAgent => ({ ...prevAgent, type: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Support">Support</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={agent.description}
                        onChange={handleInputChange}
                        placeholder="Agent Description"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="knowledge" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Base</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <KnowledgeTrainingStatus agentId={agentId} />
                    <AgentKnowledgeContainer agentId={agentId} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guidelines" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GuidelinesSection agentId={agentId} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="temperature">Temperature</Label>
                        <Input
                          type="number"
                          id="temperature"
                          name="temperature"
                          value={String(agent.settings.temperature)}
                          onChange={handleSettingsChange}
                          placeholder="Temperature"
                          min="0"
                          max="1"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxTokens">Max Tokens</Label>
                        <Input
                          type="number"
                          id="maxTokens"
                          name="maxTokens"
                          value={String(agent.settings.maxTokens)}
                          onChange={handleSettingsChange}
                          placeholder="Max Tokens"
                        />
                      </div>
                    </div>

                    <div>
                      <Button variant="secondary" onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
                        {showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                      </Button>
                    </div>

                    {showAdvancedSettings && (
                      <div className="border rounded-md p-4">
                        <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="model">Model</Label>
                            <Select value={agent.model} onValueChange={(value) => setAgent(prevAgent => ({ ...prevAgent, model: value }))}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
                                <SelectItem value="GPT-4">GPT-4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="apiKey">API Key</Label>
                            <div className="relative">
                              <Input
                                type={isApiKeyVisible ? 'text' : 'password'}
                                id="apiKey"
                                name="apiKey"
                                value="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // Replace with actual API key storage/retrieval
                                readOnly
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                              >
                                {isApiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium leading-6 text-gray-900">
                        Privacy
                      </Label>
                      <p className="mt-1 text-sm text-gray-500">
                        Set the privacy of this agent.
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="public"
                            name="privacy"
                            value="public"
                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={agent.privacy === 'public'}
                            onChange={() => handlePrivacyChange('public')}
                          />
                          <label htmlFor="public" className="block text-sm font-medium text-gray-700">
                            Public
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="private"
                            name="privacy"
                            value="private"
                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={agent.privacy === 'private'}
                            onChange={() => handlePrivacyChange('private')}
                          />
                          <label htmlFor="private" className="block text-sm font-medium text-gray-700">
                            Private
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium leading-6 text-gray-900">
                        Visibility
                      </Label>
                      <p className="mt-1 text-sm text-gray-500">
                        Set the visibility of this agent.
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="visible"
                            name="visibility"
                            value="visible"
                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={agent.visibility === 'visible'}
                            onChange={() => handleVisibilityChange('visible')}
                          />
                          <label htmlFor="visible" className="block text-sm font-medium text-gray-700">
                            Visible
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="hidden"
                            name="visibility"
                            value="hidden"
                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={agent.visibility === 'hidden'}
                            onChange={() => handleVisibilityChange('hidden')}
                          />
                          <label htmlFor="hidden" className="block text-sm font-medium text-gray-700">
                            Hidden
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                {/* This content is now rendered via the TestPageLayout */}
                <Outlet />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentEdit;
