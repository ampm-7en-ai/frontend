
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
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center min-h-80">
        <span>Error loading admin dashboard.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardStatCards
        myAgents={data.my_agents}
        conversations={data.conversations}
        knowledgeBase={data.knowledge_base}
        teamMembers={data.team_members}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentPerformanceSummary
          agentPerformanceSummary={data.agent_performance_summary}
          agentPerformanceComparison={data.agent_performance_comparison}
        />
        <UsageStatsCard
          agentUse={data.agent_use}
          usageHistory={data.usage_history}
        />
      </div>
      
      <StatisticsCharts />
    </div>
  );
};

export default AdminDashboard;
