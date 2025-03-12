import React, { useState } from 'react';
import BusinessSettingsNav from '@/components/settings/BusinessSettingsNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Upload, Globe, Mail, Phone } from 'lucide-react';

const BusinessProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '7en AI Solutions',
    description: 'Providing innovative AI solutions for modern businesses.',
    website: 'https://7en.ai',
    email: 'contact@7en.ai',
    phone: '+1 (555) 123-4567',
    industry: 'technology',
    size: '10-50',
    logo: '/placeholder.svg'
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save the data to the backend
    console.log('Saving business profile:', formData);
    // Show success message
  };

  return (
    <div className="flex">
      <BusinessSettingsNav />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Business Profile</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 items-start">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.logo} alt="Business Logo" />
                    <AvatarFallback className="text-xl">
                      <Building className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input 
                        id="businessName" 
                        value={formData.businessName}
                        onChange={(e) => handleChange('businessName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input 
                          id="website" 
                          className="rounded-l-none"
                          value={formData.website}
                          onChange={(e) => handleChange('website', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea 
                      id="description" 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      className="rounded-l-none"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Business Phone</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      id="phone" 
                      className="rounded-l-none"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={formData.industry}
                    onValueChange={(value) => handleChange('industry', value)}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Select 
                    value={formData.size}
                    onValueChange={(value) => handleChange('size', value)}
                  >
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-9">1-9 employees</SelectItem>
                      <SelectItem value="10-50">10-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501+">501+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" type="button">Reset</Button>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default BusinessProfile;
