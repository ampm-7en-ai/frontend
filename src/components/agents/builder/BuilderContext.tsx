
import React, { createContext, useContext, useReducer } from 'react';
import { KnowledgeSource } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

export type CanvasMode = 'embedded' | 'popup' | 'inline';

export interface AgentData {
  id: string | null;
  name: string;
  description?: string;
  agentType?: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  position: 'bottom-right' | 'bottom-left';
  suggestions: string[];
  avatar: string;
  avatarUrl: string;
  systemPrompt: string;
  knowledgeSources: KnowledgeSource[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  guidelines?: {
    dos: string[];
    donts: string[];
  };
  settings?: any;
}

export interface BuilderState {
  agentData: AgentData;
  canvasMode: CanvasMode;
  isPreviewActive: boolean;
  selectedKnowledgeSource: KnowledgeSource | null;
  isSystemPromptModalOpen: boolean;
  isLoading: boolean;
}

type BuilderAction =
  | { type: 'UPDATE_AGENT_DATA'; payload: Partial<AgentData> }
  | { type: 'SET_CANVAS_MODE'; payload: CanvasMode }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_IS_PREVIEW_ACTIVE'; payload: boolean }
  | { type: 'ADD_KNOWLEDGE_SOURCE'; payload: KnowledgeSource }
  | { type: 'UPDATE_KNOWLEDGE_SOURCE'; payload: KnowledgeSource }
  | { type: 'DELETE_KNOWLEDGE_SOURCE'; payload: string }
  | { type: 'SELECT_KNOWLEDGE_SOURCE'; payload: KnowledgeSource | null }
  | { type: 'OPEN_SYSTEM_PROMPT_MODAL' }
  | { type: 'CLOSE_SYSTEM_PROMPT_MODAL' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: BuilderState = {
  agentData: {
    id: null,
    name: 'AI Assistant',
    description: '',
    agentType: 'General Assistant',
    chatbotName: 'AI Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    buttonText: 'Chat with us',
    primaryColor: '#9b87f5',
    secondaryColor: '#ffffff',
    fontFamily: 'Inter',
    position: 'bottom-right',
    suggestions: ['How can I get started?', 'What features do you offer?', 'Tell me about your pricing'],
    avatar: '',
    avatarUrl: '',
    systemPrompt: '',
    knowledgeSources: [],
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    guidelines: {
      dos: [],
      donts: []
    }
  },
  canvasMode: 'inline',
  isPreviewActive: true,
  selectedKnowledgeSource: null,
  isSystemPromptModalOpen: false,
  isLoading: false
};

const builderReducer = (state: BuilderState, action: BuilderAction): BuilderState => {
  switch (action.type) {
    case 'UPDATE_AGENT_DATA':
      return {
        ...state,
        agentData: { ...state.agentData, ...action.payload },
      };
    case 'SET_CANVAS_MODE':
      return {
        ...state,
        canvasMode: action.payload,
      };
    case 'TOGGLE_PREVIEW':
      return {
        ...state,
        isPreviewActive: !state.isPreviewActive,
      };
    case 'SET_IS_PREVIEW_ACTIVE':
      return {
        ...state,
        isPreviewActive: action.payload,
      };
    case 'ADD_KNOWLEDGE_SOURCE':
      const newKnowledgeSource = { ...action.payload, id: uuidv4() };
      return {
        ...state,
        agentData: {
          ...state.agentData,
          knowledgeSources: [...state.agentData.knowledgeSources, newKnowledgeSource],
        },
      };
    case 'UPDATE_KNOWLEDGE_SOURCE':
      return {
        ...state,
        agentData: {
          ...state.agentData,
          knowledgeSources: state.agentData.knowledgeSources.map((ks) =>
            ks.id === action.payload.id ? action.payload : ks
          ),
        },
      };
    case 'DELETE_KNOWLEDGE_SOURCE':
      return {
        ...state,
        agentData: {
          ...state.agentData,
          knowledgeSources: state.agentData.knowledgeSources.filter((ks) => ks.id !== action.payload),
        },
        selectedKnowledgeSource: state.selectedKnowledgeSource?.id === action.payload ? null : state.selectedKnowledgeSource,
      };
    case 'SELECT_KNOWLEDGE_SOURCE':
      return {
        ...state,
        selectedKnowledgeSource: action.payload,
      };
    case 'OPEN_SYSTEM_PROMPT_MODAL':
      return {
        ...state,
        isSystemPromptModalOpen: true,
      };
    case 'CLOSE_SYSTEM_PROMPT_MODAL':
      return {
        ...state,
        isSystemPromptModalOpen: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

interface BuilderContextProps {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  updateAgentData: (data: Partial<AgentData>) => void;
  saveAgent: () => Promise<void>;
  deleteAgent: () => Promise<void>;
  setCanvasMode: (mode: CanvasMode) => void;
}

const BuilderContext = createContext<BuilderContextProps | undefined>(undefined);

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const updateAgentData = (data: Partial<AgentData>) => {
    dispatch({ type: 'UPDATE_AGENT_DATA', payload: data });
  };

  const saveAgent = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // TODO: Implement actual save logic
      console.log('Saving agent:', state.agentData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteAgent = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // TODO: Implement actual delete logic
      console.log('Deleting agent:', state.agentData.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error('Error deleting agent:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setCanvasMode = (mode: CanvasMode) => {
    dispatch({ type: 'SET_CANVAS_MODE', payload: mode });
  };

  return (
    <BuilderContext.Provider value={{ 
      state, 
      dispatch, 
      updateAgentData, 
      saveAgent, 
      deleteAgent, 
      setCanvasMode 
    }}>
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};
