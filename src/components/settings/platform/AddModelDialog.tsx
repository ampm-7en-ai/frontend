
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';

interface AddModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onModelAdded: (providerId: number, modelName: string, displayName: string) => Promise<void>;
  providerId: number;
  providerName: string;
}

const AddModelDialog = ({ isOpen, onClose, onModelAdded, providerId, providerName }: AddModelDialogProps) => {
  const [modelName, setModelName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!modelName.trim()) return;

    try {
      setIsLoading(true);
      await onModelAdded(providerId, modelName.trim(), displayName.trim());
      setModelName('');
      onClose();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setModelName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Model to {providerName}</DialogTitle>
          <DialogDescription>
            Add a new model to this provider configuration.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              placeholder="e.g., gpt-4o, claude-3-sonnet"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              disabled={isLoading}
            />
            <Label htmlFor="displayName">Display Name (Semantic name)</Label>
             <Input
              id="displayName"
              placeholder="e.g., Open AI GPT Turbo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter>
            <ModernButton type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </ModernButton>
            <ModernButton type="submit" disabled={isLoading || !modelName.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Model'
              )}
            </ModernButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddModelDialog;
