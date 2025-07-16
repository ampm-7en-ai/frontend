
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface AgentData {
  id?: number;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  position: 'bottom-right' | 'bottom-left';
  suggestions: string[];
  avatar?: string;
  avatarUrl?: string;
}

interface BuilderState {
  agentData: AgentData;
  isPreviewActive: boolean;
}

type BuilderAction = 
  | { type: 'UPDATE_AGENT_DATA'; payload: Partial<AgentData> }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_PREVIEW_ACTIVE'; payload: boolean };

// Initial state
const initialState: BuilderState = {
  agentData: {
    chatbotName: 'AI Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    buttonText: 'Chat with us',
    primaryColor: '#9b87f5',
    secondaryColor: '#ffffff',
    fontFamily: 'Inter',
    position: 'bottom-right',
    suggestions: [
      'How can I get started?',
      'What features do you offer?',
      'Tell me about your pricing'
    ]
  },
  isPreviewActive: true
};

// Reducer
function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'UPDATE_AGENT_DATA':
      return {
        ...state,
        agentData: { ...state.agentData, ...action.payload }
      };
    case 'TOGGLE_PREVIEW':
      return {
        ...state,
        isPreviewActive: !state.isPreviewActive
      };
    case 'SET_PREVIEW_ACTIVE':
      return {
        ...state,
        isPreviewActive: action.payload
      };
    default:
      return state;
  }
}

// Context
interface BuilderContextType {
  state: BuilderState;
  updateAgentData: (data: Partial<AgentData>) => void;
  togglePreview: () => void;
  setPreviewActive: (active: boolean) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

// Provider
export const BuilderProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const updateAgentData = (data: Partial<AgentData>) => {
    dispatch({ type: 'UPDATE_AGENT_DATA', payload: data });
  };

  const togglePreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW' });
  };

  const setPreviewActive = (active: boolean) => {
    dispatch({ type: 'SET_PREVIEW_ACTIVE', payload: active });
  };

  const contextValue: BuilderContextType = {
    state,
    updateAgentData,
    togglePreview,
    setPreviewActive
  };

  return (
    <BuilderContext.Provider value={contextValue}>
      {children}
    </BuilderContext.Provider>
  );
};

// Hook
export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider');
  }
  return context;
};
