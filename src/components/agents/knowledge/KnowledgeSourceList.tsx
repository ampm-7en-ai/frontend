import React from 'react';
import { ApiKnowledgeBase } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Globe, FileText, File, Database } from 'lucide-react';

interface KnowledgeSourceListProps {
  knowledgeBases: ApiKnowledgeBase[];
  isLoading?: boolean;
}

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'website':
      return <Globe className="h-4 w-4 mr-2" />;
    case 'document':
    case 'pdf':
    case 'docs':
      return <FileText className="h-4 w-4 mr-2" />;
    case 'csv':
      return <Database className="h-4 w-4 mr-2" />;
    case 'plain_text':
      return <File className="h-4 w-4 mr-2" />;
    default:
      return <File className="h-4 w-4 mr-2" />;
  }
};

const getTypeDescription = (knowledgeBase: ApiKnowledgeBase): string => {
  const { type } = knowledgeBase;
  
  const firstSource = knowledgeBase.knowledge_sources?.[0];
  if (!firstSource) return type;
  
  switch (type.toLowerCase()) {
    case 'document':
    case 'pdf':
    case 'docs':
    case 'csv':
      const fileCount = knowledgeBase.knowledge_sources.length;
      return `${fileCount} ${fileCount === 1 ? 'file' : 'files'}`;
      
    case 'website':
      const urlCount = firstSource.sub_urls?.children?.length || 0;
      return `${urlCount} ${urlCount === 1 ? 'URL' : 'URLs'}`;
      
    case 'plain_text':
      if (firstSource.metadata?.no_of_chars) {
        return `${firstSource.metadata.no_of_chars} chars`;
      }
      return type;
      
    default:
      return type;
  }
};

const getFormattedSize = (source: any) => {
  if (source.metadata?.file_size) {
    if (typeof source.metadata.file_size === 'string' && source.metadata.file_size.endsWith('B')) {
      const sizeInBytes = parseInt(source.metadata.file_size.replace('B', ''), 10);
      return formatFileSizeToMB(sizeInBytes);
    }
    return formatFileSizeToMB(source.metadata.file_size);
  }
  
  if (source.metadata?.no_of_chars) {
    return `${source.metadata.no_of_chars} chars`;
  }
  
  if (source.metadata?.no_of_rows) {
    return `${source.metadata.no_of_rows} rows`;
  }
  
  return 'N/A';
};

const formatFileSizeToMB = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const KnowledgeBaseCard = ({ knowledgeBase }: { knowledgeBase: ApiKnowledgeBase }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="border shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-4 pb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {getIconForType(knowledgeBase.type)}
              <CardTitle>{knowledgeBase.name}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                {getTypeDescription(knowledgeBase)}
              </div>
              <Badge variant={knowledgeBase.is_linked ? "default" : "outline"}>
                {knowledgeBase.is_linked ? "Linked" : "Not Linked"}
              </Badge>
              <Badge variant={knowledgeBase.training_status === 'success' ? "success" : "secondary"}>
                {knowledgeBase.training_status === 'success' ? "Trained" : 
                knowledgeBase.training_status === 'training' ? "Training" : "Untrained"}
              </Badge>
              <CollapsibleTrigger className="h-6 w-6 rounded-full inline-flex items-center justify-center text-muted-foreground">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="pl-6 border-l-2 border-gray-200 ml-2 mt-2 space-y-3">
              {knowledgeBase.knowledge_sources.map((source) => (
                <div key={source.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {getIconForType(source.metadata?.format?.toLowerCase() || knowledgeBase.type)}
                      <span className="font-medium">{source.title}</span>
                    </div>
                    <div>
                      <Badge variant={source.is_selected ? "success" : "outline"} className="mr-2">
                        {source.is_selected ? "Selected" : "Not Selected"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{getFormattedSize(source)}</span>
                    </div>
                  </div>
                  
                  {source.sub_urls?.children && source.sub_urls.children.length > 0 && (
                    <div className="mt-2 pl-6 border-l border-gray-200 space-y-2">
                      {source.sub_urls.children.map((subUrl) => (
                        <div key={subUrl.key} className="flex justify-between items-center p-2 bg-white rounded">
                          <div className="flex items-center">
                            <Globe className="h-3 w-3 mr-2 text-gray-500" />
                            <span className="text-sm">{subUrl.url}</span>
                          </div>
                          <Badge variant={subUrl.is_selected ? "success" : "outline"} className="text-xs">
                            {subUrl.is_selected ? "Selected" : "Not Selected"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const KnowledgeSourceList: React.FC<KnowledgeSourceListProps> = ({ 
  knowledgeBases,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>Loading knowledge sources...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!knowledgeBases || knowledgeBases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>No knowledge sources found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            No knowledge sources are available for this agent.
          </div>
        </CardContent>
      </Card>
    );
  }

  const linkedKnowledgeBases = knowledgeBases.filter(kb => kb.is_linked);

  return (
    <div className="space-y-4">
      {linkedKnowledgeBases.map((knowledgeBase) => (
        <KnowledgeBaseCard
          key={knowledgeBase.id}
          knowledgeBase={knowledgeBase}
        />
      ))}
    </div>
  );
};

export default KnowledgeSourceList;
