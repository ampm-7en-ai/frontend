
import React from 'react';
import { Slack } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ConnectedAccountsSection = () => {
  const navigate = useNavigate();

  const handleConnectSlack = () => {
    navigate('/integrations');
  };

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
                Connect 7en.ai to your Slack workspace to enable automated responses and notifications.
              </p>
            </div>
            <Button variant="outline" onClick={handleConnectSlack}>
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ConnectedAccountsSection;
