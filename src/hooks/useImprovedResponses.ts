
import { useState, useEffect } from 'react';
import { apiGet } from '@/utils/api-interceptor';
import { getApiUrl } from '@/utils/api-config';

interface ImprovedResponse {
  id: number;
  agent: number;
  user_message_id: string;
  agent_message_id: string;
  user_message: string;
  agent_message: string;
  improved_response: string;
  created_at: string;
  updated_at: string;
}

interface UseImprovedResponsesReturn {
  improvedResponses: ImprovedResponse[];
  isLoading: boolean;
  error: string | null;
  isMessageImproved: (messageId: string) => boolean;
  getImprovedResponse: (messageId: string) => ImprovedResponse | undefined;
}

export const useImprovedResponses = (sessionId: string | null): UseImprovedResponsesReturn => {
  const [improvedResponses, setImprovedResponses] = useState<ImprovedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setImprovedResponses([]);
      return;
    }

    const fetchImprovedResponses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiGet(getApiUrl(`improvedresponse/?session_id=${sessionId}`));
        const data = await response.json();

        if (response.ok && data.status === 'success') {
          setImprovedResponses(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch improved responses');
        }
      } catch (error) {
        console.error('Error fetching improved responses:', error);
        setError('Failed to fetch improved responses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImprovedResponses();
  }, [sessionId]);

  const isMessageImproved = (messageId: string): boolean => {
    return improvedResponses.some(response => response.agent_message_id === messageId);
  };

  const getImprovedResponse = (messageId: string): ImprovedResponse | undefined => {
    return improvedResponses.find(response => response.agent_message_id === messageId);
  };

  return {
    improvedResponses,
    isLoading,
    error,
    isMessageImproved,
    getImprovedResponse
  };
};
