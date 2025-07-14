import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const BusinessSettings = () => {
  const { settings, updateSettings, isLoading, error } = useSettings();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const payload = {
      business_name: formData.get('business_name') as string,
      business_address: formData.get('business_address') as string,
    };

    try {
      await updateSettings(payload);
      toast({
        title: "Settings updated",
        description: "Your business settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Settings</CardTitle>
        <CardDescription>
          Manage your business settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              defaultValue={settings?.business_name || ""}
              placeholder="Enter your business name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_address">Business Address</Label>
            <Input
              id="business_address"
              defaultValue={settings?.business_address || ""}
              placeholder="Enter your business address"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Settings"}
          </Button>
        </form>
        {error && (
          <div className="text-red-500">
            Error: {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessSettings;
