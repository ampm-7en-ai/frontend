import React, { useState } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-sm',
              index < currentStepIndex
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-200'
                : index === currentStepIndex
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
            )}>
              {index < currentStepIndex ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                step.number
              )}
            </div>
            <div className="text-center mt-3 max-w-[100px]">
              <div className={cn(
                "text-sm font-medium transition-colors duration-200",
                index <= currentStepIndex 
                  ? "text-slate-900 dark:text-slate-100" 
                  : "text-slate-400 dark:text-slate-500"
              )}>
                {step.title}
              </div>
              <div className={cn(
                "text-xs mt-0.5 transition-colors duration-200",
                index <= currentStepIndex 
                  ? "text-slate-500 dark:text-slate-400" 
                  : "text-slate-400 dark:text-slate-500"
              )}>
                {step.description}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              'w-24 h-0.5 mx-6 mb-8 transition-colors duration-300',
              index < currentStepIndex
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                : 'bg-slate-200 dark:bg-slate-700'
            )} />
          )}
        </div>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
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
          <div className="text-center space-y-8 py-8">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/50">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 rounded-3xl blur-xl"></div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Your Agent is Ready!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
                {knowledgeData
                  ? `Your ${selectedType} has been created with initial knowledge. You can now train it or continue building.`
                  : `Your ${selectedType} has been created successfully. Let's configure it further.`
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {knowledgeData && (
                <Button
                  onClick={handleTrainNow}
                  disabled={isTraining}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200/30 dark:shadow-emerald-900/30 border-0"
                >
                  {isTraining ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Training...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Train Now
                    </>
                  )}
                </Button>
              )}
              
              <Button
                onClick={handleGoToBuilder}
                variant={knowledgeData ? "outline" : "default"}
                size="lg"
                className={cn(
                  "shadow-md",
                  !knowledgeData && "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
                )}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Go to Builder
              </Button>
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
      title="Create New Agent"
      description="Set up your AI agent in just a few steps"
      size="3xl"
      className="max-w-5xl"
    >
      <div className="space-y-8 px-2">
        {renderStepIndicator()}
        
        <div className="min-h-[500px]">
          {isCreatingAgent && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl blur-xl animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Creating your agent...
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    This will only take a moment
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isAddingKnowledge && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-3xl blur-xl animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Adding knowledge source...
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Processing your knowledge for the agent
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {!isCreatingAgent && !isAddingKnowledge && renderCurrentStep()}
        </div>
      </div>
    </ModernModal>
  );
};

export default AgentCreationWizard;
