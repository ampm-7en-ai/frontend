
import React from 'react';
import { Slack } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ConnectedAccountsSection = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Connected accounts</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Slack className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Slack</h3>
                <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">not connected</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                To install 7en.ai to your Slack workspace, please visit the integrations page of the chatbot you want to connect.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ConnectedAccountsSection;
