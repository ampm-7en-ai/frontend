
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Bot } from 'lucide-react';

interface GeneralTabProps {
  agent: {
    name: string;
    description: string;
    status: string;
  };
  handleChange: (name: string, value: any) => void;
}

const GeneralTab = ({ agent, handleChange }: GeneralTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>Basic information about your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input 
              id="agent-name" 
              value={agent.name} 
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Customer Support Agent" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea 
              id="agent-description" 
              value={agent.description} 
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what this agent does" 
              className="min-h-[120px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent-status">Status</Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="agent-status" 
                checked={agent.status === 'active'} 
                onCheckedChange={(checked) => handleChange('status', checked ? 'active' : 'inactive')} 
              />
              <span className={agent.status === 'active' ? "text-green-600" : "text-gray-500"}>
                {agent.status === 'active' ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Inactive agents will not be accessible to your visitors
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralTab;
