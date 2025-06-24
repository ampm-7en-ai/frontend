
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, MessageCircle, Star, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { AgentPerformanceSummary as PerformanceSummaryType, AgentPerformanceComparison } from '@/hooks/useAdminDashboard';
import ModernTabNavigation from './ModernTabNavigation';
import ModernButton from './ModernButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgentPerformanceSummaryProps {
  agentPerformanceSummary: PerformanceSummaryType;
  agentPerformanceComparison: AgentPerformanceComparison[];
  conversationChannel: Record<string, number>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AgentPerformanceSummary: React.FC<AgentPerformanceSummaryProps> = ({
  agentPerformanceSummary,
  agentPerformanceComparison,
  conversationChannel,
}) => {
  const [activeTab, setActiveTab] = useState('Today');
  const [selectedChannel, setSelectedChannel] = useState('all');

  const timeTabs = [
    { id: 'Today', label: 'Today' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '1Y', label: '1Y' }
  ];

  const channelData = Object.entries(conversationChannel).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const formatResponseTime = (time: number) => {
    if (time < 60) return `${time}s`;
    return `${(time / 60).toFixed(1)}m`;
  };

  const getChangeIcon = (direction: string) => {
    return direction === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatResponseTime(agentPerformanceSummary.avg_response_time.value)}
                </p>
                <div className="flex items-center mt-2">
                  {getChangeIcon(agentPerformanceSummary.avg_response_time.change_direction)}
                  <span className={`text-sm font-medium ml-1 ${
                    agentPerformanceSummary.avg_response_time.change_direction === 'up' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(agentPerformanceSummary.avg_response_time.change)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Total Conversations
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {agentPerformanceSummary.total_conversations.value.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {getChangeIcon(agentPerformanceSummary.total_conversations.change_direction)}
                  <span className={`text-sm font-medium ml-1 ${
                    agentPerformanceSummary.total_conversations.change_direction === 'up' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(agentPerformanceSummary.total_conversations.change)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20">
                <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  User Satisfaction
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {agentPerformanceSummary.user_satisfaction.value}%
                </p>
                <div className="flex items-center mt-2">
                  {getChangeIcon(agentPerformanceSummary.user_satisfaction.change_direction)}
                  <span className={`text-sm font-medium ml-1 ${
                    agentPerformanceSummary.user_satisfaction.change_direction === 'up' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(agentPerformanceSummary.user_satisfaction.change)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Agent Performance Comparison */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformanceComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis 
                    dataKey="agent_name" 
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
                  />
                  <Bar 
                    dataKey="conversations" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversation Statistics */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Conversation Statistics
              </CardTitle>
              <div className="flex items-center gap-3">
                <ModernTabNavigation 
                  tabs={timeTabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  className="text-xs"
                />
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger className="w-32 h-8 text-xs rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="messenger">Messenger</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
                <ModernButton variant="outline" size="sm" icon={Download}>
                  Export
                </ModernButton>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentPerformanceSummary;
