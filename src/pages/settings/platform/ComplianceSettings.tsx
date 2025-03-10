
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, Shield, FileCheck } from 'lucide-react';

const ComplianceSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-heading-3">Compliance Settings</h2>
      <p className="text-dark-gray mb-6">Configure compliance features to meet European regulatory requirements.</p>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>GDPR Compliance</span>
          </CardTitle>
          <CardDescription>Configure General Data Protection Regulation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-retention">Enable Data Retention Policies</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete data after a specified period
              </p>
            </div>
            <Switch id="data-retention" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="retention-period">Data Retention Period</Label>
            <Select defaultValue="90">
              <SelectTrigger id="retention-period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="user-data-requests">Enable User Data Request Processing</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to request their data or deletion under GDPR
              </p>
            </div>
            <Switch id="user-data-requests" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label>Privacy Policy</Label>
            <div className="flex gap-2">
              <Input 
                id="privacy-url" 
                placeholder="https://7en.ai/privacy-policy" 
                defaultValue="https://7en.ai/privacy-policy"
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <span>Data Sovereignty</span>
          </CardTitle>
          <CardDescription>Configure data storage and processing locations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data-region">Data Storage Region</Label>
            <Select defaultValue="eu-central">
              <SelectTrigger id="data-region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eu-central">EU Central (Frankfurt)</SelectItem>
                <SelectItem value="eu-west">EU West (Ireland)</SelectItem>
                <SelectItem value="eu-north">EU North (Stockholm)</SelectItem>
                <SelectItem value="eu-south">EU South (Milan)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              All data will be stored and processed within this region
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="eu-only-processing">EU-Only Data Processing</Label>
              <p className="text-sm text-muted-foreground">
                Restrict all data processing to European Union territory
              </p>
            </div>
            <Switch id="eu-only-processing" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-residency">Enforce Data Residency</Label>
              <p className="text-sm text-muted-foreground">
                Prevent any data from leaving the selected region
              </p>
            </div>
            <Switch id="data-residency" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Audit Logging</CardTitle>
          <CardDescription>Configure audit trails for compliance and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-audit">Enable Comprehensive Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all user actions for compliance and security purposes
              </p>
            </div>
            <Switch id="enable-audit" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label>Log Categories</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="log-auth" defaultChecked />
                <Label htmlFor="log-auth">Authentication events</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="log-data" defaultChecked />
                <Label htmlFor="log-data">Data access and modification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="log-admin" defaultChecked />
                <Label htmlFor="log-admin">Admin actions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="log-ai" defaultChecked />
                <Label htmlFor="log-ai">AI agent interactions</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="log-retention">Log Retention Period</Label>
            <Select defaultValue="365">
              <SelectTrigger id="log-retention">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
                <SelectItem value="1095">3 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" className="gap-1">
              <Download className="h-4 w-4" />
              Export Audit Logs
            </Button>
            <Button variant="outline">Configure External Logging</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Certifications & Compliance Reports</CardTitle>
          <CardDescription>View and download compliance documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium">GDPR Compliance Statement</p>
                <p className="text-sm text-muted-foreground">Last updated: April 18, 2024</p>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium">ISO 27001 Certificate</p>
                <p className="text-sm text-muted-foreground">Issued: January 10, 2024</p>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium">SOC 2 Type II Report</p>
                <p className="text-sm text-muted-foreground">Valid through: December 31, 2024</p>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default ComplianceSettings;
