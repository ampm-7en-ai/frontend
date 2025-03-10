
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-heading-3">Security Settings</h2>
      <p className="text-dark-gray mb-6">Configure platform security settings to protect your data and users.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>Set requirements for user passwords across the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="min-length">Minimum Password Length</Label>
                <div className="text-sm text-muted-foreground">Current: 8 characters</div>
              </div>
              <Slider
                id="min-length"
                defaultValue={[8]}
                max={16}
                min={6}
                step={1}
                className="w-[180px]"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="require-uppercase" />
                <Label htmlFor="require-uppercase">Require uppercase letters</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="require-numbers" defaultChecked />
                <Label htmlFor="require-numbers">Require numbers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="require-symbols" />
                <Label htmlFor="require-symbols">Require special characters</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="prevent-common" defaultChecked />
                <Label htmlFor="prevent-common">Prevent common passwords</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-expiry">Password Expiry</Label>
              <Select defaultValue="90">
                <SelectTrigger id="password-expiry">
                  <SelectValue placeholder="Select expiry period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Configure 2FA requirements for user accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-2fa">Require 2FA for all users</Label>
              <p className="text-sm text-muted-foreground">
                Force all users to set up two-factor authentication
              </p>
            </div>
            <Switch id="require-2fa" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-admin-2fa">Require 2FA for admins</Label>
              <p className="text-sm text-muted-foreground">
                Force all admin users to set up two-factor authentication
              </p>
            </div>
            <Switch id="require-admin-2fa" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="2fa-methods">Allowed 2FA Methods</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="2fa-authenticator" defaultChecked />
                <Label htmlFor="2fa-authenticator">Authenticator app</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="2fa-sms" defaultChecked />
                <Label htmlFor="2fa-sms">SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="2fa-email" defaultChecked />
                <Label htmlFor="2fa-email">Email</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Configure user session behavior and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <Select defaultValue="60">
              <SelectTrigger id="session-timeout">
                <SelectValue placeholder="Select timeout period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="concurrent-sessions">Allow Concurrent Sessions</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to be logged in from multiple devices simultaneously
              </p>
            </div>
            <Switch id="concurrent-sessions" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="remember-me">Allow "Remember Me" Functionality</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to stay logged in across browser sessions
              </p>
            </div>
            <Switch id="remember-me" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>IP Restrictions</CardTitle>
          <CardDescription>Restrict access based on IP addresses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-ip-restriction">Enable IP Restrictions</Label>
              <p className="text-sm text-muted-foreground">
                Only allow access from specific IP addresses or ranges
              </p>
            </div>
            <Switch id="enable-ip-restriction" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
            <textarea 
              id="allowed-ips" 
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Enter IP addresses or CIDR ranges, one per line"
              disabled
            ></textarea>
            <p className="text-xs text-muted-foreground">
              Example: 192.168.1.1 or 10.0.0.0/24. One entry per line.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
