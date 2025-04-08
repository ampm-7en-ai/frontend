
import React, { useState } from 'react';
import { ApiKnowledgeBase, ApiKnowledgeSource } from './types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, FileText, Globe, Database, File } from 'lucide-react';
import { formatFileSizeToMB } from '@/utils/api-config';

interface CollapsibleKnowledgeSourceCardProps {
  knowledgeBase: ApiKnowledgeBase;
}

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'website':
      return <Globe className="h-4 w-4 mr-2" />;
    case 'document':
    case 'pdf':
      return <FileText className="h-4 w-4 mr-2" />;
    case 'csv':
      return <Database className="h-4 w-4 mr-2" />;
    case 'plain_text':
      return <File className="h-4 w-4 mr-2" />;
    default:
      return <File className="h-4 w-4 mr-2" />;
  }
};

const getFormattedSize = (source: ApiKnowledgeSource) => {
  if (source.metadata?.file_size) {
    // Handle file size in bytes with 'B' suffix
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

const CollapsibleKnowledgeSourceCard: React.FC<CollapsibleKnowledgeSourceCardProps> = ({ knowledgeBase }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSourceIds, setExpandedSourceIds] = useState<Record<number, boolean>>({});

  const toggleSourceExpansion = (sourceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSourceIds(prev => ({
      ...prev,
      [sourceId]: !prev[sourceId]
    }));
  };

  // Count the total number of items (including sub-sources and sub-urls)
  const calculateTotalItems = () => {
    let totalCount = 0;
    
    // Count main knowledge sources
    totalCount += knowledgeBase.knowledge_sources.length;
    
    // Count sub-knowledge sources
    knowledgeBase.knowledge_sources.forEach(source => {
      if (source.sub_knowledge_sources) {
        totalCount += source.sub_knowledge_sources.length;
      }
      
      // Count sub-urls
      if (source.sub_urls?.children) {
        const countSubUrls = (urlNode: any) => {
          let count = 0;
          if (urlNode.url && urlNode.url !== 'root') {
            count += 1;
          }
          if (urlNode.children && Array.isArray(urlNode.children)) {
            urlNode.children.forEach((child: any) => {
              count += countSubUrls(child);
            });
          }
          return count;
        };
        
        totalCount += countSubUrls(source.sub_urls);
      }
    });
    
    return totalCount;
  };

  const totalItems = calculateTotalItems();

  const renderSubUrls = (source: ApiKnowledgeSource) => {
    if (!source.sub_urls?.children || source.sub_urls.children.length === 0) {
      return null;
    }

    return (
      <div className="mt-2 pl-6 border-l border-gray-200 space-y-2">
        {source.sub_urls.children.map((subUrl) => (
          <div key={subUrl.key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div className="flex items-center">
              <Globe className="h-3 w-3 mr-2 text-gray-500" />
              <span className="text-sm truncate max-w-[300px]">{subUrl.url}</span>
            </div>
            <Badge variant={subUrl.is_selected ? "success" : "outline"} className="text-xs">
              {subUrl.is_selected ? "Selected" : "Not Selected"}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-4 pb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center">
                {getIconForType(knowledgeBase.type)}
                <span className="text-lg font-medium">{knowledgeBase.name}</span>
              </div>
              <div className="text-xs text-muted-foreground ml-6 mt-1">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                {knowledgeBase.type} • {knowledgeBase.knowledge_sources.length} source{knowledgeBase.knowledge_sources.length !== 1 ? 's' : ''}
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
                <div key={source.id} className="space-y-2">
                  <div 
                    className="p-3 bg-gray-50 rounded-md cursor-pointer"
                    onClick={(e) => toggleSourceExpansion(source.id, e)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {source.sub_urls?.children && source.sub_urls.children.length > 0 ? (
                          <span className="mr-2">
                            {expandedSourceIds[source.id] ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />}
                          </span>
                        ) : null}
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
                  </div>
                  
                  {expandedSourceIds[source.id] && renderSubUrls(source)}

                  {/* Sub knowledge sources (for CSV or document files) */}
                  {expandedSourceIds[source.id] && source.sub_knowledge_sources && source.sub_knowledge_sources.length > 0 && (
                    <div className="pl-6 border-l border-gray-200 ml-3 space-y-2">
                      {source.sub_knowledge_sources.map((subSource) => (
                        <div key={subSource.id} className="p-2 bg-gray-50 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <File className="h-3.5 w-3.5 mr-2 text-blue-500" />
                              <span className="text-sm">{subSource.title}</span>
                            </div>
                            <div>
                              <Badge variant={subSource.is_selected ? "success" : "outline"} className="text-xs">
                                {subSource.is_selected ? "Selected" : "Not Selected"}
                              </Badge>
                              {subSource.metadata?.file_size && (
                                <span className="text-xs ml-2 text-muted-foreground">
                                  {formatFileSizeToMB(subSource.metadata.file_size)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* For websites with child URLs */}
                  {expandedSourceIds[source.id] && source.sub_urls?.children && source.sub_urls.children.length > 0 && (
                    <div className="mt-2 pl-6 border-l border-gray-200 ml-3 space-y-2">
                      {source.sub_urls.children.map((child) => (
                        <div key={child.key} className="p-2 bg-gray-50 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Globe className="h-3.5 w-3.5 mr-2 text-green-600" />
                              <span className="text-sm truncate max-w-[300px]">{child.url}</span>
                            </div>
                            <Badge variant={child.is_selected ? "success" : "outline"} className="text-xs">
                              {child.is_selected ? "Selected" : "Not Selected"}
                            </Badge>
                          </div>
                          
                          {/* Second-level children if any */}
                          {child.children && child.children.length > 0 && (
                            <div className="mt-2 pl-6 border-l border-gray-200 space-y-1">
                              {child.children.map((subChild) => (
                                <div key={subChild.key} className="flex justify-between items-center p-1.5 bg-gray-100 rounded">
                                  <div className="flex items-center">
                                    <Globe className="h-3 w-3 mr-2 text-gray-500" />
                                    <span className="text-xs truncate max-w-[280px]">{subChild.url}</span>
                                  </div>
                                  <Badge variant={subChild.is_selected ? "success" : "outline"} className="text-[0.65rem] px-1.5 py-0">
                                    {subChild.is_selected ? "Selected" : "Not Selected"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
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

export default CollapsibleKnowledgeSourceCard;
