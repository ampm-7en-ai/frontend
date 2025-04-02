import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Settings, MessageSquare, Palette, FileText, Book, RefreshCw, BrainCircuit, AlertTriangle, Sliders, CpuIcon, Save, Send, Upload, UserRound, ExternalLink, Smartphone, Slack, Instagram } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { KnowledgeTrainingStatus } from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, updateAgent } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';

interface Agent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  streaming: boolean;
  status: string;
  avatar: string;
  knowledgeBaseId: string | null;
  knowledgeSources: any[];
  createdAt: string;
  updatedAt: string;
  lastModified: string;
  userId: string;
  businessId: string;
  conversations: number;
  settings: {
    chatbox: {
      title: string;
      subtitle: string;
      theme: string;
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      borderRadius: string;
      fontFamily: string;
      fontSize: string;
      headerImage: string;
      agentAvatar: string;
      welcomeMessage: string;
      inputPlaceholder: string;
      sendButtonColor: string;
      sendButtonShape: string;
      showPoweredBy: boolean;
      position: string;
      horizontalOffset: string;
      verticalOffset: string;
      expandOnStart: boolean;
      agentName: string;
      agentDescription: string;
    };
    integrations: {
      slack: {
        enabled: boolean;
        webhookUrl: string;
      };
      instagram: {
        enabled: boolean;
      };
    };
  };
}

