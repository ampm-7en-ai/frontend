import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Download, Save, Shield, Pen, Trash, FileJson, FileSpreadsheet } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import ModernButton from '@/components/dashboard/ModernButton';
import { Icon } from '@/components/icons';
import { getApiUrl, updateSettings } from '@/utils/api-config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConversations } from '@/hooks/useConversations';
import { API_BASE_URL, MEDIA_BASE_URL } from '@/config/env';

interface GdprSettingsSectionProps {
  initialSettings?: {
    data_retention_days: number | null;
    data_retention_message: string | null;
    gdpr_message_display: boolean | null;
  };
}

const GdprSettingsSection = ({ initialSettings }: GdprSettingsSectionProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [retentionDays, setRetentionDays] = useState<string>(
    initialSettings?.data_retention_days?.toString() || ''
  );
  const [retentionMessage, setRetentionMessage] = useState( initialSettings?.data_retention_message?.toString() || '');
  const [isMessageVisible, setIsMessageVisible] = useState(initialSettings?.gdpr_message_display || false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportData, setExportData] = useState<{ url: string; file_name: string; format: string } | null>(null);
  
  const { bulkDeleteConversations } = useConversations();

  const { 
    logs, 
    isLoading: isLoadingLogs, 
    activePeriod, 
    setPeriod,
    searchTerm,
    setSearchTerm,
    loadMore,
    hasMore,
    formatEventType,
    formatTimestamp
  } = useAuditLogs();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to save GDPR settings
      const payload = {
        gdpr_settings: {
          data_retention_days: +retentionDays,
          data_retention_message: retentionMessage,
          gdpr_message_display: isMessageVisible
        }
      };

      const res = await updateSettings(payload);
      
      
      
      toast({
        title: "Success",
        description: "GDPR settings updated successfully",
        variant: "success"
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update GDPR settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    setExportData(null);
    try {
      const user = localStorage.getItem('user');
      const accessToken = user ? JSON.parse(user).accessToken : null;
      
      const response = await fetch(getApiUrl(`chat/admin/conversations/export/?format=${format}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        setExportData(result.data);
        toast({
          title: "Export Ready",
          description: `Your ${format.toUpperCase()} export file is ready to download.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
      setExportData(null);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllConversations = async () => {
    if (!confirm('Are you sure you want to delete all conversations? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const user = localStorage.getItem('user');
      const accessToken = user ? JSON.parse(user).accessToken : null;
      
      const response = await fetch(getApiUrl('chat/admin/conversations/bulk-delete/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_ids: 'all' }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast({
        title: "Success",
        description: "All conversations have been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversations",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadExport = () => {
    if (exportData?.url) {
      window.open(MEDIA_BASE_URL+exportData.url, '_blank');
    }
  };

  return (
    <section className="p-8">
      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">GDPR Settings</h2>
        <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
          Manage data retention, privacy, and compliance settings
        </p>
      </div>

      <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
              <Icon type='plain' name='Layer' color='hsl(var(--primary))' className='h-5 w-5' />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Data & Privacy</h3>
          </div>
          <ModernButton
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            icon={isEditing ? undefined : Pen}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </ModernButton>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            {/* Data Retention Configuration */}
            <div className="space-y-2">
              <Label htmlFor="retention-days" className="text-neutral-900 dark:text-neutral-100">
                Data Retention Period (days)
              </Label>
              <Input
                id="retention-days"
                type="number"
                placeholder="e.g., 90"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                variant="modern"
                className="max-w-xs bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-600 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Number of days to retain user data. Leave empty for indefinite retention.
              </p>
            </div>

            {/* Data Retention Message */}
            <div className="space-y-2">
              <Label htmlFor="retention-message" className="text-neutral-900 dark:text-neutral-100">
                Data Retention Message
              </Label>
              <Textarea
                id="retention-message"
                placeholder="Enter a message to display to users about data retention..."
                value={retentionMessage}
                onChange={(e) => setRetentionMessage(e.target.value)}
                rows={4}
                className="bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-600 rounded-xl"
              />
            </div>

            {/* Message Visibility Toggle */}
            <div className="flex items-center justify-between p-4 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-neutral-700">
              <div className="space-y-0.5">
                <Label className="text-neutral-900 dark:text-neutral-100">Display Retention Message</Label>
                <p className="text-sm text-muted-foreground">
                  Show the data retention message to users
                </p>
              </div>
              <Switch
                checked={isMessageVisible}
                onCheckedChange={setIsMessageVisible}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <ModernButton onClick={handleSave} disabled={isSaving} variant="primary" icon={Save}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </ModernButton>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Read-only view */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-4 border border-neutral-200/50 dark:border-none">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Data Retention Period</h4>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  {retentionDays || initialSettings?.data_retention_days 
                    ? `${retentionDays || initialSettings?.data_retention_days} days`
                    : 'Indefinite'}
                </p>
              </div>
              <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-4 border border-neutral-200/50 dark:border-none">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Message Visibility</h4>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  {isMessageVisible ? 'Visible' : 'Hidden'}
                </p>
              </div>
            </div>

            {retentionMessage && (
              <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-4 border border-neutral-200/50 dark:border-none">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Retention Message</h4>
                <p className="text-sm text-muted-foreground">{retentionMessage}</p>
              </div>
            )}

            {/* Data Export */}
            
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between p-4 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-none">
                <div className="space-y-0.5">
                  <Label className="text-neutral-900 dark:text-neutral-100">Data Export</Label>
                  <p className="text-sm text-muted-foreground">
                  Export all your business data in compliance with GDPR regulations
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ModernButton 
                      disabled={isExporting} 
                      variant="outline"
                      icon={Download}
                    >
                      {isExporting ? 'Processing Export...' : 'Export Data'}
                    </ModernButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        handleExportData('json');
                      }}
                      className="cursor-pointer"
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        handleExportData('csv');
                      }}
                      className="cursor-pointer"
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-4">
 
                {exportData && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
                      ✓ Export file is ready to download
                    </p>
                    <div className="flex items-center gap-3">
                      <ModernButton
                        onClick={handleDownloadExport}
                        variant="primary"
                        icon={Download}
                        size="sm"
                      >
                        Download {exportData.file_name || 'Export File'}
                      </ModernButton>
                      <span className="text-xs text-muted-foreground">
                        Format: {exportData.format?.toUpperCase() || 'JSON'}
                      </span>
                    </div>
                  </div>
                )}

              </div>
              {/* delete data */}
              <div className="flex items-center justify-between p-4 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-none mt-4">
                <div className="space-y-0.5">
                  <Label className="text-red-900 dark:text-red-100">Delete All Conversations</Label>
                  <p className="text-sm text-muted-foreground">
                  Delete all of your conversation data
                  </p>
                </div>
                <ModernButton 
                    onClick={handleDeleteAllConversations} 
                    disabled={isDeleting} 
                    variant="outline"
                    icon={Trash}
                    className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-neutral-200 dark:hover:text-neutral-300 dark:hover:bg-red-900/20'
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </ModernButton>
                
              </div>
              {/* delete account */}
              <div className="flex items-center justify-between p-4 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-none mt-4">
                <div className="space-y-0.5">
                  <Label className="text-red-900 dark:text-red-100">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                  Delete your account
                  </p>
                </div>
                <ModernButton 
                    onClick={() => null} 
                    disabled={isDeleting} 
                    variant="outline"
                    icon={Trash}
                    className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-neutral-200 dark:hover:text-neutral-300 dark:hover:bg-red-900/20'
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </ModernButton>
                
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Section */}
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Activity Log</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Tracks who accessed, modified, or deleted data
          </p>

          {/* Period filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['today', 'week', 'month', '3months'] as const).map((period) => (
              <ModernButton
                key={period}
                variant={activePeriod === period ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPeriod(period)}
              >
                {period === 'today' ? 'Today' : 
                 period === 'week' ? 'This Week' : 
                 period === 'month' ? 'This Month' : 
                 'Last 3 Months'}
              </ModernButton>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search logs by user or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="modern"
              className="max-w-md bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-600 rounded-xl"
            />
          </div>

          {/* Logs display */}
          {isLoadingLogs ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading activity logs..." />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-neutral-50/50 dark:bg-neutral-800/50 rounded-xl">
              No activity logs found for this period
            </div>
          ) : (
            <>
              <ScrollArea className="h-[400px] border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white/50 dark:bg-neutral-900/50">
                <div className="p-4 space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-3 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800 transition-colors border border-neutral-200/50 dark:border-neutral-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {formatEventType(log.event_type)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {log.entity_type} #{log.entity_id}
                          </span>
                        </div>
                        {log.details?.name && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {log.details.name}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>User: {log.user}</span>
                          <span>•</span>
                          <span>{formatTimestamp(log.timestamp)}</span>
                          {log.ip_address && (
                            <>
                              <span>•</span>
                              <span>IP: {log.ip_address}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          log.status === 'success' 
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {hasMore && (
                <div className="mt-4 text-center">
                  <ModernButton variant="outline" onClick={loadMore}>
                    Load More
                  </ModernButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default GdprSettingsSection;
