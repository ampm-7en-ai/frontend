
import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePricingModal } from '@/hooks/usePricingModal';

const ApiKeysSection = () => {
  const { openPricingModal } = usePricingModal();

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
        <span>Your 7en.ai API Keys</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openPricingModal}
          className="flex items-center gap-1"
        >
          Upgrade Plan <ChevronRight className="h-3 w-3" />
        </Button>
      </h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-muted-foreground">
              Upgrade your plan to enable API keys.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ApiKeysSection;
