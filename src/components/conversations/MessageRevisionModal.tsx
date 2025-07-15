
import React, { useState } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ModernButton from '@/components/dashboard/ModernButton';
import { getApiUrl } from '@/utils/api-config';
import { apiPost } from '@/utils/api-interceptor';

interface MessageRevisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  answer: string;
  onRevise: (revisedAnswer: string) => void;
  previousUserMessageId?: string;
  agentMessageId?: string;
}

const MessageRevisionModal = ({
  open,
  onOpenChange,
  question,
  answer,
  onRevise,
  previousUserMessageId,
  agentMessageId
}: MessageRevisionModalProps) => {
  const [revisedAnswer, setRevisedAnswer] = useState(answer);
  const [isLoading, setIsLoading] = useState(false);

  const handleImprove = async () => {
    if (!revisedAnswer.trim()) {
      toast.error("Answer cannot be empty");
      return;
    }

    if (!previousUserMessageId || !agentMessageId) {
      toast.error("Missing message IDs for improvement");
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        previous_user_message_id: previousUserMessageId,
        agent_message_id: agentMessageId,
        improved_agent_message: revisedAnswer
      };

      const response = await apiPost(getApiUrl('improvedresponse/'), requestBody);
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        onRevise(revisedAnswer);
        onOpenChange(false);
        toast.success("Response improved successfully");
      } else {
        // Handle error cases - prioritize the "message" property from API response
        const errorMessage = data.message || data.error?.message || "Failed to improve response";
        
        if (data.error?.fields?.general?.[0]?.includes('duplicate key')) {
          toast.error("Already improved");
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error improving response:', error);
      toast.error("Failed to improve response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setRevisedAnswer(answer); // Reset to original answer
    onOpenChange(false);
  };

  return (
    <ModernModal
      open={open}
      onOpenChange={onOpenChange}
      title="Revise Answer"
      description="Review and modify the AI response to improve its accuracy and helpfulness."
      size="2xl"
      footer={
        <div className="flex gap-3">
          <ModernButton variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </ModernButton>
          <ModernButton 
            variant="primary" 
            onClick={handleImprove}
            disabled={isLoading}
          >
            {isLoading ? "Improving..." : "Improve"}
          </ModernButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Question Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Customer Question
          </label>
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
              {question}
            </p>
          </div>
        </div>

        {/* Answer Section */}
        <div className="space-y-3">
          <label htmlFor="revised-answer" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            AI Answer
          </label>
          <Textarea
            id="revised-answer"
            value={revisedAnswer}
            onChange={(e) => setRevisedAnswer(e.target.value)}
            className="min-h-[200px] resize-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-200"
            placeholder="Enter the revised answer..."
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Edit the AI response to make it more accurate or helpful for the customer.
          </p>
        </div>
      </div>
    </ModernModal>
  );
};

export default MessageRevisionModal;
