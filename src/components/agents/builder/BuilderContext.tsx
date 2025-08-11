import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { agentApi } from '@/utils/api-config';
import { KnowledgeSource } from '@/components/agents/knowledge/types';
import { updateAgentInCache, removeAgentFromCache } from '@/utils/agentCacheUtils';
import { useQueryClient } from '@tanstack/react-query';
import { startPollingAgent } from '@/utils/trainingPoller';
import { AgentTrainingService } from '@/services/AgentTrainingService';

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
  avatar?: string;
  avatarUrl?: string;
  avatarType?: 'default' | 'predefined' | 'custom';
  guidelines: {
    dos: string[];
    donts: string[];
  };
  behavior?: {
    conversationMemory?: boolean;
    continuousLearning?: boolean;
    expertHandoff?: boolean;
    aiToAiHandoff?: boolean;
    multilingualSupport?: boolean;
  };
  settings?: {
    temperature?: number;
    token_length?: string | number;
    response_model?: string;
  };
  knowledgeSources: KnowledgeSource[];
  status?: string; // 🔥 Add status field to preserve agent status from server
}

interface BuilderState {
  agentData: AgentFormData;
  canvasMode: 'embedded' | 'popup' | 'inline';
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  isPreviewActive: boolean;
  isDirty: boolean;
  isLoading: boolean;
  lastSaveTimestamp?: number;
}

interface BuilderContextType {
  state: BuilderState;
  updateAgentData: (data: Partial<AgentFormData>) => void;
  setCanvasMode: (mode: 'embedded' | 'popup' | 'inline') => void;
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
  avatarType: 'default',
  guidelines: {
    dos: ['Be helpful and polite', 'Provide accurate information', 'Stay on topic'],
    donts: ['Don\'t be rude', 'Don\'t provide false information', 'Don\'t ignore user questions']
  },
  settings: {
    temperature: 0.7,
    token_length: 1000,
    response_model: 'gpt-3.5-turbo'
  },
  knowledgeSources: []
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
  const queryClient = useQueryClient();

  // Enhanced logging for debugging
  console.log('BuilderProvider - Agent ID from URL:', id);
  console.log('BuilderProvider - Current agent data:', state.agentData);

  // Helper function to format knowledge sources - Updated to include status field
  const formatKnowledgeSources = (knowledgeSources: any[]): KnowledgeSource[] => {
    if (!knowledgeSources || !Array.isArray(knowledgeSources)) return [];
    
    return knowledgeSources
      .filter(ks => ks && ks.training_status !== 'deleted') // Filter out deleted sources
      .map(ks => ({
        id: ks.id,
        name: ks.title || 'Untitled Source',
        type: ks.type || 'unknown',
        size: ks.metadata?.file_size || 'N/A',
        lastUpdated: ks.metadata?.upload_date ? new Date(ks.metadata.upload_date).toLocaleDateString('en-GB') : 'N/A',
        status: ks.status || 'active', // Map status field from API
        trainingStatus: ks.training_status || ks.status || 'idle',
        linkBroken: false,
        knowledge_sources: [],
        metadata: {
          ...ks.metadata,
          url: ks.file || ks.url,
          created_at: ks.metadata?.upload_date,
          last_updated: ks.updated_at
        },
        url: ks.file || ks.url,
        title: ks.title
      }));
  };

