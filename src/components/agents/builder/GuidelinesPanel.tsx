
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBuilder } from '@/components/agents/builder/BuilderContext';
import { IntegrationProviderCard } from '@/components/agents/builder/IntegrationProviderCard';
import { IntegrationSelectionModal } from '@/components/agents/builder/IntegrationSelectionModal';
import { Plus, Plug, Wand2 } from 'lucide-react';

export const GuidelinesPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [updatingProvider, setUpdatingProvider] = useState<string | null>(null);

  const handleProviderToggle = async (providerId: string, enabled: boolean) => {
    setUpdatingProvider(providerId);
    
    try {
      const currentProviders: string[] = (agentData.ticketing_providers || []).map(p => String(p));
      let newProviders: string[];
      
      if (enabled) {
        // Add provider
        newProviders = [...currentProviders, providerId];
      } else {
        // Remove provider
        newProviders = currentProviders.filter(id => id !== providerId);
      }
      
      updateAgentData({ ticketing_providers: newProviders });
      
      // Here you would typically also make an API call to update the backend
      // await updateAgentProviders(agentData.id, newProviders);
      
    } catch (error) {
      console.error('Error updating provider:', error);
    } finally {
      setUpdatingProvider(null);
    }
  };

  // Handle adding new provider from modal
  const handleAddProvider = async (providerId: string) => {
    const currentProviders: string[] = (agentData.ticketing_providers || []).map(p => String(p));
    const newProviders: string[] = [...currentProviders, providerId];
    
    updateAgentData({ ticketing_providers: newProviders });
    setShowIntegrationModal(false);
  };

  return (
    <div className="p-4 space-y-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="agent-details">
          <AccordionTrigger className="px-4 py-3">Agent Details</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  type="text" 
                  id="name" 
                  value={agentData.name || ''}
                  onChange={(e) => updateAgentData({ name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={agentData.description || ''}
                  onChange={(e) => updateAgentData({ description: e.target.value })}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="system-prompt">
          <AccordionTrigger className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              System Prompt
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="system-prompt-text">System Prompt</Label>
                <Textarea
                  id="system-prompt-text"
                  value={agentData.systemPrompt || ''}
                  onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="integrations">
          <AccordionTrigger className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Plug className="w-4 h-4" />
              Integrations
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            <div className="space-y-3">
              {/* Show current providers */}
              {agentData.ticketing_providers && agentData.ticketing_providers.length > 0 ? (
                agentData.ticketing_providers.map((providerId) => (
                  <IntegrationProviderCard
                    key={String(providerId)}
                    providerId={String(providerId)}
                    isEnabled={true}
                    onToggle={handleProviderToggle}
                    isUpdating={updatingProvider === String(providerId)}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No integrations configured yet.
                </p>
              )}
              
              {/* Add integration button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowIntegrationModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add App
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <IntegrationSelectionModal
        open={showIntegrationModal}
        onOpenChange={setShowIntegrationModal}
        currentProviders={(agentData.ticketing_providers || []).map(p => String(p))}
        onAddProvider={handleAddProvider}
      />
    </div>
  );
};
