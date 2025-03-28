import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KnowledgeSourceModal from '@/components/agents/knowledge/KnowledgeSourceModal';
import { Agent, ChatConfig, Message } from '@/components/agents/modelComparison/types';
import { ModelComparisonCard } from '@/components/agents/modelComparison/ModelComparisonCard';
import { ChatInput } from '@/components/agents/modelComparison/ChatInput';
import { SystemPromptDialog } from '@/components/agents/modelComparison/SystemPromptDialog';

const MODELS = {
  'gpt4': { name: 'GPT-4', provider: 'OpenAI' },
  'gpt35': { name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  'anthropic': { name: 'Claude 3', provider: 'Anthropic' },
  'mistral': { name: 'Mistral 7B', provider: 'Mistral AI' },
  'llama': { name: 'Llama-3.1-70B-Instruct', provider: 'Meta AI' },
  'gemini': { name: 'Gemini Pro', provider: 'Google' },
  'mixtral': { name: 'Mixtral 8x7B', provider: 'Mistral AI' },
  'deepseek': { name: 'DeepSeek-R1', provider: 'DeepSeek' }
};

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Customer Support Agent",
    description: "Helps with product questions and customer service inquiries",
    conversations: 1234,
    lastModified: new Date().toISOString(),
    averageRating: 4.8,
    knowledgeSources: [
      { id: 1, name: "Product Docs", type: "document", icon: "BookOpen", hasError: false, 
        content: "# Product Documentation\n\nOur product is a cloud-based solution that helps businesses automate customer support workflows. Key features include:\n\n- AI-powered response suggestions\n- Integration with popular CRM systems\n- Analytics dashboard\n- Multi-channel support (email, chat, social media)" },
      { id: 2, name: "FAQ", type: "webpage", icon: "Globe", hasError: false,
        content: "## Frequently Asked Questions\n\n**Q: How do I reset my password?**\nA: Click on the 'Forgot Password' link on the login page and follow the instructions sent to your email.\n\n**Q: How do I upgrade my subscription?**\nA: Go to Settings > Billing and select your desired plan.\n\n**Q: Can I integrate with Salesforce?**\nA: Yes, we offer native integration with Salesforce and other popular CRM systems." }
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
      { id: 3, name: "Pricing Guide", type: "document", icon: "DollarSign", hasError: false,
        content: "# Pricing Guide\n\n## Basic Plan - $9.99/month\n- Up to 5 users\n- Core features\n- Email support\n\n## Pro Plan - $29.99/month\n- Unlimited users\n- All core features plus advanced analytics\n- Priority email & chat support\n- API access\n\n## Enterprise Plan - Custom pricing\n- All Pro features\n- Dedicated account manager\n- Custom integrations\n- 24/7 phone support" }
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
      { id: 4, name: "Technical Manual", type: "document", icon: "FileText", hasError: false,
        content: "# Technical Manual\n\n## System Requirements\n- Operating System: Windows 10/11, macOS 10.14+, Linux\n- RAM: 8GB minimum, 16GB recommended\n- Disk Space: 250MB\n- Internet: Broadband connection\n\n## Installation Guide\n1. Download the installer from your account dashboard\n2. Run the installer and follow on-screen instructions\n3. Launch the application and sign in with your credentials" },
      { id: 5, name: "Troubleshooting Guide", type: "document", icon: "Tool", hasError: false,
        content: "# Troubleshooting Guide\n\n## Common Issues\n\n### Application Won't Start\n- Verify system requirements\n- Check for conflicting software\n- Try reinstalling the application\n\n### Connection Problems\n- Check your internet connection\n- Verify firewall settings\n- Ensure the server is not down for maintenance" }
    ],
    model: "anthropic",
    isDeployed: true,
    systemPrompt: "You are a technical support specialist. Your goal is to help users troubleshoot and resolve technical issues with our products. Be precise, thorough, and explain technical concepts clearly."
  }
];

const AgentTest = () => {
  const { agentId } = useParams();
  const { toast } = useToast();
  
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agentId || "1");
  const [agent, setAgent] = useState<Agent | null>(null);
  
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>([
    { model: "llama", temperature: 0.6, systemPrompt: "", maxLength: 512 },
    { model: "deepseek", temperature: 0.7, systemPrompt: "", maxLength: 512 },
    { model: "anthropic", temperature: 0.7, systemPrompt: "", maxLength: 512 }
  ]);

  const [numModels, setNumModels] = useState(3);
  
  const [messages, setMessages] = useState<Message[][]>([[], [], []]);
  const [inputMessage, setInputMessage] = useState('');
  
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState<number | null>(null);

  useEffect(() => {
    const foundAgent = mockAgents.find(a => a.id === selectedAgentId);
    if (foundAgent) {
      setAgent(foundAgent);
      
      setChatConfigs(prev => prev.map(config => ({
        ...config,
        systemPrompt: foundAgent.systemPrompt || ""
      })));
      
      setMessages(Array(numModels).fill(null).map(() => []));
    }
  }, [selectedAgentId]);

  const handleAgentChange = (newAgentId: string) => {
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

  const getModelDisplay = (modelKey: string) => {
    return MODELS[modelKey as keyof typeof MODELS]?.name || modelKey;
  };

  const adjustColor = (color: string, amount: number): string => {
    return color;
  };

  const handleUpdateSystemPrompt = (value: string) => {
    if (isSystemPromptOpen !== null) {
      handleUpdateChatConfig(isSystemPromptOpen, 'systemPrompt', value);
    }
  };

  if (!agent) {
    return <div className="p-8 text-center">Loading agent information...</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/agents">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">AI Playground</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={selectedAgentId} 
            onValueChange={handleAgentChange}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {mockAgents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center">
                    <Bot className="mr-2 h-4 w-4 text-primary" />
                    {agent.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearChat}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(numModels).fill(null).map((_, index) => {
          const primaryColor = index === 0 ? '#9b87f5' : index === 1 ? '#33C3F0' : '#6E59A5';
          
          return (
            <ModelComparisonCard
              key={`model-${index}`}
              index={index}
              model={chatConfigs[index].model}
              temperature={chatConfigs[index].temperature}
              maxLength={chatConfigs[index].maxLength}
              systemPrompt={chatConfigs[index].systemPrompt}
              messages={messages[index]}
              onModelChange={(value) => handleUpdateChatConfig(index, 'model', value)}
              onOpenSystemPrompt={() => handleSystemPromptEdit(index)}
              onUpdateConfig={(field, value) => handleUpdateChatConfig(index, field, value)}
              modelOptions={MODELS}
              primaryColor={primaryColor}
            />
          );
        })}
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage}
        onViewKnowledgeSources={handleViewKnowledgeSources}
        knowledgeSourceCount={agent.knowledgeSources.length}
      />

      <SystemPromptDialog 
        open={isSystemPromptOpen !== null}
        onOpenChange={() => setIsSystemPromptOpen(null)}
        modelIndex={isSystemPromptOpen}
        modelName={isSystemPromptOpen !== null ? getModelDisplay(chatConfigs[isSystemPromptOpen].model) : ''}
        systemPrompt={isSystemPromptOpen !== null ? chatConfigs[isSystemPromptOpen].systemPrompt : ''}
        onUpdateSystemPrompt={handleUpdateSystemPrompt}
      />

      <KnowledgeSourceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        sources={agent.knowledgeSources}
        initialSourceId={selectedSourceId}
      />
    </div>
  );
};

export default AgentTest;

function getSourceIcon(type: string) {
  return null;
}
