
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { AlertBanner } from '@/components/ui/alert-banner';
import { AgentModelBadge } from '@/components/agents/AgentModelBadge';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import { useToast } from '@/hooks/use-toast';
import { MODELS, getModelDisplay } from '@/constants/modelOptions';

const API_URL = 'https://api.example.com';
const agentTypes = ['customer-support', 'sales', 'technical', 'general'];

// Mock function to fetch agent
const fetchAgent = async (id) => {
  // In a real app, this would make an API call
  return {
    id,
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries and support requests',
    type: 'customer-support',
    model: 'gpt4',
    prompt: 'You are a helpful customer support agent...',
    active: true,
    knowledge_base_ids: [1, 3],
    knowledge_sources: [
      {
        id: 1,
        name: 'Product Documentation',
        type: 'document',
        training_status: 'success'
      },
      {
        id: 3,
        name: 'FAQ Website',
        type: 'website',
        training_status: 'success'
      }
    ],
    connectors: ['email', 'chat'],
    settings: {
      response_time: 'fast',
      tone: 'professional',
      max_message_length: 500
    }
  };
};

// Mock function to update agent
const updateAgent = async (id, data) => {
  console.log('Updating agent:', id, data);
  // In a real app, this would make an API call
  return { success: true, data };
};

const AgentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentType, setAgentType] = useState('');
  const [model, setModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [knowledgeBaseIds, setKnowledgeBaseIds] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch agent data
  const { data: agent, isLoading, error, refetch } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => fetchAgent(id),
    staleTime: 60000,
    meta: {
      onError: (error) => {
        toast({
          title: 'Error fetching agent',
          description: error.message || 'Could not load agent data',
          variant: 'destructive'
        });
      }
    }
  });
  
  // Set form values when agent data is loaded
  useEffect(() => {
    if (agent) {
      setName(agent.name || '');
      setDescription(agent.description || '');
      setAgentType(agent.type || '');
      setModel(agent.model || '');
      setSystemPrompt(agent.prompt || '');
      setIsActive(agent.active || false);
      setKnowledgeBaseIds(agent.knowledge_base_ids || []);
    }
  }, [agent]);
  
  // Track unsaved changes
  useEffect(() => {
    if (!agent) return;
    
    const hasChanged = 
      name !== agent.name ||
      description !== agent.description ||
      agentType !== agent.type ||
      model !== agent.model ||
      systemPrompt !== agent.prompt ||
      isActive !== agent.active ||
      JSON.stringify(knowledgeBaseIds) !== JSON.stringify(agent.knowledge_base_ids);
    
    setUnsavedChanges(hasChanged);
  }, [name, description, agentType, model, systemPrompt, isActive, knowledgeBaseIds, agent]);
  
  const handleSave = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedAgent = {
        name,
        description,
        type: agentType,
        model,
        prompt: systemPrompt,
        active: isActive,
        knowledge_base_ids: knowledgeBaseIds
      };
      
      const result = await updateAgent(id, updatedAgent);
      
      toast({
        title: 'Agent updated',
        description: 'Your changes have been saved successfully.'
      });
      
      setUnsavedChanges(false);
      refetch();
      
    } catch (error) {
      toast({
        title: 'Failed to update agent',
        description: error.message || 'An error occurred while saving changes',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKnowledgeSourcesChange = (sourceIds) => {
    setKnowledgeBaseIds(sourceIds);
    setUnsavedChanges(true);
  };
  
  // Fetch knowledge sources
  const { data: knowledgeSources } = useQuery({
    queryKey: ['knowledgeSources'],
    queryFn: async () => {
      // In a real app, this would make an API call
      return [];
    },
    staleTime: 60000,
    meta: {
      onSuccess: (data) => {
        console.log('Knowledge sources loaded:', data);
      }
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading agent...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <AlertBanner
          variant="error"
          message="Failed to load agent data. Please try again later."
        />
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/agents')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/agents')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Agent</h1>
          <p className="text-muted-foreground">
            Update your agent's settings and capabilities
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/agents/test/${id}`)}
          >
            Test Agent
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={!unsavedChanges || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
      
      {unsavedChanges && (
        <AlertBanner
          variant="warning"
          message="You have unsaved changes. Click 'Save Changes' to update your agent."
          className="mb-6"
        />
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure your agent's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter a name for your agent"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe what this agent does"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Agent Type</Label>
                  <Select 
                    value={agentType} 
                    onValueChange={setAgentType}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MODELS).map(([key, model]) => (
                        <SelectItem key={key} value={key}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="active" 
                  checked={isActive} 
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
              <CardDescription>
                Define how your agent should behave and respond
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={systemPrompt} 
                onChange={(e) => setSystemPrompt(e.target.value)} 
                placeholder="You are a helpful AI assistant..."
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-2">
                This prompt will guide your agent's behavior and responses. Be specific about its role, tone, and expertise.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Agent Status</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Model</span>
                  <AgentModelBadge model={model} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Knowledge Sources</span>
                  <span className="text-sm font-medium">{knowledgeBaseIds.length}</span>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    {isActive 
                      ? 'This agent is active and will respond to user queries.' 
                      : 'This agent is inactive and will not respond to user queries.'}
                  </p>
                  
                  <Button 
                    variant={isActive ? 'outline' : 'default'} 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsActive(!isActive)}
                  >
                    {isActive ? 'Deactivate Agent' : 'Activate Agent'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <KnowledgeTrainingStatus 
            agentId={id}
            initialSelectedSources={knowledgeBaseIds}
            onSourcesChange={handleKnowledgeSourcesChange}
            preloadedKnowledgeSources={agent?.knowledge_sources}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentEdit;
