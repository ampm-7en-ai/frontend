
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
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
      name: agent.agent_name.substring(0, 10) + (agent.agent_name.length > 10 ? '...' : ''),
      fullName: agent.agent_name,
      conversations: agent.conversations,
      responseTime: agent.avg_response_time,
      satisfaction: agent.satisfaction,
      efficiency: agent.efficiency,
      resolved: agent.resolved,
      pending: agent.pending,
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

  const renderChart = () => {
    if (activeTab === 'performance') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
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
              className="hover:fill-blue-700 dark:hover:fill-blue-400"
            />
            <Bar 
              dataKey="resolved" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              name="Resolved"
              className="hover:fill-green-700 dark:hover:fill-green-400"
            />
            <Bar 
              dataKey="pending" 
              fill="#f59e0b" 
              radius={[4, 4, 0, 0]}
              name="Pending"
              className="hover:fill-amber-700 dark:hover:fill-amber-400"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (activeTab === 'efficiency') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
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
            <Line 
              type="monotone" 
              dataKey="efficiency" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ r: 6, fill: '#8b5cf6' }}
              name="Efficiency Score"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
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
              dataKey="csat" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="CSAT Score"
              className="hover:fill-blue-700 dark:hover:fill-blue-400"
            />
            <Bar 
              dataKey="nps" 
              fill="#f59e0b" 
              radius={[4, 4, 0, 0]}
              name="NPS Score"
              className="hover:fill-amber-700 dark:hover:fill-amber-400"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-0 rounded-3xl overflow-hidden">
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
        
        {/* Chart */}
        <div className="h-80">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceCard;
