
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Agent, Message, ChatConfig } from '@/components/agents/modelComparison/types';
import { KnowledgeSource } from '@/components/agents/knowledge/types';
import { fetchAgentDetails, API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { WebSocketConnectionManager } from '@/services/WebSocketConnectionManager';
import { useAIModels } from './useAIModels';
import { useSocketHistory } from './useSocketHistory';
import { HistoryItem } from '@/types/history';

// Mock data for fallback
const mockAgents = [
  {
    id: "1",
    name: "Customer Support Agent",
    description: "Helps with product questions and customer service inquiries",
    conversations: 1234,
    lastModified: new Date().toISOString(),
    averageRating: 4.8,
    knowledgeSources: [
      { 
        id: 1, 
        name: "Product Docs", 
        type: "document", 
        icon: "BookOpen", 
        size: "250KB",
        lastUpdated: "2023-09-15",
        trainingStatus: "success" as const,
        hasError: false, 
        content: "# Product Documentation\n\nOur product is a cloud-based solution that helps businesses automate customer support workflows. Key features include:\n\n- AI-powered response suggestions\n- Integration with popular CRM systems\n- Analytics dashboard\n- Multi-channel support (email, chat, social media)" 
      },
      { 
        id: 2, 
        name: "FAQ", 
        type: "webpage", 
        icon: "Globe", 
        size: "120KB",
        lastUpdated: "2023-10-05",
        trainingStatus: "success" as const,
        hasError: false,
        content: "## Frequently Asked Questions\n\n**Q: How do I reset my password?**\nA: Click on the 'Forgot Password' link on the login page and follow the instructions sent to your email.\n\n**Q: How do I upgrade my subscription?**\nA: Go to Settings > Billing and select your desired plan.\n\n**Q: Can I integrate with Salesforce?**\nA: Yes, we offer native integration with Salesforce and other popular CRM systems." 
      }
    ],
    model: "gpt4",
    isDeployed: false,
    systemPrompt: "You are a helpful customer support assistant. Your goal is to assist users with their questions and problems related to our products and services. Be friendly, patient, and informative."
  },
  {
    id: "2",
    name: "Sales Agent",
    description: "Helps with product sales and pricing",
    conversations: 856,
    lastModified: new Date().toISOString(),
    averageRating: 4.6,
    knowledgeSources: [
      { 
        id: 3, 
        name: "Pricing Guide", 
        type: "document", 
        icon: "DollarSign", 
        size: "180KB",
        lastUpdated: "2023-11-20",
        trainingStatus: "success" as const,
        hasError: false,
        content: "# Pricing Guide\n\n## Basic Plan - $9.99/month\n- Up to 5 users\n- Core features\n- Email support\n\n## Pro Plan - $29.99/month\n- Unlimited users\n- All core features plus advanced analytics\n- Priority email & chat support\n- API access\n\n## Enterprise Plan - Custom pricing\n- All Pro features\n- Dedicated account manager\n- Custom integrations\n- 24/7 phone support" 
      }
    ],
    model: "gpt35",
    isDeployed: true,
    systemPrompt: "You are a knowledgeable sales assistant. Your goal is to help potential customers understand our products, answer their questions, and guide them towards making a purchase decision. Be enthusiastic but not pushy."
  },
  {
    id: "3",
    name: "Technical Support",
    description: "Provides technical troubleshooting",
    conversations: 2105,
    lastModified: new Date().toISOString(),
    averageRating: 4.9,
    knowledgeSources: [
      { 
        id: 4, 
        name: "Technical Manual", 
        type: "document", 
        icon: "FileText", 
        size: "350KB",
        lastUpdated: "2023-08-10",
        trainingStatus: "success" as const,
        hasError: false,
        content: "# Technical Manual\n\n## System Requirements\n- Operating System: Windows 10/11, macOS 10.14+, Linux\n- RAM: 8GB minimum, 16GB recommended\n- Disk Space: 250MB\n- Internet: Broadband connection\n\n## Installation Guide\n1. Download the installer from your account dashboard\n2. Run the installer and follow on-screen instructions\n3. Launch the application and sign in with your credentials" 
      },
      { 
        id: 5, 
        name: "Troubleshooting Guide", 
        type: "document", 
        icon: "Tool", 
        size: "200KB",
        lastUpdated: "2023-12-01",
        trainingStatus: "success" as const,
        hasError: false,
        content: "# Troubleshooting Guide\n\n## Common Issues\n\n### Application Won't Start\n- Verify system requirements\n- Check for conflicting software\n- Try reinstalling the application\n\n### Connection Problems\n- Check your internet connection\n- Verify firewall settings\n- Ensure the server is not down for maintenance" 
      }
    ],
    model: "anthropic",
    isDeployed: true,
    systemPrompt: "You are a technical support specialist. Your goal is to help users troubleshoot and resolve technical issues with our products. Be precise, thorough, and explain technical concepts clearly."
  }
];

export const useAgentTest = (initialAgentId: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { allModelOptions } = useAIModels();
  
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId || "1");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [numModels, setNumModels] = useState(3);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  
  // Initialize chat configs with real model data
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>(() => {
    const defaultModels = allModelOptions.length > 0 
      ? [
          allModelOptions[0]?.value || "gpt-4-turbo",
          allModelOptions[1]?.value || "gpt-3.5-turbo", 
          allModelOptions[2]?.value || "mistral-large-latest"
        ]
      : ["gpt-4-turbo", "gpt-3.5-turbo", "mistral-large-latest"];
    
    return defaultModels.map(model => ({
      model,
      temperature: 0.7,
      systemPrompt: "",
      maxLength: 512
    }));
  });

  const [messages, setMessages] = useState<Message[][]>([[], [], []]);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState<number | null>(null);
  const [primaryColors, setPrimaryColors] = useState<string[]>(['#9b87f5', '#33C3F0', '#6E59A5']);
  const [modelConnections, setModelConnections] = useState<boolean[]>([false, false, false]);
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cellLoadingStates, setCellLoadingStates] = useState<boolean[]>(Array(3).fill(false));

  // Use refs for stable references
  const connectionManagerRef = useRef<WebSocketConnectionManager>(new WebSocketConnectionManager());
  const agentRef = useRef<Agent | null>(null);
  const systemMessageProcessing = useRef<boolean>(false);
  const initializationInProgress = useRef<boolean>(false);

  // Initialize socket history hook
  const {
    history,
    isHistoryMode,
    selectedHistoryId,
    isPreparingNewMessage,
    handleQuerySent,
    handleResponseReceived,
    selectHistory,
    prepareNewMessage,
    exitHistoryMode,
    getSelectedHistoryItem,
    setIsHistoryMode,
    setSelectedHistoryId,
    clearHistory
  } = useSocketHistory(numModels);

  // Create stable callback functions using refs
  const stableCallbacks = useRef({
    onMessage: (index: number, message: any) => {
      console.log(`Received message for model ${index}:`, message);

      if (message.type === "system_message") {
        systemMessageProcessing.current = true;
        setIsProcessing(true);
        console.log("System message detected, keeping processing state true");
      }
      
      setMessages(prev => {
        const newMessages = [...prev];
        if (!newMessages[index] || !Array.isArray(newMessages[index])) {
          newMessages[index] = [];
        }
        newMessages[index] = [...newMessages[index], {
          ...message,
          id: Date.now() + index + 1,
          sender: `agent${index+1}` as 'agent1' | 'agent2' | 'agent3',
          model: message.model || chatConfigs[index]?.model,
          timestamp: new Date(),
          avatarSrc: agentRef.current?.avatarSrc
        }];
        return newMessages;
      });

      setCellLoadingStates(prev => {
        const newStates = [...prev];
        newStates[index] = false;
        return newStates;
      });
      
      if (message.type !== "system_message" && index === numModels - 1) {
        systemMessageProcessing.current = false;
        setIsProcessing(false);
      }
    },
    onTypingStart: (index: number) => {
      console.log(`Typing indicator started for model ${index}`);
      setCellLoadingStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        return newStates;
      });
    },
    onTypingEnd: (index: number) => {
      console.log(`Typing indicator ended for model ${index}`);
      
      setCellLoadingStates(prev => {
        const newStates = [...prev];
        newStates[index] = false;
        return newStates;
      });
      
      if (systemMessageProcessing.current) {
        systemMessageProcessing.current = false;
        setIsProcessing(false);
      }
    },
    onError: (index: number, error: string) => {
      console.error(`Chat error for model ${index}:`, error);
      
      toast({
        title: "Connection Issue",
        description: `Model ${chatConfigs[index]?.model} connection failed.`,
        variant: "destructive",
      });
      
      setModelConnections(prev => {
        const newStatus = [...prev];
        newStatus[index] = false;
        return newStatus;
      });
    },
    onConnectionChange: (index: number, status: boolean) => {
      console.log(`Connection status changed for model ${index}:`, status);
      
      setModelConnections(prev => {
        const newStatus = [...prev];
        newStatus[index] = status;
        return newStatus;
      });
    }
  });

  // Create stable history callbacks using useCallback
  const stableHandleQuerySent = useCallback((index: number, queryData: any) => {
    handleQuerySent(index, queryData);
  }, [handleQuerySent]);

  const stableHandleResponseReceived = useCallback((index: number, responseData: any) => {
    handleResponseReceived(index, responseData);
  }, [handleResponseReceived]);

  // Update agent ref when agent changes
  useEffect(() => {
    agentRef.current = agent;
  }, [agent]);

  // Update chat configs when model options are available
  useEffect(() => {
    if (allModelOptions.length > 0) {
      setChatConfigs(prev => prev.map((config, index) => ({
        ...config,
        model: allModelOptions[index]?.value || config.model
      })));
    }
  }, [allModelOptions]);

  // Fetch all agents
  const { data: allAgents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      console.log("Fetching all agents list");
      const token = getAccessToken();
      if (!token) {
        console.error("No access token available");
        return mockAgents;
      }
      
      try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
          headers: getAuthHeaders(token)
        });

        console.log("All agents response status:", response.status);
        
        if (!response.ok) {
          console.error("Failed to fetch agents list:", response.status);
          return mockAgents;
        }

        const data = await response.json();
        console.log('All agents data received:', data);
        
        return data.data?.map((agent: any) => ({
          id: agent.id.toString(),
          name: agent.name,
          model: agent.model?.selectedModel || agent.model?.name || 'gpt-3.5',
          avatarSrc: agent.appearance?.avatar?.src || '',
        })) || mockAgents;
      } catch (error) {
        console.error("Error in fetchAllAgents:", error);
        return mockAgents;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch specific agent details
  const { data: agentData, isLoading: isLoadingAgent, refetch: refetchAgent } = useQuery({
    queryKey: ['agent', selectedAgentId],
    queryFn: async () => {
      console.log("Fetching agent details with ID:", selectedAgentId);
      try {
        const result = await fetchAgentDetails(selectedAgentId);
        console.log("Agent details fetch result:", result);
        return result.data;
      } catch (error) {
        console.error("Error fetching agent details:", error);
        throw error;
      }
    },
    enabled: !!selectedAgentId,
    retry: 1,
  });

  // Process agent data when available
  useEffect(() => {
    if (agentData) {
      console.log('Agent details data received successfully:', agentData);
      
      const knowledgeSources: KnowledgeSource[] = agentData.knowledge_bases?.map((kb: any, index: number) => ({
        id: kb.id || index,
        name: kb.name || `Source ${index + 1}`,
        type: kb.type || 'document',
        icon: 'BookOpen',
        size: kb.size || '0 KB',
        lastUpdated: kb.last_updated || new Date().toISOString(),
        trainingStatus: (kb.status || 'success') as 'success' | 'idle' | 'training' | 'error',
        hasError: kb.status === 'error',
        content: kb.content || ""
      })) || [];
      
      const avatarSrc = agentData.appearance?.avatar?.src || '';
      
      const transformedAgent: Agent = {
        id: agentData.id?.toString() || selectedAgentId,
        name: agentData.name || "Unknown Agent",
        description: agentData.description || "",
        conversations: agentData.conversations || 0,
        lastModified: agentData.last_modified || new Date().toISOString(),
        averageRating: agentData.average_rating || 0,
        knowledgeSources,
        model: agentData.model?.selectedModel || agentData.model?.name || 'gpt4',
        isDeployed: agentData.status === 'Live',
        systemPrompt: agentData.systemPrompt || "You are a helpful AI assistant.",
        avatarSrc: avatarSrc
      };
      
      setAgent(transformedAgent);
      
      const primaryColor = agentData.appearance?.primaryColor || '#9b87f5';
      
      const newPrimaryColors = [
        primaryColor,
        adjustColor(primaryColor, 30),
        adjustColor(primaryColor, -30)
      ];
      
      setPrimaryColors(newPrimaryColors);
      
      setChatConfigs(prev => prev.map((config, index) => ({
        ...config,
        systemPrompt: transformedAgent.systemPrompt || "",
        model: config.model,
        temperature: config.temperature
      })));
      
      setMessages(Array(numModels).fill(null).map(() => []));
      setCellLoadingStates(Array(numModels).fill(false));
    }
  }, [agentData, selectedAgentId, numModels]);

  // Simplified WebSocket initialization with minimal dependencies
  useEffect(() => {
    if (!selectedAgentId || initializationInProgress.current) {
      return;
    }

    console.log("Initializing WebSocket connections for agent", selectedAgentId);
    
    const initializeConnections = async () => {
      initializationInProgress.current = true;
      
      try {
        const callbacks = {
          ...stableCallbacks.current,
          onQuerySent: stableHandleQuerySent,
          onResponseReceived: stableHandleResponseReceived
        };

        await connectionManagerRef.current.initializeConnections(
          selectedAgentId,
          numModels,
          chatConfigs,
          callbacks
        );
        
        console.log("WebSocket connections initialized successfully");
      } catch (error) {
        console.error("Failed to initialize WebSocket connections:", error);
        toast({
          title: "Connection Error",
          description: "Failed to establish connections. Please try again.",
          variant: "destructive",
        });
      } finally {
        initializationInProgress.current = false;
      }
    };

    initializeConnections();
    
    return () => {
      console.log("Cleaning up WebSocket connections");
      connectionManagerRef.current.cleanup();
      initializationInProgress.current = false;
    };
  }, [selectedAgentId, numModels]); // Only depend on these two values

  // Update chat configs separately without reconnecting
  useEffect(() => {
    chatConfigs.forEach((config, index) => {
      connectionManagerRef.current.updateConfig(index, config);
    });
  }, [chatConfigs]);

  // Helper function to adjust colors
  const adjustColor = (color: string, amount: number): string => {
    try {
      if (!color || !color.startsWith('#') || color.length !== 7) {
        return amount > 0 ? '#33C3F0' : '#6E59A5';
      }

      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const newR = Math.max(0, Math.min(255, r + amount));
      const newG = Math.max(0, Math.min(255, g + amount));
      const newB = Math.max(0, Math.min(255, b + amount));

      return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    } catch (error) {
      console.error("Error adjusting color:", error);
      return amount > 0 ? '#33C3F0' : '#6E59A5';
    }
  };

  // Handle errors in fetching agent details
  useEffect(() => {
    if (agentData === undefined && !isLoadingAgent) {
      console.error('Error or no data fetching agent');
      toast({
        title: "Error loading agent",
        description: "Failed to load agent details",
        variant: "destructive"
      });
      
      const mockAgent = mockAgents.find(a => a.id === selectedAgentId);
      if (mockAgent) {
        const knowledgeSources: KnowledgeSource[] = mockAgent.knowledgeSources || [];
        
        setAgent({
          ...mockAgent,
          knowledgeSources
        });
        
        setChatConfigs(prev => prev.map(config => ({
          ...config,
          systemPrompt: mockAgent.systemPrompt || ""
        })));
      }
    }
  }, [agentData, isLoadingAgent, selectedAgentId, toast]);

  // Force refetch on mount and when selectedAgentId changes
  useEffect(() => {
    console.log("Component mounted or selectedAgentId changed, refetching");
    if (selectedAgentId) {
      refetchAgent();
      // Clear history when switching agents
      clearHistory();
      // Reset chat messages
      setMessages(Array(numModels).fill(null).map(() => []));
      setCellLoadingStates(Array(numModels).fill(false));
    }
  }, [selectedAgentId, refetchAgent, numModels, clearHistory]);

  const handleAgentChange = (newAgentId: string) => {
    navigate(`/agents/${newAgentId}/test`, { replace: true });
    setSelectedAgentId(newAgentId);
  };

  const handleUpdateChatConfig = (index: number, field: keyof ChatConfig, value: any) => {
    setChatConfigs(prev => {
      const newConfigs = [...prev];
      newConfigs[index] = {
        ...newConfigs[index],
        [field]: value
      };
      return newConfigs;
    });
  };

  const handleSystemPromptEdit = (index: number) => {
    setIsSystemPromptOpen(index);
  };

  const handleUpdateSystemPrompt = (value: string) => {
    if (isSystemPromptOpen !== null) {
      handleUpdateChatConfig(isSystemPromptOpen, 'systemPrompt', value);
    }
  };

  const handleClearChat = () => {
    setMessages(Array(numModels).fill(null).map(() => []));
    toast({
      title: "Chat cleared",
      description: "All messages have been cleared.",
    });
  };

  const handleViewKnowledgeSources = () => {
    setIsModalOpen(true);
  };

  const handleViewSource = (sourceId: string | number) => {
    const numericSourceId = typeof sourceId === 'string' ? parseInt(sourceId, 10) : sourceId;
    setSelectedSourceId(numericSourceId);
    setIsModalOpen(true);
  };

  const handleAddModel = () => {
    if (numModels >= 4) return;
    
    const newNumModels = numModels + 1;
    setNumModels(newNumModels);
    
    setChatConfigs(prev => [...prev, {
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      systemPrompt: "",
      maxLength: 512
    }]);
    
    setMessages(prev => [...prev, []]);
    setModelConnections(prev => [...prev, false]);
    setCellLoadingStates(prev => [...prev, false]);
    setPrimaryColors(prev => [...prev, adjustColor(prev[0], Math.random() * 60 - 30)]);
  };

  const handleRemoveModel = () => {
    if (numModels <= 1) return;
    
    const newNumModels = numModels - 1;
    setNumModels(newNumModels);
    
    setChatConfigs(prev => prev.slice(0, -1));
    setMessages(prev => prev.slice(0, -1));
    setModelConnections(prev => prev.slice(0, -1));
    setCellLoadingStates(prev => prev.slice(0, -1));
    setPrimaryColors(prev => prev.slice(0, -1));
    
    connectionManagerRef.current.cleanup();
    
    if (selectedModelIndex >= newNumModels) {
      setSelectedModelIndex(newNumModels - 1);
    }
  };

  const handleCloneConfig = (index: number) => {
    const configToClone = chatConfigs[index];
    handleAddModel();
    
    setTimeout(() => {
      setChatConfigs(prev => {
        const newConfigs = [...prev];
        newConfigs[newConfigs.length - 1] = { ...configToClone };
        return newConfigs;
      });
    }, 100);
    
    toast({
      title: "Configuration Cloned",
      description: `Model ${index + 1} configuration has been cloned to a new model.`,
    });
  };

  const handleSaveConfig = async (index: number) => {
    if (!agent) return;
    
    setIsSaving(index);
    
    try {
      const token = getAccessToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save configurations",
          variant: "destructive",
        });
        setIsSaving(null);
        return;
      }
      
      const config = chatConfigs[index];
      
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${selectedAgentId}/`), {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            response_model: config.model,
            temperature: config.temperature,
            token_length: config.maxLength,
          },
          systemPrompt: config.systemPrompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save configuration: ${response.status}`);
      }
      
      toast({
        title: "Configuration Saved",
        description: `Agent settings have been updated with ${config.model} configuration.`,
      });
      
      if (index === 0 && agent) {
        setAgent(prev => prev ? {
          ...prev,
          model: config.model,
          systemPrompt: config.systemPrompt
        } : null);
      }
      
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleSendMessage = (messageText: string) => {
    const connectedCount = connectionManagerRef.current.getConnectedCount();
    
    if (connectedCount === 0) {
      toast({
        title: "No connections",
        description: "No models are currently connected. Please wait for connections to establish.",
        variant: "destructive",
      });
      return;
    }
    
    if (connectedCount < numModels) {
      toast({
        title: "Partial connectivity",
        description: `Only ${connectedCount} out of ${numModels} models are connected. Proceeding with available connections.`,
        variant: "default",
      });
    }
    
    exitHistoryMode();
    
    const userMessage: Message = {
      id: Date.now(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(Array(numModels).fill(null).map(() => [userMessage]));
    setCellLoadingStates(Array(numModels).fill(false));
    
    for (let i = 0; i < numModels; i++) {
      if (connectionManagerRef.current.isConnected(i)) {
        try {
          setCellLoadingStates(prev => {
            const newStates = [...prev];
            newStates[i] = true;
            return newStates;
          });
          
          connectionManagerRef.current.sendMessage(i, messageText);
          console.log(`Message sent to model ${i}:`, messageText);
        } catch (error) {
          console.error(`Error sending message to model ${i}:`, error);
          setCellLoadingStates(prev => {
            const newStates = [...prev];
            newStates[i] = false;
            return newStates;
          });
          toast({
            title: "Send Error",
            description: `Failed to send message to ${chatConfigs[i]?.model}. Connection may be unstable.`,
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleLoadHistoryData = (historyItem: HistoryItem) => {
    console.log('Loading historical data:', historyItem);
    
    const historicalMessages: Message[][] = Array(numModels).fill(null).map(() => []);
    const historicalConfigs: ChatConfig[] = [...chatConfigs];
    
    historyItem.socketHistories.forEach((socketHistory) => {
      const socketIndex = socketHistory.socketIndex;
      
      if (socketIndex < numModels) {
        const userMessageId = Date.now() + socketIndex * 1000;
        const responseMessageId = Date.now() + socketIndex * 1000 + 1;
        
        const userMessage: Message = {
          id: userMessageId,
          content: historyItem.query,
          sender: 'user',
          timestamp: new Date(socketHistory.queries[0]?.timestamp || Date.now()),
        };
        
        const responseMessage: Message = {
          id: responseMessageId,
          content: socketHistory.responses[0]?.content || '',
          sender: `agent${socketIndex + 1}` as 'agent1' | 'agent2' | 'agent3',
          timestamp: new Date(socketHistory.responses[0]?.timestamp || Date.now()),
          model: socketHistory.queries[0]?.config?.response_model || '',
          avatarSrc: agent?.avatarSrc
        };
        
        historicalMessages[socketIndex] = [userMessage, responseMessage];
        
        if (socketHistory.queries[0]?.config) {
          historicalConfigs[socketIndex] = {
            ...historicalConfigs[socketIndex],
            model: socketHistory.queries[0].config.response_model,
            temperature: socketHistory.queries[0].config.temperature,
            systemPrompt: socketHistory.queries[0].config.system_prompt
          };
        }
      }
    });
    
    setMessages(historicalMessages);
    setChatConfigs(historicalConfigs);
  };

  return {
    // State
    selectedAgentId,
    agent,
    chatConfigs,
    messages,
    isModalOpen,
    isSystemPromptOpen,
    selectedSourceId,
    numModels,
    selectedModelIndex,
    allAgents,
    primaryColors,
    modelConnections,
    isSaving,
    isProcessing,
    cellLoadingStates,
    
    // History state
    history,
    isHistoryMode,
    selectedHistoryId,
    isPreparingNewMessage,
    
    // Loading states
    isLoadingAgents,
    isLoadingAgent,
    
    // Action handlers
    handleAgentChange,
    handleUpdateChatConfig,
    handleSystemPromptEdit,
    handleUpdateSystemPrompt,
    handleSendMessage,
    handleClearChat,
    handleViewKnowledgeSources,
    handleViewSource,
    setIsModalOpen,
    setIsSystemPromptOpen,
    handleSaveConfig,
    handleAddModel,
    handleRemoveModel,
    handleCloneConfig,
    handleLoadHistoryData,
    setSelectedModelIndex,
    
    // History handlers
    selectHistory,
    prepareNewMessage,
    exitHistoryMode,
    getSelectedHistoryItem,
    
    // Utilities
    refetchAgent
  };
};
