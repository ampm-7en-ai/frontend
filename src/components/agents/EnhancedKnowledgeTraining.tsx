
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useKnowledgeSources, KnowledgeSource } from '@/hooks/useKnowledgeSources';
import KnowledgeSourceActions from './KnowledgeSourceActions';
import { Badge } from '@/components/ui/badge';

interface EnhancedKnowledgeTrainingProps {
  initialSources: KnowledgeSource[];
  onSourcesChange?: (sourceIds: number[]) => void;
}

const EnhancedKnowledgeTraining = ({ 
  initialSources, 
  onSourcesChange 
}: EnhancedKnowledgeTrainingProps) => {
  const {
    knowledgeSources,
    isTrainingAll,
    trainSource,
    trainAllSources,
    removeSource,
    markSourceAsBroken,
    markSourceAsDeleted,
    canTrainAll
  } = useKnowledgeSources({ initialSources, onSourcesChange });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'training': return 'Training...';
      case 'success': return 'Trained';
      case 'failed': return 'Failed';
      default: return 'Not trained';
    }
  };

  const getStatusColor = (source: KnowledgeSource) => {
    if (source.isDeleted) return 'text-red-500';
    if (source.isBroken) return 'text-amber-500';
    
    switch (source.trainingStatus) {
      case 'success': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'training': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  // Check if the source needs individual training button
  const needsIndividualTraining = (source: KnowledgeSource) => {
    return source.trainingStatus === 'failed' || 
           source.isBroken === true || 
           source.isDeleted === true;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Knowledge Sources</h3>
        <Button 
          variant="default" 
          size="sm"
          disabled={isTrainingAll || !canTrainAll}
          onClick={() => trainAllSources()}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isTrainingAll ? 'animate-spin' : ''}`} />
          {isTrainingAll ? 'Training...' : 'Train All'}
        </Button>
      </div>

      {knowledgeSources.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No knowledge sources added yet.
        </div>
      ) : (
        <div className="space-y-2">
          {knowledgeSources.map((source) => (
            <Card 
              key={source.id} 
              className={`
                ${source.isDeleted ? 'border-red-300 bg-red-50' : ''}
                ${source.isBroken ? 'border-amber-300 bg-amber-50/50' : ''}
                ${source.trainingStatus === 'failed' && !source.isDeleted && !source.isBroken ? 'border-red-200 bg-red-50/30' : ''}
              `}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{source.name}</span>
                    {source.isDeleted && (
                      <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200">
                        Deleted
                      </Badge>
                    )}
                    {source.isBroken && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-600 border-amber-200">
                        Broken
                      </Badge>
                    )}
                    {source.trainingStatus === 'failed' && !source.isDeleted && !source.isBroken && (
                      <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200">
                        Failed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${getStatusColor(source)}`}>
                      {getStatusText(source.trainingStatus)}
                    </span>
                    <KnowledgeSourceActions 
                      sourceId={source.id}
                      onRemove={removeSource}
                      onMarkBroken={markSourceAsBroken}
                      onMarkDeleted={markSourceAsDeleted}
                    />
                  </div>
                </div>

                {source.trainingStatus === 'training' && (
                  <Progress value={source.trainingProgress} className="h-2" />
                )}

                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-muted-foreground">
                    {source.type}
                  </div>
                  
                  {/* Show individual train button only for failed sources or broken/deleted sources */}
                  {needsIndividualTraining(source) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      disabled={source.trainingStatus === 'training' || isTrainingAll}
                      onClick={() => trainSource(source.id)}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${source.trainingStatus === 'training' ? 'animate-spin' : ''}`} />
                      Train
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedKnowledgeTraining;
