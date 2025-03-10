
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { AgentStatusCard } from '@/components/dashboard/AgentStatusCard';
import { RecentConversationsTable } from '@/components/dashboard/RecentConversationsTable';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Bot, MessageCircle, Clock, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  return (
    <MainLayout pageTitle="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard 
          title="Total Agents" 
          value="17" 
          icon={<Bot size={16} />} 
          change={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Active Conversations" 
          value="42" 
          icon={<MessageCircle size={16} />} 
          change={{ value: 8, isPositive: true }}
        />
        <StatCard 
          title="Avg. Response Time" 
          value="1.2s" 
          icon={<Clock size={16} />} 
          change={{ value: 15, isPositive: true }}
        />
        <StatCard 
          title="Resolution Rate" 
          value="87%" 
          icon={<BarChart2 size={16} />} 
          change={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ActivityChart className="lg:col-span-2" />
        <AgentStatusCard />
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <RecentConversationsTable />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <QuickActions />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
