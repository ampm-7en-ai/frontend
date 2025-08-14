
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from '@/utils/api-config';
import { apiGet, apiPost, apiRequest } from '@/utils/api-interceptor';

export interface AgentPrompt {
  id: number;
  agent_type: string;
  system_prompt: string;
  enable_fallback: boolean;
  created_at: string;
  updated_at: string;
}

interface AgentPromptsResponse {
  message: string;
  data: AgentPrompt[];
  status: string;
}

interface AgentPromptResponse {
  message: string;
  data: AgentPrompt;
  status: string;
}

export const useAgentPrompts = (isAdminPanel: boolean = false, enabled: boolean = true ) => {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<AgentPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const getEndpoint = () => isAdminPanel ? 'settings/system-prompts/' : 'admin/agent-prompts/';

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      const response = await apiGet(getApiUrl(getEndpoint()));

      if (!response.ok) {
        throw new Error('Failed to fetch agent prompts');
      }

      const data: AgentPromptsResponse = await response.json();
      setPrompts(data.data);
    } catch (error) {
      console.error('Error fetching agent prompts:', error);
      toast({
        title: "Error",
        description: "Failed to load agent prompts",
        variant: "destructive"
      });
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createPrompt = async (promptData: Omit<AgentPrompt, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiPost(getApiUrl('admin/agent-prompts/'), promptData);

      if (!response.ok) {
        throw new Error('Failed to create agent prompt');
      }

      const data: AgentPromptResponse = await response.json();
      
      // Add the new prompt to the list
      setPrompts(prev => [...prev, data.data]);

      toast({
        title: "Success",
        description: data.message || "Agent prompt created successfully",
        variant: "default"
      });

      return data.data;
    } catch (error) {
      console.error('Error creating agent prompt:', error);
      toast({
        title: "Error",
        description: "Failed to create agent prompt",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePrompt = async (promptId: number, promptData: Partial<AgentPrompt>) => {
    try {
      const response = await apiRequest(getApiUrl(`admin/agent-prompts/${promptId}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      });

      if (!response.ok) {
        throw new Error('Failed to update agent prompt');
      }

      const data: AgentPromptResponse = await response.json();
      
      // Update the prompt in the list
      setPrompts(prev => 
        prev.map(prompt => 
          prompt.id === promptId ? { ...prompt, ...data.data } : prompt
        )
      );

      toast({
        title: "Success",
        description: data.message || "Agent prompt updated successfully",
        variant: "default"
      });

      return data.data;
    } catch (error) {
      console.error('Error updating agent prompt:', error);
      toast({
        title: "Error",
        description: "Failed to update agent prompt",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (enabled && !hasLoaded) {
      fetchPrompts().finally(() => setHasLoaded(true));
    }
    
  }, [enabled, hasLoaded]);

  return {
    prompts,
    isLoading,
    refetch: fetchPrompts,
    createPrompt,
    updatePrompt
  };
};
