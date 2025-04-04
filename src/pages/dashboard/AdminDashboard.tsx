
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import AgentPerformanceSummary from '@/components/dashboard/AgentPerformanceSummary';
import UsageStatsCard from '@/components/dashboard/UsageStatsCard';
import StatisticsCharts from '@/components/dashboard/StatisticsCharts';
import KnowledgeStatsCard from '@/components/dashboard/KnowledgeStatsCard';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <DashboardStatCards />
      
      <KnowledgeStatsCard />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentPerformanceSummary />
        <UsageStatsCard />
      </div>
      
      <StatisticsCharts />
    </div>
  );
};

export default AdminDashboard;
