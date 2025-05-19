
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bot, Check, Info, Loader2, MessageSquare, Plus, Sparkles, Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import GuidelinesSection from '@/components/agents/edit/GuidelinesSection';
import AgentKnowledgeContainer from '@/components/agents/knowledge/AgentKnowledgeContainer';
import DeploymentDialog from '@/components/agents/DeploymentDialog';
import CleanupDialog from '@/components/agents/CleanupDialog';

// Sample mock data to simulate the agent
const mockAgent = {
  id: '16',
  name: 'Customer Support Agent',
  description: 'Handles customer inquiries and support tickets',
  model: 'GPT-4',
  status: 'active',
  role: 'support',
  prompt: 'You are a helpful customer support agent for our product. Answer user questions politely and accurately.',
  guidelines: {
    dos: [
      'Be polite and professional',
      'Provide accurate information',
      'Ask for clarification when needed'
    ],
    donts: [
      'Share sensitive company information',
      'Make promises about future features',
      'Be rude or dismissive'
    ]
  },
  suggestions: [
    'How do I reset my password?',
    'What are your business hours?',
    'How do I contact a human agent?'
  ],
  knowledgeSources: [
    { id: 1, name: 'Product Documentation', type: 'file', status: 'active' },
    { id: 2, name: 'FAQ Database', type: 'database', status: 'active' }
  ]
};

const AgentEdit = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  const [deploymentOpen, setDeploymentOpen] = useState(false);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  useEffect(() => {
    // Simulate loading agent data
    setLoading(true);
    setTimeout(() => {
      setAgent(mockAgent);
      setLoading(false);
      // Set showSuggestions based on whether the agent has suggestions
      setShowSuggestions(mockAgent.suggestions && mockAgent.suggestions.length > 0);
    }, 500);
  }, [agentId]);
  
  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Agent updated",
        description: "Your changes have been saved successfully."
      });
    }, 1000);
  };
  
  const handleAgentChange = (field: string, value: any) => {
    setAgent(prev => ({ ...prev, [field]: value }));
  };

  const handleGuidelinesChange = (updatedGuidelines: { dos: string[], donts: string[] }) => {
    setAgent(prev => ({ ...prev, guidelines: updatedGuidelines }));
  };
  
  const handleAddSuggestion = () => {
    setAgent(prev => ({
      ...prev,
      suggestions: [...(prev.suggestions || []), '']
    }));
  };
  
  const handleRemoveSuggestion = (index: number) => {
    setAgent(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter((_: any, i: number) => i !== index)
    }));
  };
  
  const handleUpdateSuggestion = (index: number, value: string) => {
    setAgent(prev => ({
      ...prev,
      suggestions: prev.suggestions.map((s: string, i: number) => i === index ? value : s)
    }));
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!agent) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Agent not found or you don't have permission to edit it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/agents')} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={agent.status === 'active' ? 'success' : 'outline'}>
            {agent.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
          <Button variant="outline" className="gap-1" onClick={() => setCleanupOpen(true)}>
            <Trash className="h-4 w-4" /> 
            Cleanup
          </Button>
          <Button variant="outline" className="gap-1" onClick={() => navigate(`/agents/${agentId}/test`)}>
            <MessageSquare className="h-4 w-4" /> 
            Test Chat
          </Button>
          <Button className="gap-1" onClick={() => setDeploymentOpen(true)}>
            <Sparkles className="h-4 w-4" /> 
            Deploy
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8" /> 
            {agent.name}
          </h1>
          <p className="text-muted-foreground">{agent.description}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Sources</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General settings for your AI agent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input 
                    id="name" 
                    value={agent.name} 
                    onChange={e => handleAgentChange('name', e.target.value)}
                    placeholder="Enter agent name" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={agent.description} 
                    onChange={e => handleAgentChange('description', e.target.value)}
                    placeholder="Enter a description for this agent" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={agent.role} 
                    onValueChange={value => handleAgentChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Customer Support</SelectItem>
                      <SelectItem value="sales">Sales Assistant</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="general">General Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
              <CardDescription>Define how your agent should behave.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={agent.prompt} 
                onChange={e => handleAgentChange('prompt', e.target.value)}
                placeholder="Enter system prompt" 
                className="min-h-[150px]"
              />
              <div className="mt-2 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-1" />
                The system prompt sets the behavior and tone of your AI agent.
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
              <CardDescription>Set behavioral guidelines for your agent.</CardDescription>
            </CardHeader>
            <CardContent>
              <GuidelinesSection 
                initialGuidelines={agent.guidelines} 
                onChange={handleGuidelinesChange} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Suggested Questions</CardTitle>
                <CardDescription>
                  Add quick questions users can click to engage with your agent.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Enable suggestions</span>
                <Switch 
                  checked={showSuggestions}
                  onCheckedChange={setShowSuggestions}
                />
              </div>
            </CardHeader>
            <CardContent>
              {showSuggestions && (
                <>
                  <div className="space-y-2 mb-4">
                    {agent.suggestions && agent.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={suggestion}
                          onChange={(e) => handleUpdateSuggestion(index, e.target.value)}
                          placeholder="Enter a suggested question"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSuggestion(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSuggestion}
                    className="flex gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Suggestion
                  </Button>
                </>
              )}
              {!showSuggestions && (
                <div className="text-sm text-muted-foreground">
                  Suggested questions are disabled. Enable them using the toggle above.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Sources</CardTitle>
              <CardDescription>Connect knowledge sources to enhance your agent's capabilities.</CardDescription>
            </CardHeader>
            <CardContent>
              <AgentKnowledgeContainer 
                agentId={agent.id}
                knowledgeBases={agent.knowledgeSources}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced parameters for your agent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select 
                  value={agent.model} 
                  onValueChange={value => handleAgentChange('model', value)}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPT-4">GPT-4</SelectItem>
                    <SelectItem value="GPT-3.5">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="Claude-2">Claude 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={agent.status} 
                  onValueChange={value => handleAgentChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <DeploymentDialog open={deploymentOpen} onOpenChange={setDeploymentOpen} agent={agent} />
      <CleanupDialog 
        open={cleanupOpen} 
        onOpenChange={setCleanupOpen} 
        agentId={agent.id} 
        knowledgeSources={agent.knowledgeSources || []}
      />
    </div>
  );
};

export default AgentEdit;
