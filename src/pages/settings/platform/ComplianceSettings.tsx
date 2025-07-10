import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

const complianceRegionOptions = [
  { value: 'gdpr', label: 'GDPR (EU)' },
  { value: 'ccpa', label: 'CCPA (California)' },
  { value: 'pipeda', label: 'PIPEDA (Canada)' },
];

const ComplianceSettings = () => {
  const [region, setRegion] = useState('gdpr');
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [enableCookies, setEnableCookies] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Submitting compliance settings:', {
      region,
      terms,
      privacy,
      enableCookies,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Settings</CardTitle>
        <CardDescription>
          Configure compliance settings for your platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="region">Compliance Region</Label>
            <ModernDropdown
              value={region}
              onValueChange={setRegion}
              options={complianceRegionOptions}
              placeholder="Select compliance region"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="terms">Terms of Service</Label>
            <Textarea
              id="terms"
              placeholder="Enter terms of service..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy Policy</Label>
            <Textarea
              id="privacy"
              placeholder="Enter privacy policy..."
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="cookies"
              checked={enableCookies}
              onCheckedChange={setEnableCookies}
            />
            <Label htmlFor="cookies">Enable Cookies</Label>
          </div>
          <Button type="submit">Save Settings</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComplianceSettings;
