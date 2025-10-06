// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { AgentPerformanceComparison } from '@/hooks/useAdminDashboard';
import { Icon } from '../icons';

interface ConversationPerformanceCardProps {
  agentPerformanceComparison?: AgentPerformanceComparison[];
}

const ConversationPerformanceCard: React.FC<ConversationPerformanceCardProps> = ({ agentPerformanceComparison }) => {
  // Process dashboard API data to get agent performance
  const getAgentPerformanceData = () => {
    if (!agentPerformanceComparison?.length) {
      // Fallback to default data while loading or if no data
      return [
        { name: 'Agent SPSS', closed: 51, open: 45, total: 96 },
        { name: 'Agent HMIE', closed: 754, open: 255, total: 1009 },
        { name: 'Agent QCPL', closed: 354, open: 91, total: 445 }
      ];
    }

    // Transform API data to chart format
    return agentPerformanceComparison
      .map(agent => ({
        name: agent.agent_name.length > 15 ? agent.agent_name.substring(0, 15) + '...' : agent.agent_name,
        fullName: agent.agent_name,
        closed: agent.resolved || 0,
        open: agent.pending || 0,
        total: agent.conversations || 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Show top 10 agents
  };

  const agentData = getAgentPerformanceData();
  
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
      <CardHeader className="pb-6">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between flex-row-reverse gap-2 pl-0">
          <Icon type='plain' name='AreaChart' className='h-5 w-5 text-muted-foreground' color='hsl(var(--foreground))' />
          Conversation performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
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
              cursor={{ fill: "transparent" }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
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
                    <div key="closed" className="space-y-1 text-foreground">
                      <div className="flex justify-between gap-4">
                        <span>Total Conversations:</span>
                        <span className="font-medium">{agent.total}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Closed (Resolved):</span>
                        <span className="font-medium text-amber-600">{agent.closed}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Open (Unresolved):</span>
                        <span className="font-medium text-green-600">{agent.open}</span>
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
              fill="#f06425"
              radius={[0, 0, 0, 0]}
              name="Closed"
              activeBar={false}
              barSize={12}
            />
            <Bar 
              dataKey="open" 
              stackId="a"
              fill="hsl(var(--chart-6))"
              radius={[0, 4, 4, 0]}
              name="Open"
              activeBar={false}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
        
      </CardContent>
    </Card>
  );
};

export default ConversationPerformanceCard;