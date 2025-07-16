
import React, { useState } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AddAgentPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptAdded: (promptData: any) => Promise<any>;
}

const AddAgentPromptDialog = ({ isOpen, onClose, onPromptAdded }: AddAgentPromptDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    agent_type: '',
    system_prompt: '',
    enable_fallback: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agent_type || !formData.system_prompt) {
      return;
    }

    try {
      setIsLoading(true);
      await onPromptAdded(formData);
      setFormData({
        agent_type: '',
        system_prompt: '',
        enable_fallback: true
      });
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModernModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Add New Agent Prompt"
      description="Create a new system prompt configuration for an agent type"
      size="2xl"
      fixedFooter
      footer={
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || !formData.agent_type || !formData.system_prompt}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="!mb-0" />
                Creating...
              </>
            ) : (
              'Create Prompt'
            )}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="agent_type">Agent Type *</Label>
          <Input
            id="agent_type"
            value={formData.agent_type}
            onChange={(e) => setFormData(prev => ({ ...prev, agent_type: e.target.value }))}
            placeholder="Enter agent type (e.g., Customer Support, Sales, etc.)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="system_prompt">System Prompt *</Label>
          <Textarea
            id="system_prompt"
            value={formData.system_prompt}
            onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
            placeholder="Enter the system prompt for this agent type..."
            className="min-h-[150px]"
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {formData.system_prompt.length}/2000 characters
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enable_fallback"
            checked={formData.enable_fallback}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_fallback: checked }))}
          />
          <Label htmlFor="enable_fallback">Enable fallback provider if primary fails</Label>
        </div>
      </form>
    </ModernModal>
  );
};

export default AddAgentPromptDialog;
