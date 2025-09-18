import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTopupOptions, useCreateCheckout } from '@/hooks/useTopupOptions';
import { CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TopupModal = ({ open, onOpenChange }: TopupModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [customReplies, setCustomReplies] = useState<string>('');
  
  const { data: topupOptions, isLoading } = useTopupOptions();
  const createCheckout = useCreateCheckout();

  const selectedPackageData = topupOptions?.presets.find(p => p.id === selectedPackage);
  
  const calculateCustomPrice = () => {
    const replies = parseInt(customReplies);
    if (!replies || !topupOptions?.ranges) return null;

    const applicableRange = topupOptions.ranges.find(
      range => replies >= range.min_qty && replies <= range.max_qty
    );

    return applicableRange ? {
      price: (replies * applicableRange.price_per_reply).toFixed(2),
      range: applicableRange
    } : null;
  };

  const customPriceData = calculateCustomPrice();

  const handleCheckout = () => {
    if (selectedPackage && selectedPackageData) {
      createCheckout.mutate({ amount: selectedPackageData.amount }, {
        onError: (error) => {
          toast.error('Failed to create checkout: ' + error.message);
        }
      });
    } else if (customReplies) {
      const replies = parseInt(customReplies);
      if (!replies || replies <= 0) {
        toast.error('Please enter a valid number of replies');
        return;
      }

      if (!customPriceData) {
        toast.error('Please enter a quantity within the available ranges');
        return;
      }

      createCheckout.mutate({ replies }, {
        onError: (error) => {
          toast.error('Failed to create checkout: ' + error.message);
        }
      });
    } else {
      toast.error('Please select a package or enter custom amount');
    }
  };

  const canCheckout = selectedPackage || customPriceData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Top-up Account
          </DialogTitle>
          <DialogDescription>
            Select a package or enter custom amount
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" text="Loading..." />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preset Packages */}
            {topupOptions?.presets && topupOptions.presets.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preset Packages</Label>
                <div className="space-y-2">
                  {topupOptions.presets.map((preset) => (
                    <Card 
                      key={preset.id} 
                      className={cn(
                        "cursor-pointer transition-all hover:bg-muted/50",
                        selectedPackage === preset.id && "ring-2 ring-primary bg-primary/5"
                      )}
                      onClick={() => {
                        setSelectedPackage(selectedPackage === preset.id ? null : preset.id);
                        setCustomReplies('');
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{preset.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {preset.replies.toLocaleString()} replies
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">${preset.amount}</span>
                            {selectedPackage === preset.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Custom */}
            {topupOptions?.ranges && topupOptions.ranges.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Or custom</Label>
                
                {/* Quick select pills */}
                <div className="flex flex-wrap gap-1">
                  {topupOptions.ranges.map((range) => {
                    const suggestedValues = [
                      range.min_qty,
                      Math.floor((range.min_qty + range.max_qty) / 2),
                      range.max_qty
                    ].filter((value, index, array) => array.indexOf(value) === index);
                    
                    return suggestedValues.map((value) => (
                      <button
                        key={`${range.id}-${value}`}
                        type="button"
                        onClick={() => {
                          setCustomReplies(value.toString());
                          setSelectedPackage(null);
                        }}
                        className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                      >
                        {value.toLocaleString()}
                      </button>
                    ));
                  })}
                </div>
                
                <div>
                  <Input
                    type="number"
                    value={customReplies}
                    onChange={(e) => {
                      setCustomReplies(e.target.value);
                      setSelectedPackage(null);
                    }}
                    placeholder="Number of replies..."
                    min="1"
                  />
                </div>
                
                {customPriceData && (
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-semibold">${customPriceData.price}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Using {customPriceData.range.name} range (${customPriceData.range.price_per_reply}/reply)
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={handleCheckout}
              disabled={!canCheckout || createCheckout.isPending}
              className="w-full"
            >
              {createCheckout.isPending ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};