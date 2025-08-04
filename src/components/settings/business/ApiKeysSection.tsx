
import React, { useState } from 'react';
import { Copy, AlertCircle, ChevronRight, Plus, KeyRound, Eye, EyeOff, Key, Trash2, Check, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { usePricingModal } from '@/hooks/usePricingModal';
import { useApiKeys } from '@/hooks/useApiKeys';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernModal } from '@/components/ui/modern-modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CreateApiKeyModal } from './CreateApiKeyModal';
import { Link } from 'react-router-dom';

const ApiKeysSection = () => {
  const { openPricingModal } = usePricingModal();
  const { toast } = useToast();
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Simulate paid plan status - in real app this would come from user data
  const isPaidPlan = true; // Change to false to show the upgrade prompt
  
  const { apiKeys, isLoading, createApiKey, deleteApiKey, error } = useApiKeys();

  const handleCreateKey = async (name: string) => {
    try {
      const newKey = await createApiKey(name);
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

  const handleDeleteKey = async (keyId: number, keyName: string) => {
    try {
      await deleteApiKey(keyId);
      toast({
        title: "Success",
        description: `API key "${keyName || 'Unnamed'}" deleted successfully`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
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
          Manage your API keys to access the 7en.ai API programmatically. Keep your API keys secure - they have the same permissions as your account.
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
          <ModernButton 
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isLoading}
            icon={Plus}
          >
            Create new
          </ModernButton>
        </div>

        {isLoading ? (
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto py-12 flex justify-center items-center h-64">
              <LoadingSpinner size="lg" text="Loading API Keys..." />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
            <p>Failed to load API keys. Please try again.</p>
          </div>
        ) : apiKeys.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          {apiKey.name || 'Unnamed API Key'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            {apiKey.masked_key.slice(0,10)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDate(apiKey.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmOpen(true)}
                            disabled={isLoading}
                            icon={Trash2}
                            iconOnly
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          />
                        </div>
                      </TableCell>
                      {/* Delete Confirmation Modal */}
                    <ModernModal
                      open={deleteConfirmOpen}
                      onOpenChange={setDeleteConfirmOpen}
                      title="Delete API Key"
                      description={`Are you sure you want to delete "${apiKey.name}"? This action cannot be undone.`}
                      size="md"
                      type='alert'
                      footer={
                        <div className="flex gap-3">
                          <ModernButton variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                            Cancel
                          </ModernButton>
                          <ModernButton 
                            variant="gradient" 
                            onClick={() => handleDeleteKey(apiKey.id, apiKey.name)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </ModernButton>
                        </div>
                      }
                    >
                      <div className="py-4">
                        <p className="text-slate-600 dark:text-slate-400">
                          This will permanently remove the knowledge source from your agent.
                        </p>
                      </div>
                    </ModernModal>
                    </TableRow>
                    
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-2">No API keys found</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">Create your first API key to get started</p>
          </div>
        )}

        <div className="border-t border-slate-200/50 dark:border-slate-600/50 pt-6 mt-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">API Documentation</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            View our API documentation to learn how to integrate 7en.ai with your applications.
          </p>
          <ModernButton variant="outline">
            <a href='https://docs.7en.ai/api/' target='_blank' className='flex gap-2'>
            View API Documentation
            <ExternalLink className='w-4 h-4'/>
            </a>
          </ModernButton>
        </div>
      </div>

      {/* Create API Key Modal */}
      <CreateApiKeyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateKey={handleCreateKey}
        isLoading={isLoading}
      />

      {/* Show New API Key Modal */}
      <ModernModal
        open={isApiKeyDialogOpen}
        onOpenChange={handleCloseDialog}
        title="API Key Generated"
        description="Your new API key has been generated successfully. Save it securely as it won't be shown again."
        size="lg"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          
          
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
