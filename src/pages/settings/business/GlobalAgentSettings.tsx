
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

const GlobalAgentSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Global Agent Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Configure settings that apply to all agents in your business.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Agent Settings</CardTitle>
          <CardDescription>Configure settings that apply to all agents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature" className="mb-1">Default Temperature</Label>
                <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">0.7</span>
              </div>
              <Slider 
                id="temperature"
                defaultValue={[0.7]} 
                max={1} 
                step={0.1} 
                className="w-full" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Controls randomness: Lower values are more deterministic, higher values more creative.
              </p>
            </div>
            
            <div className="flex justify-between items-start pt-2">
              <div>
                <Label htmlFor="fallback" className="block mb-1">Enable Fallback Responses</Label>
                <p className="text-xs text-muted-foreground">
                  Allow agents to provide predefined responses when uncertain.
                </p>
              </div>
              <Switch id="fallback" defaultChecked />
            </div>
            
            <div className="flex justify-between items-start pt-2">
              <div>
                <Label htmlFor="logging" className="block mb-1">Conversation Logging</Label>
                <p className="text-xs text-muted-foreground">
                  Store all agent conversations for analysis and improvement.
                </p>
              </div>
              <Switch id="logging" defaultChecked />
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="default-model">Default LLM Model</Label>
              <Select defaultValue="gpt-4">
                <SelectTrigger id="default-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-2">Claude 2</SelectItem>
                  <SelectItem value="llama-70b">LLaMA 70B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" type="button">Reset to Defaults</Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
      
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Important Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <p className="text-sm">
            Changes to global agent settings will affect all deployed agents. Please test your changes before deploying to production.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalAgentSettings;
