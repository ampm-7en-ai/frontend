import React, { useState } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { useAuth } from '@/context/AuthContext';
import { useFloatingToast } from '@/context/FloatingToastContext';
import { CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@/components/icons';
import KnowledgeUploadEngine from '@/components/knowledge/KnowledgeUploadEngine';

interface KnowledgeSource {
  id: number;
  title: string;
  type: string;
  status: string;
  urls: string[];
  file?: string;
  metadata?: {
    format?: string;
    file_size?: string;
    upload_date?: string;
  };
}

interface WizardKnowledgeUploadProps {
  agentId: string | null;
  onKnowledgeAdd: (data: any) => void;
  onSkip: () => void;
  onTrainAgent: () => void;
}

const WizardKnowledgeUpload = ({ agentId, onKnowledgeAdd, onSkip, onTrainAgent }: WizardKnowledgeUploadProps) => {
  const { user } = useAuth();
  const { showToast } = useFloatingToast();
  const [addedSources, setAddedSources] = useState<KnowledgeSource[]>([]);
  const [knowledgeSourceIds, setKnowledgeSourceIds] = useState<number[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  const handleSuccess = (sources: any[]) => {
    console.log('✅ Knowledge sources added successfully:', sources);
    
    // Transform sources to the expected format
    const transformedSources = sources.map(source => ({
      id: source.id || Math.random(),
      title: source.title || 'New Source',
      type: source.type || 'document',
      status: source.status || 'processing',
      urls: source.urls || [],
      file: source.file,
      metadata: source.metadata || {}
    }));

    setAddedSources(prev => [...prev, ...transformedSources]);
    setKnowledgeSourceIds(prev => [...prev, ...transformedSources.map(s => s.id)]);
    
    showToast({
      title: "Knowledge Source Added",
      description: "Your knowledge source has been uploaded successfully. You can add more sources or proceed to train your agent.",
      variant: "success"
    });
  };

  const handleTrainAgent = async () => {
    if (!agentId) {
      showToast({
        title: "Error",
        description: "No agent ID provided for training",
        variant: "error"
      });
      return;
    }

    setIsTraining(true);
    try {
      const { AgentTrainingService } = await import('@/services/AgentTrainingService');
      await AgentTrainingService.trainAgent(agentId, knowledgeSourceIds, 'Agent', []);
      
      showToast({
        title: "Training Started",
        description: "Your agent is now being trained with the uploaded knowledge sources.",
        variant: "success"
      });
      
      onTrainAgent();
    } catch (error) {
      console.error('Training error:', error);
      showToast({
        title: "Training Failed",
        description: "Failed to start agent training. Please try again.",
        variant: "error"
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add Knowledge Sources</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Upload documents, websites, or connect integrations to give your agent knowledge to work with. 
          You can add multiple sources and train your agent when ready.
        </p>
      </div>

      {/* Knowledge Upload Engine */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <KnowledgeUploadEngine
          mode="wizard"
          agentId={agentId || undefined}
          onSuccess={handleSuccess}
          onCancel={onSkip}
          showAgentSelector={false}
          allowMultipleUpload={true}
          showBackButton={false}
          showTitle={false}
        />
      </div>

      {/* Added Sources Display */}
      {addedSources.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Added Sources ({addedSources.length})
            </h3>
          </div>
          
          <ScrollArea className="max-h-48">
            <div className="space-y-3">
              {addedSources.map((source, index) => (
                <div key={source.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Icon 
                      name={source.type === 'url' ? 'Layer' : source.type === 'document' ? 'TextFile' : 'Folder'} 
                      type='plain' 
                      color='hsl(var(--primary))' 
                      className="h-4 w-4" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{source.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{source.type}</p>
                  </div>
                  <div className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full">
                    Added
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <ModernButton 
          variant="outline" 
          onClick={onSkip}
          disabled={isTraining}
        >
          {addedSources.length > 0 ? 'Skip Training' : 'Skip Knowledge Upload'}
        </ModernButton>
        
        {addedSources.length > 0 && (
          <ModernButton 
            onClick={handleTrainAgent}
            disabled={isTraining || !agentId}
            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
          >
            {isTraining ? 'Starting Training...' : 'Train Agent'}
          </ModernButton>
        )}
      </div>
    </div>
  );
};

export default WizardKnowledgeUpload;