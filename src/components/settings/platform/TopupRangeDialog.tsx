import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCreateTopupRange, useUpdateTopupRange, TopupRange } from '@/hooks/useTopupRanges';
import { Loader2 } from 'lucide-react';

interface TopupRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRange?: TopupRange | null;
  trigger?: React.ReactNode;
}

const TopupRangeDialog: React.FC<TopupRangeDialogProps> = ({
  open,
  onOpenChange,
  editRange,
  trigger
}) => {
  const { toast } = useToast();
  const createMutation = useCreateTopupRange();
  const updateMutation = useUpdateTopupRange();

  const [name, setName] = useState('');
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [pricePerReply, setPricePerReply] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (editRange) {
      setName(editRange.name);
      setMinQty(editRange.min_qty.toString());
      setMaxQty(editRange.max_qty.toString());
      setPricePerReply(editRange.price_per_reply);
      setActive(editRange.active);
    } else {
      setName('');
      setMinQty('');
      setMaxQty('');
      setPricePerReply('');
      setActive(true);
    }
  }, [editRange, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !minQty || !maxQty || !pricePerReply) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const minQuantity = parseInt(minQty);
    const maxQuantity = parseInt(maxQty);
    
    if (minQuantity >= maxQuantity) {
      toast({
        title: "Validation Error",
        description: "Maximum quantity must be greater than minimum quantity.",
        variant: "destructive"
      });
      return;
    }

    const rangeData = {
      name,
      min_qty: minQuantity,
      max_qty: maxQuantity,
      price_per_reply: pricePerReply,
      active
    };

    try {
      if (editRange) {
        await updateMutation.mutateAsync({ id: editRange.id, ...rangeData });
        toast({
          title: "Range Updated",
          description: "Topup range has been updated successfully."
        });
      } else {
        await createMutation.mutateAsync(rangeData);
        toast({
          title: "Range Created",
          description: "Topup range has been created successfully."
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save topup range. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const content = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {editRange ? 'Edit Topup Range' : 'Create Topup Range'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Range Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Small"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minQty">Min Quantity</Label>
            <Input
              id="minQty"
              type="number"
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
              placeholder="e.g., 100"
              min="1"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxQty">Max Quantity</Label>
            <Input
              id="maxQty"
              type="number"
              value={maxQty}
              onChange={(e) => setMaxQty(e.target.value)}
              placeholder="e.g., 499"
              min="1"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pricePerReply">Price per Reply ($)</Label>
          <Input
            id="pricePerReply"
            type="number"
            step="0.01"
            value={pricePerReply}
            onChange={(e) => setPricePerReply(e.target.value)}
            placeholder="e.g., 0.05"
            min="0.01"
            required
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={active}
            onCheckedChange={setActive}
          />
          <Label htmlFor="active">Active</Label>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editRange ? 'Update Range' : 'Create Range'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
};

export default TopupRangeDialog;