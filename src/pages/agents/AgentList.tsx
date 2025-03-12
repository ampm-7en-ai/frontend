
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Search, Rocket } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgentFiltering, Agent } from '@/hooks/useAgentFiltering';
import AgentCard from '@/components/agents/AgentCard';
import AgentTable from '@/components/agents/AgentTable';

const AgentList = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Mock data - in a real app, this would come from an API
  const agents: Agent[] = [
    { 
      id: '1', 
      name: 'Customer Support', 
      description: 'General customer support agent', 
      conversations: 1254,
      lastModified: '2023-12-10T14:30:00Z',
      averageRating: 4.8,
      knowledgeSources: [
        { id: 1, name: 'Product Documentation', type: 'document', icon: 'BookOpen', hasError: false },
        { id: 2, name: 'Customer Support Guidelines', type: 'document', icon: 'BookOpen', hasError: true },
        { id: 3, name: 'FAQ Database', type: 'database', icon: 'Database', hasError: false },
        { id: 4, name: 'User Manuals', type: 'document', icon: 'BookOpen', hasError: false },
        { id: 5, name: 'Troubleshooting Guide', type: 'document', icon: 'BookOpen', hasError: true }
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

  const { 
    searchQuery, 
    setSearchQuery, 
    modelFilter, 
    setModelFilter, 
    filteredAgents, 
    getModelBadgeColor 
  } = useAgentFiltering(agents);

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
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent}
                  getModelBadgeColor={getModelBadgeColor}
                />
              ))}
            </div>
          ) : (
            <AgentTable 
              agents={filteredAgents}
              getModelBadgeColor={getModelBadgeColor}
            />
          )}
        </TabsContent>

        <TabsContent value="deployed">
          {viewMode === 'grid' ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.filter(agent => agent.isDeployed).map((agent) => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent}
                  getModelBadgeColor={getModelBadgeColor}
                />
              ))}
            </div>
          ) : (
            <AgentTable 
              agents={filteredAgents.filter(agent => agent.isDeployed)}
              getModelBadgeColor={getModelBadgeColor}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentList;
