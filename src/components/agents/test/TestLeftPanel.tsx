import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Bookmark,
  Cpu,
  Zap,
  Copy,
  RotateCcw,
  Gauge,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAIModels } from '@/hooks/useAIModels';

interface TestLeftPanelProps {
  agent?: any;
  onViewKnowledgeSources: () => void;
  knowledgeSourceCount: number;
  selectedModelIndex: number;
  numModels: number;
  chatConfigs: any[];
  onUpdateChatConfig: (index: number, field: string, value: any) => void;
  onSelectModel: (index: number) => void;
  onAddModel: () => void;
  onRemoveModel: () => void;
  onCloneConfig: (index: number) => void;
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

export const TestLeftPanel = ({ 
  agent, 
  onViewKnowledgeSources, 
  knowledgeSourceCount,
  selectedModelIndex,
  numModels,
  chatConfigs,
  onUpdateChatConfig,
  onSelectModel,
  onAddModel,
  onRemoveModel,
  onCloneConfig
}: TestLeftPanelProps) => {
  const [activeSection, setActiveSection] = useState('models');
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const { modelOptionsForDropdown } = useAIModels();

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
    { id: 'models', label: 'Model Configuration', icon: Cpu },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'history', label: 'Test History', icon: History },
  ];

  const currentConfig = chatConfigs[selectedModelIndex] || {};

  const configPresets = [
    {
      name: 'Creative Writing',
      icon: MessageSquare,
      config: {
        temperature: 1.2,
        maxLength: 500,
        systemPrompt: 'You are a creative writing assistant that helps with storytelling, character development, and narrative structure. Be imaginative and inspiring.'
      }
    },
    {
      name: 'Technical Support',
      icon: Settings,
      config: {
        temperature: 0.3,
        maxLength: 300,
        systemPrompt: 'You are a technical support specialist. Provide clear, step-by-step solutions and accurate technical information. Be precise and helpful.'
      }
    },
    {
      name: 'Analytical',
      icon: Brain,
      config: {
        temperature: 0.5,
        maxLength: 400,
        systemPrompt: 'You are an analytical assistant that breaks down complex problems and provides structured, logical responses with clear reasoning.'
      }
    },
    {
      name: 'Conversational',
      icon: MessageSquare,
      config: {
        temperature: 0.8,
        maxLength: 250,
        systemPrompt: 'You are a friendly conversational assistant. Be engaging, personable, and helpful while maintaining a natural dialogue tone.'
      }
    }
  ];

  const applyPreset = (preset: any) => {
    Object.entries(preset.config).forEach(([field, value]) => {
      onUpdateChatConfig(selectedModelIndex, field, value);
    });
  };

  const applyToAllModels = () => {
    for (let i = 0; i < numModels; i++) {
      if (i !== selectedModelIndex) {
        Object.entries(currentConfig).forEach(([field, value]) => {
          onUpdateChatConfig(i, field, value);
        });
      }
    }
  };

  const resetConfig = () => {
    onUpdateChatConfig(selectedModelIndex, 'temperature', 0.7);
    onUpdateChatConfig(selectedModelIndex, 'maxLength', 150);
    onUpdateChatConfig(selectedModelIndex, 'systemPrompt', '');
  };

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
        {activeSection === 'models' && (
          <div className="p-4 space-y-4">
            {/* Model Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Models</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddModel}
                    disabled={numModels >= 4}
                    className="h-7 px-2"
                  >
                    <Zap className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemoveModel}
                    disabled={numModels <= 1}
                    className="h-7 px-2"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                {Array(numModels).fill(null).map((_, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedModelIndex === index 
                        ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => onSelectModel(index)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedModelIndex === index ? 'bg-purple-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm font-medium">Model {index + 1}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloneConfig(index);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {chatConfigs[index]?.model || 'No model selected'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Configuration for Selected Model */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Configure Model {selectedModelIndex + 1}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetConfig}
                  className="h-7 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label className="text-xs">AI Model</Label>
                <Select
                  value={currentConfig.model || ''}
                  onValueChange={(value) => onUpdateChatConfig(selectedModelIndex, 'model', value)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptionsForDropdown.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Temperature</Label>
                  <Badge variant="outline" className="text-xs">
                    {(currentConfig.temperature || 0.7).toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  value={[currentConfig.temperature || 0.7]}
                  onValueChange={(value) => onUpdateChatConfig(selectedModelIndex, 'temperature', value[0])}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Controls creativity and randomness
                </p>
              </div>

              {/* Max Length */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Max Tokens</Label>
                  <Badge variant="outline" className="text-xs">
                    {currentConfig.maxLength || 150}
                  </Badge>
                </div>
                <Slider
                  value={[currentConfig.maxLength || 150]}
                  onValueChange={(value) => onUpdateChatConfig(selectedModelIndex, 'maxLength', value[0])}
                  max={4000}
                  min={50}
                  step={50}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Maximum response length
                </p>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label className="text-xs">System Prompt</Label>
                <Textarea
                  value={currentConfig.systemPrompt || ''}
                  onChange={(e) => onUpdateChatConfig(selectedModelIndex, 'systemPrompt', e.target.value)}
                  placeholder="Enter system prompt..."
                  className="min-h-20 text-xs resize-none"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Instructions for AI behavior
                </p>
              </div>
            </div>

            <Separator />

            {/* Configuration Presets */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Presets</h3>
              <div className="grid gap-2">
                {configPresets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="w-full justify-start text-xs h-auto py-2"
                    >
                      <Icon className="h-3 w-3 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          T: {preset.config.temperature}, L: {preset.config.maxLength}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Batch Operations */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Batch Operations</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyToAllModels}
                  className="w-full justify-start text-xs"
                  disabled={numModels <= 1}
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Apply to All Models
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCloneConfig(selectedModelIndex)}
                  className="w-full justify-start text-xs"
                >
                  <Zap className="h-3 w-3 mr-2" />
                  Clone Configuration
                </Button>
              </div>
            </div>
          </div>
        )}

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

      </ScrollArea>
    </div>
  );
};