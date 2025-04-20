
import React, { useState, useEffect } from 'react';
import { Edit, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "@/hooks/use-toast";

interface GlobalAgentSettingsProps {
  initialSettings?: {
    defaultModel: string;
    maxContextLength: number;
    defaultTemperature: number;
  };
}

const GlobalAgentSettingsSection = ({ initialSettings }: GlobalAgentSettingsProps) => {
  const [isEditingGlobalSettings, setIsEditingGlobalSettings] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    defaultModel: initialSettings?.defaultModel || 'GPT-4',
    maxContextLength: initialSettings?.maxContextLength || 8000,
    defaultTemperature: initialSettings?.defaultTemperature || 0.7,
  });

  // Update state when props change
  useEffect(() => {
    if (initialSettings) {
      setGlobalSettings({
        defaultModel: initialSettings.defaultModel || 'GPT-4',
        maxContextLength: initialSettings.maxContextLength || 8000,
        defaultTemperature: initialSettings.defaultTemperature || 0.7,
      });
    }
  }, [initialSettings]);

  const saveGlobalSettings = () => {
    toast({
      title: "Global settings updated",
      description: "Your global agent settings have been updated successfully.",
    });
    setIsEditingGlobalSettings(false);
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
        <span>Global Agent Settings</span>
        {!isEditingGlobalSettings ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditingGlobalSettings(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" /> Edit
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditingGlobalSettings(false)}
            className="flex items-center gap-1"
          >
            Cancel
          </Button>
        )}
      </h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {isEditingGlobalSettings ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultModel">Default Response Model</Label>
                <Select 
                  value={globalSettings.defaultModel} 
                  onValueChange={(value) => setGlobalSettings({...globalSettings, defaultModel: value})}
                >
                  <SelectTrigger id="defaultModel">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPT-4">GPT-4</SelectItem>
                    <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
                    <SelectItem value="Claude">Claude</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxContext">Maximum Context Length</Label>
                <Select 
                  value={globalSettings.maxContextLength.toString()} 
                  onValueChange={(value) => setGlobalSettings({...globalSettings, maxContextLength: parseInt(value)})}
                >
                  <SelectTrigger id="maxContext">
                    <SelectValue placeholder="Select context length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4000">4,000 tokens</SelectItem>
                    <SelectItem value="8000">8,000 tokens</SelectItem>
                    <SelectItem value="16000">16,000 tokens</SelectItem>
                    <SelectItem value="32000">32,000 tokens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTemp">Default Temperature</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    id="defaultTemp" 
                    type="number" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={globalSettings.defaultTemperature} 
                    onChange={(e) => setGlobalSettings({...globalSettings, defaultTemperature: parseFloat(e.target.value)})}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    Lower values produce more deterministic responses, higher values produce more creative ones.
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={saveGlobalSettings} className="flex items-center gap-1">
                  <Save className="h-4 w-4" /> Save Settings
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="font-medium">Default Response Model</h3>
                <p className="text-muted-foreground">{globalSettings.defaultModel}</p>
              </div>
              <div>
                <h3 className="font-medium">Maximum Context Length</h3>
                <p className="text-muted-foreground">{globalSettings.maxContextLength.toLocaleString()} tokens</p>
              </div>
              <div>
                <h3 className="font-medium">Default Temperature</h3>
                <p className="text-muted-foreground">{globalSettings.defaultTemperature}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default GlobalAgentSettingsSection;
