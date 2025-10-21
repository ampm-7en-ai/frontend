import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { useCreateAddon, useUpdateAddon, Addon } from '@/hooks/useAddons';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon?: Addon | null;
}

export function AddonDialog({ open, onOpenChange, addon }: AddonDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateAddon();
  const updateMutation = useUpdateAddon();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_monthly: '',
    addon_type: 'AUTO_TICKET_RESPONSE' as 'AUTO_TICKET_RESPONSE' | 'WHITE_LABELING' | 'ADD_ON_AGENT',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  useEffect(() => {
    if (addon) {
      setFormData({
        name: addon.name,
        description: addon.description,
        price_monthly: addon.price_monthly,
        addon_type: addon.addon_type,
        status: addon.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price_monthly: '',
        addon_type: 'AUTO_TICKET_RESPONSE',
        status: 'ACTIVE',
      });
    }
  }, [addon, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.price_monthly || !formData.addon_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price_monthly: parseFloat(formData.price_monthly),
        addon_type: formData.addon_type,
        status: formData.status,
      };

      if (addon) {
        await updateMutation.mutateAsync({ id: addon.id, ...data });
        toast({
          title: "Success",
          description: "Add-on updated successfully.",
          variant: "success",
        });
      } else {
        await createMutation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Add-on created successfully.",
          variant: "success",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: addon ? "Failed to update add-on." : "Failed to create add-on.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{addon ? 'Edit Add-on' : 'Create Add-on'}</DialogTitle>
            <DialogDescription>
              {addon ? 'Update the add-on details below.' : 'Add a new subscription add-on.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Extra Agent"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this add-on..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price per Month ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="19.00"
                value={formData.price_monthly}
                onChange={(e) => setFormData(prev => ({ ...prev, price_monthly: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="addon_type">Addon Type *</Label>
              <ModernDropdown
                value={formData.addon_type}
                onValueChange={(value: 'AUTO_TICKET_RESPONSE' | 'WHITE_LABELING' | 'ADD_ON_AGENT') => 
                  setFormData(prev => ({ ...prev, addon_type: value }))
                }
                options={[
                  { label: "Auto Ticket Response", value: "AUTO_TICKET_RESPONSE" },
                  { label: "White Labeling", value: "WHITE_LABELING" },
                  { label: "Add-on Agent", value: "ADD_ON_AGENT" },
                ]}
                placeholder="Select addon type"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <ModernDropdown
                value={formData.status}
                onValueChange={(value: 'ACTIVE' | 'INACTIVE') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
                options={[
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                ]}
                placeholder="Select status"
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter>
            <ModernButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </ModernButton>
            <ModernButton type="submit" disabled={isLoading} variant="primary">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {addon ? 'Update' : 'Create'}
            </ModernButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
