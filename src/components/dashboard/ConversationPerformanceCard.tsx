// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

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
  const defaultAgents: AgentPerformance[] = [
    { name: 'Agent SPSS', closed: 51, open: 45, total: 96 },
    { name: 'Agent HMIE', closed: 754, open: 255, total: 1009 },
    { name: 'Agent QCPL', closed: 354, open: 91, total: 445 }
  ];

  const agentData = agents || defaultAgents;
  
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
              content={<ChartTooltipContent />}
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