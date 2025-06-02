
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/hooks/usePlatformSettings';

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
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              Failed to load platform settings. Please try again.
            </div>
          </CardContent>
        </Card>
      </PlatformSettingsLayout>
    );
  }

  return (
    <PlatformSettingsLayout 
      title="General Settings"
      description="Configure platform-wide settings and defaults"
    >
      <Card>
        <CardHeader>
          <CardTitle>Platform Information</CardTitle>
          <CardDescription>Update your platform name and details</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              <span className="ml-2 text-sm text-muted-foreground">Loading settings...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input 
                    id="platformName" 
                    value={formData.platform_name}
                    onChange={(e) => handleInputChange('platform_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Platform Description</Label>
                  <Textarea 
                    id="description" 
                    value={formData.platform_description}
                    onChange={(e) => handleInputChange('platform_description', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input 
                    id="supportEmail" 
                    type="email" 
                    value={formData.support_email}
                    onChange={(e) => handleInputChange('support_email', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="enableMaintenance" 
                    checked={formData.maintenance_mode}
                    onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                  />
                  <Label htmlFor="enableMaintenance">Maintenance Mode</Label>
                </div>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </PlatformSettingsLayout>
  );
};

export default GeneralSettings;
