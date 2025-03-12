
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { AgentStatusCard } from '@/components/dashboard/AgentStatusCard';
import { RecentConversationsTable } from '@/components/dashboard/RecentConversationsTable';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Bot, MessageCircle, Clock, BarChart2, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <MainLayout pageTitle="Business Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard 
          title="Active Agents" 
          value="8" 
          icon={<Bot size={16} />} 
          change={{ value: 2, isPositive: true }}
        />
        <StatCard 
          title="Team Members" 
          value="12" 
          icon={<Users size={16} />} 
          change={{ value: 1, isPositive: true }}
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conversation Analytics</CardTitle>
            <CardDescription>User engagement over the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart className="h-[250px]" />
          </CardContent>
        </Card>
        
        <AgentStatusCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Latest customer interactions with your agents</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentConversationsTable />
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link to="/conversations">View All Conversations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>Effectiveness by agent</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="usage">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="usage" className="flex-1">Usage</TabsTrigger>
                <TabsTrigger value="satisfaction" className="flex-1">Satisfaction</TabsTrigger>
              </TabsList>
              
              <TabsContent value="usage" className="space-y-4">
                {[
                  { name: 'Customer Support', queries: 156, satisfaction: 92 },
                  { name: 'Product Expert', queries: 124, satisfaction: 88 },
                  { name: 'Sales Assistant', queries: 98, satisfaction: 85 },
                ].map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-md">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{agent.name}</span>
                    </div>
                    <div className="text-sm">{agent.queries} queries</div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="satisfaction" className="space-y-4">
                {[
                  { name: 'Customer Support', queries: 156, satisfaction: 92 },
                  { name: 'Product Expert', queries: 124, satisfaction: 88 },
                  { name: 'Sales Assistant', queries: 98, satisfaction: 85 },
                ].map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-md">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{agent.name}</span>
                    </div>
                    <div className="text-sm">{agent.satisfaction}% satisfied</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
            
            <Separator className="my-4" />
            
            <div className="text-center">
              <Button variant="outline" size="sm" asChild>
                <Link to="/agents">Manage Agents</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <QuickActions />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
