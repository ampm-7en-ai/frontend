
import React, { useState } from 'react';
import { Copy, AlertCircle, ChevronRight, RefreshCw, Plus, KeyRound, Eye, EyeOff, Key, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { usePricingModal } from '@/hooks/usePricingModal';
import { useApiKeys } from '@/hooks/useApiKeys';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernModal } from '@/components/ui/modern-modal';
import { ModernInput } from '@/components/ui/modern-input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ApiKeysSection = () => {
  const { openPricingModal } = usePricingModal();
  const { toast } = useToast();
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKeyData, setApiKeyData] = useState<any>(null);
  
  // Simulate paid plan status - in real app this would come from user data
  const isPaidPlan = true; // Change to false to show the upgrade prompt
  
  const { hasApiKey, isLoading, createApiKey, refreshApiKey, error, checkApiKeyExists } = useApiKeys();

  const handleCreateKey = async () => {
    try {
      const newKey = await createApiKey();
      setCurrentApiKey(newKey);
      setApiKeyData({
        id: Date.now(),
        key: newKey,
        created_at: new Date().toISOString(),
        last_used_at: null,
        is_active: true
      });
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
      setApiKeyData(prev => ({
        ...prev,
        id: Date.now(),
        key: newKey,
        created_at: new Date().toISOString(),
        last_used_at: prev?.last_used_at || null,
        is_active: true
      }));
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseDialog = () => {
    setIsApiKeyDialogOpen(false);
    setCurrentApiKey(null);
    setShowApiKey(false);
    setCopied(false);
  };

  const formatApiKey = (key: string) => {
    if (!key) return '';
    return `7en_${key.substring(4, 12)}...${key.substring(key.length - 8)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {hasApiKey || apiKeyData ? (
            <ModernButton 
              variant="outline"
              size="sm"
              onClick={handleRefreshKey}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto py-12 flex justify-center items-center h-64">
              <LoadingSpinner size="lg" text="Generating..." />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
            <p>Failed to load API key information. Please try again.</p>
          </div>
        ) : (hasApiKey || apiKeyData) ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Default API Key
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          {apiKeyData ? formatApiKey(apiKeyData.key) : '7en_••••••••••••••••'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {apiKeyData ? formatDate(apiKeyData.created_at) : 'Just now'}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {apiKeyData?.last_used_at ? formatDate(apiKeyData.last_used_at) : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ModernButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(apiKeyData?.key || 'sample-key-for-demo')}
                          icon={Copy}
                          iconOnly
                        />
                        <ModernButton
                          variant="ghost"
                          size="sm"
                          onClick={handleRefreshKey}
                          disabled={isRefreshing}
                          icon={RefreshCw}
                          iconOnly
                          className={isRefreshing ? '[&_svg]:animate-spin' : ''}
                        />
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

      <ModernModal
        open={isApiKeyDialogOpen}
        onOpenChange={handleCloseDialog}
        title="API Key Generated"
        description="Your new API key has been generated successfully. Save it securely as it won't be shown again."
        size="lg"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Key className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">New API Key Created</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  This key provides full access to your 7en.ai account. Store it securely and never share it publicly.
                </p>
              </div>
            </div>
          </div>
          
          {currentApiKey && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Your API Key</label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={currentApiKey}
                  readOnly
                  className="font-mono text-sm pr-20 bg-muted/50"
                  variant="modern"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    icon={showApiKey ? EyeOff : Eye}
                    iconOnly
                  />
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyKey(currentApiKey)}
                    icon={copied ? Check : Copy}
                    iconOnly
                    className={copied ? 'text-green-500' : ''}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the eye icon to reveal the key, or the copy icon to copy it to your clipboard.
              </p>
            </div>
          )}

          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Security Best Practices</p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                  <li>• Store your API key in environment variables, not in your code</li>
                  <li>• Never commit API keys to version control systems</li>
                  <li>• Rotate your keys regularly for enhanced security</li>
                  <li>• Monitor usage in your dashboard to detect unauthorized access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <ModernButton
            variant="outline"
            onClick={handleCloseDialog}
            className="px-6"
          >
            I've Saved My Key
          </ModernButton>
        </div>
      </ModernModal>
    </section>
  );
};

export default ApiKeysSection;
