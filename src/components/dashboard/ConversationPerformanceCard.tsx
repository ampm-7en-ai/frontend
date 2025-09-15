// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { useConversations } from '@/hooks/useConversations';
import { useConversationUtils } from '@/hooks/useConversationUtils';

interface AgentPerformance {
  name: string;
  closed: number;
  open: number;
  total: number;
}

interface ConversationPerformanceCardProps {
  agents?: AgentPerformance[];
}

const ConversationPerformanceCard: React.FC<ConversationPerformanceCardProps> = ({ agents }) => {
  const { conversations, isLoading } = useConversations();
  const { normalizeStatus } = useConversationUtils();

  // Process real conversation data to get agent performance
  const getAgentPerformanceData = () => {
    if (isLoading || !conversations.length) {
      // Fallback to default data while loading or if no data
      return [
        { name: 'Agent SPSS', closed: 51, open: 45, total: 96 },
        { name: 'Agent HMIE', closed: 754, open: 255, total: 1009 },
        { name: 'Agent QCPL', closed: 354, open: 91, total: 445 }
      ];
    }

    // Group conversations by agent
    const agentStats = conversations.reduce((acc, conversation) => {
      const agentName = conversation.agent || 'Unknown Agent';
      const normalizedStatus = normalizeStatus(conversation.status);
      
      if (!acc[agentName]) {
        acc[agentName] = { closed: 0, open: 0, total: 0 };
      }
      
      acc[agentName].total++;
      
      // Map resolved/completed to closed, everything else to open
      if (normalizedStatus === 'resolved' || normalizedStatus === 'closed') {
        acc[agentName].closed++;
      } else {
        acc[agentName].open++;
      }
      
      return acc;
    }, {} as Record<string, { closed: number; open: number; total: number }>);

    // Convert to array and sort by total conversations (descending)
    return Object.entries(agentStats)
      .map(([name, stats]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        ...stats
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Show top 10 agents
  };

  const agentData = agents || getAgentPerformanceData();
  
  // Transform data for horizontal bar chart
  const chartData = agentData.map(agent => ({
    name: agent.name,
    closed: agent.closed,
    open: agent.open,
    total: agent.total
  }));

  const chartConfig = {
    closed: {
      label: "Closed",
      color: "hsl(var(--primary))"
    },
    open: {
      label: "Open", 
      color: "hsl(var(--muted-foreground))"
    }
  };

  return (
    <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-lg h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between flex-row-reverse gap-2 pl-0">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          Conversation performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))',
                fontSize: '12px'
              }}
              labelFormatter={(label) => {
                const agent = chartData.find(a => a.name === label);
                return agent ? agent.fullName || agent.name : label;
              }}
              formatter={(value, name, props) => {
                const agent = props.payload;
                if (name === 'Closed') {
                  return [
                    <div key="closed" className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span>Total Conversations:</span>
                        <span className="font-medium">{agent.total}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Closed (Resolved):</span>
                        <span className="font-medium text-green-600">{agent.closed}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Open (Unresolved):</span>
                        <span className="font-medium text-amber-600">{agent.open}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t pt-1">
                        <span>Resolution Rate:</span>
                        <span className="font-medium">{agent.total > 0 ? Math.round((agent.closed / agent.total) * 100) : 0}%</span>
                      </div>
                    </div>,
                    ''
                  ];
                }
                return [value, name];
              }}
            />
            <Bar 
              dataKey="closed" 
              stackId="a"
              fill="#10b981" 
              radius={[0, 0, 0, 0]}
              name="Closed"
            />
            <Bar 
              dataKey="open" 
              stackId="a"
              fill="#f59e0b" 
              radius={[0, 4, 4, 0]}
              name="Open"
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="pt-4 border-t border-border">
          <button className="text-sm text-foreground hover:text-foreground/80 font-medium transition-colors hover:underline">
            See all
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationPerformanceCard;