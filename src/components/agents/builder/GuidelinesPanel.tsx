import React, { useState, useRef } from 'react';
import { useBuilder } from './BuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { 
  User, 
  Plus, 
  X, 
  Upload, 
  Trash2, 
  Settings, 
  Bot, 
  MessageSquare, 
  Shield,
  Zap,
  Ticket,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTicketingIntegrations } from '@/hooks/useTicketingIntegrations';
import { getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';

export const GuidelinesPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [handoffOption, setHandoffOption] = useState('create_ticket');
  const [autoTicketReply, setAutoTicketReply] = useState(false);
  const [handoffEmail, setHandoffEmail] = useState('');

  const handleCategory = (category: string) => {
    updateAgentData({ agent_category: category });
  }

  const handleGuidelineChange = (type: 'dos' | 'donts', index: number, value: string) => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type][index] = value;
    updateAgentData({ guidelines: newGuidelines });
  };

  const addGuideline = (type: 'dos' | 'donts') => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type].push('');
    updateAgentData({ guidelines: newGuidelines });
  };

  const removeGuideline = (type: 'dos' | 'donts', index: number) => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type] = newGuidelines[type].filter((_, i) => i !== index);
    updateAgentData({ guidelines: newGuidelines });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(getApiUrl('agents/upload-avatar/'), {
        method: 'POST',
        headers: getAuthHeaders(token, false), // Don't include Content-Type for FormData
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload avatar: ${response.status}`);
      }

      const result = await response.json();
      
      updateAgentData({ avatar: result.avatar_url });

      toast({
        title: "Success",
        description: "Avatar uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true);
    try {
      // Just update the local state - no API call needed for removal
      updateAgentData({ avatar: '' });

      toast({
        title: "Success",
        description: "Avatar removed successfully.",
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const { data: ticketingIntegrations = [], isLoading: isLoadingIntegrations } = useTicketingIntegrations();

  // Filter active integrations and format them for the dropdown
  const activeTicketingOptions = ticketingIntegrations
    .filter(integration => integration.is_active)
    .map(integration => ({
      value: integration.id.toString(),
      label: integration.provider_name,
      logo: integration.logo_url,
      description: `${integration.provider_name} Integration`
    }));

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Guidelines & Behavior</h2>
        
        <Accordion type="multiple" defaultValue={["basic", "appearance"]} className="space-y-2">
          {/* Basic Information */}
          <AccordionItem value="basic" className="border rounded-lg bg-white dark:bg-slate-800/50 backdrop-blur-sm px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Basic Information</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Name, description, and agent category</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Agent Name
                  </Label>
                  <Input
                    id="agentName"
                    value={agentData.name}
                    onChange={(e) => updateAgentData({ name: e.target.value })}
                    placeholder="Enter agent name..."
                    className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agentDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="agentDescription"
                    value={agentData.description}
                    onChange={(e) => updateAgentData({ description: e.target.value })}
                    placeholder="Describe what your agent does..."
                    rows={3}
                    className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Agent Category
                  </Label>
                  
                  <div className="mt-1.5">
                    <ModernDropdown
                      value={agentData.agent_category || "Assistant" }
                      onValueChange={handleCategory}
                      options={[
                        {label: "Assistant", value: "Assistant"},
                        {label: "Chatbot", value: "Chatbot"}
                      ]}
                      placeholder="Select agent category"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="appearance" className="border rounded-lg bg-white dark:bg-slate-800/50 backdrop-blur-sm px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Appearance</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Avatar and visual customization</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Agent Avatar
                  </Label>
                  
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
                      <AvatarImage src={agentData.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 text-xl font-semibold rounded-2xl">
                        {agentData.name?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="h-8"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                      </Button>
                      
                      {agentData.avatar && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveAvatar}
                          disabled={isRemovingAvatar}
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          {isRemovingAvatar ? 'Removing...' : 'Remove'}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upload a square image (recommended: 256x256px, max 5MB)
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guidelines" className="border rounded-lg bg-white dark:bg-slate-800/50 backdrop-blur-sm px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">
                    Guidelines
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {agentData.guidelines.dos.length + agentData.guidelines.donts.length}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Define what your agent should and shouldn't do</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-6">
                {/* Dos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <Label className="text-sm font-medium text-green-700 dark:text-green-400">
                      Do's - What your agent should do
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    {agentData.guidelines.dos.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={item}
                          onChange={(e) => handleGuidelineChange('dos', index, e.target.value)}
                          placeholder="Enter a guideline..."
                          className="flex-1 border-green-200 focus:border-green-300 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 rounded-xl text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuideline('dos', index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addGuideline('dos')}
                      className="text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 h-8"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Do
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Don'ts */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <Label className="text-sm font-medium text-red-700 dark:text-red-400">
                      Don'ts - What your agent should avoid
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    {agentData.guidelines.donts.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={item}
                          onChange={(e) => handleGuidelineChange('donts', index, e.target.value)}
                          placeholder="Enter what to avoid..."
                          className="flex-1 border-red-200 focus:border-red-300 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 rounded-xl text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuideline('donts', index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addGuideline('donts')}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 h-8"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Don't
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Behavior Settings - Only show for Chatbot */}
          {agentData.agent_category === "Chatbot" && (
            <AccordionItem value="behavior" className="border rounded-lg bg-white dark:bg-slate-800/50 backdrop-blur-sm px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Behavior Settings</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Configure escalation and handoff options</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2">
                <div className="space-y-6">
                  {/* Human Handoff */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Human Handoff
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Allow the agent to create ticket for human support
                        </p>
                      </div>
                      <Switch
                        checked={agentData.ticketing_providers?.some(tp => tp.status === 'active') || false}
                        onCheckedChange={(checked) => {
                          // Handle switch toggle logic here
                        }}
                        className="scale-75"
                      />
                    </div>

                    {/* Handoff Options */}
                    {agentData.ticketing_providers?.some(tp => tp.status === 'active') && (
                      <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <RadioGroup 
                          value={handoffOption} 
                          onValueChange={setHandoffOption}
                          className="space-y-4"
                        >
                          {/* Create Ticket Option */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="create_ticket" id="create_ticket" />
                              <Label htmlFor="create_ticket" className="text-sm font-medium flex items-center gap-2">
                                <Ticket className="w-4 h-4" />
                                Create ticket
                              </Label>
                            </div>
                            
                            {handoffOption === 'create_ticket' && (
                              <div className="ml-6 space-y-3">
                                {/* Ticketing Provider Dropdown */}
                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-600 dark:text-gray-400">
                                    Default Ticketing Provider
                                  </Label>
                                  <ModernDropdown
                                    value={agentData.default_ticketing_provider || ''}
                                    onValueChange={(value) => updateAgentData({ default_ticketing_provider: value })}
                                    options={activeTicketingOptions}
                                    placeholder="Select ticketing provider"
                                    className="w-full"
                                  />
                                </div>
                                
                                {/* Auto Ticket Reply Checkbox */}
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="autoTicketReply" 
                                    checked={autoTicketReply}
                                    onCheckedChange={setAutoTicketReply}
                                  />
                                  <Label htmlFor="autoTicketReply" className="text-xs text-gray-600 dark:text-gray-400">
                                    Automatically reply when ticket is created
                                  </Label>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Send Email Option */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="send_email" id="send_email" />
                              <Label htmlFor="send_email" className="text-sm font-medium flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Send email
                              </Label>
                            </div>
                            
                            {handoffOption === 'send_email' && (
                              <div className="ml-6 space-y-2">
                                <Input
                                  type="email"
                                  placeholder="Enter email address"
                                  value={handoffEmail}
                                  onChange={(e) => setHandoffEmail(e.target.value)}
                                  className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  You will receive an email to this address if agent is unable to answer.
                                </p>
                              </div>
                            )}
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* AI to AI Handoff */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          AI to AI Handoff
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Allow the agent to escalate to other AI agents when needed
                        </p>
                      </div>
                      <Switch
                        defaultChecked={false}
                        className="scale-75"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
};
