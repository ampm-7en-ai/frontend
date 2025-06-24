
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle, Star, Heart, Users, TrendingUp, Bot } from 'lucide-react';
import { AgentPerformanceChart } from './AgentPerformanceChart';
import ModernTabNavigation from './ModernTabNavigation';
import ModernButton from './ModernButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from 'lucide-react';

const StatisticsCharts = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [conversationActiveTab, setConversationActiveTab] = useState('Today');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'satisfaction', label: 'Satisfaction' }
  ];

  const conversationTabs = [
    { id: 'Today', label: 'Today' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '1Y', label: '1Y' }
  ];

  // Sample satisfaction trend data
  const satisfactionTrendData = [
    { name: 'Jan', satisfaction: 85, nps: 42, csat: 4.2 },
    { name: 'Feb', satisfaction: 88, nps: 48, csat: 4.4 },
    { name: 'Mar', satisfaction: 92, nps: 52, csat: 4.6 },
    { name: 'Apr', satisfaction: 89, nps: 45, csat: 4.5 },
    { name: 'May', satisfaction: 94, nps: 58, csat: 4.7 },
    { name: 'Jun', satisfaction: 91, nps: 55, csat: 4.6 },
  ];

  // Sample conversation statistics data
  const conversationData = [
    { name: 'Mon', queries: 65, conversions: 32 },
    { name: 'Tue', queries: 78, conversions: 45 },
    { name: 'Wed', queries: 82, conversions: 53 },
    { name: 'Thu', queries: 70, conversions: 40 },
    { name: 'Fri', queries: 90, conversions: 58 },
    { name: 'Sat', queries: 50, conversions: 28 },
    { name: 'Sun', queries: 40, conversions: 22 },
  ];

  // Sample agent performance data for compact chart
  const agentPerformanceData = [
    { name: 'Customer Service', conversations: 145, satisfaction: 92 },
    { name: 'Sales Agent', conversations: 98, satisfaction: 88 },
    { name: 'Tech Support', conversations: 76, satisfaction: 94 },
    { name: 'HR Assistant', conversations: 45, satisfaction: 85 },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <ModernTabNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="flex gap-2">
          <ModernButton variant="outline" size="sm">
            Export
          </ModernButton>
          <ModernButton variant="primary" size="sm">
            Refresh
          </ModernButton>
        </div>
      </div>

      {/* Conversation Statistics - Full Width */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                Conversation Statistics
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Customer engagement and conversion metrics
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <ModernTabNavigation 
                tabs={conversationTabs}
                activeTab={conversationActiveTab}
                onTabChange={setConversationActiveTab}
                className="text-xs"
              />
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="w-32 h-8 text-xs rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="messenger">Messenger</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                </SelectContent>
              </Select>
              <ModernButton variant="outline" size="sm" icon={Download}>
                Export
              </ModernButton>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={conversationData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="name" 
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
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
                  border: 'none',
                  padding: '10px'
                }}
              />
              <Bar dataKey="queries" name="Total Queries" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" name="Successful Conversions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  Agent Performance
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Conversations handled by each agent
                </CardDescription>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-slate-600 dark:text-slate-400"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-slate-600 dark:text-slate-400"
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar 
                  dataKey="conversations" 
                  fill="#3b82f6" 
                  radius={[0, 6, 6, 0]}
                  name="Conversations"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Customer Satisfaction - Compact */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  Customer Satisfaction
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Satisfaction metrics and trends
                </CardDescription>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Overall Satisfaction */}
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Overall</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">92%</div>
                <div className="flex items-center justify-center text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5%
                </div>
              </div>

              {/* CSAT Score */}
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">CSAT</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">4.7</div>
                <div className="flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3
                </div>
              </div>

              {/* NPS Score */}
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">NPS</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">+68</div>
                <div className="flex items-center justify-center text-xs text-purple-600 dark:text-purple-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12
                </div>
              </div>
            </div>

            {/* Mini Satisfaction Trends Chart */}
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={satisfactionTrendData}>
                  <defs>
                    <linearGradient id="satisfactionGradientMini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                    className="text-slate-600 dark:text-slate-400"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="satisfaction" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#satisfactionGradientMini)"
                    strokeWidth={2}
                    name="Satisfaction %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsCharts;
