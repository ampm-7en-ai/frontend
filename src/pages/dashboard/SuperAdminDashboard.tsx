
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building, 
  Users, 
  Bot, 
  MessageSquare, 
  ChevronRight, 
  Shield, 
  Zap, 
  Server, 
  Database,
  AlertCircle,
  CheckCircle,
  WifiHigh,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BusinessAdminStats } from '@/components/dashboard/BusinessAdminStats';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const SuperAdminDashboard = () => {
  // Sample data for charts (imported from PlatformAnalytics)
  const growthData = [
    { month: 'Jan', businesses: 95, users: 1800 },
    { month: 'Feb', businesses: 102, users: 2100 },
    { month: 'Mar', businesses: 108, users: 2300 },
    { month: 'Apr', businesses: 118, users: 2450 },
    { month: 'May', businesses: 125, users: 2600 },
    { month: 'Jun', businesses: 132, users: 2700 },
    { month: 'Jul', businesses: 142, users: 2843 }
  ];

  const conversationData = [
    { week: 'W1', conversations: 2800 },
    { week: 'W2', conversations: 3200 },
    { week: 'W3', conversations: 3500 },
    { week: 'W4', conversations: 3700 },
    { week: 'W5', conversations: 3400 },
    { week: 'W6', conversations: 3800 },
    { week: 'W7', conversations: 4100 },
    { week: 'W8', conversations: 4500 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 90000 },
    { month: 'Mar', revenue: 98000 },
    { month: 'Apr', revenue: 102000 },
    { month: 'May', revenue: 110000 },
    { month: 'Jun', revenue: 118000 },
    { month: 'Jul', revenue: 126580 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Platform Dashboard</h2>
          <p className="text-muted-foreground">Overview of your entire platform</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Building className="mr-2 h-4 w-4 text-primary" />
              Total Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">+3 from last month</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/businesses" className="flex items-center">
                  View all <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Bot className="mr-2 h-4 w-4 text-primary" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">187</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">+15 from last month</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/analytics" className="flex items-center">
                  View stats <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-primary" />
              Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14,392</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">+8% from last week</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/analytics" className="flex items-center">
                  View stats <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Zap className="mr-2 h-4 w-4 text-primary" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$47,500</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">+12% from last month</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/settings/platform/billing" className="flex items-center">
                  View billing <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Overview Charts from PlatformAnalytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>Business and user growth over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
                <YAxis yAxisId="right" orientation="right" stroke="#00C49F" />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="users" 
                  stroke="#00C49F" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                  name="Users"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="businesses" 
                  stroke="#0088FE" 
                  strokeWidth={2} 
                  name="Businesses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conversation Volume</CardTitle>
            <CardDescription>Total conversations by week</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Area 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly recurring revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#82ca9d" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform User Distribution & System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform User Distribution */}
        <BusinessAdminStats />
        
        {/* Redesigned System Status Card - More minimal and cleaner */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>System Status</CardTitle>
              <Badge variant="success" className="font-normal">Operational</Badge>
            </div>
            <CardDescription>Real-time platform health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              {[
                { name: 'API Services', status: 'healthy', value: 98 },
                { name: 'Database', status: 'healthy', value: 99 },
                { name: 'LLM Services', status: 'degraded', value: 72 },
                { name: 'Storage', status: 'healthy', value: 95 },
              ].map((service, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                    style={{
                      backgroundColor: service.status === 'healthy' ? '#22c55e' : '#f59e0b'
                    }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className="text-xs text-muted-foreground">{service.value}%</span>
                    </div>
                    <Progress value={service.value} className="h-1 mt-1" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-muted/40 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WifiHigh className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">System Uptime</span>
                </div>
                <Badge variant="outline" className="text-xs font-normal">99.98%</Badge>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link to="/system-health" className="flex items-center gap-1 text-xs">
                  <Shield className="h-3.5 w-3.5" />
                  View detailed status
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>System notifications from the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { 
              title: 'High Memory Usage',
              description: 'LLM Service worker process exceeded memory threshold',
              time: '12 minutes ago',
              severity: 'warning',
            },
            { 
              title: 'API Rate Limit',
              description: 'Business ID B1023 exceeded API rate limits',
              time: '43 minutes ago',
              severity: 'warning',
            },
            { 
              title: 'Database Backup Completed',
              description: 'Weekly backup completed successfully',
              time: '2 hours ago',
              severity: 'success',
            },
          ].map((alert, index) => (
            <div key={index} className="flex items-start gap-3 p-2 border-b last:border-b-0 border-border">
              {alert.severity === 'warning' ? (
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-medium text-sm">{alert.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-1" asChild>
              <Link to="/system-health">
                View all alerts <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
