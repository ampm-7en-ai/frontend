
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, MessageSquare, MoreVertical, Edit, Trash2, Copy, Play, BookOpen, Search, Bookmark, Brain, AlertTriangle, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AgentList = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('all');

  const agents = [
    { 
      id: '1', 
      name: 'Customer Support', 
      description: 'General customer support agent', 
      conversations: 1254,
      lastModified: '2023-12-10T14:30:00Z',
      averageRating: 4.8,
      knowledgeSources: [
        { id: 1, name: 'Product Documentation', type: 'document', icon: 'BookOpen', hasError: false },
        { id: 3, name: 'Customer Support Guidelines', type: 'document', icon: 'BookOpen', hasError: true }
      ],
      model: 'gpt-4',
      isDeployed: false
    },
    { 
      id: '2', 
      name: 'Product Specialist', 
      description: 'Technical product information and troubleshooting', 
      conversations: 856,
      lastModified: '2023-12-05T09:15:00Z',
      averageRating: 4.6,
      knowledgeSources: [
        { id: 1, name: 'Product Documentation', type: 'document', icon: 'BookOpen', hasError: false },
        { id: 4, name: 'Pricing Information', type: 'document', icon: 'BookOpen', hasError: false }
      ],
      model: 'gpt-3.5',
      isDeployed: true
    },
    { 
      id: '3', 
      name: 'Sales Assistant', 
      description: 'Helps with product recommendations and sales inquiries', 
      conversations: 532,
      lastModified: '2023-11-28T16:45:00Z',
      averageRating: 4.4,
      knowledgeSources: [
        { id: 2, name: 'FAQs', type: 'webpage', icon: 'Globe', hasError: true },
        { id: 4, name: 'Pricing Information', type: 'document', icon: 'BookOpen', hasError: false }
      ],
      model: 'claude-3',
      isDeployed: false
    }
  ];

  const filteredAgents = agents
    .filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(agent => modelFilter === 'all' || agent.model === modelFilter);

  const renderKnowledgeSourceBadge = (source: any) => {
    return (
      <TooltipProvider key={source.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center gap-1 px-2 py-1 mr-2 mb-2 rounded-md text-xs ${
              source.hasError 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {source.hasError ? (
                <AlertTriangle className="h-3 w-3 text-red-500" />
              ) : (
                <BookOpen className="h-3 w-3" />
              )}
              {source.name}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {source.hasError 
              ? 'Knowledge source needs retraining' 
              : `Type: ${source.type}`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getModelBadgeColor = (model: string) => {
    switch(model) {
      case 'gpt-4': return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'gpt-3.5': return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'claude-3': return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default: return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
        <p className="text-muted-foreground">Manage and create your AI agents</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select 
            value={modelFilter} 
            onValueChange={setModelFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
              <SelectItem value="claude-3">Claude-3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button 
              variant={viewMode === 'grid' ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className="px-2 py-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grid-2x2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
            </Button>
            <Button 
              variant={viewMode === 'table' ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode('table')}
              className="px-2 py-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            </Button>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Bot size={14} /> All Agents
          </TabsTrigger>
          <TabsTrigger value="deployed" className="flex items-center gap-1">
            <Rocket size={14} /> Deployed
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex items-center gap-1">
            <Edit size={14} /> Draft
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-1">
            <Bookmark size={14} /> Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Bot size={18} className="text-primary" />
                          </div>
                          {agent.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {agent.isDeployed && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            <Rocket className="h-3 w-3 mr-1" />
                            Live
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/agents/${agent.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <Badge variant="outline" className={getModelBadgeColor(agent.model)}>
                          <Brain className="h-3 w-3 mr-1" />
                          {agent.model}
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-2 text-muted-foreground">Knowledge Sources</div>
                        <div className="flex flex-wrap">
                          {agent.knowledgeSources.map(renderKnowledgeSourceBadge)}
                        </div>
                        
                        {agent.knowledgeSources.some(source => source.hasError) && (
                          <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Some knowledge sources need retraining
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm flex items-center justify-between text-muted-foreground">
                        <div>
                          <span className="font-medium">{agent.conversations.toLocaleString()}</span> conversations
                        </div>
                        <div>
                          Last updated: {new Date(agent.lastModified).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between gap-2 p-4 pt-2 mt-2 border-t bg-muted/30">
                    <Button variant="outline" size="sm" className="w-1/2" asChild>
                      <Link to={`/agents/${agent.id}/test`}>
                        <Play className="h-4 w-4 mr-1" />
                        Test
                      </Link>
                    </Button>
                    <Button variant={agent.isDeployed ? "secondary" : "default"} size="sm" className="w-1/2">
                      <Rocket className="h-4 w-4 mr-1" />
                      {agent.isDeployed ? 'Deployed' : 'Deploy'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Knowledge Sources</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bot size={16} className="text-primary" />
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getModelBadgeColor(agent.model)}>
                        <Brain className="h-3 w-3 mr-1" />
                        {agent.model}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap">
                        {agent.knowledgeSources.map(renderKnowledgeSourceBadge)}
                        {agent.knowledgeSources.some(source => source.hasError) && (
                          <div className="w-full mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Needs retraining
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{agent.conversations.toLocaleString()}</TableCell>
                    <TableCell>
                      {agent.isDeployed ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          <Rocket className="h-3 w-3 mr-1" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/agents/${agent.id}/test`}>
                            <Play className="h-4 w-4 mr-1" />
                            Test
                          </Link>
                        </Button>
                        <Button 
                          variant={agent.isDeployed ? "secondary" : "default"} 
                          size="sm"
                        >
                          <Rocket className="h-4 w-4 mr-1" />
                          {agent.isDeployed ? 'Deployed' : 'Deploy'}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/agents/${agent.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="deployed">
          <div className="text-center text-muted-foreground py-8">
            Switch to the "All" tab and use the filter to view deployed agents
          </div>
        </TabsContent>

        <TabsContent value="draft">
          <div className="text-center text-muted-foreground py-8">
            Switch to the "All" tab and use the filter to view draft agents
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="text-center text-muted-foreground py-8">
            You haven't marked any agents as favorites yet
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentList;