  // Fetch agent data when ID is present
  const loadAgentData = useCallback(async () => {
    if (!id) {
      console.log('No agent ID provided, using default data');
      return;
    }

    console.log('Loading agent data for ID:', id);
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await agentApi.getById(id);

      if (!response.ok) {
        throw new Error(`Failed to fetch agent: ${response.statusText}`);
      }

      const result = await response.json();
      const agentData = result.data;
      
      console.log('Fetched agent data:', agentData);

      // Map API response to our form structure - Enhanced model configuration mapping
      const mappedData: AgentFormData = {
        id: agentData.id || id,
        name: agentData.name || 'Untitled Agent',
        description: agentData.description || 'A helpful AI assistant created with our builder.',
        agentType: agentData.agentType || 'Customer Support',
        // Updated model mapping to handle the new API structure
        model: agentData.model?.response_model || agentData.model?.selectedModel || agentData.model?.name || 'gpt-3.5-turbo',
        temperature: agentData.model?.temperature || 0.7,
        maxTokens: agentData.model?.token_length || agentData.model?.maxResponseLength || agentData.model?.maxTokens || 1000,
        systemPrompt: agentData.systemPrompt || 'You are a helpful AI assistant. Be friendly, professional, and provide accurate information.',
        primaryColor: agentData.appearance?.primaryColor || '#3b82f6',
        secondaryColor: agentData.appearance?.secondaryColor || '#ffffff',
        fontFamily: agentData.appearance?.fontFamily || 'Inter',
        chatbotName: agentData.appearance?.chatbotName || 'AI Assistant',
        welcomeMessage: agentData.appearance?.welcomeMessage || '',
        buttonText: agentData.appearance?.buttonText || '',
        position: agentData.appearance?.position || 'bottom-right',
        suggestions: agentData.behavior?.suggestions || agentData.appearance?.suggestions || [],
        avatar: agentData.appearance?.avatar?.src,
        avatarUrl: agentData.appearance?.avatar?.src,
        avatarType: agentData.appearance?.avatar?.type || 'default',
        guidelines: {
          dos: agentData.behavior?.guidelines?.dos || [],
          donts: agentData.behavior?.guidelines?.donts || []
        },
        behavior: {
          conversationMemory: agentData.behavior?.conversationMemory || false,
          continuousLearning: agentData.behavior?.continuousLearning || false,
          expertHandoff: agentData.behavior?.expertHandoff || false,
          aiToAiHandoff: agentData.behavior?.aiToAiHandoff || false,
          multilingualSupport: agentData.behavior?.multilingualSupport || false
        },
        // Updated settings mapping to match the new API structure
        settings: {
          temperature: agentData.model?.temperature || 0.7,
          token_length: agentData.model?.token_length || agentData.model?.maxResponseLength || agentData.model?.maxTokens || 1000,
          response_model: agentData.model?.response_model || agentData.model?.selectedModel || agentData.model?.name || 'gpt-3.5-turbo'
        },
        knowledgeSources: formatKnowledgeSources(agentData.knowledge_sources || []),
        // 🔥 CRITICAL: Preserve the agent status from server
        status: agentData.status
      };

      console.log('Mapped agent data with status preserved:', {
        ...mappedData,
        statusFromServer: agentData.status
      });

      setState(prev => ({
        ...prev,
        agentData: mappedData,
        isDirty: false,
        isLoading: false
      }));

      // Return the raw agentData for use in other effects (preserving original status)
      return agentData;

    } catch (error) {
      console.error('Error loading agent:', error);
      toast({
        title: "Error Loading Agent",
        description: error instanceof Error ? error.message : "Failed to load agent data.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [id, toast]);

  useEffect(() => {
    loadAgentData();
  }, [loadAgentData]);

  // Check agent training status on page load/refresh - Enhanced to check mapped agent data
  useEffect(() => {
    const checkAgentTrainingStatus = async () => {
      if (!id || state.isLoading) return;

      const agentId = id.toString();
      
      console.log('🔍 Checking agent training status using mapped data:', {
        agentId,
        mappedStatus: state.agentData.status,
        agentName: state.agentData.name
      });

      // Check localStorage for existing training tasks
      const allTasks = AgentTrainingService.getAllTrainingTasks();
      const agentTask = allTasks[agentId];
      
      console.log('🔍 LocalStorage training task:', agentTask);

      // Use the mapped agent data status (which should preserve server status)
      if (state.agentData.status === 'Training') {
        console.log('🚀 Agent is in Training status, checking localStorage...');
        
        if (!agentTask || agentTask.status !== 'training') {
          // Server shows training but no localStorage task - resume polling
          console.log('📡 Resuming polling for training agent (no valid localStorage task found)');
          
          // Save training task to localStorage
          if (state.agentData.name) {
            // Create a temporary task entry
            const tasks = AgentTrainingService.getAllTrainingTasks();
            tasks[agentId] = {
              taskId: `resumed-${Date.now()}`,
              agentName: state.agentData.name,
              timestamp: Date.now(),
              status: 'training'
            };
            localStorage.setItem('agent_training_tasks', JSON.stringify(tasks));
            console.log('💾 Saved resumed training task to localStorage');
          }
          
          // Start polling with loadAgentData as the refetch callback
          console.log('🔄 Starting polling with refetch callback...');
          startPollingAgent(agentId, (status, message) => {
            console.log("📊 Training status received:", { status, message });
            
            if (status === 'Active') {
              console.log(`✅ Training completed for agent ${agentId}`);
              AgentTrainingService.removeTask(agentId);
              
              toast({
                title: "Training Completed",
                description: `${state.agentData.name} training completed successfully.`,
                variant: "default"
              });
              
            } else if (status === 'Issues') {
              console.log(`❌ Training failed for agent ${agentId}`);
              AgentTrainingService.removeTask(agentId);
              
              toast({
                title: "Training Failed", 
                description: `${state.agentData.name} training encountered issues.`,
                variant: "destructive"
              });
            }
          }, loadAgentData);
          
          console.log('✅ Polling resumed successfully');
        } else {
          console.log('✅ Agent is training and localStorage task exists - polling should already be active');
        }
      } else {
        // Agent is not in training status, clean up any stale localStorage entries
        if (agentTask && agentTask.status === 'training') {
          console.log('🧹 Cleaning up stale localStorage training task');
          AgentTrainingService.removeTask(agentId);
        }
        console.log('ℹ️ Agent is not in Training status, no polling needed');
      }
    };

    // Only run this check when loading is complete and agent data is available
    if (!state.isLoading && state.agentData.id) {
      checkAgentTrainingStatus();
    }
  }, [id, state.isLoading, state.agentData.status, state.agentData.name, state.agentData.id, loadAgentData, toast]);

  const updateAgentData = useCallback((data: Partial<AgentFormData>) => {
    console.log('Updating agent data:', data);
    setState(prev => ({
      ...prev,
      agentData: { ...prev.agentData, ...data },
      isDirty: true
    }));
  }, []);

  const setCanvasMode = useCallback((mode: 'embedded' | 'popup' | 'inline') => {
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
        // Prepare avatar data
        let avatarData = {
          type: state.agentData.avatarType || 'default',
          src: ''
        };

        if (state.agentData.avatarType === 'custom' && state.agentData.avatar) {
          avatarData.src = state.agentData.avatar;
        }

        const updatePayload = {
          name: state.agentData.name,
          description: state.agentData.description,
          appearance: {
            primaryColor: state.agentData.primaryColor,
            secondaryColor: state.agentData.secondaryColor,
            fontFamily: state.agentData.fontFamily,
            chatbotName: state.agentData.chatbotName,
            welcomeMessage: state.agentData.welcomeMessage,
            buttonText: state.agentData.buttonText,
            position: state.agentData.position,
            avatar: avatarData
          },
          behavior: {
            showOnMobile: true,
            collectVisitorData: true,
            autoShowAfter: 30,
            suggestions: state.agentData.suggestions,
            guidelines: state.agentData.guidelines,
            conversationMemory: state.agentData.behavior?.conversationMemory,
            continuousLearning: state.agentData.behavior?.continuousLearning,
            expertHandoff: state.agentData.behavior?.expertHandoff,
            aiToAiHandoff: state.agentData.behavior?.aiToAiHandoff,
            multilingualSupport: state.agentData.behavior?.multilingualSupport
          },
          // Updated model payload to match the new API structure
          model: {
            response_model: state.agentData.model,
            temperature: state.agentData.temperature,
            token_length: state.agentData.maxTokens
          },
          agentType: state.agentData.agentType,
          systemPrompt: state.agentData.systemPrompt,
          knowledgeSources: state.agentData.knowledgeSources.map(ks => ks.id)
        };

        console.log('Update payload:', updatePayload);

        const updateResponse = await agentApi.update(id, updatePayload);

        if (!updateResponse.ok) {
          throw new Error(`Failed to update agent: ${updateResponse.statusText}`);
        }

        response = await updateResponse.json();
        console.log('Update response:', response);

        // 🔥 NEW: Update cache immediately with the response data
        if (response.data) {
          console.log('🏪 Updating agent cache after save...');
          updateAgentInCache(queryClient, response.data);
        }
      } else {
        // Create new agent
        response = await agentApi.create(state.agentData.name, state.agentData.description);
        const responseData = await response.json();
        console.log('Create response:', responseData);
        response = responseData;
      }
      
      toast({
        title: "Agent Configuration Saved Successfully.",
        description: `${state.agentData.name} has been saved and is ready to use.`,
        variant: "default"
      });

      // Update agent data with the response to refresh components
      if (response.data) {
        const updatedAgentData = {
          ...response.data,
          // Map API response to our internal format with updated model mapping
          name: response.data.name,
          description: response.data.description,
          primaryColor: response.data.appearance?.primaryColor || state.agentData.primaryColor,
          secondaryColor: response.data.appearance?.secondaryColor || state.agentData.secondaryColor,
          fontFamily: response.data.appearance?.fontFamily || state.agentData.fontFamily,
          chatbotName: response.data.appearance?.chatbotName || state.agentData.chatbotName,
          welcomeMessage: response.data.appearance?.welcomeMessage || state.agentData.welcomeMessage,
          buttonText: response.data.appearance?.buttonText || state.agentData.buttonText,
          position: response.data.appearance?.position || state.agentData.position,
          avatarType: response.data.appearance?.avatar?.type || state.agentData.avatarType,
          avatar: response.data.appearance?.avatar?.src || state.agentData.avatar,
          suggestions: response.data.behavior?.suggestions || state.agentData.suggestions,
          guidelines: response.data.behavior?.guidelines || state.agentData.guidelines,
          behavior: response.data.behavior || state.agentData.behavior,
          // Updated model mapping for the response
          model: response.data.model?.response_model || state.agentData.model,
          temperature: response.data.model?.temperature || state.agentData.temperature,
          maxTokens: response.data.model?.token_length || state.agentData.maxTokens,
          settings: {
            temperature: response.data.model?.temperature || state.agentData.temperature,
            token_length: response.data.model?.token_length || state.agentData.maxTokens,
            response_model: response.data.model?.response_model || state.agentData.model
          },
          agentType: response.data.agentType || state.agentData.agentType,
          systemPrompt: response.data.systemPrompt || state.agentData.systemPrompt,
          knowledgeSources: formatKnowledgeSources(response.data.knowledge_sources || [])
        };
        
        setState(prev => ({ 
          ...prev, 
          agentData: updatedAgentData,
          isDirty: false,
          // Add a timestamp to force re-mount of components
          lastSaveTimestamp: Date.now()
        }));
      } else {
        // Reset dirty state
        setState(prev => ({ ...prev, isDirty: false }));
      }

      if (response.data?.id && !id) {
        navigate(`/agents/builder/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error Saving agent:', error);
      toast({
        title: "Saving Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred while saving the configurations.",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.agentData, navigate, toast, id, queryClient]);

  const deleteAgent = useCallback(async () => {
    if (!id) {
      navigate('/agents');
      return;
    }

    try {
      const response = await agentApi.delete(id);

      if (!response.ok) {
        throw new Error(`Failed to delete agent: ${response.statusText}`);
      }

      // CACHE-FIRST: Remove agent from cache immediately
      console.log('🗑️ BuilderContext: Removing agent from cache:', id);
      removeAgentFromCache(queryClient, id);

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
  }, [navigate, toast, id, queryClient]);

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
