import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAddons } from '@/hooks/useAddons';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icon } from '@/components/icons';

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
    <section className="p-8">
      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Add-ons</h2>
        <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
          Enhance your plan with additional features and capabilities
        </p>
      </div>
      
      <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
            <Icon type='plain' name={`Extension`} color='hsl(var(--primary))' className='h-5 w-5' />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Available Add-ons</h3>
        </div>

        <div className="space-y-4">
          {addons?.map((addon) => (
            <div key={addon.id} className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-6 border border-neutral-200/50 dark:border-none">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {addon.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      ${parseFloat(addon.price_monthly).toFixed(0)}
                    </span>
                    <span className="text-muted-foreground dark:text-muted-foreground">/ month</span>
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {addon.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 ml-6">
                  <span className="text-sm text-muted-foreground dark:text-muted-foreground">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AddonsSection;
