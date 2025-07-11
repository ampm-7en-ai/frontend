
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { Plus, Loader2, Settings, Trash2, Edit } from 'lucide-react';
import AddProviderDialog from '@/components/settings/platform/AddProviderDialog';
import EditProviderDialog from '@/components/settings/platform/EditProviderDialog';
import AddAgentPromptDialog from '@/components/settings/platform/AddAgentPromptDialog';
import { useSuperAdminLLMProviders } from '@/hooks/useSuperAdminLLMProviders';
import { LLMProvider } from '@/hooks/useLLMProviders';
import { useAgentPrompts } from '@/hooks/useAgentPrompts';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LLMProvidersSettings = () => {
  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);
  const [isEditProviderDialogOpen, setIsEditProviderDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);
  const [isAddPromptDialogOpen, setIsAddPromptDialogOpen] = useState(false);
  const [selectedAgentType, setSelectedAgentType] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [enableFallback, setEnableFallback] = useState(true);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  
  const { providers, isLoading, refetch, updateProvider } = useSuperAdminLLMProviders();
  const { prompts, isLoading: isLoadingPrompts, createPrompt, updatePrompt } = useAgentPrompts();

  // Get unique agent types from the prompts
  const availableAgentTypes = React.useMemo(() => {
    const types = prompts.map(prompt => prompt.agent_type);
    return [...new Set(types)].sort();
  }, [prompts]);

  const getCurrentPrompt = () => {
    return prompts.find(p => p.agent_type === selectedAgentType);
  };

  const currentPrompt = getCurrentPrompt();

  // Set the first available agent type when prompts load
  React.useEffect(() => {
    if (availableAgentTypes.length > 0 && !selectedAgentType) {
      setSelectedAgentType(availableAgentTypes[0]);
    }
  }, [availableAgentTypes, selectedAgentType]);

  // Update form when agent type changes
  React.useEffect(() => {
    const prompt = getCurrentPrompt();
    if (prompt) {
      setSystemPrompt(prompt.system_prompt);
      setEnableFallback(prompt.enable_fallback);
    } else {
      setSystemPrompt('');
      setEnableFallback(true);
    }
  }, [selectedAgentType, prompts]);

  const handleProviderToggle = async (providerId: number, isActive: boolean) => {
    try {
      await updateProvider(providerId, {
        is_active: isActive,
        status: isActive ? 'active' : 'inactive'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditProvider = (provider: LLMProvider) => {
    setEditingProvider(provider);
    setIsEditProviderDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditProviderDialogOpen(false);
    setEditingProvider(null);
  };

  const handleDeleteProvider = async (providerId: number) => {
    // TODO: Implement provider deletion
    console.log('Delete provider:', providerId);
  };

  const handleAddModel = (providerId: number) => {
    // TODO: Implement model addition
    console.log('Add model to provider:', providerId);
  };

  const handleDeleteModel = (providerId: number, modelId: number) => {
    // TODO: Implement model deletion
    console.log('Delete model:', modelId, 'from provider:', providerId);
  };

  const handleSaveConfiguration = async () => {
    if (!systemPrompt.trim()) {
      return;
    }

    try {
      setIsSavingPrompt(true);
      const promptData = {
        agent_type: selectedAgentType,
        system_prompt: systemPrompt,
        enable_fallback: enableFallback
      };

      if (currentPrompt) {
        await updatePrompt(currentPrompt.id, promptData);
      } else {
        await createPrompt(promptData);
      }
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSavingPrompt(false);
    }
  };

  return (
    <PlatformSettingsLayout
      title="LLM Providers Settings"
      description="Configure integrations with language model providers"
    >
      {/* Providers Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Provider Configuration</CardTitle>
            <CardDescription>Manage LLM provider API connections and their models</CardDescription>
          </div>
          <Button onClick={() => setIsAddProviderDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              <span className="ml-2 text-sm text-muted-foreground">Loading providers...</span>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No providers configured. Add a new provider to get started.
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {providers.map((provider) => (
                <AccordionItem key={provider.id} value={`provider-${provider.id}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-left">
                          <div className="font-medium">{provider.provider_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {provider.models?.length || 0} models configured
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={provider.is_active ? "success" : "secondary"}>
                          {provider.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={provider.is_active}
                          onCheckedChange={(checked) => handleProviderToggle(provider.id, checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {/* Provider Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">API Key</Label>
                          <div className="text-sm font-mono">
                            {provider._api_key ? "sk-•••••••••••••••••••••••••••••••••••••" : "Not configured"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Default Model</Label>
                          <div className="text-sm">
                            {provider.default_model ? 
                              (typeof provider.default_model === 'string' ? provider.default_model : provider.default_model.name) 
                              : "Not set"
                            }
                          </div>
                        </div>
                      </div>

                      {/* Models Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Models</h4>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddModel(provider.id)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Model
                          </Button>
                        </div>
                        
                        {provider.models && provider.models.length > 0 ? (
                          <div className="space-y-2">
                            {provider.models.map((model) => (
                              <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <div className="font-medium">{model.name}</div>
                                    {provider.default_model && 
                                     ((typeof provider.default_model === 'string' && provider.default_model === model.name) ||
                                      (typeof provider.default_model === 'object' && provider.default_model.id === model.id)) && (
                                      <Badge variant="outline" className="text-xs mt-1">Default</Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteModel(provider.id, model.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                            No models configured for this provider
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProvider(provider)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit Provider
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete Provider
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
      
      {/* Agent System Prompts Section */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Agent System Prompts</CardTitle>
            <CardDescription>Configure system prompts by agent type</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAddPromptDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add New
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPrompts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              <span className="ml-2 text-sm text-muted-foreground">Loading prompts...</span>
            </div>
          ) : availableAgentTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agent prompts configured. Add a new prompt to get started.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentType">Agent Type</Label>
                <Select value={selectedAgentType} onValueChange={setSelectedAgentType}>
                  <SelectTrigger id="agentType" variant="modern">
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent variant="modern">
                    {availableAgentTypes.map((agentType) => (
                      <SelectItem key={agentType} value={agentType} variant="modern">
                        {agentType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea 
                  id="systemPrompt" 
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[150px]"
                  placeholder="Enter system prompt for this agent type..."
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Switch 
                  id="fallbackProvider" 
                  checked={enableFallback}
                  onCheckedChange={setEnableFallback}
                />
                <Label htmlFor="fallbackProvider">Enable fallback provider if primary fails</Label>
              </div>
              
              <Button 
                onClick={handleSaveConfiguration}
                disabled={isSavingPrompt || !systemPrompt.trim()}
              >
                {isSavingPrompt ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Provider Dialog */}
      <AddProviderDialog
        isOpen={isAddProviderDialogOpen}
        onClose={() => setIsAddProviderDialogOpen(false)}
        onProviderAdded={refetch}
      />

      {/* Edit Provider Dialog */}
      <EditProviderDialog
        isOpen={isEditProviderDialogOpen}
        onClose={handleCloseEditDialog}
        provider={editingProvider}
        onProviderUpdated={updateProvider}
      />

      {/* Add Agent Prompt Dialog */}
      <AddAgentPromptDialog
        isOpen={isAddPromptDialogOpen}
        onClose={() => setIsAddPromptDialogOpen(false)}
        onPromptAdded={createPrompt}
      />
    </PlatformSettingsLayout>
  );
};

export default LLMProvidersSettings;
