// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
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
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 20, right: 20, bottom: 20, left: 80 }}
          >
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              width={70}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium text-foreground mb-2">{data.fullName || data.name}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Total Conversations:</span>
                          <span className="font-medium">{data.total}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Closed (Resolved):</span>
                          <span className="font-medium text-primary">{data.closed}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Open (Unresolved):</span>
                          <span className="font-medium text-muted-foreground">{data.open}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t pt-1 mt-2">
                          <span className="text-muted-foreground">Resolution Rate:</span>
                          <span className="font-medium">{data.total > 0 ? Math.round((data.closed / data.total) * 100) : 0}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar 
              dataKey="closed" 
              stackId="a"
              fill="hsl(var(--primary))"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="open" 
              stackId="a"
              fill="hsl(var(--muted-foreground))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
        
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