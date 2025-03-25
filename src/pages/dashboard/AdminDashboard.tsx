
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, ChevronRight, Book, Users, BarChart2, PieChart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { RecentConversationsTable } from '@/components/dashboard/RecentConversationsTable';
import { AgentPerformanceChart } from '@/components/dashboard/AgentPerformanceChart';

// Sample data for channel statistics
const channelStats = [
  { channel: 'WhatsApp', count: 64, percentage: 50 },
  { channel: 'Slack', count: 32, percentage: 25 },
  { channel: 'Instagram', count: 21, percentage: 16 },
  { channel: 'Freshdesk', count: 11, percentage: 9 },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Bot className="mr-2 h-4 w-4 text-primary" />
              My Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">All active agents</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/agents" className="flex items-center">
                  View all <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-primary" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">128</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Last 30 days</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/conversations" className="flex items-center">
                  View all <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Book className="mr-2 h-4 w-4 text-primary" />
              Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Documents</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/knowledge" className="flex items-center">
                  Manage <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Domain experts</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/settings/business/team" className="flex items-center">
                  Manage <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Customer interactions in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentConversationsTable className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>Agent usage metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="usage" className="h-[330px]">
              <TabsList className="mb-4">
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
                <TabsTrigger value="channels">Channels</TabsTrigger>
              </TabsList>
              <TabsContent value="usage" className="h-[280px]">
                <AgentPerformanceChart type="agent" />
              </TabsContent>
              <TabsContent value="satisfaction" className="h-[280px]">
                <AgentPerformanceChart type="satisfaction" />
              </TabsContent>
              <TabsContent value="channels" className="h-[280px]">
                <AgentPerformanceChart type="channel" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Conversation Trends
            </CardTitle>
            <CardDescription>Weekly conversation volume</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <AgentPerformanceChart type="trend" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Resolution Rate
            </CardTitle>
            <CardDescription>Conversation resolution statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card className="shadow-none border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Resolved</div>
                  <div className="text-2xl font-bold mt-1 text-green-600">78%</div>
                </CardContent>
              </Card>
              <Card className="shadow-none border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Avg. Time</div>
                  <div className="text-2xl font-bold mt-1">8.4m</div>
                </CardContent>
              </Card>
              <Card className="shadow-none border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Handoffs</div>
                  <div className="text-2xl font-bold mt-1 text-amber-600">22%</div>
                </CardContent>
              </Card>
            </div>
            <div className="h-[150px]">
              <AgentPerformanceChart type="satisfaction" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
