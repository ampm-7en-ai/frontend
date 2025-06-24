
import React from 'react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import AgentPerformanceSummary from '@/components/dashboard/AgentPerformanceSummary';
import UsageStatsCard from '@/components/dashboard/UsageStatsCard';
import StatisticsCharts from '@/components/dashboard/StatisticsCharts';
import { Card, CardContent } from '@/components/ui/card';

const AdminDashboard = () => {
  const { data, isLoading, error } = useAdminDashboard();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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
            <StatisticsCharts />
          </div>
          
          <div className="space-y-8">
            <UsageStatsCard
              agentUse={data.agent_use}
              usageHistory={data.usage_history}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
