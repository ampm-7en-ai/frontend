
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
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
      resolved: agent.resolved, // Use actual API value
      pending: agent.pending, // Use actual API value
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
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
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
            />
            <Bar 
              dataKey="resolved" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              name="Resolved"
            />
            <Bar 
              dataKey="pending" 
              fill="#f59e0b" 
              radius={[4, 4, 0, 0]}
              name="Pending"
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
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
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
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
              labelFormatter={(label) => {
                const agent = performanceData.find(a => a.name === label);
                return agent ? agent.fullName : label;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="satisfaction" 
              stroke="#f59e0b" 
              fillOpacity={1} 
              fill="url(#satisfactionGradient)"
              strokeWidth={2}
              name="Satisfaction Score"
            />
          </AreaChart>
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
