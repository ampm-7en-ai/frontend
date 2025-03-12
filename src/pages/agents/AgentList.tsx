
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Settings, MessageSquare, MoreVertical, Edit, Trash2, Copy, Play, BookOpen, Search, Bookmark, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AgentList = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const agents = [
    { 
      id: '1', 
      name: 'Customer Support', 
      description: 'General customer support agent', 
      status: 'active',
      conversations: 1254,
      lastModified: '2023-12-10T14:30:00Z',
      averageRating: 4.8,
      knowledgeSources: [
        { id: 1, name: 'Product Documentation', type: 'document', icon: 'BookOpen' },
        { id: 3, name: 'Customer Support Guidelines', type: 'document', icon: 'BookOpen' }
      ],
      model: 'gpt-4',
    },
    { 
      id: '2', 
      name: 'Product Specialist', 
      description: 'Technical product information and troubleshooting', 
      status: 'active',
      conversations: 856,
      lastModified: '2023-12-05T09:15:00Z',
      averageRating: 4.6,
      knowledgeSources: [
        { id: 1, name: 'Product Documentation', type: 'document', icon: 'BookOpen' },
        { id: 4, name: 'Pricing Information', type: 'document', icon: 'BookOpen' }
      ],
      model: 'gpt-3.5',
    },
    { 
      id: '3', 
      name: 'Sales Assistant', 
      description: 'Helps with product recommendations and sales inquiries', 
      status: 'inactive',
      conversations: 532,
      lastModified: '2023-11-28T16:45:00Z',
      averageRating: 4.4,
      knowledgeSources: [
        { id: 2, name: 'FAQs', type: 'webpage', icon: 'Globe' },
        { id: 4, name: 'Pricing Information', type: 'document', icon: 'BookOpen' }
      ],
      model: 'claude-3',
    }
  ];

  const filteredAgents = agents
    .filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(agent => statusFilter === 'all' || agent.status === statusFilter);

  const renderKnowledgeSourceBadge = (source: any) => {
    return (
      <Badge key={source.id} variant="outline" className="flex items-center gap-1 mr-1 mb-1">
        <BookOpen className="h-3 w-3" />
        {source.name}
      </Badge>
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
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
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
          <TabsTrigger value="active" className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span> Active
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-400"></span> Inactive
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-1">
            <Bookmark size={14} /> Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="overflow-hidden border-t-4 hover:shadow-md transition-shadow duration-200" style={{ borderTopColor: agent.status === 'active' ? '#22c55e' : '#94a3b8' }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <div className={`p-2 rounded-full ${agent.status === 'active' ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <Bot size={18} className={agent.status === 'active' ? 'text-green-500' : 'text-gray-400'} />
                          </div>
                          {agent.name}
                        </CardTitle>
                        <CardDescription>{agent.description}</CardDescription>
                      </div>
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
                          <DropdownMenuItem asChild>
                            <Link to={`/agents/${agent.id}/test`}>
                              <Play className="h-4 w-4 mr-2" />
                              Test
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
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 text-sm mb-2">
                      <div>
                        <p className="text-muted-foreground mb-1">Status</p>
                        <Badge variant={agent.status === 'active' ? "default" : "secondary"} className="mt-1">
                          {agent.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Model</p>
                        <Badge variant="outline" className={getModelBadgeColor(agent.model)}>
                          <Brain className="h-3 w-3 mr-1" />
                          {agent.model}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Knowledge Sources</p>
                        <div className="flex flex-wrap mt-1">
                          {agent.knowledgeSources.map(renderKnowledgeSourceBadge)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 flex justify-between p-3">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/agents/${agent.id}/edit`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/agents/${agent.id}/test`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Test Chat
                      </Link>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Knowledge Sources</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bot size={16} className={agent.status === 'active' ? 'text-green-500' : 'text-gray-400'} />
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.status === 'active' ? "default" : "secondary"}>
                        {agent.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
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
                      </div>
                    </TableCell>
                    <TableCell>{agent.conversations.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/agents/${agent.id}/edit`}>
                            <Settings className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/agents/${agent.id}/test`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
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

        <TabsContent value="active">
          {/* Active agents content - similar structure as "all" but filtered for active agents */}
          <div className="text-center text-muted-foreground py-8">
            Switch to the "All" tab and use the status filter to view active agents
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          {/* Inactive agents content - similar structure as "all" but filtered for inactive agents */}
          <div className="text-center text-muted-foreground py-8">
            Switch to the "All" tab and use the status filter to view inactive agents
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          {/* Favorites agents content */}
          <div className="text-center text-muted-foreground py-8">
            You haven't marked any agents as favorites yet
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentList;
