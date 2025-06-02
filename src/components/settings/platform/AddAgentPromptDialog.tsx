
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface AddAgentPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptAdded: (promptData: any) => Promise<any>;
}

const agentTypes = ['Customer Support', 'Technical Support', 'Sales', 'Custom'];

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Agent Prompt</DialogTitle>
          <DialogDescription>
            Create a new system prompt configuration for an agent type
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent_type">Agent Type *</Label>
            <Select 
              value={formData.agent_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, agent_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select agent type" />
              </SelectTrigger>
              <SelectContent>
                {agentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.agent_type || !formData.system_prompt}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Prompt'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAgentPromptDialog;
