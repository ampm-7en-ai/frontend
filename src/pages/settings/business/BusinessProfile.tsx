
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, Upload } from 'lucide-react';

const BusinessProfile = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Business Profile</h2>
        <Button>Save Changes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building size={20} />
            <span>Company Information</span>
          </CardTitle>
          <CardDescription>Update your company details and profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Your Company Name" defaultValue="7en.ai GmbH" />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="e.g. Technology, Healthcare" defaultValue="Artificial Intelligence" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Company Description</Label>
            <Textarea 
              id="description" 
              placeholder="Brief description of your company" 
              className="h-24"
              defaultValue="7en.ai is a European-compliant multi-agent AI platform enabling businesses to create, manage, and orchestrate collaborative AI agents for complex tasks while maintaining data sovereignty within Europe."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://example.com" defaultValue="https://7en.ai" />
            </div>
            <div>
              <Label htmlFor="founded">Founded Date</Label>
              <Input id="founded" type="date" defaultValue="2023-05-15" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            <span>Branding</span>
          </CardTitle>
          <CardDescription>Update your company logo and branding assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-lg bg-light-gray flex items-center justify-center">
                <Building size={48} className="text-medium-gray" />
              </div>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <Label htmlFor="brand-color">Brand Color</Label>
                <div className="flex gap-2">
                  <Input type="color" id="brand-color" defaultValue="#2563EB" className="w-16 h-10" />
                  <Input defaultValue="#2563EB" className="flex-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="tagline">Company Tagline</Label>
                <Input id="tagline" placeholder="Your company tagline" defaultValue="European-compliant multi-agent AI platform" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How customers can reach your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" placeholder="contact@example.com" defaultValue="contact@7en.ai" />
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone</Label>
              <Input id="contact-phone" placeholder="+49 123 456 7890" defaultValue="+49 123 456 7890" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-address">Address</Label>
              <Textarea id="contact-address" placeholder="Your company address" defaultValue="Musterstraße 123, 10115 Berlin, Germany" />
            </div>
            <div>
              <Label htmlFor="business-hours">Business Hours</Label>
              <Textarea id="business-hours" placeholder="e.g. Mon-Fri: 9am-5pm" defaultValue="Monday to Friday: 9:00 - 18:00 CET&#10;Saturday, Sunday: Closed" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessProfile;
