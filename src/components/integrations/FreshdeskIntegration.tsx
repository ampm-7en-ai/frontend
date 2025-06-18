
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Copy, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';

interface FreshdeskIntegration {
  id: string;
  team: number;
  provider: string;
  domain: string;
  email: string | null;
  webhook_path: string;
  webhook_url: string;
  created_at: string;
  updated_at: string;
}

interface FreshdeskStatus {
  has_freshdesk_integrated: boolean;
  integration?: FreshdeskIntegration;
}

const FreshdeskIntegration = () => {
  const [status, setStatus] = useState<FreshdeskStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    domain: '',
    api_key: ''
  });
  const { toast } = useToast();

  const checkFreshdeskStatus = async () => {
    try {
      const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASE_URL}ticketing/freshdesk-integrations/`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to check Freshdesk integration status');
      }

      const data = await response.json();
      setStatus(data.data);
    } catch (error) {
      console.error('Error checking Freshdesk status:', error);
      toast({
        title: "Error",
        description: "Failed to check Freshdesk integration status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateIntegration = async () => {
    if (!status?.integration?.id) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASE_URL}ticketing/freshdesk-integrations/${status.integration.id}/`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update Freshdesk integration');
      }

      const data = await response.json();
      setStatus({
        has_freshdesk_integrated: true,
        integration: data.data
      });

      toast({
        title: "Success",
        description: "Freshdesk integration updated successfully",
      });

      setIsDialogOpen(false);
      setFormData({ domain: '', api_key: '' });
    } catch (error) {
      console.error('Error updating Freshdesk integration:', error);
      toast({
        title: "Error",
        description: "Failed to update Freshdesk integration",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  useEffect(() => {
    checkFreshdeskStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Checking Freshdesk integration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {status?.has_freshdesk_integrated ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Freshdesk Connected</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                Active
                </Badge>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Freshdesk Integration</DialogTitle>
                    <DialogDescription>
                      Update your Freshdesk integration settings
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="domain">Domain</Label>
                      <Input
                        id="domain"
                        placeholder="your-domain.freshdesk.com"
                        value={formData.domain}
                        onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="api_key">API Key</Label>
                      <Textarea
                        id="api_key"
                        placeholder="Enter your Freshdesk API key"
                        value={formData.api_key}
                        onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={updateIntegration} 
                      disabled={isUpdating || !formData.domain || !formData.api_key}
                      className="w-full"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Integration'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Domain</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={status.integration?.domain || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(status.integration?.domain || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={status.integration?.webhook_url || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(status.integration?.webhook_url || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  Not Connected
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">
                Connect your Freshdesk account to automate ticket management and customer support.
              </p>
              <Button
                onClick={() => {
                  window.open('https://docs.7en.ai/integrations/freshdesk', '_blank');
                }}
                variant="outline"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Setup Instructions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FreshdeskIntegration;
