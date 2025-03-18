
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AddSourceDialog from './AddSourceDialog';
import { SourceOption, SourceType } from './types';
import { FileText, Database, Globe, FileSpreadsheet, FileType } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedKnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources: number[];
  onSourcesChange: (sourceIds: number[]) => void;
}

const EnhancedKnowledgeTrainingStatus: React.FC<EnhancedKnowledgeTrainingStatusProps> = ({
  agentId,
  initialSelectedSources,
  onSourcesChange,
}) => {
  const [trainedSources, setTrainedSources] = useState<SourceOption[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const { toast } = useToast();

  const handleSourceTrained = async (sourceType: SourceType, sourceId?: number, crawlOption?: 'single' | 'children') => {
    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training process
    const totalSteps = 5;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrainingProgress((step / totalSteps) * 100);
    }

    setIsTraining(false);
    toast({
      title: "Training Complete",
      description: "Knowledge source has been successfully trained.",
    });

    // Update trained sources list (in a real app, this would come from the backend)
    setTrainedSources(prev => [...prev, {
      id: sourceId || Date.now(),
      name: `Source ${sourceId || Date.now()}`,
      type: sourceType,
      size: '1.2 MB',
      lastUpdated: new Date().toISOString(),
      description: 'Trained knowledge source'
    }]);
  };

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'url':
        return <Globe className="h-4 w-4" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'plainText':
        return <FileType className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AddSourceDialog onAddSource={handleSourceTrained} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>
            Manage and monitor your agent's knowledge sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTraining && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Training in progress...</span>
                <span>{Math.round(trainingProgress)}%</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
            </div>
          )}

          {trainedSources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainedSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSourceIcon(source.type)}
                        <span className="capitalize">{source.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{source.size}</TableCell>
                    <TableCell>{new Date(source.lastUpdated).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="success">Trained</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No knowledge sources trained yet. Add sources using the button above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedKnowledgeTrainingStatus;
