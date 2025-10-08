import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { Plus, Loader2, Settings, Trash2, Edit, Star, StarOff } from 'lucide-react';
import AddProviderDialog from '@/components/settings/platform/AddProviderDialog';
import EditProviderDialog from '@/components/settings/platform/EditProviderDialog';
import AddAgentPromptDialog from '@/components/settings/platform/AddAgentPromptDialog';
import AddModelDialog from '@/components/settings/platform/AddModelDialog';
import { useSuperAdminLLMProviders } from '@/hooks/useSuperAdminLLMProviders';
import { SuperAdminLLMProvider, ModelObject } from '@/hooks/useLLMProviders';
import { useAgentPrompts } from '@/hooks/useAgentPrompts';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

const LLMProvidersSettings = () => {
  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);
  const [isEditProviderDialogOpen, setIsEditProviderDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<SuperAdminLLMProvider | null>(null);
  const [isAddPromptDialogOpen, setIsAddPromptDialogOpen] = useState(false);
  const [isAddModelDialogOpen, setIsAddModelDialogOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<number>(0);
  const [selectedProviderName, setSelectedProviderName] = useState<string>('');
  
  // Agent prompts state
  const [selectedAgentType, setSelectedAgentType] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [enableFallback, setEnableFallback] = useState(true);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  
  const { providers, isLoading, refetch, updateProvider, addModel, deleteModel, setDefaultModel, deleteProvider } = useSuperAdminLLMProviders();
  const { prompts, isLoading: isLoadingPrompts, createPrompt, updatePrompt } = useAgentPrompts(false,true);

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

  const handleEditProvider = (provider: SuperAdminLLMProvider) => {
    setEditingProvider(provider);
    setIsEditProviderDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditProviderDialogOpen(false);
    setEditingProvider(null);
  };

  const handleDeleteProvider = async (providerId: number) => {
    if (confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      try {
        await deleteProvider(providerId);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleAddModel = (providerId: number, providerName: string) => {
    setSelectedProviderId(providerId);
    setSelectedProviderName(providerName);
    setIsAddModelDialogOpen(true);
  };

  const handleDeleteModel = async (modelId: number) => {
    if (confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
      try {
        await deleteModel(modelId);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleSetDefaultModel = async (providerId: number, modelId: number) => {
    try {
      await setDefaultModel(providerId, modelId);
    } catch (error) {
      // Error handling is done in the hook
    }
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

  const getDefaultModelId = (provider: SuperAdminLLMProvider): number | null => {
    if (!provider.default_model) return null;
    
    // If default_model is an object, return its id
    if (typeof provider.default_model === 'object' && provider.default_model && 'id' in provider.default_model) {
      return provider.default_model.id;
    }
    
    // If default_model is a string, find the matching model in the models array
    if (typeof provider.default_model === 'string' && Array.isArray(provider.models)) {
      const matchingModel = provider.models.find(model => 
        typeof model === 'object' && model && 'name' in model && model.name === provider.default_model
      );
      return matchingModel && typeof matchingModel === 'object' && matchingModel && 'id' in matchingModel ? matchingModel.id : null;
    }
    
    return null;
  };

  return (
    <PlatformSettingsLayout
      title="LLM Providers Settings"
      description="Configure integrations with language model providers"
    >
      {/* Providers Section */}
      <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Provider Configuration</h2>
              </div>
            </div>
            <ModernButton onClick={() => setIsAddProviderDialogOpen(true)} variant='primary' size='sm'>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </ModernButton>
          </div>
        </div>
        <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
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
                    <div className="space-y-4 bg-neutral-50/70 dark:bg-neutral-950/60 p-6 rounded-2xl">
                      {/* Provider Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-200/50 dark:bg-neutral-800 rounded-lg">
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
                          <ModernButton 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddModel(provider.id, provider.provider_name)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Model
                          </ModernButton>
                        </div>
                        
                        {provider.models && provider.models.length > 0 ? (
                          <div className="space-y-2">
                            {provider.models.map((model) => {
                              const modelObj = typeof model === 'string' 
                                ? { id: 0, name: model } 
                                : model;
                              const defaultModelId = getDefaultModelId(provider);
                              const isDefault = defaultModelId === modelObj.id || 
                                               (typeof provider.default_model === 'string' && provider.default_model === modelObj.name);
                              
                              return (
                                <div key={modelObj.id || modelObj.name} className="flex items-center justify-between p-3 border rounded-2xl pl-6 dark:hover:bg-neutral-900/20">
                                  <div className="flex items-center space-x-3">
                                    <div>
                                      <div className="font-medium">
                                        {modelObj.display_name}<br/>
                                        <span className='text-[10px] dark:text-neutral-200/50'>{modelObj.name}</span>
                                      </div>
                                      {isDefault && (
                                        <Badge variant="outline" className="text-xs mt-1">Default</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {!isDefault && typeof model === 'object' && model && 'id' in model && (
                                      <ModernButton
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSetDefaultModel(provider.id, model.id)}
                                        className="h-10 w-10 text-yellow-600 hover:text-yellow-700"
                                        iconOnly
                                      >
                                        <Star className="h-4 w-4" />
                                      </ModernButton>
                                    )}
                                    {typeof model === 'object' && model && 'id' in model && (
                                      <ModernButton
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteModel(model.id)}
                                        className="h-10 w-10 hover:text-destructive"
                                        iconOnly
                                      >
                                        <Trash2 className="h-4 w-4 hover:text-destructive" />
                                      </ModernButton>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                            No models configured for this provider
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2 pt-2">
                        <ModernButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProvider(provider)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit Provider
                        </ModernButton>
                        <ModernButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete Provider
                        </ModernButton>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
      
      {/* Agent System Prompts Section */}
      <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Agent Persona Prompts</h2>
              </div>
            </div>
            <ModernButton 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddPromptDialogOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </ModernButton>
          </div>
        </div>
        <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm space-y-4">
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
                {/* <Select value={selectedAgentType} onValueChange={setSelectedAgentType}>
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
                </Select> */}
                <ModernDropdown
                  value={selectedAgentType}
                  onValueChange={setSelectedAgentType}
                  options={availableAgentTypes.map(u => ({value: u, label: u}))}
                  placeholder="Select Members"
                  className="w-full text-xs rounded-xl border-neutral-200 dark:border-neutral-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea 
                  id="systemPrompt" 
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[450px]"
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
              
              <ModernButton 
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
              </ModernButton>
            </div>
          )}
        </div>
      </section>

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

      {/* Add Model Dialog */}
      <AddModelDialog
        isOpen={isAddModelDialogOpen}
        onClose={() => setIsAddModelDialogOpen(false)}
        onModelAdded={addModel}
        providerId={selectedProviderId}
        providerName={selectedProviderName}
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
