
import React, { useState } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import ModernButton from '@/components/dashboard/ModernButton';
import { Key } from 'lucide-react';

interface CreateApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateKey: (name: string, expiresIn: string) => Promise<void>;
  isLoading: boolean;
}

const EXPIRY_OPTIONS = [
  { value: '1week', label: '1 week' },
  { value: '15days', label: '15 days' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
];

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  open,
  onOpenChange,
  onCreateKey,
  isLoading
}) => {
  const [keyName, setKeyName] = useState('');
  const [expiresIn, setExpiresIn] = useState('3months');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    
    try {
      await onCreateKey(keyName.trim(), expiresIn);
      setKeyName('');
      setExpiresIn('3months');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setKeyName('');
    setExpiresIn('3months');
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

        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">Expires in</label>
          <ModernDropdown
            value={expiresIn}
            onValueChange={setExpiresIn}
            options={EXPIRY_OPTIONS}
            placeholder="Select expiry period"
            showSearch={false}
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
