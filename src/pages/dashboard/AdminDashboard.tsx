
import React, { useState } from 'react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import AgentPerformanceSummary from '@/components/dashboard/AgentPerformanceSummary';
import UsageStatsCard from '@/components/dashboard/UsageStatsCard';
import StatisticsCharts from '@/components/dashboard/StatisticsCharts';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import ModernButton from '@/components/dashboard/ModernButton';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RefreshCw, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { data, isLoading, error } = useAdminDashboard();
  const [activeMainTab, setActiveMainTab] = useState('dashboard');

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'reports', label: 'Reports' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center min-h-80">
        <span className="text-muted-foreground">Error loading admin dashboard.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back! Here's what's happening with your agents.</p>
          </div>
          
        </div>

        {/* Stats Cards */}
        <DashboardStatCards
          myAgents={data.my_agents}
          conversations={data.conversations}
          knowledgeBase={data.knowledge_base}
          teamMembers={data.team_members}
        />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <AgentPerformanceSummary
              agentPerformanceSummary={data.agent_performance_summary}
              agentPerformanceComparison={data.agent_performance_comparison}
              conversationChannel={data.conversation_channels}
            />
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                      Agent Performance & Satisfaction
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      Customer satisfaction by agent ({conversationActiveTab})
                    </CardDescription>
                  </div>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={agentSatisfactionData} 
                      layout="horizontal"
                      margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis 
                        type="number" 
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        className="text-slate-600 dark:text-slate-400"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        type="category"
                        dataKey="agent" 
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        className="text-slate-600 dark:text-slate-400"
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value, name) => [
                          name === 'satisfaction' ? `${value}%` : value,
                          name === 'satisfaction' ? 'Satisfaction Rate' : 'Conversations'
                        ]}
                      />
                      <Bar 
                        dataKey="satisfaction" 
                        fill="#10b981" 
                        radius={[0, 4, 4, 0]}
                        name="Satisfaction Rate"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Agent Performance Summary */}
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Top Performer</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tech Support</div>
                    <div className="text-xs text-green-600 dark:text-green-400">94% satisfaction</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Most Active</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Customer Service</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">{agentSatisfactionData[0]?.conversations} conversations</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center lg:block hidden">
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Avg Rating</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">4.5 / 5.0</div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">Across all agents</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <StatisticsCharts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
