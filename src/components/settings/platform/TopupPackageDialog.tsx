import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateTopupPackage, useUpdateTopupPackage, TopupPackage } from '@/hooks/useTopupPackages';
import { Loader2 } from 'lucide-react';

interface TopupPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPackage?: TopupPackage | null;
  trigger?: React.ReactNode;
}

const TopupPackageDialog: React.FC<TopupPackageDialogProps> = ({
  open,
  onOpenChange,
  editPackage,
  trigger
}) => {
  const { toast } = useToast();
  const createMutation = useCreateTopupPackage();
  const updateMutation = useUpdateTopupPackage();

  const [name, setName] = useState('');
  const [replies, setReplies] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    if (editPackage) {
      setName(editPackage.name);
      setReplies(editPackage.replies.toString());
      setAmount(editPackage.amount);
      setStatus(editPackage.status);
    } else {
      setName('');
      setReplies('');
      setAmount('');
      setStatus('ACTIVE');
    }
  }, [editPackage, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !replies || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const packageData = {
      name,
      replies: parseInt(replies),
      amount: parseFloat(amount),
      status
    };

    try {
      if (editPackage) {
        await updateMutation.mutateAsync({ id: editPackage.id, ...packageData });
        toast({
          title: "Package Updated",
          description: "Topup package has been updated successfully."
        });
      } else {
        await createMutation.mutateAsync(packageData);
        toast({
          title: "Package Created",
          description: "Topup package has been created successfully."
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save topup package. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const content = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {editPackage ? 'Edit Topup Package' : 'Create Topup Package'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Package Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Starter $20"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="replies">Number of Replies</Label>
          <Input
            id="replies"
            type="number"
            value={replies}
            onChange={(e) => setReplies(e.target.value)}
            placeholder="e.g., 800"
            min="1"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 15.00"
            min="0.01"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value: 'ACTIVE' | 'INACTIVE') => setStatus(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
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
            {editPackage ? 'Update Package' : 'Create Package'}
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

export default TopupPackageDialog;