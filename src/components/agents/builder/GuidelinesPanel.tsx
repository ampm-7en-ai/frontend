import React, { useState, useRef, useEffect } from 'react';
import { useBuilder } from './BuilderContext';
import { FileText, Settings, Bot, Palette, MessageSquare, Plus, X, Target, Zap, Expand, User, Upload, RotateCcw } from 'lucide-react';
import { useAgentPrompts } from '@/hooks/useAgentPrompts';
import { useAIModels } from '@/hooks/useAIModels';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import ModernButton from '@/components/dashboard/ModernButton';
import { SystemPromptModal } from './SystemPromptModal';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';

export const GuidelinesPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData, lastSaveTimestamp, isLoading } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { prompts, isLoading: promptsLoading } = useAgentPrompts(true);
  const { modelOptionsForDropdown, isLoading: modelsLoading } = useAIModels();
  
  // Store user's custom prompts per agent type
  const [userPromptsByType, setUserPromptsByType] = useState<Record<string, string>>({});
  
  // Modal states
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Get global default model from agent data settings
  const globalDefaultModel = agentData.settings?.response_model;
  
  // Check if current model is using global default
  const isUsingGlobalDefault = agentData.model === globalDefaultModel || (!agentData.model && globalDefaultModel);

  // Initialize user prompts storage on first load and refresh on save
  useEffect(() => {
    if (agentData.agentType && agentData.systemPrompt && !userPromptsByType[agentData.agentType]) {
      setUserPromptsByType(prev => ({
        ...prev,
        [agentData.agentType]: agentData.systemPrompt
      }));
    }
  }, [agentData.agentType, agentData.systemPrompt, lastSaveTimestamp]);

  // Initialize model with global default if not set
  useEffect(() => {
    if (globalDefaultModel && !agentData.model) {
      updateAgentData({ model: globalDefaultModel });
    }
  }, [globalDefaultModel, agentData.model]);

  // Get current template for the selected agent type
  const getCurrentTemplate = () => {
    const matchingPrompt = prompts.find(p => p.agent_type === agentData.agentType);
    return matchingPrompt?.system_prompt || '';
  };

  // Handle system prompt changes
  const handleSystemPromptChange = (value: string) => {
    updateAgentData({ systemPrompt: value });
    
    // Store user's custom content per agent type
    setUserPromptsByType(prev => ({
      ...prev,
      [agentData.agentType]: value
    }));
  };

  // Handle agent type changes - restore user's content or keep blank
  const handleAgentTypeChange = (agentType: string) => {
    console.log('Agent type changing to:', agentType);
    
    updateAgentData({ agentType });
    
    // Restore user's previously written content for this agent type, or keep blank
    const previousUserContent = userPromptsByType[agentType] || '';
    updateAgentData({ systemPrompt: previousUserContent });
  };

  // Handle template usage - replace current prompt with template
  const handleUseTemplate = () => {
    const templateContent = getCurrentTemplate();
    if (templateContent) {
      handleSystemPromptChange(templateContent);
      setShowTemplateModal(false);
      console.log('Template applied to custom prompt');
    }
  };

  // Handle model change
  const handleModelChange = (value: string) => {
    updateAgentData({ model: value });
  };

  // Reset to global default
  const handleResetToGlobalDefault = () => {
    if (globalDefaultModel) {
      updateAgentData({ model: globalDefaultModel });
    }
  };

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' }
  ];

  // Updated to match GlobalAgentSettingsSection
  const maxTokensOptions = [
    { value: '4000', label: '4,000 tokens' },
    { value: '8000', label: '8,000 tokens' },
    { value: '16000', label: '16,000 tokens' },
    { value: '32000', label: '32,000 tokens' }
  ];

  const positionOptions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' }
  ];

  // Generate dynamic agent type options from API data
  const agentTypeOptions = prompts.length > 0 
    ? prompts.map(prompt => ({
        value: prompt.agent_type,
        label: prompt.agent_type.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        description: `${prompt.agent_type} agent type`
      }))
    : [
        { value: 'general-assistant', label: 'General assistant', description: 'General Purpose AI Assistant' },
        { value: 'customer-support', label: 'Customer support agent', description: 'Helps with customer inquiries' }
      ];

  // Enhanced image upload handler with base64 conversion
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Convert file to base64
        const base64String = await fileToBase64(file);
        
        updateAgentData({ 
          avatar: base64String,
          avatarUrl: base64String,
          avatarType: 'custom'
        });
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const addGuideline = (type: 'dos' | 'donts') => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type] = [...newGuidelines[type], ''];
    updateAgentData({ guidelines: newGuidelines });
  };

  const removeGuideline = (type: 'dos' | 'donts', index: number) => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type] = newGuidelines[type].filter((_, i) => i !== index);
    updateAgentData({ guidelines: newGuidelines });
  };

  const updateGuideline = (type: 'dos' | 'donts', index: number, value: string) => {
    const newGuidelines = { ...agentData.guidelines };
    newGuidelines[type][index] = value;
    updateAgentData({ guidelines: newGuidelines });
  };

  const addSuggestion = () => {
    const newSuggestions = [...agentData.suggestions, ''];
    updateAgentData({ suggestions: newSuggestions });
  };

  const removeSuggestion = (index: number) => {
    const newSuggestions = agentData.suggestions.filter((_, i) => i !== index);
    updateAgentData({ suggestions: newSuggestions });
  };

  const updateSuggestion = (index: number, value: string) => {
    const newSuggestions = [...agentData.suggestions];
    newSuggestions[index] = value;
    updateAgentData({ suggestions: newSuggestions });
  };

  // Show skeleton loading state during initial load
  const showSkeleton = isLoading;

  if (showSkeleton) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-100 dark:border-gray-500">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        
        <ScrollArea className="flex-1 h-[calc(100%-80px)]">
          <div className="p-4 space-y-4">
            {/* Basic Settings Skeleton */}
            <div className="border rounded-lg bg-white dark:bg-gray-600 px-4 py-3">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Model Settings Skeleton */}
            <div className="border rounded-lg bg-white dark:bg-gray-600 px-4 py-3">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Appearance Skeleton */}
            <div className="border rounded-lg bg-white dark:bg-gray-600 px-4 py-3">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="flex gap-3">
                    <Skeleton className="w-12 h-10 rounded-xl" />
                    <Skeleton className="flex-1 h-10 rounded-xl" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <div className="flex gap-3">
                    <Skeleton className="w-12 h-10 rounded-xl" />
                    <Skeleton className="flex-1 h-10 rounded-xl" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Guidelines Skeleton */}
            <div className="border rounded-lg bg-white dark:bg-gray-600 px-4 py-3">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full rounded-xl" />
                    <Skeleton className="h-8 w-full rounded-xl" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full rounded-xl" />
                    <Skeleton className="h-8 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Configuration & Guidelines
        </h2>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100%-80px)]">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["basic", "guidelines"]} className="space-y-4">
            {/* Basic Settings */}
            <AccordionItem value="basic" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Basic Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Name</Label>
                    <Input
                      id="name"
                      value={agentData.name}
                      onChange={(e) => updateAgentData({ name: e.target.value })}
                      placeholder="Enter agent name"
                      className="mt-1.5 h-10 rounded-xl border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="chatbotName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chatbot Display Name</Label>
                    <Input
                      id="chatbotName"
                      value={agentData.chatbotName}
                      onChange={(e) => updateAgentData({ chatbotName: e.target.value })}
                      placeholder="Enter chatbot name"
                      className="mt-1.5 h-10 rounded-xl border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      value={agentData.description}
                      onChange={(e) => updateAgentData({ description: e.target.value })}
                      placeholder="Describe your agent's purpose"
                      className="mt-1.5 min-h-[80px] rounded-xl border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Model Settings */}
            <AccordionItem value="model" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Model Settings</span>
                  
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</Label>
                    </div>
                    
                    {modelsLoading ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-gray-500">Loading models...</span>
                      </div>
                    ) : (
                      <>
                        
                        
                        <div className="mt-1.5">
                          <ModernDropdown
                            value={agentData.model || globalDefaultModel || 'gpt-4-turbo'}
                            onValueChange={handleModelChange}
                            options={modelOptionsForDropdown}
                            placeholder="Select model"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature: {agentData.temperature}</Label>
                    <Slider
                      value={[agentData.temperature]}
                      onValueChange={(value) => updateAgentData({ temperature: value[0] })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="mt-3"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Tokens</Label>
                    <div className="mt-1.5">
                      <ModernDropdown
                        value={agentData.maxTokens?.toString() || '8000'}
                        onValueChange={(value) => updateAgentData({ maxTokens: parseInt(value) })}
                        options={maxTokensOptions}
                        placeholder="Select max tokens"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Appearance */}
            <AccordionItem value="appearance" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Appearance</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</Label>
                    <div className="flex gap-3 mt-1.5">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={agentData.primaryColor}
                        onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                        className="w-12 h-10 p-1 rounded-xl border-gray-200 dark:border-gray-700"
                      />
                      <Input
                        value={agentData.primaryColor}
                        onChange={(e) => updateAgentData({ primaryColor: e.target.value })}
                        className="flex-1 h-10 rounded-xl border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Color</Label>
                    <div className="flex gap-3 mt-1.5">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={agentData.secondaryColor}
                        onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                        className="w-12 h-10 p-1 rounded-xl border-gray-200 dark:border-gray-700"
                      />
                      <Input
                        value={agentData.secondaryColor}
                        onChange={(e) => updateAgentData({ secondaryColor: e.target.value })}
                        className="flex-1 h-10 rounded-xl border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fontFamily" className="text-sm font-medium text-gray-700 dark:text-gray-300">Font Family</Label>
                    <div className="mt-1.5">
                      <ModernDropdown
                        value={agentData.fontFamily || 'Inter'}
                        onValueChange={(value) => updateAgentData({ fontFamily: value })}
                        options={fontOptions}
                        placeholder="Select font family"
                      />
                    </div>
                  </div>
                  
                   <div>
                     <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat Button Position</Label>
                     <div className="mt-1.5">
                       <ModernDropdown
                         value={agentData.position || 'bottom-right'}
                         onValueChange={(value) => updateAgentData({ position: value as 'bottom-right' | 'bottom-left' })}
                         options={positionOptions}
                         placeholder="Select position"
                       />
                     </div>
                   </div>
                   
                   <div>
                     <Label htmlFor="buttonText" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat Button Text</Label>
                     <Input
                       id="buttonText"
                       value={agentData.buttonText}
                       onChange={(e) => updateAgentData({ buttonText: e.target.value })}
                       placeholder="Leave empty for icon-only button"
                       className="mt-1.5 h-10 rounded-xl border-gray-200 dark:border-gray-700"
                     />
                   </div>
                   
                   <div>
                     <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Avatar Image</Label>
                     <div className="mt-1.5 space-y-3">
                       {(agentData.avatar || agentData.avatarUrl) && (
                         <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                           <img 
                             src={agentData.avatar || agentData.avatarUrl} 
                             alt="Avatar preview" 
                             className="w-full h-full object-cover"
                           />
                         </div>
                       )}
                       <div className="flex gap-2">
                         <input
                           ref={fileInputRef}
                           type="file"
                           accept="image/*"
                           onChange={handleImageUpload}
                           className="hidden"
                         />
                         <Button
                           type="button"
                           variant="outline"
                           onClick={() => fileInputRef.current?.click()}
                           className="flex items-center gap-2 h-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                         >
                           <Upload className="h-4 w-4" />
                           Upload Image
                         </Button>
                         {(agentData.avatar || agentData.avatarUrl) && (
                           <Button
                             type="button"
                             variant="outline"
                             onClick={() => updateAgentData({ avatar: '', avatarUrl: '', avatarType: 'default' })}
                             className="h-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                           >
                             Remove
                           </Button>
                         )}
                       </div>
                     </div>
                   </div>
                   
                   <div>
                     <Label htmlFor="welcomeMessage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome Message</Label>
                     <Textarea
                       id="welcomeMessage"
                       value={agentData.welcomeMessage}
                       onChange={(e) => updateAgentData({ welcomeMessage: e.target.value })}
                       placeholder="Enter welcome message"
                       className="mt-1.5 min-h-[80px] rounded-xl border-gray-200 dark:border-gray-700"
                     />
                   </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Simplified Behavior Guidelines */}
            <AccordionItem value="guidelines" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Behavior Guidelines</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-6">
                  {/* Agent Type Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Type</Label>
                    <div className="mt-1.5">
                       <ModernDropdown
                         value={agentData.agentType || 'general-assistant'}
                         onValueChange={handleAgentTypeChange}
                         options={agentTypeOptions}
                         placeholder="Select agent type"
                         disabled={promptsLoading}
                       />
                    </div>
                  </div>

                  {/* Simplified System Prompt */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">System Prompt</Label>
                      <div className="flex items-center gap-2">
                        <ModernButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTemplateModal(true)}
                          disabled={promptsLoading || !getCurrentTemplate()}
                          className="h-8 px-3 rounded-lg text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          Show Template
                        </ModernButton>
                        <SystemPromptModal
                          value={agentData.systemPrompt || ''}
                          onChange={handleSystemPromptChange}
                          open={showSystemPromptModal}
                          onOpenChange={setShowSystemPromptModal}
                          trigger={
                            <ModernButton
                              variant="ghost"
                              size="sm"
                              icon={Expand}
                              iconOnly
                              className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                            />
                          }
                        />
                      </div>
                    </div>
                    <Textarea
                      value={agentData.systemPrompt || ''}
                      onChange={(e) => handleSystemPromptChange(e.target.value)}
                      placeholder="Define how your agent behaves..."
                      className="min-h-[100px] rounded-xl border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-green-600 dark:text-green-400">Do's</Label>
                    <div className="space-y-3 mt-2">
                      {agentData.guidelines.dos.map((guideline, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={guideline}
                            onChange={(e) => updateGuideline('dos', index, e.target.value)}
                            placeholder="Enter a do guideline"
                            className="h-10 rounded-xl border-gray-200 dark:border-gray-700"
                          />
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            icon={X}
                            iconOnly
                            onClick={() => removeGuideline('dos', index)}
                            className="h-10 w-10 p-0 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          />
                        </div>
                      ))}
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={Plus}
                        onClick={() => addGuideline('dos')}
                        className="h-10 rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        Add Do
                      </ModernButton>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-red-600 dark:text-red-400">Don'ts</Label>
                    <div className="space-y-3 mt-2">
                      {agentData.guidelines.donts.map((guideline, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={guideline}
                            onChange={(e) => updateGuideline('donts', index, e.target.value)}
                            placeholder="Enter a don't guideline"
                            className="h-10 rounded-xl border-gray-200 dark:border-gray-700"
                          />
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            icon={X}
                            iconOnly
                            onClick={() => removeGuideline('donts', index)}
                            className="h-10 w-10 p-0 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          />
                        </div>
                      ))}
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={Plus}
                        onClick={() => addGuideline('donts')}
                        className="h-10 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Add Don't
                      </ModernButton>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Behavior Settings */}
            <AccordionItem value="behavior" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Behavior Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Expert Handoff
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Allow the agent to escalate to human domain experts when needed
                      </p>
                    </div>
                    <Switch
                      checked={agentData.behavior?.expertHandoff || false}
                      onCheckedChange={(checked) => updateAgentData({ 
                        behavior: { ...agentData.behavior, expertHandoff: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        AI to AI Handoff
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Allow the agent to escalate to other AI agents when needed
                      </p>
                    </div>
                    <Switch
                      checked={agentData.behavior?.aiToAiHandoff || false}
                      onCheckedChange={(checked) => updateAgentData({ 
                        behavior: { ...agentData.behavior, aiToAiHandoff: checked }
                      })}
                    />
                  </div>
                  
                 
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Suggestions */}
            <AccordionItem value="suggestions" className="border rounded-lg bg-white dark:bg-gray-800 px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Quick Suggestions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  {agentData.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={suggestion}
                        onChange={(e) => updateSuggestion(index, e.target.value)}
                        placeholder="Enter a suggestion"
                        className="h-10 rounded-xl border-gray-200 dark:border-gray-700"
                      />
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={X}
                        iconOnly
                        onClick={() => removeSuggestion(index)}
                        className="h-10 w-10 p-0 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      />
                    </div>
                  ))}
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    onClick={addSuggestion}
                    className="h-10 rounded-xl text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    Add Suggestion
                  </ModernButton>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      {/* Template Modal */}
      <SystemPromptModal
        value={getCurrentTemplate()}
        onChange={() => {}} // Read-only for template
        open={showTemplateModal}
        onOpenChange={setShowTemplateModal}
        trigger={null}
        isTemplate={true}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
};
