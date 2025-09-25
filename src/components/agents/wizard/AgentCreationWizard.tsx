import React, { useState } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Loader2, Sparkles, Circle, AlertTriangle, FileText, Globe, Table, AlignLeft } from 'lucide-react';
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
import { AgentTrainingService } from '@/services/AgentTrainingService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@/components/icons';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
  const [knowledgeData, setKnowledgeData] = useState(null);
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
    { id: 'knowledge', title: 'Knowledge', description: 'Complete knowledge base', number: 2 },
    { id: 'complete', title: 'Finalize', description: 'Ready to build', number: 3 }
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
          agent_category: agentType
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


  const handleTypeSelect = (type: AgentType) => {
    setSelectedType(type);
  };

  const handleCreateAgent = async () => {
    if (!selectedType) return;
    
    try {
      const agentId = await createAgent(selectedType);
      setCreatedAgentId(agentId);
      
      toast({
        title: "Agent Created",
        description: `Your ${selectedType} has been created successfully.`,
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

  const handleKnowledgeAdd = (knowledge) => {
    if (!createdAgentId) return;

    setKnowledgeData(knowledge);

    setCurrentStep('complete');
   
  };

  const handleKnowledgeSkip = () => {
    setCurrentStep('complete');
  };

  const handleTrainFromKnowledge = () => {
    setCurrentStep('complete');
  };

  const handleClose = () => {
    setCurrentStep('type');
    setSelectedType(null);
    setKnowledgeData(null);
    setCreatedAgentId(null);
    onOpenChange(false);
  };

  const handleTrainNow = async () => {
    if (!createdAgentId || !knowledgeData) return;

    setIsTraining(true);
    try {

      const success = await AgentTrainingService.trainAgent(
        createdAgentId.toString(), 
        [knowledgeData.id], 
        `Agent ${createdAgentId}`, 
        knowledgeData.urls,
        null // Pass the refetch callback here!
      );

      if (success) {
        toast({
          title: "Training Started",
          description: "Your agent is being trained with the uploaded knowledge.",
          variant: "default"
        });
        
        handleClose();
        navigate(`/agents/builder/${createdAgentId}`);
      }
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
    
    handleClose();
    navigate(`/agents/builder/${createdAgentId}`);
  };



  const renderStepsSidebar = () => (
    <div className="w-80 bg-white dark:bg-background/20 backdrop-blur-md border-r border-border/40 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Create Agent</h2>
          <p className="text-sm text-neutral-600 dark:text-muted-foreground">Follow these steps to set up your AI agent</p>
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-sm font-medium border-2 flex-shrink-0',
                index < currentStepIndex
                  ? 'bg-[#f06425] text-primary-foreground border-[#f06425]'
                  : index === currentStepIndex
                  ? 'bg-[#f06425] text-primary-foreground border-[#f06425]'
                  : 'dark:bg-background text-muted-foreground border-border'
              )}>
                {index < currentStepIndex ? (
                  step.number
                ) : index === currentStepIndex ? (
                  step.number
                ) : (
                  step.number
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium mb-1",
                  index <= currentStepIndex 
                    ? "text-foreground" 
                    : "text-neutral-400 dark:text-muted-foreground"
                )}>
                  {step.title}
                </div>
                <div className="text-xs text-neutral-400 dark:text-muted-foreground">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warning for AI Assistant */}
        {selectedType === 'assistant' && currentStep === 'type' && (
          <div className="bg-transparent rounded-xl p-0 mt-6">
            <div className="flex items-start gap-3">
              <div className='h-5 w-5'>
                <Icon type='plain' name={`Info`} color='hsl(var(--primary))' className='h-5 w-5' />
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-foreground">
                  AI Assistants cannot handle support ticket workflows. For customer support scenarios, please consider using a Chatbot.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

    const getSourceIcon = (type: string) => {
    switch (type) {
      case 'docs':
        return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'url':
        return <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'csv':
        return <Table className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'text':
        return <AlignLeft className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const renderCurrentStep = () => {
    if (isCreatingAgent) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <LoadingSpinner size="md" />
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
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <AgentTypeSelector
                selectedType={selectedType}
                onTypeSelect={handleTypeSelect}
              />
            </div>
            
            {/* Create Agent Button */}
            {selectedType && (
              <div className="flex justify-end pt-6 mt-6">
                <ModernButton 
                  onClick={handleCreateAgent}
                  disabled={!selectedType || isCreatingAgent}
                  variant='primary'
                  className=""
                >
                  {isCreatingAgent ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Create Agent
                    </>
                  )}
                </ModernButton>
              </div>
            )}
          </div>
        );
      
      case 'knowledge':
        return (
          <WizardKnowledgeUpload
            agentId={createdAgentId}
            onKnowledgeAdd={handleKnowledgeAdd}
            onSkip={handleKnowledgeSkip}
            onTrainAgent={handleTrainFromKnowledge}
          />
        );
      
      case 'complete':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="bg-transparent rounded-xl flex items-center justify-center w-full">
                <Icon type='plain' name={`Magic`} color='hsl(var(--primary))' className='h-8 w-8' />
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
