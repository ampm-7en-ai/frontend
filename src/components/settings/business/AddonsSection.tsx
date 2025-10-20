import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAddons } from '@/hooks/useAddons';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AddonsSection = () => {
  const { data: addons, isLoading } = useAddons();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Add-ons</h2>
      </div>

      <div className="space-y-4">
        {addons?.map((addon) => (
          <Card key={addon.id} className="p-6 bg-card border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {addon.name}
                </h3>
                <p className="text-base font-medium text-foreground mb-1">
                  ${parseFloat(addon.price_monthly).toFixed(0)} / month
                </p>
                <p className="text-sm text-muted-foreground">
                  {addon.description}
                </p>
              </div>
              
              <div className="flex items-center gap-3 ml-6">
                <span className="text-sm text-muted-foreground">
                  {addon.status === 'ACTIVE' ? 'Enabled' : 'Disabled'}
                </span>
                <Switch 
                  checked={addon.status === 'ACTIVE'}
                  onCheckedChange={() => {
                    // TODO: Implement toggle functionality
                    console.log('Toggle addon:', addon.id);
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AddonsSection;
