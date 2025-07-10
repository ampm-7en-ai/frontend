import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

const templateOptions = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
];

const CustomizationSettings = () => {
  const [template, setTemplate] = useState('modern');
  const [primaryColor, setPrimaryColor] = useState('#0070f3');
  const [secondaryColor, setSecondaryColor] = useState('#6c757d');
  const [borderRadius, setBorderRadius] = useState('0.5rem');
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [customCSS, setCustomCSS] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted with values:', {
      template,
      primaryColor,
      secondaryColor,
      borderRadius,
      fontFamily,
      customCSS,
      darkMode,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customization Settings</CardTitle>
        <CardDescription>
          Customize the look and feel of your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <ModernDropdown
              value={template}
              onValueChange={setTemplate}
              options={templateOptions}
              placeholder="Select a template"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input
                type="color"
                id="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <Input
                type="color"
                id="secondaryColor"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="borderRadius">Border Radius</Label>
            <Input
              type="text"
              id="borderRadius"
              value={borderRadius}
              onChange={(e) => setBorderRadius(e.target.value)}
              placeholder="e.g., 0.5rem"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Input
              type="text"
              id="fontFamily"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              placeholder="e.g., Arial, sans-serif"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customCSS">Custom CSS</Label>
            <Textarea
              id="customCSS"
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
              placeholder="Enter custom CSS rules"
              rows={4}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="darkMode" checked={darkMode} onCheckedChange={setDarkMode} />
            <Label htmlFor="darkMode">Dark Mode</Label>
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomizationSettings;
