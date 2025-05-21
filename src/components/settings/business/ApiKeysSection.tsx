
import React, { useState } from 'react';
import { Copy, AlertCircle, ChevronRight, Plus, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePricingModal } from '@/hooks/usePricingModal';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useApiKeys } from '@/hooks/useApiKeys';

const ApiKeysSection = () => {
  const { openPricingModal } = usePricingModal();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  
  // Simulate paid plan status - in real app this would come from user data
  const isPaidPlan = true; // Change to false to show the upgrade prompt
  
  const { apiKeys, isLoading, createApiKey, deleteApiKey, error } = useApiKeys();

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "API key name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      const newKey = await createApiKey(newKeyName);
      setNewlyCreatedKey(newKey);
      setIsCreateDialogOpen(false);
      setNewKeyName('');
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

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await deleteApiKey(keyId);
      toast({
        title: "Deleted",
        description: "API key deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4 mr-1" /> Create API Key
        </Button>
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Keys</CardTitle>
          <CardDescription>
            Manage your API keys to access the 7en.ai API programmatically. Keep your API keys secure - they have the same permissions as your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p>Failed to load API keys. Please try again.</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No API keys found</p>
              <p className="text-sm mt-2">Create your first API key to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {newlyCreatedKey && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Your new API key</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopyKey(newlyCreatedKey)}
                      className="h-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-white p-2 rounded border border-green-200 flex items-center">
                    <code className="text-xs flex-1 overflow-x-auto whitespace-nowrap">
                      {showNewKey ? newlyCreatedKey : '•'.repeat(newlyCreatedKey.length)}
                    </code>
                    <Button
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowNewKey(!showNewKey)}
                      className="ml-2"
                    >
                      {showNewKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs mt-2">
                    Make sure to copy your API key now. You won't be able to see it again!
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-2 text-xs h-7"
                    onClick={() => setNewlyCreatedKey(null)}
                  >
                    I've saved my API key
                  </Button>
                </div>
              )}
              
              <div className="rounded-md border">
                <div className="flex flex-col">
                  <div className="grid grid-cols-12 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-5">Created</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  {apiKeys.map((key) => (
                    <div key={key.id} className="grid grid-cols-12 px-4 py-3 items-center border-t">
                      <div className="col-span-5 font-medium flex items-center gap-2">
                        {key.name}
                        {key.default && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <div className="col-span-5 text-muted-foreground text-sm">
                        {formatDate(key.created_at)}
                      </div>
                      <div className="col-span-2 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteKey(key.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key to access the 7en.ai API. Each key should have a unique name to help you identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">API Key Name</Label>
              <Input 
                id="key-name" 
                placeholder="Production App" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Choose a name that will help you remember where this key is used.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="default-key">Set as default</Label>
                <Switch id="default-key" />
              </div>
              <p className="text-xs text-muted-foreground">
                Default keys are used when no API key is specified in requests.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey}>
              Create API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ApiKeysSection;