const AgentEdit: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(0.0);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [topP, setTopP] = useState(1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState('active');
  const [avatar, setAvatar] = useState('');

  const [chatboxTitle, setChatboxTitle] = useState('');
  const [chatboxSubtitle, setChatboxSubtitle] = useState('');
  const [chatboxTheme, setChatboxTheme] = useState('modern');
  const [chatboxPrimaryColor, setChatboxPrimaryColor] = useState('#000000');
  const [chatboxSecondaryColor, setChatboxSecondaryColor] = useState('#ffffff');
  const [chatboxAccentColor, setChatboxAccentColor] = useState('#0000ff');
  const [chatboxBorderRadius, setChatboxBorderRadius] = useState('0.5rem');
  const [chatboxFontFamily, setChatboxFontFamily] = useState('Arial, sans-serif');
  const [chatboxFontSize, setChatboxFontSize] = useState('16px');
  const [chatboxHeaderImage, setChatboxHeaderImage] = useState('');
  const [chatboxAgentAvatar, setChatboxAgentAvatar] = useState('');
  const [chatboxWelcomeMessage, setChatboxWelcomeMessage] = useState('Hello! How can I help you today?');
  const [chatboxInputPlaceholder, setChatboxInputPlaceholder] = useState('Type your message here...');
  const [chatboxSendButtonColor, setChatboxSendButtonColor] = useState('#007bff');
  const [chatboxSendButtonShape, setChatboxSendButtonShape] = useState('rounded');
  const [chatboxShowPoweredBy, setChatboxShowPoweredBy] = useState(true);
  const [chatboxPosition, setChatboxPosition] = useState('bottom-right');
  const [chatboxHorizontalOffset, setChatboxHorizontalOffset] = useState('20px');
  const [chatboxVerticalOffset, setChatboxVerticalOffset] = useState('20px');
  const [chatboxExpandOnStart, setChatboxExpandOnStart] = useState(false);
  const [chatboxAgentName, setChatboxAgentName] = useState('');
  const [chatboxAgentDescription, setChatboxAgentDescription] = useState('');

  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [instagramEnabled, setInstagramEnabled] = useState(false);

  const fetchAgent = async () => {
    setIsLoading(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/`, {
        headers: {
          ...getAuthHeaders(accessToken),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setAgent(data);

      setName(data.name);
      setDescription(data.description);
      setPrompt(data.prompt);
      setModel(data.model);
      setTemperature(data.temperature);
      setMaxTokens(data.maxTokens);
      setTopP(data.topP);
      setFrequencyPenalty(data.frequencyPenalty);
      setPresencePenalty(data.presencePenalty);
      setStreaming(data.streaming);
      setStatus(data.status);
      setAvatar(data.avatar);

      setChatboxTitle(data.settings?.chatbox?.title || '');
      setChatboxSubtitle(data.settings?.chatbox?.subtitle || '');
      setChatboxTheme(data.settings?.chatbox?.theme || 'modern');
      setChatboxPrimaryColor(data.settings?.chatbox?.primaryColor || '#000000');
      setChatboxSecondaryColor(data.settings?.chatbox?.secondaryColor || '#ffffff');
      setChatboxAccentColor(data.settings?.chatbox?.accentColor || '#0000ff');
      setChatboxBorderRadius(data.settings?.chatbox?.borderRadius || '0.5rem');
      setChatboxFontFamily(data.settings?.chatbox?.fontFamily || 'Arial, sans-serif');
      setChatboxFontSize(data.settings?.chatbox?.fontSize || '16px');
      setChatboxHeaderImage(data.settings?.chatbox?.headerImage || '');
      setChatboxAgentAvatar(data.settings?.chatbox?.agentAvatar || '');
      setChatboxWelcomeMessage(data.settings?.chatbox?.welcomeMessage || 'Hello! How can I help you today?');
      setChatboxInputPlaceholder(data.settings?.chatbox?.inputPlaceholder || 'Type your message here...');
      setChatboxSendButtonColor(data.settings?.chatbox?.sendButtonColor || '#007bff');
      setChatboxSendButtonShape(data.settings?.chatbox?.sendButtonShape || 'rounded');
      setChatboxShowPoweredBy(data.settings?.chatbox?.showPoweredBy !== false);
      setChatboxPosition(data.settings?.chatbox?.position || 'bottom-right');
      setChatboxHorizontalOffset(data.settings?.chatbox?.horizontalOffset || '20px');
      setChatboxVerticalOffset(data.settings?.chatbox?.verticalOffset || '20px');
      setChatboxExpandOnStart(data.settings?.chatbox?.expandOnStart || false);
      setChatboxAgentName(data.settings?.chatbox?.agentName || '');
      setChatboxAgentDescription(data.settings?.chatbox?.agentDescription || '');

      setSlackEnabled(data.settings?.integrations?.slack?.enabled || false);
      setSlackWebhookUrl(data.settings?.integrations?.slack?.webhookUrl || '');
      setInstagramEnabled(data.settings?.integrations?.instagram?.enabled || false);

    } catch (error: any) {
      console.error('Failed to fetch agent:', error);
      toast({
        title: "Error fetching agent",
        description: error.message || "Failed to fetch agent details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedAgentData = {
      name,
      description,
      prompt,
      model,
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      streaming,
      status,
      avatar,
      settings: {
        chatbox: {
          title: chatboxTitle,
          subtitle: chatboxSubtitle,
          theme: chatboxTheme,
          primaryColor: chatboxPrimaryColor,
          secondaryColor: chatboxSecondaryColor,
          accentColor: chatboxAccentColor,
          borderRadius: chatboxBorderRadius,
          fontFamily: chatboxFontFamily,
          fontSize: chatboxFontSize,
          headerImage: chatboxHeaderImage,
          agentAvatar: chatboxAgentAvatar,
          welcomeMessage: chatboxWelcomeMessage,
          inputPlaceholder: chatboxInputPlaceholder,
          sendButtonColor: chatboxSendButtonColor,
          sendButtonShape: chatboxSendButtonShape,
          showPoweredBy: chatboxShowPoweredBy,
          position: chatboxPosition,
          horizontalOffset: chatboxHorizontalOffset,
          verticalOffset: chatboxVerticalOffset,
          expandOnStart: chatboxExpandOnStart,
          agentName: chatboxAgentName,
          agentDescription: chatboxAgentDescription,
        },
        integrations: {
          slack: {
            enabled: slackEnabled,
            webhookUrl: slackWebhookUrl,
          },
          instagram: {
            enabled: instagramEnabled,
          },
        },
      },
    };

    try {
      if (!agentId) {
        throw new Error('Agent ID is missing.');
      }
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      await updateAgent(agentId, updatedAgentData);

      toast({
        title: "Agent updated",
        description: "Agent details have been successfully updated.",
      });
      navigate('/agents');
    } catch (error: any) {
      console.error('Failed to update agent:', error);
      toast({
        title: "Error updating agent",
        description: error.message || "Failed to update agent details.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-80" /></CardTitle>
            <CardDescription><Skeleton className="h-4 w-[200px]" /></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage><Skeleton className="h-10 w-10 rounded-full" /></AvatarImage>
                  <AvatarFallback><Skeleton className="h-10 w-10 rounded-full" /></AvatarFallback>
                </Avatar>
                <div>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent>
            Agent not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate('/agents')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Agents
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Agent</CardTitle>
          <CardDescription>Modify agent details and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general"><Bot className="mr-2 h-4 w-4" /> General</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" /> Settings</TabsTrigger>
              <TabsTrigger value="knowledge"><Book className="mr-2 h-4 w-4" /> Knowledge</TabsTrigger>
              <TabsTrigger value="chatbox"><MessageSquare className="mr-2 h-4 w-4" /> Chatbox</TabsTrigger>
              <TabsTrigger value="integrations"><BrainCircuit className="mr-2 h-4 w-4" /> Integrations</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold">{name}</h2>
                    <p className="text-sm text-muted-foreground">Created: {new Date(agent.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent Name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Agent Description"
                  />
                </div>
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Agent Prompt"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      placeholder="Temperature"
                      step="0.1"
                      min="0"
                      max="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      placeholder="Max Tokens"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topP">Top P</Label>
                    <Input
                      id="topP"
                      type="number"
                      value={topP}
                      onChange={(e) => setTopP(parseFloat(e.target.value))}
                      placeholder="Top P"
                      step="0.1"
                      min="0"
                      max="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
                    <Input
                      id="frequencyPenalty"
                      type="number"
                      value={frequencyPenalty}
                      onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                      placeholder="Frequency Penalty"
                      step="0.1"
                      min="-2"
                      max="2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="presencePenalty">Presence Penalty</Label>
                    <Input
                      id="presencePenalty"
                      type="number"
                      value={presencePenalty}
                      onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                      placeholder="Presence Penalty"
                      step="0.1"
                      min="-2"
                      max="2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="streaming">Streaming</Label>
                    <Switch
                      id="streaming"
                      checked={streaming}
                      onCheckedChange={(checked) => setStreaming(checked)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <RadioGroup defaultValue={status} onValueChange={setStatus}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="inactive" />
                      <Label htmlFor="inactive">Inactive</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Avatar URL"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="knowledge">
              <KnowledgeTrainingStatus agentId={agentId} />
            </TabsContent>
            <TabsContent value="chatbox">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="chatboxTitle">Title</Label>
                  <Input
                    id="chatboxTitle"
                    type="text"
                    value={chatboxTitle}
                    onChange={(e) => setChatboxTitle(e.target.value)}
                    placeholder="Chatbox Title"
                  />
                </div>
                <div>
                  <Label htmlFor="chatboxSubtitle">Subtitle</Label>
                  <Input
                    id="chatboxSubtitle"
                    type="text"
                    value={chatboxSubtitle}
                    onChange={(e) => setChatboxSubtitle(e.target.value)}
                    placeholder="Chatbox Subtitle"
                  />
                </div>
                <div>
                  <Label htmlFor="chatboxTheme">Theme</Label>
                  <Select value={chatboxTheme} onValueChange={setChatboxTheme}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chatboxPrimaryColor">Primary Color</Label>
                    <Input
                      id="chatboxPrimaryColor"
                      type="color"
                      value={chatboxPrimaryColor}
                      onChange={(e) => setChatboxPrimaryColor(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatboxSecondaryColor">Secondary Color</Label>
                    <Input
                      id="chatboxSecondaryColor"
                      type="color"
                      value={chatboxSecondaryColor}
                      onChange={(e) => setChatboxSecondaryColor(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatboxAccentColor">Accent Color</Label>
                    <Input
                      id="chatboxAccentColor"
                      type="color"
                      value={chatboxAccentColor}
                      onChange={(e) => setChatboxAccentColor(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatboxBorderRadius">Border Radius</Label>
                    <Input
                      id="chatboxBorderRadius"
                      type="text"
                      value={chatboxBorderRadius}
                      onChange={(e) => setChatboxBorderRadius(e.target.value)}
                      placeholder="Border Radius"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatboxFontFamily">Font Family</Label>
                    <Input
                      id="chatboxFontFamily"
                      type="text"
                      value={chatboxFontFamily}
                      onChange={(e) => setChatboxFontFamily(e.target.value)}
                      placeholder="Font Family"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatboxFontSize">Font Size</Label>
                    <Input
                      id="chatboxFontSize"
                      type="text"
                      value={chatboxFontSize}
                      onChange={(e) => setChatboxFontSize(e.target.value)}
                      placeholder="Font Size"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="chatboxHeaderImage">Header Image URL</Label>
                  <Input
                    id="chatboxHeaderImage"
                    type="text"
                    value={chatboxHeaderImage}
                    onChange={(e) => setChatboxHeaderImage(e.target.value)}
                    placeholder="Header Image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="chatboxAgentAvatar">Agent Avatar URL</Label>
                  <Input
                    id="chatboxAgentAvatar"
                    type="text"
                    value={chatboxAgentAvatar}
                    onChange={(e) => setChatboxAgentAvatar(e.target.value)}
                    placeholder="Agent Avatar URL"
                  />
                </div>
                <div>
                  <Label htmlFor="chatboxWelcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="chatboxWelcomeMessage"
                    value={chatboxWelcomeMessage}
                    onChange={(e) => setChatboxWelcomeMessage(e.target.value)}
                    placeholder="Welcome Message"
                  />
                </div>
                <div>
                  <Label htmlFor="chatboxInputPlaceholder">Input Placeholder</Label>
                  <Input
                    id="chatboxInputPlaceholder"
                    type="text"
                    value={chatboxInputPlaceholder}
                    onChange={(e) => setChatboxInputPlaceholder(e.target.value)}
                    placeholder="Input Placeholder"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chatboxSendButtonColor">Send Button Color</Label>
                    <Input
                      id="chatboxSendButtonColor"
                      type="color"
                      value={chatboxSendButtonColor}
                      onChange={(e) => setChatboxSendButtonColor(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatboxSendButtonShape">Send Button Shape</Label>
                    <Select value={chatboxSendButtonShape} onValueChange={setChatboxSendButtonShape}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a shape" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="circle">Circle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="chatboxShowPoweredBy">Show Powered By</Label>
                  <Switch
                    id="chatboxShowPoweredBy"
                    checked={chatboxShowPoweredBy}
                    onCheckedChange={(checked) => setChatboxShowPoweredBy(checked)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chatboxPosition">Position</Label>
                    <Select value={chatboxPosition} onValueChange={setChatboxPosition}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="chatboxHorizontalOffset">Horizontal Offset</Label>
                    <Input
                      id="chatboxHorizontalOffset"
                      type="text"
                      value={chatboxHorizontalOffset}
                      onChange={(e) => setChatboxHorizontalOffset(e.target.value)}
                      placeholder="Horizontal Offset"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatboxVerticalOffset">Vertical Offset</Label>
                    <Input
                      id="chatboxVerticalOffset"
                      type="text"
                      value={chatboxVerticalOffset}
                      onChange={(e) => setChatboxVerticalOffset(e.target.value)}
                      placeholder="Vertical Offset"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="chatboxExpandOnStart">Expand On Start</Label>
                  <Switch
                    id="chatboxExpandOnStart"
                    checked={chatboxExpandOnStart}
                    onCheckedChange={(checked) => setChatboxExpandOnStart(checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="chatboxAgentName">Agent Name</Label>
                  <Input
                    id="chatboxAgentName"
                    type="text"
                    value={chatboxAgentName}
                    onChange={(e) => setChatboxAgentName(e.target.value)}
                    placeholder="Agent Name"
                  />
                </div>
                <div>
                  <Label htmlFor="chatboxAgentDescription">Agent Description</Label>
                  <Textarea
                    id="chatboxAgentDescription"
                    value={chatboxAgentDescription}
                    onChange={(e) => setChatboxAgentDescription(e.target.value)}
                    placeholder="Agent Description"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="integrations">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="slackEnabled">Slack Enabled</Label>
                  <Switch
                    id="slackEnabled"
                    checked={slackEnabled}
                    onCheckedChange={(checked) => setSlackEnabled(checked)}
                  />
                </div>
                {slackEnabled && (
                  <div>
                    <Label htmlFor="slackWebhookUrl">Slack Webhook URL</Label>
                    <Input
                      id="slackWebhookUrl"
                      type="text"
                      value={slackWebhookUrl}
                      onChange={(e) => setSlackWebhookUrl(e.target.value)}
                      placeholder="Slack Webhook URL"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="instagramEnabled">Instagram Enabled</Label>
                  <Switch
                    id="instagramEnabled"
                    checked={instagramEnabled}
                    onCheckedChange={(checked) => setInstagramEnabled(checked)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving} onClick={handleSubmit}>
            {isSaving ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentEdit;
