
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">API Key Name</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                Choose a name that helps you identify this key's purpose (e.g., "Production API", "Development Testing").
              </p>
            </div>
          </div>
        </div>

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
          <p className="text-xs text-muted-foreground">
            This name will help you identify the key in your dashboard.
          </p>
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
