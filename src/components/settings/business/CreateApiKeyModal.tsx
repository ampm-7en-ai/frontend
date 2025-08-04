
import React, { useState } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { ModernInput } from '@/components/ui/modern-input';
import ModernButton from '@/components/dashboard/ModernButton';
import { Key } from 'lucide-react';

interface CreateApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateKey: (name: string) => Promise<void>;
  isLoading: boolean;
}

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  open,
  onOpenChange,
  onCreateKey,
  isLoading
}) => {
  const [keyName, setKeyName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    
    try {
      await onCreateKey(keyName.trim());
      setKeyName('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setKeyName('');
    onOpenChange(false);
  };

  return (
    <ModernModal
      open={open}
      onOpenChange={handleClose}
      title="Create API Key"
      description="Give your API key a descriptive name to help identify its purpose."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        

        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">Key Name</label>
          <ModernInput
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Enter a name for your API key"
            required
            className="w-full"
            variant="modern"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <ModernButton
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </ModernButton>
          <ModernButton
            type="submit"
            variant="primary"
            disabled={isLoading || !keyName.trim()}
            className="px-6"
          >
            {isLoading ? 'Creating...' : 'Create API Key'}
          </ModernButton>
        </div>
      </form>
    </ModernModal>
  );
};
