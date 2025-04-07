import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, Save, Bot, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import KnowledgeSourcesSection from '@/components/agents/knowledge/KnowledgeSourcesSection';
import { API_ENDPOINTS, getApiUrl, getAuthHeaders, getAccessToken, fetchAgentDetails, updateAgent, addKnowledgeSourcesToAgent } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AgentDetails {
  id: string;
  name: string;
  description: string;
  model: string;
  status: string;
  knowledge_bases: any[];
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    avatar: {
      type: string;
      src: string;
    };
    welcomeMessage: string;
  };
  systemPrompt: string;
}

const AgentEdit = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentModel, setAgentModel] = useState('');
  const [agentStatus, setAgentStatus] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#9b87f5');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [avatarType, setAvatarType] = useState('default');
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [avatarSrc, setAvatarSrc] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<string[]>([]);
  const [availableKnowledgeSources, setAvailableKnowledgeSources] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingKnowledgeSources, setIsLoadingKnowledgeSources] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Fetch agent details
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      try {
        const agentData = await fetchAgentDetails(agentId);
        return agentData;
      } catch (error) {
        console.error("Error fetching agent details:", error);
        throw error;
      }
    },
    enabled: !!agentId,
    retry: 1,
  });

  // Initialize form state with agent data
  useEffect(() => {
    if (agent) {
      setAgentName(agent.name);
      setAgentDescription(agent.description);
      setAgentModel(agent.model?.name || '');
      setAgentStatus(agent.status);
      setPrimaryColor(agent.appearance?.primaryColor || '#9b87f5');
      setSecondaryColor(agent.appearance?.secondaryColor || '#ffffff');
      setAvatarType(agent.appearance?.avatar?.type || 'default');
      setAvatarSrc(agent.appearance?.avatar?.src || '');
      setWelcomeMessage(agent.appearance?.welcomeMessage || '');
      setSystemPrompt(agent.systemPrompt || '');
      
      // Initialize selected knowledge sources
      setSelectedKnowledgeSources(agent.knowledge_bases?.map((kb: any) => kb.id.toString()) || []);
    }
  }, [agent]);

  // Fetch available knowledge sources
  const { isLoading: isKnowledgeBasesLoading } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: async () => {
      setIsLoadingKnowledgeSources(true);
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${getApiUrl(API_ENDPOINTS.KNOWLEDGEBASE)}`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }

      const data = await response.json();
      setAvailableKnowledgeSources(data);
      return data;
    },
    onSuccess: () => {
      setIsLoadingKnowledgeSources(false);
    },
    onError: () => {
      setIsLoadingKnowledgeSources(false);
    },
    retry: 1,
  });

  // Mutation for updating agent details
  const updateAgentMutation = useMutation({
    mutationFn: async (updatedAgentData: any) => {
      if (!agentId) throw new Error("Agent ID is required");
      return updateAgent(agentId, updatedAgentData);
    },
    onSuccess: () => {
      toast({
        title: "Agent Updated",
        description: `${agentName} has been successfully updated.`,
      });
      queryClient.invalidateQueries({queryKey: ['agent', agentId]});
      navigate('/agents');
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update agent.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Mutation for adding knowledge sources to agent
  const addKnowledgeSourcesMutation = useMutation({
    mutationFn: async () => {
      if (!agentId) throw new Error("Agent ID is required");
      
      // Convert selectedKnowledgeSources to numbers
      const knowledgeSources = availableKnowledgeSources
        .filter((kb: any) => selectedKnowledgeSources.includes(kb.id.toString()))
        .map((kb: any) => kb.id);
      
      return addKnowledgeSourcesToAgent(agentId, knowledgeSources, selectedKnowledgeSources);
    },
    onSuccess: () => {
      toast({
        title: "Knowledge Sources Updated",
        description: "Knowledge sources have been successfully updated.",
      });
      queryClient.invalidateQueries({queryKey: ['agent', agentId]});
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update knowledge sources.",
        variant: "destructive",
      });
    },
  });

  const handleAgentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgentName(e.target.value);
    if (e.target.value.trim()) setNameError(false);
  };

  const handleAgentDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAgentDescription(e.target.value);
    if (e.target.value.trim()) setDescriptionError(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomAvatarFile(file);
      setAvatarType('custom');
      
      // Create a local URL for display purposes
      const url = URL.createObjectURL(file);
      setAvatarSrc(url);
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!agentName.trim()) {
      setNameError(true);
      isValid = false;
    }

    if (!agentDescription.trim()) {
      setDescriptionError(true);
      isValid = false;
    }

    if (!isValid) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields before saving.",
        variant: "destructive"
      });
    }

    return isValid;
  };

  const handleSaveAgent = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const agentData = {
        name: agentName,
        description: agentDescription,
        model: { name: agentModel },
        status: agentStatus,
        appearance: {
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          avatar: {
            type: avatarType,
            src: avatarSrc,
          },
          welcomeMessage: welcomeMessage,
        },
        systemPrompt: systemPrompt,
        customAvatarFile: customAvatarFile,
      };

      await updateAgentMutation.mutateAsync(agentData);
      await addKnowledgeSourcesMutation.mutateAsync();
    } catch (error) {
      console.error("Error updating agent:", error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred while updating the agent.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async () => {
    setIsDeleting(true);
    
    const token = getAccessToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to delete an agent.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    try {
      const response = await fetch(`${getApiUrl(API_ENDPOINTS.AGENTS)}${agentId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `Failed to delete agent: ${response.status}`);
      }
      
      toast({
        title: "Agent Deleted",
        description: `${agentName} has been successfully deleted.`,
      });
      
      navigate('/agents');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  if (isLoadingAgent) {
    return (
      <div className="space-y-4 p-8 text-center">
        <LoadingSpinner text="Loading agent information..." />
      </div>
    );
  }

  if (!agent && !isLoadingAgent) {
    return (
      <div className="space-y-4 p-8 text-center">
        <h3 className="text-lg font-medium">Agent not found</h3>
        <p className="text-muted-foreground">The requested agent could not be found or you don't have access to it.</p>
        <Button asChild>
          <Link to="/agents">Back to Agents</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link to="/agents">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Agent</h1>
          <p className="text-muted-foreground">Modify your AI agent's settings and behavior</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
          <CardDescription>Update your agent's identity and purpose</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name" className="flex items-center">
                Agent Name <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="agent-name"
                placeholder="e.g., Customer Support Assistant"
                value={agentName}
                onChange={handleAgentNameChange}
                className={nameError ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {nameError && (
                <p className="text-destructive text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Agent name is required
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-description" className="flex items-center">
                Description <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea
                id="agent-description"
                placeholder="Describe what this agent does and how it helps users"
                className={`min-h-[100px] ${descriptionError ? "border-destructive" : ""}`}
                value={agentDescription}
                onChange={handleAgentDescriptionChange}
                disabled={isSubmitting}
              />
              {descriptionError && (
                <p className="text-destructive text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Agent description is required
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-model">Model</Label>
                <Select value={agentModel} onValueChange={setAgentModel} disabled={isSubmitting}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="claude-3">Claude-3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-status">Status</Label>
                <Select value={agentStatus} onValueChange={setAgentStatus} disabled={isSubmitting}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Live">Live</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize your agent's look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="avatar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="welcome">Welcome Message</TabsTrigger>
            </TabsList>
            <TabsContent value="avatar" className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  {avatarType === 'custom' && avatarSrc ? (
                    <img src={avatarSrc} alt="Custom Avatar" className="object-cover h-full w-full" />
                  ) : (
                    <AvatarFallback>
                      <Bot className="h-6 w-6" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium">Agent Avatar</h3>
                  <p className="text-xs text-muted-foreground">Choose an avatar for your agent</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar-type">Avatar Type</Label>
                <Select value={avatarType} onValueChange={setAvatarType} disabled={isSubmitting}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select avatar type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {avatarType === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-avatar">Custom Avatar</Label>
                  <Input
                    id="custom-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">Upload a custom image for your agent's avatar</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <Input
                    type="color"
                    id="primary-color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">Choose a primary color for your agent's interface</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <Input
                    type="color"
                    id="secondary-color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">Choose a secondary color for accents</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="welcome" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  placeholder="e.g., Hello! How can I help you today?"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">Customize the message your agent displays when a user starts a conversation</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Behavior</CardTitle>
          <CardDescription>Define how your agent responds and interacts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                placeholder="e.g., You are a helpful AI assistant that provides accurate and concise information."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                The system prompt guides the agent's behavior and personality.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <KnowledgeSourcesSection
        agentId={agentId || ''}
        selectedKnowledgeSources={selectedKnowledgeSources}
        setSelectedKnowledgeSources={setSelectedKnowledgeSources}
        availableKnowledgeSources={availableKnowledgeSources}
        isLoading={isKnowledgeBasesLoading}
      />

      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground flex items-center">
          <span className="text-destructive mr-1">*</span> Required fields
        </p>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => setShowDeleteConfirmation(true)} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Agent
              </>
            )}
          </Button>
          <Button onClick={handleSaveAgent} disabled={isSubmitting || !agentName || !agentDescription}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
      </CardFooter>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="max-w-md w-full p-6">
            <CardHeader>
              <CardTitle className="text-lg">Confirm Deletion</CardTitle>
              <CardDescription>Are you sure you want to delete this agent? This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAgent} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Agent"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AgentEdit;
