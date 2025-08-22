import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  Bot, 
  MessageSquare, 
  ChevronRight, 
  Zap, 
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { ModernStatCard } from '@/components/ui/modern-stat-card';
import { PlatformInsightsCard } from '@/components/dashboard/PlatformInsightsCard';

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

  // New data for business team members chart
  const businessTeamMembersData = [
    { month: 'Jan', active: 52, inactive: 8, new: 5 },
    { month: 'Feb', active: 58, inactive: 7, new: 6 },
    { month: 'Mar', active: 62, inactive: 9, new: 4 },
    { month: 'Apr', active: 67, inactive: 6, new: 8 },
    { month: 'May', active: 72, inactive: 8, new: 5 },
    { month: 'Jun', active: 75, inactive: 10, new: 7 },
    { month: 'Jul', active: 78, inactive: 9, new: 9 },
    { month: 'Aug', active: 83, inactive: 7, new: 6 }
  ];

  const platformStats = [
    {
      title: 'Total Businesses',
      value: 24,
      icon: Building,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Active Agents',
      value: 187,
      icon: Bot,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: 'Total Conversations',
      value: 14392,
      icon: MessageSquare,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Monthly Revenue',
      value: 47500,
      icon: CreditCard,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Platform Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of your entire platform
            </p>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformStats.map((stat, index) => (
            <div key={index} className="relative group">
              <ModernStatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                gradient={stat.gradient}
              />
              {/* Quick action overlays */}
              {stat.title === 'Total Businesses' && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-3xl flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
                  <Button variant="ghost" size="sm" asChild className="text-xs">
                    <Link to="/businesses" className="flex items-center">
                      View all <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
              {stat.title === 'Monthly Revenue' && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-3xl flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
                  <Button variant="ghost" size="sm" asChild className="text-xs">
                    <Link to="/settings/platform/billing" className="flex items-center">
                      View billing <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Platform Insights Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Platform Growth
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Business and user growth over time
                </CardDescription>
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
          </div>
          
          <div className="space-y-6">
            <PlatformInsightsCard />
            
            {/* Quick Stats */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    +12%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    1,247
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    124ms
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Conversation Volume
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Total conversations by week
              </CardDescription>
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
          
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Revenue Trends
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Monthly recurring revenue
              </CardDescription>
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

        {/* Business Team Members Chart - Full Width */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Business Team Member Status
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Active, inactive and new team members across businesses
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={businessTeamMembersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} members`, 
                    typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : name
                  ]}
                  contentStyle={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="active"
                  name="Active"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="inactive"
                  name="Inactive"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="new"
                  name="New"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
