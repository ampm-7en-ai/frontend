import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, ChevronRight, Book, Users, BarChart2, PieChart, TrendingUp, 
  Server, Database, Zap, Activity, Clock, Cpu, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
            <CardTitle>Business Performance Summary</CardTitle>
            <CardDescription>Technical indicators and system health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">API Requests</p>
                      <h3 className="text-2xl font-bold mt-1">1,243</h3>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        +8% vs last month
                      </p>
                    </div>
                    <div className="p-2 rounded-md bg-blue-100">
                      <Server className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Response Time</p>
                      <h3 className="text-2xl font-bold mt-1">248ms</h3>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        -12% vs last month
                      </p>
                    </div>
                    <div className="p-2 rounded-md bg-green-100">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Token Usage</p>
                      <h3 className="text-2xl font-bold mt-1">53.7K</h3>
                      <p className="text-xs text-amber-600 flex items-center mt-1">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        +21% vs last month
                      </p>
                    </div>
                    <div className="p-2 rounded-md bg-amber-100">
                      <Zap className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <h3 className="text-2xl font-bold mt-1">94.8%</h3>
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        -1.2% vs last month
                      </p>
                    </div>
                    <div className="p-2 rounded-md bg-red-100">
                      <Activity className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Channel Distribution</h3>
                <div className="space-y-3">
                  {channelStats.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{item.channel}</span>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">System Health Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Database Performance</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: '92%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Query response: 34ms avg</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Agent Availability</span>
                        <span className="text-sm font-medium">99.2%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: '99.2%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Uptime: 728 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">KB Access Speed</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full"
                          style={{ width: '87%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Response time: 180ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              Agent Usage
            </CardTitle>
            <CardDescription>Agent utilization by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="usage" className="h-[330px]">
              <TabsList className="mb-4">
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="channels">Channels</TabsTrigger>
              </TabsList>
              <TabsContent value="usage" className="h-[280px]">
                <AgentPerformanceChart type="agent" />
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
              Usage Trends
            </CardTitle>
            <CardDescription>Weekly agent interaction volume</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <AgentPerformanceChart type="trend" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="mr-2 h-5 w-5" />
              Agent Processing
            </CardTitle>
            <CardDescription>Request processing statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card className="shadow-none border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Success</div>
                  <div className="text-2xl font-bold mt-1 text-green-600">95%</div>
                </CardContent>
              </Card>
              <Card className="shadow-none border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Avg. Latency</div>
                  <div className="text-2xl font-bold mt-1">452ms</div>
                </CardContent>
              </Card>
              <Card className="shadow-none border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Cache Hit</div>
                  <div className="text-2xl font-bold mt-1 text-blue-600">68%</div>
                </CardContent>
              </Card>
            </div>
            <div className="h-[150px]">
              <AgentPerformanceChart type="agent" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
