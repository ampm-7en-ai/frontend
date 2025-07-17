import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  History, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  File,
  Globe,
  FileText,
  Brain,
  Clock,
  Bookmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestLeftPanelProps {
  agent?: any;
  onViewKnowledgeSources: () => void;
  knowledgeSourceCount: number;
}

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'website':
      return Globe;
    case 'document':
    case 'pdf':
      return FileText;
    case 'csv':
      return Database;
    case 'plain_text':
      return File;
    default:
      return File;
  }
};

const getBadgeForStatus = (status: string) => {
  switch (status) {
    case 'Active':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 border-green-200">Trained</Badge>;
    case 'Training':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">Training</Badge>;
    case 'Issues':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 border-yellow-200">Issues</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px] px-2 py-0.5">Untrained</Badge>;
  }
};

export const TestLeftPanel = ({ agent, onViewKnowledgeSources, knowledgeSourceCount }: TestLeftPanelProps) => {
  const [activeSection, setActiveSection] = useState('knowledge');
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());

  const toggleSourceExpansion = (sourceId: number) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
    }
    setExpandedSources(newExpanded);
  };

  const sections = [
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'history', label: 'Test History', icon: History },
    { id: 'settings', label: 'Test Settings', icon: Settings },
  ];

  if (!agent) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Agent Selected
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Select an agent from the toolbar to view its knowledge base and testing options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{agent.name}</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">{agent.description || 'AI Assistant'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => setActiveSection(section.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {activeSection === 'knowledge' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Knowledge Sources</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewKnowledgeSources}
                className="text-xs"
              >
                Manage
              </Button>
            </div>

            {knowledgeSourceCount === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-4">
                    <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No knowledge sources</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onViewKnowledgeSources}
                      className="mt-2"
                    >
                      Add Sources
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {agent.knowledgeSources?.slice(0, 5).map((source: any) => {
                  const IconComponent = getIconForType(source.type);
                  const isExpanded = expandedSources.has(source.id);
                  
                  return (
                    <Card key={source.id} className="transition-all duration-200">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => toggleSourceExpansion(source.id)}
                          >
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </Button>
                          
                          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md">
                            <IconComponent className="h-3 w-3 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                              {source.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400">{source.type}</span>
                              {getBadgeForStatus(source.trainingStatus)}
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-2 pl-7 space-y-1">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <div>Size: {source.size}</div>
                              <div>Updated: {source.lastUpdated}</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                
                {agent.knowledgeSources?.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewKnowledgeSources}
                    className="w-full text-xs"
                  >
                    View all {knowledgeSourceCount} sources
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {activeSection === 'history' && (
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent Test Sessions</h3>
            
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Clock className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          Test Session {i}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(Date.now() - i * 3600000).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(Math.random() * 20 + 5)} msgs
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button variant="outline" size="sm" className="w-full text-xs">
              View All Sessions
            </Button>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Test Configuration</h3>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Auto-scroll</span>
                  <Badge variant="outline" className="text-xs">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Response time</span>
                  <Badge variant="outline" className="text-xs">Show</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Token usage</span>
                  <Badge variant="outline" className="text-xs">Track</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Test Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['General Q&A', 'Technical Support', 'Product Info'].map((template) => (
                  <Button key={template} variant="outline" size="sm" className="w-full justify-start text-xs">
                    <Bookmark className="h-3 w-3 mr-2" />
                    {template}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};