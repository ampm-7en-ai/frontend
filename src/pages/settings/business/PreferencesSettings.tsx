
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sliders, Bell, Languages, Moon, Clock } from 'lucide-react';

const PreferencesSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Preferences</h2>
        <Button>Save Changes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages size={20} />
            <span>Language &amp; Region</span>
          </CardTitle>
          <CardDescription>Set your preferred language and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select defaultValue="europe-berlin">
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europe-berlin">Europe/Berlin (UTC+01:00)</SelectItem>
                  <SelectItem value="europe-london">Europe/London (UTC+00:00)</SelectItem>
                  <SelectItem value="europe-paris">Europe/Paris (UTC+01:00)</SelectItem>
                  <SelectItem value="america-new_york">America/New_York (UTC-05:00)</SelectItem>
                  <SelectItem value="asia-tokyo">Asia/Tokyo (UTC+09:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="date-format">Date Format</Label>
              <Select defaultValue="dd-mm-yyyy">
                <SelectTrigger id="date-format">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="eur">
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eur">Euro (€)</SelectItem>
                  <SelectItem value="usd">US Dollar ($)</SelectItem>
                  <SelectItem value="gbp">British Pound (£)</SelectItem>
                  <SelectItem value="chf">Swiss Franc (CHF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>Configure how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="email-notifications" className="block">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="agent-alerts" className="block">Agent Performance Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when agent performance falls below threshold</p>
              </div>
              <Switch id="agent-alerts" defaultChecked />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="weekly-digest" className="block">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Receive a weekly summary of performance and activities</p>
              </div>
              <Switch id="weekly-digest" defaultChecked />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="browser-notifications" className="block">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">Show desktop notifications when in the application</p>
              </div>
              <Switch id="browser-notifications" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon size={20} />
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>Customize the look and feel of your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme</Label>
            <RadioGroup defaultValue="light" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">System</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label>Density</Label>
            <RadioGroup defaultValue="comfortable" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comfortable" id="comfortable" />
                <Label htmlFor="comfortable">Comfortable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compact" id="compact" />
                <Label htmlFor="compact">Compact</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <Label htmlFor="animations" className="block">Interface Animations</Label>
              <p className="text-sm text-muted-foreground">Enable animations in the user interface</p>
            </div>
            <Switch id="animations" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            <span>Session Settings</span>
          </CardTitle>
          <CardDescription>Configure your session preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <Select defaultValue="30">
              <SelectTrigger id="session-timeout">
                <SelectValue placeholder="Select timeout duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">You will be automatically logged out after this period of inactivity</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <Label htmlFor="remember-session" className="block">Remember Session</Label>
              <p className="text-sm text-muted-foreground">Stay logged in between browser sessions</p>
            </div>
            <Switch id="remember-session" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesSettings;
