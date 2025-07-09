
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Settings, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ZendeskIntegration {
  id: string;
  team: number;
  provider: string;
  domain: string;
  email: string;
  webhook_path: string;
  webhook_url: string;
  created_at: string;
  updated_at: string;
}

interface ZendeskResponse {
  message: string;
  data: {
    has_zendesk_integrated: boolean;
    integration?: ZendeskIntegration;
  };
  status: string;
  permissions: string[];
}

const ZendeskIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [integration, setIntegration] = useState<ZendeskIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    domain: '',
    email: '',
    api_key: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const checkZendeskIntegration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}ticketing/zendesk-integrations/`, {
        headers: getAuthHeaders(user?.accessToken || '')
      });

      if (!response.ok) {
        throw new Error('Failed to check Zendesk integration');
      }

      const data: ZendeskResponse = await response.json();
      setIsConnected(data.data.has_zendesk_integrated);
      if (data.data.integration) {
        setIntegration(data.data.integration);
      }
    } catch (error) {
      console.error('Error checking Zendesk integration:', error);
      toast({
        title: "Error",
        description: "Failed to check Zendesk integration status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIntegration = async () => {
    if (!integration) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${BASE_URL}ticketing/zendesk-integrations/${integration.id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(user?.accessToken || ''),
        body: JSON.stringify(updateForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update Zendesk integration');
      }

      const data: ZendeskResponse = await response.json();
      if (data.data.integration) {
        setIntegration(data.data.integration);
      }
      
      toast({
        title: "Success",
        description: "Zendesk integration updated successfully",
      });
      
      setIsUpdateDialogOpen(false);
      setUpdateForm({ domain: '', email: '', api_key: '' });
    } catch (error) {
      console.error('Error updating Zendesk integration:', error);
      toast({
        title: "Error",
        description: "Failed to update Zendesk integration",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyWebhook = () => {
    if (integration?.webhook_url) {
      navigator.clipboard.writeText(integration.webhook_url);
      toast({
        title: "Copied!",
        description: "Webhook URL copied to clipboard",
      });
    }
  };

  const openUpdateDialog = () => {
    if (integration) {
      setUpdateForm({
        domain: integration.domain,
        email: integration.email,
        api_key: ''
      });
    }
    setIsUpdateDialogOpen(true);
  };

  useEffect(() => {
    if (user?.accessToken) {
      checkZendeskIntegration();
    }
  }, [user?.accessToken]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" text="Checking Zendesk integration..." />
      </div>
    );
  }

  if (!isConnected || !integration) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Zendesk Not Connected</h3>
        <p className="text-muted-foreground mb-4">
          Connect your Zendesk account to enable automated ticket management and customer support integration.
        </p>
        <Button variant="outline" disabled>
          <ExternalLink className="h-4 w-4 mr-2" />
          Connect Zendesk
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Contact support to set up your Zendesk integration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Zendesk Connected</h3>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Active
          </Badge>
        </div>
        <Button variant="outline" onClick={openUpdateDialog}>
          <Settings className="h-4 w-4 mr-2" />
          Update Settings
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Integration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Domain</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={integration.domain} readOnly className="bg-gray-50" />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => window.open(`https://${integration.domain}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input value={integration.email} readOnly className="bg-gray-50 mt-1" />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Webhook URL</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={integration.webhook_url} readOnly className="bg-gray-50" />
                <Button variant="outline" size="icon" onClick={handleCopyWebhook}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use this webhook URL in your Zendesk settings to receive notifications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Zendesk Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="domain">Zendesk Domain</Label>
              <Input
                id="domain"
                placeholder="your-company.zendesk.com"
                value={updateForm.domain}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, domain: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={updateForm.email}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Enter your Zendesk API key"
                value={updateForm.api_key}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, api_key: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateIntegration}
              disabled={isUpdating || !updateForm.domain || !updateForm.email || !updateForm.api_key}
            >
              {isUpdating ? (
                <>
                  <LoadingSpinner size="sm" className="!mb-0 mr-2" />
                  Updating...
                </>
              ) : (
                "Update Integration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZendeskIntegration;
