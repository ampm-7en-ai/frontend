
import React, { useState } from 'react';
import { Copy, AlertCircle, ChevronRight, RefreshCw, Plus, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePricingModal } from '@/hooks/usePricingModal';
import { useApiKeys } from '@/hooks/useApiKeys';

const ApiKeysSection = () => {
  const { openPricingModal } = usePricingModal();
  const { toast } = useToast();
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Simulate paid plan status - in real app this would come from user data
  const isPaidPlan = true; // Change to false to show the upgrade prompt
  
  const { hasApiKey, isLoading, createApiKey, refreshApiKey, error } = useApiKeys();

  const handleCreateKey = async () => {
    try {
      const newKey = await createApiKey();
      setCurrentApiKey(newKey);
      setIsApiKeyDialogOpen(true);
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    }
  };

  const handleRefreshKey = async () => {
    setIsRefreshing(true);
    try {
      const newKey = await refreshApiKey();
      setCurrentApiKey(newKey);
      setIsApiKeyDialogOpen(true);
      toast({
        title: "Success",
        description: "API key refreshed successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh API key",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleCloseDialog = () => {
    setIsApiKeyDialogOpen(false);
    setCurrentApiKey(null);
    setShowApiKey(false);
  };

  if (!isPaidPlan) {
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
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
        <span>Your 7en.ai API Keys</span>
        {hasApiKey ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshKey}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh Key
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateKey}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Create API Key
          </Button>
        )}
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Keys</CardTitle>
          <CardDescription>
            Manage your API key to access the 7en.ai API programmatically. Keep your API key secure - it has the same permissions as your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p>Failed to load API key information. Please try again.</p>
            </div>
          ) : hasApiKey ? (
            <div className="text-center py-8">
              <KeyRound className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium text-green-800">API Key Active</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your API key is ready to use. Click "Refresh Key" to generate a new one.
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No API key found</p>
              <p className="text-sm mt-2">Create your API key to get started</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">API Documentation</h3>
            <p className="text-sm text-muted-foreground">
              View our API documentation to learn how to integrate 7en.ai with your applications.
            </p>
            <Button variant="outline" className="mt-2">
              View API Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isApiKeyDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your API Key</DialogTitle>
            <DialogDescription>
              Copy your API key and store it securely. This key will not be shown again after you close this dialog.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md">
              <p className="text-sm font-medium">Important Security Notice</p>
              <p className="text-xs mt-1">
                This API key will not be stored or displayed again. Please copy and save it in a secure location immediately.
              </p>
            </div>
            
            {currentApiKey && (
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={currentApiKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyKey(currentApiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseDialog}>
              I've Saved My API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ApiKeysSection;
