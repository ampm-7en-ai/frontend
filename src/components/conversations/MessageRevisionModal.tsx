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
  const [improvedResponseData, setImprovedResponseData] = useState<any>(null);
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
      setImprovedResponseData(null);
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
        setImprovedResponseData(improvedData);
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

    if (!improvedResponseId || !improvedResponseData) {
      showToast({
        title: "Error",
        description: "Missing improved response data",
        variant: "error"
      });
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        agent: improvedResponseData.agent,
        user_message_id: improvedResponseData.user_message_id,
        agent_message_id: improvedResponseData.agent_message_id,
        user_message: improvedResponseData.user_message,
        agent_message: improvedResponseData.agent_message,
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
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Customer Question
            </label>
            <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60">
              <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {question}
              </p>
            </div>
          </div>

          {/* Answer Section */}
          <div className="space-y-3">
            <label htmlFor="revised-answer" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              AI Answer
            </label>

            <Textarea
              id="revised-answer"
              value={revisedAnswer}
              onChange={(e) => setRevisedAnswer(e.target.value)}
              className="min-h-[200px] resize-none bg-white/80 backdrop-blur-sm border-neutral-200/60 dark:border-neutral-700/60 rounded-xl transition-all duration-200"
              placeholder="Enter the revised answer..."
              disabled={isLoading}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
