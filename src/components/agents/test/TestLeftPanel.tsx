
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Database,
  Book,
  FileText,
  Plus,
  Eye
} from 'lucide-react';

interface TestLeftPanelProps {
  agent?: any;
  onViewKnowledgeSources: () => void;
  knowledgeSourceCount: number;
}

export const TestLeftPanel = ({ 
  agent,
  onViewKnowledgeSources,
  knowledgeSourceCount
}: TestLeftPanelProps) => {
  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Knowledge Base</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">Agent knowledge sources</p>
          </div>
        </div>
      </div>

      {/* Knowledge Sources Section */}
      <ScrollArea className="flex-1 p-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Book className="h-4 w-4" />
                Knowledge Sources
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {knowledgeSourceCount}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This agent has access to {knowledgeSourceCount} knowledge sources to provide accurate and contextual responses.
            </p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onViewKnowledgeSources}
              className="w-full justify-start text-xs"
            >
              <Eye className="h-3 w-3 mr-2" />
              View All Sources
            </Button>

            {/* Knowledge Sources Preview */}
            {agent?.knowledgeSources?.slice(0, 3).map((source: any, index: number) => (
              <div key={source.id || index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <FileText className="h-4 w-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {source.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {source.type} • {source.size}
                  </p>
                </div>
              </div>
            ))}

            {knowledgeSourceCount > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{knowledgeSourceCount - 3} more sources
              </p>
            )}
          </CardContent>
        </Card>

        {/* Agent Info */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Agent Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Agent:</span>
              <span className="font-medium">{agent?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Base Model:</span>
              <span className="font-medium">{agent?.model || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <Badge variant={agent?.isDeployed ? "default" : "secondary"} className="text-xs">
                {agent?.isDeployed ? 'Live' : 'Draft'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
};
