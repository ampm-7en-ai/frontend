import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ModernButton from '@/components/dashboard/ModernButton';
import { Expand } from 'lucide-react';

interface SystemPromptModalProps {
  value: string;
  onChange: (value: string) => void;
  trigger: React.ReactNode;
}

export const SystemPromptModal = ({ value, onChange, trigger }: SystemPromptModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit System Prompt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              System Prompt
            </Label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Define how your agent behaves and responds to users. This is the core instruction that guides all interactions.
            </p>
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="You are a helpful AI assistant. Always be polite, professional, and provide accurate information..."
              className="min-h-[400px] resize-none"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};