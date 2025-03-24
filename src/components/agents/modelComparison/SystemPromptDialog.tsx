
import React from 'react';
import { Bot } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogBody
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SystemPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelIndex: number | null;
  modelName: string;
  systemPrompt: string;
  onUpdateSystemPrompt: (value: string) => void;
}

export const SystemPromptDialog = ({
  open,
  onOpenChange,
  modelIndex,
  modelName,
  systemPrompt,
  onUpdateSystemPrompt
}: SystemPromptDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fixedFooter className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit System Prompt</DialogTitle>
          <DialogDescription>
            Define the behavior and capabilities of your AI model
          </DialogDescription>
        </DialogHeader>
        
        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">{modelName}</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                  {systemPrompt.length} characters
                </span>
              </div>
            </div>
            
            <Textarea
              value={systemPrompt}
              onChange={(e) => onUpdateSystemPrompt(e.target.value)}
              placeholder="You are a helpful AI assistant. Your task is to..."
              className="min-h-[300px] font-mono text-sm p-4"
              expandable={true}
              maxExpandedHeight="400px"
            />
            
            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>Tips for effective system prompts:</strong>
              </p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Define the AI's role clearly (e.g., "You are a knowledgeable tour guide...")</li>
                <li>Specify desired tone and communication style</li>
                <li>Set boundaries for what the AI should or shouldn't do</li>
                <li>Include any specific domain knowledge the AI should leverage</li>
              </ul>
            </div>
          </div>
        </DialogBody>
        
        <DialogFooter fixed>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
