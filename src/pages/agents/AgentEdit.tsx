
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Settings, Brain, MessageSquare, Globe, Palette } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';

// Mock agent data
const mockAgent = {
  id: '1',
  name: 'Customer Support Bot',
  description: 'Helpful customer service assistant',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: 'You are a helpful customer service assistant. Be polite and professional.',
  isActive: true,
  knowledgeBase: ['FAQ Document', 'Product Manual'],
  customInstructions: 'Always ask for order number when helping with orders.',
  welcomeMessage: 'Hello! How can I help you today?',
  language: 'en',
  responseStyle: 'professional',
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b'
};

const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { value: 'claude-2', label: 'Claude 2', description: 'Anthropic model' },
  { value: 'claude-instant', label: 'Claude Instant', description: 'Fast Claude model' }
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' }
];

const responseStyleOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and informal' },
  { value: 'concise', label: 'Concise', description: 'Brief and to the point' }
];

const AgentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState(mockAgent);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch the agent data here
    console.log('Loading agent with ID:', id);
  }, [id]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Agent Updated",
        description: "Your agent settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAgent = (updates: Partial<typeof agent>) => {
    setAgent(prev => ({ ...prev, ...updates }));
  };

  return (
    <MainLayout 
      pageTitle="Edit Agent" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Agents', href: '/agents' },
        { label: agent.name, href: '#' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/agents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              checked={agent.isActive}
              onCheckedChange={(checked) => updateAgent({ isActive: checked })}
            />
            <Label>Active</Label>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="model" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Model & Behavior
            </TabsTrigger>
            <TabsTrigger value="interface" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Configure the basic settings for your agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name</Label>
                    <Input
                      id="name"
                      value={agent.name}
                      onChange={(e) => updateAgent({ name: e.target.value })}
                      placeholder="Enter agent name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <ModernDropdown
                      value={agent.language}
                      onValueChange={(value) => updateAgent({ language: value })}
                      options={languageOptions}
                      placeholder="Select language"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={agent.description}
                    onChange={(e) => updateAgent({ description: e.target.value })}
                    placeholder="Describe what this agent does"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="model" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Configuration</CardTitle>
                <CardDescription>
                  Configure the AI model and its behavior parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <ModernDropdown
                      value={agent.model}
                      onValueChange={(value) => updateAgent({ model: value })}
                      options={modelOptions}
                      placeholder="Select AI model"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responseStyle">Response Style</Label>
                    <ModernDropdown
                      value={agent.responseStyle}
                      onValueChange={(value) => updateAgent({ responseStyle: value })}
                      options={responseStyleOptions}
                      placeholder="Select response style"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">
                      Temperature: {agent.temperature}
                    </Label>
                    <input
                      type="range"
                      id="temperature"
                      min="0"
                      max="1"
                      step="0.1"
                      value={agent.temperature}
                      onChange={(e) => updateAgent({ temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Focused</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={agent.maxTokens}
                      onChange={(e) => updateAgent({ maxTokens: parseInt(e.target.value) })}
                      min="100"
                      max="4000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={agent.systemPrompt}
                    onChange={(e) => updateAgent({ systemPrompt: e.target.value })}
                    placeholder="Enter system instructions for the agent"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customInstructions">Custom Instructions</Label>
                  <Textarea
                    id="customInstructions"
                    value={agent.customInstructions}
                    onChange={(e) => updateAgent({ customInstructions: e.target.value })}
                    placeholder="Additional instructions for specific behaviors"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interface" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interface Settings</CardTitle>
                <CardDescription>
                  Customize how users interact with your agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={agent.welcomeMessage}
                    onChange={(e) => updateAgent({ welcomeMessage: e.target.value })}
                    placeholder="Enter the first message users will see"
                    rows={2}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Knowledge Base</Label>
                      <p className="text-sm text-muted-foreground">
                        Documents and data sources for the agent
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Knowledge
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {agent.knowledgeBase.map((kb, index) => (
                      <Badge key={index} variant="secondary">
                        {kb}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Customization</CardTitle>
                <CardDescription>
                  Customize the visual appearance of your agent's interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={agent.primaryColor}
                        onChange={(e) => updateAgent({ primaryColor: e.target.value })}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={agent.primaryColor}
                        onChange={(e) => updateAgent({ primaryColor: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={agent.secondaryColor}
                        onChange={(e) => updateAgent({ secondaryColor: e.target.value })}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={agent.secondaryColor}
                        onChange={(e) => updateAgent({ secondaryColor: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AgentEdit;
