
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';

const GeneralSettings = () => {
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
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input id="platformName" defaultValue="7en AI Platform" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Platform Description</Label>
              <Textarea id="description" defaultValue="AI Platform for business intelligence and automation" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input id="supportEmail" type="email" defaultValue="support@example.com" />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <Switch id="enableMaintenance" />
              <Label htmlFor="enableMaintenance">Maintenance Mode</Label>
            </div>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>Configure default settings for new businesses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultQuota">Default API Quota</Label>
              <Input id="defaultQuota" type="number" defaultValue="1000" />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="enableAnalytics" defaultChecked />
              <Label htmlFor="enableAnalytics">Enable Analytics by Default</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="autoCreateDemoAgent" defaultChecked />
              <Label htmlFor="autoCreateDemoAgent">Create Demo Agent for New Businesses</Label>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button>Save Defaults</Button>
          </div>
        </CardContent>
      </Card>
    </PlatformSettingsLayout>
  );
};

export default GeneralSettings;
