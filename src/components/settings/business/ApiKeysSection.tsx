
import React, { useState } from 'react';
import { Copy, AlertCircle, ChevronRight, RefreshCw, Plus, KeyRound, Eye, EyeOff, Key, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { usePricingModal } from '@/hooks/usePricingModal';
import { useApiKeys } from '@/hooks/useApiKeys';
import ModernButton from '@/components/dashboard/ModernButton';

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

  const formatApiKey = (key: string) => {
    if (!key) return '';
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
  };

  if (!isPaidPlan) {
    return (
      <section className="p-8">
        <div className="mb-8 pl-2">
          <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Your 7en.ai API Keys</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Manage your API key to access the 7en.ai API programmatically
          </p>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Upgrade your plan to enable API keys.
              </p>
            </div>
            <ModernButton variant="gradient" onClick={openPricingModal} icon={ChevronRight}>
              Upgrade Plan
            </ModernButton>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-8">
      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Your 7en.ai API Keys</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Manage your API key to access the 7en.ai API programmatically. Keep your API key secure - it has the same permissions as your account.
        </p>
      </div>

      <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Key className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">API Keys</h3>
          </div>
          {hasApiKey ? (
            <ModernButton 
              variant="outline"
              size="sm"
              onClick={handleRefreshKey}
              disabled={isLoading || isRefreshing}
              icon={RefreshCw}
              className={isRefreshing ? "animate-spin" : ""}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Key'}
            </ModernButton>
          ) : (
            <ModernButton 
              variant="primary"
              size="sm"
              onClick={handleCreateKey}
              disabled={isLoading}
              icon={Plus}
            >
              Create API Key
            </ModernButton>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
            <p>Failed to load API key information. Please try again.</p>
          </div>
        ) : hasApiKey ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Default API Key
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          7en_••••••••••••••••
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      Just now
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      Never
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey('sample-key-for-demo')}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRefreshKey}
                          disabled={isRefreshing}
                          className="h-8 w-8 p-0"
                        >
                          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-2">No API key found</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">Create your API key to get started</p>
          </div>
        )}

        <div className="border-t border-slate-200/50 dark:border-slate-600/50 pt-6 mt-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">API Documentation</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            View our API documentation to learn how to integrate 7en.ai with your applications.
          </p>
          <ModernButton variant="outline">
            View API Documentation
          </ModernButton>
        </div>
      </div>

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
