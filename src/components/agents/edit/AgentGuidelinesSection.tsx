
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Guideline } from '@/hooks/useAgentGuidelines';

interface AgentGuidelinesSectionProps {
  guidelines: Guideline[];
  onAddGuideline: () => void;
  onRemoveGuideline: (index: number) => void;
  onUpdateGuideline: (index: number, field: keyof Guideline, value: string) => void;
  maxGuidelines?: number;
}

const AgentGuidelinesSection: React.FC<AgentGuidelinesSectionProps> = ({
  guidelines,
  onAddGuideline,
  onRemoveGuideline,
  onUpdateGuideline,
  maxGuidelines = 10
}) => {
  const { toast } = useToast();
  
  const handleAddGuideline = () => {
    if (guidelines.length >= maxGuidelines) {
      toast({
        title: "Maximum guidelines reached",
        description: `You can only add up to ${maxGuidelines} guidelines.`,
        variant: "destructive",
      });
      return;
    }
    
    onAddGuideline();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guidelines</CardTitle>
        <CardDescription>
          Define what the agent should (Dos) and shouldn't (Don'ts) do
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {guidelines.map((guideline, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
            <div className="space-y-2">
              <label htmlFor={`dos-${index}`} className="text-sm font-medium">
                Do
              </label>
              <Input
                id={`dos-${index}`}
                value={guideline.dos}
                onChange={(e) => onUpdateGuideline(index, 'dos', e.target.value)}
                placeholder="Enter what the agent should do"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor={`donts-${index}`} className="text-sm font-medium">
                Don't
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  id={`donts-${index}`}
                  value={guideline.donts}
                  onChange={(e) => onUpdateGuideline(index, 'donts', e.target.value)}
                  placeholder="Enter what the agent shouldn't do"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => onRemoveGuideline(index)}
                  className="flex-shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            onClick={handleAddGuideline} 
            disabled={guidelines.length >= maxGuidelines}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Guideline ({guidelines.length}/{maxGuidelines})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentGuidelinesSection;
