import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { SystemPromptModal } from '@/components/agents/builder/SystemPromptModal';
import { useAgentPrompts } from '@/hooks/useAgentPrompts';
import ModernButton from '@/components/dashboard/ModernButton';
import { Expand } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SystemPromptSectionProps {
  agentType: string;
  systemPrompt: string;
  onAgentTypeChange: (agentType: string) => void;
  onSystemPromptChange: (prompt: string) => void;
}

export const SystemPromptSection = ({
  agentType,
  systemPrompt,
  onAgentTypeChange,
  onSystemPromptChange
}: SystemPromptSectionProps) => {
  const { prompts, isLoading: promptsLoading } = useAgentPrompts(true, true);
  const [userPromptsByType, setUserPromptsByType] = useState<Record<string, string>>({});
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Initialize user prompts storage
  useEffect(() => {
    if (agentType && systemPrompt && !userPromptsByType[agentType]) {
      setUserPromptsByType(prev => ({
        ...prev,
        [agentType]: systemPrompt
      }));
    }
  }, [agentType, systemPrompt]);

  // Get current template for the selected agent type
  const getCurrentTemplate = () => {
    const matchingPrompt = prompts.find(p => p.agent_type === agentType);
    return matchingPrompt?.system_prompt || '';
  };

  // Handle system prompt changes
  const handleSystemPromptChange = (value: string) => {
    onSystemPromptChange(value);
    
    // Store user's custom content per agent type
    setUserPromptsByType(prev => ({
      ...prev,
      [agentType]: value
    }));
  };

  // Handle agent type changes - restore user's content or keep blank
  const handleAgentTypeChange = (newAgentType: string) => {
    onAgentTypeChange(newAgentType);
    
    // Restore user's previously written content for this agent type, or keep blank
    const previousUserContent = userPromptsByType[newAgentType] || '';
    onSystemPromptChange(previousUserContent);
  };

  // Handle template usage - replace current prompt with template
  const handleUseTemplate = () => {
    const templateContent = getCurrentTemplate();
    if (templateContent) {
      handleSystemPromptChange(templateContent);
      setShowTemplateModal(false);
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Agent Type Selection */}
      <div>
        <Label className="text-sm font-medium text-foreground">Agent Persona Type</Label>
        <div className="mt-1.5">
          <ModernDropdown
            value={agentType || 'general-assistant'}
            onValueChange={handleAgentTypeChange}
            options={agentTypeOptions}
            placeholder="Select agent type"
            disabled={promptsLoading}
          />
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-foreground">Prompt</Label>
          <div className="flex items-center gap-2">
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplateModal(true)}
              disabled={promptsLoading || !getCurrentTemplate()}
              className="h-8 px-3 rounded-lg text-xs text-primary hover:text-primary hover:bg-primary/10"
            >
              Show Template
            </ModernButton>
            <SystemPromptModal
              value={systemPrompt || ''}
              onChange={handleSystemPromptChange}
              open={showSystemPromptModal}
              onOpenChange={setShowSystemPromptModal}
              trigger={
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={Expand}
                  iconOnly
                  className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                />
              }
            />
          </div>
        </div>
        <Textarea
          value={systemPrompt || ''}
          onChange={(e) => handleSystemPromptChange(e.target.value)}
          placeholder="Define how your agent behaves..."
          className="min-h-[100px] rounded-xl border-border bg-background text-foreground"
        />
      </div>

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
