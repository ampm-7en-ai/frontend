import React, { useState } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Loader2, Sparkles, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import AgentTypeSelector, { AgentType } from './AgentTypeSelector';
import WizardKnowledgeUpload, { WizardSourceType } from './WizardKnowledgeUpload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/utils/api-config';
import { transformAgentCreationResponse } from '@/utils/agentTransformUtils';
import { updateCachesAfterAgentCreation } from '@/utils/agentCacheUtils';
import { knowledgeApi } from '@/utils/api-config';
import ModernButton from '@/components/dashboard/ModernButton';

interface AgentCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WizardStep = 'type' | 'knowledge' | 'complete';

interface KnowledgeData {
  type: WizardSourceType;
  content: any;
  name: string;
}

const AgentCreationWizard = ({ open, onOpenChange }: AgentCreationWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [selectedType, setSelectedType] = useState<AgentType | null>(null);
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeData | null>(null);
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const steps: Array<{ id: WizardStep; title: string; description: string; number: number }> = [
    { id: 'type', title: 'Agent Type', description: 'Choose your agent type', number: 1 },
    { id: 'knowledge', title: 'Knowledge', description: 'Add initial knowledge', number: 2 },
    { id: 'complete', title: 'Complete', description: 'Ready to build', number: 3 }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const createAgent = async (agentType: AgentType) => {
    if (!user?.accessToken) {
      throw new Error('Authentication required');
    }

    setIsCreatingAgent(true);
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
        method: 'POST',
        headers: getAuthHeaders(user.accessToken),
        body: JSON.stringify({
          name: `New ${agentType === 'assistant' ? 'Assistant' : 'Chatbot'} ${Date.now()}`,
          description: `A new AI ${agentType} ready to be configured.`,
          agent_type: agentType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create agent');
      }

      const transformedAgent = transformAgentCreationResponse(data);
      if (data.data) {
        updateCachesAfterAgentCreation(queryClient, data);
      }

      return data.data.id.toString();
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const addKnowledgeToAgent = async (agentId: string, knowledge: KnowledgeData) => {
    setIsAddingKnowledge(true);
    try {
      const payload: any = {
        agent_id: parseInt(agentId),
        title: knowledge.name
      };

      switch (knowledge.type) {
        case 'website':
          payload.urls = [knowledge.content];
          break;
        case 'plainText':
          payload.plain_text = knowledge.content;
          break;
        case 'document':
          if (knowledge.content.length > 0) {
            const file = knowledge.content[0];
            payload.file = file;
          }
          break;
      }

      const response = await knowledgeApi.createSource(payload);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to add knowledge');
      }

      return true;
    } finally {
      setIsAddingKnowledge(false);
    }
  };

  const handleTypeSelect = async (type: AgentType) => {
    setSelectedType(type);
    
    try {
      const agentId = await createAgent(type);
      setCreatedAgentId(agentId);
      
      toast({
        title: "Agent Created",
        description: `Your ${type} has been created successfully.`,
        variant: "default"
      });

      setCurrentStep('knowledge');
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create agent",
        variant: "destructive"
      });
    }
  };

  const handleKnowledgeAdd = async (knowledge: KnowledgeData) => {
    if (!createdAgentId) return;

    setKnowledgeData(knowledge);
    
    try {
      await addKnowledgeToAgent(createdAgentId, knowledge);
      
      toast({
        title: "Knowledge Added",
        description: "Your knowledge source has been added successfully.",
        variant: "default"
      });

      setCurrentStep('complete');
    } catch (error) {
      console.error('Error adding knowledge:', error);
      toast({
        title: "Failed to Add Knowledge",
        description: error instanceof Error ? error.message : "Failed to add knowledge",
        variant: "destructive"
      });
    }
  };

  const handleKnowledgeSkip = () => {
    setCurrentStep('complete');
  };

  const handleTrainNow = async () => {
    if (!createdAgentId) return;

    setIsTraining(true);
    try {
      onOpenChange(false);
      navigate(`/agents/builder/${createdAgentId}`);
      
      toast({
        title: "Training Started",
        description: "Your agent is being trained with the uploaded knowledge.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error starting training:', error);
      toast({
        title: "Training Failed",
        description: "Failed to start training. You can train later in the builder.",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleGoToBuilder = () => {
    if (!createdAgentId) return;
    
    onOpenChange(false);
    navigate(`/agents/builder/${createdAgentId}`);
  };

  const handleClose = () => {
    setCurrentStep('type');
    setSelectedType(null);
    setKnowledgeData(null);
    setCreatedAgentId(null);
    onOpenChange(false);
  };

  const renderStepsSidebar = () => (
    <div className="w-80 bg-background/50 dark:bg-background/20 backdrop-blur-md border-r border-border/40 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Create Agent</h2>
          <p className="text-sm text-muted-foreground">Follow these steps to set up your AI agent</p>
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium border-2 flex-shrink-0',
                index < currentStepIndex
                  ? 'bg-primary text-primary-foreground border-primary'
                  : index === currentStepIndex
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border'
              )}>
                {index < currentStepIndex ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : index === currentStepIndex ? (
                  step.number
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium mb-1",
                  index <= currentStepIndex 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (isCreatingAgent) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                Creating your agent...
              </h3>
              <p className="text-muted-foreground">
                This will only take a moment
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (isAddingKnowledge) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                Adding knowledge source...
              </h3>
              <p className="text-muted-foreground">
                Processing your knowledge for the agent
              </p>
            </div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 'type':
        return (
          <AgentTypeSelector
            selectedType={selectedType}
            onTypeSelect={handleTypeSelect}
          />
        );
      
      case 'knowledge':
        return (
          <WizardKnowledgeUpload
            onKnowledgeAdd={handleKnowledgeAdd}
            onSkip={handleKnowledgeSkip}
          />
        );
      
      case 'complete':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-foreground">
                Your Agent is Ready!
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {knowledgeData
                  ? `Your ${selectedType} has been created with initial knowledge. You can now train it or continue building.`
                  : `Your ${selectedType} has been created successfully. Let's configure it further.`
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              {knowledgeData && (
                <ModernButton
                  onClick={handleTrainNow}
                  disabled={isTraining}
                  size="lg"
                >
                  {isTraining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Training...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Train Now
                    </>
                  )}
                </ModernButton>
              )}
              
              <ModernButton
                onClick={handleGoToBuilder}
                variant={knowledgeData ? "outline" : "secondary"}
                size="lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Builder
              </ModernButton>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <ModernModal
      open={open}
      onOpenChange={handleClose}
      size="6xl"
      className="p-0 overflow-hidden"
    >
      <div className="flex min-h-[600px]">
        {renderStepsSidebar()}
        
        <div className="flex-1 p-8">
          {renderCurrentStep()}
        </div>
      </div>
    </ModernModal>
  );
};

export default AgentCreationWizard;
