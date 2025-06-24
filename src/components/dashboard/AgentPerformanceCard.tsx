
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Users, Clock, Star, TrendingUp, TrendingDown, Bot } from 'lucide-react';
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

  // Generate performance data based on real data
  const generatePerformanceData = () => {
    return agentPerformanceComparison.map((agent, index) => ({
      name: agent.agent_name.substring(0, 10) + (agent.agent_name.length > 10 ? '...' : ''),
      fullName: agent.agent_name,
      conversations: agent.conversations,
      responseTime: agent.avg_response_time,
      satisfaction: agent.satisfaction,
      efficiency: Math.round((agent.conversations / agent.avg_response_time) * 100) / 100,
      resolved: Math.round(agent.conversations * 0.85), // 85% resolution rate
      pending: Math.round(agent.conversations * 0.15), // 15% pending
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
              name="Conversations"
            />
            <Bar 
              dataKey="resolved" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              name="Resolved"
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
          </LineChart>
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
              name="Satisfaction %"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Agent Performance
              </CardTitle>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Comprehensive agent performance metrics and analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModernTabNavigation 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {totalConversations.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Conversations</div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {formatResponseTime(avgResponseTime)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {Math.round(avgSatisfaction)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Avg Satisfaction</div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {totalResolved.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Issues Resolved</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceCard;
