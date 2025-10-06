import React, { useState } from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Download, Save, Shield } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GdprSettingsSectionProps {
  initialSettings?: {
    data_retention_days: number | null;
  };
}

const GdprSettingsSection = ({ initialSettings }: GdprSettingsSectionProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [retentionDays, setRetentionDays] = useState<string>(
    initialSettings?.data_retention_days?.toString() || ''
  );
  const [retentionMessage, setRetentionMessage] = useState('');
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "GDPR settings updated successfully",
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

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // TODO: API call to export user data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Export Started",
        description: "Your data export has been initiated. You'll receive an email when it's ready.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ModernCard>
      <ModernCardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">GDPR Settings</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage data retention, privacy, and compliance settings
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            {/* Data Retention Configuration */}
            <div className="space-y-2">
              <Label htmlFor="retention-days">Data Retention Period (days)</Label>
              <Input
                id="retention-days"
                type="number"
                placeholder="e.g., 90"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Number of days to retain user data. Leave empty for indefinite retention.
              </p>
            </div>

            {/* Data Retention Message */}
            <div className="space-y-2">
              <Label htmlFor="retention-message">Data Retention Message</Label>
              <Textarea
                id="retention-message"
                placeholder="Enter a message to display to users about data retention..."
                value={retentionMessage}
                onChange={(e) => setRetentionMessage(e.target.value)}
                rows={4}
              />
            </div>

            {/* Message Visibility Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Display Retention Message</Label>
                <p className="text-sm text-muted-foreground">
                  Show the data retention message to users
                </p>
              </div>
              <Switch
                checked={isMessageVisible}
                onCheckedChange={setIsMessageVisible}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Read-only view */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Retention Period</p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {retentionDays || initialSettings?.data_retention_days 
                    ? `${retentionDays || initialSettings?.data_retention_days} days`
                    : 'Indefinite'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message Visibility</p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {isMessageVisible ? 'Visible' : 'Hidden'}
                </p>
              </div>
            </div>

            {retentionMessage && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Retention Message</p>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground">{retentionMessage}</p>
                </div>
              </div>
            )}

            {/* Data Export */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold text-foreground mb-2">Data Export</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Export all your business data in compliance with GDPR regulations
              </p>
              <Button onClick={handleExportData} disabled={isExporting} variant="outline">
                {isExporting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Audit Logs Section */}
        <div className="mt-8 pt-8 border-t">
          <h4 className="text-lg font-semibold text-foreground mb-4">Activity Log</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Tracks who accessed, modified, or deleted data
          </p>

          {/* Period filters */}
          <div className="flex gap-2 mb-4">
            {(['today', 'week', 'month', '3months'] as const).map((period) => (
              <Button
                key={period}
                variant={activePeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(period)}
              >
                {period === 'today' ? 'Today' : 
                 period === 'week' ? 'This Week' : 
                 period === 'month' ? 'This Month' : 
                 'Last 3 Months'}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search logs by user or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Logs display */}
          {isLoadingLogs ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading activity logs..." />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found for this period
            </div>
          ) : (
            <>
              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="p-4 space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
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
                  <Button variant="outline" onClick={loadMore}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};

export default GdprSettingsSection;
