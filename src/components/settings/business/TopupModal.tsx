import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTopupOptions, useCreateCheckout } from '@/hooks/useTopupOptions';
import { CreditCard, Package, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface TopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TopupModal = ({ open, onOpenChange }: TopupModalProps) => {
  const [customReplies, setCustomReplies] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<number | null>(null);
  
  const { data: topupOptions, isLoading } = useTopupOptions();
  const createCheckout = useCreateCheckout();

  const handlePresetCheckout = (amount: number) => {
    createCheckout.mutate({ amount }, {
      onError: (error) => {
        toast.error('Failed to create checkout: ' + error.message);
      }
    });
  };

  const handleCustomCheckout = () => {
    const replies = parseInt(customReplies);
    if (!replies || replies <= 0) {
      toast.error('Please enter a valid number of replies');
      return;
    }

    const applicableRange = topupOptions?.ranges.find(
      range => replies >= range.min_qty && replies <= range.max_qty
    );

    if (!applicableRange) {
      toast.error('Please enter a quantity within the available ranges');
      return;
    }

    createCheckout.mutate({ replies }, {
      onError: (error) => {
        toast.error('Failed to create checkout: ' + error.message);
      }
    });
  };

  const calculateCustomPrice = () => {
    const replies = parseInt(customReplies);
    if (!replies || !topupOptions?.ranges) return null;

    const applicableRange = topupOptions.ranges.find(
      range => replies >= range.min_qty && replies <= range.max_qty
    );

    if (applicableRange) {
      return (replies * applicableRange.price_per_reply).toFixed(2);
    }
    return null;
  };

  const customPrice = calculateCustomPrice();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Top-up Your Account
          </DialogTitle>
          <DialogDescription>
            Choose from preset packages or customize your own top-up amount
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Loading top-up options..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preset Packages */}
            {topupOptions?.presets && topupOptions.presets.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Preset Packages</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topupOptions.presets.map((preset) => (
                    <Card key={preset.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{preset.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Replies:</span>
                          <span className="font-medium">{preset.replies.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">${preset.amount}</span>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => handlePresetCheckout(preset.amount)}
                          disabled={createCheckout.isPending}
                        >
                          {createCheckout.isPending ? 'Processing...' : 'Buy Now'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Top-up */}
            {topupOptions?.ranges && topupOptions.ranges.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="h-4 w-4" />
                    <h3 className="text-lg font-semibold">Custom Top-up</h3>
                  </div>
                  
                  {/* Available Ranges */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Available Ranges:</Label>
                    <div className="flex flex-wrap gap-2">
                      {topupOptions.ranges.map((range) => (
                        <Badge key={range.id} variant="outline" className="px-3 py-1">
                          {range.name}: {range.min_qty}-{range.max_qty} replies 
                          at ${range.price_per_reply}/reply
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-replies">Number of Replies</Label>
                      <Input
                        id="custom-replies"
                        type="number"
                        value={customReplies}
                        onChange={(e) => setCustomReplies(e.target.value)}
                        placeholder="Enter number of replies..."
                        min="1"
                      />
                    </div>
                    
                    {customPrice && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Cost:</span>
                          <span className="text-lg font-semibold">${customPrice}</span>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleCustomCheckout}
                      disabled={!customPrice || createCheckout.isPending}
                      className="w-full"
                    >
                      {createCheckout.isPending ? 'Processing...' : 'Proceed to Checkout'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};