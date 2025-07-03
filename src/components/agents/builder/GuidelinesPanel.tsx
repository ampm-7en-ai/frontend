
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, X, FileText, Settings, Zap, Trash2 } from 'lucide-react';

export const GuidelinesPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
          Guidelines & Behavior
        </h2>
      </div>
      
      <div className="p-3">
        <Accordion type="multiple" defaultValue={["guidelines", "behavior", "advanced"]}>
          <AccordionItem value="guidelines">
            <AccordionTrigger className="text-sm font-medium">Guidelines</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-green-700 dark:text-green-400">Do's - What your agent should do</Label>
                {agentData.guidelines.dos.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newGuidelines = { ...agentData.guidelines };
                        newGuidelines.dos[index] = e.target.value;
                        updateAgentData({ guidelines: newGuidelines });
                      }}
                      placeholder="Enter a guideline..."
                      className="flex-1 h-6 text-xs border-green-200 focus:border-green-300"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newGuidelines = { ...agentData.guidelines };
                        newGuidelines.dos = newGuidelines.dos.filter((_, i) => i !== index);
                        updateAgentData({ guidelines: newGuidelines });
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newGuidelines = { ...agentData.guidelines };
                    newGuidelines.dos.push('');
                    updateAgentData({ guidelines: newGuidelines });
                  }}
                  className="h-6 text-xs text-green-600 hover:text-green-800"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Do
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-red-700 dark:text-red-400">Don'ts - What your agent should avoid</Label>
                {agentData.guidelines.donts.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newGuidelines = { ...agentData.guidelines };
                        newGuidelines.donts[index] = e.target.value;
                        updateAgentData({ guidelines: newGuidelines });
                      }}
                      placeholder="Enter what to avoid..."
                      className="flex-1 h-6 text-xs border-red-200 focus:border-red-300"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newGuidelines = { ...agentData.guidelines };
                        newGuidelines.donts = newGuidelines.donts.filter((_, i) => i !== index);
                        updateAgentData({ guidelines: newGuidelines });
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newGuidelines = { ...agentData.guidelines };
                    newGuidelines.donts.push('');
                    updateAgentData({ guidelines: newGuidelines });
                  }}
                  className="h-6 text-xs text-red-600 hover:text-red-800"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Don't
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="behavior">
            <AccordionTrigger className="text-sm font-medium">Behavior Settings</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Suggested Questions</Label>
                {agentData.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={suggestion}
                      onChange={(e) => {
                        const newSuggestions = [...agentData.suggestions];
                        newSuggestions[index] = e.target.value;
                        updateAgentData({ suggestions: newSuggestions });
                      }}
                      placeholder={`Suggestion ${index + 1}`}
                      className="flex-1 h-6 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newSuggestions = agentData.suggestions.filter((_, i) => i !== index);
                        updateAgentData({ suggestions: newSuggestions });
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {agentData.suggestions.length < 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (agentData.suggestions.length < 5) {
                        updateAgentData({ suggestions: [...agentData.suggestions, ''] });
                      }
                    }}
                    className="w-full h-6 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Suggestion
                  </Button>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Conversation Memory</Label>
                    <p className="text-xs text-muted-foreground">Remember conversation context</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Auto-Greet Visitors</Label>
                    <p className="text-xs text-muted-foreground">Show welcome message automatically</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="advanced">
            <AccordionTrigger className="text-sm font-medium">Advanced Settings</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Expert Handoff</Label>
                  <p className="text-xs text-muted-foreground">Escalate complex queries</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Multilingual Support</Label>
                  <p className="text-xs text-muted-foreground">Respond in user's language</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-red-600 dark:text-red-400">Danger Zone</Label>
                <Button variant="outline" size="sm" className="w-full h-7 text-xs text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Agent
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
