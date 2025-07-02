
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createAgent } from '@/utils/api-config';

interface AgentFormData {
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
  resetBuilder: () => void;
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

  // Initialize with dynamic agent creation
  useEffect(() => {
    const initializeAgent = () => {
      // Generate a unique timestamp-based name
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
      const uniqueName = `Untitled_Agent_${timestamp}`;
      
      setState(prev => ({
        ...prev,
        agentData: {
          ...prev.agentData,
          name: uniqueName,
          description: `AI assistant created on ${new Date().toLocaleDateString()}`
        },
        isDirty: true
      }));
    };

    // Initialize on component mount
    initializeAgent();
  }, []);

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
      const response = await createAgent(state.agentData.name, state.agentData.description);
      
      toast({
        title: "Agent Created Successfully",
        description: `${state.agentData.name} has been created and is ready to use.`,
        variant: "default"
      });

      // Reset dirty state
      setState(prev => ({ ...prev, isDirty: false }));

      if (response.data?.id) {
        navigate(`/agents/${response.data.id}/edit`);
      } else {
        navigate('/agents');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred while creating the agent.",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.agentData, navigate, toast]);

  const resetBuilder = useCallback(() => {
    setState({
      ...initialState,
      agentData: {
        ...defaultAgentData,
        name: `Untitled_Agent_${Date.now()}`
      }
    });
    
    toast({
      title: "Builder Reset",
      description: "All settings have been reset to defaults.",
      variant: "default"
    });
  }, [toast]);

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
