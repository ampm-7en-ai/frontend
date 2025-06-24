
import React, { useState } from 'react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import AgentPerformanceSummary from '@/components/dashboard/AgentPerformanceSummary';
import UsageStatsCard from '@/components/dashboard/UsageStatsCard';
import StatisticsCharts from '@/components/dashboard/StatisticsCharts';
import AgentPerformanceCard from '@/components/dashboard/AgentPerformanceCard';
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
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
        <div className="space-y-8">
          {/* Top Row - Conversation Statistics and Customer Satisfaction */}
          <div className="grid grid-cols-1">
            <div className="h-full mb-6">
              <AgentPerformanceSummary
                agentPerformanceSummary={data.agent_performance_summary}
                agentPerformanceComparison={data.agent_performance_comparison}
                conversationChannel={data.conversation_channels}
              />
            </div>
            
            
          </div>

          {/* Bottom Row - Full Width Agent Performance Card */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="">
            <AgentPerformanceCard 
              agentPerformanceComparison={data.agent_performance_comparison}
            />
            </div>
            <div className="">
              <StatisticsCharts />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
