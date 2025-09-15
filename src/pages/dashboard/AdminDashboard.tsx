
import React, { useState } from 'react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import AgentPerformanceSummary from '@/components/dashboard/AgentPerformanceSummary';
import UsageStatsCard from '@/components/dashboard/UsageStatsCard';
import StatisticsCharts from '@/components/dashboard/StatisticsCharts';
import AgentPerformanceCard from '@/components/dashboard/AgentPerformanceCard';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import ModernButton from '@/components/dashboard/ModernButton';
import RepliesCreditCard from '@/components/dashboard/RepliesCreditCard';
import MonthlyRepliesCard from '@/components/dashboard/MonthlyRepliesCard';
import SatisfactionBreakdownCard from '@/components/dashboard/SatisfactionBreakdownCard';
import ConversationPerformanceCard from '@/components/dashboard/ConversationPerformanceCard';
import HandoverAnalyticsCard from '@/components/dashboard/HandoverAnalyticsCard';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RefreshCw, Settings } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
        <LoadingSpinner size="md" />
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

  // Create a mock agent_performance_summary since it's not in the API response
  const mockAgentPerformanceSummary = {
    avg_response_time: { value: 0.15, change: -5, change_direction: 'down' },
    total_conversations: { value: data.conversations, change: 12, change_direction: 'up' },
    user_satisfaction: { value: 85, change: 8, change_direction: 'up' }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[hsla(0,0%,0%,0.95)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your agents.</p>
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
        <div className="space-y-8">
          {/* Top Row - Conversation Statistics and Customer Satisfaction */}
          <div className="grid grid-cols-1">
            <div className="h-full mb-2">
              <AgentPerformanceSummary
                agentPerformanceSummary={mockAgentPerformanceSummary}
                agentPerformanceComparison={data.agent_performance_comparison}
                conversationChannel={data.conversation_channels}
                chartData={data.chart_data}
              />
            </div>
          </div>

          {/* Bottom Row - Full Width Agent Performance Card */}
          {/* <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="">
              <AgentPerformanceCard 
                agentPerformanceComparison={data.agent_performance_comparison}
              />
            </div>
            <div className="">
              <StatisticsCharts 
                satisfactionTrends={data.satisfaction_trends}
                satisfactionBreakdown={data.chart_data.satisfaction_breakdown}
              />
            </div>
          </div> */}
        </div>
        {/* New Analytics Cards Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RepliesCreditCard used={1000} total={2000} />
          <MonthlyRepliesCard />
          <SatisfactionBreakdownCard />
        </div>
        
        {/* New Analytics Cards Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConversationPerformanceCard />
          <HandoverAnalyticsCard />
        </div>
        
        
      </div>
    </div>
  );
};

export default AdminDashboard;
