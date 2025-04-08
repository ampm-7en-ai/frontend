
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Agent, Message, ChatConfig } from '@/components/agents/modelComparison/types';
import { KnowledgeSource } from '@/components/agents/knowledge/types';
import { fetchAgentDetails, API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';

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
    { model: "llama", temperature: 0.6, systemPrompt: "", maxLength: 512 },
    { model: "deepseek", temperature: 0.7, systemPrompt: "", maxLength: 512 },
    { model: "anthropic", temperature: 0.7, systemPrompt: "", maxLength: 512 }
  ]);
  const [messages, setMessages] = useState<Message[][]>([[], [], []]);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState<number | null>(null);
  const [primaryColors, setPrimaryColors] = useState<string[]>(['#9b87f5', '#33C3F0', '#6E59A5']);

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
        return data.agents?.map((agent: any) => ({
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
        return result;
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
      
      setChatConfigs(prev => prev.map((config, index) => ({
        ...config,
        systemPrompt: transformedAgent.systemPrompt || "",
        model: index === 0 ? transformedAgent.model : config.model,
        temperature: index === 0 ? (agentData.model?.temperature || 0.7) : config.temperature
      })));
      
      setMessages(Array(numModels).fill(null).map(() => []));
    }
  }, [agentData, selectedAgentId, numModels]);

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
    const userMessage: Message = {
      id: Date.now(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => prev.map(msgArray => [...msgArray, userMessage]));
    
    for (let i = 0; i < numModels; i++) {
      setTimeout(() => {
        let responseContent = "";
        
        if (chatConfigs[i].model === "llama") {
          responseContent = "It seems like you might have entered 'CV,' which can refer to a few things, such as 'Curriculum Vitae,' a document detailing your education, work experience, and skills.\n\nIf you're looking for information on how to create a CV, I'd be happy to provide guidance. Alternatively, if 'CV' stands for something else in your context, please provide more details so I can offer a more relevant response.";
        } else if (chatConfigs[i].model === "deepseek") {
          responseContent = "Hello! It looks like you're referring to \"CV,\" which can have multiple meanings depending on the context. Here are a few common interpretations:\n\n1. Curriculum Vitae (CV):\n   • A detailed document highlighting your academic and professional history\n   • Need help crafting or reviewing a CV? Let me know!\n\n2. Computer Vision (CV):\n   • A field of artificial intelligence (AI) focused on enabling machines to interpret and analyze visual data (images, videos). Applications include facial recognition, object detection, and autonomous vehicles.\n   • Are you working on a computer vision project?\n\n3. Coefficient of Variation (CV):\n   • A statistical measure of data dispersion, calculated as the ratio of the standard deviation to the mean. It's often used to compare variability across datasets.\n   • Need help with statistics or data analysis?\n\n4. Cyclonic Vortex (CV):\n   • A meteorological term related to weather systems.";
        } else {
          responseContent = "CV could refer to:\n\n- Curriculum Vitae: A comprehensive document outlining your professional and academic history\n- Computer Vision: A field of AI that enables computers to derive meaningful information from digital images\n- Coefficient of Variation: A statistical measure\n\nCould you please specify which meaning of CV you're referring to so I can better assist you?";
        }
        
        if (chatConfigs[i].temperature > 0.8) {
          responseContent += " By the way, is there anything else you'd like to know about these topics?";
        } else if (chatConfigs[i].temperature < 0.4) {
          responseContent = responseContent.split('. ').join('.\n\n');
        }
        
        if (chatConfigs[i].maxLength < 400 && responseContent.length > chatConfigs[i].maxLength) {
          responseContent = responseContent.substring(0, chatConfigs[i].maxLength) + "...";
        }
        
        const senderType = `agent${i+1}` as 'agent1' | 'agent2' | 'agent3';
        
        const agentMessage: Message = {
          id: Date.now() + i + 1,
          content: responseContent,
          sender: senderType,
          model: chatConfigs[i].model,
          timestamp: new Date(),
          avatarSrc: agent?.avatarSrc  // Add the agent's avatar to the message
        };
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[i] = [...newMessages[i], agentMessage];
          return newMessages;
        });
      }, 1000 + (i * 500));
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

  const handleViewSource = (sourceId: number) => {
    setSelectedSourceId(sourceId);
    setIsModalOpen(true);
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
    
    // Utilities
    refetchAgent
  };
};
