
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createAgent, getAgent, updateAgent } from '@/utils/api-config';

interface AgentFormData {
  id?: string;
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
  isInitializing: boolean;
}

interface BuilderContextType {
  state: BuilderState;
  updateAgentData: (data: Partial<AgentFormData>) => void;
  setCanvasMode: (mode: 'embedded' | 'popup' | 'fullscreen') => void;
  setDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  togglePreview: () => void;
  saveAgent: () => Promise<void>;
  resetBuilder: () => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

const defaultAgentData: AgentFormData = {
  name: 'Untitled Agent',
  description: 'A helpful AI assistant ready to help with your questions.',
  agentType: 'Customer Support',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: 'You are a helpful AI assistant. Be friendly, professional, and provide accurate information.',
  primaryColor: '#6366f1',
  secondaryColor: '#ffffff',
  fontFamily: 'Inter',
  chatbotName: 'AI Assistant',
  welcomeMessage: 'Hello! How can I help you today?',
  buttonText: 'Chat with us',
  position: 'bottom-right',
  suggestions: ['How can I get started?', 'What features do you offer?', 'Tell me about your pricing'],
  guidelines: {
    dos: ['Be helpful and polite', 'Provide accurate information', 'Ask clarifying questions when needed'],
    donts: ['Don\'t be rude or dismissive', 'Don\'t provide false information', 'Don\'t ignore user questions']
  }
};

const initialState: BuilderState = {
  agentData: defaultAgentData,
  canvasMode: 'popup',
  deviceMode: 'desktop',
  isPreviewActive: true,
  isDirty: false,
  isLoading: false,
  isInitializing: true
};

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BuilderState>(initialState);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  // Initialize agent when component mounts
  useEffect(() => {
    const initializeAgent = async () => {
      setState(prev => ({ ...prev, isInitializing: true }));
      
      try {
        if (id && id !== 'new') {
          // Load existing agent
          const response = await getAgent(id);
          if (response.data) {
            setState(prev => ({
              ...prev,
              agentData: { ...defaultAgentData, ...response.data },
              isInitializing: false,
              isDirty: false
            }));
          }
        } else {
          // Create new agent automatically
          const response = await createAgent('Untitled Agent', 'A helpful AI assistant ready to help with your questions.');
          
          if (response.data?.id) {
            setState(prev => ({
              ...prev,
              agentData: { ...defaultAgentData, id: response.data.id },
              isInitializing: false,
              isDirty: false
            }));
            
            // Update URL to reflect the new agent ID
            navigate(`/agents/builder/${response.data.id}`, { replace: true });
            
            toast({
              title: "Agent Created",
              description: "New agent created successfully. You can now customize it.",
              variant: "default"
            });
          } else {
            throw new Error('Failed to create agent');
          }
        }
      } catch (error) {
        console.error('Error initializing agent:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize agent. Using default settings.",
          variant: "destructive"
        });
        setState(prev => ({ ...prev, isInitializing: false }));
      }
    };

    initializeAgent();
  }, [id, navigate, toast]);

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

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (state.agentData.id) {
        // Update existing agent
        await updateAgent(state.agentData.id, {
          name: state.agentData.name,
          description: state.agentData.description
        });
        
        toast({
          title: "Agent Updated",
          description: `${state.agentData.name} has been updated successfully.`,
          variant: "default"
        });
        
        setState(prev => ({ ...prev, isDirty: false }));
      } else {
        // This shouldn't happen with auto-creation, but handle it
        const response = await createAgent(state.agentData.name, state.agentData.description);
        
        if (response.data?.id) {
          setState(prev => ({
            ...prev,
            agentData: { ...prev.agentData, id: response.data.id },
            isDirty: false
          }));
          
          navigate(`/agents/builder/${response.data.id}`, { replace: true });
          
          toast({
            title: "Agent Created",
            description: `${state.agentData.name} has been created successfully.`,
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.agentData, navigate, toast]);

  const resetBuilder = useCallback(() => {
    setState(prev => ({
      ...initialState,
      agentData: { ...defaultAgentData, id: prev.agentData.id }
    }));
  }, []);

  const value: BuilderContextType = {
    state,
    updateAgentData,
    setCanvasMode,
    setDeviceMode,
    togglePreview,
    saveAgent,
    resetBuilder
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
