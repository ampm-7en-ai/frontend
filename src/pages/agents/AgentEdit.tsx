
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, Brain, MessageSquare, Shield, Users, Settings, Database, FileText, Zap } from 'lucide-react';
import AgentKnowledgeContainer from '@/components/agents/knowledge/AgentKnowledgeContainer';
import GuidelinesSection from '@/components/agents/edit/GuidelinesSection';

const AgentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Agent data state
  const [agentData, setAgentData] = useState({
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries and support tickets',
    model: 'GPT-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are a helpful customer support agent...',
    enableHandoff: true,
    enableEscalation: false,
    aiToAiHandoff: false, // New field for AI to AI handoff
    handoffKeywords: ['human', 'agent', 'escalate'],
    responseDelay: 1000,
    enableTypingIndicator: true,
    maxConversationLength: 50,
    enableConversationSummary: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Simulate API call to load agent data
  useEffect(() => {
    const loadAgentData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Agent data loaded for agent ID:', id);
      } catch (error) {
        console.error('Error loading agent data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadAgentData();
    }
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to save agent data
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Saving agent data:', agentData);
      // Here you would make the actual API call
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateAgentData = (field: string, value: any) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGuidelinesChange = (guidelines: string) => {
    updateAgentData('systemPrompt', guidelines);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Edit Agent</h1>
          <p className="text-muted-foreground">Configure your AI agent settings and behavior</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Brain className="h-4 w-4 mr-2" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <Database className="h-4 w-4 mr-2" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="guidelines">
            <FileText className="h-4 w-4 mr-2" />
            Guidelines
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Zap className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure the basic details of your agent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={agentData.name}
                  onChange={(e) => updateAgentData('name', e.target.value)}
                  placeholder="Enter agent name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={agentData.description}
                  onChange={(e) => updateAgentData('description', e.target.value)}
                  placeholder="Describe what this agent does"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Language Model</Label>
                <Select value={agentData.model} onValueChange={(value) => updateAgentData('model', value)}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPT-4">GPT-4</SelectItem>
                    <SelectItem value="GPT-3.5">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="Claude-2">Claude 2</SelectItem>
                    <SelectItem value="LLaMA-70B">LLaMA 70B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Behavior</CardTitle>
              <CardDescription>Configure how your agent responds to users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature: {agentData.temperature}</Label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={agentData.temperature}
                  onChange={(e) => updateAgentData('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness: Lower values are more deterministic, higher values more creative.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Response Length</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={agentData.maxTokens}
                  onChange={(e) => updateAgentData('maxTokens', parseInt(e.target.value))}
                  min="100"
                  max="4000"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of tokens in agent responses.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Expert handoff</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enableHandoff">Enable Human Handoff</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow the agent to transfer conversations to human agents.
                    </p>
                  </div>
                  <Switch
                    id="enableHandoff"
                    checked={agentData.enableHandoff}
                    onCheckedChange={(checked) => updateAgentData('enableHandoff', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="aiToAiHandoff">AI to AI Handoff</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable the agent to transfer conversations to other AI agents.
                    </p>
                  </div>
                  <Switch
                    id="aiToAiHandoff"
                    checked={agentData.aiToAiHandoff}
                    onCheckedChange={(checked) => updateAgentData('aiToAiHandoff', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enableEscalation">Auto Escalation</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically escalate complex issues to human agents.
                    </p>
                  </div>
                  <Switch
                    id="enableEscalation"
                    checked={agentData.enableEscalation}
                    onCheckedChange={(checked) => updateAgentData('enableEscalation', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Conversation Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enableTypingIndicator">Typing Indicator</Label>
                    <p className="text-xs text-muted-foreground">
                      Show typing indicator when agent is responding.
                    </p>
                  </div>
                  <Switch
                    id="enableTypingIndicator"
                    checked={agentData.enableTypingIndicator}
                    onCheckedChange={(checked) => updateAgentData('enableTypingIndicator', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enableConversationSummary">Conversation Summary</Label>
                    <p className="text-xs text-muted-foreground">
                      Generate summaries for long conversations.
                    </p>
                  </div>
                  <Switch
                    id="enableConversationSummary"
                    checked={agentData.enableConversationSummary}
                    onCheckedChange={(checked) => updateAgentData('enableConversationSummary', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <AgentKnowledgeContainer agentId={id || ''} />
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-6">
          <GuidelinesSection onChange={handleGuidelinesChange} />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced agent behavior and performance settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={agentData.systemPrompt}
                  onChange={(e) => updateAgentData('systemPrompt', e.target.value)}
                  placeholder="Enter system prompt for the agent"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  The system prompt defines the agent's role and behavior.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responseDelay">Response Delay (ms)</Label>
                <Input
                  id="responseDelay"
                  type="number"
                  value={agentData.responseDelay}
                  onChange={(e) => updateAgentData('responseDelay', parseInt(e.target.value))}
                  min="0"
                  max="5000"
                />
                <p className="text-xs text-muted-foreground">
                  Delay before agent responds to make it feel more natural.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxConversationLength">Max Conversation Length</Label>
                <Input
                  id="maxConversationLength"
                  type="number"
                  value={agentData.maxConversationLength}
                  onChange={(e) => updateAgentData('maxConversationLength', parseInt(e.target.value))}
                  min="10"
                  max="200"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of messages in a single conversation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={() => navigate('/agents')}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default AgentEdit;
