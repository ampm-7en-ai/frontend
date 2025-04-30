
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X, FilePlus, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Guideline {
  dos: string;
  donts: string;
}

interface GuidelinesSectionProps {
  initialGuidelines?: { dos: string[]; donts: string[] };
  onChange: (guidelines: { dos: string[]; donts: string[] }) => void;
}

// Function to format guidelines for API
function formatGuidelinesForApi(guidelines: Guideline[]): { dos: string[]; donts: string[] } {
  return {
    dos: guidelines.map(g => g.dos).filter(Boolean),
    donts: guidelines.map(g => g.donts).filter(Boolean)
  };
}

const GuidelinesSection = ({ initialGuidelines, onChange }: GuidelinesSectionProps) => {
  // Convert flat arrays to paired guidelines objects
  const getInitialGuidelines = (): Guideline[] => {
    if (!initialGuidelines) return [{ dos: '', donts: '' }];
    
    const { dos, donts } = initialGuidelines;
    const maxLength = Math.max(dos.length, donts.length);
    const guidelines: Guideline[] = [];
    
    for (let i = 0; i < maxLength; i++) {
      guidelines.push({
        dos: dos[i] || '',
        donts: donts[i] || ''
      });
    }
    
    return guidelines.length > 0 ? guidelines : [{ dos: '', donts: '' }];
  };

  const [guidelines, setGuidelines] = useState<Guideline[]>(getInitialGuidelines);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const handleAddGuideline = () => {
    if (guidelines.length >= 10) return;
    const newGuidelines = [...guidelines, { dos: '', donts: '' }];
    setGuidelines(newGuidelines);
    setExpandedIndex(newGuidelines.length - 1);
    onChange(formatGuidelinesForApi(newGuidelines));
  };

  const handleRemoveGuideline = (index: number) => {
    const newGuidelines = [...guidelines];
    newGuidelines.splice(index, 1);
    setGuidelines(newGuidelines);
    if (expandedIndex >= newGuidelines.length) {
      setExpandedIndex(Math.max(0, newGuidelines.length - 1));
    }
    onChange(formatGuidelinesForApi(newGuidelines));
  };

  const handleGuidelineChange = (index: number, field: 'dos' | 'donts', value: string) => {
    const newGuidelines = [...guidelines];
    newGuidelines[index][field] = value;
    setGuidelines(newGuidelines);
    onChange(formatGuidelinesForApi(newGuidelines));
  };

  const toggleGuideline = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FilePlus className="mr-2 h-5 w-5" />
          Guidelines
        </CardTitle>
        <CardDescription>
          Define what your agent should and shouldn't do
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {guidelines.map((guideline, index) => (
          <Collapsible
            key={index}
            open={expandedIndex === index}
            className="border rounded-md relative"
          >
            <div className="p-3 flex items-center justify-between">
              <CollapsibleTrigger 
                onClick={() => toggleGuideline(index)} 
                className="flex-1 text-left flex items-center"
              >
                <span className="font-medium">Guideline {index + 1}</span>
                <span className="ml-2 text-xs text-muted-foreground truncate">
                  {guideline.dos ? `Do: ${guideline.dos.substring(0, 30)}${guideline.dos.length > 30 ? '...' : ''}` : 'No dos defined'}
                </span>
                {expandedIndex === index ? 
                  <ChevronUp className="h-4 w-4 ml-auto" /> : 
                  <ChevronDown className="h-4 w-4 ml-auto" />
                }
              </CollapsibleTrigger>
              
              {guidelines.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveGuideline(index);
                  }}
                  className="h-6 w-6 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <CollapsibleContent className="p-3 pt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`dos-${index}`}>Do</Label>
                  <Input
                    id={`dos-${index}`}
                    value={guideline.dos}
                    onChange={(e) => handleGuidelineChange(index, 'dos', e.target.value)}
                    placeholder="Example: Provide accurate information about our products"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`donts-${index}`}>Don't</Label>
                  <Input
                    id={`donts-${index}`}
                    value={guideline.donts}
                    onChange={(e) => handleGuidelineChange(index, 'donts', e.target.value)}
                    placeholder="Example: Don't share sensitive customer information"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        {guidelines.length < 10 && (
          <Button 
            variant="outline" 
            onClick={handleAddGuideline} 
            className="w-full"
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Add New Guideline
          </Button>
        )}
        
        {guidelines.length >= 10 && (
          <p className="text-xs text-muted-foreground text-center">
            Maximum of 10 guidelines reached
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default GuidelinesSection;
