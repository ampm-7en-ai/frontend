import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, ChevronRight, Book, Users, BarChart2, PieChart, TrendingUp, 
  Clock, Database, Zap, Activity, Cpu, ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AgentPerformanceChart } from '@/components/dashboard/AgentPerformanceChart';
import UsageStatsCard from '@/components/dashboard/UsageStatsCard';

// Sample data for channel statistics
const channelStats = [
  { channel: 'WhatsApp', count: 64, percentage: 50 },
  { channel: 'Slack', count: 32, percentage: 25 },
  { channel: 'Instagram', count: 21, percentage: 16 },
  { channel: 'Freshdesk', count: 11, percentage: 9 },
];

// Sample data for agent performance comparison
const agentPerformanceData = [
  { 
    agent: 'Customer Support Agent', 
    conversations: 1203, 
    responseTime: '1.2s',
    satisfaction: 92
  },
  { 
    agent: 'Sales Assistant', 
    conversations: 845, 
    responseTime: '1.5s',
    satisfaction: 88
  },
  { 
    agent: 'Technical Support', 
    conversations: 532, 
    responseTime: '2.1s',
    satisfaction: 85
  },
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
            <CardTitle>Agent Performance Summary</CardTitle>
            <CardDescription>Agent performance metrics and conversation statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                      <h3 className="text-2xl font-bold mt-1">1.5s</h3>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        -0.3s from last month
                      </p>
                    </div>
                    <div className="p-2 rounded-md bg-blue-100">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Conversations</p>
                      <h3 className="text-2xl font-bold mt-1">2,580</h3>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="p-2 rounded-md bg-green-100">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">User Satisfaction</p>
                      <h3 className="text-2xl font-bold mt-1">88%</h3>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        +3% from last month
                      </p>
                    </div>
                    <div className="p-2 rounded-md bg-amber-100">
                      <Activity className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Agent Performance Comparison</h3>
              <p className="text-xs text-muted-foreground">Compare metrics across your AI agents.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Agent</th>
                      <th className="pb-2 font-medium">Conversations</th>
                      <th className="pb-2 font-medium">Avg. Response Time</th>
                      <th className="pb-2 font-medium">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentPerformanceData.map((agent, index) => (
                      <tr key={index} className="border-b border-gray-100 text-sm">
                        <td className="py-3 font-medium">{agent.agent}</td>
                        <td className="py-3">{agent.conversations}</td>
                        <td className="py-3">{agent.responseTime}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span>{agent.satisfaction}%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full" 
                                style={{ width: `${agent.satisfaction}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <UsageStatsCard />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Conversion Statistics
            </CardTitle>
            <CardDescription>Customer engagement and conversion metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <AgentPerformanceChart type="conversion" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="mr-2 h-5 w-5" />
              Customer Satisfaction
            </CardTitle>
            <CardDescription>Feedback and satisfaction levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card className="shadow-none border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">CSAT Score</div>
                  <div className="text-2xl font-bold mt-1 text-green-600">4.7/5</div>
                </CardContent>
              </Card>
              <Card className="shadow-none border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">NPS</div>
                  <div className="text-2xl font-bold mt-1">+68</div>
                </CardContent>
              </Card>
              <Card className="shadow-none border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Satisfied</div>
                  <div className="text-2xl font-bold mt-1 text-blue-600">92%</div>
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
