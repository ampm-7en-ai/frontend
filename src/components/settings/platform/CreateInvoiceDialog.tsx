
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (invoice: InvoiceInput) => void;
}

interface InvoiceInput {
  business: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
}

export const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<InvoiceInput>({
    defaultValues: {
      business: '',
      amount: '',
      status: 'pending',
      date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
    }
  });

  const handleFormSubmit = (data: InvoiceInput) => {
    // Format the amount with $ sign if it doesn't have one
    const amount = data.amount.startsWith('$') ? data.amount : `$${data.amount}`;
    
    // Format the date to be more readable
    const dateObj = new Date(data.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
    
    onSubmit({
      ...data,
      amount,
      date: formattedDate
    });
    
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) reset();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Generate a new invoice for a business.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="business">Business Name</Label>
            <Input 
              id="business"
              {...register('business', { required: "Business name is required" })}
              placeholder="e.g., Acme Corp"
            />
            {errors.business && (
              <p className="text-sm text-red-500">{errors.business.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Invoice Amount ($)</Label>
            <Input 
              id="amount"
              {...register('amount', { 
                required: "Amount is required",
                pattern: {
                  value: /^\$?[\d,]+(\.\d{1,2})?$/,
                  message: "Please enter a valid amount"
                }
              })}
              placeholder="e.g., 199.99"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger id="status" variant="modern">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent variant="modern">
                    <SelectItem value="paid" variant="modern">Paid</SelectItem>
                    <SelectItem value="pending" variant="modern">Pending</SelectItem>
                    <SelectItem value="overdue" variant="modern">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Invoice Date</Label>
            <Input 
              id="date"
              type="date"
              {...register('date', { required: "Date is required" })}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Invoice</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
