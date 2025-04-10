
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ApiKeysSection = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Your 7en.ai API Keys</h2>
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
