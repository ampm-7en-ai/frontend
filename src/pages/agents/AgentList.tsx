
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Search, Rocket, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgentFiltering, Agent } from '@/hooks/useAgentFiltering';
import AgentCard from '@/components/agents/AgentCard';
import { API_ENDPOINTS, getAuthHeaders, getAccessToken, getApiUrl } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';

const AgentList = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const token = getAccessToken();
      const response = await fetch(getApiUrl(API_ENDPOINTS.AGENTS), {
        headers: getAuthHeaders(token || '')
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response to match our Agent interface
      const transformedAgents: Agent[] = data.map((agent: any) => ({
        id: agent.id.toString(), // Convert to string to match existing interface
        name: agent.name,
        description: agent.description || '',
        conversations: agent.conversations || 0,
        lastModified: agent.last_modified,
        averageRating: agent.average_rating || 0,
        knowledgeSources: agent.knowledge_bases?.map((kb: any, index: number) => ({
          id: kb.id || index,
          name: kb.name || `Source ${index + 1}`,
          type: kb.type || 'document',
          icon: 'BookOpen',
          hasError: kb.status === 'error'
        })) || [],
        model: agent.model?.name || 'gpt-3.5',
        isDeployed: agent.status === 'Live'
      }));

      setAgents(transformedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error fetching agents",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      // Set to empty array in case of error
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

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

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading agents...</span>
          </div>
        ) : (
          <>
            <TabsContent value="all" className="space-y-4">
              {filteredAgents.length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                  <Bot size={40} className="mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No agents found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || modelFilter !== 'all' 
                      ? "Try adjusting your search filters"
                      : "Create your first AI agent to get started"}
                  </p>
                  <Button>Create Agent</Button>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAgents.map((agent) => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent}
                      getModelBadgeColor={getModelBadgeColor}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="deployed">
              {filteredAgents.filter(agent => agent.isDeployed).length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                  <Rocket size={40} className="mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No deployed agents</h3>
                  <p className="text-muted-foreground mb-4">
                    Deploy an agent to make it available for your users
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAgents.filter(agent => agent.isDeployed).map((agent) => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent}
                      getModelBadgeColor={getModelBadgeColor}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default AgentList;
