
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle, Star, Heart, Users, TrendingUp } from 'lucide-react';
import { AgentPerformanceChart } from './AgentPerformanceChart';
import ModernTabNavigation from './ModernTabNavigation';
import ModernButton from './ModernButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const StatisticsCharts = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'satisfaction', label: 'Satisfaction' }
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

      {/* Conversion Statistics */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                Conversion Statistics
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Customer engagement and conversion metrics
              </CardDescription>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <AgentPerformanceChart type="conversion" />
        </CardContent>
      </Card>
      
      {/* Customer Satisfaction - Full Width */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                Customer Satisfaction Analytics
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Comprehensive satisfaction metrics and trends over time
              </CardDescription>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Satisfaction Score */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Overall Satisfaction</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">92%</div>
                <div className="flex items-center justify-center text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% vs last month
                </div>
              </CardContent>
            </Card>

            {/* CSAT Score */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">CSAT Score</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">4.7/5</div>
                <div className="flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3 vs last month
                </div>
              </CardContent>
            </Card>

            {/* NPS Score */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">NPS Score</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">+68</div>
                <div className="flex items-center justify-center text-xs text-purple-600 dark:text-purple-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12 vs last month
                </div>
              </CardContent>
            </Card>

            {/* Response Rate */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-0 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Response Rate</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">84%</div>
                <div className="flex items-center justify-center text-xs text-orange-600 dark:text-orange-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +7% vs last month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Satisfaction Trends Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={satisfactionTrendData}>
                <defs>
                  <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="npsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
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
                  fill="url(#satisfactionGradient)"
                  strokeWidth={3}
                  name="Satisfaction %"
                />
                <Line 
                  type="monotone" 
                  dataKey="nps" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="NPS Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCharts;
