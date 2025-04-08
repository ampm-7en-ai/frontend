
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiKnowledgeBase } from './types';
import KnowledgeSourceList from './KnowledgeSourceList';
import { getAgentEndpoint, getAuthHeaders, getAccessToken, BASE_URL } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';

interface AgentKnowledgeContainerProps {
  agentId: string;
}

const AgentKnowledgeContainer: React.FC<AgentKnowledgeContainerProps> = ({
  agentId,
}) => {
  const { toast } = useToast();
  const [knowledgeBases, setKnowledgeBases] = useState<ApiKnowledgeBase[]>([]);

  // Fetch agent details including knowledge bases
  const { data: agentData, isLoading, error } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(`Fetching agent details for ID: ${agentId}`);
      const response = await fetch(`${BASE_URL}${getAgentEndpoint(agentId)}`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch agent details: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!agentId,
  });

  // Extract knowledge bases from agent data when it's available
  useEffect(() => {
    if (agentData && agentData.knowledge_bases) {
      console.log('Agent knowledge bases received:', agentData.knowledge_bases);
      setKnowledgeBases(agentData.knowledge_bases);
    }
  }, [agentData]);

  // Handle error scenario
  useEffect(() => {
    if (error) {
      console.error('Error fetching agent knowledge bases:', error);
      toast({
        title: 'Error loading knowledge bases',
        description: 'Failed to load knowledge sources for this agent.',
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  return (
    <div className="space-y-6">
      <KnowledgeSourceList 
        knowledgeBases={knowledgeBases}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AgentKnowledgeContainer;
