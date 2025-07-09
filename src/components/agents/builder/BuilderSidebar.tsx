
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  Brain, 
  BookOpen, 
  MessageSquare, 
  Plus,
  Edit,
  Trash2,
  FileText,
  Link,
  Upload
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface BuilderSidebarProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const mockKnowledgeSources = [
  { id: '1', name: 'Product Documentation.pdf', type: 'file', status: 'trained' },
  { id: '2', name: 'FAQ Database', type: 'text', status: 'training' },
  { id: '3', name: 'Support Articles', type: 'url', status: 'pending' },
];

export const BuilderSidebar = ({ 
  selectedTab, 
  onTabChange, 
  isCollapsed, 
  onToggleCollapse 
}: BuilderSidebarProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddKnowledge = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 border-r border-border bg-background flex flex-col items-center py-4 space-y-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        <div className="space-y-2">
          <Button
            variant={selectedTab === 'config' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onTabChange('config')}
            className="h-8 w-8"
          >
            <Brain className="h-4 w-4" />
          </Button>
          
          <Button
            variant={selectedTab === 'knowledge' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onTabChange('knowledge')}
            className="h-8 w-8"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          
          <Button
            variant={selectedTab === 'test' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onTabChange('test')}
            className="h-8 w-8"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-lg">Agent Builder</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={onTabChange} className="h-full">
        <TabsList className="grid w-full grid-cols-3 m-4">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Config
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Test
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <TabsContent value="config" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>
                  Configure your agent's behavior and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agent Name</label>
                  <input
                    type="text"
                    placeholder="Enter agent name"
                    className="w-full px-3 py-2 border border-border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    placeholder="Describe your agent's purpose"
                    className="w-full px-3 py-2 border border-border rounded-md h-20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md">
                    <option>GPT-4</option>
                    <option>GPT-3.5 Turbo</option>
                    <option>Claude 3</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="p-4 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Knowledge Sources</CardTitle>
                  <CardDescription>
                    Add and manage knowledge sources for your agent
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleAddKnowledge}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="!mb-0 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockKnowledgeSources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {source.type === 'file' && <FileText className="h-4 w-4" />}
                        {source.type === 'url' && <Link className="h-4 w-4" />}
                        {source.type === 'text' && <Upload className="h-4 w-4" />}
                        
                        <div>
                          <p className="text-sm font-medium">{source.name}</p>
                          <Badge 
                            variant={source.status === 'trained' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {source.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Your Agent</CardTitle>
                <CardDescription>
                  Chat with your agent to test its responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-60 border border-border rounded-md p-4 bg-muted/20">
                    <p className="text-sm text-muted-foreground text-center">
                      Chat interface will appear here
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-border rounded-md"
                    />
                    <Button>Send</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
