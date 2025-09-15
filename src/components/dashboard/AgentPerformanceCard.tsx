import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, Cell } from 'recharts';
import { Users, Clock, Star, TrendingUp, TrendingDown, Bot, Heart } from 'lucide-react';
import { AgentPerformanceComparison } from '@/hooks/useAdminDashboard';
import ModernTabNavigation from './ModernTabNavigation';
import ModernButton from './ModernButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from '../icons';

interface AgentPerformanceCardProps {
  agentPerformanceComparison: AgentPerformanceComparison[];
}

const AgentPerformanceCard: React.FC<AgentPerformanceCardProps> = ({
  agentPerformanceComparison,
}) => {
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedMetric, setSelectedMetric] = useState('conversations');

  const tabs = [
    { id: 'performance', label: 'Performance' },
    { id: 'efficiency', label: 'Efficiency' },
    { id: 'satisfaction', label: 'Satisfaction' }
  ];

  // Generate performance data using actual API values
  const generatePerformanceData = () => {
    return agentPerformanceComparison.map((agent, index) => ({
      name: agent.agent_name.length > 12 ? agent.agent_name.substring(0, 12) + '...' : agent.agent_name,
      fullName: agent.agent_name,
      conversations: agent.conversations,
      responseTime: agent.avg_response_time,
      satisfaction: agent.satisfaction,
      efficiency: agent.efficiency,
      resolved: agent.resolved,
      pending: agent.pending,
      // Calculate resolution rate percentage
      resolutionRate: agent.conversations > 0 ? Math.round((agent.resolved / agent.conversations) * 100) : 0,
      // Keep CSAT as original value (0-5 or 0-10 scale)
      csat: agent.csat || 0,
      nps: agent.nps || 0,
    }));
  };

  const performanceData = generatePerformanceData();

  // Calculate summary stats
  const totalConversations = performanceData.reduce((sum, agent) => sum + agent.conversations, 0);
  const avgResponseTime = performanceData.reduce((sum, agent) => sum + agent.responseTime, 0) / performanceData.length;
  const avgSatisfaction = performanceData.reduce((sum, agent) => sum + agent.satisfaction, 0) / performanceData.length;
  const totalResolved = performanceData.reduce((sum, agent) => sum + agent.resolved, 0);

  const formatResponseTime = (time: number) => {
    if (time < 60) return `${Math.round(time)}s`;
    return `${Math.round(time / 60)}m`;
  };

  // Calculate appropriate chart height based on number of agents
  const getChartHeight = () => {
    if (activeTab === 'performance') {
      // For horizontal stacked bars, height should increase with more agents
      const baseHeight = 300;
      const barHeight = 40; // Height per agent bar
      const spacing = 8; // Spacing between bars
      const calculatedHeight = Math.max(baseHeight, (performanceData.length * (barHeight + spacing)) + 60);
      return Math.min(calculatedHeight, 600); // Cap at 600px for scrolling
    } else if (activeTab === 'efficiency') {
      // For horizontal bars, height should increase with more agents
      const baseHeight = 300;
      const additionalHeight = Math.max(0, (performanceData.length - 5) * 25);
      return Math.min(baseHeight + additionalHeight, 600); // Cap at 600px
    }
    return 300;
  };

  const renderChart = () => {
    const chartHeight = getChartHeight();
    
    if (activeTab === 'performance') {
      return (
        <div className="max-h-[600px] overflow-y-auto">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart 
              data={performanceData} 
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
                  const agent = performanceData.find(a => a.name === label);
                  return agent ? agent.fullName : label;
                }}
                formatter={(value, name, props) => {
                  const agent = props.payload;
                  if (name === 'Resolved') {
                    return [
                      <div key="resolved" className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span>Total Conversations:</span>
                          <span className="font-medium">{agent.conversations}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Resolved:</span>
                          <span className="font-medium text-green-600">{agent.resolved}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Pending:</span>
                          <span className="font-medium text-amber-600">{agent.pending}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t pt-1">
                          <span>Resolution Rate:</span>
                          <span className="font-medium">{agent.resolutionRate}%</span>
                        </div>
                      </div>,
                      ''
                    ];
                  }
                  return [value, name];
                }}
              />
              <Bar 
                dataKey="resolved" 
                stackId="a"
                fill="#10b981" 
                radius={[0, 0, 0, 0]}
                name="Resolved"
              />
              <Bar 
                dataKey="pending" 
                stackId="a"
                fill="#f59e0b" 
                radius={[0, 4, 4, 0]}
                name="Pending"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (activeTab === 'efficiency') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart 
            data={performanceData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              type="number"
              domain={[0, 100]}
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
              }}
              labelFormatter={(label) => {
                const agent = performanceData.find(a => a.name === label);
                return agent ? agent.fullName : label;
              }}
              formatter={(value, name) => {
                if (name === 'Efficiency Score') {
                  return [`${value}%`, name];
                }
                if (name === 'Avg Response Time') {
                  return [formatResponseTime(value as number), name];
                }
                return [value, name];
              }}
            />
            <Bar 
              dataKey="efficiency" 
              fill="#8b5cf6" 
              radius={[0, 4, 4, 0]}
              name="Efficiency Score"
              className="hover:fill-purple-700 dark:hover:fill-purple-800"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
              angle={performanceData.length > 10 ? -45 : 0}
              textAnchor={performanceData.length > 10 ? 'end' : 'middle'}
              height={performanceData.length > 10 ? 60 : 30}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
              domain={[0, 10]}
              label={{ value: 'CSAT Score', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
              domain={[-100, 100]}
              label={{ value: 'NPS', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))',
              }}
              labelFormatter={(label) => {
                const agent = performanceData.find(a => a.name === label);
                return agent ? agent.fullName : label;
              }}
              formatter={(value, name) => {
                if (name === 'CSAT Score') {
                  return [`${value}/10`, name];
                }
                if (name === 'NPS Score') {
                  return [`${value}`, name];
                }
                return [value, name];
              }}
            />
            <Bar 
              yAxisId="left"
              dataKey="csat" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="CSAT Score"
              className="hover:fill-blue-700 dark:hover:fill-blue-800"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="nps" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#f59e0b' }}
              name="NPS Score"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card className="bg-white dark:bg-neutral-800/60 border-0 shadow-card rounded-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ModernTabNavigation 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="text-xs"
            />
          </div>
          <div className="rounded-2xl bg-transparent">
            <Icon type='gradient' name="Chart" className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {performanceData.length > 15 && (
          <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
            <span className="font-medium">Note:</span> Showing {performanceData.length} agents. 
            {performanceData.length > 20 && " Chart is scrollable for better readability."}
          </div>
        )}
        
        {/* Chart */}
        <div className="overflow-hidden">
          {renderChart()}
        </div>

        {/* Legend for Performance Tab */}
        {activeTab === 'performance' && (
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Resolved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceCard;
