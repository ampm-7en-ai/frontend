
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createAgent } from '@/utils/api-config';
import { API_ENDPOINTS, getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';

interface AgentFormData {
  id?: string | number;
  name: string;
  description: string;
  agentType: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  position: 'bottom-right' | 'bottom-left';
  suggestions: string[];
  avatarUrl?: string;
  guidelines: {
    dos: string[];
    donts: string[];
  };
}

interface BuilderState {
  agentData: AgentFormData;
  canvasMode: 'embedded' | 'popup' | 'fullscreen';
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  isPreviewActive: boolean;
  isDirty: boolean;
  isLoading: boolean;
}

interface BuilderContextType {
  state: BuilderState;
  updateAgentData: (data: Partial<AgentFormData>) => void;
  setCanvasMode: (mode: 'embedded' | 'popup' | 'fullscreen') => void;
  setDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  togglePreview: () => void;
  saveAgent: () => Promise<void>;
  deleteAgent: () => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

const defaultAgentData: AgentFormData = {
  name: 'Untitled Agent',
  description: 'A helpful AI assistant created with our builder.',
  agentType: 'Customer Support',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: 'You are a helpful AI assistant. Be friendly, professional, and provide accurate information.',
  primaryColor: '#3b82f6',
  secondaryColor: '#ffffff',
  fontFamily: 'Inter',
  chatbotName: 'AI Assistant',
  welcomeMessage: 'Hello! How can I help you today?',
  buttonText: 'Chat with us',
  position: 'bottom-right',
  suggestions: [
    'How can I get started?', 
    'What features do you offer?', 
    'Tell me about your pricing'
  ],
  guidelines: {
    dos: ['Be helpful and polite', 'Provide accurate information', 'Stay on topic'],
    donts: ['Don\'t be rude', 'Don\'t provide false information', 'Don\'t ignore user questions']
  }
};

const initialState: BuilderState = {
  agentData: defaultAgentData,
  canvasMode: 'embedded',
  deviceMode: 'desktop',
  isPreviewActive: true,
  isDirty: false,
  isLoading: false
};

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BuilderState>(initialState);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  // Enhanced logging for debugging
  console.log('BuilderProvider - Agent ID from URL:', id);
  console.log('BuilderProvider - Current agent data:', state.agentData);

  // Fetch agent data when ID is present
  useEffect(() => {
    const loadAgentData = async () => {
      if (!id) {
        console.log('No agent ID provided, using default data');
        return;
      }

      console.log('Loading agent data for ID:', id);
      setState(prev => ({ ...prev, isLoading: true }));

      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${id}/`), {
          headers: getAuthHeaders(token)
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch agent: ${response.statusText}`);
        }

        const result = await response.json();
        const agentData = result.data;
        
        console.log('Fetched agent data:', agentData);

        // Map API response to our form structure
        const mappedData: AgentFormData = {
          id: agentData.id || id,
          name: agentData.name || 'Untitled Agent',
          description: agentData.description || 'A helpful AI assistant created with our builder.',
          agentType: agentData.agentType || 'Customer Support',
          model: agentData.settings?.response_model || agentData.model?.selectedModel || 'gpt-3.5-turbo',
          temperature: agentData.settings?.temperature || agentData.model?.temperature || 0.7,
          maxTokens: parseInt(agentData.settings?.token_length) || agentData.model?.maxResponseLength || 1000,
          systemPrompt: agentData.systemPrompt || 'You are a helpful AI assistant. Be friendly, professional, and provide accurate information.',
          primaryColor: agentData.appearance?.primaryColor || '#3b82f6',
          secondaryColor: agentData.appearance?.secondaryColor || '#ffffff',
          fontFamily: agentData.appearance?.fontFamily || 'Inter',
          chatbotName: agentData.appearance?.chatbotName || 'AI Assistant',
          welcomeMessage: agentData.appearance?.welcomeMessage || 'Hello! How can I help you today?',
          buttonText: agentData.appearance?.buttonText || 'Chat with us',
          position: agentData.appearance?.position || 'bottom-right',
          suggestions: agentData.appearance?.suggestions || ['How can I get started?', 'What features do you offer?', 'Tell me about your pricing'],
          avatarUrl: agentData.appearance?.avatarSrc,
          guidelines: {
            dos: agentData.behavior?.guidelines?.dos || ['Be helpful and polite', 'Provide accurate information', 'Stay on topic'],
            donts: agentData.behavior?.guidelines?.donts || ['Don\'t be rude', 'Don\'t provide false information', 'Don\'t ignore user questions']
          }
        };

        console.log('Mapped agent data:', mappedData);

        setState(prev => ({
          ...prev,
          agentData: mappedData,
          isDirty: false,
          isLoading: false
        }));

      } catch (error) {
        console.error('Error loading agent:', error);
        toast({
          title: "Error Loading Agent",
          description: error instanceof Error ? error.message : "Failed to load agent data.",
          variant: "destructive"
        });
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAgentData();
  }, [id, toast]);

  const updateAgentData = useCallback((data: Partial<AgentFormData>) => {
    setState(prev => ({
      ...prev,
      agentData: { ...prev.agentData, ...data },
      isDirty: true
    }));
  }, []);

  const setCanvasMode = useCallback((mode: 'embedded' | 'popup' | 'fullscreen') => {
    setState(prev => ({ ...prev, canvasMode: mode }));
  }, []);

  const setDeviceMode = useCallback((mode: 'desktop' | 'tablet' | 'mobile') => {
    setState(prev => ({ ...prev, deviceMode: mode }));
  }, []);

  const togglePreview = useCallback(() => {
    setState(prev => ({ ...prev, isPreviewActive: !prev.isPreviewActive }));
  }, []);

  const saveAgent = useCallback(async () => {
    if (!state.agentData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an agent name.",
        variant: "destructive"
      });
      return;
    }

    console.log('Saving agent with data:', state.agentData);
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      let response;
      
      if (id) {
        // Update existing agent
        const token = getAccessToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const updatePayload = {
          name: state.agentData.name,
          description: state.agentData.description,
          agentType: state.agentData.agentType,
          systemPrompt: state.agentData.systemPrompt,
          settings: {
            temperature: state.agentData.temperature,
            token_length: state.agentData.maxTokens.toString(),
            response_model: state.agentData.model
          },
          appearance: {
            primaryColor: state.agentData.primaryColor,
            secondaryColor: state.agentData.secondaryColor,
            fontFamily: state.agentData.fontFamily,
            chatbotName: state.agentData.chatbotName,
            welcomeMessage: state.agentData.welcomeMessage,
            buttonText: state.agentData.buttonText,
            position: state.agentData.position,
            suggestions: state.agentData.suggestions,
            avatarSrc: state.agentData.avatarUrl
          },
          behavior: {
            guidelines: state.agentData.guidelines
          }
        };

        console.log('Update payload:', updatePayload);

        const updateResponse = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${id}/`), {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(token),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update agent: ${updateResponse.statusText}`);
        }

        response = await updateResponse.json();
        console.log('Update response:', response);
      } else {
        // Create new agent
        response = await createAgent(state.agentData.name, state.agentData.description);
        console.log('Create response:', response);
      }
      
      toast({
        title: "Agent Deployed Successfully",
        description: `${state.agentData.name} has been deployed and is ready to use.`,
        variant: "default"
      });

      // Reset dirty state
      setState(prev => ({ ...prev, isDirty: false }));

      if (response.data?.id && !id) {
        navigate(`/agents/builder/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error deploying agent:', error);
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred while deploying the agent.",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.agentData, navigate, toast, id]);

  const deleteAgent = useCallback(async () => {
    if (!id) {
      navigate('/agents');
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${id}/`), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error(`Failed to delete agent: ${response.statusText}`);
      }

      toast({
        title: "Agent Deleted",
        description: "The agent has been deleted successfully.",
        variant: "default"
      });

      navigate('/agents');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete the agent.",
        variant: "destructive"
      });
    }
  }, [navigate, toast, id]);

  const value: BuilderContextType = {
    state,
    updateAgentData,
    setCanvasMode,
    setDeviceMode,
    togglePreview,
    saveAgent,
    deleteAgent
  };

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};
