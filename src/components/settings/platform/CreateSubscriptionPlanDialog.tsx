
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';

interface CreateSubscriptionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (plan: SubscriptionPlanInput) => void;
}

interface SubscriptionPlanInput {
  name: string;
  description: string;
  price: string;
  duration_days: number;
  features?: string[];
}

export const CreateSubscriptionPlanDialog: React.FC<CreateSubscriptionPlanDialogProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SubscriptionPlanInput>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      duration_days: 30,
      features: []
    }
  });

  const handleFormSubmit = (data: SubscriptionPlanInput) => {
    // Convert price to a number for API submission
    const planData = {
      ...data,
      price: parseFloat(data.price).toString(),
      features: data.features || [],
    };
    
    onSubmit(planData);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) reset();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Subscription Plan</DialogTitle>
          <DialogDescription>
            Add a new subscription plan to your platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input 
              id="name"
              {...register('name', { required: "Plan name is required" })}
              placeholder="e.g., Basic, Premium, Enterprise"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Monthly Price ($)</Label>
            <Input 
              id="price"
              {...register('price', { 
                required: "Price is required",
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter a valid price"
                }
              })}
              placeholder="e.g., 19.99"
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration_days">Duration (days)</Label>
            <Input 
              id="duration_days"
              type="number"
              {...register('duration_days', { 
                required: "Duration is required",
                min: {
                  value: 1,
                  message: "Duration must be at least 1 day"
                }
              })}
            />
            {errors.duration_days && (
              <p className="text-sm text-red-500">{errors.duration_days.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              {...register('description', { required: "Description is required" })}
              placeholder="Describe the benefits of this plan"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea 
              id="features"
              {...register('features')}
              placeholder="e.g., 5 Agents&#10;10GB Storage&#10;24/7 Support"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Enter each feature on a separate line. These will be displayed as badges.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
