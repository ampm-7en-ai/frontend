
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Import, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface KnowledgeSourcesSectionProps {
  agentId: string;
  selectedKnowledgeSources: string[];
  setSelectedKnowledgeSources: (sources: string[]) => void;
  availableKnowledgeSources: any[];
  isLoading: boolean;
}

const KnowledgeSourcesSection: React.FC<KnowledgeSourcesSectionProps> = ({
  agentId,
  selectedKnowledgeSources,
  setSelectedKnowledgeSources,
  availableKnowledgeSources,
  isLoading
}) => {
  const toggleSource = (sourceId: string) => {
    if (selectedKnowledgeSources.includes(sourceId)) {
      setSelectedKnowledgeSources(selectedKnowledgeSources.filter(id => id !== sourceId));
    } else {
      setSelectedKnowledgeSources([...selectedKnowledgeSources, sourceId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Sources</CardTitle>
        <CardDescription>Select knowledge bases for your agent to use</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading knowledge sources...</p>
          </div>
        ) : availableKnowledgeSources.length > 0 ? (
          <div className="space-y-4">
            {availableKnowledgeSources.map((source) => (
              <div 
                key={source.id} 
                className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                  selectedKnowledgeSources.includes(source.id.toString()) ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => toggleSource(source.id.toString())}
              >
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={selectedKnowledgeSources.includes(source.id.toString())} 
                    onChange={() => toggleSource(source.id.toString())}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {source.type} • {source.knowledge_sources?.length || 0} files
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={source.status === 'error' ? 'destructive' : 'outline'}
                  className="ml-2"
                >
                  {source.status === 'error' ? (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  ) : source.status === 'success' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : null}
                  {source.status || 'Available'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <p className="text-muted-foreground">No knowledge sources available</p>
            <Button variant="outline" asChild>
              <a href="/knowledge/upload">
                <Import className="h-4 w-4 mr-2" />
                Create Knowledge Base
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeSourcesSection;
