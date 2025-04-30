
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Agent, Message, ChatConfig } from '@/components/agents/modelComparison/types';
import { KnowledgeSource } from '@/components/agents/knowledge/types';
import { fetchAgentDetails, API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { ModelWebSocketService } from '@/services/ModelWebSocketService';

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
  
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId || "1");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [numModels, setNumModels] = useState(3);
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>([
    { model: "gpt-4-turbo", temperature: 0.6, systemPrompt: "", maxLength: 512 },
    { model: "gpt-3.5-turbo", temperature: 0.7, systemPrompt: "", maxLength: 512 },
    { model: "mistral-large-latest", temperature: 0.7, systemPrompt: "", maxLength: 512 }
  ]);
  const [messages, setMessages] = useState<Message[][]>([[], [], []]);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState<number | null>(null);
  const [primaryColors, setPrimaryColors] = useState<string[]>(['#9b87f5', '#33C3F0', '#6E59A5']);
  const [modelConnections, setModelConnections] = useState<boolean[]>([false, false, false]);
  const [isSaving, setIsSaving] = useState<number | null>(null); // Track which model config is being saved
  const [isProcessing, setIsProcessing] = useState(false);

  const webSocketRefs = useRef<ModelWebSocketService[]>([]);
  const webSocketsInitialized = useRef<boolean>(false);

  // Fetch all agents
  const { data: allAgents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      console.log("Fetching all agents list");
      const token = getAccessToken();
      if (!token) {
        console.error("No access token available");
        return [];
      }
      
      try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
          headers: getAuthHeaders(token)
        });

        console.log("All agents response status:", response.status);
        
        if (!response.ok) {
          console.error("Failed to fetch agents list:", response.status);
          throw new Error(`Failed to fetch agents: ${response.status}`);
        }

        const data = await response.json();
        console.log('All agents data received:', data);
        
        // Transform the API response to match our UI needs
        return data.data?.map((agent: any) => ({
          id: agent.id.toString(),
          name: agent.name,
          model: agent.model?.selectedModel || agent.model?.name || 'gpt-3.5',
          avatarSrc: agent.appearance?.avatar?.src || '',
        })) || [];
      } catch (error) {
        console.error("Error in fetchAllAgents:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      
      // Create properly typed knowledge sources
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
      
      // Extract avatar source from the agent's appearance if available
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
      
      // Extract primary color from appearance if available, or use defaults
      const primaryColor = agentData.appearance?.primaryColor || '#9b87f5';
      
      // Create color variations for each model
      const newPrimaryColors = [
        primaryColor,
        adjustColor(primaryColor, 30),
        adjustColor(primaryColor, -30)
      ];
      
      setPrimaryColors(newPrimaryColors);
      
      // Update the config but don't recreate WebSockets
      setChatConfigs(prev => prev.map((config, index) => ({
        ...config,
        systemPrompt: transformedAgent.systemPrompt || "",
        model: index === 0 ? transformedAgent.model : config.model,
        temperature: index === 0 ? (agentData.model?.temperature || 0.7) : config.temperature
      })));
      
      setMessages(Array(numModels).fill(null).map(() => []));
    }
  }, [agentData, selectedAgentId, numModels]);

  // Initialize WebSocket connections only once when agent is loaded or when agent changes
  useEffect(() => {
    if (!agent || !selectedAgentId) return;
    
    console.log("Initializing WebSocket connections for agent", selectedAgentId);
    
    // Clean up previous connections
    webSocketRefs.current.forEach(ws => {
      if (ws) ws.disconnect();
    });
    
    // Initialize new connections
    const newConnections: ModelWebSocketService[] = [];
    const connectionStatus: boolean[] = Array(numModels).fill(false);
    
    for (let i = 0; i < numModels; i++) {
      const ws = new ModelWebSocketService(selectedAgentId, chatConfigs[i], i);
      
      ws.on({
        onMessage: (message) => {
          console.log(`Received message for model ${i}:`, message);
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[i] = [...newMessages[i], {
              ...message,
              id: Date.now() + i + 1,
              sender: `agent${i+1}` as 'agent1' | 'agent2' | 'agent3',
              model: chatConfigs[i].model,
              timestamp: new Date(),
              avatarSrc: agent?.avatarSrc
            }];
            return newMessages;
          });
          // If all models have responded, set processing to false
          if (i === numModels - 1) {
            setIsProcessing(false);
          }
        },
        onTypingStart: () => {
          console.log(`Typing indicator started for model ${i}`);
        },
        onTypingEnd: () => {
          console.log(`Typing indicator ended for model ${i}`);
        },
        onError: (error) => {
          console.error(`Chat error for model ${i}:`, error);
          toast({
            title: "Connection Error",
            description: `Failed to connect model ${chatConfigs[i].model}. Please try again.`,
            variant: "destructive",
          });
          setModelConnections(prev => {
            const newStatus = [...prev];
            newStatus[i] = false;
            return newStatus;
          });
        },
        onConnectionChange: (status) => {
          console.log(`Connection status changed for model ${i}:`, status);
          setModelConnections(prev => {
            const newStatus = [...prev];
            newStatus[i] = status;
            return newStatus;
          });
        }
      });
      
      ws.connect();
      newConnections.push(ws);
    }
    
    webSocketRefs.current = newConnections;
    webSocketsInitialized.current = true;
    setModelConnections(connectionStatus);
    
    // Cleanup function
    return () => {
      console.log("Cleaning up WebSocket connections");
      webSocketRefs.current.forEach(ws => {
        if (ws) ws.disconnect();
      });
      webSocketRefs.current = [];
      webSocketsInitialized.current = false;
    };
  }, [selectedAgentId, agent, numModels]);

  // Update WebSocket configs when chat configs change,
  // but don't recreate the connections
  useEffect(() => {
    if (webSocketsInitialized.current) {
      webSocketRefs.current.forEach((ws, index) => {
        if (ws && index < chatConfigs.length) {
          ws.updateConfig(chatConfigs[index]);
        }
      });
    }
  }, [chatConfigs]);

  // Helper function to adjust colors
  const adjustColor = (color: string, amount: number): string => {
    try {
      // Default color if input is invalid
      if (!color || !color.startsWith('#') || color.length !== 7) {
        return amount > 0 ? '#33C3F0' : '#6E59A5';
      }

      // Convert hex color to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Adjust the color
      const newR = Math.max(0, Math.min(255, r + amount));
      const newG = Math.max(0, Math.min(255, g + amount));
      const newB = Math.max(0, Math.min(255, b + amount));

      // Convert back to hex
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
        // Create properly typed knowledge sources for the mock agent
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
    }
  }, [selectedAgentId, refetchAgent]);

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

  const handleSendMessage = (messageText: string) => {
    // Skip if any model is not connected
    if (modelConnections.some(status => !status)) {
      toast({
        title: "Not connected",
        description: "One or more models are not connected. Please wait.",
        variant: "destructive",
      });
      return;
    }
    
    // Skip if already processing
    if (isProcessing) {
      toast({
        title: "Processing",
        description: "Please wait for the current responses to complete.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: Date.now(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add user message to all model conversations
    setMessages(prev => prev.map(msgArray => [...msgArray, userMessage]));
    
    // Send message to all WebSocket connections
    webSocketRefs.current.forEach((ws, i) => {
      if (ws) {
        try {
          ws.sendMessage(messageText);
          console.log(`Message sent to model ${i}:`, messageText);
        } catch (error) {
          console.error(`Error sending message to model ${i}:`, error);
          toast({
            title: "Send Error",
            description: `Failed to send message to ${chatConfigs[i].model}. Please try again.`,
            variant: "destructive",
          });
        }
      }
    });
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

  const handleViewSource = (sourceId: number) => {
    setSelectedSourceId(sourceId);
    setIsModalOpen(true);
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
      
      // Update the API endpoint to use the correct path
      // API_ENDPOINTS.AGENT_DETAIL doesn't exist, so we construct the path directly
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.AGENTS}${selectedAgentId}/`), {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: {
            selectedModel: config.model,
            temperature: config.temperature,
            maxLength: config.maxLength,
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
      
      // Update the main agent model if we're saving the first model config
      if (index === 0 && agent) {
        setAgent(prev => prev ? {
          ...prev,
          model: config.model,
          systemPrompt: config.systemPrompt
        } : null);
      }
      
      // Refetch agent details to get updated data
      refetchAgent();
      
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
    allAgents,
    primaryColors,
    modelConnections,
    isSaving,
    isProcessing,
    
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
    
    // Utilities
    refetchAgent
  };
};
