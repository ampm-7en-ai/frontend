
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ModernButton from '@/components/dashboard/ModernButton';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Bot, 
  MessageSquare, 
  ChevronRight, 
  Zap, 
  TrendingUp,
  CreditCard,
  BarChart3,
  Heart
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
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import Magic from '@/components/icons/library/Magic';
import Bubbles from '@/components/icons/library/Bubbles';
import Users from '@/components/icons/library/Users';
import ColumnChart from '@/components/icons/library/ColumnChart';
import { Icon } from '@/components/icons';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Today');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [businessTeamTab, setBusinessTeamTab] = useState('Today');
  const [businessTeamMetric, setBusinessTeamMetric] = useState('all');

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
      icon: Users,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Active Agents',
      value: 187,
      icon: Magic,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: 'Total Conversations',
      value: 14392,
      icon: Bubbles,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Monthly Revenue',
      value: 47500,
      icon: ColumnChart,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  const timeTabs = [
    { id: 'Today', label: 'Today' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '1Y', label: '1Y' }
  ];

  const metricOptions = [
    { value: 'all', label: 'All Metrics' },
    { value: 'businesses', label: 'Businesses' },
    { value: 'users', label: 'Users' }
  ];

  const businessTeamOptions = [
    { value: 'all', label: 'All Members' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'new', label: 'New' }
  ];

  // Render chart based on selected metric for platform growth
  const renderPlatformGrowthChart = () => {
    if (selectedMetric === 'all') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis yAxisId="left" orientation="left" stroke="#0088FE" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis yAxisId="right" orientation="right" stroke="#00C49F" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
               contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))',
                fontSize: 12
              }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="users" 
              stroke="#f6b26b" 
              strokeWidth={2} 
              dot={false}
              name="Users"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="businesses" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2} 
              dot={false}
              name="Businesses"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))',
                fontSize: 12
              }}
            />
            <Area 
              type="monotone" 
              dataKey={selectedMetric}
              stroke="#3b82f6"
              fillOpacity={1} 
              fill="url(#metricGradient)"
              strokeWidth={2}
              dot={false}
              name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  };

  // Render chart for business team members based on selected metric
  const renderBusinessTeamChart = () => {
    if (businessTeamMetric === 'all') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={businessTeamMembersData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))',
                fontSize: '12px'
              }}
            />
            <Line
              type="monotone"
              dataKey="active"
              name="Active"
              stroke="#9fc5e8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="inactive"
              name="Inactive"
              stroke="#b4a7d6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="new"
              name="New"
              stroke="#93c47d"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={businessTeamMembersData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="teamGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={businessTeamMetric === 'active' ? '#9fc5e8' : businessTeamMetric === 'inactive' ? '#b4a7d6' : '#93c47d'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={businessTeamMetric === 'active' ? '#9fc5e8' : businessTeamMetric === 'inactive' ? '#b4a7d6' : '#93c47d'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-slate-600 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={businessTeamMetric}
              stroke={businessTeamMetric === 'active' ? '#9fc5e8' : businessTeamMetric === 'inactive' ? '#b4a7d6' : '#93c47d'}
              fillOpacity={1} 
              fill="url(#teamGradient)"
              strokeWidth={2}
              dot={false}
              name={businessTeamMetric.charAt(0).toUpperCase() + businessTeamMetric.slice(1)}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/50 dark:bg-[hsla(0,0%,0%,0.95)]">
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
                  <ModernButton variant="ghost" size="sm" asChild className="text-xs">
                    <Link to="/businesses" className="flex items-center">
                      View all <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </ModernButton>
                </div>
              )}
              {stat.title === 'Monthly Revenue' && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
                  <ModernButton variant="ghost" size="sm" asChild className="text-xs">
                    <Link to="/settings/platform/billing" className="flex items-center">
                      View billing <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </ModernButton>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Platform Growth - Full Width with Admin Style Controls */}
        <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl shadow-none overflow-hidden h-full pl-0">
          <CardHeader className="pb-4 pl-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 pl-4">
                Platform Growth
              </CardTitle>
              <div className="flex items-center gap-3">
                <ModernTabNavigation 
                  tabs={timeTabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  className="text-xs"
                />
                <ModernDropdown
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                  options={metricOptions}
                  placeholder="Select Metric"
                  className="w-32 h-8 text-xs rounded-xl border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pl-0 pb-0">
            <div className="h-80">
              {renderPlatformGrowthChart()}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts - Admin Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversation Volume - Admin Style with Bar Chart Icon */}
          <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl overflow-hidden h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="w-full text-lg font-semibold text-foreground flex items-center justify-between flex-row-reverse gap-2 pl-0">
                  <Icon type='plain' name='Bubbles' className='h-5 w-5 text-muted-foreground' color='hsl(var(--foreground))' />
                  Conversation Volume
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={conversationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="conversationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      className="text-slate-600 dark:text-slate-400"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      className="text-slate-600 dark:text-slate-400"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                     contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px'
                    }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conversations" 
                      stroke="#b4a7d6" 
                      fill="url(#conversationGradient)" 
                      fillOpacity={1} 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Revenue Trends - Admin Style with Heart Icon */}
          <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl overflow-hidden h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="w-full text-lg font-semibold text-foreground flex items-center justify-between flex-row-reverse gap-2 pl-0">
                  <Icon type='plain' name='Chart' className='h-5 w-5 text-muted-foreground' color='hsl(var(--foreground))' />
                  Revenue Trends
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      className="text-slate-600 dark:text-slate-400"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      className="text-slate-600 dark:text-slate-400"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px'
                    }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#93c47d"
                      strokeWidth={2}
                      dot={false}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Team Members Chart - Admin Style with Controls */}
        <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl shadow-none overflow-hidden h-full pl-0">
          <CardHeader className="pb-4 pl-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 pl-2">
                Business Team Member Status
              </CardTitle>
              <div className="flex items-center gap-3">
                <ModernTabNavigation 
                  tabs={timeTabs}
                  activeTab={businessTeamTab}
                  onTabChange={setBusinessTeamTab}
                  className="text-xs"
                />
                <ModernDropdown
                  value={businessTeamMetric}
                  onValueChange={setBusinessTeamMetric}
                  options={businessTeamOptions}
                  placeholder="Select Members"
                  className="w-32 h-8 text-xs rounded-xl border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pl-0 pb-0">
            <div className="h-80">
              {renderBusinessTeamChart()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
