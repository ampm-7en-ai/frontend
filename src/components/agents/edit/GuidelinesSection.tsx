
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Guideline {
  dos: string;
  donts: string;
}

export interface GuidelineData {
  dos: string[];
  donts: string[];
}

interface GuidelinesSectionProps {
  guidelines: Guideline[];
  onChange: (guidelines: Guideline[]) => void;
  maxGuidelines?: number;
}

export const GuidelinesSection: React.FC<GuidelinesSectionProps> = ({ 
  guidelines = [], 
  onChange,
  maxGuidelines = 10 
}) => {
  const { toast } = useToast();

  const addGuideline = () => {
    if (guidelines.length >= maxGuidelines) {
      toast({
        title: "Maximum guidelines reached",
        description: `You can only add up to ${maxGuidelines} guidelines.`,
        variant: "destructive",
      });
      return;
    }
    
    onChange([...guidelines, { dos: '', donts: '' }]);
  };

  const removeGuideline = (index: number) => {
    const newGuidelines = [...guidelines];
    newGuidelines.splice(index, 1);
    onChange(newGuidelines);
  };

  const updateGuideline = (index: number, field: keyof Guideline, value: string) => {
    const newGuidelines = [...guidelines];
    newGuidelines[index] = { ...newGuidelines[index], [field]: value };
    onChange(newGuidelines);
  };

  // Function to convert guidelines array to the required JSON format
  export const guidelinesToJson = (guidelines: Guideline[]): GuidelineData => {
    return {
      dos: guidelines.map(g => g.dos).filter(text => text.trim() !== ''),
      donts: guidelines.map(g => g.donts).filter(text => text.trim() !== '')
    };
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
              <div className="flex items-center space-x-2">
                <Input
                  id={`dos-${index}`}
                  value={guideline.dos}
                  onChange={(e) => updateGuideline(index, 'dos', e.target.value)}
                  placeholder="Enter what the agent should do"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor={`donts-${index}`} className="text-sm font-medium">
                Don't
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  id={`donts-${index}`}
                  value={guideline.donts}
                  onChange={(e) => updateGuideline(index, 'donts', e.target.value)}
                  placeholder="Enter what the agent shouldn't do"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => removeGuideline(index)}
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
            onClick={addGuideline} 
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

export const formatGuidelinesForApi = (guidelines: Guideline[]): GuidelineData => {
  return {
    dos: guidelines.map(g => g.dos).filter(text => text.trim() !== ''),
    donts: guidelines.map(g => g.donts).filter(text => text.trim() !== '')
  };
};
