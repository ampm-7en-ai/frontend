
import React, { useState, useEffect } from 'react';
import { ModernInput } from '@/components/ui/modern-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/hooks/usePlatformSettings';
import ModernButton from '@/components/dashboard/ModernButton';

const GeneralSettings = () => {
  const { data: settings, isLoading, error } = usePlatformSettings();
  const updateMutation = useUpdatePlatformSettings();
  
  const [formData, setFormData] = useState({
    platform_name: '',
    platform_description: '',
    support_email: '',
    maintenance_mode: false
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        platform_name: settings.platform_name || '',
        platform_description: settings.platform_description || '',
        support_email: settings.support_email || '',
        maintenance_mode: settings.maintenance_mode || false
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (error) {
    return (
      <PlatformSettingsLayout 
        title="General Settings"
        description="Configure platform-wide settings and defaults"
      >
        <div className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
          <div className="text-center text-red-600 py-8">
            Failed to load platform settings. Please try again.
          </div>
        </div>
      </PlatformSettingsLayout>
    );
  }

  return (
    <PlatformSettingsLayout 
      title="General Settings"
      description="Configure platform-wide settings and defaults"
    >
      <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
              <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Platform Information</h2>
            </div>
          </div>
        </div>
        <div className="dark:text-gray-200 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-none p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
              <span className="ml-3 text-muted-foreground">Loading settings...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <Label htmlFor="platformName" className="text-sm font-medium">Platform Name</Label>
                  <ModernInput 
                    id="platformName" 
                    value={formData.platform_name}
                    variant="modern"
                    onChange={(e) => handleInputChange('platform_name', e.target.value)}
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium">Platform Description</Label>
                  <Textarea 
                    id="description" 
                    value={formData.platform_description}
                    onChange={(e) => handleInputChange('platform_description', e.target.value)}
                    className="min-h-[100px] bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-600 rounded-xl resize-none"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="supportEmail" className="text-sm font-medium">Support Email</Label>
                  <ModernInput 
                    id="supportEmail" 
                    type="email" 
                    value={formData.support_email}
                    variant="modern"
                    onChange={(e) => handleInputChange('support_email', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-8 border-0">
                <div className="flex items-center space-x-3">
                  <Switch 
                    id="enableMaintenance" 
                    checked={formData.maintenance_mode}
                    onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                  />
                  <Label htmlFor="enableMaintenance" className="text-sm font-medium">Maintenance Mode</Label>
                </div>
                <ModernButton 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  variant="primary"
                  className="px-8 py-3"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </ModernButton>
              </div>
            </form>
          )}
        </div>
      </section>
    </PlatformSettingsLayout>
  );
};

export default GeneralSettings;
