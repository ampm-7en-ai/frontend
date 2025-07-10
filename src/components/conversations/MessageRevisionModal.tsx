
import React, { useState } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User } from 'lucide-react';
import { toast } from 'sonner';

interface MessageRevisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  answer: string;
  onRevise: (revisedAnswer: string) => void;
}

const MessageRevisionModal = ({
  open,
  onOpenChange,
  question,
  answer,
  onRevise
}: MessageRevisionModalProps) => {
  const [revisedAnswer, setRevisedAnswer] = useState(answer);
  const [isLoading, setIsLoading] = useState(false);

  const handleRevise = async () => {
    if (!revisedAnswer.trim()) {
      toast.error("Please provide a revised answer");
      return;
    }

    if (revisedAnswer.trim() === answer.trim()) {
      toast.error("No changes detected in the answer");
      return;
    }

    setIsLoading(true);
    
    try {
      await onRevise(revisedAnswer.trim());
      toast.success("Message revised successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to revise message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setRevisedAnswer(answer);
    onOpenChange(false);
  };

  return (
    <ModernModal
      open={open}
      onOpenChange={onOpenChange}
      title="Revise Message"
      description="Review and edit the AI response to improve its quality"
      size="2xl"
      className="max-w-4xl"
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRevise}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Saving..." : "Save Revision"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Question Card */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-purple-600" />
            <Badge variant="secondary" className="text-xs">Question</Badge>
          </div>
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {question}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Answer Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-blue-600" />
            <Badge variant="secondary" className="text-xs">AI Response</Badge>
          </div>
          
          {/* Original Answer (read-only preview) */}
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
              Original Answer
            </label>
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <CardContent className="p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {answer}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Editable Answer */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Revised Answer
            </label>
            <Textarea
              value={revisedAnswer}
              onChange={(e) => setRevisedAnswer(e.target.value)}
              placeholder="Edit the AI response to make it more accurate or helpful..."
              className="min-h-[200px] resize-none border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Characters: {revisedAnswer.length}
            </p>
          </div>
        </div>
      </div>
    </ModernModal>
  );
};

export default MessageRevisionModal;
