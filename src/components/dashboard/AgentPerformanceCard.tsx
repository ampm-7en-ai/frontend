import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
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
      name: agent.agent_name.substring(0, 8) + (agent.agent_name.length > 8 ? '...' : ''),
      fullName: agent.agent_name,
      conversations: agent.conversations,
      responseTime: agent.avg_response_time,
      satisfaction: agent.satisfaction,
      efficiency: agent.efficiency,
      resolved: agent.resolved,
      pending: agent.pending,
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
    if (activeTab === 'efficiency') {
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
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
              angle={performanceData.length > 10 ? -45 : 0}
              textAnchor={performanceData.length > 10 ? 'end' : 'middle'}
              height={performanceData.length > 10 ? 60 : 30}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
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
            />
            <Bar 
              dataKey="conversations" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="Total Conversations"
              className="hover:fill-blue-700 dark:hover:fill-blue-800"
            />
            <Bar 
              dataKey="resolved" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              name="Resolved"
              className="hover:fill-green-700 dark:hover:fill-green-800"
            />
            <Bar 
              dataKey="pending" 
              fill="#f59e0b" 
              radius={[4, 4, 0, 0]}
              name="Pending"
              className="hover:fill-amber-700 dark:hover:fill-amber-800"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (activeTab === 'efficiency') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart 
            data={performanceData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
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
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
              angle={performanceData.length > 10 ? -45 : 0}
              textAnchor={performanceData.length > 10 ? 'end' : 'middle'}
              height={performanceData.length > 10 ? 60 : 30}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
              domain={[0, 10]}
              label={{ value: 'CSAT Score', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
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
    <Card className="bg-white dark:bg-gray-800/50 border-0 rounded-3xl overflow-hidden">
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
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {performanceData.length > 15 && (
          <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <span className="font-medium">Note:</span> Showing {performanceData.length} agents. 
            {performanceData.length > 20 && " Consider filtering for better readability."}
          </div>
        )}
        
        {/* Chart */}
        <div className="overflow-hidden">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceCard;
