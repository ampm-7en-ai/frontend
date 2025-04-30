import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS, getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import useAgentGuidelines from '@/hooks/useAgentGuidelines';
import AgentGuidelinesSection from '@/components/agents/edit/AgentGuidelinesSection';

const AgentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Agent data state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [maxLength, setMaxLength] = useState(800);
  const [isPublic, setIsPublic] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<any[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  
  // Behavior settings
  const [greeting, setGreeting] = useState('Hello! How can I help you today?');
  const [contextWindow, setContextWindow] = useState(10);
  const [useMemory, setUseMemory] = useState(true);
  const [memoryWindow, setMemoryWindow] = useState(50);
  
  // Use our new hook for managing guidelines
  const { 
    guidelines, 
    setGuidelines,
    addGuideline, 
    removeGuideline, 
    updateGuideline,
    formatGuidelinesForApi
  } = useAgentGuidelines();

  // Fetch agent data
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const token = getAccessToken();
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to edit agents",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        
        const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${id}/`), {
          headers: getAuthHeaders(token),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agent: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Populate form with agent data
        setName(data.name || '');
        setDescription(data.description || '');
        setSystemPrompt(data.systemPrompt || '');
        setSelectedModel(data.model?.selectedModel || 'gpt-4');
        setTemperature(data.model?.temperature || 0.7);
        setMaxLength(data.model?.maxLength || 800);
        setIsPublic(data.isPublic || false);
        setKnowledgeSources(data.knowledge_bases || []);
        setAvatar(data.appearance?.avatar?.src || null);
        setPrimaryColor(data.appearance?.primaryColor || '#6366f1');
        
        // Behavior settings
        setGreeting(data.behavior?.greeting || 'Hello! How can I help you today?');
        setContextWindow(data.behavior?.contextWindow || 10);
        setUseMemory(data.behavior?.useMemory !== false);
        setMemoryWindow(data.behavior?.memoryWindow || 50);
        
        // Guidelines
        if (data.behavior?.guidelines) {
          const existingGuidelines = data.behavior.guidelines;
          const formattedGuidelines = [];
          
          // Get the maximum length of dos and donts arrays
          const maxLength = Math.max(
            existingGuidelines.dos?.length || 0,
            existingGuidelines.donts?.length || 0
          );
          
          // Create paired guidelines
          for (let i = 0; i < maxLength; i++) {
            formattedGuidelines.push({
              dos: existingGuidelines.dos?.[i] || '',
              donts: existingGuidelines.donts?.[i] || ''
            });
          }
          
          // If no guidelines were found, add an empty one
          if (formattedGuidelines.length === 0) {
            formattedGuidelines.push({ dos: '', donts: '' });
          }
          
          setGuidelines(formattedGuidelines);
        }
        
      } catch (error) {
        console.error('Error fetching agent:', error);
        toast({
          title: "Error",
          description: "Failed to load agent data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgentData();
  }, [id, navigate, toast, setGuidelines]);

  const handleSaveAgent = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const token = getAccessToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save agents",
          variant: "destructive",
        });
        return;
      }
      
      // Format guidelines for API
      const guidelinesData = formatGuidelinesForApi();
      
      const payload = {
        name,
        description,
        systemPrompt,
        model: {
          selectedModel,
          temperature,
          maxLength,
        },
        isPublic,
        appearance: {
          avatar: avatar ? { src: avatar } : null,
          primaryColor,
        },
        behavior: {
          greeting,
          contextWindow,
          useMemory,
          memoryWindow,
          guidelines: guidelinesData
        }
      };
      
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${id}/`), {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update agent: ${response.status}`);
      }
      
      toast({
        title: "Success",
        description: "Agent updated successfully",
      });
      
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Error",
        description: "Failed to save agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const token = getAccessToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete agents",
          variant: "destructive",
        });
        return;
      }
      
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${id}/`), {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete agent: ${response.status}`);
      }
      
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
      
      navigate('/agents');
      
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Agent</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleSaveAgent} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Sources</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
                <CardDescription>Basic information about your agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter agent name"
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
                
                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Enter system instructions for the agent"
                    rows={5}
                  />
                  <p className="text-sm text-muted-foreground">
                    This prompt defines the agent's personality and behavior.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public">Public Agent</Label>
                    <Switch
                      id="public"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Make this agent accessible to all users in your workspace.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Model Settings</CardTitle>
                <CardDescription>Configure the AI model for this agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-2">Claude 2</SelectItem>
                      <SelectItem value="claude-instant">Claude Instant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Temperature: {temperature}</Label>
                    <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {temperature}
                    </span>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[temperature]}
                    onValueChange={(value) => setTemperature(value[0])}
                  />
                  <p className="text-sm text-muted-foreground">
                    Controls randomness: Lower values are more deterministic, higher values more creative.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-length">Maximum Length</Label>
                  <Input
                    id="max-length"
                    type="number"
                    value={maxLength}
                    onChange={(e) => setMaxLength(Number(e.target.value))}
                    min={100}
                    max={4000}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of tokens in the response.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            {/* Guidelines Section */}
            <AgentGuidelinesSection
              guidelines={guidelines}
              onAddGuideline={addGuideline}
              onRemoveGuideline={removeGuideline}
              onUpdateGuideline={updateGuideline}
              maxGuidelines={10}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Behavior Settings</CardTitle>
                <CardDescription>Configure how the agent interacts with users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="greeting">Greeting Message</Label>
                  <Input
                    id="greeting"
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    placeholder="Hello! How can I help you today?"
                  />
                  <p className="text-sm text-muted-foreground">
                    The first message the agent sends in a conversation.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="context-window">Context Window</Label>
                  <Input
                    id="context-window"
                    type="number"
                    value={contextWindow}
                    onChange={(e) => setContextWindow(Number(e.target.value))}
                    min={1}
                    max={20}
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of previous messages to include for context.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="use-memory">Long-term Memory</Label>
                    <Switch
                      id="use-memory"
                      checked={useMemory}
                      onCheckedChange={setUseMemory}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable the agent to remember information from past conversations.
                  </p>
                </div>
                
                {useMemory && (
                  <div className="space-y-2">
                    <Label htmlFor="memory-window">Memory Window</Label>
                    <Input
                      id="memory-window"
                      type="number"
                      value={memoryWindow}
                      onChange={(e) => setMemoryWindow(Number(e.target.value))}
                      min={10}
                      max={100}
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of past conversations to remember.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 flex items-center text-lg">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Advanced Settings Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-amber-800">
                <p className="text-sm">
                  Changes to these settings may significantly alter your agent's behavior. 
                  Consider testing your agent after making changes.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Sources</CardTitle>
                <CardDescription>Manage the information sources for this agent</CardDescription>
              </CardHeader>
              <CardContent>
                {knowledgeSources.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No knowledge sources added yet.</p>
                    <p className="text-sm">Add sources to help your agent answer questions accurately.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {knowledgeSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-muted-foreground">{source.type}</p>
                        </div>
                        <Badge variant={source.status === 'success' ? 'default' : 'outline'}>
                          {source.status === 'success' ? 'Trained' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Knowledge Source
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Appearance</CardTitle>
                <CardDescription>Customize how your agent looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={avatar || ''}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL to an image that represents your agent.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Main color used for the agent's interface elements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAgent} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Agent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentEdit;
