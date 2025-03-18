import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { Separator } from '@/components/ui/separator';

interface AppearanceSectionProps {
  agent: any;
  onAgentChange: (name: string, value: any) => void;
}

const AppearanceSection: React.FC<AppearanceSectionProps> = ({ agent, onAgentChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Visual Settings</CardTitle>
          <CardDescription>Customize the look and feel of your chatbot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input 
                    id="primary-color-input" 
                    type="color" 
                    value={agent.primaryColor} 
                    onChange={(e) => onAgentChange('primaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input 
                    id="primary-color-value" 
                    value={agent.primaryColor} 
                    onChange={(e) => onAgentChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Text Color</Label>
                <div className="flex gap-2">
                  <Input 
                    id="secondary-color-input" 
                    type="color" 
                    value={agent.secondaryColor} 
                    onChange={(e) => onAgentChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input 
                    id="secondary-color-value" 
                    value={agent.secondaryColor} 
                    onChange={(e) => onAgentChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select 
                value={agent.fontFamily} 
                onValueChange={(value) => onAgentChange('fontFamily', value)}
              >
                <SelectTrigger id="font-family">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="chatbot-name">Chatbot Name</Label>
              <Input 
                id="chatbot-name" 
                value={agent.chatbotName} 
                onChange={(e) => onAgentChange('chatbotName', e.target.value)}
                placeholder="e.g. Customer Support"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="welcome-message">Welcome Message</Label>
              <Input 
                id="welcome-message" 
                value={agent.welcomeMessage} 
                onChange={(e) => onAgentChange('welcomeMessage', e.target.value)}
                placeholder="Hello! How can I help you today?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="button-text">Button Text</Label>
              <Input 
                id="button-text" 
                value={agent.buttonText} 
                onChange={(e) => onAgentChange('buttonText', e.target.value)}
                placeholder="Chat with us"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Position</Label>
              <RadioGroup 
                value={agent.position} 
                onValueChange={(value) => onAgentChange('position', value)}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bottom-right" id="position-right" />
                  <Label htmlFor="position-right">Bottom Right</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bottom-left" id="position-left" />
                  <Label htmlFor="position-left">Bottom Left</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your chatbot will appear on your website</CardDescription>
          </CardHeader>
          <CardContent>
            <ChatboxPreview 
              primaryColor={agent.primaryColor}
              secondaryColor={agent.secondaryColor}
              fontFamily={agent.fontFamily}
              chatbotName={agent.chatbotName}
              welcomeMessage={agent.welcomeMessage}
              buttonText={agent.buttonText}
              position={agent.position as 'bottom-right' | 'bottom-left'}
              className="mt-4"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppearanceSection;
