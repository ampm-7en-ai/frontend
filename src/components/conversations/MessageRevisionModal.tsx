
import React, { useState, useEffect } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFloatingToast } from '@/context/FloatingToastContext';
import ModernButton from '@/components/dashboard/ModernButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getApiUrl } from '@/utils/api-config';
import { apiPost, apiPut, apiGet } from '@/utils/api-interceptor';

interface MessageRevisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  answer: string;
  onRevise: (revisedAnswer: string) => void;
  previousUserMessageId?: string;
  agentMessageId?: string;
  sessionId?: string;
}

const MessageRevisionModal = ({
  open,
  onOpenChange,
  question,
  answer,
  onRevise,
  previousUserMessageId,
  agentMessageId,
  sessionId
}: MessageRevisionModalProps) => {
  const [revisedAnswer, setRevisedAnswer] = useState(answer);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingImproved, setIsCheckingImproved] = useState(false);
  const [improvedResponse, setImprovedResponse] = useState<string | null>(null);
  const [improvedResponseId, setImprovedResponseId] = useState<string | null>(null);
  const { showToast } = useFloatingToast();

  // Check if response is already improved when modal opens
  useEffect(() => {
    if (open && sessionId) {
      checkForImprovedResponse();
    }
  }, [open, sessionId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setRevisedAnswer(answer);
      setImprovedResponse(null);
      setImprovedResponseId(null);
    }
  }, [open, answer]);

  const checkForImprovedResponse = async () => {
    if (!sessionId) return;

    setIsCheckingImproved(true);
    try {
      // Check if there's an existing improved response for this session
      const response = await apiGet(getApiUrl(`improvedresponse/?session_id=${sessionId}`));
      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data && data.data.length > 0) {
        const improvedData = data.data[0];
        setImprovedResponse(improvedData.improved_response);
        setImprovedResponseId(improvedData.id);
        setRevisedAnswer(improvedData.improved_response);
      }
    } catch (error) {
      console.error('Error checking for improved response:', error);
    } finally {
      setIsCheckingImproved(false);
    }
  };

  const handleImprove = async () => {
    if (!revisedAnswer.trim()) {
      showToast({
        title: "Error",
        description: "Answer cannot be empty",
        variant: "error"
      });
      return;
    }

    if (!previousUserMessageId || !agentMessageId) {
      showToast({
        title: "Error", 
        description: "Missing message IDs for improvement",
        variant: "error"
      });
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
        showToast({
          title: "Success",
          description: "Response improved successfully",
          variant: "success"
        });
      } else {
        // Handle error cases - prioritize the "message" property from API response
        const errorMessage = data.message || data.error?.message || "Failed to improve response";
        
        if (data.error?.fields?.general?.[0]?.includes('duplicate key')) {
          showToast({
            title: "Error",
            description: "Already improved",
            variant: "error"
          });
        } else {
          showToast({
            title: "Error",
            description: errorMessage,
            variant: "error"
          });
        }
      }
    } catch (error) {
      console.error('Error improving response:', error);
      showToast({
        title: "Error",
        description: "Failed to improve response",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!revisedAnswer.trim()) {
      showToast({
        title: "Error",
        description: "Answer cannot be empty",
        variant: "error"
      });
      return;
    }

    if (!improvedResponseId) {
      showToast({
        title: "Error",
        description: "Missing improved response ID",
        variant: "error"
      });
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        improved_response: revisedAnswer
      };

      const response = await apiPut(getApiUrl(`improvedresponse/${improvedResponseId}/`), requestBody);
      const data = await response.json();

      if (response.ok) {
        onRevise(revisedAnswer);
        onOpenChange(false);
        showToast({
          title: "Success",
          description: "Response updated successfully",
          variant: "success"
        });
      } else {
        const errorMessage = data.message || data.error?.message || "Failed to update response";
        showToast({
          title: "Error",
          description: errorMessage,
          variant: "error"
        });
      }
    } catch (error) {
      console.error('Error updating response:', error);
      showToast({
        title: "Error",
        description: "Failed to update response",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setRevisedAnswer(answer); // Reset to original answer
    onOpenChange(false);
  };

  const isImproved = improvedResponse !== null;
  const buttonText = isImproved ? "Update" : "Improve";
  const buttonAction = isImproved ? handleUpdate : handleImprove;

  return (
    <ModernModal
      open={open}
      onOpenChange={onOpenChange}
      title="Revise Answer"
      description="Review and modify the AI response to improve its accuracy and helpfulness."
      size="2xl"
      footer={
        <div className="flex gap-3">
          <ModernButton variant="outline" onClick={handleCancel} disabled={isLoading || isCheckingImproved}>
            Cancel
          </ModernButton>
          <ModernButton 
            variant="primary" 
            onClick={buttonAction}
            disabled={isLoading || isCheckingImproved}
          >
            {isLoading ? (isImproved ? "Updating..." : "Improving...") : buttonText}
          </ModernButton>
        </div>
      }
    >
      {isCheckingImproved ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading response data..." />
        </div>
      ) : (
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
            
            {/* Show improved response if it exists */}
            {isImproved && (
              <div className="mb-3">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Current Improved Response:
                </div>
                <div className="p-3 rounded-lg bg-green-50/80 dark:bg-green-900/20 border border-green-200/60 dark:border-green-800/60">
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed whitespace-pre-wrap">
                    {improvedResponse}
                  </p>
                </div>
              </div>
            )}

            <Textarea
              id="revised-answer"
              value={revisedAnswer}
              onChange={(e) => setRevisedAnswer(e.target.value)}
              className="min-h-[200px] resize-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-200"
              placeholder="Enter the revised answer..."
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isImproved 
                ? "Update the improved AI response to make it even better for the customer."
                : "Edit the AI response to make it more accurate or helpful for the customer."
              }
            </p>
          </div>
        </div>
      )}
    </ModernModal>
  );
};

export default MessageRevisionModal;
