
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Settings, FileText, MessageSquare, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GuidelinesSection from '@/components/agents/edit/GuidelinesSection';
import AgentKnowledgeContainer from '@/components/agents/knowledge/AgentKnowledgeContainer';

const AgentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Agent configuration state
  const [agentName, setAgentName] = useState('Customer Support Agent');
  const [agentDescription, setAgentDescription] = useState('Handles customer inquiries and support tickets');
  const [model, setModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful customer support agent. Be friendly, professional, and provide accurate information to help customers with their inquiries.');
  
  // Behavior settings
  const [enableFallback, setEnableFallback] = useState(true);
  const [enableLogging, setEnableLogging] = useState(true);
  const [aiToAiHandoff, setAiToAiHandoff] = useState(false);
  const [responseTimeLimit, setResponseTimeLimit] = useState(30);
  const [maxConversationLength, setMaxConversationLength] = useState(50);

  const handleSave = () => {
    // TODO: Implement save functionality
    toast({
      title: "Agent Updated",
      description: "Your agent configuration has been saved successfully.",
    });
  };

  const handleBack = () => {
    navigate('/agents');
  };

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agents
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Edit Agent</h1>
          <p className="text-muted-foreground">Configure your AI agent settings and behavior</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Brain className="h-4 w-4 mr-2" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <FileText className="h-4 w-4 mr-2" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="guidelines">
            <MessageSquare className="h-4 w-4 mr-2" />
            Guidelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure the basic settings for your agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Language Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-2">Claude 2</SelectItem>
                      <SelectItem value="llama-70b">LLaMA 70B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent-description">Description</Label>
                <Textarea
                  id="agent-description"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder="Describe what this agent does"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter the system prompt that defines the agent's behavior"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness (0 = deterministic, 1 = creative)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="1"
                    max="4096"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum response length
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Settings</CardTitle>
              <CardDescription>Configure how your agent behaves during conversations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <Label htmlFor="enable-fallback" className="block mb-1">Enable Fallback Responses</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow the agent to provide predefined responses when uncertain
                  </p>
                </div>
                <Switch
                  id="enable-fallback"
                  checked={enableFallback}
                  onCheckedChange={setEnableFallback}
                />
              </div>

              <Separator />

              <div className="flex justify-between items-start">
                <div>
                  <Label htmlFor="enable-logging" className="block mb-1">Conversation Logging</Label>
                  <p className="text-xs text-muted-foreground">
                    Store all conversations for analysis and improvement
                  </p>
                </div>
                <Switch
                  id="enable-logging"
                  checked={enableLogging}
                  onCheckedChange={setEnableLogging}
                />
              </div>

              <Separator />

              <div className="flex justify-between items-start">
                <div>
                  <Label htmlFor="ai-to-ai-handoff" className="block mb-1">AI to AI Handoff</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable this agent to hand off conversations to other specialized AI agents
                  </p>
                </div>
                <Switch
                  id="ai-to-ai-handoff"
                  checked={aiToAiHandoff}
                  onCheckedChange={setAiToAiHandoff}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response-time-limit">Response Time Limit (seconds)</Label>
                  <Input
                    id="response-time-limit"
                    type="number"
                    min="5"
                    max="120"
                    value={responseTimeLimit}
                    onChange={(e) => setResponseTimeLimit(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum time to wait for a response
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-conversation-length">Max Conversation Length</Label>
                  <Input
                    id="max-conversation-length"
                    type="number"
                    min="10"
                    max="200"
                    value={maxConversationLength}
                    onChange={(e) => setMaxConversationLength(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of messages in a conversation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6 mt-6">
          <AgentKnowledgeContainer />
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-6 mt-6">
          <GuidelinesSection />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8 pt-6 border-t">
        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentEdit;
